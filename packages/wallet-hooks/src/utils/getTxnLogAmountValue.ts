import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { Currency } from '@leapwallet/leap-api-js';

import { fetchCurrency } from './findUSDValue';

export async function getTxnLogAmountValue(amount: string, denom: { coinGeckoId: string; chain: SupportedChain }) {
  function getFormattedValue(value: number) {
    if (value >= 0.00001) {
      return parseFloat(value.toFixed(5));
    }

    return 0;
  }

  if (amount && denom.coinGeckoId && denom.chain) {
    const usdPrice = await fetchCurrency('1', denom.coinGeckoId, denom.chain, Currency.Usd);

    if (usdPrice) {
      const usdPriceValue = parseFloat(usdPrice) * parseFloat(amount);
      return getFormattedValue(usdPriceValue);
    }
  }

  return;
}
