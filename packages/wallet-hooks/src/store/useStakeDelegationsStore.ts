import { Delegation } from '@leapwallet/cosmos-wallet-sdk';
import create from 'zustand';

type DelegationInfo = {
  totalDelegationAmount: string;
  currencyAmountDelegation: string;
  delegations: Record<string, Delegation>;
};

type StakeDelegationsStore = {
  delegationInfo: DelegationInfo | Record<string, never>;
  loadingDelegations: boolean;
  refetchDelegations: () => Promise<void>;

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

  setStakeDelegationInfo: (delegationInfo) => set(() => ({ delegationInfo })),
  setStakeDelegationRefetch: (refetchDelegations) => set(() => ({ refetchDelegations })),
  setStakeDelegationLoading: (loadingDelegations) => set(() => ({ loadingDelegations })),
}));

export const useStakeDelegations = () => {
  const { delegationInfo, loadingDelegations, refetchDelegations } = useStakeDelegationsStore();
  return { delegationInfo, loadingDelegations, refetchDelegations };
};
