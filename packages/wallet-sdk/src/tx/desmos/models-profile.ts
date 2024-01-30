import { Any } from 'cosmjs-types/google/protobuf/any';
import Long from 'long';
import * as _m0 from 'protobufjs/minimal';

export interface Timestamp {
  seconds: Long;
  nanos: number;
}

export interface Pictures {
  profile: string;
  cover: string;
}

export interface Profile {
  account?: Any;
  dtag: string;
  nickname: string;
  bio: string;
  pictures?: Pictures;
  creationDate?: Timestamp;
}

function createBaseProfile(): Profile {
  return {
    account: undefined,
    dtag: '',
    nickname: '',
    bio: '',
    pictures: undefined,
    creationDate: undefined,
  };
}

export const Profile = {
  decode(input: _m0.Reader | Uint8Array, length?: number): Profile {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseProfile();

    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.account = Any.decode(reader, reader.uint32());
          break;
        case 2:
          message.dtag = reader.string();
          break;
        case 3:
          message.nickname = reader.string();
          break;
        case 4:
          message.bio = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },
};
