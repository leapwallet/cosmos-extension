import { DisableObject } from '@leapwallet/cosmos-wallet-store';
import create from 'zustand';

import { useAddress } from './useAddress';

type DisabledNFTsCollections = {
  disabledNFTsCollections: DisableObject | null;
  setDisabledNFTsCollections: (disabledNFTsCollections: DisableObject | null) => void;
};

export const useDisabledNFTsCollectionsStore = create<DisabledNFTsCollections>((set) => ({
  disabledNFTsCollections: null,
  setDisabledNFTsCollections: (disabledNFTsCollections) => set(() => ({ disabledNFTsCollections })),
}));

export const useDisabledNFTsCollections = () => {
  const address = useAddress();
  return useDisabledNFTsCollectionsStore((store) =>
    store.disabledNFTsCollections ? store.disabledNFTsCollections[address] ?? [] : [],
  );
};
