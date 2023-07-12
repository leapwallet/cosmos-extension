import { DeliverTxResponse, isDeliverTxFailure } from '@cosmjs/stargate';

export function validateTransactionSuccess(result: DeliverTxResponse | undefined) {
  if (isDeliverTxFailure(result!)) {
    throw new Error(
      `Error when broadcasting tx ${result?.transactionHash} at height ${result?.height}. Code: ${result?.code}; Raw log: ${result?.rawLog}`,
    );
  }

  return result;
}
