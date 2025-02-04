import create from 'zustand';

type CoingeckoPricesData = { [key: string]: { [key: string]: number } };

type CoingeckoPrices = {
  coingeckoPrices: CoingeckoPricesData;
  setCoingeckoPrices: (coingeckoPrices: CoingeckoPricesData) => void;
};

/**
 * @description Please use `CoingeckoPricesStore` from `@leapwallet/cosmos-wallet-store` instead of this hook
 */
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

/**
 * @description Please use `CoingeckoPricesStore` from `@leapwallet/cosmos-wallet-store` instead of this hook
 *
 * You must keep the state in sync with the mobx store
 */
export const useCoingeckoPricesStore = create<CoingeckoPrices>((set) => ({
  coingeckoPrices: {},
  setCoingeckoPrices: (coingeckoPrices) => set(() => ({ coingeckoPrices })),
}));

/**
 * @description Please use `CoingeckoPricesStore` from `@leapwallet/cosmos-wallet-store` instead of this hook
 */
export const useCoingeckoPrices = () => {
  return useCoingeckoPricesStore((store) => store.coingeckoPrices);
};
