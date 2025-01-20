import { BinaryReader, BinaryWriter } from '../../../binary';
import {
  MsgCreateValidator,
  MsgCreateValidatorAmino,
  MsgCreateValidatorSDKType,
} from '../../core-proto-ts/cosmos/staking/v1beta1/tx';
import { BlsKey, BlsKeyAmino, BlsKeySDKType } from './bls_key';
/** MsgWrappedCreateValidator defines a wrapped message to create a validator */
export interface MsgWrappedCreateValidator {
  key?: BlsKey;
  msgCreateValidator?: MsgCreateValidator;
}
export interface MsgWrappedCreateValidatorProtoMsg {
  typeUrl: '/babylon.checkpointing.v1.MsgWrappedCreateValidator';
  value: Uint8Array;
}
/** MsgWrappedCreateValidator defines a wrapped message to create a validator */
export interface MsgWrappedCreateValidatorAmino {
  key?: BlsKeyAmino;
  msg_create_validator?: MsgCreateValidatorAmino;
}
export interface MsgWrappedCreateValidatorAminoMsg {
  type: '/babylon.checkpointing.v1.MsgWrappedCreateValidator';
  value: MsgWrappedCreateValidatorAmino;
}
/** MsgWrappedCreateValidator defines a wrapped message to create a validator */
export interface MsgWrappedCreateValidatorSDKType {
  key?: BlsKeySDKType;
  msg_create_validator?: MsgCreateValidatorSDKType;
}
/**
 * MsgWrappedCreateValidatorResponse defines the MsgWrappedCreateValidator
 * response type
 */
export interface MsgWrappedCreateValidatorResponse {}
export interface MsgWrappedCreateValidatorResponseProtoMsg {
  typeUrl: '/babylon.checkpointing.v1.MsgWrappedCreateValidatorResponse';
  value: Uint8Array;
}
/**
 * MsgWrappedCreateValidatorResponse defines the MsgWrappedCreateValidator
 * response type
 */
export interface MsgWrappedCreateValidatorResponseAmino {}
export interface MsgWrappedCreateValidatorResponseAminoMsg {
  type: '/babylon.checkpointing.v1.MsgWrappedCreateValidatorResponse';
  value: MsgWrappedCreateValidatorResponseAmino;
}
/**
 * MsgWrappedCreateValidatorResponse defines the MsgWrappedCreateValidator
 * response type
 */
export interface MsgWrappedCreateValidatorResponseSDKType {}
function createBaseMsgWrappedCreateValidator(): MsgWrappedCreateValidator {
  return {
    key: undefined,
    msgCreateValidator: undefined,
  };
}
export const MsgWrappedCreateValidator = {
  typeUrl: '/babylon.checkpointing.v1.MsgWrappedCreateValidator',
  encode(message: MsgWrappedCreateValidator, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.key !== undefined) {
      BlsKey.encode(message.key, writer.uint32(10).fork()).ldelim();
    }
    if (message.msgCreateValidator !== undefined) {
      MsgCreateValidator.encode(message.msgCreateValidator, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgWrappedCreateValidator {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgWrappedCreateValidator();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.key = BlsKey.decode(reader, reader.uint32());
          break;
        case 2:
          message.msgCreateValidator = MsgCreateValidator.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgWrappedCreateValidator>): MsgWrappedCreateValidator {
    const message = createBaseMsgWrappedCreateValidator();
    message.key = object.key !== undefined && object.key !== null ? BlsKey.fromPartial(object.key) : undefined;
    message.msgCreateValidator =
      object.msgCreateValidator !== undefined && object.msgCreateValidator !== null
        ? MsgCreateValidator.fromPartial(object.msgCreateValidator)
        : undefined;
    return message;
  },
  fromAmino(object: MsgWrappedCreateValidatorAmino): MsgWrappedCreateValidator {
    const message = createBaseMsgWrappedCreateValidator();
    if (object.key !== undefined && object.key !== null) {
      message.key = BlsKey.fromAmino(object.key);
    }
    if (object.msg_create_validator !== undefined && object.msg_create_validator !== null) {
      message.msgCreateValidator = MsgCreateValidator.fromAmino(object.msg_create_validator);
    }
    return message;
  },
  toAmino(message: MsgWrappedCreateValidator): MsgWrappedCreateValidatorAmino {
    const obj: any = {};
    obj.key = message.key ? BlsKey.toAmino(message.key) : undefined;
    obj.msg_create_validator = message.msgCreateValidator
      ? MsgCreateValidator.toAmino(message.msgCreateValidator)
      : undefined;
    return obj;
  },
  fromAminoMsg(object: MsgWrappedCreateValidatorAminoMsg): MsgWrappedCreateValidator {
    return MsgWrappedCreateValidator.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgWrappedCreateValidatorProtoMsg): MsgWrappedCreateValidator {
    return MsgWrappedCreateValidator.decode(message.value);
  },
  toProto(message: MsgWrappedCreateValidator): Uint8Array {
    return MsgWrappedCreateValidator.encode(message).finish();
  },
  toProtoMsg(message: MsgWrappedCreateValidator): MsgWrappedCreateValidatorProtoMsg {
    return {
      typeUrl: '/babylon.checkpointing.v1.MsgWrappedCreateValidator',
      value: MsgWrappedCreateValidator.encode(message).finish(),
    };
  },
};
function createBaseMsgWrappedCreateValidatorResponse(): MsgWrappedCreateValidatorResponse {
  return {};
}
export const MsgWrappedCreateValidatorResponse = {
  typeUrl: '/babylon.checkpointing.v1.MsgWrappedCreateValidatorResponse',
  encode(_: MsgWrappedCreateValidatorResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgWrappedCreateValidatorResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgWrappedCreateValidatorResponse();
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
  fromPartial(_: Partial<MsgWrappedCreateValidatorResponse>): MsgWrappedCreateValidatorResponse {
    const message = createBaseMsgWrappedCreateValidatorResponse();
    return message;
  },
  fromAmino(_: MsgWrappedCreateValidatorResponseAmino): MsgWrappedCreateValidatorResponse {
    const message = createBaseMsgWrappedCreateValidatorResponse();
    return message;
  },
  toAmino(_: MsgWrappedCreateValidatorResponse): MsgWrappedCreateValidatorResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: MsgWrappedCreateValidatorResponseAminoMsg): MsgWrappedCreateValidatorResponse {
    return MsgWrappedCreateValidatorResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgWrappedCreateValidatorResponseProtoMsg): MsgWrappedCreateValidatorResponse {
    return MsgWrappedCreateValidatorResponse.decode(message.value);
  },
  toProto(message: MsgWrappedCreateValidatorResponse): Uint8Array {
    return MsgWrappedCreateValidatorResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgWrappedCreateValidatorResponse): MsgWrappedCreateValidatorResponseProtoMsg {
    return {
      typeUrl: '/babylon.checkpointing.v1.MsgWrappedCreateValidatorResponse',
      value: MsgWrappedCreateValidatorResponse.encode(message).finish(),
    };
  },
};
