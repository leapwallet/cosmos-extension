import { BinaryReader, BinaryWriter } from '../../../binary';
import { base64FromBytes, bytesFromBase64 } from '../../../helpers';
import { Params, ParamsAmino, ParamsSDKType } from './params';
/** MsgInsertHeaders defines the message for multiple incoming header bytes */
export interface MsgInsertHeaders {
  signer: string;
  headers: Uint8Array[];
}
export interface MsgInsertHeadersProtoMsg {
  typeUrl: '/babylon.btclightclient.v1.MsgInsertHeaders';
  value: Uint8Array;
}
/** MsgInsertHeaders defines the message for multiple incoming header bytes */
export interface MsgInsertHeadersAmino {
  signer?: string;
  headers?: string[];
}
export interface MsgInsertHeadersAminoMsg {
  type: '/babylon.btclightclient.v1.MsgInsertHeaders';
  value: MsgInsertHeadersAmino;
}
/** MsgInsertHeaders defines the message for multiple incoming header bytes */
export interface MsgInsertHeadersSDKType {
  signer: string;
  headers: Uint8Array[];
}
/** MsgInsertHeadersResponse defines the response for the InsertHeaders transaction */
export interface MsgInsertHeadersResponse {}
export interface MsgInsertHeadersResponseProtoMsg {
  typeUrl: '/babylon.btclightclient.v1.MsgInsertHeadersResponse';
  value: Uint8Array;
}
/** MsgInsertHeadersResponse defines the response for the InsertHeaders transaction */
export interface MsgInsertHeadersResponseAmino {}
export interface MsgInsertHeadersResponseAminoMsg {
  type: '/babylon.btclightclient.v1.MsgInsertHeadersResponse';
  value: MsgInsertHeadersResponseAmino;
}
/** MsgInsertHeadersResponse defines the response for the InsertHeaders transaction */
export interface MsgInsertHeadersResponseSDKType {}
/** MsgUpdateParams defines a message for updating btc light client module parameters. */
export interface MsgUpdateParams {
  /**
   * authority is the address of the governance account.
   * just FYI: cosmos.AddressString marks that this field should use type alias
   * for AddressString instead of string, but the functionality is not yet implemented
   * in cosmos-proto
   */
  authority: string;
  /**
   * params defines the btc light client parameters to update.
   *
   * NOTE: All parameters must be supplied.
   */
  params: Params;
}
export interface MsgUpdateParamsProtoMsg {
  typeUrl: '/babylon.btclightclient.v1.MsgUpdateParams';
  value: Uint8Array;
}
/** MsgUpdateParams defines a message for updating btc light client module parameters. */
export interface MsgUpdateParamsAmino {
  /**
   * authority is the address of the governance account.
   * just FYI: cosmos.AddressString marks that this field should use type alias
   * for AddressString instead of string, but the functionality is not yet implemented
   * in cosmos-proto
   */
  authority?: string;
  /**
   * params defines the btc light client parameters to update.
   *
   * NOTE: All parameters must be supplied.
   */
  params?: ParamsAmino;
}
export interface MsgUpdateParamsAminoMsg {
  type: '/babylon.btclightclient.v1.MsgUpdateParams';
  value: MsgUpdateParamsAmino;
}
/** MsgUpdateParams defines a message for updating btc light client module parameters. */
export interface MsgUpdateParamsSDKType {
  authority: string;
  params: ParamsSDKType;
}
/** MsgUpdateParamsResponse is the response to the MsgUpdateParams message. */
export interface MsgUpdateParamsResponse {}
export interface MsgUpdateParamsResponseProtoMsg {
  typeUrl: '/babylon.btclightclient.v1.MsgUpdateParamsResponse';
  value: Uint8Array;
}
/** MsgUpdateParamsResponse is the response to the MsgUpdateParams message. */
export interface MsgUpdateParamsResponseAmino {}
export interface MsgUpdateParamsResponseAminoMsg {
  type: '/babylon.btclightclient.v1.MsgUpdateParamsResponse';
  value: MsgUpdateParamsResponseAmino;
}
/** MsgUpdateParamsResponse is the response to the MsgUpdateParams message. */
export interface MsgUpdateParamsResponseSDKType {}
function createBaseMsgInsertHeaders(): MsgInsertHeaders {
  return {
    signer: '',
    headers: [],
  };
}
export const MsgInsertHeaders = {
  typeUrl: '/babylon.btclightclient.v1.MsgInsertHeaders',
  encode(message: MsgInsertHeaders, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.signer !== '') {
      writer.uint32(10).string(message.signer);
    }
    for (const v of message.headers) {
      writer.uint32(18).bytes(v!);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgInsertHeaders {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgInsertHeaders();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.signer = reader.string();
          break;
        case 2:
          message.headers.push(reader.bytes());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgInsertHeaders>): MsgInsertHeaders {
    const message = createBaseMsgInsertHeaders();
    message.signer = object.signer ?? '';
    message.headers = object.headers?.map((e) => e) || [];
    return message;
  },
  fromAmino(object: MsgInsertHeadersAmino): MsgInsertHeaders {
    const message = createBaseMsgInsertHeaders();
    if (object.signer !== undefined && object.signer !== null) {
      message.signer = object.signer;
    }
    message.headers = object.headers?.map((e) => bytesFromBase64(e)) || [];
    return message;
  },
  toAmino(message: MsgInsertHeaders): MsgInsertHeadersAmino {
    const obj: any = {};
    obj.signer = message.signer === '' ? undefined : message.signer;
    if (message.headers) {
      obj.headers = message.headers.map((e) => base64FromBytes(e));
    } else {
      obj.headers = message.headers;
    }
    return obj;
  },
  fromAminoMsg(object: MsgInsertHeadersAminoMsg): MsgInsertHeaders {
    return MsgInsertHeaders.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgInsertHeadersProtoMsg): MsgInsertHeaders {
    return MsgInsertHeaders.decode(message.value);
  },
  toProto(message: MsgInsertHeaders): Uint8Array {
    return MsgInsertHeaders.encode(message).finish();
  },
  toProtoMsg(message: MsgInsertHeaders): MsgInsertHeadersProtoMsg {
    return {
      typeUrl: '/babylon.btclightclient.v1.MsgInsertHeaders',
      value: MsgInsertHeaders.encode(message).finish(),
    };
  },
};
function createBaseMsgInsertHeadersResponse(): MsgInsertHeadersResponse {
  return {};
}
export const MsgInsertHeadersResponse = {
  typeUrl: '/babylon.btclightclient.v1.MsgInsertHeadersResponse',
  encode(_: MsgInsertHeadersResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgInsertHeadersResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgInsertHeadersResponse();
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
  fromPartial(_: Partial<MsgInsertHeadersResponse>): MsgInsertHeadersResponse {
    const message = createBaseMsgInsertHeadersResponse();
    return message;
  },
  fromAmino(_: MsgInsertHeadersResponseAmino): MsgInsertHeadersResponse {
    const message = createBaseMsgInsertHeadersResponse();
    return message;
  },
  toAmino(_: MsgInsertHeadersResponse): MsgInsertHeadersResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: MsgInsertHeadersResponseAminoMsg): MsgInsertHeadersResponse {
    return MsgInsertHeadersResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgInsertHeadersResponseProtoMsg): MsgInsertHeadersResponse {
    return MsgInsertHeadersResponse.decode(message.value);
  },
  toProto(message: MsgInsertHeadersResponse): Uint8Array {
    return MsgInsertHeadersResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgInsertHeadersResponse): MsgInsertHeadersResponseProtoMsg {
    return {
      typeUrl: '/babylon.btclightclient.v1.MsgInsertHeadersResponse',
      value: MsgInsertHeadersResponse.encode(message).finish(),
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
  typeUrl: '/babylon.btclightclient.v1.MsgUpdateParams',
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
      typeUrl: '/babylon.btclightclient.v1.MsgUpdateParams',
      value: MsgUpdateParams.encode(message).finish(),
    };
  },
};
function createBaseMsgUpdateParamsResponse(): MsgUpdateParamsResponse {
  return {};
}
export const MsgUpdateParamsResponse = {
  typeUrl: '/babylon.btclightclient.v1.MsgUpdateParamsResponse',
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
      typeUrl: '/babylon.btclightclient.v1.MsgUpdateParamsResponse',
      value: MsgUpdateParamsResponse.encode(message).finish(),
    };
  },
};
