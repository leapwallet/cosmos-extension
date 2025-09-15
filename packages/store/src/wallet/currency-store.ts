import { computed, makeAutoObservable, runInAction } from 'mobx';

import { Currency, CurrencySymbolsTypes, SupportedCurrencies } from '../types/currency';
import { StorageAdapter } from '../types/storage-adapter.type';

export const currencyDetail: CurrencySymbolsTypes = {
  US: { symbol: '$', currencyPointer: Currency.Usd, ISOname: 'USD', locale: 'en-US' },
  EU: { symbol: '€', currencyPointer: Currency.Eur, ISOname: 'EUR', locale: 'fr-FR' },
  GB: { symbol: '£', currencyPointer: Currency.Gbp, ISOname: 'GBP', locale: 'en-GB' },
  AU: { symbol: 'A$', currencyPointer: Currency.Aud, ISOname: 'AUD', locale: 'en-AU' },
  CN: { symbol: '¥', currencyPointer: Currency.Cny, ISOname: 'CNY', locale: 'zh-Hans' },
  KR: { symbol: '₩', currencyPointer: Currency.Krw, ISOname: 'KRW', locale: 'ko-KR' },
  IN: { symbol: '₹', currencyPointer: Currency.Inr, ISOname: 'INR', locale: 'en-IN' },
  JP: { symbol: '¥', currencyPointer: Currency.Jpy, ISOname: 'JPY', locale: 'ja-JP' },
  PH: { symbol: '₱', currencyPointer: Currency.Php, ISOname: 'PHP', locale: 'fil-PH' },
  ID: { symbol: 'Rp', currencyPointer: Currency.Idr, ISOname: 'IDR', locale: 'id-ID' },
};

export class CurrencyStore {
  preferredCountry: SupportedCurrencies = 'US';
  storageAdapter: StorageAdapter;
  readyPromise: Promise<void>;

  constructor(storageAdapter: StorageAdapter) {
    makeAutoObservable(this, {
      preferredCurrency: computed,
    });
    this.storageAdapter = storageAdapter;
    this.readyPromise = this.init();
  }

  get preferredCurrency() {
    return currencyDetail[this.preferredCountry].currencyPointer;
  }

  async init() {
    const preferredCurrency = await this.storageAdapter.get<SupportedCurrencies>('preferred-currency');
    if (preferredCurrency) {
      runInAction(() => {
        this.preferredCountry = preferredCurrency;
      });
    }
  }

  updatePreferredCurrency(currency: SupportedCurrencies) {
    runInAction(() => {
      this.preferredCountry = currency;
      this.storageAdapter.set('preferred-currency', currency);
    });
  }
}
