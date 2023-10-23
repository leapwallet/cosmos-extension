/* eslint-disable */
import * as _m0 from 'protobufjs/minimal';

export const protobufPackage = 'OmniFlix.onft.v1beta1';

export interface MsgTransferONFT {
  id: string;
  denomId: string;
  sender: string;
  recipient: string;
}

export interface MsgTransferONFTResponse {}

function createBaseMsgTransferONFT(): MsgTransferONFT {
  return { id: '', denomId: '', sender: '', recipient: '' };
}

export const MsgTransferONFT = {
  encode(message: MsgTransferONFT, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== '') {
      writer.uint32(10).string(message.id);
    }
    if (message.denomId !== '') {
      writer.uint32(18).string(message.denomId);
    }
    if (message.sender !== '') {
      writer.uint32(26).string(message.sender);
    }
    if (message.recipient !== '') {
      writer.uint32(34).string(message.recipient);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgTransferONFT {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgTransferONFT();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string();
          break;
        case 2:
          message.denomId = reader.string();
          break;
        case 3:
          message.sender = reader.string();
          break;
        case 4:
          message.recipient = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MsgTransferONFT {
    return {
      id: isSet(object.id) ? String(object.id) : '',
      denomId: isSet(object.denomId) ? String(object.denomId) : '',
      sender: isSet(object.sender) ? String(object.sender) : '',
      recipient: isSet(object.recipient) ? String(object.recipient) : '',
    };
  },

  toJSON(message: MsgTransferONFT): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = message.id);
    message.denomId !== undefined && (obj.denomId = message.denomId);
    message.sender !== undefined && (obj.sender = message.sender);
    message.recipient !== undefined && (obj.recipient = message.recipient);
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgTransferONFT>, I>>(base?: I): MsgTransferONFT {
    return MsgTransferONFT.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MsgTransferONFT>, I>>(object: I): MsgTransferONFT {
    const message = createBaseMsgTransferONFT();
    message.id = object.id ?? '';
    message.denomId = object.denomId ?? '';
    message.sender = object.sender ?? '';
    message.recipient = object.recipient ?? '';
    return message;
  },
};

function createBaseMsgTransferONFTResponse(): MsgTransferONFTResponse {
  return {};
}

export const MsgTransferONFTResponse = {
  encode(_: MsgTransferONFTResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgTransferONFTResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgTransferONFTResponse();
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

  fromJSON(_: any): MsgTransferONFTResponse {
    return {};
  },

  toJSON(_: MsgTransferONFTResponse): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgTransferONFTResponse>, I>>(base?: I): MsgTransferONFTResponse {
    return MsgTransferONFTResponse.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MsgTransferONFTResponse>, I>>(_: I): MsgTransferONFTResponse {
    const message = createBaseMsgTransferONFTResponse();
    return message;
  },
};

export interface Msg {
  TransferONFT(request: MsgTransferONFT): Promise<MsgTransferONFTResponse>;
}

export class MsgClientImpl implements Msg {
  private readonly rpc: Rpc;
  private readonly service: string;

  constructor(rpc: Rpc, opts?: { service?: string }) {
    this.service = opts?.service || 'OmniFlix.onft.v1beta1.Msg';
    this.rpc = rpc;
    this.TransferONFT = this.TransferONFT.bind(this);
  }

  TransferONFT(request: MsgTransferONFT): Promise<MsgTransferONFTResponse> {
    const data = MsgTransferONFT.encode(request).finish();
    const promise = this.rpc.request(this.service, 'TransferONFT', data);
    return promise.then((data) => MsgTransferONFTResponse.decode(new _m0.Reader(data)));
  }
}

interface Rpc {
  request(service: string, method: string, data: Uint8Array): Promise<Uint8Array>;
}

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

export type DeepPartial<T> = T extends Builtin
  ? T
  : T extends Array<infer U>
  ? Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U>
  ? ReadonlyArray<DeepPartial<U>>
  : T extends {}
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin
  ? P
  : P & { [K in keyof P]: Exact<P[K], I[K]> } & { [K in Exclude<keyof I, KeysOfUnion<P>>]: never };

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
