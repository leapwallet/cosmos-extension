import { fromBase64, toBase64 } from '@cosmjs/encoding';
import { OfflineDirectSigner, OfflineSigner } from '@cosmjs/proto-signing';
import cosmosclient from '@cosmos-client/core';
import { TxHash, TxParams } from '@xchainjs/xchain-client';
import {
  AssetRuneNative,
  Client,
  DEFAULT_GAS_LIMIT_VALUE,
  isAssetRuneNative,
  RUNE_DECIMAL,
} from '@xchainjs/xchain-thorchain';
import { assetAmount, assetToBase, assetToString, BaseAmount, baseAmount } from '@xchainjs/xchain-util';
import BigNumber from 'bignumber.js';
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import Long from 'long';

import { fetchAccountDetails } from '../accounts';
import { ChainInfos } from '../constants/chain-infos';

export class ThorTx {
  client;
  constructor(private wallet: OfflineSigner) {
    this.client = new Client({});
  }

  async sendTokens(
    fromAddress: string,
    toAddress: string,
    amount: { amount: number; denom: string; decimals: number },
    _: number | 'auto',
    memo = 'Transfer on THORChain via Leap',
  ) {
    const _amount = assetToBase(assetAmount(amount.amount, amount.decimals));
    const txHash = await this.transfer({
      amount: _amount,
      recipient: toAddress,
      memo,
      asset: AssetRuneNative,
      sender: fromAddress,
    });
    return { txHash, amount: _amount };
  }

  async transfer({
    sender,
    asset = AssetRuneNative,
    amount,
    recipient,
    memo,
    gasLimit = new BigNumber(DEFAULT_GAS_LIMIT_VALUE),
    sequence,
  }: TxParams & { gasLimit?: BigNumber; sequence?: number; sender: string }): Promise<TxHash> {
    const balances = await this.client.getBalance(sender);
    const runeBalance: BaseAmount =
      balances.filter(({ asset }) => isAssetRuneNative(asset))[0]?.amount ?? baseAmount(0, RUNE_DECIMAL);
    const assetBalance: BaseAmount =
      balances.filter(({ asset: assetInList }) => assetToString(assetInList) === assetToString(asset))[0]?.amount ??
      baseAmount(0, RUNE_DECIMAL);

    const fee = (await this.client.getFees()).average;

    if (isAssetRuneNative(asset)) {
      if (runeBalance.lt(amount.plus(fee))) {
        throw new Error('insufficient funds');
      }
    } else {
      if (assetBalance.lt(amount) || runeBalance.lt(fee)) {
        throw new Error('insufficient funds');
      }
    }

    const unsignedTxData = await this.client.prepareTx({
      sender,
      asset,
      amount,
      recipient,
      memo,
      gasLimit,
      sequence,
    });

    const decodedTx = cosmosclient.proto.cosmos.tx.v1beta1.TxRaw.decode(
      Buffer.from(unsignedTxData.rawUnsignedTx, 'base64'),
    );
    const authInfo = cosmosclient.proto.cosmos.tx.v1beta1.AuthInfo.decode(decodedTx.auth_info_bytes);
    const walletAccounts = await this.wallet.getAccounts();

    if (!authInfo.signer_infos[0].public_key) {
      const encodedPubKey = new cosmosclient.proto.cosmos.crypto.secp256k1.PubKey({ key: walletAccounts[0].pubkey });
      authInfo.signer_infos[0].public_key = cosmosclient.codec.instanceToProtoAny(encodedPubKey);
    }

    const txBuilder = new cosmosclient.TxBuilder(
      this.client.getCosmosClient().sdk,
      cosmosclient.proto.cosmos.tx.v1beta1.TxBody.decode(decodedTx.body_bytes),
      authInfo,
    );

    const accountDetails = await fetchAccountDetails(ChainInfos.thorchain.apis.rest ?? '', sender);
    const accountNumber = Long.fromString(accountDetails.accountNumber);

    if (!accountNumber) throw Error(`Transfer failed - missing account number`);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const signDoc = txBuilder.signDoc(accountNumber);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    const formattedSignDoc = {
      bodyBytes: signDoc.body_bytes,
      authInfoBytes: signDoc.auth_info_bytes,
      chainId: signDoc.chain_id,
      accountNumber: signDoc.account_number as Long,
    };

    const signedDoc = await (this.wallet as OfflineDirectSigner).signDirect(sender, formattedSignDoc);
    const txRaw = TxRaw.fromPartial({
      bodyBytes: signedDoc.signed.bodyBytes,
      authInfoBytes: signedDoc.signed.authInfoBytes,
      signatures: [fromBase64(signedDoc.signature.signature)],
    });

    const txBytes = TxRaw.encode(txRaw).finish();

    return this.client.broadcastTx(toBase64(txBytes));
  }
}
