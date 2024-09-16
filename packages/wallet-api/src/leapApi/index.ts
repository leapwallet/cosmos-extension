import { getId, getIds } from '../cg';
import {
  APIPercentageChanges,
  APIPrices,
  AssetPlatform,
  CosmosTxRequest,
  Currency,
  MarketCaps,
  MarketCapsApiResponse,
  MarketCapsRequest,
  MarketCapsResponse,
  MarketChartApiResponse,
  MarketChartPrice,
  MarketChartPriceInt,
  MarketChartRequest,
  MarketDescriptionRequest,
  MarketPercentageChangesRequest,
  MarketPercentageChangesResponse,
  MarketPricesRequest,
  MarketPricesResponse,
  NetworkError,
  parseAssetPlatform,
  PercentageChanges,
  PercentageChangesApiResponse,
  Prices,
  PricesApiResponse,
  V2MarketPercentageChangesRequest,
  V2MarketPercentageChangesResponse,
  V2MarketPricesRequest,
  V2MarketPricesResponse,
  V2TxOperation,
  V2TxRequest,
  validateCgPlatform,
} from '../types';

export const convertCurrencyToCGCurrency = (currency: Currency): string => {
  return currency.toLowerCase();
};

const queryPercentageChanges = async (ids: string, currency: Currency = Currency.Usd): Promise<PercentageChanges> => {
  const percentageChanges: PercentageChanges = {};
  for (let page = 1; ; ++page) {
    const params = new URLSearchParams({
      ids,
      vs_currency: currency,
      price_change_percentage: '24h',
      per_page: '1000',
      page: page.toString(),
    }).toString();
    const response = await fetch(`${process.env.COIN_GECKO_BASE_URL}/coins/markets?${params}`);
    if (response?.status !== 200) break;
    const json: PercentageChangesApiResponse = await response.json();
    if (json.length === 0) break;
    json.reduce((changes, { id, price_change_percentage_24h: change }) => {
      if (change !== null) changes[id] = change;
      return changes;
    }, percentageChanges);
  }
  return percentageChanges;
};

export class LeapApi {
  constructor(private readonly apiBaseUrl: string = '') {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getMarketDescription({ platform, token }: MarketDescriptionRequest): Promise<string | null> {
    return null;
  }
  async getMarketCaps({ tokens, currency = Currency.Usd }: MarketCapsRequest): Promise<MarketCapsResponse> {
    const marketCaps: MarketCaps = {};
    for (let page = 1; ; ++page) {
      const params = new URLSearchParams({
        tokens: tokens.join(','),
        vs_currency: currency,
        per_page: '1000',
        page: page.toString(),
      }).toString();
      const response = await fetch(`${process.env.COIN_GECKO_BASE_URL}/coins/markets?${params}`);
      if (response?.status !== 200) break;
      const json: MarketCapsApiResponse = await response.json();
      if (json.length === 0) break;
      json.reduce((marketCaps, { id, market_cap: marketCap }) => {
        if (marketCap !== null) marketCaps[id] = marketCap;
        return marketCaps;
      }, marketCaps);
    }
    return marketCaps;
  }
  async getMarketChart({
    platform,
    token,
    days,
    currency = Currency.Usd,
  }: MarketChartRequest): Promise<MarketChartPrice[]> {
    const parsed: AssetPlatform | undefined = parseAssetPlatform(platform);
    if (!parsed) {
      throw new NetworkError('Error while fetchin market chart');
    }
    const id = await getId(parsed, token);
    if (id === null) return [];
    const params = new URLSearchParams({ vs_currency: currency, days: days.toString() }).toString();
    const response = await fetch(`${process.env.COIN_GECKO_BASE_URL}/coins/${id}/market_chart?${params}`);
    if (response?.status !== 200) return [];
    const { prices }: MarketChartApiResponse = await response.json();
    const networkResponse = prices.reduce((accumulator, [ms, price]) => {
      const element: MarketChartPriceInt = { date: new Date(ms).toISOString(), price };
      accumulator.push(element);
      return accumulator;
    }, Array<MarketChartPriceInt>());

    const interval = Math.ceil(networkResponse.length / 100);
    let outputIndex = 0;
    return networkResponse.reduce((outputPrices, { date, price }, inputIndex) => {
      if (inputIndex % interval !== 0) return outputPrices;
      let smoothedPrice: number;
      if (outputIndex === 0) smoothedPrice = price;
      else {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const { smoothedPrice: previousPrice } = outputPrices[outputIndex - 1]!;
        smoothedPrice = previousPrice * 0.5 + price * 0.5;
      }
      ++outputIndex;
      return outputPrices.concat({ date, price, smoothedPrice });
    }, Array<MarketChartPrice>());
  }
  async getMarketPrices({
    tokens,
    platform,
    currency = Currency.Usd,
  }: MarketPricesRequest): Promise<MarketPricesResponse> {
    if (tokens.length === 0) return {};
    tokens = [...new Set(tokens)];
    const parsed: AssetPlatform | undefined = parseAssetPlatform(platform);
    if (!parsed) {
      return {};
    }
    const idTokenMapping = await getIds(parsed, tokens);
    const reduced = Object.keys(idTokenMapping).reduce(
      (accumulator, current) => (accumulator === '' ? current : `${accumulator},${current}`),
      '',
    );
    const params = new URLSearchParams({ ids: reduced, vs_currencies: currency }).toString();
    const response = await fetch(`${process.env.COIN_GECKO_BASE_URL}/simple/price?${params}`);
    if (response?.status !== 200) return {};
    const json: PricesApiResponse = await response.json();
    const cgCurrency = convertCurrencyToCGCurrency(currency);
    const prices = Object.entries(json).reduce((prices, [key, { [cgCurrency]: price }]) => {
      if (price !== undefined) prices[key] = price;
      return prices;
    }, {} as Prices);
    const networkTokenPriceMapping = Object.entries(prices).reduce((tokenPriceMapping, [id, price]) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const token = idTokenMapping[id]!;
      tokenPriceMapping[token] = price;
      return tokenPriceMapping;
    }, {} as Prices);
    return networkTokenPriceMapping;
  }
  async getMarketPercentageChanges({
    tokens,
    currency = Currency.Usd,
  }: MarketPercentageChangesRequest): Promise<MarketPercentageChangesResponse> {
    if (tokens.length === 0) return {};
    tokens = [...new Set(tokens)];
    const reduced = tokens.reduce(
      (accumulator, current) => (accumulator === '' ? current : `${accumulator},${current}`),
      '',
    );
    const changes = await queryPercentageChanges(reduced, currency);
    return changes;
  }

