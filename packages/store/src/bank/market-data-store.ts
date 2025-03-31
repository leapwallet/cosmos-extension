import { getIsCompass } from '@leapwallet/cosmos-wallet-sdk';
import axios from 'axios';
import { makeObservable, reaction } from 'mobx';

import { BaseQueryStore } from '../base/base-data-store';
import { CurrencyStore } from '../wallet';

export type MarketData = {
  current_price: number;
  fully_diluted_valuation: number;
  id: string;
  image: string;
  market_cap: number;
  market_cap_rank: number;
  name: string;
  price_change_24h: number;
  price_change_percentage_7d_in_currency: number;
  price_change_percentage_24h: number;
  symbol: string;
  total_volume: number;
};

export class MarketDataStore extends BaseQueryStore<Record<string, MarketData>> {
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

  async fetchData() {
    const ecosystems = getIsCompass() ? 'cosmos-ecosystem' : 'cosmos-ecosystem,ethereum-ecosystem';
    const preferredCurrency = this.currencyStore.preferredCurrency;
    const marketDataUrl = `https://api.leapwallet.io/v2/market/changes?currency=${preferredCurrency}&ecosystems=${ecosystems}`;
    const response = await axios.get(marketDataUrl);
    return response.data;
  }
}
