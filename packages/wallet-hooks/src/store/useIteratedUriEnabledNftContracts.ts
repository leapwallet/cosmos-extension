import create from 'zustand';

type IteratedUriEnabledNftContracts = {
  iteratedUriEnabledNftContracts: string[];
  setIteratedUriEnabledNftContracts: (nftChains: string[]) => void;
};

export const useIteratedUriEnabledNftContractsStore = create<IteratedUriEnabledNftContracts>((set) => ({
  iteratedUriEnabledNftContracts: [],
  setIteratedUriEnabledNftContracts: (iteratedUriEnabledNftContracts) =>
    set(() => ({ iteratedUriEnabledNftContracts })),
}));

export const useIteratedUriEnabledNftContracts = () => {
  return useIteratedUriEnabledNftContractsStore((store) => store.iteratedUriEnabledNftContracts) ?? [];
};
