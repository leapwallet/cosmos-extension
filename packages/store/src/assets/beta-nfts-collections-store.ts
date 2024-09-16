import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { makeAutoObservable, runInAction } from 'mobx';

import { BetaNftsCollectionsType, SelectedNetworkType } from '../types';

const BETA_NFTS_COLLECTIONS = 'beta-nfts-collections';

export class BetaNftsCollectionsStore {
  betaNftsCollections: BetaNftsCollectionsType = {};
  readyPromise: Promise<void>;
  storageAdapter: any;

  constructor(storageAdapter: any) {
    makeAutoObservable(this);

    this.storageAdapter = storageAdapter;
    this.readyPromise = this.loadBetaNftsCollections();
  }

  async loadBetaNftsCollections() {
    const betaNftsCollections = await this.storageAdapter.get(BETA_NFTS_COLLECTIONS);

    if (betaNftsCollections) {
      runInAction(() => {
        this.betaNftsCollections = JSON.parse(betaNftsCollections);
      });
    }
  }

  getBetaNftsCollections(chain: SupportedChain, network: SelectedNetworkType) {
    return this.betaNftsCollections[chain]?.[network] ?? [];
  }

  async setBetaNftsCollections(newBetaNftsCollections: BetaNftsCollectionsType) {
    runInAction(() => {
      this.betaNftsCollections = newBetaNftsCollections;
    });
    await this.storageAdapter.set(BETA_NFTS_COLLECTIONS, JSON.stringify(newBetaNftsCollections));
  }
}
