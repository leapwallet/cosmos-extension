import {
  Currency,
  getCoingeckoPricesStoreSnapshot,
  LeapWalletApi,
} from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk/dist/constants'
import { BigNumber } from 'bignumber.js'

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
): Promise<string | null> {
  if (quantity === '0') return '0'
  if (alternatePriceKey) {
    /**
     * Above condition is so that we can roll out this change in non-breaking manner
     */
    const coingeckoPrices = await getCoingeckoPricesStoreSnapshot()
    if (coingeckoPrices) {
      let tokenPrice
      if (token) {
        tokenPrice = coingeckoPrices?.[currencySelected]?.[token]
      }
      if (!tokenPrice) {
        tokenPrice = coingeckoPrices?.[currencySelected]?.[alternatePriceKey]
      }
      if (tokenPrice) {
        return new BigNumber(quantity).times(tokenPrice).toString()
      }
    }
  }

  if (!token) return null

  const rate = await LeapWalletApi.operateMarketPrices([token], chain, currencySelected)

  return rate !== null && rate?.[token]
    ? new BigNumber(quantity).times(rate?.[token] ?? 0).toString()
    : null
}
