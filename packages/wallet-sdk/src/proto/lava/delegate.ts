import { BinaryReader, BinaryWriter } from '../binary';
import { Coin, CoinAmino, CoinSDKType } from '../coin';
import { isSet } from '../helpers';
import { JsonSafe } from './json-safe';
export interface Delegation {
  /** provider receives the delegated funds */
  provider: string;
  /** chainID to which staking delegate funds */
  chainID: string;
  /** delegator that owns the delegated funds */
  delegator: string;
  amount: Coin;
  /** Unix timestamp of the delegation (+ month) */
  timestamp: bigint;
}
export interface DelegationProtoMsg {
  typeUrl: '/lavanet.lava.dualstaking.Delegation';
  value: Uint8Array;
}
export interface DelegationAmino {
  /** provider receives the delegated funds */
  provider?: string;
  /** chainID to which staking delegate funds */
  chainID?: string;
  /** delegator that owns the delegated funds */
  delegator?: string;
  amount?: CoinAmino;
  /** Unix timestamp of the delegation (+ month) */
  timestamp?: string;
}
export interface DelegationAminoMsg {
  type: '/lavanet.lava.dualstaking.Delegation';
  value: DelegationAmino;
}
export interface DelegationSDKType {
  provider: string;
  chainID: string;
  delegator: string;
  amount: CoinSDKType;
  timestamp: bigint;
}
export interface Delegator {
  /** providers to which it delegates */
  providers: string[];
}
export interface DelegatorProtoMsg {
  typeUrl: '/lavanet.lava.dualstaking.Delegator';
  value: Uint8Array;
}
export interface DelegatorAmino {
  /** providers to which it delegates */
  providers?: string[];
}
export interface DelegatorAminoMsg {
  type: '/lavanet.lava.dualstaking.Delegator';
  value: DelegatorAmino;
}
export interface DelegatorSDKType {
  providers: string[];
}
function createBaseDelegation(): Delegation {
  return {
    provider: '',
    chainID: '',
    delegator: '',
    amount: Coin.fromPartial({}),
    timestamp: BigInt(0),
  };
}
export const Delegation = {
  typeUrl: '/lavanet.lava.dualstaking.Delegation',
  encode(message: Delegation, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.provider !== '') {
      writer.uint32(10).string(message.provider);
    }
    if (message.chainID !== '') {
      writer.uint32(18).string(message.chainID);
    }
    if (message.delegator !== '') {
      writer.uint32(26).string(message.delegator);
    }
    if (message.amount !== undefined) {
      Coin.encode(message.amount, writer.uint32(34).fork()).ldelim();
    }
    if (message.timestamp !== BigInt(0)) {
      writer.uint32(40).int64(message.timestamp);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): Delegation {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDelegation();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.provider = reader.string();
          break;
        case 2:
          message.chainID = reader.string();
          break;
        case 3:
          message.delegator = reader.string();
          break;
        case 4:
          message.amount = Coin.decode(reader, reader.uint32());
          break;
        case 5:
          message.timestamp = reader.int64();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): Delegation {
    return {
      provider: isSet(object.provider) ? String(object.provider) : '',
      chainID: isSet(object.chainID) ? String(object.chainID) : '',
      delegator: isSet(object.delegator) ? String(object.delegator) : '',
      amount: isSet(object.amount) ? Coin.fromJSON(object.amount) : Coin.fromJSON({ amount: 1, denom: '' }),
      timestamp: isSet(object.timestamp) ? BigInt(object.timestamp.toString()) : BigInt(0),
    };
  },
  toJSON(message: Delegation): JsonSafe<Delegation> {
    const obj: any = {};
    message.provider !== undefined && (obj.provider = message.provider);
    message.chainID !== undefined && (obj.chainID = message.chainID);
    message.delegator !== undefined && (obj.delegator = message.delegator);
    message.amount !== undefined && (obj.amount = message.amount ? Coin.toJSON(message.amount) : undefined);
    message.timestamp !== undefined && (obj.timestamp = (message.timestamp || BigInt(0)).toString());
    return obj;
  },
  fromPartial(object: Partial<Delegation>): Delegation {
    const message = createBaseDelegation();
    message.provider = object.provider ?? '';
    message.chainID = object.chainID ?? '';
    message.delegator = object.delegator ?? '';
    message.amount =
      object.amount !== undefined && object.amount !== null
        ? Coin.fromPartial(object.amount)
        : Coin.fromJSON({ amount: 1, denom: '' });
    message.timestamp =
      object.timestamp !== undefined && object.timestamp !== null ? BigInt(object.timestamp.toString()) : BigInt(0);
    return message;
  },
  fromAmino(object: DelegationAmino): Delegation {
    const message = createBaseDelegation();
    if (object.provider !== undefined && object.provider !== null) {
      message.provider = object.provider;
    }
    if (object.chainID !== undefined && object.chainID !== null) {
      message.chainID = object.chainID;
    }
    if (object.delegator !== undefined && object.delegator !== null) {
      message.delegator = object.delegator;
    }
    if (object.amount !== undefined && object.amount !== null) {
      message.amount = Coin.fromAmino(object.amount);
    }
    if (object.timestamp !== undefined && object.timestamp !== null) {
      message.timestamp = BigInt(object.timestamp);
    }
    return message;
  },
  toAmino(message: Delegation): DelegationAmino {
    const obj: any = {};
    obj.provider = message.provider === '' ? undefined : message.provider;
    obj.chainID = message.chainID === '' ? undefined : message.chainID;
    obj.delegator = message.delegator === '' ? undefined : message.delegator;
    obj.amount = message.amount ? Coin.toAmino(message.amount) : undefined;
    obj.timestamp = message.timestamp !== BigInt(0) ? message.timestamp.toString() : undefined;
    return obj;
  },
  fromAminoMsg(object: DelegationAminoMsg): Delegation {
    return Delegation.fromAmino(object.value);
  },
  fromProtoMsg(message: DelegationProtoMsg): Delegation {
    return Delegation.decode(message.value);
  },
  toProto(message: Delegation): Uint8Array {
    return Delegation.encode(message).finish();
  },
  toProtoMsg(message: Delegation): DelegationProtoMsg {
    return {
      typeUrl: '/lavanet.lava.dualstaking.Delegation',
      value: Delegation.encode(message).finish(),
    };
  },
};
function createBaseDelegator(): Delegator {
  return {
    providers: [],
  };
}
export const Delegator = {
  typeUrl: '/lavanet.lava.dualstaking.Delegator',
  encode(message: Delegator, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    for (const v of message.providers) {
      writer.uint32(10).string(v!);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): Delegator {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDelegator();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.providers.push(reader.string());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): Delegator {
    return {
      providers: Array.isArray(object?.providers) ? object.providers.map((e: any) => String(e)) : [],
    };
  },
  toJSON(message: Delegator): JsonSafe<Delegator> {
    const obj: any = {};
    if (message.providers) {
      obj.providers = message.providers.map((e) => e);
    } else {
      obj.providers = [];
    }
    return obj;
  },
  fromPartial(object: Partial<Delegator>): Delegator {
    const message = createBaseDelegator();
    message.providers = object.providers?.map((e) => e) || [];
    return message;
  },
  fromAmino(object: DelegatorAmino): Delegator {
    const message = createBaseDelegator();
    message.providers = object.providers?.map((e) => e) || [];
    return message;
  },
  toAmino(message: Delegator): DelegatorAmino {
    const obj: any = {};
    if (message.providers) {
      obj.providers = message.providers.map((e) => e);
    } else {
      obj.providers = message.providers;
    }
    return obj;
  },
  fromAminoMsg(object: DelegatorAminoMsg): Delegator {
    return Delegator.fromAmino(object.value);
  },
  fromProtoMsg(message: DelegatorProtoMsg): Delegator {
    return Delegator.decode(message.value);
  },
  toProto(message: Delegator): Uint8Array {
    return Delegator.encode(message).finish();
  },
  toProtoMsg(message: Delegator): DelegatorProtoMsg {
    return {
      typeUrl: '/lavanet.lava.dualstaking.Delegator',
      value: Delegator.encode(message).finish(),
    };
  },
};
