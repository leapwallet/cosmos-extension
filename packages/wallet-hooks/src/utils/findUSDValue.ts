import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk/dist/browser/constants';
import { BigNumber } from 'bignumber.js';

import { LeapWalletApi } from '../apis/LeapWalletApi';
import { Currency, MarketPricesResponse } from '../connectors';
import { getCoingeckoPricesStoreSnapshot } from '../store';

// TODO: replace getCoingeckoPricesStoreSnapshot with price store

/**
 * @function currencyFetcher
 * @description utility function to fetch the currency data from the API
 * @param {string} token - the token to fetch the data for
 * @param {SupportedChain} chain - the chain to fetch the data for
 * @param {Currency} currencySelected - the currency to fetch the data for
 * @returns {Promise<string>} - the promise of the currency data

 */
export async function fetchCurrency(
  quantity: string,
  token: string | undefined,
  chain: SupportedChain,
  currencySelected: Currency,
  alternatePriceKey?: string,
): Promise<string | undefined> {
  if (quantity === '0') return '0';

  if (alternatePriceKey) {
    /**
     * Above condition is so that we can roll out this change in non-breaking manner
     */
    const coingeckoPrices = await getCoingeckoPricesStoreSnapshot();
    if (coingeckoPrices) {
      let tokenPrice;
      if (token) {
        tokenPrice = coingeckoPrices?.[currencySelected]?.[token];
      }
      if (!tokenPrice) {
        tokenPrice = coingeckoPrices?.[currencySelected]?.[alternatePriceKey];
      }
      if (tokenPrice) {
        return new BigNumber(quantity).times(tokenPrice).toString();
      }
    }
  }

  if (!token) return undefined;

  const rate: MarketPricesResponse = await Promise.race([
    LeapWalletApi.operateMarketPrices([token], chain, currencySelected),
    new Promise<MarketPricesResponse>((resolve) => setTimeout(() => resolve({}), 10000)),
  ]);

  return rate !== null && rate?.[token] ? new BigNumber(quantity).times(rate?.[token] ?? 0).toString() : undefined;
}
