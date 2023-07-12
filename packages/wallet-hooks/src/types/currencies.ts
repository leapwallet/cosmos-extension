import { Currency } from '../connectors';

export type SupportedCurrencies = 'US' | 'EU' | 'GB' | 'AU' | 'CN' | 'KR' | 'IN' | 'JP';
export type SupportedSymbols = '$' | '€' | '£' | 'A$' | '¥' | '₩' | '₹' | '¥';
export type SupportedCurrencyISO = 'USD' | 'EUR' | 'GBP' | 'AUD' | 'CNY' | 'KRW' | 'INR' | 'JPY';

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
