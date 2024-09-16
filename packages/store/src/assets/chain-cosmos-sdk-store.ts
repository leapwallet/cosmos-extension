import { makeAutoObservable, runInAction } from 'mobx';

import { ChainInfoFromS3 } from '../types';

const CHAIN_COSMOS_SDK_S3_URL = 'https://assets.leapwallet.io/cosmos-registry/v1/gov/chains-config.json';

export class ChainCosmosSdkStore {
  chainCosmosSdk: ChainInfoFromS3 = {};
  readyPromise: Promise<void>;

  constructor() {
    makeAutoObservable(this);
    this.readyPromise = this.loadChainCosmosSdk();
  }

  // Add caching for chain cosmos sdk
  async loadChainCosmosSdk() {
    const response = await fetch(CHAIN_COSMOS_SDK_S3_URL);
    const data = await response.json();

    runInAction(() => {
      this.chainCosmosSdk = data;
    });
  }
}
