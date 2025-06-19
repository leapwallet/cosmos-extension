import { Token } from 'types/bank';

export const sortTokenBalances = (tokens: Token[]) => {
  const tokensWithUSDValue = tokens.filter((token) => Number(token.usdValue) > 0);
  const tokensWithBalanceNoUSDValue = tokens.filter(
    (token) => !(Number(token.usdValue) > 0) && Number(token.amount) > 0,
  );
  const tokensWithZeroAmount = tokens.filter((token) => Number(token.amount) === 0);

  // decreasing order
  tokensWithUSDValue.sort((token1, token2) => Number(token2.usdValue) - Number(token1.usdValue));
  tokensWithBalanceNoUSDValue.sort((token1, token2) => Number(token2.amount) - Number(token1.amount));
  tokensWithZeroAmount.sort((token1, token2) => token1.symbol.localeCompare(token2.symbol));

  return [...tokensWithUSDValue, ...tokensWithBalanceNoUSDValue, ...tokensWithZeroAmount];
};
