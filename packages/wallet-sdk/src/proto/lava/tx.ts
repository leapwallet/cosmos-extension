import { BinaryReader, BinaryWriter } from '../binary';
import { Coin, CoinAmino, CoinSDKType } from '../coin';
import { isSet } from '../helpers';
export interface MsgDelegate {
  creator: string;
  validator: string;
  provider: string;
  chainID: string;
  amount: Coin;
}
export interface MsgDelegateProtoMsg {
  typeUrl: '/lavanet.lava.dualstaking.MsgDelegate';
  value: Uint8Array;
}
export interface MsgDelegateAmino {
  creator?: string;
  validator?: string;
  provider?: string;
  chainID?: string;
  amount?: CoinAmino;
}
export interface MsgDelegateAminoMsg {
  type: '/lavanet.lava.dualstaking.MsgDelegate';
  value: MsgDelegateAmino;
}
export interface MsgDelegateSDKType {
  creator: string;
  validator: string;
  provider: string;
  chainID: string;
  amount: CoinSDKType;
}
export interface MsgDelegateResponse {}
export interface MsgDelegateResponseProtoMsg {
  typeUrl: '/lavanet.lava.dualstaking.MsgDelegateResponse';
  value: Uint8Array;
}
export interface MsgDelegateResponseAmino {}
export interface MsgDelegateResponseAminoMsg {
  type: '/lavanet.lava.dualstaking.MsgDelegateResponse';
  value: MsgDelegateResponseAmino;
}
export interface MsgDelegateResponseSDKType {}
export interface MsgRedelegate {
  creator: string;
  fromProvider: string;
  toProvider: string;
  fromChainID: string;
  toChainID: string;
  amount: Coin;
}
export interface MsgRedelegateProtoMsg {
  typeUrl: '/lavanet.lava.dualstaking.MsgRedelegate';
  value: Uint8Array;
}
export interface MsgRedelegateAmino {
  creator?: string;
  from_provider?: string;
  to_provider?: string;
  from_chainID?: string;
  to_chainID?: string;
  amount?: CoinAmino;
}
export interface MsgRedelegateAminoMsg {
  type: '/lavanet.lava.dualstaking.MsgRedelegate';
  value: MsgRedelegateAmino;
}
export interface MsgRedelegateSDKType {
  creator: string;
  from_provider: string;
  to_provider: string;
  from_chainID: string;
  to_chainID: string;
  amount: CoinSDKType;
}
export interface MsgRedelegateResponse {}
export interface MsgRedelegateResponseProtoMsg {
  typeUrl: '/lavanet.lava.dualstaking.MsgRedelegateResponse';
  value: Uint8Array;
}
export interface MsgRedelegateResponseAmino {}
export interface MsgRedelegateResponseAminoMsg {
  type: '/lavanet.lava.dualstaking.MsgRedelegateResponse';
  value: MsgRedelegateResponseAmino;
}
export interface MsgRedelegateResponseSDKType {}
export interface MsgUnbond {
  creator: string;
  validator: string;
  provider: string;
  chainID: string;
  amount: Coin;
}
export interface MsgUnbondProtoMsg {
  typeUrl: '/lavanet.lava.dualstaking.MsgUnbond';
  value: Uint8Array;
}
export interface MsgUnbondAmino {
  creator?: string;
  validator?: string;
  provider?: string;
  chainID?: string;
  amount?: CoinAmino;
}
export interface MsgUnbondAminoMsg {
  type: '/lavanet.lava.dualstaking.MsgUnbond';
  value: MsgUnbondAmino;
}
export interface MsgUnbondSDKType {
  creator: string;
  validator: string;
  provider: string;
  chainID: string;
  amount: CoinSDKType;
}
export interface MsgUnbondResponse {}
export interface MsgUnbondResponseProtoMsg {
  typeUrl: '/lavanet.lava.dualstaking.MsgUnbondResponse';
  value: Uint8Array;
}
export interface MsgUnbondResponseAmino {}
export interface MsgUnbondResponseAminoMsg {
  type: '/lavanet.lava.dualstaking.MsgUnbondResponse';
  value: MsgUnbondResponseAmino;
}
export interface MsgUnbondResponseSDKType {}
export interface MsgClaimRewards {
  /** delegator */
  creator: string;
  provider: string;
}
export interface MsgClaimRewardsProtoMsg {
  typeUrl: '/lavanet.lava.dualstaking.MsgClaimRewards';
  value: Uint8Array;
}
export interface MsgClaimRewardsAmino {
  /** delegator */
  creator?: string;
  provider?: string;
}
export interface MsgClaimRewardsAminoMsg {
  type: '/lavanet.lava.dualstaking.MsgClaimRewards';
  value: MsgClaimRewardsAmino;
}
export interface MsgClaimRewardsSDKType {
  creator: string;
  provider: string;
}
export interface MsgClaimRewardsResponse {}
export interface MsgClaimRewardsResponseProtoMsg {
  typeUrl: '/lavanet.lava.dualstaking.MsgClaimRewardsResponse';
  value: Uint8Array;
}
export interface MsgClaimRewardsResponseAmino {}
export interface MsgClaimRewardsResponseAminoMsg {
  type: '/lavanet.lava.dualstaking.MsgClaimRewardsResponse';
  value: MsgClaimRewardsResponseAmino;
}
export interface MsgClaimRewardsResponseSDKType {}
function createBaseMsgDelegate(): MsgDelegate {
  return {
    creator: '',
    validator: '',
    provider: '',
    chainID: '',
    amount: Coin.fromPartial({}),
  };
}
export const MsgDelegate = {
  typeUrl: '/lavanet.lava.dualstaking.MsgDelegate',
  encode(message: MsgDelegate, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.creator !== '') {
      writer.uint32(10).string(message.creator);
    }
    if (message.validator !== '') {
      writer.uint32(42).string(message.validator);
    }
    if (message.provider !== '') {
      writer.uint32(18).string(message.provider);
    }
    if (message.chainID !== '') {
      writer.uint32(26).string(message.chainID);
    }
    if (message.amount !== undefined) {
      Coin.encode(message.amount, writer.uint32(34).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgDelegate {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgDelegate();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.creator = reader.string();
          break;
        case 5:
          message.validator = reader.string();
          break;
        case 2:
          message.provider = reader.string();
          break;
        case 3:
          message.chainID = reader.string();
          break;
        case 4:
          message.amount = Coin.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): MsgDelegate {
    return {
      creator: isSet(object.creator) ? String(object.creator) : '',
      validator: isSet(object.validator) ? String(object.validator) : '',
      provider: isSet(object.provider) ? String(object.provider) : '',
      chainID: isSet(object.chainID) ? String(object.chainID) : '',
      amount: isSet(object.amount) ? Coin.fromJSON(object.amount) : Coin.fromJSON({ amount: 1, denom: '' }),
    };
  },
  toJSON(message: MsgDelegate): unknown {
    const obj: any = {};
    message.creator !== undefined && (obj.creator = message.creator);
    message.validator !== undefined && (obj.validator = message.validator);
    message.provider !== undefined && (obj.provider = message.provider);
    message.chainID !== undefined && (obj.chainID = message.chainID);
    message.amount !== undefined && (obj.amount = message.amount ? Coin.toJSON(message.amount) : undefined);
    return obj;
  },
  fromPartial(object: Partial<MsgDelegate>): MsgDelegate {
    const message = createBaseMsgDelegate();
    message.creator = object.creator ?? '';
    message.validator = object.validator ?? '';
    message.provider = object.provider ?? '';
    message.chainID = object.chainID ?? '';
    message.amount =
      object.amount !== undefined && object.amount !== null
        ? Coin.fromPartial(object.amount)
        : Coin.fromJSON({ amount: 1, denom: '' });
    return message;
  },
  fromAmino(object: MsgDelegateAmino): MsgDelegate {
    const message = createBaseMsgDelegate();
    if (object.creator !== undefined && object.creator !== null) {
      message.creator = object.creator;
    }
    if (object.validator !== undefined && object.validator !== null) {
      message.validator = object.validator;
    }
    if (object.provider !== undefined && object.provider !== null) {
      message.provider = object.provider;
    }
    if (object.chainID !== undefined && object.chainID !== null) {
      message.chainID = object.chainID;
    }
    if (object.amount !== undefined && object.amount !== null) {
      message.amount = Coin.fromAmino(object.amount);
    }
    return message;
  },
  toAmino(message: MsgDelegate): MsgDelegateAmino {
    const obj: any = {};
    obj.creator = message.creator === '' ? undefined : message.creator;
    obj.validator = message.validator === '' ? undefined : message.validator;
    obj.provider = message.provider === '' ? undefined : message.provider;
    obj.chainID = message.chainID === '' ? undefined : message.chainID;
    obj.amount = message.amount ? Coin.toAmino(message.amount) : undefined;
    return obj;
  },
  fromAminoMsg(object: MsgDelegateAminoMsg): MsgDelegate {
    return MsgDelegate.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgDelegateProtoMsg): MsgDelegate {
    return MsgDelegate.decode(message.value);
  },
  toProto(message: MsgDelegate): Uint8Array {
    return MsgDelegate.encode(message).finish();
  },
  toProtoMsg(message: MsgDelegate): MsgDelegateProtoMsg {
    return {
      typeUrl: '/lavanet.lava.dualstaking.MsgDelegate',
      value: MsgDelegate.encode(message).finish(),
    };
  },
};
function createBaseMsgDelegateResponse(): MsgDelegateResponse {
  return {};
}
export const MsgDelegateResponse = {
  typeUrl: '/lavanet.lava.dualstaking.MsgDelegateResponse',
  encode(_: MsgDelegateResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgDelegateResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgDelegateResponse();
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
  fromJSON(_: any): MsgDelegateResponse {
    return {};
  },
  toJSON(_: MsgDelegateResponse): unknown {
    const obj: any = {};
    return obj;
  },
  fromPartial(_: Partial<MsgDelegateResponse>): MsgDelegateResponse {
    const message = createBaseMsgDelegateResponse();
    return message;
  },
  fromAmino(_: MsgDelegateResponseAmino): MsgDelegateResponse {
    const message = createBaseMsgDelegateResponse();
    return message;
  },
  toAmino(_: MsgDelegateResponse): MsgDelegateResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: MsgDelegateResponseAminoMsg): MsgDelegateResponse {
    return MsgDelegateResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgDelegateResponseProtoMsg): MsgDelegateResponse {
    return MsgDelegateResponse.decode(message.value);
  },
  toProto(message: MsgDelegateResponse): Uint8Array {
    return MsgDelegateResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgDelegateResponse): MsgDelegateResponseProtoMsg {
    return {
      typeUrl: '/lavanet.lava.dualstaking.MsgDelegateResponse',
      value: MsgDelegateResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgRedelegate(): MsgRedelegate {
  return {
    creator: '',
    fromProvider: '',
    toProvider: '',
    fromChainID: '',
    toChainID: '',
    amount: Coin.fromPartial({}),
  };
}
export const MsgRedelegate = {
  typeUrl: '/lavanet.lava.dualstaking.MsgRedelegate',
  encode(message: MsgRedelegate, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.creator !== '') {
      writer.uint32(10).string(message.creator);
    }
    if (message.fromProvider !== '') {
      writer.uint32(18).string(message.fromProvider);
    }
    if (message.toProvider !== '') {
      writer.uint32(26).string(message.toProvider);
    }
    if (message.fromChainID !== '') {
      writer.uint32(34).string(message.fromChainID);
    }
    if (message.toChainID !== '') {
      writer.uint32(42).string(message.toChainID);
    }
    if (message.amount !== undefined) {
      Coin.encode(message.amount, writer.uint32(50).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgRedelegate {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgRedelegate();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.creator = reader.string();
          break;
        case 2:
          message.fromProvider = reader.string();
          break;
        case 3:
          message.toProvider = reader.string();
          break;
        case 4:
          message.fromChainID = reader.string();
          break;
        case 5:
          message.toChainID = reader.string();
          break;
        case 6:
          message.amount = Coin.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): MsgRedelegate {
    return {
      creator: isSet(object.creator) ? String(object.creator) : '',
      fromProvider: isSet(object.fromProvider) ? String(object.fromProvider) : '',
      toProvider: isSet(object.toProvider) ? String(object.toProvider) : '',
      fromChainID: isSet(object.fromChainID) ? String(object.fromChainID) : '',
      toChainID: isSet(object.toChainID) ? String(object.toChainID) : '',
      amount: isSet(object.amount) ? Coin.fromJSON(object.amount) : Coin.fromJSON({ amount: 1, denom: '' }),
    };
  },
  toJSON(message: MsgRedelegate): unknown {
    const obj: any = {};
    message.creator !== undefined && (obj.creator = message.creator);
    message.fromProvider !== undefined && (obj.fromProvider = message.fromProvider);
    message.toProvider !== undefined && (obj.toProvider = message.toProvider);
    message.fromChainID !== undefined && (obj.fromChainID = message.fromChainID);
    message.toChainID !== undefined && (obj.toChainID = message.toChainID);
    message.amount !== undefined && (obj.amount = message.amount ? Coin.toJSON(message.amount) : undefined);
    return obj;
  },
  fromPartial(object: Partial<MsgRedelegate>): MsgRedelegate {
    const message = createBaseMsgRedelegate();
    message.creator = object.creator ?? '';
    message.fromProvider = object.fromProvider ?? '';
    message.toProvider = object.toProvider ?? '';
    message.fromChainID = object.fromChainID ?? '';
    message.toChainID = object.toChainID ?? '';
    message.amount =
      object.amount !== undefined && object.amount !== null
        ? Coin.fromPartial(object.amount)
        : Coin.fromJSON({ amount: 1, denom: '' });
    return message;
  },
  fromAmino(object: MsgRedelegateAmino): MsgRedelegate {
    const message = createBaseMsgRedelegate();
    if (object.creator !== undefined && object.creator !== null) {
      message.creator = object.creator;
    }
    if (object.from_provider !== undefined && object.from_provider !== null) {
      message.fromProvider = object.from_provider;
    }
    if (object.to_provider !== undefined && object.to_provider !== null) {
      message.toProvider = object.to_provider;
    }
    if (object.from_chainID !== undefined && object.from_chainID !== null) {
      message.fromChainID = object.from_chainID;
    }
    if (object.to_chainID !== undefined && object.to_chainID !== null) {
      message.toChainID = object.to_chainID;
    }
    if (object.amount !== undefined && object.amount !== null) {
      message.amount = Coin.fromAmino(object.amount);
    }
    return message;
  },
  toAmino(message: MsgRedelegate): MsgRedelegateAmino {
    const obj: any = {};
    obj.creator = message.creator === '' ? undefined : message.creator;
    obj.from_provider = message.fromProvider === '' ? undefined : message.fromProvider;
    obj.to_provider = message.toProvider === '' ? undefined : message.toProvider;
    obj.from_chainID = message.fromChainID === '' ? undefined : message.fromChainID;
    obj.to_chainID = message.toChainID === '' ? undefined : message.toChainID;
    obj.amount = message.amount ? Coin.toAmino(message.amount) : undefined;
    return obj;
  },
  fromAminoMsg(object: MsgRedelegateAminoMsg): MsgRedelegate {
    return MsgRedelegate.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgRedelegateProtoMsg): MsgRedelegate {
    return MsgRedelegate.decode(message.value);
  },
  toProto(message: MsgRedelegate): Uint8Array {
    return MsgRedelegate.encode(message).finish();
  },
  toProtoMsg(message: MsgRedelegate): MsgRedelegateProtoMsg {
    return {
      typeUrl: '/lavanet.lava.dualstaking.MsgRedelegate',
      value: MsgRedelegate.encode(message).finish(),
    };
  },
};
function createBaseMsgRedelegateResponse(): MsgRedelegateResponse {
  return {};
}
export const MsgRedelegateResponse = {
  typeUrl: '/lavanet.lava.dualstaking.MsgRedelegateResponse',
  encode(_: MsgRedelegateResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgRedelegateResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgRedelegateResponse();
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
  fromJSON(_: any): MsgRedelegateResponse {
    return {};
  },
  toJSON(_: MsgRedelegateResponse): unknown {
    const obj: any = {};
    return obj;
  },
  fromPartial(_: Partial<MsgRedelegateResponse>): MsgRedelegateResponse {
    const message = createBaseMsgRedelegateResponse();
    return message;
  },
  fromAmino(_: MsgRedelegateResponseAmino): MsgRedelegateResponse {
    const message = createBaseMsgRedelegateResponse();
    return message;
  },
  toAmino(_: MsgRedelegateResponse): MsgRedelegateResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: MsgRedelegateResponseAminoMsg): MsgRedelegateResponse {
    return MsgRedelegateResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgRedelegateResponseProtoMsg): MsgRedelegateResponse {
    return MsgRedelegateResponse.decode(message.value);
  },
  toProto(message: MsgRedelegateResponse): Uint8Array {
    return MsgRedelegateResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgRedelegateResponse): MsgRedelegateResponseProtoMsg {
    return {
      typeUrl: '/lavanet.lava.dualstaking.MsgRedelegateResponse',
      value: MsgRedelegateResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgUnbond(): MsgUnbond {
  return {
    creator: '',
    validator: '',
    provider: '',
    chainID: '',
    amount: Coin.fromPartial({}),
  };
}
export const MsgUnbond = {
  typeUrl: '/lavanet.lava.dualstaking.MsgUnbond',
  encode(message: MsgUnbond, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.creator !== '') {
      writer.uint32(10).string(message.creator);
    }
    if (message.validator !== '') {
      writer.uint32(42).string(message.validator);
    }
    if (message.provider !== '') {
      writer.uint32(18).string(message.provider);
    }
    if (message.chainID !== '') {
      writer.uint32(26).string(message.chainID);
    }
    if (message.amount !== undefined) {
      Coin.encode(message.amount, writer.uint32(34).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgUnbond {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgUnbond();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.creator = reader.string();
          break;
        case 5:
          message.validator = reader.string();
          break;
        case 2:
          message.provider = reader.string();
          break;
        case 3:
          message.chainID = reader.string();
          break;
        case 4:
          message.amount = Coin.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): MsgUnbond {
    return {
      creator: isSet(object.creator) ? String(object.creator) : '',
      validator: isSet(object.validator) ? String(object.validator) : '',
      provider: isSet(object.provider) ? String(object.provider) : '',
      chainID: isSet(object.chainID) ? String(object.chainID) : '',
      amount: isSet(object.amount) ? Coin.fromJSON(object.amount) : Coin.fromJSON({ amount: 1, denom: '' }),
    };
  },
  toJSON(message: MsgUnbond): unknown {
    const obj: any = {};
    message.creator !== undefined && (obj.creator = message.creator);
    message.validator !== undefined && (obj.validator = message.validator);
    message.provider !== undefined && (obj.provider = message.provider);
    message.chainID !== undefined && (obj.chainID = message.chainID);
    message.amount !== undefined && (obj.amount = message.amount ? Coin.toJSON(message.amount) : undefined);
    return obj;
  },
  fromPartial(object: Partial<MsgUnbond>): MsgUnbond {
    const message = createBaseMsgUnbond();
    message.creator = object.creator ?? '';
    message.validator = object.validator ?? '';
    message.provider = object.provider ?? '';
    message.chainID = object.chainID ?? '';
    message.amount =
      object.amount !== undefined && object.amount !== null
        ? Coin.fromPartial(object.amount)
        : Coin.fromJSON({ amount: 1, denom: '' });
    return message;
  },
  fromAmino(object: MsgUnbondAmino): MsgUnbond {
    const message = createBaseMsgUnbond();
    if (object.creator !== undefined && object.creator !== null) {
      message.creator = object.creator;
    }
    if (object.validator !== undefined && object.validator !== null) {
      message.validator = object.validator;
    }
    if (object.provider !== undefined && object.provider !== null) {
      message.provider = object.provider;
    }
    if (object.chainID !== undefined && object.chainID !== null) {
      message.chainID = object.chainID;
    }
    if (object.amount !== undefined && object.amount !== null) {
      message.amount = Coin.fromAmino(object.amount);
    }
    return message;
  },
  toAmino(message: MsgUnbond): MsgUnbondAmino {
    const obj: any = {};
    obj.creator = message.creator === '' ? undefined : message.creator;
    obj.validator = message.validator === '' ? undefined : message.validator;
    obj.provider = message.provider === '' ? undefined : message.provider;
    obj.chainID = message.chainID === '' ? undefined : message.chainID;
    obj.amount = message.amount ? Coin.toAmino(message.amount) : undefined;
    return obj;
  },
  fromAminoMsg(object: MsgUnbondAminoMsg): MsgUnbond {
    return MsgUnbond.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgUnbondProtoMsg): MsgUnbond {
    return MsgUnbond.decode(message.value);
  },
  toProto(message: MsgUnbond): Uint8Array {
    return MsgUnbond.encode(message).finish();
  },
  toProtoMsg(message: MsgUnbond): MsgUnbondProtoMsg {
    return {
      typeUrl: '/lavanet.lava.dualstaking.MsgUnbond',
      value: MsgUnbond.encode(message).finish(),
    };
  },
};
function createBaseMsgUnbondResponse(): MsgUnbondResponse {
  return {};
}
export const MsgUnbondResponse = {
  typeUrl: '/lavanet.lava.dualstaking.MsgUnbondResponse',
  encode(_: MsgUnbondResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgUnbondResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgUnbondResponse();
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
  fromJSON(_: any): MsgUnbondResponse {
    return {};
  },
  toJSON(_: MsgUnbondResponse): unknown {
    const obj: any = {};
    return obj;
  },
  fromPartial(_: Partial<MsgUnbondResponse>): MsgUnbondResponse {
    const message = createBaseMsgUnbondResponse();
    return message;
  },
  fromAmino(_: MsgUnbondResponseAmino): MsgUnbondResponse {
    const message = createBaseMsgUnbondResponse();
    return message;
  },
  toAmino(_: MsgUnbondResponse): MsgUnbondResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: MsgUnbondResponseAminoMsg): MsgUnbondResponse {
    return MsgUnbondResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgUnbondResponseProtoMsg): MsgUnbondResponse {
    return MsgUnbondResponse.decode(message.value);
  },
  toProto(message: MsgUnbondResponse): Uint8Array {
    return MsgUnbondResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgUnbondResponse): MsgUnbondResponseProtoMsg {
    return {
      typeUrl: '/lavanet.lava.dualstaking.MsgUnbondResponse',
      value: MsgUnbondResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgClaimRewards(): MsgClaimRewards {
  return {
    creator: '',
    provider: '',
  };
}
export const MsgClaimRewards = {
  typeUrl: '/lavanet.lava.dualstaking.MsgClaimRewards',
  encode(message: MsgClaimRewards, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.creator !== '') {
      writer.uint32(10).string(message.creator);
    }
    if (message.provider !== '') {
      writer.uint32(18).string(message.provider);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgClaimRewards {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgClaimRewards();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.creator = reader.string();
          break;
        case 2:
          message.provider = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): MsgClaimRewards {
    return {
      creator: isSet(object.creator) ? String(object.creator) : '',
      provider: isSet(object.provider) ? String(object.provider) : '',
    };
  },
  toJSON(message: MsgClaimRewards): unknown {
    const obj: any = {};
    message.creator !== undefined && (obj.creator = message.creator);
    message.provider !== undefined && (obj.provider = message.provider);
    return obj;
  },
  fromPartial(object: Partial<MsgClaimRewards>): MsgClaimRewards {
    const message = createBaseMsgClaimRewards();
    message.creator = object.creator ?? '';
    message.provider = object.provider ?? '';
    return message;
  },
  fromAmino(object: MsgClaimRewardsAmino): MsgClaimRewards {
    const message = createBaseMsgClaimRewards();
    if (object.creator !== undefined && object.creator !== null) {
      message.creator = object.creator;
    }
    if (object.provider !== undefined && object.provider !== null) {
      message.provider = object.provider;
    }
    return message;
  },
  toAmino(message: MsgClaimRewards): MsgClaimRewardsAmino {
    const obj: any = {};
    obj.creator = message.creator === '' ? undefined : message.creator;
    obj.provider = message.provider === '' ? undefined : message.provider;
    return obj;
  },
  fromAminoMsg(object: MsgClaimRewardsAminoMsg): MsgClaimRewards {
    return MsgClaimRewards.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgClaimRewardsProtoMsg): MsgClaimRewards {
    return MsgClaimRewards.decode(message.value);
  },
  toProto(message: MsgClaimRewards): Uint8Array {
    return MsgClaimRewards.encode(message).finish();
  },
  toProtoMsg(message: MsgClaimRewards): MsgClaimRewardsProtoMsg {
    return {
      typeUrl: '/lavanet.lava.dualstaking.MsgClaimRewards',
      value: MsgClaimRewards.encode(message).finish(),
    };
  },
};
function createBaseMsgClaimRewardsResponse(): MsgClaimRewardsResponse {
  return {};
}
export const MsgClaimRewardsResponse = {
  typeUrl: '/lavanet.lava.dualstaking.MsgClaimRewardsResponse',
  encode(_: MsgClaimRewardsResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgClaimRewardsResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgClaimRewardsResponse();
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
  fromJSON(_: any): MsgClaimRewardsResponse {
    return {};
  },
  toJSON(_: MsgClaimRewardsResponse): unknown {
    const obj: any = {};
    return obj;
  },
  fromPartial(_: Partial<MsgClaimRewardsResponse>): MsgClaimRewardsResponse {
    const message = createBaseMsgClaimRewardsResponse();
    return message;
  },
  fromAmino(_: MsgClaimRewardsResponseAmino): MsgClaimRewardsResponse {
    const message = createBaseMsgClaimRewardsResponse();
    return message;
  },
  toAmino(_: MsgClaimRewardsResponse): MsgClaimRewardsResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: MsgClaimRewardsResponseAminoMsg): MsgClaimRewardsResponse {
    return MsgClaimRewardsResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgClaimRewardsResponseProtoMsg): MsgClaimRewardsResponse {
    return MsgClaimRewardsResponse.decode(message.value);
  },
  toProto(message: MsgClaimRewardsResponse): Uint8Array {
    return MsgClaimRewardsResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgClaimRewardsResponse): MsgClaimRewardsResponseProtoMsg {
    return {
      typeUrl: '/lavanet.lava.dualstaking.MsgClaimRewardsResponse',
      value: MsgClaimRewardsResponse.encode(message).finish(),
    };
  },
};
