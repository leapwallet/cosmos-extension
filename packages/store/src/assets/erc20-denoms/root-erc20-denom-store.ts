import { DenomsRecord } from '@leapwallet/cosmos-wallet-sdk';
import { computed, makeAutoObservable, observable, runInAction, toJS } from 'mobx';

import { BetaERC20DenomsStore } from './beta-erc20-denoms-store';
import { ERC20DenomsStore } from './erc20-denoms.store';

function combineValues(values: Array<DenomsRecord>) {
  const combinedValues = {};
  for (const value of values) {
    Object.assign(combinedValues, toJS(value));
  }

  return combinedValues;
}

export class RootERC20DenomsStore {
  erc20DenomsStore: ERC20DenomsStore;
  betaERC20DenomsStore: BetaERC20DenomsStore;
  tempERC20Denoms: Record<string, DenomsRecord> = {};

  constructor(erc20DenomsStore: ERC20DenomsStore, betaERC20DenomsStore: BetaERC20DenomsStore) {
    this.erc20DenomsStore = erc20DenomsStore;
    this.betaERC20DenomsStore = betaERC20DenomsStore;

    makeAutoObservable(this, {
      allERC20Denoms: computed,
      readyPromise: computed,
      tempERC20Denoms: observable,
    });
  }

  get allERC20Denoms() {
    const erc20DenomValues = combineValues(Object.values(this.erc20DenomsStore.denoms));
    const betaERC20DenomValues = combineValues(Object.values(this.betaERC20DenomsStore.denoms));
    const tempERC20DenomValues = combineValues(Object.values(this.tempERC20Denoms));

    const allDenoms = Object.assign(erc20DenomValues, betaERC20DenomValues, tempERC20DenomValues);
    return allDenoms;
  }

  get readyPromise() {
    return Promise.all([this.erc20DenomsStore.readyPromise, this.betaERC20DenomsStore.readyPromise]);
  }

  setTempERC20Denoms(tempDenoms: DenomsRecord, chain: string) {
    runInAction(() => {
      this.tempERC20Denoms = {
        ...this.tempERC20Denoms,
        [chain]: {
          ...(this.tempERC20Denoms[chain] ?? {}),
          ...tempDenoms,
        },
      };
    });
  }
}
