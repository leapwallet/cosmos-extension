import { CosmosBaseV1Beta1Coin, IbcApplicationsTransferV1Tx, IbcCoreClientV1Client } from '../../../../core-proto-ts';
import { convertToSnakeCase } from '../../../../utils';
import { MsgBase } from '../../MsgBase';

// eslint-disable-next-line @typescript-eslint/no-namespace
export declare namespace MsgTransfer {
  export interface Params {
    amount: {
      denom: string;
      amount: string;
    };
    memo?: string;
    sender: string;
    port: string;
    receiver: string;
    channelId: string;
    timeout?: number;
    height?: {
      revisionHeight: number;
      revisionNumber: number;
    };
  }

  export type Proto = IbcApplicationsTransferV1Tx.MsgTransfer;
}

/**
 * @category Messages
 */
export default class MsgTransfer extends MsgBase<MsgTransfer.Params, MsgTransfer.Proto> {
  static fromJSON(params: MsgTransfer.Params): MsgTransfer {
    return new MsgTransfer(params);
  }

  public toProto() {
    const { params } = this;

    const token = CosmosBaseV1Beta1Coin.Coin.fromPartial({});
    token.denom = params.amount.denom;
    token.amount = params.amount.amount;

    const message = IbcApplicationsTransferV1Tx.MsgTransfer.fromPartial({});
    message.receiver = params.receiver;
    message.sender = params.sender;
    message.sourceChannel = params.channelId;
    message.sourcePort = params.port;
    message.token = token;

    if (params.height) {
      const timeoutHeight = IbcCoreClientV1Client.Height.fromPartial({});
      timeoutHeight.revisionHeight = BigInt(params.height.revisionHeight.toString());
      timeoutHeight.revisionNumber = BigInt(params.height.revisionNumber.toString());

      message.timeoutHeight = timeoutHeight;
    }

    if (params.timeout) {
      message.timeoutTimestamp = BigInt(params.timeout.toString());
    }

    message.memo = params.memo || '';

    return message;
  }

  public toData() {
    const proto = this.toProto();

    return {
      '@type': '/ibc.applications.transfer.v1.MsgTransfer',
      ...proto,
    };
  }

  public toAmino() {
    const proto = this.toProto();
    const message = {
      ...convertToSnakeCase(proto),
    };

    return {
      type: 'cosmos-sdk/MsgTransfer',
      value: {
        ...message,
        memo: message.memo || '',
      } as unknown as IbcApplicationsTransferV1Tx.MsgTransfer,
    };
  }

  public toWeb3() {
    const amino = this.toAmino();
    const { value } = amino;

    return {
      '@type': '/ibc.applications.transfer.v1.MsgTransfer',
      ...value,
    };
  }

  public toDirectSign() {
    const proto = this.toProto();

    return {
      type: '/ibc.applications.transfer.v1.MsgTransfer',
      message: proto,
    };
  }

  public toBinary(): Uint8Array {
    return IbcApplicationsTransferV1Tx.MsgTransfer.encode(this.toProto()).finish();
  }
}
