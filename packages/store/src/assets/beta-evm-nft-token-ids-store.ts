import { makeAutoObservable, runInAction } from 'mobx';

import { BetaEvmNftTokenIds } from '../types';

const BETA_EVM_NFT_TOKEN_IDS = 'beta-evm-nft-token-ids';

export class BetaEvmNftTokenIdsStore {
  betaEvmNftTokenIds: BetaEvmNftTokenIds = {};
  readyPromise: Promise<void>;
  storageAdapter: any;

  constructor(storageAdapter: any) {
    makeAutoObservable(this);

    this.storageAdapter = storageAdapter;
    this.readyPromise = this.loadBetaEvmNftTokenIds();
  }

  async loadBetaEvmNftTokenIds() {
    const betaEvmNftTokenIds = await this.storageAdapter.get(BETA_EVM_NFT_TOKEN_IDS);

    if (betaEvmNftTokenIds) {
      runInAction(() => {
        this.betaEvmNftTokenIds = JSON.parse(betaEvmNftTokenIds);
      });
    }
  }

  async setBetaEvmNftTokenIds(newBetaEvmNftTokenIds: BetaEvmNftTokenIds) {
    runInAction(() => {
      this.betaEvmNftTokenIds = newBetaEvmNftTokenIds;
    });
    await this.storageAdapter.set(BETA_EVM_NFT_TOKEN_IDS, JSON.stringify(newBetaEvmNftTokenIds));
  }
}
