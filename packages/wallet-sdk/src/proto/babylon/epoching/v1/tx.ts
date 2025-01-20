import { BinaryReader, BinaryWriter } from '../../../binary';
import {
  MsgBeginRedelegate,
  MsgBeginRedelegateAmino,
  MsgBeginRedelegateSDKType,
  MsgCancelUnbondingDelegation,
  MsgCancelUnbondingDelegationAmino,
  MsgCancelUnbondingDelegationSDKType,
  MsgDelegate,
  MsgDelegateAmino,
  MsgDelegateSDKType,
  MsgUndelegate,
  MsgUndelegateAmino,
  MsgUndelegateSDKType,
} from '../../core-proto-ts/cosmos/staking/v1beta1/tx';
import { Params, ParamsAmino, ParamsSDKType } from './params';
/** MsgWrappedDelegate is the message for delegating stakes */
export interface MsgWrappedDelegate {
  msg?: MsgDelegate;
}
export interface MsgWrappedDelegateProtoMsg {
  typeUrl: '/babylon.epoching.v1.MsgWrappedDelegate';
  value: Uint8Array;
}
/** MsgWrappedDelegate is the message for delegating stakes */
export interface MsgWrappedDelegateAmino {
  msg?: MsgDelegateAmino;
}
export interface MsgWrappedDelegateAminoMsg {
  type: '/babylon.epoching.v1.MsgWrappedDelegate';
  value: MsgWrappedDelegateAmino;
}
/** MsgWrappedDelegate is the message for delegating stakes */
export interface MsgWrappedDelegateSDKType {
  msg?: MsgDelegateSDKType;
}
/** MsgWrappedDelegate is the response to the MsgWrappedDelegate message */
export interface MsgWrappedDelegateResponse {}
export interface MsgWrappedDelegateResponseProtoMsg {
  typeUrl: '/babylon.epoching.v1.MsgWrappedDelegateResponse';
  value: Uint8Array;
}
/** MsgWrappedDelegate is the response to the MsgWrappedDelegate message */
export interface MsgWrappedDelegateResponseAmino {}
export interface MsgWrappedDelegateResponseAminoMsg {
  type: '/babylon.epoching.v1.MsgWrappedDelegateResponse';
  value: MsgWrappedDelegateResponseAmino;
}
/** MsgWrappedDelegate is the response to the MsgWrappedDelegate message */
export interface MsgWrappedDelegateResponseSDKType {}
/** MsgWrappedUndelegate is the message for undelegating stakes */
export interface MsgWrappedUndelegate {
  msg?: MsgUndelegate;
}
export interface MsgWrappedUndelegateProtoMsg {
  typeUrl: '/babylon.epoching.v1.MsgWrappedUndelegate';
  value: Uint8Array;
}
/** MsgWrappedUndelegate is the message for undelegating stakes */
export interface MsgWrappedUndelegateAmino {
  msg?: MsgUndelegateAmino;
}
export interface MsgWrappedUndelegateAminoMsg {
  type: '/babylon.epoching.v1.MsgWrappedUndelegate';
  value: MsgWrappedUndelegateAmino;
}
/** MsgWrappedUndelegate is the message for undelegating stakes */
export interface MsgWrappedUndelegateSDKType {
  msg?: MsgUndelegateSDKType;
}
/**
 * MsgWrappedUndelegateResponse is the response to the MsgWrappedUndelegate
 * message
 */
export interface MsgWrappedUndelegateResponse {}
export interface MsgWrappedUndelegateResponseProtoMsg {
  typeUrl: '/babylon.epoching.v1.MsgWrappedUndelegateResponse';
  value: Uint8Array;
}
/**
 * MsgWrappedUndelegateResponse is the response to the MsgWrappedUndelegate
 * message
 */
export interface MsgWrappedUndelegateResponseAmino {}
export interface MsgWrappedUndelegateResponseAminoMsg {
  type: '/babylon.epoching.v1.MsgWrappedUndelegateResponse';
  value: MsgWrappedUndelegateResponseAmino;
}
/**
 * MsgWrappedUndelegateResponse is the response to the MsgWrappedUndelegate
 * message
 */
export interface MsgWrappedUndelegateResponseSDKType {}
/**
 * MsgWrappedDelegate is the message for moving bonded stakes from a
 * validator to another validator
 */
