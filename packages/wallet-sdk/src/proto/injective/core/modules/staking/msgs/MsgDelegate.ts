/* eslint-disable @typescript-eslint/no-namespace */
import { CosmosBaseV1Beta1Coin, CosmosStakingV1Beta1Tx } from '../../../../core-proto-ts';
import { convertToSnakeCase } from '../../../../utils';
import { MsgBase } from '../../MsgBase';

export declare namespace MsgDelegate {
  export interface Params {
    amount: {
      denom: string;
      amount: string;
    };
    validatorAddress: string;
    injectiveAddress: string;
  }

  export type Proto = CosmosStakingV1Beta1Tx.MsgDelegate;
}

/**
 * @category Messages
 */
export default class MsgDelegate extends MsgBase<MsgDelegate.Params, MsgDelegate.Proto> {
  static fromJSON(params: MsgDelegate.Params): MsgDelegate {
    return new MsgDelegate(params);
  }

  public toProto() {
    const { params } = this;

    const coinAmount = CosmosBaseV1Beta1Coin.Coin.fromPartial({});
    coinAmount.denom = params.amount.denom;
    coinAmount.amount = params.amount.amount;

    const message = CosmosStakingV1Beta1Tx.MsgDelegate.fromPartial({});
    message.amount = coinAmount;
    message.delegatorAddress = params.injectiveAddress;
    message.validatorAddress = params.validatorAddress;

    return CosmosStakingV1Beta1Tx.MsgDelegate.fromPartial(message);
  }

  public toData() {
    const proto = this.toProto();

    return {
      '@type': '/cosmos.staking.v1beta1.MsgDelegate',
      ...proto,
    };
  }

  public toAmino() {
    const proto = this.toProto();
    const message = {
      ...convertToSnakeCase(proto),
    };

    return {
      type: 'cosmos-sdk/MsgDelegate',
      value: message,
    };
  }

  public toWeb3() {
    const amino = this.toAmino();
    const { value } = amino;

    return {
      '@type': '/cosmos.staking.v1beta1.MsgDelegate',
      ...value,
    };
  }

  public toDirectSign() {
    const proto = this.toProto();

    return {
      type: '/cosmos.staking.v1beta1.MsgDelegate',
      message: proto,
    };
  }

  public toBinary(): Uint8Array {
    return CosmosStakingV1Beta1Tx.MsgDelegate.encode(this.toProto()).finish();
  }
}
