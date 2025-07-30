import { useQuery } from '@tanstack/react-query';

import { cachedRemoteDataWithLastModified } from './cached-remote-data';
import { storage, useGetStorageLayer } from './global-vars';

export type PopularAsset = {
  symbol: string;
  origin: string;
  id: string;
};

export function getPopularTokens(storage: storage): Promise<PopularAsset[]> {
  return cachedRemoteDataWithLastModified({
    remoteUrl: 'https://assets.leapwallet.io/cosmos-registry/v1/onramper/popular-tokens.json',
    storageKey: 'popular-tokens',
    storage,
  });
}

export function usePopularTokensOnramper() {
  const storage = useGetStorageLayer();

  return useQuery<PopularAsset[]>(['popular-tokens'], () => getPopularTokens(storage), {
    retry: 2,
  });
}
