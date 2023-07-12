import { GasPriceStepsRecord } from '@leapwallet/cosmos-wallet-sdk';
import create from 'zustand';

type GasPriceSteps = {
  gasPriceSteps: GasPriceStepsRecord | null;
  setGasPriceSteps: (gasPriceSteps: GasPriceStepsRecord | null) => void;
};

export const useGasPriceStepsStore = create<GasPriceSteps>((set) => ({
  gasPriceSteps: null,
  setGasPriceSteps: (gasPriceSteps) => set(() => ({ gasPriceSteps })),
}));

export const useGasPriceSteps = () => {
  const { gasPriceSteps } = useGasPriceStepsStore();
  return gasPriceSteps ?? ({} as GasPriceStepsRecord);
};
