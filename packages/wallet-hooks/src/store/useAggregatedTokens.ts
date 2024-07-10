import { BigNumber } from 'bignumber.js';
import create from 'zustand';

import { Token } from '../types';
import { sortTokenBalances } from '../utils';

export type AggregatedToken = {
  allAssets: Token[];
  totalCurrencyInPreferredFiatValue: BigNumber;
  isLoading: boolean;
  perChainLoading: { [key: string]: boolean };
  perChainAllAssets: {
    [key: string]: {
      nativeTokens: Token[];
      nonNativeTokens: Token[];
    };
  };
  perChainTotalCurrency: { [key: string]: BigNumber };
  isWalletHasFunds: boolean;
};

type AggregatedTokens = {
  aggregatedTokens: AggregatedToken;
  setAggregatedTokens: (aggregatedTokens: AggregatedToken) => void;
};

export const useAggregatedTokensStore = create<AggregatedTokens>((set) => ({
  aggregatedTokens: {
    allAssets: [],
    totalCurrencyInPreferredFiatValue: new BigNumber(0),
    isLoading: false,
    perChainLoading: {},
    perChainTotalCurrency: {},
    perChainAllAssets: {},
    isWalletHasFunds: false,
  },
  setAggregatedTokens: (aggregatedTokens) =>
    set((prevValue) => {
      const {
        perChainAllAssets: newPerChainAllAssets,
        perChainTotalCurrency: newPerChainTotalCurrency,
        perChainLoading: newPerChainLoading,
      } = aggregatedTokens;

      const {
        perChainAllAssets: prevPerChainAllAssets,
        perChainTotalCurrency: prevPerChainTotalCurrency,
        perChainLoading: prevPerChainLoading,
      } = prevValue.aggregatedTokens;

      const _newPerChainAllAssets = {
        ...prevPerChainAllAssets,
        ...newPerChainAllAssets,
      };

      const allNativeTokens = Object.values(_newPerChainAllAssets).reduce(
        (acc, chainAssets) => sortTokenBalances([...acc, ...chainAssets.nativeTokens]),
        [] as Token[],
      );

      const allNonNativeTokens = Object.values(_newPerChainAllAssets).reduce(
        (acc, chainAssets) => sortTokenBalances([...acc, ...chainAssets.nonNativeTokens]),
        [] as Token[],
      );

      const _newPerChainLoading = {
        ...prevPerChainLoading,
        ...newPerChainLoading,
      };

      const isLoading = Object.values(_newPerChainLoading).some((loading) => loading);
      const allAssets = [...allNativeTokens, ...allNonNativeTokens].sort(
        (a, b) => Number(b.usdValue) - Number(a.usdValue),
      );
      const totalCurrency = { ...prevPerChainTotalCurrency, ...newPerChainTotalCurrency };

      const totalCurrencyInPreferredFiatValue = Object.values(totalCurrency).reduce(
        (prevTotalCurrency, newTotalCurrency) => prevTotalCurrency.plus(newTotalCurrency),
        new BigNumber(0),
      );

      let isWalletHasFunds = false;
      if (allAssets && allAssets?.length > 0) {
        for (const token of allAssets) {
          if (Number(token.amount) !== 0) {
            isWalletHasFunds = true;
          }
        }
      }

      return {
        aggregatedTokens: {
          allAssets,
          isLoading,
          totalCurrencyInPreferredFiatValue,
          perChainLoading: _newPerChainLoading,
          perChainTotalCurrency: totalCurrency,
          perChainAllAssets: _newPerChainAllAssets,
          isWalletHasFunds,
        },
      };
    }),
}));

export const useAggregatedTokens = () => {
  const { aggregatedTokens } = useAggregatedTokensStore();
  return aggregatedTokens;
};
