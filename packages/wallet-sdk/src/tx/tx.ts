import { toHex } from '@cosmjs/encoding';
import { Uint64 } from '@cosmjs/math';
import { decodePubkey, EncodeObject, OfflineSigner, Registry } from '@cosmjs/proto-signing';
import {
  Account,
  accountFromAny,
  calculateFee,
  Coin,
  defaultRegistryTypes,
  DeliverTxResponse,
  SigningStargateClient,
  SigningStargateClientOptions,
  StdFee,
  TimeoutError,
} from '@cosmjs/stargate';
import { assert } from '@cosmjs/utils';
import { BaseAccount } from 'cosmjs-types/cosmos/auth/v1beta1/auth';
import { MsgGrant, MsgRevoke } from 'cosmjs-types/cosmos/authz/v1beta1/tx.js';
import { VoteOption } from 'cosmjs-types/cosmos/gov/v1beta1/gov';
import { StakeAuthorization } from 'cosmjs-types/cosmos/staking/v1beta1/authz';
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { Height } from 'cosmjs-types/ibc/core/client/v1/client';

import { sleep } from '../utils/sleep';
import { StridePeriodicVestingAccount } from './liquidStakeRegistry/stride/periodic-vesting-account';
import {
  buildGrantMsg,
  buildRevokeMsg,
  getDelegateMsg,
  getIbcTransferMsg,
  getRedelegateMsg,
  getSendTokensMsg,
  getUnDelegateMsg,
  getVoteMsg,
  getWithDrawRewardsMsg,
} from './msgs/cosmos';
import { customTypes } from './nft-transfer/omniflix/utils/registry';
import { getTxData } from './utils';

function uint64FromProto(input: number | Long): Uint64 {
  return Uint64.fromString(input.toString());
}

function accountFromBaseAccount(input: BaseAccount): Account {
  const { address, pubKey, accountNumber, sequence } = input;
  const pubkey = pubKey ? decodePubkey(pubKey) : null;
  return {
    address: address,
    pubkey: pubkey,
    accountNumber: uint64FromProto(accountNumber).toNumber(),
    sequence: uint64FromProto(sequence).toNumber(),
  };
}

export class Tx {
  client: SigningStargateClient | null;
  wallet: OfflineSigner;
  options: SigningStargateClientOptions | undefined;
  rpcEndPoint: string;
  registry: Registry;
  lcdEndpoint: string | undefined;

  constructor(rpcEndPoint: string, wallet: OfflineSigner, options?: SigningStargateClientOptions) {
    this.client = null;
    this.wallet = wallet;
    this.options = options;
    this.rpcEndPoint = rpcEndPoint;
    this.registry = new Registry(defaultRegistryTypes);
  }

  setLcdEndPoint(lcdEndpoint: string) {
    this.lcdEndpoint = lcdEndpoint;
  }

  async initClient() {
    this.client = await SigningStargateClient.connectWithSigner(this.rpcEndPoint, this.wallet, {
      broadcastPollIntervalMs: this.options?.broadcastPollIntervalMs ?? 5_000,
      accountParser: (input: any) => {
        const { typeUrl, value } = input;
        if (typeUrl === '/stride.vesting.StridePeriodicVestingAccount') {
          const baseAccount = StridePeriodicVestingAccount.decode(value).baseVestingAccount.baseAccount;
          assert(baseAccount);
          return accountFromBaseAccount(baseAccount);
        }
        return accountFromAny(input);
      },
    });
    this.client.registry.register('/cosmos.authz.v1beta1.MsgGrant', MsgGrant);
    this.client.registry.register('/cosmos.authz.v1beta1.MsgRevoke', MsgRevoke);
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
    fee: number | StdFee | 'auto',
    memo: string,
  ) {
    const messages = [
      buildGrantMsg(
        '/cosmos.staking.v1beta1.StakeAuthorization',
        fromAddress,
        botAddress,
        StakeAuthorization.encode(
          StakeAuthorization.fromPartial({
            allowList: { address: [validatorAddress] },
            maxTokens: maxTokens,
            authorizationType: 1,
          }),
        ).finish(),
        expiryDate,
      ),
    ];
    return await this.signAndBroadcastTx(fromAddress, messages, fee, memo);
  }

