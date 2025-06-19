import { ChainWiseFeatureFlags } from '@leapwallet/cosmos-wallet-sdk';
import { StorageAdapter } from '@leapwallet/cosmos-wallet-store';
import { useEffect } from 'react';
import create from 'zustand';

import { cachedRemoteDataWithLastModified, getStorageLayer } from '../utils';

const chainFeatureFlagsUrl = 'https://assets.leapwallet.io/cosmos-registry/v1/config/chain-feature-flags.json';

type ChainFeatureFlagsState = {
  chainFeatureFlags: ChainWiseFeatureFlags;
  setChainFeatureFlags: (chainFeatureFlags: ChainWiseFeatureFlags) => void;
  fetchChainFeatureFlags: (storage: StorageAdapter, app: 'extension' | 'mobile') => Promise<ChainWiseFeatureFlags>;
};

export const useChainFeatureFlagsStore = create<ChainFeatureFlagsState>((set) => ({
  chainFeatureFlags: {},
  setChainFeatureFlags: (chainFeatureFlags) => set({ chainFeatureFlags }),
  fetchChainFeatureFlags: async (storage: StorageAdapter, app: 'extension' | 'mobile') => {
    try {
      const response = await cachedRemoteDataWithLastModified<{
        chains: ChainWiseFeatureFlags;
      }>({
        remoteUrl: chainFeatureFlagsUrl,
        storageKey: `chain-feature-flags-${app}`,
        storage,
      });
      const chainWiseFeatureFlags = response.chains;
      return chainWiseFeatureFlags;
    } catch (error) {
      console.error('Error fetching chain feature flags', error);
      return {};
    }
  },
}));

export const useChainFeatureFlags = (): ChainWiseFeatureFlags => {
  return useChainFeatureFlagsStore((state) => state.chainFeatureFlags);
};

export const useFetchChainFeatureFlags = () => {
  const storage = getStorageLayer();

  const fetchChainFeatureFlags = useChainFeatureFlagsStore((state) => state.fetchChainFeatureFlags);
  const setChainFeatureFlags = useChainFeatureFlagsStore((state) => state.setChainFeatureFlags);

  useEffect(() => {
    if (!storage) return;

    (async () => {
      const chainFeatureFlags = await fetchChainFeatureFlags(storage, 'extension');
      setChainFeatureFlags(chainFeatureFlags);
    })();
  }, [storage]);
};
