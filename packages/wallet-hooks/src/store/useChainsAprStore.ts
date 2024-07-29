import create from 'zustand';

type ChainsAprData = { [key: string]: number };

type ChainsApr = {
  chainsApr: ChainsAprData;
  setChainsApr: (chainsApr: ChainsAprData) => void;
};

export const getChainsAprSnapshot = (): Promise<ChainsAprData> => {
  const currentState = useChainsAprStore.getState().chainsApr;

  if (currentState === null) {
    return new Promise((resolve) => {
      const unsubscribe = useChainsAprStore.subscribe((state) => {
        if (state.chainsApr !== null) {
          unsubscribe();
          resolve(state.chainsApr);
        }
      });
    });
  }

  return Promise.resolve(currentState);
};

export const useChainsAprStore = create<ChainsApr>((set) => ({
  chainsApr: {},
  setChainsApr: (chainsApr) => set(() => ({ chainsApr })),
}));

export const useChainsApr = () => {
  return useChainsAprStore((store) => store.chainsApr);
};
