import { BinaryReader, BinaryWriter } from '../../../binary';
import { BTCSpvProof, BTCSpvProofAmino, BTCSpvProofSDKType } from './btccheckpoint';
import { Params, ParamsAmino, ParamsSDKType } from './params';
/**
 * MsgInsertBTCSpvProof defines resquest to insert a new checkpoint into the
 * store
 */
export interface MsgInsertBTCSpvProof {
  submitter: string;
  proofs: BTCSpvProof[];
}
export interface MsgInsertBTCSpvProofProtoMsg {
  typeUrl: '/babylon.btccheckpoint.v1.MsgInsertBTCSpvProof';
  value: Uint8Array;
}
/**
 * MsgInsertBTCSpvProof defines resquest to insert a new checkpoint into the
 * store
 */
export interface MsgInsertBTCSpvProofAmino {
  submitter?: string;
  proofs?: BTCSpvProofAmino[];
}
export interface MsgInsertBTCSpvProofAminoMsg {
  type: '/babylon.btccheckpoint.v1.MsgInsertBTCSpvProof';
  value: MsgInsertBTCSpvProofAmino;
}
/**
 * MsgInsertBTCSpvProof defines resquest to insert a new checkpoint into the
 * store
 */
export interface MsgInsertBTCSpvProofSDKType {
  submitter: string;
  proofs: BTCSpvProofSDKType[];
}
/**
 * MsgInsertBTCSpvProofResponse defines the response for the
 * MsgInsertBTCSpvProof message
 */
export interface MsgInsertBTCSpvProofResponse {}
export interface MsgInsertBTCSpvProofResponseProtoMsg {
  typeUrl: '/babylon.btccheckpoint.v1.MsgInsertBTCSpvProofResponse';
  value: Uint8Array;
}
/**
 * MsgInsertBTCSpvProofResponse defines the response for the
 * MsgInsertBTCSpvProof message
 */
export interface MsgInsertBTCSpvProofResponseAmino {}
export interface MsgInsertBTCSpvProofResponseAminoMsg {
  type: '/babylon.btccheckpoint.v1.MsgInsertBTCSpvProofResponse';
  value: MsgInsertBTCSpvProofResponseAmino;
}
/**
 * MsgInsertBTCSpvProofResponse defines the response for the
 * MsgInsertBTCSpvProof message
 */
