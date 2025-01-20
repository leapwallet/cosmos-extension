import { DefaultGasEstimatesRecord } from '@leapwallet/cosmos-wallet-sdk';
import create from 'zustand';

type DefaultGasEstimates = {
  defaultGasEstimates: DefaultGasEstimatesRecord | null;
  setDefaultGasEstimates: (defaultGasEstimates: DefaultGasEstimatesRecord | null) => void;
};

export const useDefaultGasEstimatesStore = create<DefaultGasEstimates>((set) => ({
  defaultGasEstimates: null,
  setDefaultGasEstimates: (defaultGasEstimates) =>
    set(() => {
      if (!defaultGasEstimates) {
        return {
          defaultGasEstimates: null,
        };
      }
      return {
        defaultGasEstimates: {
          ...defaultGasEstimates,
          movement: { DEFAULT_GAS_TRANSFER: 100, DEFAULT_GAS_STAKE: 100, DEFAULT_GAS_IBC: 100 },
          movementBardock: { DEFAULT_GAS_TRANSFER: 100, DEFAULT_GAS_STAKE: 100, DEFAULT_GAS_IBC: 100 },
          aptos: { DEFAULT_GAS_TRANSFER: 100, DEFAULT_GAS_STAKE: 100, DEFAULT_GAS_IBC: 100 },
        },
      };
    }),
}));

export const useDefaultGasEstimates = () => {
  const { defaultGasEstimates } = useDefaultGasEstimatesStore();
  return defaultGasEstimates ?? ({} as DefaultGasEstimatesRecord);
};
