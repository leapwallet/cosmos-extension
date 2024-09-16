import { fromBase64, toBase64 } from '@cosmjs/encoding';
import { OfflineDirectSigner, OfflineSigner } from '@cosmjs/proto-signing';
import { SignDoc, TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import Long from 'long';

import { axiosWrapper } from '../healthy-nodes';

const BASE_URL = `${process.env.LEAP_WALLET_BACKEND_API_URL}/adhoc/sdk/thorchain`;

export class ThorTx {
  constructor(private wallet: OfflineSigner) {}

  async sendTokens(
    fromAddress: string,
    toAddress: string,
    amount: { amount: number; denom: string; decimals: number },
    _: number | 'auto',
    memo = 'Transfer on THORChain via Leap',
  ) {
    try {
      const { data: signDoc } = await axiosWrapper({
        baseURL: BASE_URL,
        url: '/prepareTx',
        method: 'POST',
        data: {
          sender: fromAddress,
          amount,
          recipient: toAddress,
          memo,
        },
      });

      const formattedSignDoc = {
        bodyBytes: signDoc.body_bytes,
        authInfoBytes: signDoc.auth_info_bytes,
        chainId: signDoc.chain_id,
        accountNumber: signDoc.account_number as Long,
      };

      const txBytes = await this.signTransaction(formattedSignDoc, fromAddress);

      const { data: txHash } = await axiosWrapper({
        baseURL: BASE_URL,
        method: 'POST',
        url: '/broadcastTx',
        data: {
          txBytes,
        },
      });

      return { txHash, amount };
    } catch (error) {
      throw new Error(error.response?.data?.message);
    }
  }

  async signTransaction(formattedSignDoc: SignDoc, sender: string) {
    const signedDoc = await (this.wallet as OfflineDirectSigner).signDirect(sender, formattedSignDoc);
    const txRaw = TxRaw.fromPartial({
      bodyBytes: signedDoc.signed.bodyBytes,
      authInfoBytes: signedDoc.signed.authInfoBytes,
      signatures: [fromBase64(signedDoc.signature.signature)],
    });

    const txBytes = TxRaw.encode(txRaw).finish();
    return toBase64(txBytes);
  }
}
