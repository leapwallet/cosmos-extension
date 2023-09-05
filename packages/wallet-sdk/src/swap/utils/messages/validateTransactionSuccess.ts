import { DeliverTxResponse, isDeliverTxFailure } from '@cosmjs/stargate';

export function validateTransactionSuccess(result: DeliverTxResponse | undefined) {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  if (isDeliverTxFailure(result!)) {
    throw new Error(
      `Error when broadcasting tx ${result?.transactionHash} at height ${result?.height}. Code: ${result?.code}; Raw log: ${result?.rawLog}`,
    );
  }

  return result;
}