export interface MsgWrappedBeginRedelegate {
  msg?: MsgBeginRedelegate;
}
export interface MsgWrappedBeginRedelegateProtoMsg {
  typeUrl: '/babylon.epoching.v1.MsgWrappedBeginRedelegate';
  value: Uint8Array;
}
/**
 * MsgWrappedDelegate is the message for moving bonded stakes from a
 * validator to another validator
 */
export interface MsgWrappedBeginRedelegateAmino {
  msg?: MsgBeginRedelegateAmino;
}
export interface MsgWrappedBeginRedelegateAminoMsg {
  type: '/babylon.epoching.v1.MsgWrappedBeginRedelegate';
  value: MsgWrappedBeginRedelegateAmino;
}
/**
 * MsgWrappedDelegate is the message for moving bonded stakes from a
 * validator to another validator
 */
export interface MsgWrappedBeginRedelegateSDKType {
  msg?: MsgBeginRedelegateSDKType;
}
/**
 * MsgWrappedBeginRedelegateResponse is the response to the
 * MsgWrappedBeginRedelegate message
 */
export interface MsgWrappedBeginRedelegateResponse {}
export interface MsgWrappedBeginRedelegateResponseProtoMsg {
  typeUrl: '/babylon.epoching.v1.MsgWrappedBeginRedelegateResponse';
  value: Uint8Array;
}
/**
 * MsgWrappedBeginRedelegateResponse is the response to the
 * MsgWrappedBeginRedelegate message
 */
export interface MsgWrappedBeginRedelegateResponseAmino {}
export interface MsgWrappedBeginRedelegateResponseAminoMsg {
  type: '/babylon.epoching.v1.MsgWrappedBeginRedelegateResponse';
  value: MsgWrappedBeginRedelegateResponseAmino;
}
/**
 * MsgWrappedBeginRedelegateResponse is the response to the
 * MsgWrappedBeginRedelegate message
 */
export interface MsgWrappedBeginRedelegateResponseSDKType {}
/**
 * MsgWrappedCancelUnbondingDelegation is the message for cancelling
 * an unbonding delegation
 */
export interface MsgWrappedCancelUnbondingDelegation {
  msg?: MsgCancelUnbondingDelegation;
}
export interface MsgWrappedCancelUnbondingDelegationProtoMsg {
  typeUrl: '/babylon.epoching.v1.MsgWrappedCancelUnbondingDelegation';
  value: Uint8Array;
}
/**
 * MsgWrappedCancelUnbondingDelegation is the message for cancelling
 * an unbonding delegation
 */
export interface MsgWrappedCancelUnbondingDelegationAmino {
  msg?: MsgCancelUnbondingDelegationAmino;
}
export interface MsgWrappedCancelUnbondingDelegationAminoMsg {
  type: '/babylon.epoching.v1.MsgWrappedCancelUnbondingDelegation';
  value: MsgWrappedCancelUnbondingDelegationAmino;
}
/**
 * MsgWrappedCancelUnbondingDelegation is the message for cancelling
 * an unbonding delegation
 */
export interface MsgWrappedCancelUnbondingDelegationSDKType {
  msg?: MsgCancelUnbondingDelegationSDKType;
}
/**
 * MsgWrappedCancelUnbondingDelegationResponse is the response to the
 * MsgWrappedCancelUnbondingDelegation message
 */
export interface MsgWrappedCancelUnbondingDelegationResponse {}
export interface MsgWrappedCancelUnbondingDelegationResponseProtoMsg {
  typeUrl: '/babylon.epoching.v1.MsgWrappedCancelUnbondingDelegationResponse';
  value: Uint8Array;
}
/**
 * MsgWrappedCancelUnbondingDelegationResponse is the response to the
 * MsgWrappedCancelUnbondingDelegation message
 */
export interface MsgWrappedCancelUnbondingDelegationResponseAmino {}
export interface MsgWrappedCancelUnbondingDelegationResponseAminoMsg {
  type: '/babylon.epoching.v1.MsgWrappedCancelUnbondingDelegationResponse';
  value: MsgWrappedCancelUnbondingDelegationResponseAmino;
}
/**
 * MsgWrappedCancelUnbondingDelegationResponse is the response to the
 * MsgWrappedCancelUnbondingDelegation message
 */
