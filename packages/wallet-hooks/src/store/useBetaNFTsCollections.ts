import create from 'zustand';

import { useActiveChain } from './useActiveChain';

export type StoredBetaNftCollection = {
  name: string;
  address: string;
  image: string;
};

type BetaNFTsCollections = {
  betaNFTsCollections: { [chain: string]: { [network: string]: StoredBetaNftCollection[] } } | null;
  setBetaNFTsCollections: (
    betaNFTsCollections: { [chain: string]: { [network: string]: StoredBetaNftCollection[] } } | null,
  ) => void;
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
