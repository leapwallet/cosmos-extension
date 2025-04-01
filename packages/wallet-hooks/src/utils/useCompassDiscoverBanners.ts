import { useQuery } from '@tanstack/react-query';

import { cachedRemoteDataWithLastModified } from './cached-remote-data';
import { storage, useGetStorageLayer } from './global-vars';

export type CompassDiscoverBanner = {
  id: string;
  title: string;
  icon?: string;
  subtitle: string;
  category: string;
  url: string;
};

export function getCompassDiscoverBanners(storage: storage): Promise<CompassDiscoverBanner[]> {
  return cachedRemoteDataWithLastModified({
    remoteUrl: 'https://assets.leapwallet.io/cosmos-registry/v1/config/compass-discover-banners.json',
    storageKey: 'compass-discover-banners',
    storage,
  });
}

export function useCompassDiscoverBanners() {
  const storage = useGetStorageLayer();

  return useQuery<CompassDiscoverBanner[]>(['compass-discover-banner-list'], () => getCompassDiscoverBanners(storage), {
    retry: 2,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });
}
