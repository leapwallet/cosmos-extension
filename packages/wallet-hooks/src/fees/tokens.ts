import { DenomsRecord, NativeDenom, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { BigNumber } from 'bignumber.js';
import { useMemo } from 'react';

import { useChainApis, useDenoms } from '../store';
import { GasPriceStep, useGasPriceStepForChain, useNativeFeeDenom } from '../utils';
import { denomFetcher } from '../utils/DenomFetcher';

const one = new BigNumber(1);

export type FeeTokenData = {
  denom: NativeDenom;
  ibcDenom: string;
  gasPriceStep: GasPriceStep;
};

type getFeeTokenFnArgs = {
  baseGasPriceStep: GasPriceStep;
  denoms: DenomsRecord;
};

const convertOsmosisGasPriceStep = (priceStep: GasPriceStep, priceRatio: BigNumber): GasPriceStep => {
  return {
    low: priceRatio.multipliedBy(priceStep.low).multipliedBy(1.05).toNumber(),
    medium: priceRatio.multipliedBy(priceStep.medium).multipliedBy(1.05).toNumber(),
    high: priceRatio.multipliedBy(priceStep.high).multipliedBy(1.05).toNumber(),
  };
};

export const getOsmosisFeeTokens = async ({
  baseGasPriceStep,
  denoms,
  restUrl,
}: getFeeTokenFnArgs & {
  restUrl: string;
}): Promise<FeeTokenData[]> => {
  const nativeFeeToken = {
    denom: denoms['uosmo'],
    ibcDenom: 'uosmo',
    gasPriceStep: baseGasPriceStep,
  };
  try {
    const feeTokens = await axios.get(`${restUrl}/osmosis/txfees/v1beta1/fee_tokens`);
    const feeTokensData = feeTokens.data.fee_tokens as { denom: string; poolID: string }[];
    const feeTokensWithDenom = await Promise.all(
      feeTokensData.map(async (token) => {
        const [denom, priceInfo] = await Promise.all([
          denomFetcher.fetchDenomTrace(token.denom, restUrl),
          axios.get(`${restUrl}/osmosis/txfees/v1beta1/spot_price_by_denom?denom=${encodeURIComponent(token.denom)}`),
        ]);
        const priceRatio = one.dividedBy(priceInfo.data.spot_price);
        return {
          denom,
          ibcDenom: token.denom,
          gasPriceStep: convertOsmosisGasPriceStep(baseGasPriceStep, priceRatio),
        };
      }),
    );

    return [nativeFeeToken, ...feeTokensWithDenom].filter((token) => !!token.denom) as FeeTokenData[];
  } catch (e) {
    return [nativeFeeToken];
  }
};

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
  nativeDenom: NativeDenom;
};

export const getChainFeeTokens = async ({
  baseGasPriceStep,
  chain,
  nativeDenom,
  denoms,
}: getChainFeeTokensFnArgs): Promise<FeeTokenData[]> => {
  const nativeFeeToken = {
    denom: nativeDenom,
    ibcDenom: nativeDenom.coinMinimalDenom,
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
}: {
  chain: SupportedChain;
  nativeDenom: NativeDenom;
  baseGasPriceStep: GasPriceStep;
  denoms: DenomsRecord;
  restUrl: string;
}): Promise<FeeTokenData[]> => {
  switch (chain) {
    case 'osmosis':
      return getOsmosisFeeTokens({
        baseGasPriceStep,
        denoms,
        restUrl,
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

export const useFeeTokens = (chain: SupportedChain) => {
  // fetched from s3
  const denoms = useDenoms();
  const { lcdUrl } = useChainApis(chain);

  // hardcoded
  const _baseDenom = useNativeFeeDenom(chain);
  // hardcoded
  const gasPriceStep = useGasPriceStepForChain(chain);

  // fetched ?? hardcoded
  const baseDenom = useMemo(() => denoms[_baseDenom.coinMinimalDenom] ?? _baseDenom, [_baseDenom, denoms]);

  return useQuery<FeeTokenData[]>({
    queryKey: ['fee-tokens', chain, gasPriceStep, baseDenom],
    queryFn: () =>
      getFeeTokens({
        chain,
        nativeDenom: baseDenom,
        baseGasPriceStep: gasPriceStep,
        denoms,
        restUrl: lcdUrl ?? '',
      }),
    initialData: [
      {
        denom: baseDenom,
        ibcDenom: baseDenom.coinMinimalDenom,
        gasPriceStep,
      },
    ],
    enabled: !!gasPriceStep && !!baseDenom && Object.keys(denoms).length > 0,
  });
};
