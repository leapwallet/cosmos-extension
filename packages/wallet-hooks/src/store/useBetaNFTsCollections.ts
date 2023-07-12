import create from 'zustand';

export const BETA_NFTS_COLLECTIONS = 'beta-nfts-collections';

type BetaNFTsCollections = {
  betaNFTsCollections: string[] | null;
  setBetaNFTsCollections: (betaNFTsCollections: string[] | null) => void;
};

export const useBetaNFTsCollectionsStore = create<BetaNFTsCollections>((set) => ({
  betaNFTsCollections: null,
  setBetaNFTsCollections: (betaNFTsCollections) => set(() => ({ betaNFTsCollections })),
}));

export const useBetaNFTsCollections = () => {
  const { betaNFTsCollections } = useBetaNFTsCollectionsStore();
  return betaNFTsCollections ?? [];
};
