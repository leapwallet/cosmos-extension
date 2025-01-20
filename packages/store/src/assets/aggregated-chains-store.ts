import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { makeObservable, observable, runInAction } from 'mobx';
import semver from 'semver';
import { StorageAdapter } from 'types';

import { cachedRemoteDataWithLastModified } from '../utils/cached-remote-data';

const aggregatedChainsUrl = 'https://assets.leapwallet.io/cosmos-registry/v1/config/aggregated-chains-v2.json';

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
  'flame',
  'unichain',
  'bitcoin',
];

type AggregatedChainsFeatureFlagV2 = {
  chains: Partial<Record<SupportedChain, { extVersion: string; appVersion: string }>>;
};

export class AggregatedChainsStore {
  aggregatedChainsData: Array<string> = INITIAL_AGGREGATED_CHAINS_DATA;
  readyPromise: Promise<void>;
  storageAdapter: StorageAdapter;
  app: 'extension' | 'mobile' = 'extension';
  version: string = '0.0.0';

  constructor(app: 'extension' | 'mobile', version: string, storageAdapter: StorageAdapter) {
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
      const response = await cachedRemoteDataWithLastModified<AggregatedChainsFeatureFlagV2>({
        remoteUrl: aggregatedChainsUrl,
        storageKey: `aggregated-chains-${this.app}`,
        storage: this.storageAdapter,
      });
      const chains = response.chains;
      const chainsArray: SupportedChain[] = [];

      Object.keys(chains).forEach((chain) => {
        const version =
          this.app === 'extension'
            ? chains[chain as SupportedChain]?.extVersion
            : chains[chain as SupportedChain]?.appVersion;
        if (!!version && semver.satisfies(this.version, version)) {
          chainsArray.push(chain as SupportedChain);
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
