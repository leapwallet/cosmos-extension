import { Coin, GeneratedType, OfflineSigner, Registry } from '@cosmjs/proto-signing';
import {
  AminoConverters,
  AminoTypes,
  createAuthzAminoConverters,
  createBankAminoConverters,
  createDistributionAminoConverters,
  createFeegrantAminoConverters,
  createGovAminoConverters,
  createIbcAminoConverters,
  createStakingAminoConverters,
  createVestingAminoConverters,
  defaultRegistryTypes,
  SigningStargateClient,
  SigningStargateClientOptions,
  StdFee,
} from '@cosmjs/stargate';
import { MsgGrant, MsgRevoke } from 'cosmjs-types/cosmos/authz/v1beta1/tx.js';
import { MsgCancelUnbondingDelegation } from 'cosmjs-types/cosmos/staking/v1beta1/tx.js';

// import {
//   AuthInfo,
//   Coin as InitiaCoin,
//   Fee as InitiaFee,
//   ModeInfo,
//   MsgBeginRedelegate,
//   MsgCancelUnbondingDelegation,
//   MsgDelegate,
//   MsgUndelegate,
//   MsgWithdrawDelegatorReward,
//   SignerInfo,
//   SimplePublicKey,
//   Tx as InitiaJsTx,
//   TxBody,
// } from '@initia/initia.js';
import { initiaAminoConverters as InitiaAminoConverters } from '../proto/initia/client';
import { initiaProtoRegistry as InitiaRegistry } from '../proto/initia/client';
import {
  getInitiaCancelUnbondingDelegationMsg,
  getInitiaClaimAndStakeMsg,
  getInitiaDelegateMsg,
  getInitiaRedelegateMsg,
  getInitiaUndelegateMsg,
} from './msgs/initia';
import { Tx } from './tx';

function createDefaultAminoConverters(prefix: string): AminoConverters {
  return {
    ...createAuthzAminoConverters(),
    ...createBankAminoConverters(),
    ...createDistributionAminoConverters(),
    ...createGovAminoConverters(),
    ...createStakingAminoConverters(prefix),
    ...createIbcAminoConverters(),
    ...createFeegrantAminoConverters(),
    ...createVestingAminoConverters(),
    ...InitiaAminoConverters,
  };
}

export class InitiaTx extends Tx {
  constructor(rpcEndPoint: string, wallet: OfflineSigner, options?: SigningStargateClientOptions) {
    super(rpcEndPoint, wallet, options);
    this.registry = new Registry([
      ...defaultRegistryTypes,
      ...(InitiaRegistry as ReadonlyArray<[string, GeneratedType]>),
    ]);
  }

  async initClient() {
    this.client = await SigningStargateClient.connectWithSigner(this.rpcEndPoint, this.wallet, {
      broadcastPollIntervalMs: this.options?.broadcastPollIntervalMs ?? 5_000,
      aminoTypes: new AminoTypes(createDefaultAminoConverters('cosmos')),
    });
    this.client.registry.register('/cosmos.authz.v1beta1.MsgGrant', MsgGrant);
    this.client.registry.register('/cosmos.authz.v1beta1.MsgRevoke', MsgRevoke);
    this.client.registry.register('/cosmos.staking.v1beta1.MsgCancelUnbondingDelegation', MsgCancelUnbondingDelegation);
  }

  async addInitiaRegistry() {
    (InitiaRegistry as ReadonlyArray<[string, GeneratedType]>).forEach((registryEntry) =>
      this.client?.registry.register(registryEntry[0], registryEntry[1]),
    );
  }

  async delegate(
    delegatorAddress: string,
    validatorAddress: string,
    amount: Coin,
    fees: number | StdFee | 'auto',
    memo?: string,
  ) {
    const delegateMsg = getInitiaDelegateMsg(delegatorAddress, validatorAddress, amount);
    return await this.signAndBroadcastTx(delegatorAddress, [delegateMsg], fees as StdFee, memo);
  }

  async unDelegate(
    delegatorAddress: string,
    validatorAddress: string,
    amount: Coin,
    fees: number | StdFee | 'auto',
    memo?: string,
  ) {
    const undelegateMsg = getInitiaUndelegateMsg(delegatorAddress, validatorAddress, amount);
    return await this.signAndBroadcastTx(delegatorAddress, [undelegateMsg], fees as StdFee, memo);
  }

  async reDelegate(
    delegatorAddress: string,
    validatorSrcAddress: string,
    validatorDstAddress: string,
    amount: Coin,
    fees: number | StdFee | 'auto',
    memo?: string,
  ) {
    const redelegateMsg = getInitiaRedelegateMsg(delegatorAddress, validatorSrcAddress, validatorDstAddress, amount);
    return await this.signAndBroadcastTx(delegatorAddress, [redelegateMsg], fees as StdFee, memo);
  }

  async cancelUnDelegation(
    delegatorAddress: string,
    validatorAddress: string,
    amount: Coin,
    creationHeight: string,
    fees: number | StdFee | 'auto',
    memo?: string,
  ) {
    const cancelUnbondingDelegationMsg = getInitiaCancelUnbondingDelegationMsg(
      delegatorAddress,
      validatorAddress,
      amount,
      creationHeight,
    );
    return await this.signAndBroadcastTx(delegatorAddress, [cancelUnbondingDelegationMsg], fees as StdFee, memo);
  }

  async claimAndStake(
    delegatorAddress: string,
    validatorsWithRewards: { validator: string; amount: Coin }[],
    fees: number | StdFee | 'auto',
    memo?: string,
  ) {
    const claimAndStakeMsg = getInitiaClaimAndStakeMsg(delegatorAddress, validatorsWithRewards);
    return await this.signAndBroadcastTx(delegatorAddress, claimAndStakeMsg, fees as StdFee, memo);
  }
}
