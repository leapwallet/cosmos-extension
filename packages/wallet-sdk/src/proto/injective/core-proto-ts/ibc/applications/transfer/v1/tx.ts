/* eslint-disable */
import { Coin } from '../../../../cosmos/base/v1beta1/coin';
import { Height } from '../../../core/client/v1/client';
import { BinaryReader, BinaryWriter } from '../../../../../../binary';
import { isSet, DeepPartial, Exact, Rpc } from '../../../../../../helpers';
export const protobufPackage = 'ibc.applications.transfer.v1';
/**
 * MsgTransfer defines a msg to transfer fungible tokens (i.e Coins) between
 * ICS20 enabled chains. See ICS Spec here:
 * https://github.com/cosmos/ibc/tree/master/spec/app/ics-020-fungible-token-transfer#data-structures
 */
export interface MsgTransfer {
  /** the port on which the packet will be sent */
  sourcePort: string;
  /** the channel by which the packet will be sent */
  sourceChannel: string;
  /** the tokens to be transferred */
  token: Coin;
  /** the sender address */
  sender: string;
  /** the recipient address on the destination chain */
  receiver: string;
  /**
   * Timeout height relative to the current block height.
   * The timeout is disabled when set to 0.
   */
  timeoutHeight: Height;
  /**
   * Timeout timestamp in absolute nanoseconds since unix epoch.
   * The timeout is disabled when set to 0.
   */
  timeoutTimestamp: bigint;
  /** optional memo */
  memo: string;
}
/** MsgTransferResponse defines the Msg/Transfer response type. */
export interface MsgTransferResponse {
  /** sequence number of the transfer packet sent */
  sequence: bigint;
}
function createBaseMsgTransfer(): MsgTransfer {
  return {
    sourcePort: '',
    sourceChannel: '',
    token: Coin.fromPartial({}),
    sender: '',
    receiver: '',
    timeoutHeight: Height.fromPartial({}),
    timeoutTimestamp: BigInt(0),
    memo: '',
  };
}
export const MsgTransfer = {
  typeUrl: '/ibc.applications.transfer.v1.MsgTransfer',
  encode(message: MsgTransfer, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.sourcePort !== '') {
      writer.uint32(10).string(message.sourcePort);
    }
    if (message.sourceChannel !== '') {
      writer.uint32(18).string(message.sourceChannel);
    }
    if (message.token !== undefined) {
      Coin.encode(message.token, writer.uint32(26).fork()).ldelim();
    }
    if (message.sender !== '') {
      writer.uint32(34).string(message.sender);
    }
    if (message.receiver !== '') {
      writer.uint32(42).string(message.receiver);
    }
    if (message.timeoutHeight !== undefined) {
      Height.encode(message.timeoutHeight, writer.uint32(50).fork()).ldelim();
    }
    if (message.timeoutTimestamp !== BigInt(0)) {
      writer.uint32(56).uint64(message.timeoutTimestamp);
    }
    if (message.memo !== '') {
      writer.uint32(66).string(message.memo);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgTransfer {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgTransfer();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sourcePort = reader.string();
          break;
        case 2:
          message.sourceChannel = reader.string();
          break;
        case 3:
          message.token = Coin.decode(reader, reader.uint32());
          break;
        case 4:
          message.sender = reader.string();
          break;
        case 5:
          message.receiver = reader.string();
          break;
        case 6:
          message.timeoutHeight = Height.decode(reader, reader.uint32());
          break;
        case 7:
          message.timeoutTimestamp = reader.uint64();
          break;
        case 8:
          message.memo = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): MsgTransfer {
    const obj = createBaseMsgTransfer();
    if (isSet(object.sourcePort)) obj.sourcePort = String(object.sourcePort);
    if (isSet(object.sourceChannel)) obj.sourceChannel = String(object.sourceChannel);
    if (isSet(object.token)) obj.token = Coin.fromJSON(object.token);
    if (isSet(object.sender)) obj.sender = String(object.sender);
    if (isSet(object.receiver)) obj.receiver = String(object.receiver);
    if (isSet(object.timeoutHeight)) obj.timeoutHeight = Height.fromJSON(object.timeoutHeight);
    if (isSet(object.timeoutTimestamp)) obj.timeoutTimestamp = BigInt(object.timeoutTimestamp.toString());
    if (isSet(object.memo)) obj.memo = String(object.memo);
    return obj;
  },
  toJSON(message: MsgTransfer): unknown {
    const obj: any = {};
    message.sourcePort !== undefined && (obj.sourcePort = message.sourcePort);
    message.sourceChannel !== undefined && (obj.sourceChannel = message.sourceChannel);
    message.token !== undefined && (obj.token = message.token ? Coin.toJSON(message.token) : undefined);
    message.sender !== undefined && (obj.sender = message.sender);
    message.receiver !== undefined && (obj.receiver = message.receiver);
    message.timeoutHeight !== undefined &&
      (obj.timeoutHeight = message.timeoutHeight ? Height.toJSON(message.timeoutHeight) : undefined);
    message.timeoutTimestamp !== undefined &&
      (obj.timeoutTimestamp = (message.timeoutTimestamp || BigInt(0)).toString());
    message.memo !== undefined && (obj.memo = message.memo);
    return obj;
  },
  fromPartial<I extends Exact<DeepPartial<MsgTransfer>, I>>(object: I): MsgTransfer {
    const message = createBaseMsgTransfer();
    message.sourcePort = object.sourcePort ?? '';
    message.sourceChannel = object.sourceChannel ?? '';
    if (object.token !== undefined && object.token !== null) {
      message.token = Coin.fromPartial(object.token);
    }
    message.sender = object.sender ?? '';
    message.receiver = object.receiver ?? '';
    if (object.timeoutHeight !== undefined && object.timeoutHeight !== null) {
      message.timeoutHeight = Height.fromPartial(object.timeoutHeight);
    }
    if (object.timeoutTimestamp !== undefined && object.timeoutTimestamp !== null) {
      message.timeoutTimestamp = BigInt(object.timeoutTimestamp.toString());
    }
    message.memo = object.memo ?? '';
    return message;
  },
};
function createBaseMsgTransferResponse(): MsgTransferResponse {
  return {
    sequence: BigInt(0),
  };
}
export const MsgTransferResponse = {
  typeUrl: '/ibc.applications.transfer.v1.MsgTransferResponse',
  encode(message: MsgTransferResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.sequence !== BigInt(0)) {
      writer.uint32(8).uint64(message.sequence);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgTransferResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgTransferResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sequence = reader.uint64();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): MsgTransferResponse {
    const obj = createBaseMsgTransferResponse();
    if (isSet(object.sequence)) obj.sequence = BigInt(object.sequence.toString());
    return obj;
  },
  toJSON(message: MsgTransferResponse): unknown {
    const obj: any = {};
    message.sequence !== undefined && (obj.sequence = (message.sequence || BigInt(0)).toString());
    return obj;
  },
  fromPartial<I extends Exact<DeepPartial<MsgTransferResponse>, I>>(object: I): MsgTransferResponse {
    const message = createBaseMsgTransferResponse();
    if (object.sequence !== undefined && object.sequence !== null) {
      message.sequence = BigInt(object.sequence.toString());
    }
    return message;
  },
};
/** Msg defines the ibc/transfer Msg service. */
export interface Msg {
  /** Transfer defines a rpc handler method for MsgTransfer. */
  Transfer(request: MsgTransfer): Promise<MsgTransferResponse>;
}
export class MsgClientImpl implements Msg {
  private readonly rpc: Rpc;
  constructor(rpc: Rpc) {
    this.rpc = rpc;
    this.Transfer = this.Transfer.bind(this);
  }
  Transfer(request: MsgTransfer): Promise<MsgTransferResponse> {
    const data = MsgTransfer.encode(request).finish();
    const promise = this.rpc.request('ibc.applications.transfer.v1.Msg', 'Transfer', data);
    return promise.then((data) => MsgTransferResponse.decode(new BinaryReader(data)));
  }
}
