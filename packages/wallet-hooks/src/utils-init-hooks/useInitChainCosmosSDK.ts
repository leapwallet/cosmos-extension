import { useEffect } from 'react';

import { useChainCosmosSDKStore } from '../store';
import { cachedRemoteDataWithLastModified } from '../utils/cached-remote-data';
import { storage, useGetStorageLayer } from '../utils/global-vars';

export type ChainCosmosSDK = {
  [chainId: string]: {
    cosmosSDK: string;
    dynamic_fee_market: boolean;
  };
};

export function getChainCosmosSDK(storage: storage): Promise<ChainCosmosSDK> {
  return cachedRemoteDataWithLastModified({
    remoteUrl: 'https://assets.leapwallet.io/cosmos-registry/v1/gov/chains-config.json',
    storageKey: 'chain-cosmos-sdk',
    storage,
  });
}

export function useInitChainCosmosSDK() {
  const storage = useGetStorageLayer();
  const { setChainCosmosSDK } = useChainCosmosSDKStore();

  useEffect(() => {
    (async function initChainCosmosSDK() {
      const chainCosmosSDK = await getChainCosmosSDK(storage);
      setChainCosmosSDK(chainCosmosSDK);
    })();
  }, []);
}
