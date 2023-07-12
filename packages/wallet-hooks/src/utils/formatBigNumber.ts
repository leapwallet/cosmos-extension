import BigNumber from 'bignumber.js';

export const formatBigNumber = (n: BigNumber) => {
  if (isNaN(n?.toNumber())) {
    return '-';
  }
  if (n.lt(0.01) && !n.eq(0)) {
    return `<0.01`;
  } else {
    return n.toFixed(2);
  }
};
