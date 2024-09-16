/* eslint-disable @typescript-eslint/no-unused-vars */
import { Coin as StargateCoin } from '@cosmjs/amino/build/coins';
import { fromBase64 } from '@cosmjs/encoding';
import { Coin, DeliverTxResponse, StdFee, TimeoutError } from '@cosmjs/stargate';
import { arrayify, concat, splitSignature } from '@ethersproject/bytes';
import { EthWallet } from '@leapwallet/leap-keychain';
import { VoteOption } from 'cosmjs-types/cosmos/gov/v1beta1/gov';
import { Fee, SignDoc, TxBody } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { Height } from 'cosmjs-types/ibc/core/client/v1/client';
import dayjs from 'dayjs';

import { fetchAccountDetails } from '../accounts';
import { axiosWrapper } from '../healthy-nodes';
import { LeapLedgerSignerEth } from '../ledger';
import { ExtensionOptionsWeb3Tx } from '../proto/ethermint/web3';
import { getClientState } from '../utils';
import { sleep } from '../utils/sleep';
import {
  createMessageSend,
  createTxIBCMsgTransfer,
  createTxMsgBeginRedelegate,
  createTxMsgDelegate,
  createTxMsgGenericRevoke,
  createTxMsgMultipleDelegate,
  createTxMsgMultipleWithdrawDelegatorReward,
  createTxMsgStakeAuthorization,
  createTxMsgStakeRevokeAuthorization,
  createTxMsgUndelegate,
  createTxMsgVote,
  createTxRaw,
  createTxRawEIP712,
} from './msgs/ethermint';
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

type SignSendArgs = {
  fromAddress: string;
  toAddress: string;
  amount: Coin[];
  fee: StdFee;
  memo: string;
};

type SignVoteArgs = {
  fromAddress: string;
  proposalId: string;
  option: VoteOption;
  fee: StdFee;
  memo: string;
};

type SignDelegateArgs = {
  delegatorAddress: string;
  validatorAddress: string;
  amount: Coin;
  fee: StdFee;
  memo: string;
};

type signGrantRestakeArgs = {
  fromAddress: string;
  stakeAuthorization: {
    botAddress: string;
    validatorAddress: string;
    expiryDate: string;
    maxTokens?: {
      denom?: string | undefined;
      amount?: string | undefined;
    };
  };
  fee: StdFee;
  memo: string;
};

type signRevokeRestakeArgs = {
  fromAddress: string;
  grantee: string;
  fee: StdFee;
  memo: string;
};

type signRevokeGrantArgs = {
  msgType: string;
  fromAddress: string;
  grantee: string;
  fee: StdFee;
  memo: string;
};

type signUnDelegateArgs = {
  delegatorAddress: string;
  validatorAddress: string;
  amount: Coin;
  fee: StdFee;
  memo: string;
};

type signWithdrawRewardsArgs = {
  delegatorAddress: string;
  validatorAddresses: string[];
  fee: StdFee;
  memo: string;
};

type signReDelegateArgs = {
  delegatorAddress: string;
  validatorDstAddress: string;
  validatorSrcAddress: string;
  amount: Coin;
  fee: StdFee;
  memo: string;
};

type signClaimAndStakeArgs = {
  delegatorAddress: string;
  validatorsWithRewards: { validator: string; amount: Coin }[];
  fee: StdFee;
  memo: string;
};

export class EthermintTxHandler {
  protected chain;

  constructor(
    private restUrl: string,
    protected wallet: EthWallet | LeapLedgerSignerEth,
    chainId?: string,
    evmChainId?: string,
  ) {
    this.chain = {
      chainId: evmChainId ? parseInt(evmChainId) : 9001,
      cosmosChainId: chainId ? chainId : 'evmos_9001-2',
    };
  }

  protected static getFeeObject(fee: StdFee) {
    return {
      amount: fee.amount[0].amount,
      denom: fee.amount[0].denom,
      gas: fee.gas,
    };
  }

