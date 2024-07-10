import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import BigNumber from 'bignumber.js';
import { useEffect } from 'react';

import { useGetTokenBalances } from '../bank';
import { AggregatedToken } from '../store';
import { useChainInfo } from './index';

export function useFillAggregatedTokens(
  chain: SupportedChain,
  setAggregatedTokens: (aggregatedTokens: AggregatedToken) => void,
) {
  const {
    _nativeTokensBalance,
    s3IbcTokensBalances,
    nonS3IbcTokensBalances,
    _cw20TokensBalances,
    _erc20TokensBalances,
    totalCurrencyInPreferredFiatValue,
    s3IbcTokensStatus,
    nonS3IbcTokensStatus,
    nativeTokensStatus,
    cw20TokensStatus,
    erc20TokensStatus,
  } = useGetTokenBalances(chain, 'mainnet');
  const chainInfo = useChainInfo(chain);

  useEffect(() => {
    const nativeTokens =
      _nativeTokensBalance?.filter((token) => Object.keys(chainInfo?.nativeDenoms)?.includes(token.coinMinimalDenom)) ??
      [];

    const _nonNativeTokens =
      _nativeTokensBalance?.filter(
        (token) => !Object.keys(chainInfo?.nativeDenoms)?.includes(token.coinMinimalDenom),
      ) ?? [];

    const nonNativeTokens = [
      ...(_nonNativeTokens ?? []),
      ...(s3IbcTokensBalances ?? []),
      ...(nonS3IbcTokensBalances ?? []),
      ...(_cw20TokensBalances ?? []),
      ...(_erc20TokensBalances ?? []),
    ];

    const isLoading = [
      s3IbcTokensStatus,
      nonS3IbcTokensStatus,
      nativeTokensStatus,
      cw20TokensStatus,
      erc20TokensStatus,
    ].includes('loading');

    setAggregatedTokens({
      allAssets: [],
      isLoading: false,
      totalCurrencyInPreferredFiatValue: new BigNumber(0),
      perChainLoading: { [chain]: isLoading },
      perChainAllAssets: {
        [chain]: {
          nativeTokens,
          nonNativeTokens,
        },
      },
      perChainTotalCurrency: { [chain]: totalCurrencyInPreferredFiatValue },
      isWalletHasFunds: false,
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    _cw20TokensBalances,
    _erc20TokensBalances,
    _nativeTokensBalance,
    chainInfo?.nativeDenoms,
    nonS3IbcTokensBalances,
    s3IbcTokensBalances,
    totalCurrencyInPreferredFiatValue,
    chain,
    s3IbcTokensStatus,
    nonS3IbcTokensStatus,
    nativeTokensStatus,
    cw20TokensStatus,
    erc20TokensStatus,
  ]);
}
