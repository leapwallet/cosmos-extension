import { BigNumber } from 'bignumber.js';

import { Token } from '../types';

export function balanceCalculator(balancesList: Array<Token>) {
  const tokensWithUsdValue = balancesList.filter((token) => token.usdValue);
  if (balancesList.length > 0 && tokensWithUsdValue?.length === 0) {
    return new BigNumber(0);
  }
  return tokensWithUsdValue.reduce((totalValue, token) => {
    return token.usdValue ? totalValue.plus(new BigNumber(token.usdValue)) : totalValue;
  }, new BigNumber(0));
}
