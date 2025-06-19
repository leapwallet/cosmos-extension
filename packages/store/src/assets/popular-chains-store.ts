import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { makeObservable, observable, runInAction } from 'mobx';
import semver from 'semver';

import { ChainFeatureFlagsStore } from './chain-feature-flags-store';

export class PopularChainsStore {
  app: 'extension' | 'mobile' = 'extension';
  version: string = '0.0.0';
  popularChains: SupportedChain[] = [];
  deprioritizedChains: SupportedChain[] = [];
  readyPromise: Promise<void>;

  constructor(app: 'extension' | 'mobile', version: string, private chainFeatureFlagsStore: ChainFeatureFlagsStore) {
    this.app = app;
    this.version = version;
    makeObservable(this, {
      popularChains: observable,
      deprioritizedChains: observable,
    });
    this.readyPromise = this.initialize();
  }

  async initialize() {
    await this.chainFeatureFlagsStore.readyPromise;
    let _popularChains: string[] = [];
    let _deprioritizedChains: string[] = [];
    const allPopularChains = this.chainFeatureFlagsStore?.popularChains;
    const allDeprioritizedChains = this.chainFeatureFlagsStore?.deprioritizedChains;

    if (!allPopularChains) {
      _popularChains = [];
    } else {
      _popularChains = allPopularChains
        ?.filter((chain) => {
          const enabledOn = this.app === 'extension' ? chain.extVersion : chain.appVersion;
          if (!enabledOn) {
            return false;
          }
          return semver.satisfies(this.version, enabledOn);
        })
        .map((chain) => chain.chain);
    }

    if (!allDeprioritizedChains) {
      _deprioritizedChains = [];
    } else {
      _deprioritizedChains = allDeprioritizedChains
        ?.filter((chain) => {
          const enabledOn = this.app === 'extension' ? chain.extVersion : chain.appVersion;
          if (!enabledOn) {
            return false;
          }
          return semver.satisfies(this.version, enabledOn);
        })
        .map((chain) => chain.chain);
    }

    runInAction(() => {
      this.popularChains = _popularChains as SupportedChain[];
      this.deprioritizedChains = _deprioritizedChains as SupportedChain[];
    });
  }
}
