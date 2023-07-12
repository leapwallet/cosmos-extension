import { GeneratedType, OfflineSigner, Registry } from '@cosmjs/proto-signing';
import { defaultRegistryTypes, SigningStargateClientOptions } from '@cosmjs/stargate';
import { StdFee } from '@cosmjs/stargate';

import { MsgLiquidStake, MsgRedeemStake } from './liquidStakeRegistry/stride/tx';
import { registry as LiquidStakingRegistry } from './liquidStakeRegistry/stride/tx.registry';
import { simulateTx } from './simulate';
import { Tx } from './tx';

export class StrideTx extends Tx {
  constructor(rpcEndPoint: string, wallet: OfflineSigner, options?: SigningStargateClientOptions) {
    super(rpcEndPoint, wallet, options);
    this.registry = new Registry([
      ...defaultRegistryTypes,
      ...(LiquidStakingRegistry as ReadonlyArray<[string, GeneratedType]>),
    ]);
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
