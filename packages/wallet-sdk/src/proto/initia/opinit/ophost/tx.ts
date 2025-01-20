// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import Long from 'long';

import { BinaryReader, BinaryWriter } from '../../../binary';
import { Coin, CoinAmino } from '../../../coin';
import { base64FromBytes, bytesFromBase64 } from '../../../helpers';
/** MsgRecordBatch is no_op message, which is only for tx indexing. */

/** MsgInitiateTokenDeposit is a message to deposit a new token from L1 to L2. */
export interface MsgInitiateTokenDeposit {
  sender: string;
  bridgeId: bigint | Long;
  to: string;
  amount: Coin;
  data?: Uint8Array;
}
export interface MsgInitiateTokenDepositProtoMsg {
  typeUrl: '/opinit.ophost.v1.MsgInitiateTokenDeposit';
  value: Uint8Array;
}
/** MsgInitiateTokenDeposit is a message to deposit a new token from L1 to L2. */
export interface MsgInitiateTokenDepositAmino {
  sender?: string;
  bridge_id?: string;
  to?: string;
  amount: CoinAmino;
  data?: string;
}
export interface MsgInitiateTokenDepositAminoMsg {
  type: 'ophost/MsgInitiateTokenDeposit';
  value: MsgInitiateTokenDepositAmino;
}

/** MsgInitiateTokenDepositResponse returns a message handle result. */
export interface MsgInitiateTokenDepositResponse {
  sequence: bigint | Long;
}
export interface MsgInitiateTokenDepositResponseProtoMsg {
  typeUrl: '/opinit.ophost.v1.MsgInitiateTokenDepositResponse';
  value: Uint8Array;
}
/** MsgInitiateTokenDepositResponse returns a message handle result. */
export interface MsgInitiateTokenDepositResponseAmino {
  sequence?: string;
}
export interface MsgInitiateTokenDepositResponseAminoMsg {
  type: '/opinit.ophost.v1.MsgInitiateTokenDepositResponse';
  value: MsgInitiateTokenDepositResponseAmino;
}

