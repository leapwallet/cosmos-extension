import { makeObservable, observable, runInAction } from 'mobx';

import { ChainsAprData } from '../../types';

export class ChainsAprStore {
  chainsApr: ChainsAprData = {};
  readyPromise: Promise<void>;

  constructor() {
    makeObservable({
      chainsApr: observable.shallow,
    });
    this.readyPromise = this.loadChainsApr();
  }

  async loadChainsApr() {
    const response = await fetch('https://api.leapwallet.io/market/apr-changes');
    const data = await response.json();

    runInAction(() => {
      this.chainsApr = data;
    });
  }
}
