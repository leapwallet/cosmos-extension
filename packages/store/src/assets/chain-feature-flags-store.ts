import { ChainWiseFeatureFlags, PopularChains, ZeroStateTokenPlaceholders } from '@leapwallet/cosmos-wallet-sdk';
import { makeObservable, observable, runInAction } from 'mobx';
import { StorageAdapter } from 'types';

import { cachedRemoteDataWithLastModified } from '../utils/cached-remote-data';

const chainFeatureFlagsUrl = 'https://assets.leapwallet.io/cosmos-registry/v1/config/chain-feature-flags.json';

type AggregatedChainsFeatureFlagV2 = {
  chains: ChainWiseFeatureFlags;
  zero_state_token_placeholders?: ZeroStateTokenPlaceholders;
  priority_chains?: PopularChains;
  deprioritized_chains?: PopularChains;
};

export class ChainFeatureFlagsStore {
  chainFeatureFlagsData: ChainWiseFeatureFlags = {};
  zeroStateTokenPlaceholders: ZeroStateTokenPlaceholders | undefined;
  popularChains: PopularChains | undefined;
  deprioritizedChains: PopularChains | undefined;
  readyPromise: Promise<void>;
  storageAdapter: StorageAdapter;
  app: 'extension' | 'mobile' = 'extension';
  version: string = '0.0.0';

  constructor(app: 'extension' | 'mobile', version: string, storageAdapter: StorageAdapter) {
    this.app = app;
    this.version = version;
    this.storageAdapter = storageAdapter;
    makeObservable(this, {
      chainFeatureFlagsData: observable.shallow,
    });
    this.readyPromise = this.loadChainFeatureFlagsData();
  }

  async loadChainFeatureFlagsData() {
    try {
      const response = await cachedRemoteDataWithLastModified<AggregatedChainsFeatureFlagV2>({
        remoteUrl: chainFeatureFlagsUrl,
        storageKey: `chain-feature-flags-${this.app}`,
        storage: this.storageAdapter,
      });
      const chainWiseFeatureFlags = response.chains;
      const zeroStateTokenPlaceholders = response.zero_state_token_placeholders;
      const popularChains = response.priority_chains;
      const deprioritizedChains = response.deprioritized_chains;

      runInAction(() => {
        this.chainFeatureFlagsData = chainWiseFeatureFlags;
        this.zeroStateTokenPlaceholders = zeroStateTokenPlaceholders;
        this.popularChains = popularChains;
        this.deprioritizedChains = deprioritizedChains;
      });
    } catch (error) {
      console.error('Error fetching aggregated chains list', error);
    }
  }
}
