import { useEffect } from 'react';

import { useEnabledNftsCollectionsStore } from '../store';
import { useGetStorageLayer } from '../utils';

export const ENABLED_NFTS_COLLECTIONS = 'enabled-nfts-collections';

export function useInitEnabledNftsCollections() {
  const storage = useGetStorageLayer();
  const { setEnabledNftsCollections } = useEnabledNftsCollectionsStore();

  useEffect(() => {
    (async () => {
      const storedEnabledNftsCollections = await storage.get(ENABLED_NFTS_COLLECTIONS);

      if (storedEnabledNftsCollections) {
        const storedObj = storedEnabledNftsCollections;
        const enabledNftsCollections = JSON.parse(storedObj);

        setEnabledNftsCollections(enabledNftsCollections);
      } else {
        setEnabledNftsCollections({});
      }
    })();
  }, []);
}
