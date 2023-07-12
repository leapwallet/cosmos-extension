import { Decimal } from '@cosmjs/math';
import { GasPrice as StargateGasPrice } from '@cosmjs/stargate';
import BigNumber from 'bignumber.js';

function checkDenom(denom: string): void {
  if (denom.length < 3 || denom.length > 128) {
    throw new Error('Denom must be between 3 and 128 characters');
  }
}

export class GasPrice extends StargateGasPrice {
  constructor(amount: Decimal, denom: string) {
    super(amount, denom);
  }

  public static fromUserInput(amount: string, denom: string): GasPrice {
    checkDenom(denom);
    const decimalAmount = Decimal.fromUserInput(new BigNumber(amount).toFixed(18, BigNumber.ROUND_CEIL), 18);
    return new GasPrice(decimalAmount, denom);
  }

  public static fromString(gasPrice: string): GasPrice {
    const isIbcDenom = gasPrice.match('ibc/');
    let matchResult = null;

    if (isIbcDenom) {
      matchResult = gasPrice.match(/^([0-9.]+)(ibc\/[a-z0-9]*)$/i);
    } else {
      matchResult = gasPrice.match(/^([0-9.]+)([a-z][a-z0-9]*)$/i);
    }

    if (!matchResult) {
      throw new Error('Invalid gas price string');
    }

    const [, amount, denom] = matchResult;
    checkDenom(denom);

    const fractionalDigits = 18;
    const decimalAmount = Decimal.fromUserInput(amount, fractionalDigits);
    return new GasPrice(decimalAmount, denom);
  }
}
