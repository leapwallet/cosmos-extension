import { useQuery } from '@tanstack/react-query';

import { cachedRemoteDataWithLastModified } from './cached-remote-data';
import { storage, useGetStorageLayer } from './global-vars';

export type DiscoverCollection = {
  name: string;
  url: string;
  icon?: string;
  trending?: boolean;
};

export type DiscoverDapp = {
  name: string;
  category: string;
  url: string;
  icon?: string;
  trending?: boolean;
};

export type CompassDiscoverAssets = {
  dapps: DiscoverDapp[];
  collections: DiscoverCollection[];
  trendingTokens: string[];
  topTokens: string[];
};

export function getCompassDiscoverAssets(storage: storage): Promise<CompassDiscoverAssets> {
  return cachedRemoteDataWithLastModified({
    remoteUrl: 'https://assets.leapwallet.io/cosmos-registry/v1/config/compass-discover-assets.json',
    storageKey: 'compass-discover-assets',
    storage,
  });
}

export function useCompassDiscoverAssets() {
  const storage = useGetStorageLayer();

  return useQuery<CompassDiscoverAssets>(['compass-discover-list'], () => getCompassDiscoverAssets(storage), {
    retry: 2,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });
}
