import { useEffect } from 'react';

import { useCustomChainsStore } from '../store';
import { cachedRemoteDataWithLastModified, CustomChainsType, storage, useGetStorageLayer } from '../utils';

const mainnetLink = 'https://assets.leapwallet.io/cosmos-registry/v1/chains/custom-chains.json';
const testnetLink = 'https://assets.leapwallet.io/cosmos-registry/v1/chains/custom-testnet-chains.json';

const getMainnetChainStoreData = (storage: storage): Promise<CustomChainsType[]> => {
  return cachedRemoteDataWithLastModified({
    remoteUrl: mainnetLink,
    storageKey: 'mainnet-custom-chain',
    storage,
  });
};

const getTestnetChainStoreData = (storage: storage): Promise<CustomChainsType[]> => {
  return cachedRemoteDataWithLastModified({
    remoteUrl: testnetLink,
    storageKey: 'testnet-custom-chain',
    storage,
  });
};

export const useInitCustomChains = () => {
  const storage = useGetStorageLayer();
  const { setCustomChains } = useCustomChainsStore();

  useEffect(() => {
    (async () => {
      const _mainnetChains = await getMainnetChainStoreData(storage);
      const _testnetChains = await getTestnetChainStoreData(storage);
      setCustomChains([..._mainnetChains, ..._testnetChains]);
    })();
  }, []);
};
