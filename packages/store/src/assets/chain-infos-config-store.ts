import { makeAutoObservable, runInAction } from 'mobx';

import { ChainInfosConfigType } from '../types';

const CHAIN_INFOS_CONFIG_S3_URL = 'https://assets.leapwallet.io/cosmos-registry/v1/config/chain-infos.json';

export class ChainInfosConfigStore {
  chainInfosConfig: ChainInfosConfigType | Record<string, never> = {};
  readyPromise: Promise<void>;

  constructor() {
    makeAutoObservable(this);
    this.readyPromise = this.loadChainInfosConfig();
  }

  // Add caching for chain infos config
  async loadChainInfosConfig() {
    const response = await fetch(CHAIN_INFOS_CONFIG_S3_URL);
    const data = await response.json();

    runInAction(() => {
      this.chainInfosConfig = data;
    });
  }
}
