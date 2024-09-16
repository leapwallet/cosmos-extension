import { makeObservable, observable, runInAction } from 'mobx';

const erc20DenomsChainsUrl = 'https://assets.leapwallet.io/cosmos-registry/v1/denoms/erc20-chains.json';

export class ERC20DenomsChainsStore {
  chains: Array<string> = [];
  readyPromise: Promise<void>;

  constructor() {
    makeObservable({
      chains: observable.shallow,
    });
    this.readyPromise = this.loadERC20DenomsChains();
  }

  async loadERC20DenomsChains() {
    const response = await fetch(erc20DenomsChainsUrl);
    const data = await response.json();
    runInAction(() => {
      this.chains = data.chains;
    });
  }
}
