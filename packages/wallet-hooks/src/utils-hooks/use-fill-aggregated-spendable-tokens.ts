import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import BigNumber from 'bignumber.js';
import { useEffect } from 'react';

import { useGetTokenSpendableBalances } from '../bank';
import { AggregatedSpendableToken } from '../store';
import { useChainInfo } from './index';

export function useFillAggregatedSpendableTokens(
  chain: SupportedChain,
  setAggregatedSpendableTokens: (aggregatedSpendableTokens: AggregatedSpendableToken) => void,
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
  } = useGetTokenSpendableBalances(chain, 'mainnet');
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

    setAggregatedSpendableTokens({
      spendableAllAssets: [],
      spendableIsLoading: false,
      spendableTotalCurrencyInPreferredFiatValue: new BigNumber(0),
      spendablePerChainLoading: { [chain]: isLoading },
      spendablePerChainAllAssets: {
        [chain]: {
          nativeTokens,
          nonNativeTokens,
        },
      },
      spendablePerChainTotalCurrency: { [chain]: totalCurrencyInPreferredFiatValue },
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
