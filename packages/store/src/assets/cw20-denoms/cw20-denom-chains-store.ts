import { makeAutoObservable, observable } from 'mobx';

const cw20DenomsChainsUrl = 'https://assets.leapwallet.io/cosmos-registry/v1/denoms/cw20-chains.json';

const cw20DenomsChains = [];

export class CW20DenomChainsStore {
  cw20DenomChains: Array<string> = [];
  readyPromise: Promise<void>;

  constructor() {
    makeAutoObservable(this, {
      cw20DenomChains: observable.shallow,
    });
    this.readyPromise = this.loadCW20DenomChains();
  }

  async loadCW20DenomChains() {
    const response = await fetch(cw20DenomsChainsUrl);
    const data = await response.json();
    this.cw20DenomChains = data.chains;
  }
}
