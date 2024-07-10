import { SupportedChain, UnbondingDelegation } from '@leapwallet/cosmos-wallet-sdk';
import create from 'zustand';

import { SelectedNetwork } from '../utils';

type Undelegations = Record<string, UnbondingDelegation>;
type Status = 'loading' | 'success' | 'error';

type StakeUndelegationsStore = {
  unboundingDelegationsInfo: Undelegations;
  loadingUnboundingDegStatus: Status;
  refetchUnboundingDelegations: () => Promise<void>;
  pushForceChain?: SupportedChain;
  pushForceNetwork?: SelectedNetwork;

  setStakeUndelegationsPushForceChain: (pushForceChain?: SupportedChain) => void;
  setStakeUndelegationsPushForceNetwork: (pushForceNetwork?: SelectedNetwork) => void;
  setStakeUndelegationsStatus: (loadingUnboundingDegStatus: Status) => void;
  setStakeUndelegationsRefetch: (refetchUnboundingDelegations: () => Promise<void>) => void;
  setStakeUndelegationsInfo: (unboundingDelegationsInfo: Undelegations) => void;
};

export const useStakeUndelegationsStore = create<StakeUndelegationsStore>((set) => ({
  unboundingDelegationsInfo: {},
  loadingUnboundingDegStatus: 'loading',
  refetchUnboundingDelegations: async function () {
    await Promise.resolve();
  },

  setStakeUndelegationsPushForceChain: (pushForceChain) => set(() => ({ pushForceChain })),
  setStakeUndelegationsPushForceNetwork: (pushForceNetwork) => set(() => ({ pushForceNetwork })),
  setStakeUndelegationsStatus: (loadingUnboundingDegStatus) => set(() => ({ loadingUnboundingDegStatus })),
  setStakeUndelegationsInfo: (unboundingDelegationsInfo) => set(() => ({ unboundingDelegationsInfo })),
  setStakeUndelegationsRefetch: (refetchUnboundingDelegations) => set(() => ({ refetchUnboundingDelegations })),
}));

export const useStakeUndelegations = () => {
  const {
    unboundingDelegationsInfo,
    loadingUnboundingDegStatus,
    refetchUnboundingDelegations,
    pushForceChain,
    pushForceNetwork,
  } = useStakeUndelegationsStore();

  return {
    unboundingDelegationsInfo,
    loadingUnboundingDegStatus,
    refetchUnboundingDelegations,
    pushForceChain,
    pushForceNetwork,
  };
};
