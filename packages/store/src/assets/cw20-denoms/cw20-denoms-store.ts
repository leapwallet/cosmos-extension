import { DenomsRecord, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { computed, makeObservable, observable, runInAction } from 'mobx';
import { computedFn } from 'mobx-utils';

import { ActiveChainStore } from '../../wallet';
import { CW20DenomChainsStore } from './cw20-denom-chains-store';

export class CW20DenomsStore {
  denoms: Record<string, DenomsRecord> = {};
  activeChainStore: ActiveChainStore;
  cw20DenomChainsStore: CW20DenomChainsStore;
  readyPromise: Promise<void>;

  constructor(activeChainStore: ActiveChainStore, cw20DenomChainsStore: CW20DenomChainsStore) {
    makeObservable(this, {
      denoms: observable,
      cw20Denoms: computed.struct,
    });
    this.activeChainStore = activeChainStore;
    this.cw20DenomChainsStore = cw20DenomChainsStore;
    this.readyPromise = this.initialize();
  }

  async initialize() {
    try {
      await Promise.all([this.activeChainStore.readyPromise, this.cw20DenomChainsStore.readyPromise]);
      await this.loadAllCW20Denoms();
    } catch (e) {
      console.error('[CW20DenomsStore]', `error initializing cw20 denoms`, e);
    }
  }

  async loadAllCW20Denoms() {
    const chains = this.cw20DenomChainsStore.cw20DenomChains;
    const fetchCW20DenomsPromises = chains.map(async (chain) => {
      try {
        const url = `https://assets.leapwallet.io/cosmos-registry/v1/denoms/${chain}/cw20.json`;
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          runInAction(() => {
            this.denoms[chain] = data;
          });
        } else {
          console.warn('[CW20DenomsStore]', `cw20.json not present for chain: ${chain}`);
        }
      } catch (e) {
        console.error('[CW20DenomsStore]', `error loading cw20 denoms for ${chain}`, e);
      }
    });
    await Promise.all(fetchCW20DenomsPromises);
  }

  get cw20Denoms(): DenomsRecord {
    const activeChain = this.activeChainStore.activeChain;
    return this.denoms[activeChain] || {};
  }

  getCW20DenomsForChain = computedFn((chain: SupportedChain): DenomsRecord => {
    return this.denoms?.[chain] || {};
  });
}
