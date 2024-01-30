import { gasAdjustments } from '@leapwallet/cosmos-wallet-sdk';
import { useEffect } from 'react';

import { useGasAdjustmentsStore } from '../store';
import { useGetStorageLayer } from './global-vars';
import { initResourceFromS3 } from './initResourceFromS3';

const GAS_ADJUSTMENTS = 'gas-adjustments';
const GAS_ADJUSTMENTS_LAST_UPDATED_AT = 'gas-adjustments-last-updated-at';

const GAS_ADJUSTMENTS_URL = 'https://assets.leapwallet.io/cosmos-registry/v1/gas/gas-adjustments.json';
const GAS_ADJUSTMENTS_LAST_UPDATED_AT_URL =
  'https://assets.leapwallet.io/cosmos-registry/v1/gas/gas-adjustments-last-updated-at.json';

export function useInitGasAdjustments() {
  const storage = useGetStorageLayer();
  const { setGasAdjustments } = useGasAdjustmentsStore();

  useEffect(() => {
    initResourceFromS3({
      storage,
      setResource: setGasAdjustments,
      resourceKey: GAS_ADJUSTMENTS,
      resourceURL: GAS_ADJUSTMENTS_URL,
      lastUpdatedAtKey: GAS_ADJUSTMENTS_LAST_UPDATED_AT,
      lastUpdatedAtURL: GAS_ADJUSTMENTS_LAST_UPDATED_AT_URL,
      defaultResourceData: gasAdjustments,
    });
  }, []);
}
