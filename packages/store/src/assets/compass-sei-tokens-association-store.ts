import { makeAutoObservable, runInAction } from 'mobx';

import { StorageAdapter } from '../types';
import { cachedRemoteDataWithLastModified } from '../utils/cached-remote-data';

const COMPASS_TOKENS_ASSOCIATIONS_S3_URL =
  'https://assets.leapwallet.io/cosmos-registry/v1/config/compass-tokens-associations.json';

export const CACHED_COMPASS_SEI_TOKENS_ASSOCIATIONS_KEY = 'compass-sei-tokens-associations';

export class CompassSeiTokensAssociationStore {
  compassEvmToSeiMapping: Record<string, string> = {};
  compassSeiToEvmMapping: Record<string, string> = {};
  storageAdapter: StorageAdapter;
  readyPromise: Promise<void>;

  constructor(storageAdapter: StorageAdapter) {
    makeAutoObservable(this);
    this.storageAdapter = storageAdapter;
    this.readyPromise = this.initialize();
  }

  async initialize() {
    await this.loadCompassTokenTagsFromS3();
  }

  async loadCompassTokenTagsFromS3() {
    try {
      const data = await cachedRemoteDataWithLastModified<Record<string, string>>({
        remoteUrl: COMPASS_TOKENS_ASSOCIATIONS_S3_URL,
        storageKey: CACHED_COMPASS_SEI_TOKENS_ASSOCIATIONS_KEY,
        storage: this.storageAdapter,
      });
      runInAction(() => {
        this.compassEvmToSeiMapping = data;
        this.compassSeiToEvmMapping = Object.entries((data ?? {}) as Record<string, string>).reduce<
          Record<string, string>
        >((acc, [key, value]) => {
          acc[value] = key;
          return acc;
        }, {});
      });
    } catch (error) {
      console.error('Error loading chain tags:', error);
    }
  }
}
