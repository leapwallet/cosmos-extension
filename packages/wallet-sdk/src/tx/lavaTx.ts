import { Coin, GeneratedType, OfflineSigner, Registry } from '@cosmjs/proto-signing';
import {
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
import { MsgGrant, MsgRevoke } from 'cosmjs-types/cosmos/authz/v1beta1/tx.js';
import { MsgCancelUnbondingDelegation } from 'cosmjs-types/cosmos/staking/v1beta1/tx.js';

import { MsgClaimRewards, MsgDelegate, MsgRedelegate, MsgUnbond } from '../proto/lava/tx';
import { AminoConverter } from '../proto/lava/tx.amino';
import { registry } from '../proto/lava/tx.registry';
import { simulateTx } from './simulate';
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
    ...AminoConverter,
  };
}

export class LavaTx extends Tx {
  constructor(rpcEndPoint: string, wallet: OfflineSigner, options?: SigningStargateClientOptions) {
    super(rpcEndPoint, wallet, options);
    this.registry = new Registry([...defaultRegistryTypes, ...(registry as ReadonlyArray<[string, GeneratedType]>)]);
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

  async addLavaRegistry() {
    (registry as ReadonlyArray<[string, GeneratedType]>).forEach((registryEntry) =>
      this.client?.registry.register(registryEntry[0], registryEntry[1]),
    );
  }

  async delegateLava(
    fromAddress: string,
    validatorAddress: string,
    providerAddress: string,
    specID: string,
    amount: Coin,
    fee: number | StdFee | 'auto',
    memo = '',
  ) {
    const delegateMessage = {
      typeUrl: '/lavanet.lava.dualstaking.MsgDelegate',
      value: {
        creator: fromAddress,
        validator: validatorAddress,
        provider: providerAddress,
        chainID: specID,
        amount: amount,
      },
    };

    return await this.signAndBroadcastTx(fromAddress, [delegateMessage], fee, memo);
  }

  async claimProviderRewards(fromAddress: string, providerAddress: string, fee: number | StdFee | 'auto', memo = '') {
    const claimRewardsMessage = {
      typeUrl: '/lavanet.lava.dualstaking.MsgClaimRewards',
      value: {
        creator: fromAddress,
        provider: providerAddress,
      },
    };

    return await this.signAndBroadcastTx(fromAddress, [claimRewardsMessage], fee, memo);
  }

  async unDelegateLava(
    fromAddress: string,
    validatorAddress: string,
    providerAddress: string,
    specID: string,
    amount: Coin,
    fee: number | StdFee | 'auto',
    memo = '',
  ) {
    const unbondMessage = {
      typeUrl: '/lavanet.lava.dualstaking.MsgUnbond',
      value: {
        creator: fromAddress,
        validator: validatorAddress,
        provider: providerAddress,
        chainID: specID,
        amount: amount,
      },
    };

    return await this.signAndBroadcastTx(fromAddress, [unbondMessage], fee, memo);
  }

  async reDelegateLava(
    fromAddress: string,
    toProviderAddress: string,
    fromProviderAddress: string,
    toSpecID: string,
    fromSpecID: string,
    amount: Coin,
    fee: number | StdFee | 'auto',
    memo = '',
  ) {
    const redelegateMessage = {
      typeUrl: '/lavanet.lava.dualstaking.MsgRedelegate',
      value: {
        creator: fromAddress,
        fromProvider: fromProviderAddress,
        toProvider: toProviderAddress,
        fromChainID: fromSpecID,
        toChainID: toSpecID,
        amount: amount,
      },
    };

    return await this.signAndBroadcastTx(fromAddress, [redelegateMessage], fee, memo);
  }
}

export async function simulateDelegateLava(
  lcdEndpoint: string,
  fromAddress: string,
  validatorAddress: string,
  providerAddress: string,
  specID: string,
  amount: Coin,
) {
  const encodedMsg = {
    typeUrl: '/lavanet.lava.dualstaking.MsgDelegate',
    value: MsgDelegate.encode({
      creator: fromAddress,
      validator: validatorAddress,
      provider: providerAddress,
      amount: amount,
      chainID: specID,
    }).finish(),
  };
  return await simulateTx(lcdEndpoint, fromAddress, [encodedMsg]);
}

export async function simulateUnDelegateLava(
  lcdEndpoint: string,
  fromAddress: string,
  validatorAddress: string,
  providerAddress: string,
  specID: string,
  amount: Coin,
) {
  const encodedMsg = {
    typeUrl: '/lavanet.lava.dualstaking.MsgUnbond',
    value: MsgUnbond.encode({
      creator: fromAddress,
      validator: validatorAddress,
      provider: providerAddress,
      amount: amount,
      chainID: specID,
    }).finish(),
  };
  return await simulateTx(lcdEndpoint, fromAddress, [encodedMsg]);
}

export async function simulateReDelegateLava(
  lcdEndpoint: string,
  fromAddress: string,
  toProviderAddress: string,
  fromProviderAddress: string,
  toSpecID: string,
  fromSpecID: string,
  amount: Coin,
) {
  const encodedMsg = {
    typeUrl: '/lavanet.lava.dualstaking.MsgRedelegate',
    value: MsgRedelegate.encode({
      creator: fromAddress,
      fromProvider: fromProviderAddress,
      toProvider: toProviderAddress,
      fromChainID: fromSpecID,
      toChainID: toSpecID,
      amount: amount,
    }).finish(),
  };
  return await simulateTx(lcdEndpoint, fromAddress, [encodedMsg]);
}

export async function simulateClaimProviderRewards(lcdEndpoint: string, fromAddress: string, providerAddress: string) {
  const encodedMsg = {
    typeUrl: '/lavanet.lava.dualstaking.MsgClaimRewards',
    value: MsgClaimRewards.encode({
      creator: fromAddress,
      provider: providerAddress,
    }).finish(),
  };
  return await simulateTx(lcdEndpoint, fromAddress, [encodedMsg]);
}
