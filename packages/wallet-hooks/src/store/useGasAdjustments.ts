import { GasAdjustments, gasAdjustments } from '@leapwallet/cosmos-wallet-sdk';
import create from 'zustand';

type GasAdjustmentsState = {
  gasAdjustments: GasAdjustments;
  setGasAdjustments: (gasAdjustments: GasAdjustments) => void;
};

export const useGasAdjustmentsStore = create<GasAdjustmentsState>((set) => ({
  gasAdjustments: gasAdjustments,
  setGasAdjustments: (gasAdjustments) =>
    set(() => {
      return { gasAdjustments };
    }),
}));

export const useGasAdjustments = (): GasAdjustments => {
  return useGasAdjustmentsStore((state) => state.gasAdjustments);
};
