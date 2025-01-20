import { ChainInfosConfigType } from '@leapwallet/cosmos-wallet-sdk';
import { useEffect } from 'react';

import { useChainInfosConfigStore } from '../store';
import { cachedRemoteDataWithLastModified } from '../utils/cached-remote-data';
import { storage, useGetStorageLayer } from '../utils/global-vars';

export function getChainInfosConfig(storage: storage): Promise<ChainInfosConfigType> {
  return cachedRemoteDataWithLastModified({
    remoteUrl: 'https://assets.leapwallet.io/cosmos-registry/v1/config/chain-infos.json',
    storageKey: 'chain-infos-config',
    storage,
  });
}

export function useInitChainInfosConfig() {
  const storage = useGetStorageLayer();
  const { setChainInfosConfig } = useChainInfosConfigStore();

  useEffect(() => {
    (async function initChainInfosConfig() {
      const chainInfosConfig = await getChainInfosConfig(storage);
      setChainInfosConfig(chainInfosConfig);
    })();
  }, []);
}
