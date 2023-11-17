import { nativeFeeDenoms } from '@leapwallet/cosmos-wallet-sdk';
import { useEffect } from 'react';

import { useFeeDenomsStore } from '../store';
import { useGetStorageLayer } from './global-vars';
import { initResourceFromS3 } from './initResourceFromS3';

const FEE_DENOMS = 'fee-denoms';
const FEE_DENOMS_LAST_UPDATED_AT = 'fee-denoms-last-updated-at';

const FEE_DENOMS_URL = 'https://assets.leapwallet.io/cosmos-registry/v1/native-fee-denoms/fee-denoms.json';
const FEE_DENOMS_LAST_UPDATED_AT_URL =
  'https://assets.leapwallet.io/cosmos-registry/v1/native-fee-denoms/fee-denoms-last-updated-at.json';

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
