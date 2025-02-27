import { BigNumber } from 'bignumber.js';
import currency from 'currency.js';

export const sliceAddress = (address?: string, visibleLetters = 5) => {
  return address?.slice(0, visibleLetters) + '...' + address?.slice(address.length - visibleLetters, address.length);
};

export const sliceSearchWord = (word?: string, visibleLetters = 5) => {
  if (word && word.length < 2 * visibleLetters) return word;
  return word?.slice(0, visibleLetters) + '...' + word?.slice(word.length - visibleLetters, word.length);
};

export const sliceWord = (word?: string, visibleFrontLetters = 5, visibleLastLetters = 5, customEllipsis = '...') => {
  if (word && word.length <= visibleFrontLetters + visibleLastLetters) return word;
  return (
    word?.slice(0, visibleFrontLetters) + customEllipsis + word?.slice(word.length - visibleLastLetters, word.length)
  );
};

export const capitalize = (words: string) => {
  if (!words) return words;
  return words
    .split(' ')
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ');
};

export const formatTokenAmount = (amount: string, symbol = '', precision = 3, currencyLocale?: string) => {
  if (new BigNumber(amount).lt(1) && +amount !== 0) {
    if (new BigNumber(amount).lt(1 / Math.pow(10, precision))) {
      return `<${(1 / Math.pow(10, precision)).toFixed(precision)} ${symbol.toUpperCase()}`;
    }

    const amt = currency(new BigNumber(amount).valueOf(), { precision, symbol: '' }).format();
    if (!+amt) return '0 ' + symbol.toUpperCase();

    return `${(+amt).toString()} ${symbol.toUpperCase()}`;
  }

  // compact form only after Million
  if (new BigNumber(amount).gt(9_99_999) && currencyLocale) {
    amount = Intl.NumberFormat(currencyLocale, {
      maximumFractionDigits: 2,
      notation: 'compact',
    }).format(parseFloat(amount));

    return `${amount} ${symbol}`;
  }

  const numberOfDecimals = new BigNumber(amount).dp();
  const precisionToUse = Math.min(precision, numberOfDecimals || 0);

  return currency(amount, { precision: precisionToUse, pattern: '# !', symbol }).format();
};

export const formatPercentAmount = (amount: string, precision = 3) => {
  return currency(amount, { precision, pattern: '!#', symbol: '' }).format();
};

export const removeTrailingSlash = (url: string | undefined) => {
  return url?.replace(/\/$/, '');
};

export const sortStringArr = (arr: string[]) => {
  return arr.sort((strA, strB) => {
    const nameA = strA.toLowerCase().trim();
    const nameB = strB.toLowerCase().trim();

    if (nameA > nameB) return 1;
    if (nameA < nameB) return -1;
    return 0;
  });
};
