import { makeObservable, reaction } from 'mobx';

import { BaseQueryStore } from '../base/base-data-store';
import { CurrencyStore } from '../wallet';

// replaces useCoingeckoPricesStore, useInitCoingeckoPrices and fetchCurrency from findUSDValue
export class PriceStore extends BaseQueryStore<Record<string, number>> {
  prices: Record<string, number> = {};
  readyPromise: Promise<void>;
  currencyStore: CurrencyStore;

  constructor(currencyStore: CurrencyStore) {
    super();
    makeObservable(this);

    this.currencyStore = currencyStore;
    this.readyPromise = this.initialize();

    reaction(
      () => this.currencyStore.preferredCurrency,
      () => {
        this.refetchData();
      },
    );
  }

  async initialize() {
    await this.currencyStore.readyPromise;
    this.getData();
  }

  async fetchEcosystemPrices(ecosystem: string) {
    const preferredCurrency = this.currencyStore.preferredCurrency;
    const priceUrl = `https://api.leapwallet.io/market/prices/ecosystem?currency=${preferredCurrency}&ecosystem=${ecosystem}`;
    const response = await fetch(priceUrl);
    return response.json();
  }

  async fetchData() {
    const [cosmosPrices, ethereumPrices, avalanchePrices] = await Promise.all([
      this.fetchEcosystemPrices('cosmos-ecosystem'),
      this.fetchEcosystemPrices('ethereum-ecosystem'),
      this.fetchEcosystemPrices('avalanche-ecosystem'),
    ]);
    return {
      ...avalanchePrices,
      ...ethereumPrices,
      ...cosmosPrices,
    };
  }
}
