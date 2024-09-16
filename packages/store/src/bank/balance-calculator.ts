import { BigNumber } from 'bignumber.js';

import { Token } from './balance-types';

export function balanceCalculator(balancesList: Array<Token>) {
  const tokensWithUsdValue = balancesList.filter((token) => token.usdValue);
  if (balancesList.length > 0 && tokensWithUsdValue?.length === 0) {
    return new BigNumber(0);
  }
  return tokensWithUsdValue.reduce((totalValue, token) => {
    return token.usdValue ? totalValue.plus(new BigNumber(token.usdValue)) : totalValue;
  }, new BigNumber(0));
}

export const sortTokenBalances = (tokens: Token[]) => {
  const tokensWithUSDValue = tokens.filter((token) => Number(token.usdValue) > 0);
  const tokensWithBalanceNoUSDValue = tokens.filter(
    (token) => !(Number(token.usdValue) > 0) && Number(token.amount) >= 0,
  );

  // decreasing order
  tokensWithUSDValue.sort((token1, token2) => Number(token2.usdValue) - Number(token1.usdValue));
  tokensWithBalanceNoUSDValue.sort((token1, token2) => Number(token2.amount) - Number(token1.amount));

  return [...tokensWithUSDValue, ...tokensWithBalanceNoUSDValue];
};