  async revokeRestake(fromAddress: string, grantee: string, fee: number | StdFee | 'auto', memo = '') {
    const revokeMsg = buildRevokeMsg('/cosmos.staking.v1beta1.MsgDelegate', fromAddress, grantee);
    return await this.signAndBroadcastTx(fromAddress, [revokeMsg], fee, memo);
  }

  async revokeGrant(msgType: string, fromAddress: string, grantee: string, fee: number | StdFee | 'auto', memo = '') {
    const revokeMsg = buildRevokeMsg(msgType, fromAddress, grantee);
    return await this.signAndBroadcastTx(fromAddress, [revokeMsg], fee, memo);
  }

  async simulateSend(fromAddress: string, toAddress: string, amount: Coin[], memo = '') {
    const sendMsg = getSendTokensMsg(fromAddress, toAddress, amount);
    return await this.client?.simulate(fromAddress, [sendMsg], memo);
  }

  async sendTokens(fromAddress: string, toAddress: string, amount: Coin[], fee: number | StdFee | 'auto', memo = '') {
    const sendMsg = getSendTokensMsg(fromAddress, toAddress, amount);
    return await this.signAndBroadcastTx(fromAddress, [sendMsg], fee, memo);
  }

  async sendIBCTokens(
    fromAddress: string,
    toAddress: string,
    transferAmount: Coin,
    sourcePort: string,
    sourceChannel: string,
    timeoutHeight: Height | undefined,
    timeoutTimestamp: number,
    fee: number | StdFee | 'auto',
    memo: string | undefined,
  ) {
    const transferMsg = getIbcTransferMsg(
      timeoutTimestamp,
      sourcePort,
      sourceChannel,
      fromAddress,
      toAddress,
      transferAmount,
      timeoutHeight,
    );
    return this.signAndBroadcastTx(fromAddress, [transferMsg], fee, memo);
  }

