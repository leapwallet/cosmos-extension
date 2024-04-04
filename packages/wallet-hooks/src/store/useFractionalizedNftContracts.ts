import create from 'zustand';

type FractionalizedNftContracts = {
  fractionalizedNftContracts: string[];
  setFractionalizedNftContracts: (nftChains: string[]) => void;
};

export const getFractionalizedNftContractsStoreSnapshot = (): Promise<string[]> => {
  const currentState = useFractionalizedNftContractsStore.getState().fractionalizedNftContracts;

  if (currentState.length === 0) {
    return new Promise((resolve) => {
      const unsubscribe = useFractionalizedNftContractsStore.subscribe((state) => {
        if (state.fractionalizedNftContracts.length > 0) {
          unsubscribe();
          resolve(state.fractionalizedNftContracts);
        }
      });
    });
  }

  return Promise.resolve(currentState);
};

export const useFractionalizedNftContractsStore = create<FractionalizedNftContracts>((set) => ({
  fractionalizedNftContracts: [],
  setFractionalizedNftContracts: (fractionalizedNftContracts) => set(() => ({ fractionalizedNftContracts })),
}));

export const useFractionalizedNftContracts = () => {
  return useFractionalizedNftContractsStore((store) => store.fractionalizedNftContracts) ?? [];
};
