import { useQuery } from '@tanstack/react-query';

import { storage, useGetStorageLayer } from '../utils';
import { cachedRemoteDataWithLastModified } from '../utils/cached-remote-data';

export type FeatureFlags = {
  all_chains: {
    swap: 'active' | 'redirect' | 'disabled';
  };
};

export function getFeatureFlags(storage: storage): Promise<FeatureFlags> {
  return cachedRemoteDataWithLastModified({
    remoteUrl: 'https://assets.leapwallet.io/cosmos-registry/v1/config/feature-flags-v1.json',
    storageKey: 'feature-flag-v1',
    storage,
  });
}

export function useFeatureFlags() {
  const storage = useGetStorageLayer();

  return useQuery<FeatureFlags>(['query-feature-flag-v1'], () => getFeatureFlags(storage), { retry: 2 });
}
