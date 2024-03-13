import create from 'zustand';

type CoingeckoPricesData = { [key: string]: { [key: string]: number } };

type CoingeckoPrices = {
  coingeckoPrices: CoingeckoPricesData;
  setCoingeckoPrices: (coingeckoPrices: CoingeckoPricesData) => void;
};

export const getCoingeckoPricesStoreSnapshot = (): Promise<CoingeckoPricesData> => {
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
