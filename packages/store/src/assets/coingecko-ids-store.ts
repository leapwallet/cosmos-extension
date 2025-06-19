import { makeAutoObservable, runInAction } from 'mobx';

import { StorageAdapter } from '../types';
import { cachedRemoteDataWithLastModified } from '../utils/cached-remote-data';

const COINGECKO_IDS_S3_URL = 'https://assets.leapwallet.io/cosmos-registry/v1/coingecko-ids/base.json';

export type CoingeckoIds = Record<string, string>;

export class CoingeckoIdsStore {
  coingeckoIdsFromS3: CoingeckoIds = {};

  storageAdapter: StorageAdapter;
  readyPromise: Promise<void>;

  constructor(storageAdapter: StorageAdapter) {
    this.storageAdapter = storageAdapter;
    makeAutoObservable(this);
    this.readyPromise = this.initialize();
  }

  async initialize() {
    await this.loadCoingeckoIdsFromS3();
  }

  async loadCoingeckoIdsFromS3() {
    try {
      const data = await cachedRemoteDataWithLastModified<CoingeckoIds>({
        remoteUrl: COINGECKO_IDS_S3_URL,
        storage: this.storageAdapter,
        storageKey: 'coingecko-ids',
      });
      runInAction(() => {
        this.coingeckoIdsFromS3 = data ?? {};
      });
    } catch (error) {
      console.error('Error loading coingecko ids:', error);
    }
  }
}
