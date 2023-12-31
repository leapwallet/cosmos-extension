import { NetworkChainData, Validator } from '@leapwallet/cosmos-wallet-sdk';
import create from 'zustand';

type ValidatorData = {
  chainData: NetworkChainData;
  validators: Validator[];
};

type Status = 'loading' | 'success' | 'error';

type StakeValidatorsStore = {
  validatorData: ValidatorData | Record<string, never>;
  validatorDataStatus: Status;
  refetchNetwork: () => Promise<void>;

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

  setStakeValidatorData: (validatorData) => set(() => ({ validatorData })),
  setStakeValidatorRefetch: (refetchNetwork) => set(() => ({ refetchNetwork })),
  setStakeValidatorStatus: (validatorDataStatus) => set(() => ({ validatorDataStatus })),
}));

export const useStakeValidators = () => {
  const { validatorData, validatorDataStatus, refetchNetwork } = useStakeValidatorsStore();
  return { validatorData, validatorDataStatus, refetchNetwork };
};
