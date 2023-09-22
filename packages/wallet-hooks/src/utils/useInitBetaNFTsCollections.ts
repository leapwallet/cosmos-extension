import { useEffect } from 'react';

import { useBetaNFTsCollectionsStore } from '../store';
import { useGetStorageLayer } from './global-vars';

export const BETA_NFTS_COLLECTIONS = 'beta-nfts-collections';

export function useInitBetaNFTsCollections() {
  const storage = useGetStorageLayer();
  const { setBetaNFTsCollections } = useBetaNFTsCollectionsStore();

  useEffect(() => {
    (async () => {
      const storedBetaNFTsCollections = await storage.get(BETA_NFTS_COLLECTIONS);

      if (storedBetaNFTsCollections) {
        const storedObj =
          typeof storedBetaNFTsCollections === 'string'
            ? storedBetaNFTsCollections
            : JSON.stringify(storedBetaNFTsCollections);
        const betaNFTsCollections = JSON.parse(storedObj);

        setBetaNFTsCollections(betaNFTsCollections);
      } else {
        setBetaNFTsCollections({});
      }
    })();
  }, []);
}
