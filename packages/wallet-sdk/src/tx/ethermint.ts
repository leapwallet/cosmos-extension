import { Coin as StargateCoin } from '@cosmjs/amino/build/coins';
import { fromBase64 } from '@cosmjs/encoding';
import { Coin, DeliverTxResponse, StdFee, TimeoutError } from '@cosmjs/stargate';
import { arrayify, concat, joinSignature, SignatureLike, splitSignature } from '@ethersproject/bytes';
import { EthWallet } from '@leapwallet/leap-keychain';
import { VoteOption } from 'cosmjs-types/cosmos/gov/v1beta1/gov';
import { Fee, TxBody } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { Height } from 'cosmjs-types/ibc/core/client/v1/client';
import dayjs from 'dayjs';
import { proto, transactions } from 'evmosjs';

import { fetchAccountDetails } from '../accounts';
import { axiosWrapper } from '../healthy-nodes';
import { LeapLedgerSignerEth } from '../ledger';
import { ExtensionOptionsWeb3Tx } from '../proto/ethermint/web3';
import { getClientState } from '../utils';
import { sleep } from '../utils/sleep';
import { createTxIBCMsgTransfer, createTxRawEIP712 } from './msgs/ethermint';
import { fromEthSignature } from './utils';

type SignIbcArgs = {
  fromAddress: string;
  toAddress: string;
  transferAmount: StargateCoin;
  sourcePort: string;
  sourceChannel: string;
  timeoutHeight: Height | undefined;
  timeoutTimestamp: number | undefined;
  fee: StdFee;
  memo: string | undefined;
  txMemo?: string;
};

export class EthermintTxHandler {
  protected chain: transactions.Chain;

  constructor(
    private restUrl: string,
    protected wallet: EthWallet | LeapLedgerSignerEth,
    private chainId?: string,
    evmChainId?: string,
  ) {
    this.chain = {
      chainId: evmChainId ? parseInt(evmChainId) : 9001,
      cosmosChainId: chainId ? chainId : 'evmos_9001-2',
    };
  }

  protected static getFeeObject(fee: StdFee): transactions.Fee {
    return {
      amount: fee.amount[0].amount,
      denom: fee.amount[0].denom,
      gas: fee.gas,
    };
  }

  async sendTokens(fromAddress: string, toAddress: string, amount: Coin[], fee: StdFee, memo = '') {
    const walletAccount = await this.wallet.getAccounts();

    const sender: transactions.Sender = await this.getSender(
      fromAddress,
      Buffer.from(walletAccount[0].pubkey).toString('base64'),
    );

    const txFee = EthermintTxHandler.getFeeObject(fee);

    const tx = transactions.createMessageSend(this.chain, sender, txFee, memo, {
      destinationAddress: toAddress,
      amount: amount[0].amount,
      denom: amount[0].denom,
    });

    return this.signAndBroadcast(fromAddress, sender.accountNumber, tx);
  }

  async signIbcTx({
    fromAddress,
    toAddress,
    transferAmount,
    sourcePort,
    sourceChannel,
    timeoutHeight = undefined,
    timeoutTimestamp = undefined,
    fee,
    memo,
    txMemo,
  }: SignIbcArgs) {
    const walletAccount = await this.wallet.getAccounts();

    const sender = await this.getSender(fromAddress, Buffer.from(walletAccount[0].pubkey).toString('base64'));
    const clientState = await getClientState(this.restUrl ?? '', sourceChannel, sourcePort);
    const stdFee = Fee.fromPartial({
      amount: [
        {
          amount: fee.amount[0].amount,
          denom: fee.amount[0].denom,
        },
      ],
      gasLimit: fee.gas,
      payer: fromAddress,
    });

    const tx = createTxIBCMsgTransfer(this.chain, sender, stdFee, memo ?? '', {
      sourcePort,
      sourceChannel,
      amount: transferAmount.amount,
      denom: transferAmount.denom,
      receiver: toAddress,
      memo: txMemo ?? '',
      revisionHeight:
        parseInt(clientState?.data?.identified_client_state.client_state.latest_height.revision_height ?? '0') + 200,
      revisionNumber: parseInt(
        clientState?.data?.identified_client_state.client_state.latest_height.revision_number ?? '0',
      ),
      timeoutTimestamp: timeoutTimestamp
        ? ((timeoutTimestamp + 100_000) * 1_000_000_000).toString()
        : ((Date.now() + 1_000_000) * 1_000_000).toString(),
    });

    return this.sign(fromAddress, sender.accountNumber, tx, true);
  }

