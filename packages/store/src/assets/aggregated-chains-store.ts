import { ChainInfos, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { makeObservable, observable, runInAction } from 'mobx';
import semver from 'semver';
import { StorageAdapter } from 'types';

import { ChainFeatureFlagsStore } from './chain-feature-flags-store';

const INITIAL_AGGREGATED_CHAINS_DATA: SupportedChain[] = [
  'cosmos',
  'osmosis',
  'akash',
  'axelar',
  'stargaze',
  'umee',
  'kujira',
  'aura',
  'injective',
  'stride',
  'carbon',
  'archway',
  'migaloo',
  'neutron',
  'mainCoreum',
  'mantra',
  'seiTestnet2',
  'noble',
  'nibiru',
  'dydx',
  'celestia',
  'composable',
  'dymension',
  'saga',
  'omniflix',
  'cheqd',
  'lava',
  'bitsong',
  'ethereum',
  'forma',
  'arbitrum',
  'polygon',
  'base',
  'optimism',
  'blast',
  'manta',
  'lightlink',
  'unichain',
  'bitcoin',
  'solana',
];

export class AggregatedChainsStore {
  aggregatedChainsData: Array<string> = INITIAL_AGGREGATED_CHAINS_DATA;
  readyPromise: Promise<void>;
  storageAdapter: StorageAdapter;
  app: 'extension' | 'mobile' = 'extension';
  version: string = '0.0.0';

  constructor(
    app: 'extension' | 'mobile',
    version: string,
    storageAdapter: StorageAdapter,
    private chainFeatureFlagsStore: ChainFeatureFlagsStore,
  ) {
    this.app = app;
    this.version = version;
    this.storageAdapter = storageAdapter;
    makeObservable(this, {
      aggregatedChainsData: observable.shallow,
    });
    this.readyPromise = this.loadAggregatedChainsData();
  }

  async loadAggregatedChainsData() {
    try {
      await this.chainFeatureFlagsStore.readyPromise;
      const chainFeatureFlags = this.chainFeatureFlagsStore.chainFeatureFlagsData;
      if (!chainFeatureFlags) {
        return;
      }

      const chainsArray: SupportedChain[] = [];

      Object.keys(chainFeatureFlags).forEach((chain) => {
        const chainEnabledOnVersion =
          this.app === 'extension'
            ? chainFeatureFlags[chain]?.aggregated_chains?.extVersion
            : chainFeatureFlags[chain]?.aggregated_chains?.appVersion;
        if (!!chainEnabledOnVersion && semver.satisfies(this.version, chainEnabledOnVersion)) {
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

      runInAction(() => {
        this.aggregatedChainsData = chainsArray;
      });
    } catch (error) {
      console.error('Error fetching aggregated chains list', error);
    }
  }
}
