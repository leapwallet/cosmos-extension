import { BigNumber } from 'bignumber.js';
import currency from 'currency.js';

export function formatTokenAmount(amount: string, symbol = '', precision = 3, currencyLocale?: string) {
  if (new BigNumber(amount).lt(1) && +amount !== 0) {
    if (new BigNumber(amount).lt(1 / Math.pow(10, precision))) {
      return `<0.001 ${symbol.toUpperCase()}`;
    }

    const amt = currency(new BigNumber(amount).valueOf(), { precision, symbol: '' }).format();

    if (!+amt) return '0 ' + symbol.toUpperCase();

    return `${(+amt).toString()} ${symbol.toUpperCase()}`;
  }

  if (new BigNumber(amount).gt(999) && currencyLocale) {
    amount = Intl.NumberFormat(currencyLocale, {
      maximumFractionDigits: 2,
      notation: 'compact',
    }).format(parseFloat(amount));

    return `${amount} ${symbol}`;
  }

  const numberOfDecimals = new BigNumber(amount).dp();
  const precisionToUse = Math.min(precision, numberOfDecimals || 0);

  return currency(amount, { precision: precisionToUse, pattern: '# !', symbol }).format();
}