  async sendIBCTokens(
    fromAddress: string,
    toAddress: string,
    transferAmount: StargateCoin,
    sourcePort: string,
    sourceChannel: string,
    timeoutHeight: Height | undefined,
    timeoutTimestamp: number | undefined,
    fee: StdFee,
    memo: string | undefined,
    txMemo: string = '',
  ) {
    const txRaw = await this.signIbcTx({
      fromAddress,
      toAddress,
      transferAmount,
      sourcePort,
      sourceChannel,
      timeoutHeight,
      timeoutTimestamp,
      fee,
      memo,
    });

    return this.broadcastTx(txRaw);
  }

  async vote(fromAddress: string, proposalId: string, option: VoteOption, fees: StdFee, memo?: string) {
    const walletAccount = await this.wallet.getAccounts();
    const sender = await this.getSender(fromAddress, Buffer.from(walletAccount[0].pubkey).toString('base64'));
    const txFee = EthermintTxHandler.getFeeObject(fees);
    const tx = transactions.createTxMsgVote(this.chain, sender, txFee, memo ?? '', {
      proposalId: parseInt(proposalId),
      option,
    });
    return this.signAndBroadcast(fromAddress, sender.accountNumber, tx);
  }

  async delegate(delegatorAddress: string, validatorAddress: string, amount: Coin, fees: StdFee, memo?: string) {
    const walletAccount = await this.wallet.getAccounts();
    const sender = await this.getSender(delegatorAddress, Buffer.from(walletAccount[0].pubkey).toString('base64'));
    const txFee = EthermintTxHandler.getFeeObject(fees);
    const tx = transactions.createTxMsgDelegate(this.chain, sender, txFee, memo ?? '', {
      validatorAddress,
      amount: amount.amount,
      denom: amount.denom,
    });
    return this.signAndBroadcast(delegatorAddress, sender.accountNumber, tx);
  }

  async grantRestake(
    fromAddress: string,
    {
      botAddress,
      validatorAddress,
      expiryDate,
    }: {
      botAddress: string;
      validatorAddress: string;
      expiryDate: string;
      maxTokens?: {
        denom?: string | undefined;
        amount?: string | undefined;
      };
    },
    fee: StdFee,
    memo: string,
  ) {
    const walletAccount = await this.wallet.getAccounts();
    const sender = await this.getSender(fromAddress, Buffer.from(walletAccount[0].pubkey).toString('base64'));
    const txFee = EthermintTxHandler.getFeeObject(fee);
    const tx = transactions.createTxMsgStakeAuthorization(this.chain, sender, txFee, memo ?? '', {
      bot_address: botAddress,
      validator_address: validatorAddress,
      duration_in_seconds: dayjs(expiryDate).unix(),
      maxTokens: undefined,
      denom: txFee.denom,
    });
    return this.signAndBroadcast(fromAddress, sender.accountNumber, tx);
  }

  async revokeRestake(fromAddress: string, grantee: string, fee: StdFee, memo: string) {
    const walletAccount = await this.wallet.getAccounts();
    const sender = await this.getSender(fromAddress, Buffer.from(walletAccount[0].pubkey).toString('base64'));
    const txFee = EthermintTxHandler.getFeeObject(fee);
    const tx = transactions.createTxMsgStakeRevokeAuthorization(this.chain, sender, txFee, memo ?? '', {
      bot_address: grantee,
    });
    return this.signAndBroadcast(fromAddress, sender.accountNumber, tx);
  }

