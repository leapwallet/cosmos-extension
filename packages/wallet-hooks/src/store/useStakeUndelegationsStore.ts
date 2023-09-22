import { UnbondingDelegation } from '@leapwallet/cosmos-wallet-sdk';
import create from 'zustand';

type Undelegations = Record<string, UnbondingDelegation>;
type Status = 'loading' | 'success' | 'error';

type StakeUndelegationsStore = {
  unboundingDelegationsInfo: Undelegations;
  loadingUnboundingDegStatus: Status;
  refetchUnboundingDelegations: () => Promise<void>;

  setStakeUndelegationsStatus: (loadingUnboundingDegStatus: Status) => void;
  setStakeUndelegationsInfo: (
    unboundingDelegationsInfo: Undelegations,
    refetchUnboundingDelegations: () => Promise<void>,
  ) => void;
};

export const useStakeUndelegationsStore = create<StakeUndelegationsStore>((set) => ({
  unboundingDelegationsInfo: {},
  loadingUnboundingDegStatus: 'loading',
  refetchUnboundingDelegations: async function () {
    await Promise.resolve();
  },

  setStakeUndelegationsStatus: (loadingUnboundingDegStatus) => set(() => ({ loadingUnboundingDegStatus })),
  setStakeUndelegationsInfo: (unboundingDelegationsInfo, refetchUnboundingDelegations) =>
    set(() => ({
      unboundingDelegationsInfo,
      refetchUnboundingDelegations,
    })),
}));

export const useStakeUndelegations = () => {
  const { unboundingDelegationsInfo, loadingUnboundingDegStatus, refetchUnboundingDelegations } =
    useStakeUndelegationsStore();
  return { unboundingDelegationsInfo, loadingUnboundingDegStatus, refetchUnboundingDelegations };
};
