import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { useQuery } from '@tanstack/react-query';

import { useAggregatedChainsListStore } from '../store';
import { cachedRemoteDataWithLastModified, storage, useGetStorageLayer } from '../utils';

function fetchAggregatedChainsList(storage: storage): Promise<SupportedChain[]> {
  return cachedRemoteDataWithLastModified({
    remoteUrl: 'https://assets.leapwallet.io/cosmos-registry/v1/config/aggregated-chains.json',
    storageKey: 'aggregated-chains-list',
    storage,
  });
}

export async function useFetchAggregatedChainsList() {
  const storage = useGetStorageLayer();
  const { setAggregatedChains } = useAggregatedChainsListStore();

  useQuery(['fetch-aggregated-chains-list'], async () => {
    const aggregatedChains = await fetchAggregatedChainsList(storage);
    setAggregatedChains(aggregatedChains);
  });
}