export function createBaseMsgInitiateTokenDeposit(): MsgInitiateTokenDeposit {
  return {
    sender: '',
    bridgeId: BigInt(0),
    to: '',
    amount: Coin.fromPartial({}),
    data: undefined,
  };
}
export const MsgInitiateTokenDeposit = {
  typeUrl: '/opinit.ophost.v1.MsgInitiateTokenDeposit',
  encode(message: MsgInitiateTokenDeposit, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.sender !== '') {
      writer.uint32(10).string(message.sender);
    }
    if (typeof message.bridgeId === 'bigint' ? message.bridgeId !== BigInt(0) : !message.bridgeId.isZero()) {
      writer.uint32(16).uint64(message.bridgeId.toString());
    }
    if (message.to !== '') {
      writer.uint32(26).string(message.to);
    }
    if (message.amount !== undefined) {
      Coin.encode(message.amount, writer.uint32(34).fork()).ldelim();
    }
    if (message.data !== undefined) {
      writer.uint32(42).bytes(message.data);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgInitiateTokenDeposit {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgInitiateTokenDeposit();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sender = reader.string();
          break;
        case 2:
          message.bridgeId = reader.uint64();
          break;
        case 3:
          message.to = reader.string();
          break;
        case 4:
          message.amount = Coin.decode(reader, reader.uint32());
          break;
        case 5:
          message.data = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgInitiateTokenDeposit>): MsgInitiateTokenDeposit {
    const message = createBaseMsgInitiateTokenDeposit();
    message.sender = object.sender ?? '';
    message.bridgeId =
      object.bridgeId !== undefined && object.bridgeId !== null ? BigInt(object.bridgeId.toString()) : BigInt(0);
    message.to = object.to ?? '';
    message.amount =
      object.amount !== undefined && object.amount !== null ? Coin.fromPartial(object.amount) : undefined;
    message.data = object.data ?? undefined;
    return message;
  },
  fromAmino(object: MsgInitiateTokenDepositAmino): MsgInitiateTokenDeposit {
    const message = createBaseMsgInitiateTokenDeposit();
    if (object.sender !== undefined && object.sender !== null) {
      message.sender = object.sender;
    }
    if (object.bridge_id !== undefined && object.bridge_id !== null) {
      message.bridgeId = BigInt(object.bridge_id.toString());
    }
    if (object.to !== undefined && object.to !== null) {
      message.to = object.to;
    }
    if (object.amount !== undefined && object.amount !== null) {
      message.amount = Coin.fromAmino(object.amount);
    }
    if (object.data !== undefined && object.data !== null) {
      message.data = bytesFromBase64(object.data);
    }
    return message;
  },
  toAmino(message: MsgInitiateTokenDeposit): MsgInitiateTokenDepositAmino {
    const isBridgeIdNotZero =
      typeof message.bridgeId === 'bigint' ? message.bridgeId !== BigInt(0) : !message.bridgeId.isZero();
    const obj: any = {};
    obj.sender = message.sender === '' ? undefined : message.sender;
    obj.bridge_id = isBridgeIdNotZero ? message.bridgeId?.toString() : undefined;
    obj.to = message.to === '' ? undefined : message.to;
    obj.amount = message.amount ? Coin.toAmino(message.amount) : Coin.toAmino(Coin.fromPartial({}));
    obj.data = message.data ? base64FromBytes(message.data) : undefined;
    return obj;
  },
  fromAminoMsg(object: MsgInitiateTokenDepositAminoMsg): MsgInitiateTokenDeposit {
    return MsgInitiateTokenDeposit.fromAmino(object.value);
  },
  toAminoMsg(message: MsgInitiateTokenDeposit): MsgInitiateTokenDepositAminoMsg {
    return {
      type: 'ophost/MsgInitiateTokenDeposit',
      value: MsgInitiateTokenDeposit.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgInitiateTokenDepositProtoMsg): MsgInitiateTokenDeposit {
    return MsgInitiateTokenDeposit.decode(message.value);
  },
  toProto(message: MsgInitiateTokenDeposit): Uint8Array {
    return MsgInitiateTokenDeposit.encode(message).finish();
  },
  toProtoMsg(message: MsgInitiateTokenDeposit): MsgInitiateTokenDepositProtoMsg {
    return {
      typeUrl: '/opinit.ophost.v1.MsgInitiateTokenDeposit',
      value: MsgInitiateTokenDeposit.encode(message).finish(),
    };
  },
};
export function createBaseMsgInitiateTokenDepositResponse(): MsgInitiateTokenDepositResponse {
  return {
    sequence: BigInt(0),
  };
}
export const MsgInitiateTokenDepositResponse = {
  typeUrl: '/opinit.ophost.v1.MsgInitiateTokenDepositResponse',
  encode(message: MsgInitiateTokenDepositResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (typeof message.sequence === 'bigint' ? message.sequence !== BigInt(0) : !message.sequence.isZero()) {
      writer.uint32(8).uint64(message.sequence);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgInitiateTokenDepositResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgInitiateTokenDepositResponse();
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
  fromPartial(object: Partial<MsgInitiateTokenDepositResponse>): MsgInitiateTokenDepositResponse {
    const message = createBaseMsgInitiateTokenDepositResponse();
    message.sequence =
      object.sequence !== undefined && object.sequence !== null ? BigInt(object.sequence.toString()) : BigInt(0);
    return message;
  },
  fromAmino(object: MsgInitiateTokenDepositResponseAmino): MsgInitiateTokenDepositResponse {
    const message = createBaseMsgInitiateTokenDepositResponse();
    if (object.sequence !== undefined && object.sequence !== null) {
      message.sequence = BigInt(object.sequence.toString());
    }
    return message;
  },
  toAmino(message: MsgInitiateTokenDepositResponse): MsgInitiateTokenDepositResponseAmino {
    const obj: any = {};
    const isSequenceNotZero =
      typeof message.sequence === 'bigint' ? message.sequence !== BigInt(0) : !message.sequence.isZero();
    obj.sequence = isSequenceNotZero ? message.sequence?.toString() : undefined;
    return obj;
  },
  fromAminoMsg(object: MsgInitiateTokenDepositResponseAminoMsg): MsgInitiateTokenDepositResponse {
    return MsgInitiateTokenDepositResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgInitiateTokenDepositResponseProtoMsg): MsgInitiateTokenDepositResponse {
    return MsgInitiateTokenDepositResponse.decode(message.value);
  },
  toProto(message: MsgInitiateTokenDepositResponse): Uint8Array {
    return MsgInitiateTokenDepositResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgInitiateTokenDepositResponse): MsgInitiateTokenDepositResponseProtoMsg {
    return {
      typeUrl: '/opinit.ophost.v1.MsgInitiateTokenDepositResponse',
      value: MsgInitiateTokenDepositResponse.encode(message).finish(),
    };
  },
};
