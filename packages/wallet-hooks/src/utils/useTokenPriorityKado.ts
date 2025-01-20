import { useQuery } from '@tanstack/react-query';

import { cachedRemoteDataWithLastModified } from './cached-remote-data';
import { storage, useGetStorageLayer } from './global-vars';

export type TokenPriority = {
  [key: string]: {
    [symbol: string]: number;
  };
};

export function getTokenPriority(storage: storage): Promise<TokenPriority> {
  return cachedRemoteDataWithLastModified({
    remoteUrl: 'https://assets.leapwallet.io/cosmos-registry/v1/kado/token-priority.json',
    storageKey: 'token-priority',
    storage,
  });
}

export function useTokenPriorityKado() {
  const storage = useGetStorageLayer();

  return useQuery<TokenPriority>(['token-priority-list'], () => getTokenPriority(storage), {
    retry: 2,
  });
}
