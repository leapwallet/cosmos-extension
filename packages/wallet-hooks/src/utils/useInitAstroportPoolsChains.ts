import { useEffect } from 'react';

import { useAstroportPoolsChainsStore } from '../store';
import { useGetStorageLayer } from './global-vars';
import { initResourceFromS3 } from './initResourceFromS3';

const ASTROPORT_POOLS_CHAINS = 'astroport-pool-chains';
const ASTROPORT_POOLS_CHAINS_LAST_UPDATED_AT = 'astroport-pool-chains-last-updated-at';

const ASTROPORT_POOLS_CHAINS_URL = 'https://assets.leapwallet.io/cosmos-registry/v1/astroport/pool-chains.json';
const ASTROPORT_POOLS_CHAINS_LAST_UPDATED_AT_URL =
  'https://assets.leapwallet.io/cosmos-registry/v1/astroport/pool-chains-last-updated-at.json';

export function useInitAstroportPoolsChains() {
  const storage = useGetStorageLayer();
  const { setAstroportPoolsChains } = useAstroportPoolsChainsStore();

  useEffect(() => {
    initResourceFromS3({
      storage,
      setResource: setAstroportPoolsChains,
      resourceKey: ASTROPORT_POOLS_CHAINS,
      resourceURL: ASTROPORT_POOLS_CHAINS_URL,
      lastUpdatedAtKey: ASTROPORT_POOLS_CHAINS_LAST_UPDATED_AT,
      lastUpdatedAtURL: ASTROPORT_POOLS_CHAINS_LAST_UPDATED_AT_URL,
    });
  }, []);
}
