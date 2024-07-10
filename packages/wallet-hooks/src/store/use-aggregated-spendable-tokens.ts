import { BigNumber } from 'bignumber.js';
import create from 'zustand';

import { Token } from '../types';
import { sortTokenBalances } from '../utils';

export type AggregatedSpendableToken = {
  spendableAllAssets: Token[];
  spendableTotalCurrencyInPreferredFiatValue: BigNumber;
  spendableIsLoading: boolean;
  spendablePerChainLoading: { [key: string]: boolean };
  spendablePerChainAllAssets: {
    [key: string]: {
      nativeTokens: Token[];
      nonNativeTokens: Token[];
    };
  };
  spendablePerChainTotalCurrency: { [key: string]: BigNumber };
};

type AggregatedSpendableTokens = {
  aggregatedSpendableTokens: AggregatedSpendableToken;
  setAggregatedSpendableTokens: (aggregatedSpendableTokens: AggregatedSpendableToken) => void;
};

export const useAggregatedSpendableTokensStore = create<AggregatedSpendableTokens>((set) => ({
  aggregatedSpendableTokens: {
    spendableAllAssets: [],
    spendableTotalCurrencyInPreferredFiatValue: new BigNumber(0),
    spendableIsLoading: false,
    spendablePerChainLoading: {},
    spendablePerChainTotalCurrency: {},
    spendablePerChainAllAssets: {},
  },
  setAggregatedSpendableTokens: (aggregatedSpendableTokens) =>
    set((prevValue) => {
      const {
        spendablePerChainAllAssets: newSpendablePerChainAllAssets,
        spendablePerChainTotalCurrency: newSpendablePerChainTotalCurrency,
        spendablePerChainLoading: newSpendablePerChainLoading,
      } = aggregatedSpendableTokens;

      const {
        spendablePerChainAllAssets: prevSpendablePerChainAllAssets,
        spendablePerChainTotalCurrency: prevSpendablePerChainTotalCurrency,
        spendablePerChainLoading: prevSpendablePerChainLoading,
      } = prevValue.aggregatedSpendableTokens;

      const _newSpendablePerChainAllAssets = {
        ...prevSpendablePerChainAllAssets,
        ...newSpendablePerChainAllAssets,
      };

      const allSpendableNativeTokens = Object.values(_newSpendablePerChainAllAssets).reduce(
        (acc, chainAssets) => sortTokenBalances([...acc, ...chainAssets.nativeTokens]),
        [] as Token[],
      );

      const allSpendableNonNativeTokens = Object.values(_newSpendablePerChainAllAssets).reduce(
        (acc, chainAssets) => sortTokenBalances([...acc, ...chainAssets.nonNativeTokens]),
        [] as Token[],
      );

      const _newSpendablePerChainLoading = {
        ...prevSpendablePerChainLoading,
        ...newSpendablePerChainLoading,
      };

      const spendableIsLoading = Object.values(_newSpendablePerChainLoading).some((loading) => loading);
      const spendableAllAssets = [...allSpendableNativeTokens, ...allSpendableNonNativeTokens];
      const spendableTotalCurrency = {
        ...prevSpendablePerChainTotalCurrency,
        ...newSpendablePerChainTotalCurrency,
      };

      const spendableTotalCurrencyInPreferredFiatValue = Object.values(spendableTotalCurrency).reduce(
        (prevTotalCurrency, newTotalCurrency) => prevTotalCurrency.plus(newTotalCurrency),
        new BigNumber(0),
      );

      return {
        aggregatedSpendableTokens: {
          spendableAllAssets,
          spendableTotalCurrencyInPreferredFiatValue,
          spendableIsLoading,
          spendablePerChainLoading: _newSpendablePerChainLoading,
          spendablePerChainAllAssets: _newSpendablePerChainAllAssets,
          spendablePerChainTotalCurrency: spendableTotalCurrency,
        },
      };
    }),
}));

export const useAggregatedSpendableTokens = () => {
  const { aggregatedSpendableTokens } = useAggregatedSpendableTokensStore();
  return aggregatedSpendableTokens;
};
