import { DenomsRecord } from '@leapwallet/cosmos-wallet-sdk';
import { makeObservable, observable } from 'mobx';

import { ActiveChainStore } from '../wallet';

export class Erc404DenomsStore {
  denoms: Record<string, DenomsRecord> = {};
  activeChainStore: ActiveChainStore;
  readyPromise: Promise<void>;

  constructor(activeChainStore: ActiveChainStore) {
    makeObservable({
      denoms: observable.shallow,
    });

    this.activeChainStore = activeChainStore;
    this.readyPromise = this.initialize();
  }

  async initialize() {
    await Promise.all([this.activeChainStore.readyPromise]);
    await this.loadErc404Denoms();
  }

  async loadErc404Denoms() {
    const chains = ['seiDevnet', 'seiTestnet2'];

    const fetchErc404DenomsPromises = chains.map(async (chain) => {
      if (!this.activeChainStore.isSeiEvm(chain)) {
        return null;
      }

      try {
        const url = `https://assets.leapwallet.io/cosmos-registry/v1/denoms/${chain}/erc404.json`;
        const response = await fetch(url);
        const data = await response.json();
        this.denoms[chain] = data;
      } catch (e) {
        console.error('error loading erc404 denoms', e);
      }
    });

    await Promise.all(fetchErc404DenomsPromises);
  }
}
