import { NetworkChainData, SupportedChain, Validator } from '@leapwallet/cosmos-wallet-sdk';
import create from 'zustand';

import { SelectedNetwork } from '../utils';

type ValidatorData = {
  chainData: NetworkChainData;
  validators: Validator[];
};

type Status = 'loading' | 'success' | 'error';

type StakeValidatorsStore = {
  validatorData: ValidatorData | Record<string, never>;
  validatorDataStatus: Status;
  refetchNetwork: () => Promise<void>;
  pushForceChain?: SupportedChain;
  pushForceNetwork?: SelectedNetwork;

  setStakeValidatorPushForceChain: (pushForceChain?: SupportedChain) => void;
  setStakeValidatorPushForceNetwork: (pushForceNetwork?: SelectedNetwork) => void;
  setStakeValidatorStatus: (validatorDataStatus: Status) => void;
  setStakeValidatorRefetch: (refetchNetwork: () => Promise<void>) => void;
  setStakeValidatorData: (validatorData: ValidatorData | Record<string, never>) => void;
};

export const useStakeValidatorsStore = create<StakeValidatorsStore>((set) => ({
  validatorData: {},
  validatorDataStatus: 'loading',
  refetchNetwork: async function () {
    await Promise.resolve();
  },

  setStakeValidatorPushForceChain: (pushForceChain) => set(() => ({ pushForceChain })),
  setStakeValidatorPushForceNetwork: (pushForceNetwork) => set(() => ({ pushForceNetwork })),
  setStakeValidatorData: (validatorData) => set(() => ({ validatorData })),
  setStakeValidatorRefetch: (refetchNetwork) => set(() => ({ refetchNetwork })),
  setStakeValidatorStatus: (validatorDataStatus) => set(() => ({ validatorDataStatus })),
}));

export const useStakeValidators = () => {
  const { validatorData, validatorDataStatus, refetchNetwork, pushForceChain, pushForceNetwork } =
    useStakeValidatorsStore();
  return { validatorData, validatorDataStatus, refetchNetwork, pushForceChain, pushForceNetwork };
};
