import { NativeDenom, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { computed, makeObservable, observable, runInAction } from 'mobx';
import { computedFn } from 'mobx-utils';

import { StorageAdapter } from '../../types';
import { ActiveChainStore } from '../../wallet';
import { BETA_ERC20_TOKENS } from '../keys';

export class BetaERC20DenomsStore {
  denoms: Record<string, Record<string, NativeDenom>> = {};
  readyPromise: Promise<void>;
  storageAdapter: StorageAdapter;
  activeChainStore: ActiveChainStore;

  constructor(activeChainStore: ActiveChainStore, storageAdapter: any) {
    makeObservable(this, {
      denoms: observable,
      betaERC20Denoms: computed,
    });
    this.activeChainStore = activeChainStore;
    this.storageAdapter = storageAdapter;
    this.readyPromise = this.initialize();
  }

  async initialize() {
    await this.activeChainStore.readyPromise;
    await this.loadBetaERC20Denoms();
  }

  async loadBetaERC20Denoms() {
    const allBetaERC20DenomsJson = await this.storageAdapter.get(BETA_ERC20_TOKENS);
    if (allBetaERC20DenomsJson) {
      runInAction(() => {
        this.denoms =
          typeof allBetaERC20DenomsJson === 'object' ? allBetaERC20DenomsJson : JSON.parse(allBetaERC20DenomsJson);
      });
    }
  }

  get betaERC20Denoms() {
    const activeChain = this.activeChainStore.activeChain;
    if (activeChain === 'aggregated') {
      return Object.values(this.denoms).reduce((acc, val) => ({ ...acc, ...val }), {});
    }

    return this.denoms?.[activeChain] ?? [];
  }

  getBetaERC20DenomsForChain = computedFn((chain: SupportedChain) => {
    return this.denoms?.[chain] ?? {};
  });

  async setBetaERC20Denoms(coinMinimalDenom: string, value: NativeDenom, chain: string) {
    runInAction(() => {
      this.denoms = {
        ...this.denoms,
        [chain]: {
          ...(this.denoms[chain] ?? {}),
          [coinMinimalDenom]: value,
        },
      };
    });
    await this.storageAdapter.set(BETA_ERC20_TOKENS, JSON.stringify(this.denoms));
  }

  setTempBetaERC20Denoms(tempDenoms: Record<string, any>, chain: string) {
    runInAction(() => {
      this.denoms = {
        ...this.denoms,
        [chain]: {
          ...(this.denoms[chain] ?? {}),
          ...tempDenoms,
        },
      };
    });
  }

  async removeBetaERC20Denoms(coinMinimalDenom: string, chain: string) {
    if (this.denoms[chain]) {
      runInAction(() => {
        delete this.denoms[chain][coinMinimalDenom];
      });
    }
    await this.storageAdapter.set(BETA_ERC20_TOKENS, JSON.stringify(this.denoms));
  }
}
