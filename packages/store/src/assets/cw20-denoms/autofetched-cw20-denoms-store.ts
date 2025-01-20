import { DenomsRecord, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { computed, makeObservable, observable, runInAction } from 'mobx';
import { computedFn } from 'mobx-utils';

import { ActiveChainStore } from '../../wallet';
import { CW20DenomChainsStore } from './cw20-denom-chains-store';

export class AutoFetchedCW20DenomsStore {
  chainWiseDenoms: Record<string, DenomsRecord> = {};
  readyPromise: Promise<void>;
  cw20DenomChainsStore: CW20DenomChainsStore;
  activeChainStore: ActiveChainStore;
  storageAdapter: any;

  constructor(activeChainStore: ActiveChainStore, cw20DenomChainsStore: CW20DenomChainsStore, storageAdapter: any) {
    makeObservable({
      chainWiseDenoms: observable.shallow,
      allAutoFetchedCW20Denoms: computed.struct,
      autoFetchedCW20Denoms: computed.struct,
    });
    this.cw20DenomChainsStore = cw20DenomChainsStore;
    this.activeChainStore = activeChainStore;
    this.storageAdapter = storageAdapter;
    this.readyPromise = this.initialize();
  }

  async initialize() {
    await Promise.all([this.cw20DenomChainsStore.readyPromise, this.activeChainStore.readyPromise]);

    this.loadAutoFetchedCW20Denoms();
  }

  async loadAutoFetchedCW20Denoms() {
    const chains = this.cw20DenomChainsStore.cw20DenomChains;
    chains.forEach(async (chain) => {
      try {
        const url = `https://assets.leapwallet.io/cosmos-registry/v1/denoms/${chain}/cw20_all.json`;
        const response = await fetch(url);
        if (response.ok) {
          const resource = await response.json();
          runInAction(() => {
            this.chainWiseDenoms = Object.assign(this.chainWiseDenoms, {
              [chain]: resource,
            });
          });
        } else {
          console.warn('[AutoFetchedCW20DenomsStore]', `cw20_all.json not present for chain: ${chain}`);
        }
      } catch (e) {
        console.error('[AutoFetchedCW20DenomsStore]', `error loading cw20 denoms for ${chain}`, e);
      }
    });
  }

  get autoFetchedCW20Denoms() {
    const activeChain = this.activeChainStore.activeChain;
    return this.chainWiseDenoms[activeChain] || {};
  }

  getAutoFetchedCW20DenomsForChain = computedFn((chain: SupportedChain) => {
    return this.chainWiseDenoms?.[chain] || {};
  });

  get allAutoFetchedCW20Denoms() {
    const autoFetchedCW20Denoms = this.chainWiseDenoms;
    const _allAutoFetchedCW20Denoms = {};
    const values = Object.values(autoFetchedCW20Denoms);

    for (let i = 0; i < values.length; i++) {
      Object.assign(_allAutoFetchedCW20Denoms, values[i]);
    }

    return _allAutoFetchedCW20Denoms;
  }
}
