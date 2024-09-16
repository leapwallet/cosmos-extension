import { makeAutoObservable, runInAction } from 'mobx';

import { NftChain } from '../types';
const BETA_NFT_CHAINS = 'beta-nft-chains';

export class BetaNftChainsStore {
  betaNftChains: NftChain[] = [];
  readyPromise: Promise<void>;
  storageAdapter: any;

  constructor(storageAdapter: any) {
    makeAutoObservable(this);

    this.storageAdapter = storageAdapter;
    this.readyPromise = this.loadBetaNftChains();
  }

  async loadBetaNftChains() {
    const betaNftChains = await this.storageAdapter.get(BETA_NFT_CHAINS);

    if (betaNftChains) {
      runInAction(() => {
        this.betaNftChains = JSON.parse(betaNftChains);
      });
    }
  }

  async setBetaNftChains(newBetaNftChains: NftChain[]) {
    runInAction(() => {
      this.betaNftChains = newBetaNftChains;
    });
    await this.storageAdapter.set(BETA_NFT_CHAINS, JSON.stringify(newBetaNftChains));
  }
}
