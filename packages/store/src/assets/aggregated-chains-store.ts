import { makeObservable, observable, runInAction } from 'mobx';

const aggregatedChainsUrl = 'https://assets.leapwallet.io/cosmos-registry/v1/config/aggregated-chains.json';

export class AggregatedChainsStore {
  aggregatedChainsData: Array<string> = [];
  readyPromise: Promise<void>;

  constructor() {
    makeObservable({
      aggregatedChainsData: observable.shallow,
    });
    this.readyPromise = this.loadAggregatedChainsData();
  }

  async loadAggregatedChainsData() {
    const response = await fetch(aggregatedChainsUrl);
    const data = await response.json();
    runInAction(() => {
      this.aggregatedChainsData = data;
    });
  }
}
