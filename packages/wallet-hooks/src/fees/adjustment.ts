import { DenomsRecord, fromSmall, NativeDenom, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import BigNumber from 'bignumber.js';
import { useCallback } from 'react';

import { useNativeFeeDenom } from '../utils';

/**
 * ### Amount Adjustment for Fees Payments (v1)
 *
 * There are two cases here -
 *
 * 1. User pays fees in native tokens
 *     1. User is spending almost all of native tokens → not enough tokens remain to pay gas for the current transaction → must adjust or cancel transaction
 *     2. User is spending close to all of native tokens → enough balance to pay for current transaction fees but not for future transactions → may or may not adjust
 * 2. User pays fees in non-native tokens - [TODO: Amount Adjustment for Fees Payments (v2)]
 *
 * This check is made when user clicks “Review {txn}” button on any of the three above mentioned flows. They can chose to not adjust in 1.b but they have to adjust in 1.a.
 *
 * ### 1.a Must adjust or cancel
 *
 * balance - amount ≤ fee
 *
 * In case the user has `balance < txn fee`, we tell them they can’t send tokens. (which we already do)
 *
 * If the user has `balance > txn fee` then `amount / fee = n (floor integer)`
 *
 * if n > 3, we update amount to `amount - 3 * fee`
 *
 * else if n > 1, we update amount to `amount - n * fee`
 *
 * else, we update amount to `balance - fee`
 *
 * **Question -** What if the user has non-native tokens that they can use to pay fee?
 *
 * ### 1.b May adjust
 *
 * The balance is greater than `amount + fee` but smaller than `amount + 3 * fee`.
 *
 * Here we divide the amount by fee, `amount / fee = n (floor integer)`, to see how much can we reduce the amount
 *
 * if n > 1, we update amount to `amount - n * fee`
 *
 * else, we do not update the amount
 *
 * This would mean, for may adjust, n is always greater than 1
 */

type GetAutoAdjustAmountParams = {
  tokenAmount: string;
  feeAmount: string;
  nativeDenom: NativeDenom;
  decimalsToUse?: number;
};

/**
 * Make sure the amounts are in base denom (e.g. uatom)
 */
export const getAutoAdjustAmount = ({
  tokenAmount,
  feeAmount,
  nativeDenom,
  decimalsToUse,
}: GetAutoAdjustAmountParams) => {
  if (Number(feeAmount) === 0) {
    return tokenAmount;
  }

  // get the ratio of amount to fee
  const ratioOfAmountToFee = new BigNumber(tokenAmount).dividedBy(feeAmount).integerValue(BigNumber.ROUND_FLOOR);

  if (ratioOfAmountToFee.isGreaterThan(3)) {
    // if it is at least 3, then we can subtract 3 times the fee amount from the token amount
    const updatedTokenAmountInMinimalDenom = new BigNumber(tokenAmount)
      .minus(3 * Number(feeAmount))
      .integerValue(BigNumber.ROUND_FLOOR);

    return fromSmall(updatedTokenAmountInMinimalDenom.toString(), decimalsToUse ?? nativeDenom.coinDecimals);
  } else if (ratioOfAmountToFee.isGreaterThan(1)) {
    // if it is at least 1, then we can subtract the ratio times the fee amount from the token amount
    const updatedTokenAmountInMinimalDenom = new BigNumber(tokenAmount)
      .minus(ratioOfAmountToFee.multipliedBy(feeAmount))
      .integerValue(BigNumber.ROUND_FLOOR);

    return fromSmall(updatedTokenAmountInMinimalDenom.toString(), decimalsToUse ?? nativeDenom.coinDecimals);
  }

  // if it is 1, subtracting the fee amount from the token amount will make it 0
  // so we return null to indicate that we can't adjust
  return null;
};

export enum AdjustmentType {
  COMPULSORY = 'compulsory',
  OPTIONAL = 'optional',
  NONE = 'none',
}

export type shouldShowAutoAdjustArgs = {
  tokenBalance: string;
  tokenAmount: string;
  tokenDenom: string;
  feeAmount: string;
  feeDenom: string;
};

/**
 * Make sure all the amounts are in same denom and coin decimals. Recommend passing in base denom (e.g. uatom)
 */
export const useShouldShowAutoAdjustSheet = (
  denoms: DenomsRecord,
  forceChain?: SupportedChain,
  forceNetwork?: 'mainnet' | 'testnet',
): ((args: shouldShowAutoAdjustArgs) => AdjustmentType) => {
  const nativeDenom = useNativeFeeDenom(denoms, forceChain, forceNetwork);
  const coinMinimalDenom = nativeDenom.coinMinimalDenom;

  const shouldShowAutoAdjustSheet = useCallback(
    ({ tokenAmount, tokenDenom, feeAmount, feeDenom, tokenBalance }: shouldShowAutoAdjustArgs): AdjustmentType => {
      const isFeeDenomNativeDenom = feeDenom === coinMinimalDenom;
      const isTokenDenomNativeDenom = tokenDenom === coinMinimalDenom;

      // TODO:- handle non-native fee denom in v2
      if (!isFeeDenomNativeDenom || !isTokenDenomNativeDenom) {
        return AdjustmentType.NONE;
      }

      const tokenBalanceBN = new BigNumber(tokenBalance);
      const tokenAmountBN = new BigNumber(tokenAmount);
      const feeAmountBN = new BigNumber(feeAmount);
      const totalExpenseBN = tokenAmountBN.plus(feeAmountBN);
      const ratioOfAmountToFee = tokenAmountBN.dividedBy(feeAmountBN).integerValue(BigNumber.ROUND_FLOOR);

      // 1. user is spending almost all the balance
      // -> not enough token remain to pay for fees
      if (tokenBalanceBN.minus(tokenAmountBN).isLessThan(feeAmountBN)) {
        return AdjustmentType.COMPULSORY;
      }

      // 2. user is spending close to all the balance
      // -> no token remain to pay for fees for future transactions
      if (
        tokenBalanceBN.isGreaterThanOrEqualTo(totalExpenseBN) &&
        tokenBalanceBN.isLessThan(totalExpenseBN.plus(feeAmountBN.multipliedBy(3))) &&
        ratioOfAmountToFee.isGreaterThan(1)
      ) {
        return AdjustmentType.OPTIONAL;
      }

      return AdjustmentType.NONE;
    },
    [coinMinimalDenom],
  );

  return shouldShowAutoAdjustSheet;
};