  async getV2MarketPercentageChanges({
    platformTokenAddresses,
  }: V2MarketPercentageChangesRequest): Promise<V2MarketPercentageChangesResponse> {
    const platforms = Array<string>();
    const promises = Array<Promise<Prices>>();
    const body: APIPercentageChanges = {};
    for (const { platform } of platformTokenAddresses) {
      if (validateCgPlatform(platform)) {
        platforms.push(platform);
        // const parsed = parseAssetPlatform(platform)!;
        //   promises.push(this.getMarketPercentageChanges(parsed, tokenAddresses, params.currency));
      } else {
        body[platform] = {};
      }
    }
    const awaited = await Promise.allSettled(promises);
    for (let index = 0; index < awaited.length; ++index) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const prices = awaited[index]!;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      body[platforms[index]!] = prices.status === 'fulfilled' ? prices.value : {};
    }
    return body;

    throw new NetworkError(new Error('Dummified response'));
  }

  async getV2MarketPrices({
    platformTokenAddresses,
    currency = Currency.Usd,
  }: V2MarketPricesRequest): Promise<V2MarketPricesResponse> {
    const platforms = Array<string>();
    const promises = Array<Promise<Prices>>();
    const body: APIPrices = {};
    for (const { platform, tokenAddresses } of platformTokenAddresses) {
      if (validateCgPlatform(platform)) {
        platforms.push(platform);
        promises.push(this.getMarketPrices({ platform, tokens: tokenAddresses, currency }));
      } else {
        body[platform] = {};
      }
    }
    const awaited = await Promise.allSettled(promises);
    for (let index = 0; index < awaited.length; ++index) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const prices = awaited[index]!;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      body[platforms[index]!] = prices.status === 'fulfilled' ? prices.value : {};
    }
    return body;
  }
  async operateCosmosTx(request: CosmosTxRequest): Promise<void> {
    console.log('Transaction Logging: ', request);
    throw new NetworkError(new Error('Dummified response'));
  }

  async operateSeiTx(request: CosmosTxRequest): Promise<void> {
    console.log('Transaction Logging: ', request);
    throw new NetworkError(new Error('Dummified response'));
  }

  async operateV2Tx(logReq: V2TxRequest, operation: V2TxOperation): Promise<void> {
    console.log('Transaction Logging: ', logReq);
    throw new NetworkError(new Error('Dummified response'));
  }
}
