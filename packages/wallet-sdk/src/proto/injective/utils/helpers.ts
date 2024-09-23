import BigNumber from 'bignumber.js';

import { CosmosBaseV1Beta1Coin } from '../core-proto-ts';
import { Coin } from '../types';
import BigNumberInBase from './classes/BigNumber/BigNumberInBase';
import BigNumberInWei from './classes/BigNumber/BigNumberInWei';
import { DEFAULT_GAS_LIMIT, DEFAULT_GAS_PRICE, DEFAULT_STD_FEE } from './constants';

export type Awaited<T> = T extends null | undefined
  ? T // special case for `null | undefined` when not in `--strictNullChecks` mode
  : T extends object & { then(onfulfilled: infer F, ...args: infer _): any } // `await` only unwraps object types with a callable `then`. Non-object types are not unwrapped
  ? F extends (value: infer V, ...args: infer _) => any // if the argument to `then` is callable, extracts the first argument
    ? Awaited<V> // recursively unwrap the value
    : never // the argument to `then` was not callable
  : T; // non-object or non-thenable

export const isServerSide = () => typeof window === 'undefined';

export const isReactNative = () => {
  return typeof document === 'undefined' && typeof navigator !== 'undefined' && navigator.product === 'ReactNative';
};

export const isNode = () => {
  if (typeof window === 'undefined') {
    return true;
  }

  return (
    typeof process !== 'undefined' &&
    typeof process.versions !== 'undefined' &&
    typeof process.versions.node !== 'undefined'
  );
};

export const isBrowser = () => {
  if (isReactNative()) {
    return false;
  }

  if (isNode()) {
    return false;
  }

  return typeof window !== 'undefined';
};

export const objectToJson = (
  object: Record<string, any>,
  params?:
    | {
        replacer?: any;
        indentation?: number;
      }
    | undefined,
): string => {
  const { replacer, indentation } = params || { replacer: null, indentation: 2 };

  return JSON.stringify(object, replacer, indentation);
};

export const protoObjectToJson = (
  object: any,
  params?:
    | {
        replacer?: any;
        indentation?: number;
      }
    | undefined,
): string => {
  const { replacer, indentation } = params || { replacer: null, indentation: 2 };

  if (object.toObject !== undefined) {
    return JSON.stringify(object.toObject(), replacer, indentation);
  }

  return objectToJson(object, { replacer, indentation });
};

export const grpcCoinToUiCoin = (coin: CosmosBaseV1Beta1Coin.Coin): Coin => ({
  amount: coin.amount,
  denom: coin.denom,
});

export const uint8ArrayToString = (string: string | Uint8Array | null | undefined): string => {
  if (!string) {
    return '';
  }

  if (string.constructor !== Uint8Array) {
    return string as string;
  }

  return new TextDecoder().decode(string);
};

export const toPascalCase = (str: string): string => {
  return `${str}`
    .toLowerCase()
    .replace(new RegExp(/[-_]+/, 'g'), ' ')
    .replace(new RegExp(/[^\w\s]/, 'g'), '')
    .replace(new RegExp(/\s+(.)(\w*)/, 'g'), (_$1, $2, $3) => `${$2.toUpperCase() + $3}`)
    .replace(new RegExp(/\w/), (s) => s.toUpperCase());
};

export const snakeToPascal = (str: string): string => {
  return str
    .split('/')
    .map((snake) =>
      snake
        .split('_')
        .map((substr) => substr.charAt(0).toUpperCase() + substr.slice(1))
        .join(''),
    )
    .join('/');
};

export const sortObjectByKeysWithReduce = <T>(obj: T): T => {
  if (typeof obj !== 'object' || obj === null) return obj;

  if (Array.isArray(obj)) {
    return obj.map((e) => sortObjectByKeysWithReduce(e)).sort() as T;
  }

  return Object.keys(obj)
    .sort()
    .reduce((sorted, k) => {
      const key = k as keyof typeof obj;
      sorted[key] = sortObjectByKeysWithReduce(obj[key]);
      return sorted;
    }, {} as T);
};

export const sortObjectByKeys = <T>(obj: T): T => {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sortObjectByKeys) as T;
  }

  const sortedKeys = Object.keys(obj).sort() as Array<keyof typeof obj>;
  const result = {} as Record<keyof typeof obj, any>;

  sortedKeys.forEach((key) => {
    result[key] = sortObjectByKeys(obj[key]);
  });

  return result as T;
};

