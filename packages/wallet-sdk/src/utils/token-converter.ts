import BN from 'bignumber.js';

const defaultDecimals = 6;
export function toSmall(quantity: string, decimals: number = defaultDecimals): string {
  return new BN(quantity).times(Math.pow(10, decimals)).toFixed().toString();
}

export function fromSmall(quantity: string, decimals: number = defaultDecimals): string {
  return new BN(quantity).div(Math.pow(10, decimals)).dp(18).toFixed().toString();
}

export function fromSmallBN(quantity: string, decimals: number = defaultDecimals): BN {
  return new BN(quantity).div(Math.pow(10, decimals));
}

export function toSmallBN(quantity: string, decimals: number = defaultDecimals): BN {
  return new BN(quantity).times(Math.pow(10, decimals));
}
