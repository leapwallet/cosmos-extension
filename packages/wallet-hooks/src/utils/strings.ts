import { BigNumber } from 'bignumber.js';
import currency from 'currency.js';

export const sliceAddress = (address?: string, visibleLetters = 5) => {
  return address?.slice(0, visibleLetters) + '...' + address?.slice(address.length - visibleLetters, address.length);
};

export const sliceSearchWord = (word?: string, visibleLetters = 5) => {
  if (word && word.length < 2 * visibleLetters) return word;
  return word?.slice(0, visibleLetters) + '...' + word?.slice(word.length - visibleLetters, word.length);
};

export const sliceWord = (word?: string, visibleFrontLetters = 5, visibleLastLetters = 5) => {
  if (word && word.length <= visibleFrontLetters + visibleLastLetters) return word;
  return word?.slice(0, visibleFrontLetters) + '...' + word?.slice(word.length - visibleLastLetters, word.length);
};

export const capitalize = (words: string) => {
  if (!words) return words;
  return words
    .split(' ')
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ');
};

export const formatTokenAmount = (amount: string, symbol = '', precision = 3) => {
  if (new BigNumber(amount).lt(1) && +amount !== 0) {
    if (new BigNumber(amount).lt(1 / Math.pow(10, precision))) {
      return `<0.001 ${symbol.toUpperCase()}`;
    }

    const amt = currency(new BigNumber(amount).valueOf(), { precision, symbol: '' }).format();

    if (!+amt) return '0 ' + symbol.toUpperCase();

    return `${(+amt).toString()} ${symbol.toUpperCase()}`;
  }

  return currency(amount, { precision: 3, pattern: '# !', symbol }).format();
};

export const formatPercentAmount = (amount: string, precision = 3) => {
  return currency(amount, { precision, pattern: '!#', symbol: '' }).format();
};

export const removeTrailingSlash = (url: string | undefined) => {
  return url?.replace(/\/$/, '');
};
