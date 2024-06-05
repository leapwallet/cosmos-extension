import { axiosWrapper, DenomsRecord, NativeDenom, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import BigNumber from 'bignumber.js';
import { useMemo } from 'react';

import { useGetTokenSpendableBalances } from '../bank';
import { useChainApis, useCompassSeiEvmConfigStore, useDenoms } from '../store';
import { Token } from '../types';
import { GasPriceStep, getKeyToUseForDenoms, useGasPriceStepForChain, useNativeFeeDenom } from '../utils';

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

    const feeTokensWithDenom = feeTokensData.reduce((acc: { ibcDenom: string; denom: NativeDenom }[], curr: Token) => {
      const key = getKeyToUseForDenoms(curr.coinMinimalDenom, curr.chain ?? '');
      const feeToken = {
        ibcDenom: curr.ibcDenom ? curr.ibcDenom : curr.coinMinimalDenom,
        denom: denoms[key],
      };

      return [...acc, feeToken];
    }, []);

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

export const getFeeTokens = ({
  chain,
  nativeDenom,
  baseGasPriceStep,
  denoms,
  restUrl,
  allAssets,
}: {
  chain: SupportedChain;
  nativeDenom: NativeDenom;
  baseGasPriceStep: GasPriceStep;
  denoms: DenomsRecord;
  restUrl: string;
  allAssets: Token[];
}): Promise<FeeTokenData[]> => {
  switch (chain) {
    case 'osmosis':
      return getOsmosisFeeTokens({
        baseGasPriceStep,
        denoms,
        restUrl,
        allAssets,
        nativeDenom,
      });
    default:
      return getChainFeeTokens({
        denoms,
        baseGasPriceStep,
        chain,
        nativeDenom,
      });
  }
};

export const useFeeTokens = (
  chain: SupportedChain,
  forceNetwork?: 'mainnet' | 'testnet',
  isSeiEvmTransaction?: GasPriceStep,
) => {
  // fetched from s3
  const denoms = useDenoms();
  const { lcdUrl } = useChainApis(chain, forceNetwork);
  const { compassSeiEvmConfig } = useCompassSeiEvmConfigStore();

  // hardcoded
  const baseDenom = useNativeFeeDenom(chain, forceNetwork);
  const _gasPriceStep = useGasPriceStepForChain(chain, forceNetwork);
  const gasPriceStep = useMemo(() => {
    if (isSeiEvmTransaction) {
      return compassSeiEvmConfig.ARCTIC_EVM_GAS_PRICE_STEPS;
    }

    return _gasPriceStep;
  }, [isSeiEvmTransaction, _gasPriceStep, compassSeiEvmConfig.ARCTIC_EVM_GAS_PRICE_STEPS]);

  const { allAssets } = useGetTokenSpendableBalances(chain, forceNetwork);
  return useQuery<FeeTokenData[]>({
    queryKey: ['fee-tokens', chain, gasPriceStep, baseDenom, allAssets],
    queryFn: () =>
      getFeeTokens({
        chain,
        nativeDenom: baseDenom,
        baseGasPriceStep: gasPriceStep,
        denoms,
        restUrl: lcdUrl ?? '',
        allAssets,
      }),
    initialData: [
      {
        denom: baseDenom,
        ibcDenom: baseDenom?.coinMinimalDenom,
        gasPriceStep,
      },
    ],
    enabled: !!gasPriceStep && !!baseDenom && Object.keys(denoms).length > 0,
  });
};
