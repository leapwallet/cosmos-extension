import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk/dist/constants';
import { BigNumber } from 'bignumber.js';

import { LeapWalletApi } from '../apis/LeapWalletApi';
import { Currency } from '../connectors';

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
  token: string,
  chain: SupportedChain,
  currencySelected: Currency,
): Promise<string | undefined> {
  if (quantity === '0') return '0';
  const rate = await LeapWalletApi.operateMarketPrices([token], chain, currencySelected);

  return rate !== null && rate?.[token] ? new BigNumber(quantity).times(rate?.[token] ?? 0).toString() : undefined;
}
