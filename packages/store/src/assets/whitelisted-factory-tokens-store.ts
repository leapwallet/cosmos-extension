import { makeAutoObservable } from 'mobx';

import { StorageAdapter } from '../types/storage-adapter.type';
import { cachedRemoteDataWithLastModified } from '../utils/cached-remote-data';
const url = 'https://assets.leapwallet.io/cosmos-registry/v1/denoms/whitelist-factory.json';

export class WhitelistedFactoryTokensStore {
  storageAdapter: StorageAdapter;
  whitelistedFactoryTokens: Record<string, boolean>;
  readyPromise: Promise<void>;
  constructor(storageAdapter: StorageAdapter) {
    this.whitelistedFactoryTokens = {};
    this.storageAdapter = storageAdapter;
    makeAutoObservable(this);
    this.readyPromise = this.init();
  }

  async init() {
    const data = await cachedRemoteDataWithLastModified<Record<string, boolean>>({
      remoteUrl: url,
      storageKey: 'whitelisted-factory-tokens',
      storage: this.storageAdapter,
    });
    this.whitelistedFactoryTokens = data;
  }

  get allWhitelistedFactoryTokens() {
    return this.whitelistedFactoryTokens;
  }
}
