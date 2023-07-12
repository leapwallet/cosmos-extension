import { useAddress, useDisabledNFTsCollectionsStore } from '../store';
import { getDisabledKeySetter } from './getDisabledKeySetter';
import { useGetStorageLayer } from './global-vars';
import { DISABLED_NFTS_COLLECTIONS } from './useInitDisabledNFTsCollections';

export function useSetDisabledNFTsInStorage() {
  const storage = useGetStorageLayer();
  const address = useAddress();
  const { setDisabledNFTsCollections, disabledNFTsCollections: storedDisabledNFTsCollections } =
    useDisabledNFTsCollectionsStore();

  const setDisabledNFTsInStorage = getDisabledKeySetter({
    setResource: (value) => setDisabledNFTsCollections(value),
    storage,
    objectKey: address,
    storageKey: DISABLED_NFTS_COLLECTIONS,
    defaultResourceData: storedDisabledNFTsCollections,
  });

  return setDisabledNFTsInStorage;
}
