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

  setStakeDelegationInfo: (
    delegationInfo: DelegationInfo | Record<string, never>,
    refetchDelegations: () => Promise<void>,
  ) => void;
  setStakeDelegationLoading: (loadingDelegations: boolean) => void;
};

export const useStakeDelegationsStore = create<StakeDelegationsStore>((set) => ({
  delegationInfo: {},
  loadingDelegations: true,
  refetchDelegations: async function () {
    await Promise.resolve();
  },

  setStakeDelegationInfo: (delegationInfo, refetchDelegations) => set(() => ({ delegationInfo, refetchDelegations })),
  setStakeDelegationLoading: (loadingDelegations) => set(() => ({ loadingDelegations })),
}));

export const useStakeDelegations = () => {
  const { delegationInfo, loadingDelegations, refetchDelegations } = useStakeDelegationsStore();
  return { delegationInfo, loadingDelegations, refetchDelegations };
};
