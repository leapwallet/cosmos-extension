import { Token } from '../types/bank';

export const sortTokens = (a: Token, b: Token): number => {
  const bUsdValue = Number(b.usdValue);
  const aUsdValue = Number(a.usdValue);
  if (isNaN(bUsdValue)) {
    return -1;
  }
  if (isNaN(aUsdValue)) {
    return 1;
  }
  const resValue = bUsdValue - aUsdValue;
  if (resValue === 0) {
    const bAmt = Number(b.amount);
    const aAmt = Number(a.amount);
    if (isNaN(bAmt)) {
      return -1;
    }
    if (isNaN(aAmt)) {
      return 1;
    }
    const resAmt = bAmt - aAmt;
    if (isNaN(resAmt)) {
      return b.symbol > a.symbol ? 1 : -1;
    }
    return resAmt;
  }
  return resValue;
};
