import { NativeDenom } from '@leapwallet/cosmos-wallet-sdk';
import { computed, makeObservable, observable, runInAction } from 'mobx';
import { StorageAdapter } from 'types';
import { ActiveChainStore } from 'wallet';

import { BETA_NATIVE_TOKENS } from './keys';

export class BetaNativeDenomsStore {
  denoms: Record<string, Record<string, NativeDenom>> = {};
  readyPromise: Promise<void>;
  storageAdapter: StorageAdapter;
  activeChainStore: ActiveChainStore;

  constructor(activeChainStore: ActiveChainStore, storageAdapter: any) {
    makeObservable(this, {
      denoms: observable,
      betaNativeDenoms: computed,
    });
    this.activeChainStore = activeChainStore;
    this.storageAdapter = storageAdapter;
    this.readyPromise = this.initialize();
  }

  async initialize() {
    await this.activeChainStore.readyPromise;
    await this.loadBetaNativeDenoms();
  }

  async loadBetaNativeDenoms() {
    const allBetaNativeDenomsJson = await this.storageAdapter.get(BETA_NATIVE_TOKENS);
    if (allBetaNativeDenomsJson) {
      runInAction(() => {
        this.denoms =
          typeof allBetaNativeDenomsJson === 'object' ? allBetaNativeDenomsJson : JSON.parse(allBetaNativeDenomsJson);
      });
    }
  }

  get betaNativeDenoms() {
    const activeChain = this.activeChainStore.activeChain;
    return this.denoms?.[activeChain] ?? [];
  }

  async setBetaNativeDenoms(coinMinimalDenom: string, value: NativeDenom, chain: string) {
    runInAction(() => {
      this.denoms = {
        ...this.denoms,
        [chain]: {
          ...(this.denoms[chain] ?? {}),
          [coinMinimalDenom]: value,
        },
      };
    });
    await this.storageAdapter.set(BETA_NATIVE_TOKENS, JSON.stringify(this.denoms));
  }

  async removeBetaNativeDenoms(coinMinimalDenom: string, chain: string) {
    if (this.denoms[chain]) {
      runInAction(() => {
        delete this.denoms[chain][coinMinimalDenom];
      });
    }
    await this.storageAdapter.set(BETA_NATIVE_TOKENS, JSON.stringify(this.denoms));
  }
}
