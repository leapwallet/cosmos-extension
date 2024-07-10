import { Reward, RewardsResponse, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import create from 'zustand';

import { SelectedNetwork } from '../utils';

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
  pushForceChain?: SupportedChain;
  pushForceNetwork?: SelectedNetwork;

  setClaimPushForceChain: (pushForceChain?: SupportedChain) => void;
  setClaimPushForceNetwork: (pushForceNetwork?: SelectedNetwork) => void;
  setClaimIsFetching: (isFetching: boolean) => void;
  setClaimRewards: (rewards: ClaimRewards | Record<string, never>) => void;
  setClaimRefetch: (refetchDelegatorRewards: () => Promise<void>) => void;
  setClaimStatus: (loadingRewardsStatus: Status) => void;
};

export const useStakeClaimRewardsStore = create<ClaimRewardsStore>((set) => ({
  loadingRewardsStatus: 'loading',
  rewards: {},
  refetchDelegatorRewards: async () => {
    await Promise.resolve();
  },
  isFetchingRewards: false,

  setClaimPushForceChain: (pushForceChain) => set(() => ({ pushForceChain })),
  setClaimPushForceNetwork: (pushForceNetwork) => set(() => ({ pushForceNetwork })),
  setClaimIsFetching: (isFetchingRewards) => set(() => ({ isFetchingRewards })),
  setClaimRewards: (rewards) => set(() => ({ rewards })),
  setClaimRefetch: (refetchDelegatorRewards) => set(() => ({ refetchDelegatorRewards })),
  setClaimStatus: (loadingRewardsStatus) => set(() => ({ loadingRewardsStatus })),
}));

export const useStakeClaimRewards = () => {
  const {
    loadingRewardsStatus,
    isFetchingRewards,
    rewards,
    refetchDelegatorRewards,
    pushForceChain,
    pushForceNetwork,
  } = useStakeClaimRewardsStore();

  return {
    loadingRewardsStatus,
    isFetchingRewards,
    rewards,
    refetchDelegatorRewards,
    pushForceChain,
    pushForceNetwork,
  };
};