export const getErrorMessage = (error: any, endpoint: string): string => {
  if (!error.response) {
    return `The request to ${endpoint} has failed.`;
  }

  return error.response.data ? error.response.data.message || error.response.data : error.response.statusText;
};

export const sleep = (timeout: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, timeout));

/**
 * When we want to execute the promises in batch
 */
export const awaitAll = async <T, S>(array: Array<T>, callback: (item: T) => Promise<S>): Promise<Awaited<S>[]> =>
  await Promise.all(array.map(async (item: T) => await callback(item)));

/**
 * When we want to execute the promises one by one
 * and not all in batch as with await Promise.all()
 */
export const awaitForAll = async <T, S>(array: Array<T>, callback: (item: T) => Promise<S>): Promise<S[]> => {
  const result = [] as S[];

  for (let i = 0; i < array.length; i += 1) {
    try {
      result.push(await callback(array[i]));
    } catch (e: any) {
      //
    }
  }

  return result;
};

export const splitArrayToChunks = <T>({
  array,
  chunkSize,
  filter,
}: {
  array: Array<T>;
  chunkSize: number;
  filter?: (item: T) => boolean;
}) => {
  const chunks = [];

  for (let i = 0; i < array.length; i += chunkSize) {
    const chunk = array.slice(i, i + chunkSize);

    if (filter) {
      chunks.push(chunk.filter(filter));
    } else {
      chunks.push(chunk);
    }
  }

  return chunks;
};

export const getStdFeeForToken = (
  token: {
    denom: string;
    decimals: number;
  } = { denom: 'inj', decimals: 18 },
  gasPrice?: string,
  gasLimit?: string,
) => {
  const gasPriceInBase = gasPrice || new BigNumberInWei(DEFAULT_GAS_PRICE).toBase();
  const gasPriceScaled = new BigNumberInBase(gasPriceInBase).toWei(token.decimals).toFixed(0);
  const gasNormalized = new BigNumber(gasLimit || DEFAULT_GAS_LIMIT).toFixed(0);

  return {
    amount: [
      {
        denom: token.denom,
        amount: new BigNumberInBase(gasPriceScaled).times(gasNormalized).toFixed(),
      },
    ],
    gas: gasNormalized,
  };
};

export const getStdFeeFromObject = (args?: {
  gas?: string | number;
  payer?: string;
  granter?: string;
  gasPrice?: string | number;
  feePayer?: string;
}) => {
  if (!args) {
    return DEFAULT_STD_FEE;
  }

  const { gas = DEFAULT_GAS_LIMIT.toString(), gasPrice = DEFAULT_GAS_PRICE, payer, granter, feePayer } = args;
  const gasNormalized = new BigNumber(gas).toFixed(0);
  const gasPriceNormalized = new BigNumber(gasPrice).toFixed(0);

  return {
    amount: [
      {
        denom: 'inj',
        amount: new BigNumber(gasNormalized).times(gasPriceNormalized).toFixed(),
      },
    ],
    gas: new BigNumber(gasNormalized).toFixed(),
    payer /** for Web3Gateway fee delegation */,
    granter,
    feePayer,
  };
};

export const getDefaultStdFee = () => DEFAULT_STD_FEE;

export const getStdFeeFromString = (gasPrice: string) => {
  const matchResult = gasPrice.match(/^([0-9.]+)([a-zA-Z][a-zA-Z0-9/:._-]*)$/);

  if (!matchResult) {
    throw new Error('Invalid gas price string');
  }

  const [_, amount] = matchResult;
  const gas = new BigNumberInBase(amount).toWei().dividedBy(DEFAULT_GAS_PRICE).toFixed(0);

  return getStdFeeFromObject({ gas, gasPrice: DEFAULT_GAS_PRICE });
};

export const getStdFee = (
  args?:
    | string
    | {
        gas?: string | number;
        payer?: string;
        granter?: string;
        gasPrice?: string | number;
        feePayer?: string;
      },
) => {
  if (!args) {
    return DEFAULT_STD_FEE;
  }

  if (typeof args === 'string') {
    return getStdFeeFromString(args);
  }

  return getStdFeeFromObject({ ...args });
};
