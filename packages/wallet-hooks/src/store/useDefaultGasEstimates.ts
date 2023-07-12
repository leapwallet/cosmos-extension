import { DefaultGasEstimatesRecord } from '@leapwallet/cosmos-wallet-sdk';
import create from 'zustand';

type DefaultGasEstimates = {
  defaultGasEstimates: DefaultGasEstimatesRecord | null;
  setDefaultGasEstimates: (defaultGasEstimates: DefaultGasEstimatesRecord | null) => void;
};

export const useDefaultGasEstimatesStore = create<DefaultGasEstimates>((set) => ({
  defaultGasEstimates: null,
  setDefaultGasEstimates: (defaultGasEstimates) => set(() => ({ defaultGasEstimates })),
}));

export const useDefaultGasEstimates = () => {
  const { defaultGasEstimates } = useDefaultGasEstimatesStore();
  return defaultGasEstimates ?? ({} as DefaultGasEstimatesRecord);
};
