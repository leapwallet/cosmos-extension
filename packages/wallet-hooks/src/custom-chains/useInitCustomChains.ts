import { useEffect } from 'react';

import { useCustomChainsStore } from '../store';
import { cachedRemoteDataWithLastModified, CustomChainsType, storage, useGetStorageLayer } from '../utils';

const mainnetLink = 'https://assets.leapwallet.io/cosmos-registry/v1/chains/custom-chains.json';
const testnetLink = 'https://assets.leapwallet.io/cosmos-registry/v1/chains/custom-testnet-chains.json';
const evmMainnetLink = 'https://assets.leapwallet.io/cosmos-registry/v1/chains/custom-evm-chains.json';
const evmTestnetLink = 'https://assets.leapwallet.io/cosmos-registry/v1/chains/custom-evm-testnet-chains.json';

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

const getEvmMainnetChainStoreData = async (storage: storage): Promise<CustomChainsType[]> => {
  return cachedRemoteDataWithLastModified({
    remoteUrl: evmMainnetLink,
    storageKey: 'evm-mainnet-custom-chain',
    storage,
  });
};

const getEvmTestnetChainStoreData = async (storage: storage): Promise<CustomChainsType[]> => {
  return cachedRemoteDataWithLastModified({
    remoteUrl: evmTestnetLink,
    storageKey: 'evm-testnet-custom-chain',
    storage,
  });
};

export const useInitCustomChains = () => {
  const storage = useGetStorageLayer();
  const { setCustomChains } = useCustomChainsStore();

  useEffect(() => {
    (async () => {
      const promises = [
        getMainnetChainStoreData(storage),
        getTestnetChainStoreData(storage),
        getEvmMainnetChainStoreData(storage),
        getEvmTestnetChainStoreData(storage),
      ];
      const [_mainnetChainsResult, _testnetChainsResult, _evmMainnetChainsResult, _evmTestnetChainsResult] =
        await Promise.allSettled(promises);
      const _mainnetChains = _mainnetChainsResult.status === 'fulfilled' ? _mainnetChainsResult.value : [];
      const _testnetChains = _testnetChainsResult.status === 'fulfilled' ? _testnetChainsResult.value : [];
      const _evmMainnetChains = _evmMainnetChainsResult.status === 'fulfilled' ? _evmMainnetChainsResult.value : [];
      const _evmTestnetChains = _evmTestnetChainsResult.status === 'fulfilled' ? _evmTestnetChainsResult.value : [];
      setCustomChains([..._mainnetChains, ..._testnetChains, ..._evmMainnetChains, ..._evmTestnetChains]);
    })();
  }, []);
};
