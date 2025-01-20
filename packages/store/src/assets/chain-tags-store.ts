import { axiosWrapper } from '@leapwallet/cosmos-wallet-sdk';
import { makeAutoObservable, runInAction } from 'mobx';
import { StorageAdapter } from 'types';

const CHAIN_TAGS_S3_URL = 'https://assets.leapwallet.io/cosmos-registry/v1/config/chain-tags.json';
const BETA_CHAIN_TAGS = 'beta-chain-tags';

export class ChainTagsStore {
  chainTagsFromS3: Record<string, string[]> = {};
  chainTagsFromBeta: Record<string, string[]> = {};
  uniqueTags: string[] = [];
  storageAdapter: StorageAdapter;
  readyPromise: Promise<void>;

  constructor(storageAdapter: StorageAdapter) {
    this.storageAdapter = storageAdapter;
    makeAutoObservable(this);
    this.readyPromise = this.initialize();
  }

  get allChainTags(): Record<string, string[]> {
    const tags = {};
    Object.assign(tags, this.chainTagsFromBeta);
    Object.assign(tags, this.chainTagsFromS3);
    return tags;
  }

  async initialize() {
    await Promise.allSettled([this.loadChainTagsFromS3(), this.loadBetaChainTags()]);
  }

  async loadChainTagsFromS3() {
    try {
      const { data } = await axiosWrapper({ baseURL: CHAIN_TAGS_S3_URL, method: 'get' });
      runInAction(() => {
        this.chainTagsFromS3 = {
          'initiation-2': ['Initia'],
          'landlord-2': ['Initia'],
          'glados-2.1': ['Initia'],
          'minimove-2': ['Initia'],
          'miniwasm-2': ['Initia'],
          ...data.chainWiseMapping,
        };
        this.uniqueTags = data.allTags;
      });
    } catch (error) {
      console.error('Error loading chain tags:', error);
    }
  }

  async loadBetaChainTags() {
    try {
      const allBetaChainTagsJson = await this.storageAdapter.get(BETA_CHAIN_TAGS);
      if (allBetaChainTagsJson) {
        runInAction(() => {
          this.chainTagsFromBeta =
            typeof allBetaChainTagsJson === 'object' ? allBetaChainTagsJson : JSON.parse(allBetaChainTagsJson);
        });
      }
    } catch (error) {
      console.error('Error loading beta chain tags:', error);
    }
  }

  async setBetaChainTags(chain: string, tags: string[]) {
    try {
      runInAction(() => {
        this.chainTagsFromBeta[chain] = tags;
      });
      await this.storageAdapter.set(BETA_CHAIN_TAGS, JSON.stringify(this.chainTagsFromBeta));
    } catch (error) {
      console.error('Error setting beta chain tags:', error);
    }
  }

  async removeBetaChainTags(chain: string) {
    try {
      runInAction(() => {
        delete this.chainTagsFromBeta[chain];
      });
      await this.storageAdapter.set(BETA_CHAIN_TAGS, JSON.stringify(this.chainTagsFromBeta));
    } catch (error) {
      console.error('Error removing beta chain tags:', error);
    }
  }
}
