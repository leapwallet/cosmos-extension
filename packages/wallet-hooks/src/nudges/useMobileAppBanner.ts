import { useQuery } from '@tanstack/react-query';

import { storage, useGetStorageLayer } from '../utils';
import { cachedRemoteDataWithLastModified } from '../utils/cached-remote-data';

export type MobileAppBanner = {
  img_src: string;
  visible: boolean;
};

export function getMobileAppBanner(storage: storage): Promise<MobileAppBanner> {
  return cachedRemoteDataWithLastModified({
    remoteUrl: 'https://assets.leapwallet.io/cosmos-registry/v1/nudges/mobile-app-banner.json',
    storageKey: 'mobile-app-banner',
    storage,
  });
}

export function useMobileAppBanner() {
  const storage = useGetStorageLayer();

  return useQuery<MobileAppBanner>(['query-mobile-app-banner'], () => getMobileAppBanner(storage), { retry: 2 });
}
