import { OfflineSigner, Registry } from '@cosmjs/proto-signing';
import {
  accountFromAny,
  AminoConverters,
  AminoTypes,
  Coin,
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
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Long from 'long';

import { babylonProtoRegistry } from '../proto/babylon/client';
import { AminoConverter } from '../proto/babylon/epoching/v1/tx.amino';
import { Tx } from './tx';

const createDefaultAminoConverters = (prefix: string): AminoConverters => ({
  ...createAuthzAminoConverters(),
  ...createBankAminoConverters(),
  ...createDistributionAminoConverters(),
  ...createGovAminoConverters(),
  ...createStakingAminoConverters(prefix),
  ...createIbcAminoConverters(),
  ...createFeegrantAminoConverters(),
  ...createVestingAminoConverters(),
  ...AminoConverter,
});

export class BabylonTx extends Tx {
  constructor(rpcEndPoint: string, wallet: OfflineSigner, options?: SigningStargateClientOptions) {
    super(rpcEndPoint, wallet, options);
    this.registry = new Registry([...defaultRegistryTypes, ...babylonProtoRegistry]);
  }

  async initClient() {
    this.client = await SigningStargateClient.connectWithSigner(this.rpcEndPoint, this.wallet, {
      broadcastPollIntervalMs: this.options?.broadcastPollIntervalMs ?? 5_000,
      accountParser: (input: any) => {
        return accountFromAny(input);
      },
      aminoTypes: new AminoTypes(createDefaultAminoConverters('cosmos')),
    });
    this.client.registry.register('/cosmos.authz.v1beta1.MsgGrant', MsgGrant);
    this.client.registry.register('/cosmos.authz.v1beta1.MsgRevoke', MsgRevoke);
    this.client.registry.register('/cosmos.staking.v1beta1.MsgCancelUnbondingDelegation', MsgCancelUnbondingDelegation);
  }

  async addBabylonRegistry() {
    babylonProtoRegistry.forEach((registryEntry) => this.client?.registry.register(registryEntry[0], registryEntry[1]));
  }

  delegate(
    delegatorAddress: string,
    validatorAddress: string,
    amount: Coin,
    fees: number | StdFee | 'auto',
    memo?: string,
  ) {
    const delegateMsg = this.getDelegateMsg(delegatorAddress, validatorAddress, amount);

    return this.signAndBroadcastTx(delegatorAddress, [delegateMsg], fees, memo);
  }

  simulateDelegate(delegatorAddress: string, validatorAddress: string, amount: Coin, memo?: string) {
    const delegateMsg = this.getDelegateMsg(delegatorAddress, validatorAddress, amount);

    return this.simulateTx(delegatorAddress, [delegateMsg], memo);
  }

  unDelegate(
    delegatorAddress: string,
    validatorAddress: string,
    amount: Coin,
    fee: number | StdFee | 'auto',
    memo?: string,
  ) {
    const unDelegateMsg = this.getUnDelegateMsg(delegatorAddress, validatorAddress, amount);

    return this.signAndBroadcastTx(delegatorAddress, [unDelegateMsg], fee, memo);
  }

  simulateUnDelegate(delegatorAddress: string, validatorAddress: string, amount: Coin, memo?: string) {
    const unDelegateMsg = this.getUnDelegateMsg(delegatorAddress, validatorAddress, amount);
    return this.simulateTx(delegatorAddress, [unDelegateMsg], memo);
  }

  reDelegate(
    delegatorAddress: string,
    validatorDstAddress: string,
    validatorSrcAddress: string,
    amount: Coin,
    fees: number | StdFee | 'auto',
    memo?: string,
  ) {
    const reDelegateMsg = this.getReDelegateMsg(delegatorAddress, validatorSrcAddress, validatorDstAddress, amount);

    return this.signAndBroadcastTx(delegatorAddress, [reDelegateMsg], fees, memo);
  }

  simulateReDelegate(
    delegatorAddress: string,
    validatorDstAddress: string,
    validatorSrcAddress: string,
    amount: Coin,
    memo?: string,
  ) {
    const reDelegateMsg = this.getReDelegateMsg(delegatorAddress, validatorSrcAddress, validatorDstAddress, amount);
    return this.simulateTx(delegatorAddress, [reDelegateMsg], memo);
  }

  cancelUnDelegation(
    delegatorAddress: string,
    validatorAddress: string,
    amount: Coin,
    creationHeight: string,
    fee: number | StdFee | 'auto',
    memo?: string,
  ) {
    const cancelUnDelegationMsg = {
      typeUrl: '/babylon.epoching.v1.MsgWrappedCancelUnbondingDelegation',
      value: {
        msg: {
          amount,
          creationHeight,
          delegatorAddress,
          validatorAddress,
        },
      },
    };

    return this.signAndBroadcastTx(delegatorAddress, [cancelUnDelegationMsg], fee, memo);
  }

  claimAndStake(
    delegatorAddress: string,
    validatorsWithRewards: { validator: string; amount: Coin }[],
    fees: number | StdFee | 'auto',
    memo?: string,
  ) {
    const claimAndStakeMsgs = this.getClaimAndStakeMsgs(delegatorAddress, validatorsWithRewards);

    return this.signAndBroadcastTx(delegatorAddress, claimAndStakeMsgs, fees, memo);
  }

  simulateClaimAndStake(
    delegatorAddress: string,
    validatorsWithRewards: { validator: string; amount: Coin }[],
    memo?: string,
  ) {
    const claimAndStakeMsgs = this.getClaimAndStakeMsgs(delegatorAddress, validatorsWithRewards);

    return this.simulateTx(delegatorAddress, claimAndStakeMsgs, memo);
  }

  getDelegateMsg = (delegatorAddress: string, validatorAddress: string, amount: Coin) => {
    return {
      typeUrl: '/babylon.epoching.v1.MsgWrappedDelegate',
      value: {
        msg: {
          amount,
          delegatorAddress,
          validatorAddress,
        },
      },
    };
  };

  getUnDelegateMsg = (delegatorAddress: string, validatorAddress: string, amount: Coin) => {
    return {
      typeUrl: '/babylon.epoching.v1.MsgWrappedUndelegate',
      value: {
        msg: {
          amount,
          delegatorAddress,
          validatorAddress,
        },
      },
    };
  };

  getReDelegateMsg = (
    delegatorAddress: string,
    validatorSrcAddress: string,
    validatorDstAddress: string,
    amount: Coin,
  ) => {
    return {
      typeUrl: '/babylon.epoching.v1.MsgWrappedBeginRedelegate',
      value: {
        msg: {
          amount,
          delegatorAddress,
          validatorSrcAddress,
          validatorDstAddress,
        },
      },
    };
  };

  getClaimAndStakeMsgs = (delegatorAddress: string, validatorsWithRewards: { validator: string; amount: Coin }[]) => {
    return validatorsWithRewards.map((validatorWithReward) =>
      this.getDelegateMsg(delegatorAddress, validatorWithReward.validator, validatorWithReward.amount),
    );
  };
}
