import {
  axiosWrapper,
  DenomsRecord,
  DenomWithGasPriceStep,
  isAptosChain,
  NativeDenom,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import BigNumber from 'bignumber.js';
import { useEffect, useMemo, useState } from 'react';

import {
  fetchIbcTrace,
  IbcDenomData,
  useChainApis,
  useChainsStore,
  useDappDefaultFee,
  useIbcTraceStore,
} from '../store';
import { Token } from '../types';
import {
  GasPriceStep,
  getKeyToUseForDenoms,
  useAdditionalFeeDenoms,
  useGasPriceStepForChain,
  useNativeFeeDenom,
} from '../utils';
import { useGetAptosGasPrices, useGetEvmGasPrices } from '../utils-hooks';

export type FeeTokenData = {
  denom: NativeDenom;
  ibcDenom?: string;
  gasPriceStep: GasPriceStep;
};

type getFeeTokenFnArgs = {
  baseGasPriceStep: GasPriceStep;
  denoms: DenomsRecord;
  nativeDenom: NativeDenom;
};

export const getOsmosisFeeTokens = async ({
  baseGasPriceStep,
  denoms,
  restUrl,
  allAssets,
  nativeDenom,
}: getFeeTokenFnArgs & {
  restUrl: string;
  allAssets: Token[];
}): Promise<FeeTokenData[]> => {
  const nativeFeeTokenIbcDenom = nativeDenom?.coinMinimalDenom.toLowerCase().startsWith('ibc/')
    ? nativeDenom.coinMinimalDenom
    : undefined;

  const nativeFeeToken = {
    denom: nativeDenom,
    ibcDenom: nativeFeeTokenIbcDenom,
    gasPriceStep: baseGasPriceStep,
  };

  try {
    const feeTokens = await axiosWrapper({
      baseURL: restUrl,
      method: 'get',
      url: '/osmosis/txfees/v1beta1/fee_tokens',
    });

    const feeTokensData = allAssets.filter((token) => {
      return (feeTokens.data.fee_tokens as { denom: string; poolID: string }[])?.find((feeToken) => {
        // is token ibc?
        if (token.ibcDenom) {
          return feeToken.denom === token.ibcDenom;
        }
        return feeToken.denom === token.coinMinimalDenom;
      });
    });

    const feeTokensWithDenom = feeTokensData.reduce(
      (acc: { ibcDenom: string | undefined; denom: NativeDenom }[], curr: Token) => {
        const key = getKeyToUseForDenoms(curr.coinMinimalDenom, curr.chain ?? '');
        const feeToken = {
          ibcDenom: curr.ibcDenom,
          denom: denoms[key],
        };

        return [...acc, feeToken];
      },
      [],
    );

    return [nativeFeeToken, ...feeTokensWithDenom].filter((token) => !!token.denom) as FeeTokenData[];
  } catch (e) {
    return [nativeFeeToken];
  }
};

export async function getGasPricesForOsmosisFee(lcdUrl: string, denom: string, baseGasPriceStep: GasPriceStep) {
  const priceInfo = await axiosWrapper({
    baseURL: lcdUrl,
    method: 'get',
    url: `/osmosis/txfees/v1beta1/spot_price_by_denom?denom=${encodeURIComponent(denom)}`,
  });

  const priceRatio = new BigNumber(1).dividedBy(priceInfo.data.spot_price);

  return {
    low: priceRatio.multipliedBy(baseGasPriceStep.low).multipliedBy(1.05).toNumber(),
    medium: priceRatio.multipliedBy(baseGasPriceStep.medium).multipliedBy(1.05).toNumber(),
    high: priceRatio.multipliedBy(baseGasPriceStep.high).multipliedBy(1.05).toNumber(),
  };
}

type RemoteFeeTokenData = {
  denom: string;
  ibcDenom: string;
  gasPriceStep: GasPriceStep;
};

/**
 * FeeTokenData s3 storage format
 *
 * {
 *   denom: string // key of the denom data in denoms object
 *   ibcDenom: string // hardcoded into the db
 *   gasPriceStep: { low: number, medium: number, high: number } // hardcoded into the db
 * }
 *
 */

type getChainFeeTokensFnArgs = getFeeTokenFnArgs & {
  chain: string;
};

export const getChainFeeTokens = async ({
  baseGasPriceStep,
  chain,
  nativeDenom,
  denoms,
}: getChainFeeTokensFnArgs): Promise<FeeTokenData[]> => {
  const nativeFeeTokenIbcDenom = nativeDenom?.coinMinimalDenom.toLowerCase().startsWith('ibc/')
    ? nativeDenom.coinMinimalDenom
    : undefined;

  const nativeFeeToken = {
    denom: nativeDenom,
    ibcDenom: nativeFeeTokenIbcDenom,
    gasPriceStep: baseGasPriceStep,
  };

  try {
    const { data: fee_token_chains } = await axios.get(
      `https://assets.leapwallet.io/cosmos-registry/v1/fee-tokens/fee-token-chains.json`,
    );
    if (!fee_token_chains?.chains.includes(chain)) return [nativeFeeToken];
    const { data } = await axios.get<RemoteFeeTokenData[]>(
      `https://assets.leapwallet.io/cosmos-registry/v1/fee-tokens/${chain}.json`,
    );

    return [
      nativeFeeToken,
      ...data
        .map((a) => ({
          denom: denoms[a.denom as keyof typeof denoms],
          ibcDenom: a.ibcDenom,
          gasPriceStep: a.gasPriceStep,
        }))
        .filter((a) => !!a.denom),
    ];
  } catch (e) {
    return [nativeFeeToken];
  }
};

export const getFeeTokens = async ({
  chain,
  nativeDenom,
  baseGasPriceStep,
  additionalFeeDenoms,
  denoms,
  restUrl,
  allAssets,
  dappSuggestedToken,
}: {
  chain: SupportedChain;
  nativeDenom: NativeDenom;
  baseGasPriceStep: GasPriceStep;
  additionalFeeDenoms: DenomWithGasPriceStep[];
  denoms: DenomsRecord;
  restUrl: string;
  allAssets: Token[];
  dappSuggestedToken: { denom: NativeDenom; ibcDenom?: string } | undefined;
}): Promise<FeeTokenData[]> => {
  let feeTokens: FeeTokenData[];

  switch (chain) {
    case 'osmosis':
      feeTokens = await getOsmosisFeeTokens({
        baseGasPriceStep,
        denoms,
        restUrl,
        allAssets,
        nativeDenom,
      });
      break;
    default:
      feeTokens = await getChainFeeTokens({
        denoms,
        baseGasPriceStep,
        chain,
        nativeDenom,
      });
  }

  // Append fee denoms which are present in chain-infos but not in the fee-tokens
  additionalFeeDenoms.forEach((denom) => {
    if (
      feeTokens.find((a) =>
        a.ibcDenom ? a.ibcDenom === denom.coinMinimalDenom : a.denom.coinMinimalDenom === denom.coinMinimalDenom,
      )
    ) {
      return;
    }

    const ibcDenom = denom?.coinMinimalDenom.toLowerCase().startsWith('ibc/') ? denom.coinMinimalDenom : undefined;
    let gasPriceStep = baseGasPriceStep;
    if (denom.gasPriceStep) {
      gasPriceStep = {
        low: denom.gasPriceStep.low,
        medium: denom.gasPriceStep.average,
        high: denom.gasPriceStep.high,
      };
    }
    feeTokens.push({
      denom: denoms[denom?.coinMinimalDenom] ?? denom,
      ibcDenom,
      gasPriceStep,
    });
  });

  if (dappSuggestedToken) {
    const dappSuggestedTokenAlreadyExists = feeTokens?.find((a) => {
      if (a.ibcDenom || dappSuggestedToken.ibcDenom) {
        return a.ibcDenom === dappSuggestedToken.ibcDenom;
      }
      return a.denom.coinMinimalDenom === dappSuggestedToken.denom.coinMinimalDenom;
    });
    if (!dappSuggestedTokenAlreadyExists) {
      feeTokens.push({
        ...dappSuggestedToken,
        gasPriceStep: baseGasPriceStep,
      });
    }
  }

  return feeTokens;
};

export const useFeeTokens = (
  allAssets: Token[],
  denoms: DenomsRecord,
  chain: SupportedChain,
  forceNetwork?: 'mainnet' | 'testnet',
  isSeiEvmTransaction?: boolean,
) => {
  // fetched from s3

  const { lcdUrl } = useChainApis(chain, forceNetwork);
  const { defaultFee } = useDappDefaultFee();
  const { ibcTraceData, addIbcTraceData } = useIbcTraceStore();
  const { chains } = useChainsStore();
  const [dappSuggestedToken, setDappSuggestedToken] = useState<{ denom: NativeDenom; ibcDenom?: string } | undefined>(
    undefined,
  );

  useEffect(() => {
    async function updateDappSuggestedFeeToken(denom?: string | undefined) {
      if (!denom) {
        return;
      }

      if (!denom.startsWith('ibc/')) {
        if (denoms?.[denom]) {
          setDappSuggestedToken({ denom: denoms?.[denom], ibcDenom: undefined });
        } else {
          setDappSuggestedToken({
            denom: {
              coinMinimalDenom: denom,
              coinDecimals: 0,
              coinDenom: denom,
              coinGeckoId: '',
              icon: '',
              name: denom,
              chain: chain,
            },
            ibcDenom: undefined,
          });
        }
        return;
      }

      try {
        let trace = ibcTraceData[denom];
        const ibcTraceDataToAdd: Record<string, IbcDenomData> = {};
        if (!trace) {
          trace = await fetchIbcTrace(denom, lcdUrl ?? '', chains[chain].chainId);
          if (trace) {
            ibcTraceDataToAdd[denom] = trace;
          }
        }
        const baseDenom = trace.baseDenom;

        const _baseDenom = getKeyToUseForDenoms(baseDenom, trace?.originChainId);
        const denomInfo = denoms[_baseDenom];
        Object.keys(ibcTraceDataToAdd).length && addIbcTraceData(ibcTraceDataToAdd);
        if (denomInfo) {
          setDappSuggestedToken({ denom: denomInfo, ibcDenom: denom });
        } else {
          throw new Error('Denom trace not found');
        }
      } catch (e) {
        setDappSuggestedToken({
          denom: {
            coinMinimalDenom: denom,
            coinDecimals: 0,
            coinDenom: denom,
            coinGeckoId: '',
            icon: '',
            name: denom,
            chain: chain,
          },
          ibcDenom: denom,
        });
      }
      return;
    }
    updateDappSuggestedFeeToken(defaultFee?.amount?.[0]?.denom);
  }, [chains, chain, denoms, ibcTraceData, lcdUrl, defaultFee]);

  // hardcoded
  const baseDenom = useNativeFeeDenom(denoms, chain, forceNetwork);
  const additionalFeeDenoms = useAdditionalFeeDenoms(chain);
  const { gasPrice: evmGasPrice } = useGetEvmGasPrices(chain, forceNetwork);
  const { gasPrice: aptosGasPrice } = useGetAptosGasPrices(chain, forceNetwork);
  const _gasPriceStep = useGasPriceStepForChain(chain, forceNetwork);
  const gasPriceStep = useMemo(() => {
    if (isSeiEvmTransaction || chains[chain]?.evmOnlyChain) {
      return evmGasPrice;
    }

    if (isAptosChain(chain)) {
      return aptosGasPrice;
    }

    return _gasPriceStep;
  }, [isSeiEvmTransaction, _gasPriceStep, evmGasPrice, aptosGasPrice, chains, chain]);

  return useQuery<FeeTokenData[]>({
    queryKey: [
      'fee-tokens',
      chain,
      gasPriceStep,
      baseDenom,
      allAssets,
      lcdUrl,
      denoms,
      additionalFeeDenoms,
      dappSuggestedToken,
    ],
    queryFn: () =>
      getFeeTokens({
        chain,
        nativeDenom: baseDenom,
        baseGasPriceStep: gasPriceStep,
        additionalFeeDenoms,
        denoms,
        restUrl: lcdUrl ?? '',
        allAssets,
        dappSuggestedToken,
      }),
    initialData: [
      {
        denom: baseDenom,
        ibcDenom: baseDenom?.coinMinimalDenom?.startsWith('ibc/') ? baseDenom.coinMinimalDenom : undefined,
        gasPriceStep,
      },
    ],
    enabled: !!gasPriceStep && !!baseDenom && Object.keys(denoms).length > 0,
  });
};
