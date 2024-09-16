import { DenomsRecord, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { computed, makeAutoObservable, makeObservable, observable, runInAction } from 'mobx';
import { computedFn } from 'mobx-utils';

import { ActiveChainStore } from '../../wallet';
import { CW20DenomChainsStore } from './cw20-denom-chains-store';

// async function getAutoFetchedCW20Chains() {
//   const res = await fetch('https://assets.leapwallet.io/cosmos-registry/v1/denoms/cw20-chains.json')
//   const data = await res.json()
//   return data
// }
//
// const autoFetchedCW20Denoms = {}
//
// export async function fetchAutoCW20Denoms() {
//   const chains = await getAutoFetchedCW20Chains()
//
//   chains.forEach(async (chain: string) => {
//     try {
//       const url = `https://assets.leapwallet.io/cosmos-registry/v1/denoms/${chain}/cw20_all.json`;
//       const response = await fetch(url);
//       const resource = await response.json();
//       Object.assign(autoFetchedCW20Denoms, {
//         [chain]: resource,
//       });
//
//     } catch (e) {
//       console.error('error loading cw20 denoms', e);
//     }
//   });
// }
//
// export function getAutoCW20Denoms() {
//   return autoFetchedCW20Denoms
// }

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
        const resource = await response.json();

        // const betaCW20DenomsJson = await this.storageAdapter.get(BETA_CW20_TOKENS);
        //
        // if (betaCW20DenomsJson) {
        //   const betaCW20Denoms = JSON.parse(betaCW20DenomsJson);
        //   let allBetaCW20Denoms = {};
        //   for (const chain in betaCW20Denoms) {
        //     for (const coinMinimalDenom in betaCW20Denoms[chain]) {
        //       if (resource[coinMinimalDenom]) {
        //         delete betaCW20Denoms[chain][coinMinimalDenom];
        //       }
        //     }
        //     Object.assign(allBetaCW20Denoms, betaCW20Denoms[chain]);
        //   }
        //
        //   await this.storageAdapter.set(BETA_CW20_TOKENS, betaCW20Denoms);
        // }
        runInAction(() => {
          this.chainWiseDenoms = Object.assign(this.chainWiseDenoms, {
            [chain]: resource,
          });
        });
      } catch (e) {
        console.error('error loading cw20 denoms', e);
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

    // const _allAutoFetchedCW20Denoms = Object.values(autoFetchedCW20Denoms).reduce((acc, val) => {
    //   return Object.assign(acc, val);
    // }, {});
    return _allAutoFetchedCW20Denoms;
  }
}
