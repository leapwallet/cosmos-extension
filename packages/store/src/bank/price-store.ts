import { getIsCompass } from '@leapwallet/cosmos-wallet-sdk';
import axios from 'axios';
import { makeObservable, reaction } from 'mobx';

import { BaseQueryStore } from '../base/base-data-store';
import { getBaseURL } from '../globals/config';
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
    const priceUrl = `${getBaseURL()}/market/prices/ecosystem?currency=${preferredCurrency}&ecosystem=${ecosystem}`;
    const response = await axios.get(priceUrl);
    return response.data;
  }

  async fetchData() {
    const isCompassWallet = getIsCompass();

    const promises = [this.fetchEcosystemPrices('cosmos-ecosystem')];
    if (!isCompassWallet) {
      promises.push(this.fetchEcosystemPrices('ethereum-ecosystem'));
      promises.push(this.fetchEcosystemPrices('avalanche-ecosystem'));
      promises.push(this.fetchEcosystemPrices('solana-ecosystem'));
      promises.push(this.fetchEcosystemPrices('sui-ecosystem'));
    }

    const promisesRes = await Promise.allSettled<Record<string, number>>(promises);
    const [cosmosPrices, ethereumPrices, avalanchePrices, solanaPrices, suiPrices] = promisesRes.map((p) =>
      p.status === 'fulfilled' ? p.value : null,
    );

    return {
      ...(cosmosPrices ?? {}),
      ...(ethereumPrices ?? {}),
      ...(avalanchePrices ?? {}),
      ...(solanaPrices ?? {}),
      ...(suiPrices ?? {}),
    };
  }
}
