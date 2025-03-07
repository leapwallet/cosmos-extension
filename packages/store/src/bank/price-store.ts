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
    await this.getData();
  }

  async fetchEcosystemPrices(ecosystem: string) {
    const preferredCurrency = this.currencyStore.preferredCurrency;
    const priceUrl = `https://api.leapwallet.io/market/prices/ecosystem?currency=${preferredCurrency}&ecosystem=${ecosystem}`;
    const response = await fetch(priceUrl);
    return response.json();
  }

  async fetchData() {
    const promises = await Promise.allSettled<Record<string, number>>([
      this.fetchEcosystemPrices('cosmos-ecosystem'),
      this.fetchEcosystemPrices('ethereum-ecosystem'),
      this.fetchEcosystemPrices('avalanche-ecosystem'),
    ]);
    const [cosmosPrices, ethereumPrices, avalanchePrices] = promises.map((p) =>
      p.status === 'fulfilled' ? p.value : null,
    );

    return {
      ...(avalanchePrices ?? {}),
      ...(ethereumPrices ?? {}),
      ...(cosmosPrices ?? {}),
    };
  }
}
