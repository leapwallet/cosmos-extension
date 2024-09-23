import { Currency } from '../connectors';
import { LoggingDenom } from '../types';
import { fetchCurrency } from './findUSDValue';

export async function getTxnLogAmountValue(amount: string, denom: LoggingDenom) {
  function getFormattedValue(value: number) {
    if (value >= 0.00001) {
      return parseFloat(value.toFixed(5));
    }

    return 0;
  }

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
      return getFormattedValue(usdPriceValue);
    }
  }

  return;
}
