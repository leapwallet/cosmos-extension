import { defaultGasEstimates, initResourceFromS3 } from '@leapwallet/cosmos-wallet-sdk';
import { useEffect } from 'react';

import { useDefaultGasEstimatesStore } from '../store';
import { useGetStorageLayer } from './global-vars';

const DEFAULT_GAS_ESTIMATES = 'default-gas-estimates';
const DEFAULT_GAS_ESTIMATES_LAST_UPDATED_AT = 'default-gas-estimates-last-updated-at';

const DEFAULT_GAS_ESTIMATES_URL = 'https://assets.leapwallet.io/cosmos-registry/v1/gas/gas-estimates.json';
const DEFAULT_GAS_ESTIMATES_LAST_UPDATED_AT_URL =
  'https://assets.leapwallet.io/cosmos-registry/v1/gas/gas-estimates-last-updated-at.json';

/**
 * Please use `DefaultGasEstimatesStore` from `@leapwallet/cosmos-wallet-store` instead of this hook
 */
export function useInitDefaultGasEstimates() {
  const storage = useGetStorageLayer();
  const { setDefaultGasEstimates } = useDefaultGasEstimatesStore();

  useEffect(() => {
    initResourceFromS3({
      storage,
      setResource: setDefaultGasEstimates,
      resourceKey: DEFAULT_GAS_ESTIMATES,
      resourceURL: DEFAULT_GAS_ESTIMATES_URL,
      lastUpdatedAtKey: DEFAULT_GAS_ESTIMATES_LAST_UPDATED_AT,
      lastUpdatedAtURL: DEFAULT_GAS_ESTIMATES_LAST_UPDATED_AT_URL,
      defaultResourceData: defaultGasEstimates,
    });
  }, []);
}
