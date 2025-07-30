import { Currency } from '../connectors';

export type SupportedCurrencies = 'US' | 'EU' | 'GB' | 'AU' | 'CN' | 'KR' | 'IN' | 'JP' | 'PH' | 'ID';
export type SupportedSymbols = '$' | '€' | '£' | 'A$' | '¥' | '₩' | '₹' | '¥' | '₱' | 'Rp';
export type SupportedCurrencyISO = 'USD' | 'EUR' | 'GBP' | 'AUD' | 'CNY' | 'KRW' | 'INR' | 'JPY' | 'PHP' | 'IDR';

export type CurrencyTypes = {
  country: SupportedCurrencies;
  name: string;
};

export type CurrencySymbolsTypes = {
  [key in SupportedCurrencies]: {
    symbol: SupportedSymbols;
    currencyPointer: Currency;
    ISOname: SupportedCurrencyISO;
    locale: string;
  };
};