export interface MsgWrappedCancelUnbondingDelegationResponseSDKType {}
/** MsgUpdateParams defines a message for updating epoching module parameters. */
export interface MsgUpdateParams {
  /**
   * authority is the address of the governance account.
   * just FYI: cosmos.AddressString marks that this field should use type alias
   * for AddressString instead of string, but the functionality is not yet implemented
   * in cosmos-proto
   */
  authority: string;
  /**
   * params defines the epoching parameters to update.
   *
   * NOTE: All parameters must be supplied.
   */
  params: Params;
}
export interface MsgUpdateParamsProtoMsg {
  typeUrl: '/babylon.epoching.v1.MsgUpdateParams';
  value: Uint8Array;
}
/** MsgUpdateParams defines a message for updating epoching module parameters. */
export interface MsgUpdateParamsAmino {
  /**
   * authority is the address of the governance account.
   * just FYI: cosmos.AddressString marks that this field should use type alias
   * for AddressString instead of string, but the functionality is not yet implemented
   * in cosmos-proto
   */
  authority?: string;
  /**
   * params defines the epoching parameters to update.
   *
   * NOTE: All parameters must be supplied.
   */
  params?: ParamsAmino;
}
export interface MsgUpdateParamsAminoMsg {
  type: '/babylon.epoching.v1.MsgUpdateParams';
  value: MsgUpdateParamsAmino;
}
/** MsgUpdateParams defines a message for updating epoching module parameters. */
export interface MsgUpdateParamsSDKType {
  authority: string;
  params: ParamsSDKType;
}
/** MsgUpdateParamsResponse is the response to the MsgUpdateParams message. */
export interface MsgUpdateParamsResponse {}
export interface MsgUpdateParamsResponseProtoMsg {
  typeUrl: '/babylon.epoching.v1.MsgUpdateParamsResponse';
  value: Uint8Array;
}
/** MsgUpdateParamsResponse is the response to the MsgUpdateParams message. */
export interface MsgUpdateParamsResponseAmino {}
export interface MsgUpdateParamsResponseAminoMsg {
  type: '/babylon.epoching.v1.MsgUpdateParamsResponse';
  value: MsgUpdateParamsResponseAmino;
}
/** MsgUpdateParamsResponse is the response to the MsgUpdateParams message. */
export interface MsgUpdateParamsResponseSDKType {}
function createBaseMsgWrappedDelegate(): MsgWrappedDelegate {
  return {
    msg: undefined,
  };
}
export const MsgWrappedDelegate = {
  typeUrl: '/babylon.epoching.v1.MsgWrappedDelegate',
  encode(message: MsgWrappedDelegate, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.msg !== undefined) {
      MsgDelegate.encode(message.msg, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgWrappedDelegate {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgWrappedDelegate();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.msg = MsgDelegate.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgWrappedDelegate>): MsgWrappedDelegate {
    const message = createBaseMsgWrappedDelegate();
    message.msg = object.msg !== undefined && object.msg !== null ? MsgDelegate.fromPartial(object.msg) : undefined;
    return message;
  },
  fromAmino(object: MsgWrappedDelegateAmino): MsgWrappedDelegate {
    const message = createBaseMsgWrappedDelegate();
    if (object.msg !== undefined && object.msg !== null) {
      message.msg = MsgDelegate.fromAmino(object.msg);
    }
    return message;
  },
  toAmino(message: MsgWrappedDelegate): MsgWrappedDelegateAmino {
    const obj: any = {};
    obj.msg = message.msg ? MsgDelegate.toAmino(message.msg) : undefined;
    return obj;
  },
  fromAminoMsg(object: MsgWrappedDelegateAminoMsg): MsgWrappedDelegate {
    return MsgWrappedDelegate.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgWrappedDelegateProtoMsg): MsgWrappedDelegate {
    return MsgWrappedDelegate.decode(message.value);
  },
  toProto(message: MsgWrappedDelegate): Uint8Array {
    return MsgWrappedDelegate.encode(message).finish();
  },
  toProtoMsg(message: MsgWrappedDelegate): MsgWrappedDelegateProtoMsg {
    return {
      typeUrl: '/babylon.epoching.v1.MsgWrappedDelegate',
      value: MsgWrappedDelegate.encode(message).finish(),
    };
  },
};
function createBaseMsgWrappedDelegateResponse(): MsgWrappedDelegateResponse {
  return {};
}
export const MsgWrappedDelegateResponse = {
  typeUrl: '/babylon.epoching.v1.MsgWrappedDelegateResponse',
  encode(_: MsgWrappedDelegateResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgWrappedDelegateResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgWrappedDelegateResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(_: Partial<MsgWrappedDelegateResponse>): MsgWrappedDelegateResponse {
    const message = createBaseMsgWrappedDelegateResponse();
    return message;
  },
  fromAmino(_: MsgWrappedDelegateResponseAmino): MsgWrappedDelegateResponse {
    const message = createBaseMsgWrappedDelegateResponse();
    return message;
  },
  toAmino(_: MsgWrappedDelegateResponse): MsgWrappedDelegateResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: MsgWrappedDelegateResponseAminoMsg): MsgWrappedDelegateResponse {
    return MsgWrappedDelegateResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgWrappedDelegateResponseProtoMsg): MsgWrappedDelegateResponse {
    return MsgWrappedDelegateResponse.decode(message.value);
  },
  toProto(message: MsgWrappedDelegateResponse): Uint8Array {
    return MsgWrappedDelegateResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgWrappedDelegateResponse): MsgWrappedDelegateResponseProtoMsg {
    return {
      typeUrl: '/babylon.epoching.v1.MsgWrappedDelegateResponse',
      value: MsgWrappedDelegateResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgWrappedUndelegate(): MsgWrappedUndelegate {
  return {
    msg: undefined,
  };
}
export const MsgWrappedUndelegate = {
  typeUrl: '/babylon.epoching.v1.MsgWrappedUndelegate',
  encode(message: MsgWrappedUndelegate, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.msg !== undefined) {
      MsgUndelegate.encode(message.msg, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgWrappedUndelegate {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgWrappedUndelegate();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.msg = MsgUndelegate.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgWrappedUndelegate>): MsgWrappedUndelegate {
    const message = createBaseMsgWrappedUndelegate();
    message.msg = object.msg !== undefined && object.msg !== null ? MsgUndelegate.fromPartial(object.msg) : undefined;
    return message;
  },
  fromAmino(object: MsgWrappedUndelegateAmino): MsgWrappedUndelegate {
    const message = createBaseMsgWrappedUndelegate();
    if (object.msg !== undefined && object.msg !== null) {
      message.msg = MsgUndelegate.fromAmino(object.msg);
    }
    return message;
  },
  toAmino(message: MsgWrappedUndelegate): MsgWrappedUndelegateAmino {
    const obj: any = {};
    obj.msg = message.msg ? MsgUndelegate.toAmino(message.msg) : undefined;
    return obj;
  },
  fromAminoMsg(object: MsgWrappedUndelegateAminoMsg): MsgWrappedUndelegate {
    return MsgWrappedUndelegate.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgWrappedUndelegateProtoMsg): MsgWrappedUndelegate {
    return MsgWrappedUndelegate.decode(message.value);
  },
  toProto(message: MsgWrappedUndelegate): Uint8Array {
    return MsgWrappedUndelegate.encode(message).finish();
  },
  toProtoMsg(message: MsgWrappedUndelegate): MsgWrappedUndelegateProtoMsg {
    return {
      typeUrl: '/babylon.epoching.v1.MsgWrappedUndelegate',
      value: MsgWrappedUndelegate.encode(message).finish(),
    };
  },
};
function createBaseMsgWrappedUndelegateResponse(): MsgWrappedUndelegateResponse {
  return {};
}
export const MsgWrappedUndelegateResponse = {
  typeUrl: '/babylon.epoching.v1.MsgWrappedUndelegateResponse',
  encode(_: MsgWrappedUndelegateResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgWrappedUndelegateResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgWrappedUndelegateResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(_: Partial<MsgWrappedUndelegateResponse>): MsgWrappedUndelegateResponse {
    const message = createBaseMsgWrappedUndelegateResponse();
    return message;
  },
  fromAmino(_: MsgWrappedUndelegateResponseAmino): MsgWrappedUndelegateResponse {
    const message = createBaseMsgWrappedUndelegateResponse();
    return message;
  },
  toAmino(_: MsgWrappedUndelegateResponse): MsgWrappedUndelegateResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: MsgWrappedUndelegateResponseAminoMsg): MsgWrappedUndelegateResponse {
    return MsgWrappedUndelegateResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgWrappedUndelegateResponseProtoMsg): MsgWrappedUndelegateResponse {
    return MsgWrappedUndelegateResponse.decode(message.value);
  },
  toProto(message: MsgWrappedUndelegateResponse): Uint8Array {
    return MsgWrappedUndelegateResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgWrappedUndelegateResponse): MsgWrappedUndelegateResponseProtoMsg {
    return {
      typeUrl: '/babylon.epoching.v1.MsgWrappedUndelegateResponse',
      value: MsgWrappedUndelegateResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgWrappedBeginRedelegate(): MsgWrappedBeginRedelegate {
  return {
    msg: undefined,
  };
}
export const MsgWrappedBeginRedelegate = {
  typeUrl: '/babylon.epoching.v1.MsgWrappedBeginRedelegate',
  encode(message: MsgWrappedBeginRedelegate, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.msg !== undefined) {
      MsgBeginRedelegate.encode(message.msg, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgWrappedBeginRedelegate {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgWrappedBeginRedelegate();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.msg = MsgBeginRedelegate.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgWrappedBeginRedelegate>): MsgWrappedBeginRedelegate {
    const message = createBaseMsgWrappedBeginRedelegate();
    message.msg =
      object.msg !== undefined && object.msg !== null ? MsgBeginRedelegate.fromPartial(object.msg) : undefined;
    return message;
  },
  fromAmino(object: MsgWrappedBeginRedelegateAmino): MsgWrappedBeginRedelegate {
    const message = createBaseMsgWrappedBeginRedelegate();
    if (object.msg !== undefined && object.msg !== null) {
      message.msg = MsgBeginRedelegate.fromAmino(object.msg);
    }
    return message;
  },
  toAmino(message: MsgWrappedBeginRedelegate): MsgWrappedBeginRedelegateAmino {
    const obj: any = {};
    obj.msg = message.msg ? MsgBeginRedelegate.toAmino(message.msg) : undefined;
    return obj;
  },
  fromAminoMsg(object: MsgWrappedBeginRedelegateAminoMsg): MsgWrappedBeginRedelegate {
    return MsgWrappedBeginRedelegate.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgWrappedBeginRedelegateProtoMsg): MsgWrappedBeginRedelegate {
    return MsgWrappedBeginRedelegate.decode(message.value);
  },
  toProto(message: MsgWrappedBeginRedelegate): Uint8Array {
    return MsgWrappedBeginRedelegate.encode(message).finish();
  },
  toProtoMsg(message: MsgWrappedBeginRedelegate): MsgWrappedBeginRedelegateProtoMsg {
    return {
      typeUrl: '/babylon.epoching.v1.MsgWrappedBeginRedelegate',
      value: MsgWrappedBeginRedelegate.encode(message).finish(),
    };
  },
};
function createBaseMsgWrappedBeginRedelegateResponse(): MsgWrappedBeginRedelegateResponse {
  return {};
}
export const MsgWrappedBeginRedelegateResponse = {
  typeUrl: '/babylon.epoching.v1.MsgWrappedBeginRedelegateResponse',
  encode(_: MsgWrappedBeginRedelegateResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgWrappedBeginRedelegateResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgWrappedBeginRedelegateResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(_: Partial<MsgWrappedBeginRedelegateResponse>): MsgWrappedBeginRedelegateResponse {
    const message = createBaseMsgWrappedBeginRedelegateResponse();
    return message;
  },
  fromAmino(_: MsgWrappedBeginRedelegateResponseAmino): MsgWrappedBeginRedelegateResponse {
    const message = createBaseMsgWrappedBeginRedelegateResponse();
    return message;
  },
  toAmino(_: MsgWrappedBeginRedelegateResponse): MsgWrappedBeginRedelegateResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: MsgWrappedBeginRedelegateResponseAminoMsg): MsgWrappedBeginRedelegateResponse {
    return MsgWrappedBeginRedelegateResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgWrappedBeginRedelegateResponseProtoMsg): MsgWrappedBeginRedelegateResponse {
    return MsgWrappedBeginRedelegateResponse.decode(message.value);
  },
  toProto(message: MsgWrappedBeginRedelegateResponse): Uint8Array {
    return MsgWrappedBeginRedelegateResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgWrappedBeginRedelegateResponse): MsgWrappedBeginRedelegateResponseProtoMsg {
    return {
      typeUrl: '/babylon.epoching.v1.MsgWrappedBeginRedelegateResponse',
      value: MsgWrappedBeginRedelegateResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgWrappedCancelUnbondingDelegation(): MsgWrappedCancelUnbondingDelegation {
  return {
    msg: undefined,
  };
}
export const MsgWrappedCancelUnbondingDelegation = {
  typeUrl: '/babylon.epoching.v1.MsgWrappedCancelUnbondingDelegation',
  encode(message: MsgWrappedCancelUnbondingDelegation, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.msg !== undefined) {
      MsgCancelUnbondingDelegation.encode(message.msg, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgWrappedCancelUnbondingDelegation {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgWrappedCancelUnbondingDelegation();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.msg = MsgCancelUnbondingDelegation.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgWrappedCancelUnbondingDelegation>): MsgWrappedCancelUnbondingDelegation {
    const message = createBaseMsgWrappedCancelUnbondingDelegation();
    message.msg =
      object.msg !== undefined && object.msg !== null
        ? MsgCancelUnbondingDelegation.fromPartial(object.msg)
        : undefined;
    return message;
  },
  fromAmino(object: MsgWrappedCancelUnbondingDelegationAmino): MsgWrappedCancelUnbondingDelegation {
    const message = createBaseMsgWrappedCancelUnbondingDelegation();
    if (object.msg !== undefined && object.msg !== null) {
      message.msg = MsgCancelUnbondingDelegation.fromAmino(object.msg);
    }
    return message;
  },
  toAmino(message: MsgWrappedCancelUnbondingDelegation): MsgWrappedCancelUnbondingDelegationAmino {
    const obj: any = {};
    obj.msg = message.msg ? MsgCancelUnbondingDelegation.toAmino(message.msg) : undefined;
    return obj;
  },
  fromAminoMsg(object: MsgWrappedCancelUnbondingDelegationAminoMsg): MsgWrappedCancelUnbondingDelegation {
    return MsgWrappedCancelUnbondingDelegation.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgWrappedCancelUnbondingDelegationProtoMsg): MsgWrappedCancelUnbondingDelegation {
    return MsgWrappedCancelUnbondingDelegation.decode(message.value);
  },
  toProto(message: MsgWrappedCancelUnbondingDelegation): Uint8Array {
    return MsgWrappedCancelUnbondingDelegation.encode(message).finish();
  },
  toProtoMsg(message: MsgWrappedCancelUnbondingDelegation): MsgWrappedCancelUnbondingDelegationProtoMsg {
    return {
      typeUrl: '/babylon.epoching.v1.MsgWrappedCancelUnbondingDelegation',
      value: MsgWrappedCancelUnbondingDelegation.encode(message).finish(),
    };
  },
};
function createBaseMsgWrappedCancelUnbondingDelegationResponse(): MsgWrappedCancelUnbondingDelegationResponse {
  return {};
}
export const MsgWrappedCancelUnbondingDelegationResponse = {
  typeUrl: '/babylon.epoching.v1.MsgWrappedCancelUnbondingDelegationResponse',
  encode(_: MsgWrappedCancelUnbondingDelegationResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgWrappedCancelUnbondingDelegationResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgWrappedCancelUnbondingDelegationResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(_: Partial<MsgWrappedCancelUnbondingDelegationResponse>): MsgWrappedCancelUnbondingDelegationResponse {
    const message = createBaseMsgWrappedCancelUnbondingDelegationResponse();
    return message;
  },
  fromAmino(_: MsgWrappedCancelUnbondingDelegationResponseAmino): MsgWrappedCancelUnbondingDelegationResponse {
    const message = createBaseMsgWrappedCancelUnbondingDelegationResponse();
    return message;
  },
  toAmino(_: MsgWrappedCancelUnbondingDelegationResponse): MsgWrappedCancelUnbondingDelegationResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(
    object: MsgWrappedCancelUnbondingDelegationResponseAminoMsg,
  ): MsgWrappedCancelUnbondingDelegationResponse {
    return MsgWrappedCancelUnbondingDelegationResponse.fromAmino(object.value);
  },
  fromProtoMsg(
    message: MsgWrappedCancelUnbondingDelegationResponseProtoMsg,
  ): MsgWrappedCancelUnbondingDelegationResponse {
    return MsgWrappedCancelUnbondingDelegationResponse.decode(message.value);
  },
  toProto(message: MsgWrappedCancelUnbondingDelegationResponse): Uint8Array {
    return MsgWrappedCancelUnbondingDelegationResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgWrappedCancelUnbondingDelegationResponse,
  ): MsgWrappedCancelUnbondingDelegationResponseProtoMsg {
    return {
      typeUrl: '/babylon.epoching.v1.MsgWrappedCancelUnbondingDelegationResponse',
      value: MsgWrappedCancelUnbondingDelegationResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgUpdateParams(): MsgUpdateParams {
  return {
    authority: '',
    params: Params.fromPartial({}),
  };
}
export const MsgUpdateParams = {
  typeUrl: '/babylon.epoching.v1.MsgUpdateParams',
  encode(message: MsgUpdateParams, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.authority !== '') {
      writer.uint32(10).string(message.authority);
    }
    if (message.params !== undefined) {
      Params.encode(message.params, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgUpdateParams {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgUpdateParams();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.authority = reader.string();
          break;
        case 2:
          message.params = Params.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgUpdateParams>): MsgUpdateParams {
    const message = createBaseMsgUpdateParams();
    message.authority = object.authority ?? '';
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    message.params =
      object.params !== undefined && object.params !== null ? Params.fromPartial(object.params) : undefined;
    return message;
  },
  fromAmino(object: MsgUpdateParamsAmino): MsgUpdateParams {
    const message = createBaseMsgUpdateParams();
    if (object.authority !== undefined && object.authority !== null) {
      message.authority = object.authority;
    }
    if (object.params !== undefined && object.params !== null) {
      message.params = Params.fromAmino(object.params);
    }
    return message;
  },
  toAmino(message: MsgUpdateParams): MsgUpdateParamsAmino {
    const obj: any = {};
    obj.authority = message.authority === '' ? undefined : message.authority;
    obj.params = message.params ? Params.toAmino(message.params) : undefined;
    return obj;
  },
  fromAminoMsg(object: MsgUpdateParamsAminoMsg): MsgUpdateParams {
    return MsgUpdateParams.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgUpdateParamsProtoMsg): MsgUpdateParams {
    return MsgUpdateParams.decode(message.value);
  },
  toProto(message: MsgUpdateParams): Uint8Array {
    return MsgUpdateParams.encode(message).finish();
  },
  toProtoMsg(message: MsgUpdateParams): MsgUpdateParamsProtoMsg {
    return {
      typeUrl: '/babylon.epoching.v1.MsgUpdateParams',
      value: MsgUpdateParams.encode(message).finish(),
    };
  },
};
function createBaseMsgUpdateParamsResponse(): MsgUpdateParamsResponse {
  return {};
}
export const MsgUpdateParamsResponse = {
  typeUrl: '/babylon.epoching.v1.MsgUpdateParamsResponse',
  encode(_: MsgUpdateParamsResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgUpdateParamsResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgUpdateParamsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(_: Partial<MsgUpdateParamsResponse>): MsgUpdateParamsResponse {
    const message = createBaseMsgUpdateParamsResponse();
    return message;
  },
  fromAmino(_: MsgUpdateParamsResponseAmino): MsgUpdateParamsResponse {
    const message = createBaseMsgUpdateParamsResponse();
    return message;
  },
  toAmino(_: MsgUpdateParamsResponse): MsgUpdateParamsResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: MsgUpdateParamsResponseAminoMsg): MsgUpdateParamsResponse {
    return MsgUpdateParamsResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgUpdateParamsResponseProtoMsg): MsgUpdateParamsResponse {
    return MsgUpdateParamsResponse.decode(message.value);
  },
  toProto(message: MsgUpdateParamsResponse): Uint8Array {
    return MsgUpdateParamsResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgUpdateParamsResponse): MsgUpdateParamsResponseProtoMsg {
    return {
      typeUrl: '/babylon.epoching.v1.MsgUpdateParamsResponse',
      value: MsgUpdateParamsResponse.encode(message).finish(),
    };
  },
};
