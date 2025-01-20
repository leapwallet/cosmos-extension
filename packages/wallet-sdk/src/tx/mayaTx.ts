import { fromBase64, toBase64 } from '@cosmjs/encoding';
import { OfflineDirectSigner, OfflineSigner } from '@cosmjs/proto-signing';
import { SignDoc, TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import Long from 'long';

import { getBaseURL } from '../globals';
import { axiosWrapper } from '../healthy-nodes';

export class MayaTx {
  constructor(private wallet: OfflineSigner) {}

  async sendTokens(
    fromAddress: string,
    toAddress: string,
    amount: { amount: number; denom: string; decimals: number },
    _: number | 'auto',
    memo = 'Transfer on Maya via Leap',
  ) {
    try {
      const BASE_URL = `${getBaseURL()}/adhoc/sdk/mayachain`;
      const walletAccount = await this.wallet.getAccounts();
      const { data: signDoc } = await axiosWrapper({
        baseURL: BASE_URL,
        url: '/prepareTx',
        method: 'POST',
        data: {
          sender: fromAddress,
          amount,
          recipient: toAddress,
          memo,
          pubKey: toBase64(walletAccount[0].pubkey),
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
