import { ProviderDelegation } from '@leapwallet/cosmos-wallet-sdk';
import { BigNumber } from 'bignumber.js';
import create from 'zustand';

type DelegationInfo = {
  totalDelegationAmount: string;
  currencyAmountDelegation: string;
  delegations: Record<string, ProviderDelegation>;
  totalDelegation: BigNumber;
};

type DualStakeDelegationsStore = {
  delegationInfo: DelegationInfo | Record<string, never>;
  loadingDelegations: boolean;
  refetchDelegations: () => Promise<void>;

  setDualStakeDelegationInfo: (delegationInfo: DelegationInfo | Record<string, never>) => void;
  setDualStakeDelegationRefetch: (refetchDelegations: () => Promise<void>) => void;
  setDualStakeDelegationLoading: (loadingDelegations: boolean) => void;
};

export const useDualStakeDelegationsStore = create<DualStakeDelegationsStore>((set) => ({
  delegationInfo: {},
  loadingDelegations: true,
  refetchDelegations: async function () {
    await Promise.resolve();
  },

  setDualStakeDelegationInfo: (delegationInfo) => set(() => ({ delegationInfo })),
  setDualStakeDelegationRefetch: (refetchDelegations) => set(() => ({ refetchDelegations })),
  setDualStakeDelegationLoading: (loadingDelegations) => set(() => ({ loadingDelegations })),
}));

export const useDualStakeDelegations = () => {
  const { delegationInfo, loadingDelegations, refetchDelegations } = useDualStakeDelegationsStore();
  return { delegationInfo, loadingDelegations, refetchDelegations };
};
