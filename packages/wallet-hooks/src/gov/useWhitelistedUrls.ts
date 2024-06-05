import { useQuery } from '@tanstack/react-query';

import { storage, useGetStorageLayer } from '../utils';
import { cachedRemoteDataWithLastModified } from '../utils/cached-remote-data';

const WHITELIST_PROPOSALS_URL = 'https://assets.leapwallet.io/cosmos-registry/v1/proposals/white-list-urls.json';

export type WhitelistedUrls = Record<string, string[]>;

export function getWhitelistedUrls(storage: storage): Promise<WhitelistedUrls> {
  return cachedRemoteDataWithLastModified({
    remoteUrl: WHITELIST_PROPOSALS_URL,
    storageKey: 'white-list-urls-proposals',
    storage,
  });
}

export function useWhitelistedUrls() {
  const storage = useGetStorageLayer();

  return useQuery<WhitelistedUrls>(['query-white-list-urls-proposals'], () => getWhitelistedUrls(storage), {
    retry: 2,
  });
}
