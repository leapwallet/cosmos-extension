import { useQuery } from '@tanstack/react-query';

import { storage, useGetStorageLayer } from '../utils';
import { cachedRemoteDataWithLastModified } from '../utils/cached-remote-data';

export type TransactionConfigs = {
  allChains: {
    maxFeeValueUSD: number;
  };
};

export function getTransactionConfigs(storage: storage): Promise<TransactionConfigs> {
  return cachedRemoteDataWithLastModified({
    remoteUrl: 'https://assets.leapwallet.io/cosmos-registry/v1/config/transaction-configs.json',
    storageKey: 'transaction-configs',
    storage,
  });
}

/**
 * Please use `TransactionConfigsStore` from `@leapwallet/cosmos-wallet-store` instead.
 */
export function useTransactionConfigs() {
  const storage = useGetStorageLayer();

  return useQuery<TransactionConfigs>(['query-transaction-configs'], () => getTransactionConfigs(storage), {
    retry: 2,
  });
}
