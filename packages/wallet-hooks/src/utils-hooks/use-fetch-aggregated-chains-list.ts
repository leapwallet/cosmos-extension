import { ChainInfos, ChainWiseFeatureFlags, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { useQuery } from '@tanstack/react-query';
import semver from 'semver';

import { useAggregatedChainsListStore } from '../store';
import { useChainFeatureFlags, useFetchChainFeatureFlags } from '../store/useChainFeatureFlags';

async function getAggregatedChainsList(
  chainFeatureFlags: ChainWiseFeatureFlags,
  app: 'extension' | 'mobile',
  version: string,
): Promise<SupportedChain[]> {
  try {
    const chainsArray: SupportedChain[] = [];

    Object.keys(chainFeatureFlags).forEach((chain) => {
      const chainEnabledOnVersion =
        app === 'extension'
          ? chainFeatureFlags[chain]?.aggregated_chains?.extVersion
          : chainFeatureFlags[chain]?.aggregated_chains?.appVersion;
      if (!!chainEnabledOnVersion && semver.satisfies(version, chainEnabledOnVersion)) {
        const chainKeys = Object.keys(ChainInfos) as SupportedChain[];
        if (chainKeys.includes(chain as SupportedChain)) {
          chainsArray.push(chain as SupportedChain);
          return;
        }
        const chainKey = chainKeys.find(
          (key) => ChainInfos[key].chainId === chain || ChainInfos[key].testnetChainId === chain,
        );
        if (chainKey) {
          chainsArray.push(chainKey as SupportedChain);
        }
      }
    });

    return chainsArray;
  } catch (error) {
    console.error('Error fetching aggregated chains list', error);
    return [];
  }
}

export async function useFetchAggregatedChainsList(app: 'extension' | 'mobile', version: string) {
  const { setAggregatedChains } = useAggregatedChainsListStore();
  useFetchChainFeatureFlags();
  const chainFeatureFlags = useChainFeatureFlags();

  useQuery(['fetch-aggregated-chains-list', app, version, chainFeatureFlags], async () => {
    if (!chainFeatureFlags || Object.keys(chainFeatureFlags).length === 0) {
      return;
    }
    const aggregatedChains = await getAggregatedChainsList(chainFeatureFlags, app, version);
    setAggregatedChains(aggregatedChains);
  });
}
