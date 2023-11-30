import { DeliverTxResponse, TimeoutError } from '@cosmjs/stargate';

import { sleep } from '../../../utils';
import { getTxData } from '../../utils';

export default class PollForTx {
  lcdEndpoint: string | undefined;

  constructor(lcdEndpoint: string) {
    this.lcdEndpoint = lcdEndpoint;
  }

  async pollForTx(txId: string, limit = 20, pollCount = 0): Promise<DeliverTxResponse> {
    const timedOut = pollCount >= limit;
    const timeoutMs = 2_000 * limit;
    if (timedOut) {
      throw new TimeoutError(
        `Transaction with ID ${txId} was submitted but was not yet found on the chain. You might want to check later. There was a wait of ${
          timeoutMs / 1000
        } seconds.`,
        txId,
      );
    }
    if (timedOut) {
      throw new TimeoutError(
        `Transaction with ID ${txId} was submitted but was not yet found on the chain. You might want to check later. There was a wait of ${
          timeoutMs / 1000
        } seconds.`,
        txId,
      );
    }
    await sleep(2_000);
    // const result = await this.client?.getTx(txId);
    const result = await getTxData(txId, this?.lcdEndpoint ?? '');

    return result && result.code !== 3
      ? {
          code: result.code,
          height: result.height,
          rawLog: result.rawLog,
          transactionHash: txId,
          gasUsed: result.gasUsed,
          gasWanted: result.gasWanted,
          events: [],
        }
      : this.pollForTx(txId, limit, pollCount + 1);
  }
}
