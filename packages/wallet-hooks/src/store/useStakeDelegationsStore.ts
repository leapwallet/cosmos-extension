import { Delegation, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { BigNumber } from 'bignumber.js';
import create from 'zustand';

import { SelectedNetwork } from '../utils/get-staking-selected-network';

export type DelegationInfo = {
  totalDelegationAmount: string;
  currencyAmountDelegation: string;
  delegations: Record<string, Delegation>;
  totalDelegation: BigNumber;
};

type StakeDelegationsStore = {
  delegationInfo: DelegationInfo | Record<string, never>;
  loadingDelegations: boolean;
  refetchDelegations: () => Promise<void>;
  pushForceChain?: SupportedChain;
  pushForceNetwork?: SelectedNetwork;

  setStakeDelegationPushForceChain: (pushForceChain?: SupportedChain) => void;
  setStakeDelegationPushForceNetwork: (pushForceNetwork?: SelectedNetwork) => void;
  setStakeDelegationInfo: (delegationInfo: DelegationInfo | Record<string, never>) => void;
  setStakeDelegationRefetch: (refetchDelegations: () => Promise<void>) => void;
  setStakeDelegationLoading: (loadingDelegations: boolean) => void;
};

export const useStakeDelegationsStore = create<StakeDelegationsStore>((set) => ({
  delegationInfo: {},
  loadingDelegations: true,
  refetchDelegations: async function () {
    await Promise.resolve();
  },

  setStakeDelegationPushForceChain: (pushForceChain) => set(() => ({ pushForceChain })),
  setStakeDelegationPushForceNetwork: (pushForceNetwork) => set(() => ({ pushForceNetwork })),
  setStakeDelegationInfo: (delegationInfo) => set(() => ({ delegationInfo })),
  setStakeDelegationRefetch: (refetchDelegations) => set(() => ({ refetchDelegations })),
  setStakeDelegationLoading: (loadingDelegations) => set(() => ({ loadingDelegations })),
}));

export const useStakeDelegations = () => {
  const { delegationInfo, loadingDelegations, refetchDelegations, pushForceChain, pushForceNetwork } =
    useStakeDelegationsStore();
  return { delegationInfo, loadingDelegations, refetchDelegations, pushForceChain, pushForceNetwork };
};