  async sign(signerAddress: string, accountNumber: number, tx: any) {
    if (this.wallet instanceof LeapLedgerSignerEth) {
      const signature = await (this.wallet as LeapLedgerSignerEth).signEip712(signerAddress, tx.eipToSign);

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
    }

    if (!(this.wallet instanceof EthWallet)) {
      const signDoc = SignDoc.fromPartial({
        authInfoBytes: tx.signDirect.authInfo.serializeBinary(),
        bodyBytes: tx.signDirect.body.serializeBinary(),
        chainId: this.chain.cosmosChainId,
        accountNumber: accountNumber,
      });
      const signedData = await (this.wallet as any).signDirect(signerAddress, signDoc);
      const txRaw = createTxRaw(tx.signDirect.body.serializeBinary(), tx.signDirect.authInfo.serializeBinary(), [
        fromBase64(signedData.signature.signature),
      ]);
      return Buffer.from(txRaw.value).toString('base64');
    } else {
      const dataToSign = `0x${Buffer.from(tx.signDirect.signBytes, 'base64').toString('hex')}`;

      const rawSignature = this.wallet.sign(signerAddress, dataToSign);
      const _splitSignature = splitSignature(rawSignature);
      const txRaw = createTxRaw(tx.signDirect.body.serializeBinary(), tx.signDirect.authInfo.serializeBinary(), [
        arrayify(concat([_splitSignature.r, _splitSignature.s])),
      ]);
      return Buffer.from(txRaw.value).toString('base64');
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

  protected async getSender(address: string, pubkey: string) {
    const account = await fetchAccountDetails(this.restUrl ?? '', address);

    return {
      accountAddress: address,
      sequence: parseInt(account.sequence),
      accountNumber: parseInt(account.accountNumber),
      pubkey,
    };
  }

  async signIbcTx({
    fromAddress,
    toAddress,
    transferAmount,
    sourcePort,
    sourceChannel,
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

    return this.sign(fromAddress, sender.accountNumber, tx);
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
      txMemo,
    });

    return this.broadcastTx(txRaw);
  }

  async signSendTx({ fromAddress, toAddress, amount, fee, memo }: SignSendArgs) {
    const walletAccount = await this.wallet.getAccounts();

    const sender = await this.getSender(fromAddress, Buffer.from(walletAccount[0].pubkey).toString('base64'));

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

    const tx = createMessageSend(this.chain, sender, stdFee, memo, {
      destinationAddress: toAddress,
      amount: amount[0].amount,
      denom: amount[0].denom,
    });

    return this.sign(fromAddress, sender.accountNumber, tx);
  }

  async sendTokens(fromAddress: string, toAddress: string, amount: Coin[], fee: StdFee, memo = '') {
    const txRaw = await this.signSendTx({ fromAddress, toAddress, amount, fee, memo });
    return this.broadcastTx(txRaw);
  }

  async signVoteTx({ fromAddress, proposalId, option, fee, memo }: SignVoteArgs) {
    const walletAccount = await this.wallet.getAccounts();

    const sender = await this.getSender(fromAddress, Buffer.from(walletAccount[0].pubkey).toString('base64'));
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
    const tx = createTxMsgVote(this.chain, sender, stdFee, memo, {
      proposalId: parseInt(proposalId),
      option,
    });
    return this.sign(fromAddress, sender.accountNumber, tx);
  }

  async vote(fromAddress: string, proposalId: string, option: VoteOption, fee: StdFee, memo = '') {
    const txRaw = await this.signVoteTx({ fromAddress, proposalId, option, fee, memo });
    return this.broadcastTx(txRaw);
  }

  async signDelegateTx({ delegatorAddress, validatorAddress, amount, fee, memo }: SignDelegateArgs) {
    const walletAccount = await this.wallet.getAccounts();

    const sender = await this.getSender(delegatorAddress, Buffer.from(walletAccount[0].pubkey).toString('base64'));
    const stdFee = Fee.fromPartial({
      amount: [
        {
          amount: fee.amount[0].amount,
          denom: fee.amount[0].denom,
        },
      ],
      gasLimit: fee.gas,
      payer: delegatorAddress,
    });
    const tx = createTxMsgDelegate(this.chain, sender, stdFee, memo, {
      validatorAddress,
      amount: amount.amount,
      denom: amount.denom,
    });
    return this.sign(delegatorAddress, sender.accountNumber, tx);
  }

  async delegate(delegatorAddress: string, validatorAddress: string, amount: Coin, fee: StdFee, memo = '') {
    const txRaw = await this.signDelegateTx({ delegatorAddress, validatorAddress, amount, fee, memo });
    return this.broadcastTx(txRaw);
  }

  async signGrantRestakeTx({
    fromAddress,
    fee,
    memo,
    stakeAuthorization: { botAddress, validatorAddress, expiryDate, maxTokens },
  }: signGrantRestakeArgs) {
    const walletAccount = await this.wallet.getAccounts();

    const sender = await this.getSender(fromAddress, Buffer.from(walletAccount[0].pubkey).toString('base64'));
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

    const tx = createTxMsgStakeAuthorization(this.chain, sender, stdFee, memo, {
      bot_address: botAddress,
      validator_address: validatorAddress,
      duration_in_seconds: dayjs(expiryDate).unix(),
      maxTokens: maxTokens?.amount,
      denom: stdFee.amount[0].denom,
    });
    return this.sign(fromAddress, sender.accountNumber, tx);
  }

  async grantRestake(
    fromAddress: string,
    {
      botAddress,
      validatorAddress,
      expiryDate,
      maxTokens,
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
    memo = '',
  ) {
    const txRaw = await this.signGrantRestakeTx({
      fromAddress,
      fee,
      memo,
      stakeAuthorization: {
        botAddress,
        validatorAddress,
        expiryDate,
        maxTokens,
      },
    });
    return this.broadcastTx(txRaw);
  }

  async signRevokeRestakeTx({ fromAddress, grantee, fee, memo }: signRevokeRestakeArgs) {
    const walletAccount = await this.wallet.getAccounts();

    const sender = await this.getSender(fromAddress, Buffer.from(walletAccount[0].pubkey).toString('base64'));
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
    const tx = createTxMsgStakeRevokeAuthorization(this.chain, sender, stdFee, memo, {
      bot_address: grantee,
    });
    return this.sign(fromAddress, sender.accountNumber, tx);
  }

  async revokeRestake(fromAddress: string, grantee: string, fee: StdFee, memo = '') {
    const txRaw = await this.signRevokeRestakeTx({ fromAddress, grantee, fee, memo });
    return this.broadcastTx(txRaw);
  }

  async signRevokeGrantTx({ msgType, fee, fromAddress, grantee, memo }: signRevokeGrantArgs) {
    const walletAccount = await this.wallet.getAccounts();

    const sender = await this.getSender(fromAddress, Buffer.from(walletAccount[0].pubkey).toString('base64'));
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
    const tx = createTxMsgGenericRevoke(this.chain, sender, stdFee, memo ?? '', {
      botAddress: grantee,
      typeUrl: msgType,
    });
    return this.sign(fromAddress, sender.accountNumber, tx);
  }

  async revokeGrant(msgType: string, fromAddress: string, grantee: string, fee: StdFee, memo = '') {
    const txRaw = await this.signRevokeGrantTx({ msgType, fromAddress, grantee, fee, memo });
    return this.broadcastTx(txRaw);
  }

  async signUnDelegateTx({ amount, delegatorAddress, fee, memo, validatorAddress }: signUnDelegateArgs) {
    const walletAccount = await this.wallet.getAccounts();

    const sender = await this.getSender(delegatorAddress, Buffer.from(walletAccount[0].pubkey).toString('base64'));
    const stdFee = Fee.fromPartial({
      amount: [
        {
          amount: fee.amount[0].amount,
          denom: fee.amount[0].denom,
        },
      ],
      gasLimit: fee.gas,
      payer: delegatorAddress,
    });
    const tx = createTxMsgUndelegate(this.chain, sender, stdFee, memo ?? '', {
      validatorAddress,
      amount: amount.amount,
      denom: amount.denom,
    });
    return this.sign(delegatorAddress, sender.accountNumber, tx);
  }

  async unDelegate(delegatorAddress: string, validatorAddress: string, amount: Coin, fee: StdFee, memo = '') {
    const txRaw = await this.signUnDelegateTx({ delegatorAddress, validatorAddress, amount, fee, memo });
    return this.broadcastTx(txRaw);
  }

  async signWithdrawRewardsTx({ delegatorAddress, fee, memo, validatorAddresses }: signWithdrawRewardsArgs) {
    const walletAccount = await this.wallet.getAccounts();

    const sender = await this.getSender(delegatorAddress, Buffer.from(walletAccount[0].pubkey).toString('base64'));
    const stdFee = Fee.fromPartial({
      amount: [
        {
          amount: fee.amount[0].amount,
          denom: fee.amount[0].denom,
        },
      ],
      gasLimit: fee.gas,
      payer: delegatorAddress,
    });
    const tx = createTxMsgMultipleWithdrawDelegatorReward(this.chain, sender, stdFee, memo ?? '', {
      validatorAddresses,
    });
    return this.sign(delegatorAddress, sender.accountNumber, tx);
  }

  async withdrawRewards(delegatorAddress: string, validatorAddresses: string[], fee: StdFee, memo = '') {
    const txRaw = await this.signWithdrawRewardsTx({ delegatorAddress, validatorAddresses, fee, memo });
    return this.broadcastTx(txRaw);
  }

  async signReDelegateTx({
    amount,
    delegatorAddress,
    fee,
    memo,
    validatorDstAddress,
    validatorSrcAddress,
  }: signReDelegateArgs) {
    const walletAccount = await this.wallet.getAccounts();

    const sender = await this.getSender(delegatorAddress, Buffer.from(walletAccount[0].pubkey).toString('base64'));
    const stdFee = Fee.fromPartial({
      amount: [
        {
          amount: fee.amount[0].amount,
          denom: fee.amount[0].denom,
        },
      ],
      gasLimit: fee.gas,
      payer: delegatorAddress,
    });
    const tx = createTxMsgBeginRedelegate(this.chain, sender, stdFee, memo ?? '', {
      validatorSrcAddress,
      validatorDstAddress,
      amount: amount.amount,
      denom: amount.denom,
    });
    return this.sign(delegatorAddress, sender.accountNumber, tx);
  }

  async reDelegate(
    delegatorAddress: string,
    validatorDstAddress: string,
    validatorSrcAddress: string,
    amount: Coin,
    fee: StdFee,
    memo = '',
  ) {
    const txRaw = await this.signReDelegateTx({
      delegatorAddress,
      validatorDstAddress,
      validatorSrcAddress,
      amount,
      fee,
      memo,
    });
    return this.broadcastTx(txRaw);
  }

  async signClaimAndStakeTx({ delegatorAddress, fee, memo, validatorsWithRewards }: signClaimAndStakeArgs) {
    const walletAccount = await this.wallet.getAccounts();

    const sender = await this.getSender(delegatorAddress, Buffer.from(walletAccount[0].pubkey).toString('base64'));
    const stdFee = Fee.fromPartial({
      amount: [
        {
          amount: fee.amount[0].amount,
          denom: fee.amount[0].denom,
        },
      ],
      gasLimit: fee.gas,
      payer: delegatorAddress,
    });
    const tx = createTxMsgMultipleDelegate(this.chain, sender, stdFee, memo ?? '', {
      values: validatorsWithRewards.map((validatorWithReward) => ({
        validatorAddress: validatorWithReward.validator,
        amount: validatorWithReward.amount.amount,
        denom: validatorWithReward.amount.denom,
      })),
    });
    return this.sign(delegatorAddress, sender.accountNumber, tx);
  }

  async claimAndStake(
    delegatorAddress: string,
    validatorsWithRewards: { validator: string; amount: Coin }[],
    fee: StdFee,
    memo = '',
  ) {
    const txRaw = await this.signClaimAndStakeTx({ delegatorAddress, fee, memo, validatorsWithRewards });
    return this.broadcastTx(txRaw);
  }
}