  async revokeGrant(msgType: string, fromAddress: string, grantee: string, fee: StdFee, memo = '') {
    const walletAccount = await this.wallet.getAccounts();
    const sender = await this.getSender(fromAddress, Buffer.from(walletAccount[0].pubkey).toString('base64'));
    const txFee = EthermintTxHandler.getFeeObject(fee);
    const tx = transactions.createTxMsgGenericRevoke(this.chain, sender, txFee, memo ?? '', {
      botAddress: grantee,
      typeUrl: msgType,
    });

    return this.signAndBroadcast(fromAddress, sender.accountNumber, tx);
  }

  async unDelegate(delegatorAddress: string, validatorAddress: string, amount: Coin, fee: StdFee, memo?: string) {
    const walletAccount = await this.wallet.getAccounts();
    const sender = await this.getSender(delegatorAddress, Buffer.from(walletAccount[0].pubkey).toString('base64'));
    const txFee = EthermintTxHandler.getFeeObject(fee);
    const tx = transactions.createTxMsgUndelegate(this.chain, sender, txFee, memo ?? '', {
      validatorAddress,
      amount: amount.amount,
      denom: amount.denom,
    });
    return this.signAndBroadcast(delegatorAddress, sender.accountNumber, tx);
  }

  async withdrawRewards(delegatorAddress: string, validatorAddresses: string[], fee: StdFee, memo?: string) {
    const walletAccount = await this.wallet.getAccounts();
    const sender = await this.getSender(delegatorAddress, Buffer.from(walletAccount[0].pubkey).toString('base64'));
    const txFee = EthermintTxHandler.getFeeObject(fee);
    const tx = transactions.createTxMsgMultipleWithdrawDelegatorReward(this.chain, sender, txFee, memo ?? '', {
      validatorAddresses,
    });
    return this.signAndBroadcast(delegatorAddress, sender.accountNumber, tx);
  }

  async reDelegate(
    delegatorAddress: string,
    validatorDstAddress: string,
    validatorSrcAddress: string,
    amount: Coin,
    fee: StdFee,
    memo?: string,
  ) {
    const walletAccount = await this.wallet.getAccounts();
    const sender = await this.getSender(delegatorAddress, Buffer.from(walletAccount[0].pubkey).toString('base64'));

    const txFee = EthermintTxHandler.getFeeObject(fee);
    const tx = transactions.createTxMsgBeginRedelegate(this.chain, sender, txFee, memo ?? '', {
      validatorSrcAddress,
      validatorDstAddress,
      amount: amount.amount,
      denom: amount.denom,
    });

    proto.createSigDoc(
      tx.signDirect.body.serializeBinary(),
      tx.signDirect.authInfo.serializeBinary(),
      this.chain.cosmosChainId,
      sender.accountNumber,
    );

    return this.signAndBroadcast(delegatorAddress, sender.accountNumber, tx);
  }

  private signatureToBytes(signature: { r: string; s: string; v: number }) {
    return arrayify(concat([signature.r, signature.s, Uint8Array.from([signature.v])]));
  }

