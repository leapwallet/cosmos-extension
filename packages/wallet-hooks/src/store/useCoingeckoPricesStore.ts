import create from 'zustand';

type CoingeckoPrices = {
  coingeckoPrices: { [key: string]: number };
  setCoingeckoPrices: (coingeckoPrices: { [key: string]: number }) => void;
};

export const getCoingeckoPricesStoreSnapshot = (): Promise<{ [key: string]: number }> => {
  const currentState = useCoingeckoPricesStore.getState().coingeckoPrices;

  if (currentState === null) {
    return new Promise((resolve) => {
      const unsubscribe = useCoingeckoPricesStore.subscribe((state) => {
        if (state.coingeckoPrices !== null) {
          unsubscribe();
          resolve(state.coingeckoPrices);
        }
      });
    });
  }

  return Promise.resolve(currentState);
};

export const useCoingeckoPricesStore = create<CoingeckoPrices>((set) => ({
  coingeckoPrices: {},
  setCoingeckoPrices: (coingeckoPrices) => set(() => ({ coingeckoPrices })),
}));

export const useCoingeckoPrices = () => {
  return useCoingeckoPricesStore((store) => store.coingeckoPrices);
};
