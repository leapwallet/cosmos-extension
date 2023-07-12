import { DenomsRecord } from '@leapwallet/cosmos-wallet-sdk';
import create from 'zustand';

type Denoms = {
  denoms: DenomsRecord | null;
  setDenoms: (denoms: DenomsRecord | null) => void;
};

export const getDenomStoreSnapshot = (): Promise<DenomsRecord> => {
  const currentState = useDenomsStore.getState().denoms;

  if (currentState === null) {
    return new Promise((resolve) => {
      const unsubscribe = useDenomsStore.subscribe((state) => {
        if (state.denoms !== null) {
          unsubscribe();
          resolve(state.denoms);
        }
      });
    });
  }

  return Promise.resolve(currentState);
};

export const useDenomsStore = create<Denoms>((set) => ({
  denoms: null,
  setDenoms: (denoms) =>
    set(() => {
      return { denoms };
    }),
}));

export const useDenoms = (): DenomsRecord => {
  return useDenomsStore((state) => state.denoms) ?? {};
};
