export enum Currency {
  /** Bitcoin */
  Btc = 'BTC',
  /** Ethereum */
  Eth = 'ETH',
  /** Litecoin */
  Ltc = 'LTC',
  /** Bitcoin Cash */
  Bch = 'BCH',
  /** BNB */
  Bnb = 'BNB',
  /** EOS */
  Eos = 'EOS',
  /** XRP */
  Xrp = 'XRP',
  /** Stellar */
  Xlm = 'XLM',
  /** Chainlink */
  Link = 'LINK',
  /** Polkadot */
  Dot = 'DOT',
  /** yearn.finance */
  Yfi = 'YFI',
  /** US Dollar */
  Usd = 'USD',
  /** UAE Dirham */
  Aed = 'AED',
  /** Argentine Peso */
  Ars = 'ARS',
  /** Australian Dollar */
  Aud = 'AUD',
  /** Basic Attention */
  Bat = 'BAT',
  /** Bermudian Dollar */
  Bmd = 'BMD',
  /** Brazilian Real */
  Brl = 'BRL',
  /** Canadian Dollar */
  Cad = 'CAD',
  /** Swiss Franc */
  Chf = 'CHF',
  /** Chilean Peso */
  Clp = 'CLP',
  /** Chinese Yuan */
  Cny = 'CNY',
  /** Czech Koruna */
  Czk = 'CZK',
  /** Danish Krone */
  Dkk = 'DKK',
  /** Euro */
  Eur = 'EUR',
  /** Great British Pound */
  Gbp = 'GBP',
  /** Hong Kong Dollar */
  Hkd = 'HKD',
  /** Hungarian Forint */
  Huf = 'HUF',
  /** Indonesian Rupiah */
  Idr = 'IDR',
  /** Israeli Shekel */
  Ils = 'ILS',
  /** Indian Rupee */
  Inr = 'INR',
  /** Japanese Yen */
  Jpy = 'JPY',
  /** South Korean Won */
  Krw = 'KRW',
  /** Kuwaiti Dinar */
  Kwd = 'KWD',
  /** Sri Lankan Rupee */
  Lkr = 'LKR',
  /** Burmese Kyat */
  Mmk = 'MMK',
  /** Mexican Peso */
  Mxn = 'MXN',
  /** Malaysian Ringgit */
  Myr = 'MYR',
  /** Nigerian Naira */
  Nnr = 'NNR',
  /** Norwegian Krone */
  Nok = 'NOK',
  /** New Zealand Dollar */
  Nzd = 'NZD',
  /** Philippine Peso */
  Php = 'PHP',
  /** Pakistani Rupee */
  Pkr = 'PKR',
  /** Polish Zloty */
  Pln = 'PLN',
  /** Russian Ruble */
  Rub = 'RUB',
  /** Saudi Arabia Real */
  Sar = 'SAR',
  /** Swedish Krona */
  Sek = 'SEK',
  /** Singapore Dollar */
  Sgd = 'SGD',
  /** Thai Baht */
  Thb = 'THB',
  /** Ukrainian Hryvnia */
  Uah = 'UAH',
  /** Venezuelan Bolivar */
  Vef = 'VEF',
  /** Vietnamese Dong */
  Vnd = 'VND',
  /** South African Rand */
  Zar = 'ZAR',
  /** IMF Special Drawing Rights */
  Xdr = 'XDR',
  /** Silver Ounce */
  Xag = 'XAG',
  /** Gold Ounce */
  Xau = 'XAU',
}

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
