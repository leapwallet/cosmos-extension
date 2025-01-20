import { useEffect } from 'react';

import { useWhitelistedFactoryTokensStore } from '../store';
import { cachedRemoteDataWithLastModified } from '../utils/cached-remote-data';
import { storage, useGetStorageLayer } from '../utils/global-vars';

export function getWhitelistedFactoryTokens(storage: storage): Promise<Record<string, boolean>> {
  return cachedRemoteDataWithLastModified({
    remoteUrl: 'https://assets.leapwallet.io/cosmos-registry/v1/denoms/whitelist-factory.json',
    storageKey: 'whitelisted-factory-tokens',
    storage,
  });
}

export function useInitWhitelistedFactoryTokens() {
  const storage = useGetStorageLayer();
  const { setWhitelistedFactoryTokens } = useWhitelistedFactoryTokensStore();

  useEffect(() => {
    (async function initWhitelistedFactoryTokens() {
      const chainInfosConfig = await getWhitelistedFactoryTokens(storage);
      setWhitelistedFactoryTokens(chainInfosConfig);
    })();
  }, []);
}
