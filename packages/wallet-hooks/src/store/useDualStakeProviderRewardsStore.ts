import create from 'zustand';

import { Amount } from '../types';

type Reward = {
  provider: string;
  chainId: string;
  amount: Amount[];
};

type ClaimRewards = {
  rewards: Reward[];
  totalRewards: string;
  formattedTotalRewards: string;
  totalRewardsDollarAmt: string;
};

type Status = 'loading' | 'success' | 'error';

type DualStakeProviderRewardsStore = {
  loadingRewardsStatus: Status;
  isFetchingRewards: boolean;
  rewards: ClaimRewards | Record<string, never>;
  refetchDelegatorRewards: () => Promise<void>;

  setClaimIsFetching: (isFetching: boolean) => void;
  setClaimRewards: (rewards: ClaimRewards | Record<string, never>) => void;
  setClaimRefetch: (refetchDelegatorRewards: () => Promise<void>) => void;
  setClaimStatus: (loadingRewardsStatus: Status) => void;
};

export const useDualStakeProviderRewardsStore = create<DualStakeProviderRewardsStore>((set) => ({
  loadingRewardsStatus: 'loading',
  rewards: {},
  refetchDelegatorRewards: async () => {
    await Promise.resolve();
  },
  isFetchingRewards: false,

  setClaimIsFetching: (isFetchingRewards) => set(() => ({ isFetchingRewards })),
  setClaimRewards: (rewards) => set(() => ({ rewards })),
  setClaimRefetch: (refetchDelegatorRewards) => set(() => ({ refetchDelegatorRewards })),
  setClaimStatus: (loadingRewardsStatus) => set(() => ({ loadingRewardsStatus })),
}));

export const useDualStakeProviderRewards = () => {
  const { loadingRewardsStatus, isFetchingRewards, rewards, refetchDelegatorRewards } =
    useDualStakeProviderRewardsStore();

  return {
    loadingRewardsStatus,
    isFetchingRewards,
    rewards,
    refetchDelegatorRewards,
  };
};
