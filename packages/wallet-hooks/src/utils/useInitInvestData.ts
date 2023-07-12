import { useEffect } from 'react';

import { useInvestDataStore } from '../store';
import { useGetStorageLayer } from './global-vars';
import { initResourceFromS3 } from './initResourceFromS3';

const INVEST_DATA = 'invest-data';
const INVEST_DATA_LAST_UPDATED_AT = 'invest-data-last-updated-at';

const INVEST_DATA_URL = 'https://assets.leapwallet.io/cosmos-registry/v1/invest/main.json';
const INVEST_DATA_LAST_UPDATED_AT_URL =
  'https://assets.leapwallet.io/cosmos-registry/v1/invest/main-last-updated-at.json';

const defaultResourceData = { status: 'error', error: new Error('Failed to load invest data') };

export function useInitInvestData() {
  const storage = useGetStorageLayer();
  const { setInvestData } = useInvestDataStore();

  useEffect(() => {
    initResourceFromS3({
      storage,
      setResource: setInvestData,
      resourceKey: INVEST_DATA,
      resourceURL: INVEST_DATA_URL,
      lastUpdatedAtKey: INVEST_DATA_LAST_UPDATED_AT,
      lastUpdatedAtURL: INVEST_DATA_LAST_UPDATED_AT_URL,
      defaultResourceData,
      transformResourceData: (data) => {
        return {
          status: 'success',
          data,
        };
      },
    });
  }, []);
}
