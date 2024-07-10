import { BigNumber } from 'bignumber.js';
import create from 'zustand';

export type PerChainDelegations = {
  totalDelegationAmount: string;
  currencyAmountDelegation: string;
  stakingDenom: string;
  apr: number;
  claimRewards: string;
  loading: boolean;
};

export type AggregatedStake = {
  perChainDelegations: {
    [key: string]: PerChainDelegations;
  };
  totalCurrencyAmountDelegation: BigNumber;
  averageApr: number;
  totalClaimRewardsAmount: BigNumber;
  isEveryChainLoading: boolean;
  isSomeChainLoading: boolean;
};

type AggregatedStakeStore = {
  aggregatedStake: AggregatedStake;
  setAggregatedStake: (aggregatedStake: AggregatedStake) => void;
};

export const useAggregatedStakeStore = create<AggregatedStakeStore>((set) => ({
  aggregatedStake: {
    perChainDelegations: {},
    totalCurrencyAmountDelegation: new BigNumber(0),
    averageApr: 0,
    totalClaimRewardsAmount: new BigNumber(0),
    isEveryChainLoading: false,
    isSomeChainLoading: false,
  },
  setAggregatedStake: (aggregatedStake) =>
    set((prevValue) => {
      const { perChainDelegations: newPerChainDelegations } = aggregatedStake;
      const { perChainDelegations: prevPerChainDelegations } = prevValue.aggregatedStake;

      const perChainDelegations = {
        ...prevPerChainDelegations,
        ...newPerChainDelegations,
      };

      const totalCurrencyAmountDelegation = Object.values(perChainDelegations).reduce(
        (acc, { currencyAmountDelegation }) => acc.plus(currencyAmountDelegation ?? new BigNumber(0)),
        new BigNumber(0),
      );
      const averageApr =
        Object.values(perChainDelegations).reduce((acc, { apr }) => acc + (apr ?? 0), 0) /
        Object.values(perChainDelegations).length;
      const totalClaimRewardsAmount = Object.values(perChainDelegations).reduce(
        (acc, { claimRewards }) => acc.plus(claimRewards ?? new BigNumber(0)),
        new BigNumber(0),
      );

      const isEveryChainLoading = Object.values(perChainDelegations).every((chain) => chain.loading);
      const isSomeChainLoading = Object.values(perChainDelegations).some((chain) => chain.loading);

      return {
        aggregatedStake: {
          perChainDelegations,
          totalCurrencyAmountDelegation,
          averageApr,
          totalClaimRewardsAmount,
          isEveryChainLoading,
          isSomeChainLoading,
        },
      };
    }),
}));

export const useAggregatedStake = () => {
  const { aggregatedStake } = useAggregatedStakeStore();
  return aggregatedStake;
};
