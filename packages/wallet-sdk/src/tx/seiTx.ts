import { OfflineSigner } from '@cosmjs/proto-signing';
import { Coin, DeliverTxResponse, SigningStargateClient, StdFee, TimeoutError } from '@cosmjs/stargate';
import { getSigningClient } from '@sei-js/core';
import { VoteOption } from 'cosmjs-types/cosmos/gov/v1beta1/gov';
import { Height } from 'cosmjs-types/ibc/core/client/v1/client';

import { sleep } from '../utils/sleep';
import {
  buildRevokeMsg,
  getCancelUnDelegationMsg,
  getDelegateMsg,
  getRedelegateMsg,
  getUnDelegateMsg,
  getVoteMsg,
  getWithDrawRewardsMsg,
} from './msgs/cosmos';
import { getTxData } from './utils';

export class SeiTxHandler {
  protected client: SigningStargateClient | null;

  constructor(private lcdEndpoint: string | undefined, private rpcEndPoint: string, private wallet: OfflineSigner) {
    this.client = null;
  }

  async initClient() {
    this.client = await getSigningClient(this.rpcEndPoint, this.wallet);
  }

  async sendTokens(fromAddress: string, toAddress: string, amount: Coin[], fee: number | StdFee | 'auto', memo = '') {
    const sendResponse = await this.client?.sendTokens(fromAddress, toAddress, amount, fee, memo);
    return sendResponse?.transactionHash ?? '';
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
    const ibcResponse = await this.client?.sendIbcTokens(
      fromAddress,
      toAddress,
      transferAmount,
      sourcePort,
      sourceChannel,
      timeoutHeight,
      timeoutTimestamp,
      fee,
      memo,
    );

    return ibcResponse?.transactionHash ?? '';
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
    const result = await getTxData(txId, this?.lcdEndpoint ?? '');

    return result && result.code !== 3
      ? {
          code: result.code,
          height: result.height,
          rawLog: result.rawLog,
          transactionHash: txId,
          gasUsed: result.gasUsed,
          gasWanted: result.gasWanted,
          //this is added just to make the interface compatible with CosmosClient
          events: [],
        }
      : this.pollForTx(txId, limit, pollCount + 1);
  }

  async vote(
    fromAddress: string,
    proposalId: string,
    option: VoteOption,
    fees: number | StdFee | 'auto',
    memo?: string,
  ) {
    const voteMsg = getVoteMsg(option, proposalId, fromAddress);
    const result = await this.client?.signAndBroadcast(fromAddress, [voteMsg], fees, memo);
    return result?.transactionHash ?? '';
  }

  async delegate(
    delegatorAddress: string,
    validatorAddress: string,
    amount: Coin,
    fees: number | StdFee | 'auto',
    memo?: string,
  ) {
    const delegateMsg = getDelegateMsg(delegatorAddress, validatorAddress, amount);
    const result = await this.client?.signAndBroadcast(delegatorAddress, [delegateMsg], fees, memo);
    return result?.transactionHash ?? '';
  }

  async unDelegate(
    delegatorAddress: string,
    validatorAddress: string,
    amount: Coin,
    fee: number | StdFee | 'auto',
    memo?: string,
  ) {
    const undelegateMsg = getUnDelegateMsg(delegatorAddress, validatorAddress, amount);
    const result = await this.client?.signAndBroadcast(delegatorAddress, [undelegateMsg], fee, memo);
    return result?.transactionHash ?? '';
  }

  async cancelUnDelegation(
    delegatorAddress: string,
    validatorAddress: string,
    amount: Coin,
    creationHeight: string,
    fee: number | StdFee | 'auto',
    memo?: string,
  ) {
    const cancleUndelegateMsg = getCancelUnDelegationMsg(delegatorAddress, validatorAddress, amount, creationHeight);
    const result = await this.client?.signAndBroadcast(delegatorAddress, [cancleUndelegateMsg], fee, memo);
    return result?.transactionHash ?? '';
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
    const result = await this.client?.signAndBroadcast(delegatorAddress, [msg], fees, memo);
    return result?.transactionHash ?? '';
  }

  async withdrawRewards(
    delegatorAddress: string,
    validatorAddresses: string[],
    fees: number | StdFee | 'auto',
    memo?: string,
  ) {
    const msg = getWithDrawRewardsMsg(validatorAddresses, delegatorAddress);
    const result = await this.client?.signAndBroadcast(delegatorAddress, msg, fees, memo);
    return result?.transactionHash ?? '';
  }

  async revokeGrant(msgType: string, fromAddress: string, grantee: string, fee: number | StdFee | 'auto', memo = '') {
    const revokeMsg = buildRevokeMsg(msgType, fromAddress, grantee);
    const result = await this.client?.signAndBroadcast(fromAddress, [revokeMsg], fee, memo);
    return result?.transactionHash ?? '';
  }
}
