import BN from 'bignumber.js';
const defaultDecimals = 6;
export function fromSmall(quantity: string, decimals: number = defaultDecimals): string {
  return new BN(quantity).div(Math.pow(10, decimals)).dp(18).toFixed().toString();
}
