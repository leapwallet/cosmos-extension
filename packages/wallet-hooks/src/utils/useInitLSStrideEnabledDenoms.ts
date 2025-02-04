import { initResourceFromS3 } from '@leapwallet/cosmos-wallet-sdk';
import { useEffect } from 'react';

import { useLSStrideEnabledDenomsStore } from '../store';
import { useGetStorageLayer } from './global-vars';

const LS_STRIDE_ENABLED_DENOMS = 'ls-stride-enabled-denoms';
const LS_STRIDE_ENABLED_DENOMS_LAST_UPDATED_AT = 'ls-stride-enabled-denoms-last-updated-at';

const LS_STRIDE_ENABLED_DENOMS_URL =
  'https://assets.leapwallet.io/cosmos-registry/v1/liquid-staking/stride/enabled-tokens.json';
const LS_STRIDE_ENABLED_DENOMS_LAST_UPDATED_AT_URL =
  'https://assets.leapwallet.io/cosmos-registry/v1/liquid-staking/stride/enabled-tokens-last-updated-at.json';

export function useInitLSStrideEnabledDenoms() {
  const storage = useGetStorageLayer();
  const { setLSStrideEnabledDenoms } = useLSStrideEnabledDenomsStore();

  useEffect(() => {
    initResourceFromS3({
      storage,
      setResource: setLSStrideEnabledDenoms,
      resourceKey: LS_STRIDE_ENABLED_DENOMS,
      resourceURL: LS_STRIDE_ENABLED_DENOMS_URL,
      lastUpdatedAtKey: LS_STRIDE_ENABLED_DENOMS_LAST_UPDATED_AT,
      lastUpdatedAtURL: LS_STRIDE_ENABLED_DENOMS_LAST_UPDATED_AT_URL,
    });
  }, []);
}
