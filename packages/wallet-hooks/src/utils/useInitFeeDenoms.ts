import { initResourceFromS3, nativeFeeDenoms } from '@leapwallet/cosmos-wallet-sdk';
import { useEffect } from 'react';

import { useFeeDenomsStore } from '../store';
import { useGetStorageLayer } from './global-vars';

const FEE_DENOMS = 'fee-denoms';
const FEE_DENOMS_LAST_UPDATED_AT = 'fee-denoms-last-updated-at';

const FEE_DENOMS_URL = 'https://assets.leapwallet.io/cosmos-registry/v1/native-fee-denoms/fee-denoms.json';
const FEE_DENOMS_LAST_UPDATED_AT_URL =
  'https://assets.leapwallet.io/cosmos-registry/v1/native-fee-denoms/fee-denoms-last-updated-at.json';

/**
 * Please use `FeeDenomsStore` from `@leapwallet/cosmos-wallet-store` instead of this hook
 *
 * This can be remove once all the instance of `useFeeDenoms` are replaced with `FeeDenomsStore`
 */
export function useInitFeeDenoms() {
  const storage = useGetStorageLayer();
  const { setFeeDenoms } = useFeeDenomsStore();

  useEffect(() => {
    initResourceFromS3({
      storage,
      setResource: setFeeDenoms,
      resourceKey: FEE_DENOMS,
      resourceURL: FEE_DENOMS_URL,
      lastUpdatedAtKey: FEE_DENOMS_LAST_UPDATED_AT,
      lastUpdatedAtURL: FEE_DENOMS_LAST_UPDATED_AT_URL,
      defaultResourceData: nativeFeeDenoms,
    });
  }, []);
}
