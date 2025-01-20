import { DenomsRecord, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { makeObservable, observable, runInAction } from 'mobx';
import { computedFn } from 'mobx-utils';

import { ActiveChainStore } from '../../wallet';
import { ERC20DenomsChainsStore } from './erc20-denom-chains-store';

export class ERC20DenomsStore {
  denoms: Record<string, DenomsRecord> = {};
  activeChainStore: ActiveChainStore;
  erc20DenomChainsStore: ERC20DenomsChainsStore;
  readyPromise: Promise<void>;

  constructor(activeChainStore: ActiveChainStore, erc20DenomChainsStore: ERC20DenomsChainsStore) {
    makeObservable({
      denoms: observable.shallow,
    });
    this.activeChainStore = activeChainStore;
    this.erc20DenomChainsStore = erc20DenomChainsStore;
    this.readyPromise = this.initialize();
  }

  async initialize() {
    await Promise.all([this.activeChainStore.readyPromise, this.erc20DenomChainsStore.readyPromise]);
    await this.loadAllERC20Denoms();
  }

  async loadAllERC20Denoms() {
    const chains = this.erc20DenomChainsStore.chains;
    const fetchERC20DenomsPromises = chains.map(async (chain) => {
      try {
        const url = `https://assets.leapwallet.io/cosmos-registry/v1/denoms/${chain}/erc20.json`;
        const response = await fetch(url);
        const data = await response.json();
        runInAction(() => {
          this.denoms[chain] = data;
        });
      } catch (e) {
        console.error('error loading erc20 denoms', e);
      }
    });
    await Promise.all(fetchERC20DenomsPromises);
  }

  getERC20DenomsForChain = computedFn((chain: SupportedChain) => {
    return this.denoms[chain] || {};
  });

  get erc20Denoms(): DenomsRecord {
    const activeChain = this.activeChainStore.activeChain;
    return this.denoms[activeChain] || {};
  }
}
