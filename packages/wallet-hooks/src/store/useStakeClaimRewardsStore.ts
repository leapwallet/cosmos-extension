import { Reward, RewardsResponse } from '@leapwallet/cosmos-wallet-sdk';
import create from 'zustand';

type ClaimRewards = {
  rewards: Record<string, Reward>;
  result: RewardsResponse;
  totalRewards: string;
  formattedTotalRewards: string;
  totalRewardsDollarAmt: string;
};

type Status = 'loading' | 'success' | 'error';

type ClaimRewardsStore = {
  loadingRewardsStatus: Status;
  isFetchingRewards: boolean;
  rewards: ClaimRewards | Record<string, never>;
  refetchDelegatorRewards: () => Promise<void>;

  setClaimIsFetching: (isFetching: boolean) => void;
  setClaimRewards: (
    rewards: ClaimRewards | Record<string, never>,
    refetchDelegatorRewards: () => Promise<void>,
  ) => void;
  setClaimStatus: (loadingRewardsStatus: Status) => void;
};

export const useStakeClaimRewardsStore = create<ClaimRewardsStore>((set) => ({
  loadingRewardsStatus: 'loading',
  rewards: {},
  refetchDelegatorRewards: async () => {
    await Promise.resolve();
  },
  isFetchingRewards: false,

  setClaimIsFetching: (isFetchingRewards) => set(() => ({ isFetchingRewards })),
  setClaimRewards: (rewards, refetchDelegatorRewards) => set(() => ({ rewards, refetchDelegatorRewards })),
  setClaimStatus: (loadingRewardsStatus) => set(() => ({ loadingRewardsStatus })),
}));

export const useStakeClaimRewards = () => {
  const { loadingRewardsStatus, isFetchingRewards, rewards, refetchDelegatorRewards } = useStakeClaimRewardsStore();
  return { loadingRewardsStatus, isFetchingRewards, rewards, refetchDelegatorRewards };
};
