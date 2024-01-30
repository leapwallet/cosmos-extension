import { Coin as StargateCoin } from '@cosmjs/amino/build/coins';
import { fromBase64 } from '@cosmjs/encoding';
import { Coin, DeliverTxResponse, StdFee, TimeoutError } from '@cosmjs/stargate';
import { arrayify, concat, splitSignature } from '@ethersproject/bytes';
import { EthWallet } from '@leapwallet/leap-keychain';
import { VoteOption } from 'cosmjs-types/cosmos/gov/v1beta1/gov';
import { SignDoc } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { Height } from 'cosmjs-types/ibc/core/client/v1/client';
import dayjs from 'dayjs';
import { proto, transactions } from 'evmosjs';

import { fetchAccountDetails } from '../accounts';
import { axiosWrapper } from '../healthy-nodes';
import { getClientState } from '../utils';
import { sleep } from '../utils/sleep';

export class EthermintTxHandler {
  protected chain: transactions.Chain;

  constructor(private restUrl: string, protected wallet: EthWallet, private chainId?: string) {
    this.chain = {
      chainId: 123,
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
  ) {
    const walletAccount = await this.wallet.getAccounts();
    const sender = await this.getSender(fromAddress, Buffer.from(walletAccount[0].pubkey).toString('base64'));
    const clientState = await getClientState(this.restUrl ?? '', sourceChannel, sourcePort);

    const txFee = EthermintTxHandler.getFeeObject(fee);
    const tx = transactions.createTxIBCMsgTransfer(this.chain, sender, txFee, memo ?? '', {
      sourcePort,
      sourceChannel,
      amount: transferAmount.amount,
      denom: transferAmount.denom,
      receiver: toAddress,
      revisionHeight:
        parseInt(clientState?.data?.identified_client_state.client_state.latest_height.revision_height ?? '0') + 10_000,
      revisionNumber: parseInt(
        clientState?.data?.identified_client_state.client_state.latest_height.revision_number ?? '0',
      ),
      timeoutTimestamp: timeoutTimestamp
        ? ((timeoutTimestamp + 100_000) * 1_000_000_000).toString()
        : (Date.now() * 1_000_000).toString(),
    });

    return this.signAndBroadcast(fromAddress, sender.accountNumber, tx);
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

  async signAndBroadcast(signerAddress: string, accountNumber: number, tx: any) {
    const dataToSign = `0x${Buffer.from(tx.signDirect.signBytes, 'base64').toString('hex')}`;

    const signDoc = SignDoc.fromPartial({
      bodyBytes: tx.signDirect.body.serializeBinary(),
      authInfoBytes: tx.signDirect.authInfo.serializeBinary(),
      chainId: this.chain.cosmosChainId,
      accountNumber: accountNumber,
    });

    if (!(this.wallet instanceof EthWallet)) {
      const signedData = await (this.wallet as any).signDirect(signerAddress, signDoc);
      const txRaw = proto.createTxRaw(tx.signDirect.body.serializeBinary(), tx.signDirect.authInfo.serializeBinary(), [
        fromBase64(signedData.signature.signature),
      ]);

      return this.broadcastTx(txRaw);
    } else {
      const rawSignature = this.wallet.sign(signerAddress, dataToSign);
      const _splitSignature = splitSignature(rawSignature);
      const txRaw = proto.createTxRaw(tx.signDirect.body.serializeBinary(), tx.signDirect.authInfo.serializeBinary(), [
        arrayify(concat([_splitSignature.r, _splitSignature.s])),
      ]);

      return this.broadcastTx(txRaw);
    }
  }

  async broadcastTx(signedTx: any): Promise<string> {
    const baseURL = this.restUrl;
    const { data: result } = await axiosWrapper({
      baseURL,
      method: 'post',
      url: '/cosmos/tx/v1beta1/txs',
      data: JSON.stringify({
        tx_bytes: Object.values(signedTx.message.serializeBinary()),
        mode: 'BROADCAST_MODE_ASYNC',
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
