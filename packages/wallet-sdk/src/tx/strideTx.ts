import { Uint64 } from '@cosmjs/math';
import { decodePubkey, GeneratedType, OfflineSigner, Registry } from '@cosmjs/proto-signing';
import {
  Account,
  accountFromAny,
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
import { assert } from '@cosmjs/utils';
import { BaseAccount } from 'cosmjs-types/cosmos/auth/v1beta1/auth';
import { MsgGrant, MsgRevoke } from 'cosmjs-types/cosmos/authz/v1beta1/tx.js';
import { MsgCancelUnbondingDelegation } from 'cosmjs-types/cosmos/staking/v1beta1/tx.js';

import { StridePeriodicVestingAccount } from './liquidStakeRegistry/stride/periodic-vesting-account';
import { MsgLiquidStake, MsgRedeemStake } from './liquidStakeRegistry/stride/tx';
import { AminoConverter as LiquidAminoConverters } from './liquidStakeRegistry/stride/tx.amino';
import { registry as LiquidStakingRegistry } from './liquidStakeRegistry/stride/tx.registry';
import { simulateTx } from './simulate';
import { Tx } from './tx';

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

export function createDefaultAminoConverters(prefix: string): AminoConverters {
  return {
    ...createAuthzAminoConverters(),
    ...createBankAminoConverters(),
    ...createDistributionAminoConverters(),
    ...createGovAminoConverters(),
    ...createStakingAminoConverters(prefix),
    ...createIbcAminoConverters(),
    ...createFeegrantAminoConverters(),
    ...createVestingAminoConverters(),
    ...LiquidAminoConverters,
  };
}

export class StrideTx extends Tx {
  constructor(rpcEndPoint: string, wallet: OfflineSigner, options?: SigningStargateClientOptions) {
    super(rpcEndPoint, wallet, options);
    this.registry = new Registry([
      ...defaultRegistryTypes,
      ...(LiquidStakingRegistry as ReadonlyArray<[string, GeneratedType]>),
    ]);
  }

  async initClient() {
    if (!this.wallet) throw new Error('Wallet not connected');
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
      aminoTypes: new AminoTypes(createDefaultAminoConverters('cosmos')),
    });
    this.client.registry.register('/cosmos.authz.v1beta1.MsgGrant', MsgGrant);
    this.client.registry.register('/cosmos.authz.v1beta1.MsgRevoke', MsgRevoke);
    this.client.registry.register('/cosmos.staking.v1beta1.MsgCancelUnbondingDelegation', MsgCancelUnbondingDelegation);
  }

  async addStrideRegistry() {
    (LiquidStakingRegistry as ReadonlyArray<[string, GeneratedType]>).forEach((registryEntry) =>
      this.client?.registry.register(registryEntry[0], registryEntry[1]),
    );
  }

  async liquidStake(fromAddress: string, amount: string, hostDenom: string, fee: number | StdFee | 'auto', memo = '') {
    const liquidStakeMessage = {
      typeUrl: '/stride.stakeibc.MsgLiquidStake',
      value: {
        creator: fromAddress,
        amount: amount,
        hostDenom: hostDenom,
      },
    };

    return await this.signAndBroadcastTx(fromAddress, [liquidStakeMessage], fee, memo);
  }

  async redeemliquidStake(
    fromAddress: string,
    amount: string,
    hostZone: string,
    receiver: string,
    fee: number | StdFee | 'auto',
    memo = '',
  ) {
    const redeemLiquidStakeMessage = {
      typeUrl: '/stride.stakeibc.MsgRedeemStake',
      value: {
        creator: fromAddress,
        amount: amount,
        hostZone: hostZone,
        receiver: receiver,
      },
    };

    return await this.signAndBroadcastTx(fromAddress, [redeemLiquidStakeMessage], fee, memo);
  }
}

export async function simulateStrideLiquidStaking(
  lcdEndpoint: string,
  fromAddress: string,
  amount: string,
  hostDenom: string,
) {
  const encodedMsg = {
    typeUrl: '/stride.stakeibc.MsgLiquidStake',
    value: MsgLiquidStake.encode({
      creator: fromAddress,
      amount: amount,
      hostDenom: hostDenom,
    }).finish(),
  };
  return await simulateTx(lcdEndpoint, fromAddress, [encodedMsg]);
}

export async function simulateStrideRedeemLiquidStaking(
  lcdEndpoint: string,
  fromAddress: string,
  amount: string,
  hostZone: string,
  receiver: string,
) {
  const encodedMsg = {
    typeUrl: '/stride.stakeibc.MsgRedeemStake',
    value: MsgRedeemStake.encode({
      creator: fromAddress,
      amount: amount,
      hostZone: hostZone,
      receiver: receiver,
    }).finish(),
  };
  return await simulateTx(lcdEndpoint, fromAddress, [encodedMsg]);
}
