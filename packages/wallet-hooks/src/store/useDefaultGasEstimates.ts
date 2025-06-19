import { DefaultGasEstimatesRecord } from '@leapwallet/cosmos-wallet-sdk';
import create from 'zustand';

type DefaultGasEstimates = {
  defaultGasEstimates: DefaultGasEstimatesRecord | null;
  setDefaultGasEstimates: (defaultGasEstimates: DefaultGasEstimatesRecord | null) => void;
};

/**
 * Please use `DefaultGasEstimatesStore` from `@leapwallet/cosmos-wallet-store` instead of this hook
 */
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
          aptos: { DEFAULT_GAS_TRANSFER: 100, DEFAULT_GAS_STAKE: 100, DEFAULT_GAS_IBC: 100 },
          solana: { DEFAULT_GAS_TRANSFER: 500, DEFAULT_GAS_STAKE: 500, DEFAULT_GAS_IBC: 500 },
        },
      };
    }),
}));

/**
 * Please use `DefaultGasEstimatesStore` from `@leapwallet/cosmos-wallet-store` instead of this hook
 */
export const useDefaultGasEstimates = () => {
  const { defaultGasEstimates } = useDefaultGasEstimatesStore();
  return defaultGasEstimates ?? ({} as DefaultGasEstimatesRecord);
};
