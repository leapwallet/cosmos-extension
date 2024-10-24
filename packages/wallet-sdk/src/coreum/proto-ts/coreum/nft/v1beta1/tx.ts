import _m0 from 'protobufjs/minimal';

/** MsgSend represents a message to send a nft from one account to another account. */
export interface MsgSend {
  /** class_id defines the unique identifier of the nft classification, similar to the contract address of ERC721 */
  classId: string;
  /** id defines the unique identification of nft */
  id: string;
  /** sender is the address of the owner of nft */
  sender: string;
  /** receiver is the receiver address of nft */
  receiver: string;
}

function createBaseMsgSend(): MsgSend {
  return { classId: '', id: '', sender: '', receiver: '' };
}

export const MsgSend = {
  encode(message: MsgSend, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.classId !== '') {
      writer.uint32(10).string(message.classId);
    }
    if (message.id !== '') {
      writer.uint32(18).string(message.id);
    }
    if (message.sender !== '') {
      writer.uint32(26).string(message.sender);
    }
    if (message.receiver !== '') {
      writer.uint32(34).string(message.receiver);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgSend {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSend();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.classId = reader.string();
          continue;
        case 2:
          if (tag != 18) {
            break;
          }

          message.id = reader.string();
          continue;
        case 3:
          if (tag != 26) {
            break;
          }

          message.sender = reader.string();
          continue;
        case 4:
          if (tag != 34) {
            break;
          }

          message.receiver = reader.string();
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MsgSend {
    return {
      classId: isSet(object.classId) ? String(object.classId) : '',
      id: isSet(object.id) ? String(object.id) : '',
      sender: isSet(object.sender) ? String(object.sender) : '',
      receiver: isSet(object.receiver) ? String(object.receiver) : '',
    };
  },

  toJSON(message: MsgSend): unknown {
    const obj: any = {};
    message.classId !== undefined && (obj.classId = message.classId);
    message.id !== undefined && (obj.id = message.id);
    message.sender !== undefined && (obj.sender = message.sender);
    message.receiver !== undefined && (obj.receiver = message.receiver);
    return obj;
  },

  create<I extends Exact<DeepPartial<MsgSend>, I>>(base?: I): MsgSend {
    return MsgSend.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MsgSend>, I>>(object: I): MsgSend {
    const message = createBaseMsgSend();
    message.classId = object.classId ?? '';
    message.id = object.id ?? '';
    message.sender = object.sender ?? '';
    message.receiver = object.receiver ?? '';
    return message;
  },
};

// eslint-disable-next-line @typescript-eslint/ban-types
type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

export type DeepPartial<T> = T extends Builtin
  ? T
  : T extends Long
  ? string | number | Long
  : T extends Array<infer U>
  ? Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U>
  ? ReadonlyArray<DeepPartial<U>>
  : // eslint-disable-next-line @typescript-eslint/ban-types
  T extends {}
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

type KeysOfUnion<T> = T extends T ? keyof T : never;

export type Exact<P, I extends P> = P extends Builtin
  ? P
  : P & { [K in keyof P]: Exact<P[K], I[K]> } & { [K in Exclude<keyof I, KeysOfUnion<P>>]: never };

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