  async pollForTx(txId: string, limit = 20, pollCount = 0): Promise<DeliverTxResponse> {
    const timedOut = pollCount >= limit;
    const timeoutMs = (this.options?.broadcastPollIntervalMs ?? 2_000) * limit;
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
    await sleep(this.options?.broadcastPollIntervalMs ?? 2_000);
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

  async simulateVote(fromAddress: string, proposalId: string, option: VoteOption, memo?: string) {
    const voteMsg = getVoteMsg(option, proposalId, fromAddress);

    return await this.client?.simulate(fromAddress, [voteMsg], memo);
  }

  async vote(
    fromAddress: string,
    proposalId: string,
    option: VoteOption,
    fees: number | StdFee | 'auto',
    memo?: string,
  ) {
    const voteMsg = getVoteMsg(option, proposalId, fromAddress);
    return await this.signAndBroadcastTx(fromAddress, [voteMsg], fees, memo);
  }

  async delegate(
    delegatorAddress: string,
    validatorAddress: string,
    amount: Coin,
    fees: number | StdFee | 'auto',
    memo?: string,
  ) {
    const delegateMsg = getDelegateMsg(delegatorAddress, validatorAddress, amount);
    return await this.signAndBroadcastTx(delegatorAddress, [delegateMsg], fees, memo);
  }

  async simulateDelegate(delegatorAddress: string, validatorAddress: string, amount: Coin, memo?: string) {
    const msg = getDelegateMsg(delegatorAddress, validatorAddress, amount);

    const result = await this.simulateTx(delegatorAddress, [msg], memo);
    return result;
  }

  async unDelegate(
    delegatorAddress: string,
    validatorAddress: string,
    amount: Coin,
    fee: number | StdFee | 'auto',
    memo?: string,
  ) {
    const undelegateMsg = getUnDelegateMsg(delegatorAddress, validatorAddress, amount);
    return await this.signAndBroadcastTx(delegatorAddress, [undelegateMsg], fee, memo);
  }

  async simulateUnDelegate(delegatorAddress: string, validatorAddress: string, amount: Coin, memo?: string) {
    const msg = getUnDelegateMsg(delegatorAddress, validatorAddress, amount);
    const result = await this.client?.simulate(delegatorAddress, [msg], memo);
    return result;
  }

  async reDelegate(
    delegatorAddress: string,
    validatorDstAddress: string,
    validatorSrcAddress: string,
    amount: Coin,
    fees: number | StdFee | 'auto',
    memo?: string,
  ) {
    const msg = getRedelegateMsg(delegatorAddress, validatorDstAddress, validatorSrcAddress, amount);
    return await this.signAndBroadcastTx(delegatorAddress, [msg], fees, memo);
  }

  async simulateReDelegate(
    delegatorAddress: string,
    validatorDstAddress: string,
    validatorSrcAddress: string,
    amount: Coin,
    memo?: string,
  ) {
    const msg = getRedelegateMsg(delegatorAddress, validatorSrcAddress, validatorDstAddress, amount);
    return await this.simulateTx(delegatorAddress, [msg], memo);
  }

  async withdrawRewards(
    delegatorAddress: string,
    validatorAddresses: string[],
    fees: number | StdFee | 'auto',
    memo?: string,
  ) {
    const msg = getWithDrawRewardsMsg(validatorAddresses, delegatorAddress);
    return await this.signAndBroadcastTx(delegatorAddress, msg, fees, memo);
  }

  async simulateWithdrawRewards(delegatorAddress: string, validatorAddresses: string[], memo?: string) {
    const msg = getWithDrawRewardsMsg(validatorAddresses, delegatorAddress);

    return await this.simulateTx(delegatorAddress, msg, memo);
  }

  async simulateTx(signerAddress: string, msgs: EncodeObject[], memo = '') {
    return this.client?.simulate(signerAddress, msgs, memo);
  }

  async signAndBroadcastTx(signerAddress: string, msgs: EncodeObject[], fee: StdFee | 'auto' | number, memo = '') {
    const signedTx = await this.signTx(signerAddress, msgs, fee, memo);
    if (!signedTx) {
      throw new Error('Stargate client not initialised');
    }
    return await this.broadcastTx(signedTx);
  }

  async broadcastTx(txRaw: TxRaw) {
    if (this.client instanceof SigningStargateClient) {
      try {
        const broadcasted = await this.client
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          .forceGetTmClient()
          .broadcastTxSync({ tx: TxRaw.encode(txRaw).finish() });
        if (broadcasted.code) {
          throw new Error(`Transaction broadcast failed error code: ${broadcasted.code} ${broadcasted.log}`);
        }
        return toHex(broadcasted.hash).toUpperCase();
      } catch (e: any) {
        throw new Error(e);
      }
    } else {
      throw new Error('Stargate client not initialised');
    }
  }

  private async signTx(signerAddress: string, msgs: EncodeObject[], fee: StdFee | 'auto' | number, memo = '') {
    let usedFee: StdFee;
    if (fee === 'auto' || typeof fee === 'number') {
      if (!this.options?.gasPrice) {
        throw new Error('Gas price must be set in the client options when auto gas is used.');
      }
      const gasEstimation = await this.simulateTx(signerAddress, msgs, memo);
      const multiplier = fee !== 'auto' ? fee : 1.3;
      if (!gasEstimation) {
        throw new Error('unable to get gas estimate');
      }
      usedFee = calculateFee(Math.round(gasEstimation * multiplier), this.options?.gasPrice);
    } else {
      usedFee = fee;
    }

    return await this.client?.sign(signerAddress, msgs, usedFee, memo);
  }
}
