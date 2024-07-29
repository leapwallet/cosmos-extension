import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { storage, useGetStorageLayer } from '../utils';
import { cachedRemoteDataWithLastModified } from './cached-remote-data';

export type LSProvider = {
  name: string;
  apy: number;
  image: string;
  url: string;
  priority?: number;
};

export type LiquidStakingProviders = {
  [key: string]: LSProvider[];
};

export function getLiquidStakingProviders(storage: storage): Promise<LiquidStakingProviders> {
  return cachedRemoteDataWithLastModified({
    remoteUrl: 'https://assets.leapwallet.io/cosmos-registry/v1/config/liquid-staking-providers.json',
    storageKey: 'ls-providers',
    storage,
  });
}

export function useLiquidStakingProviders() {
  const storage = useGetStorageLayer();

  const queryRes = useQuery<LiquidStakingProviders>(['ls-providers-list'], () => getLiquidStakingProviders(storage), {
    retry: 2,
  });

  const data = useMemo(() => {
    return queryRes?.data ?? {};
  }, [queryRes?.data]);

  return {
    ...queryRes,
    data,
  };
}
