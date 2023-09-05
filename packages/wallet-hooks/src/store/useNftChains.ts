import { NftChain } from 'types';
import create from 'zustand';

type NftChains = {
  nftChains: NftChain[] | null;
  setNftChains: (nftChains: NftChain[] | null) => void;
};

export const useNftChainsStore = create<NftChains>((set) => ({
  nftChains: null,
  setNftChains: (nftChains) => set(() => ({ nftChains })),
}));

export const useNftChains = () => {
  return useNftChainsStore((store) => store.nftChains) ?? [];
};
