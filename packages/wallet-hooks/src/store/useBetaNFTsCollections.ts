import create from 'zustand';

import { useActiveChain } from './useActiveChain';

type BetaNFTsCollections = {
  betaNFTsCollections: { [key: string]: string[] } | null;
  setBetaNFTsCollections: (betaNFTsCollections: { [key: string]: string[] } | null) => void;
};

export const useBetaNFTsCollectionsStore = create<BetaNFTsCollections>((set) => ({
  betaNFTsCollections: null,
  setBetaNFTsCollections: (betaNFTsCollections) => set(() => ({ betaNFTsCollections })),
}));

export const useBetaNFTsCollections = (forceChain?: string) => {
  const activeChain = useActiveChain();
  const { betaNFTsCollections } = useBetaNFTsCollectionsStore();
  return (betaNFTsCollections ?? {})[forceChain ?? activeChain] ?? [];
};