  async sign(signerAddress: string, accountNumber: number, tx: any, ibcTx?: boolean) {
    if (this.wallet instanceof LeapLedgerSignerEth) {
      const signature = await (this.wallet as LeapLedgerSignerEth).signEip712(signerAddress, tx.eipToSign);

      if (ibcTx) {
        const extension = {
          typeUrl: '/ethermint.types.v1.ExtensionOptionsWeb3Tx',
          value: ExtensionOptionsWeb3Tx.encode(
            ExtensionOptionsWeb3Tx.fromPartial({
              typedDataChainId: BigInt(this.chain.chainId.toString()),
              feePayer: signerAddress,
              feePayerSig: fromEthSignature(signature),
            }),
          ).finish(),
        };
        tx.legacyAmino.body.extensionOptions = [extension];
        const body = TxBody.fromPartial(tx.legacyAmino.body);
        const txRaw = createTxRawEIP712(body, tx.legacyAmino.authInfo);

        return Buffer.from(txRaw as Uint8Array).toString('base64');
      } else {
        const extension = transactions.signatureToWeb3Extension(
          this.chain,
          {
            accountAddress: signerAddress,
          } as transactions.Sender,
          joinSignature(signature as SignatureLike),
        );

        const txRaw = transactions.createTxRawEIP712(tx.legacyAmino.body, tx.legacyAmino.authInfo, extension);
        return Buffer.from(txRaw.message.serialize()).toString('base64');
      }
    }

    if (!(this.wallet instanceof EthWallet)) {
      const signedData = await (this.wallet as any).signDirect(signerAddress, tx);
      const txRaw = proto.createTxRaw(tx.signDirect.body.serializeBinary(), tx.signDirect.authInfo.serializeBinary(), [
        fromBase64(signedData.signature.signature),
      ]);
      return Buffer.from(txRaw.message.serialize()).toString('base64');
    } else {
      const dataToSign = `0x${Buffer.from(tx.signDirect.signBytes, 'base64').toString('hex')}`;
      const rawSignature = this.wallet.sign(signerAddress, dataToSign);
      const _splitSignature = splitSignature(rawSignature);
      const txRaw = proto.createTxRaw(tx.signDirect.body.serializeBinary(), tx.signDirect.authInfo.serializeBinary(), [
        arrayify(concat([_splitSignature.r, _splitSignature.s])),
      ]);
      return Buffer.from(txRaw.message.serialize()).toString('base64');
    }
  }

  async signAndBroadcast(signerAddress: string, accountNumber: number, tx: any) {
    const txRaw = await this.sign(signerAddress, accountNumber, tx);
    return this.broadcastTx(txRaw);
  }

  async broadcastTx(signedTx: any): Promise<string> {
    const baseURL = this.restUrl;
    const { data: result } = await axiosWrapper({
      baseURL,
      method: 'post',
      url: '/cosmos/tx/v1beta1/txs',
      data: JSON.stringify({
        tx_bytes: signedTx,
        mode: 2,
      }),
    });

    const txResponse = result.tx_response;
    if (txResponse?.code) {
      throw new Error(txResponse.raw_log);
    }
    return txResponse.txhash;
  }

  async pollForTx(txHash: string, timeout = 40000, pollcount = 0): Promise<DeliverTxResponse> {
    const limit = 20;
    const timedOut = pollcount > limit;
    if (timedOut) {
      throw new TimeoutError(
        `Transaction with ID ${txHash} was submitted but was not yet found on the chain. You might want to check later. There was a wait of ${
          timeout / 1000
        } seconds.`,
        txHash,
      );
    }
    const baseURL = this.restUrl;
    await sleep(2000);
    let result;

    try {
      const { data } = await axiosWrapper({ baseURL, method: 'get', url: `/cosmos/tx/v1beta1/txs/${txHash}` });
      result = data;
    } catch (_) {
      return this.pollForTx(txHash, timeout, pollcount + 1);
    }

    const txResponse = result?.tx_response;
    if (txResponse?.code) {
      return this.pollForTx(txHash, timeout, pollcount + 1);
    }
    return {
      code: result?.code,
      height: result?.height,
      rawLog: result?.rawLog,
      transactionHash: txHash,
      gasUsed: result?.gasUsed,
      gasWanted: result?.gasWanted,
      events: result?.events,
    };
  }

  protected async getSender(address: string, pubkey: string): Promise<transactions.Sender> {
    const account = await fetchAccountDetails(this.restUrl ?? '', address);

    return {
      accountAddress: address,
      sequence: parseInt(account.sequence),
      accountNumber: parseInt(account.accountNumber),
      pubkey,
    };
  }
}
