import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { useEffect } from 'react';

import { useKadoBuyChainsStore } from '../store';
import { cachedRemoteDataWithLastModified } from '../utils/cached-remote-data';
import { getPlatformType, storage, useGetStorageLayer } from '../utils/global-vars';

export type KadoBuyChainsConfigType = {
  Extension: SupportedChain[];
  Mobile: SupportedChain[];
  Dashboard: SupportedChain[];
};

export function getKadoBuyChains(storage: storage): Promise<KadoBuyChainsConfigType> {
  return cachedRemoteDataWithLastModified({
    remoteUrl: 'https://assets.leapwallet.io/cosmos-registry/v1/config/kado-buy-chains.json',
    storageKey: 'kado-buy-chains',
    storage,
  });
}

export function useInitKadoBuyChains() {
  const storage = useGetStorageLayer();
  const platformType = getPlatformType();
  const { setKadoBuyChains } = useKadoBuyChainsStore();

  useEffect(() => {
    (async function initKadoBuyChains() {
      const kadoBuyChains = await getKadoBuyChains(storage);
      setKadoBuyChains(kadoBuyChains[platformType]);
    })();
  }, []);
}
