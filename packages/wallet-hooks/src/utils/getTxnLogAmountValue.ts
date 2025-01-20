import { Currency } from '@leapwallet/leap-api-js';

import { LoggingDenom } from '../types';
import { fetchCurrency } from './findUSDValue';

function getFormattedValue(value: number) {
  if (value >= 0.00001) {
    return parseFloat(value.toFixed(5));
  }

  return 0;
}

export async function getTxnLogAmountValue(
  amount: string,
  denom: LoggingDenom,
  outAmount?: string,
  destinationDenom?: LoggingDenom,
) {
  let amountVal;

  if (amount && denom) {
    const usdPrice = await fetchCurrency(
      '1',
      denom.coinGeckoId,
      denom.chain,
      Currency.Usd,
      `${denom.chainId}-${denom.coinMinimalDenom}`,
    );

    if (usdPrice) {
      const usdPriceValue = parseFloat(usdPrice) * parseFloat(amount);
      amountVal = getFormattedValue(usdPriceValue);
    }
  }

  if (outAmount && destinationDenom && !amountVal) {
    const usdPrice = await fetchCurrency(
      '1',
      destinationDenom.coinGeckoId,
      destinationDenom.chain,
      Currency.Usd,
      `${destinationDenom.chainId}-${destinationDenom.coinMinimalDenom}`,
    );

    if (usdPrice) {
      const usdPriceValue = parseFloat(usdPrice) * parseFloat(outAmount);
      amountVal = getFormattedValue(usdPriceValue);
    }
  }

  return amountVal;
}
