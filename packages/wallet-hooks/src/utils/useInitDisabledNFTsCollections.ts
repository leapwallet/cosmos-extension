import { useEffect } from 'react';

import { useDisabledNFTsCollectionsStore } from '../store';
import { useGetStorageLayer } from './global-vars';

export const DISABLED_NFTS_COLLECTIONS = 'disabled-nfts-collections';

export function useInitDisabledNFTsCollections() {
  const storage = useGetStorageLayer();
  const { setDisabledNFTsCollections } = useDisabledNFTsCollectionsStore();

  useEffect(() => {
    (async () => {
      const disabledNFTsCollections = await storage.get(DISABLED_NFTS_COLLECTIONS);
      if (disabledNFTsCollections) {
        const _disabledNFTsCollections = JSON.parse(disabledNFTsCollections);
        setDisabledNFTsCollections(_disabledNFTsCollections);
      } else {
        setDisabledNFTsCollections({});
      }
    })();
  }, []);
}
