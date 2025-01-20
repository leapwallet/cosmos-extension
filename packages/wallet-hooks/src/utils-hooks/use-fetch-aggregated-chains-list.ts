import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { StorageAdapter } from '@leapwallet/cosmos-wallet-store';
import { useQuery } from '@tanstack/react-query';
import semver from 'semver';

import { useAggregatedChainsListStore } from '../store';
import { cachedRemoteDataWithLastModified, useGetStorageLayer } from '../utils';

type AggregatedChainsFeatureFlagV2 = {
  chains: Partial<Record<SupportedChain, { extVersion: string; appVersion: string }>>;
};

const aggregatedChainsUrl = 'https://assets.leapwallet.io/cosmos-registry/v1/config/aggregated-chains-v2.json';

async function fetchAggregatedChainsList(
  storage: StorageAdapter,
  app: 'extension' | 'mobile',
  version: string,
): Promise<SupportedChain[]> {
  try {
    const response = await cachedRemoteDataWithLastModified<AggregatedChainsFeatureFlagV2>({
      remoteUrl: aggregatedChainsUrl,
      storageKey: `aggregated-chains-${app}`,
      storage,
    });
    const chains = response.chains;
    const chainsArray: SupportedChain[] = [];

    Object.keys(chains).forEach((chain) => {
      const chainEnabledOnVersion =
        app === 'extension' ? chains[chain as SupportedChain]?.extVersion : chains[chain as SupportedChain]?.appVersion;
      if (!!chainEnabledOnVersion && semver.satisfies(version, chainEnabledOnVersion)) {
        chainsArray.push(chain as SupportedChain);
      }
    });

    return chainsArray;
  } catch (error) {
    console.error('Error fetching aggregated chains list', error);
    return [];
  }
}

export async function useFetchAggregatedChainsList(app: 'extension' | 'mobile', version: string) {
  const storage = useGetStorageLayer();
  const { setAggregatedChains } = useAggregatedChainsListStore();

  useQuery(['fetch-aggregated-chains-list', app, version], async () => {
    const aggregatedChains = await fetchAggregatedChainsList(storage, app, version);
    setAggregatedChains(aggregatedChains);
  });
}
