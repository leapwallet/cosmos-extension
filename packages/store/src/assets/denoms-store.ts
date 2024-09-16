import { DenomsRecord } from '@leapwallet/cosmos-wallet-sdk';
import { makeObservable, observable, runInAction } from 'mobx';

const baseDenomsUrl = 'https://assets.leapwallet.io/cosmos-registry/v1/denoms/base.json';

export class DenomsStore {
  denoms: DenomsRecord = {};
  readyPromise: Promise<void>;

  constructor() {
    makeObservable({
      denoms: observable.shallow,
    });
    this.readyPromise = this.loadBaseDenoms();
  }

  // Add caching for base denoms
  async loadBaseDenoms() {
    const response = await fetch(baseDenomsUrl);
    const data = await response.json();
    runInAction(() => {
      this.denoms = data;
    });
  }
}
