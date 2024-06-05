import { Decimal } from '@cosmjs/math';
import { GasPrice as StargateGasPrice } from '@cosmjs/stargate';
import BigNumber from 'bignumber.js';

export class GasPrice extends StargateGasPrice {
  constructor(amount: Decimal, denom: string) {
    super(amount, denom);
  }

  public static fromUserInput(amount: string, denom: string): GasPrice {
    const decimalAmount = Decimal.fromUserInput(new BigNumber(amount).toFixed(18, BigNumber.ROUND_CEIL), 18);
    return new GasPrice(decimalAmount, denom);
  }

  public static fromString(gasPrice: string): GasPrice {
    let matchResult = null;

    matchResult = gasPrice.match(/^([0-9.]+)([a-z][a-z0-9/\-:]*]*)$/i);

    if (!matchResult) {
      throw new Error('Invalid gas price string');
    }

    const [, amount, denom] = matchResult;

    const fractionalDigits = 18;
    const decimalAmount = Decimal.fromUserInput(amount, fractionalDigits);
    return new GasPrice(decimalAmount, denom);
  }
}