export interface MsgInsertBTCSpvProofResponseSDKType {}
/** MsgUpdateParams defines a message to update the btccheckpoint module params. */
export interface MsgUpdateParams {
  /**
   * authority is the address of the governance account.
   * just FYI: cosmos.AddressString marks that this field should use type alias
   * for AddressString instead of string, but the functionality is not yet implemented
   * in cosmos-proto
   */
  authority: string;
  /**
   * params defines the btccheckpoint parameters to update.
   *
   * NOTE: All parameters must be supplied.
   */
  params: Params;
}
export interface MsgUpdateParamsProtoMsg {
  typeUrl: '/babylon.btccheckpoint.v1.MsgUpdateParams';
  value: Uint8Array;
}
/** MsgUpdateParams defines a message to update the btccheckpoint module params. */
export interface MsgUpdateParamsAmino {
  /**
   * authority is the address of the governance account.
   * just FYI: cosmos.AddressString marks that this field should use type alias
   * for AddressString instead of string, but the functionality is not yet implemented
   * in cosmos-proto
   */
  authority?: string;
  /**
   * params defines the btccheckpoint parameters to update.
   *
   * NOTE: All parameters must be supplied.
   */
  params?: ParamsAmino;
}
export interface MsgUpdateParamsAminoMsg {
  type: '/babylon.btccheckpoint.v1.MsgUpdateParams';
  value: MsgUpdateParamsAmino;
}
/** MsgUpdateParams defines a message to update the btccheckpoint module params. */
export interface MsgUpdateParamsSDKType {
  authority: string;
  params: ParamsSDKType;
}
/** MsgUpdateParamsResponse defines the response to the MsgUpdateParams message. */
export interface MsgUpdateParamsResponse {}
export interface MsgUpdateParamsResponseProtoMsg {
  typeUrl: '/babylon.btccheckpoint.v1.MsgUpdateParamsResponse';
  value: Uint8Array;
}
/** MsgUpdateParamsResponse defines the response to the MsgUpdateParams message. */
export interface MsgUpdateParamsResponseAmino {}
export interface MsgUpdateParamsResponseAminoMsg {
  type: '/babylon.btccheckpoint.v1.MsgUpdateParamsResponse';
  value: MsgUpdateParamsResponseAmino;
}
/** MsgUpdateParamsResponse defines the response to the MsgUpdateParams message. */
export interface MsgUpdateParamsResponseSDKType {}
function createBaseMsgInsertBTCSpvProof(): MsgInsertBTCSpvProof {
  return {
    submitter: '',
    proofs: [],
  };
}
export const MsgInsertBTCSpvProof = {
  typeUrl: '/babylon.btccheckpoint.v1.MsgInsertBTCSpvProof',
  encode(message: MsgInsertBTCSpvProof, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.submitter !== '') {
      writer.uint32(10).string(message.submitter);
    }
    for (const v of message.proofs) {
      BTCSpvProof.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgInsertBTCSpvProof {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgInsertBTCSpvProof();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.submitter = reader.string();
          break;
        case 2:
          message.proofs.push(BTCSpvProof.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgInsertBTCSpvProof>): MsgInsertBTCSpvProof {
    const message = createBaseMsgInsertBTCSpvProof();
    message.submitter = object.submitter ?? '';
    message.proofs = object.proofs?.map((e) => BTCSpvProof.fromPartial(e)) || [];
    return message;
  },
  fromAmino(object: MsgInsertBTCSpvProofAmino): MsgInsertBTCSpvProof {
    const message = createBaseMsgInsertBTCSpvProof();
    if (object.submitter !== undefined && object.submitter !== null) {
      message.submitter = object.submitter;
    }
    message.proofs = object.proofs?.map((e) => BTCSpvProof.fromAmino(e)) || [];
    return message;
  },
  toAmino(message: MsgInsertBTCSpvProof): MsgInsertBTCSpvProofAmino {
    const obj: any = {};
    obj.submitter = message.submitter === '' ? undefined : message.submitter;
    if (message.proofs) {
      obj.proofs = message.proofs.map((e) => (e ? BTCSpvProof.toAmino(e) : undefined));
    } else {
      obj.proofs = message.proofs;
    }
    return obj;
  },
  fromAminoMsg(object: MsgInsertBTCSpvProofAminoMsg): MsgInsertBTCSpvProof {
    return MsgInsertBTCSpvProof.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgInsertBTCSpvProofProtoMsg): MsgInsertBTCSpvProof {
    return MsgInsertBTCSpvProof.decode(message.value);
  },
  toProto(message: MsgInsertBTCSpvProof): Uint8Array {
    return MsgInsertBTCSpvProof.encode(message).finish();
  },
  toProtoMsg(message: MsgInsertBTCSpvProof): MsgInsertBTCSpvProofProtoMsg {
    return {
      typeUrl: '/babylon.btccheckpoint.v1.MsgInsertBTCSpvProof',
      value: MsgInsertBTCSpvProof.encode(message).finish(),
    };
  },
};
function createBaseMsgInsertBTCSpvProofResponse(): MsgInsertBTCSpvProofResponse {
  return {};
}
export const MsgInsertBTCSpvProofResponse = {
  typeUrl: '/babylon.btccheckpoint.v1.MsgInsertBTCSpvProofResponse',
  encode(_: MsgInsertBTCSpvProofResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgInsertBTCSpvProofResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgInsertBTCSpvProofResponse();
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
  fromPartial(_: Partial<MsgInsertBTCSpvProofResponse>): MsgInsertBTCSpvProofResponse {
    const message = createBaseMsgInsertBTCSpvProofResponse();
    return message;
  },
  fromAmino(_: MsgInsertBTCSpvProofResponseAmino): MsgInsertBTCSpvProofResponse {
    const message = createBaseMsgInsertBTCSpvProofResponse();
    return message;
  },
  toAmino(_: MsgInsertBTCSpvProofResponse): MsgInsertBTCSpvProofResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: MsgInsertBTCSpvProofResponseAminoMsg): MsgInsertBTCSpvProofResponse {
    return MsgInsertBTCSpvProofResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgInsertBTCSpvProofResponseProtoMsg): MsgInsertBTCSpvProofResponse {
    return MsgInsertBTCSpvProofResponse.decode(message.value);
  },
  toProto(message: MsgInsertBTCSpvProofResponse): Uint8Array {
    return MsgInsertBTCSpvProofResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgInsertBTCSpvProofResponse): MsgInsertBTCSpvProofResponseProtoMsg {
    return {
      typeUrl: '/babylon.btccheckpoint.v1.MsgInsertBTCSpvProofResponse',
      value: MsgInsertBTCSpvProofResponse.encode(message).finish(),
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
  typeUrl: '/babylon.btccheckpoint.v1.MsgUpdateParams',
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
      typeUrl: '/babylon.btccheckpoint.v1.MsgUpdateParams',
      value: MsgUpdateParams.encode(message).finish(),
    };
  },
};
function createBaseMsgUpdateParamsResponse(): MsgUpdateParamsResponse {
  return {};
}
export const MsgUpdateParamsResponse = {
  typeUrl: '/babylon.btccheckpoint.v1.MsgUpdateParamsResponse',
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
      typeUrl: '/babylon.btccheckpoint.v1.MsgUpdateParamsResponse',
      value: MsgUpdateParamsResponse.encode(message).finish(),
    };
  },
};
