import axios from 'axios';
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
    const response = await axios.get('https://api.leapwallet.io/market/apr-changes');
    const data = response.data;

    runInAction(() => {
      this.chainsApr = data;
    });
  }
}
