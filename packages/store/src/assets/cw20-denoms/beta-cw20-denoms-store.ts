import { NativeDenom, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { computed, makeObservable, observable, runInAction } from 'mobx';
import { computedFn } from 'mobx-utils';
import { StorageAdapter } from 'types';

import { ActiveChainStore } from '../../wallet';
import { BETA_CW20_TOKENS } from '../keys';

export class BetaCW20DenomsStore {
  denoms: Record<string, Record<string, NativeDenom>> = {};
  readyPromise: Promise<void>;
  storageAdapter: StorageAdapter;
  activeChainStore: ActiveChainStore;

  constructor(activeChainStore: ActiveChainStore, storageAdapter: any) {
    makeObservable(this, {
      denoms: observable,
      betaCW20Denoms: computed,
    });
    this.activeChainStore = activeChainStore;
    this.storageAdapter = storageAdapter;
    this.readyPromise = this.initialize();
  }

  async initialize() {
    await this.activeChainStore.readyPromise;
    await this.loadBetaCW20Denoms();
  }

  async loadBetaCW20Denoms() {
    const allBetaCW20DenomsJson = await this.storageAdapter.get(BETA_CW20_TOKENS);
    if (allBetaCW20DenomsJson) {
      runInAction(() => {
        this.denoms =
          typeof allBetaCW20DenomsJson === 'object' ? allBetaCW20DenomsJson : JSON.parse(allBetaCW20DenomsJson);
      });
    }
  }

  get betaCW20Denoms() {
    const activeChain = this.activeChainStore.activeChain;
    return this.denoms?.[activeChain] ?? [];
  }

  getBetaCW20DenomsForChain = computedFn((chain: SupportedChain) => {
    return this.denoms?.[chain] ?? {};
  });

  async setBetaCW20Denoms(coinMinimalDenom: string, value: NativeDenom, chain: string) {
    runInAction(() => {
      this.denoms = {
        ...this.denoms,
        [chain]: {
          ...(this.denoms[chain] ?? {}),
          [coinMinimalDenom]: value,
        },
      };
    });
    await this.storageAdapter.set(BETA_CW20_TOKENS, JSON.stringify(this.denoms));
  }

  async removeBetaCW20Denoms(coinMinimalDenom: string, chain: string) {
    if (this.denoms[chain]) {
      runInAction(() => {
        delete this.denoms[chain][coinMinimalDenom];
      });
    }
    await this.storageAdapter.set(BETA_CW20_TOKENS, JSON.stringify(this.denoms));
  }
}
