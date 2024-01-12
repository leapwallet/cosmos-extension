import { GasOptions } from './useGetGasPrice';

export type ErrorTxType = 'send' | 'delegate' | 'redelegate' | 'undelegate' | 'claim' | 'vote' | 'swap';

export const TxMap = {
  send: 'Send',
  delegate: 'Delegate',
  redelegate: 'Redelegate',
  undelegate: 'Undelegate',
  claim: 'Claim',
  vote: 'Vote',
  swap: 'Swap',
};

export function getErrorMsg(error: string, gasOption: GasOptions, txType: ErrorTxType) {
  if (error.includes('13 insufficient fees')) {
    if (gasOption === GasOptions.HIGH) {
      return `${TxMap[txType]} failed. Please report the issue & try again in a while.`;
    } else {
      return `${TxMap[txType]} failed due to ${gasOption} gas fees. Please try again with higher gas.`;
    }
  }

  if (error.includes('502')) {
    return `Could not ${
      ['vote', 'claim'].includes(txType) ? TxMap[txType] : `${TxMap[txType]} tokens`
    } due to an invalid server response. Please try again in a while.`;
  }

  if (error.includes('sequence')) {
    return `Could not ${
      ['vote', 'claim'].includes(txType) ? TxMap[txType] : `${TxMap[txType]} tokens`
    } due to an internal error. Please try again in a while.`;
  }

  return error;
}
