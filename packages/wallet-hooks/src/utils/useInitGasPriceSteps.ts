import { GAS_PRICE_STEPS as defaultGasPriceSteps, initResourceFromS3 } from '@leapwallet/cosmos-wallet-sdk';
import { useEffect } from 'react';

import { useGasPriceStepsStore } from '../store';
import { useGetStorageLayer } from './global-vars';

const GAS_PRICE_STEPS = 'gas-price-steps';
const GAS_PRICE_STEPS_LAST_UPDATED_AT = 'gas-price-steps-last-updated-at';

const GAS_PRICE_STEPS_URL = 'https://assets.leapwallet.io/cosmos-registry/v1/gas/gas-prices.json';
const GAS_PRICE_STEPS_LAST_UPDATED_AT_URL =
  'https://assets.leapwallet.io/cosmos-registry/v1/gas/gas-prices-last-updated-at.json';

export function useInitGasPriceSteps() {
  const storage = useGetStorageLayer();
  const { setGasPriceSteps } = useGasPriceStepsStore();

  useEffect(() => {
    initResourceFromS3({
      storage,
      setResource: setGasPriceSteps,
      resourceKey: GAS_PRICE_STEPS,
      resourceURL: GAS_PRICE_STEPS_URL,
      lastUpdatedAtKey: GAS_PRICE_STEPS_LAST_UPDATED_AT,
      lastUpdatedAtURL: GAS_PRICE_STEPS_LAST_UPDATED_AT_URL,
      defaultResourceData: defaultGasPriceSteps,
    });
  }, []);
}
