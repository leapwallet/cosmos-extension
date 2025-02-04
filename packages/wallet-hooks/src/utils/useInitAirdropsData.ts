import { initResourceFromS3 } from '@leapwallet/cosmos-wallet-sdk';
import { useEffect } from 'react';

import { useAirdropsDataStore } from '../store';
import { useGetStorageLayer } from './global-vars';

const AIRDROPS_DATA = 'airdrops-data';
const AIRDROPS_DATA_LAST_UPDATED_AT = 'airdrops-data-last-updated-at';

const AIRDROPS_DATA_URL = 'https://assets.leapwallet.io/cosmos-registry/v1/airdrops/airdrops-dashboard.json';
const AIRDROPS_DATA_LAST_UPDATED_AT_URL =
  'https://assets.leapwallet.io/cosmos-registry/v1/airdrops/airdrops-dashboard-last-updated-at.json';

export function useInitAirdropsData() {
  const storage = useGetStorageLayer();
  const { setAirdropsData } = useAirdropsDataStore();

  useEffect(() => {
    initResourceFromS3({
      storage,
      setResource: setAirdropsData,
      resourceKey: AIRDROPS_DATA,
      resourceURL: AIRDROPS_DATA_URL,
      lastUpdatedAtKey: AIRDROPS_DATA_LAST_UPDATED_AT,
      lastUpdatedAtURL: AIRDROPS_DATA_LAST_UPDATED_AT_URL,
    });
  }, []);
}
