import { Decimal } from '@cosmjs/math';

import { BinaryReader, BinaryWriter } from '../../binary';

export interface MsgClaimFreeAmountAmino {
  user?: string;
}

export interface MsgClaimFreeAmountAminoMsg {
  type: 'claim/ClaimFreeAmount';
  value: MsgClaimFreeAmountAmino;
}

export interface MsgClaimFreeAmount {
  user: string;
}

export interface MsgClaimFreeAmountProtoMsg {
  typeUrl: '/stride.claim.MsgClaimFreeAmount';
  value: Uint8Array;
}

function createBaseMsgClaimFreeAmount(): MsgClaimFreeAmount {
  return {
    user: '',
  };
}

export const MsgClaimFreeAmount = {
  typeUrl: '/stride.claim.MsgClaimFreeAmount',
  encode(message: MsgClaimFreeAmount, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.user !== '') {
      writer.uint32(10).string(message.user);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgClaimFreeAmount {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgClaimFreeAmount();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.user = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgClaimFreeAmount>): MsgClaimFreeAmount {
    const message = createBaseMsgClaimFreeAmount();
    message.user = object.user ?? '';
    return message;
  },
  fromAmino(object: MsgClaimFreeAmountAmino): MsgClaimFreeAmount {
    const message = createBaseMsgClaimFreeAmount();
    if (object.user !== undefined && object.user !== null) {
      message.user = object.user;
    }
    return message;
  },
  toAmino(message: MsgClaimFreeAmount): MsgClaimFreeAmountAmino {
    const obj: any = {};
    obj.user = message.user === '' ? undefined : message.user;
    return obj;
  },
  fromAminoMsg(object: MsgClaimFreeAmountAminoMsg): MsgClaimFreeAmount {
    return MsgClaimFreeAmount.fromAmino(object.value);
  },
  toAminoMsg(message: MsgClaimFreeAmount): MsgClaimFreeAmountAminoMsg {
    return {
      type: 'claim/ClaimFreeAmount',
      value: MsgClaimFreeAmount.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgClaimFreeAmountProtoMsg): MsgClaimFreeAmount {
    return MsgClaimFreeAmount.decode(message.value);
  },
  toProto(message: MsgClaimFreeAmount): Uint8Array {
    return MsgClaimFreeAmount.encode(message).finish();
  },
  toProtoMsg(message: MsgClaimFreeAmount): MsgClaimFreeAmountProtoMsg {
    return {
      typeUrl: '/stride.claim.MsgClaimFreeAmount',
      value: MsgClaimFreeAmount.encode(message).finish(),
    };
  },
};

export interface MsgCreateAirdrop {
  distributor: string;
  identifier: string;
  chainId: string;
  denom: string;
  startTime: bigint;
  duration: bigint;
  autopilotEnabled: boolean;
}

export interface MsgCreateAirdropProtoMsg {
  typeUrl: '/stride.claim.MsgCreateAirdrop';
  value: Uint8Array;
}

export interface MsgCreateAirdropAmino {
  distributor?: string;
  identifier?: string;
  chain_id?: string;
  denom?: string;
  start_time?: string;
  duration?: string;
  autopilot_enabled?: boolean;
}

export interface MsgCreateAirdropAminoMsg {
  type: '/stride.claim.MsgCreateAirdrop';
  value: MsgCreateAirdropAmino;
}

function createBaseMsgCreateAirdrop(): MsgCreateAirdrop {
  return {
    distributor: '',
    identifier: '',
    chainId: '',
    denom: '',
    startTime: BigInt(0),
    duration: BigInt(0),
    autopilotEnabled: false,
  };
}

export const MsgCreateAirdrop = {
  typeUrl: '/stride.claim.MsgCreateAirdrop',
  encode(message: MsgCreateAirdrop, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.distributor !== '') {
      writer.uint32(10).string(message.distributor);
    }
    if (message.identifier !== '') {
      writer.uint32(18).string(message.identifier);
    }
    if (message.chainId !== '') {
      writer.uint32(50).string(message.chainId);
    }
    if (message.denom !== '') {
      writer.uint32(42).string(message.denom);
    }
    if (message.startTime !== BigInt(0)) {
      writer.uint32(24).uint64(message.startTime);
    }
    if (message.duration !== BigInt(0)) {
      writer.uint32(32).uint64(message.duration);
    }
    if (message.autopilotEnabled === true) {
      writer.uint32(56).bool(message.autopilotEnabled);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgCreateAirdrop {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCreateAirdrop();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.distributor = reader.string();
          break;
        case 2:
          message.identifier = reader.string();
          break;
        case 6:
          message.chainId = reader.string();
          break;
        case 5:
          message.denom = reader.string();
          break;
        case 3:
          message.startTime = reader.uint64();
          break;
        case 4:
          message.duration = reader.uint64();
          break;
        case 7:
          message.autopilotEnabled = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgCreateAirdrop>): MsgCreateAirdrop {
    const message = createBaseMsgCreateAirdrop();
    message.distributor = object.distributor ?? '';
    message.identifier = object.identifier ?? '';
    message.chainId = object.chainId ?? '';
    message.denom = object.denom ?? '';
    message.startTime =
      object.startTime !== undefined && object.startTime !== null ? BigInt(object.startTime.toString()) : BigInt(0);
    message.duration =
      object.duration !== undefined && object.duration !== null ? BigInt(object.duration.toString()) : BigInt(0);
    message.autopilotEnabled = object.autopilotEnabled ?? false;
    return message;
  },
  fromAmino(object: MsgCreateAirdropAmino): MsgCreateAirdrop {
    const message = createBaseMsgCreateAirdrop();
    if (object.distributor !== undefined && object.distributor !== null) {
      message.distributor = object.distributor;
    }
    if (object.identifier !== undefined && object.identifier !== null) {
      message.identifier = object.identifier;
    }
    if (object.chain_id !== undefined && object.chain_id !== null) {
      message.chainId = object.chain_id;
    }
    if (object.denom !== undefined && object.denom !== null) {
      message.denom = object.denom;
    }
    if (object.start_time !== undefined && object.start_time !== null) {
      message.startTime = BigInt(object.start_time);
    }
    if (object.duration !== undefined && object.duration !== null) {
      message.duration = BigInt(object.duration);
    }
    if (object.autopilot_enabled !== undefined && object.autopilot_enabled !== null) {
      message.autopilotEnabled = object.autopilot_enabled;
    }
    return message;
  },
  toAmino(message: MsgCreateAirdrop): MsgCreateAirdropAmino {
    const obj: any = {};
    obj.distributor = message.distributor === '' ? undefined : message.distributor;
    obj.identifier = message.identifier === '' ? undefined : message.identifier;
    obj.chain_id = message.chainId === '' ? undefined : message.chainId;
    obj.denom = message.denom === '' ? undefined : message.denom;
    obj.start_time = message.startTime !== BigInt(0) ? message.startTime.toString() : undefined;
    obj.duration = message.duration !== BigInt(0) ? message.duration.toString() : undefined;
    obj.autopilot_enabled = message.autopilotEnabled === false ? undefined : message.autopilotEnabled;
    return obj;
  },
  fromAminoMsg(object: MsgCreateAirdropAminoMsg): MsgCreateAirdrop {
    return MsgCreateAirdrop.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgCreateAirdropProtoMsg): MsgCreateAirdrop {
    return MsgCreateAirdrop.decode(message.value);
  },
  toProto(message: MsgCreateAirdrop): Uint8Array {
    return MsgCreateAirdrop.encode(message).finish();
  },
  toProtoMsg(message: MsgCreateAirdrop): MsgCreateAirdropProtoMsg {
    return {
      typeUrl: '/stride.claim.MsgCreateAirdrop',
      value: MsgCreateAirdrop.encode(message).finish(),
    };
  },
};

export interface MsgDeleteAirdrop {
  distributor: string;
  identifier: string;
}

export interface MsgDeleteAirdropProtoMsg {
  typeUrl: '/stride.claim.MsgDeleteAirdrop';
  value: Uint8Array;
}

export interface MsgDeleteAirdropAmino {
  distributor?: string;
  identifier?: string;
}

export interface MsgDeleteAirdropAminoMsg {
  type: '/stride.claim.MsgDeleteAirdrop';
  value: MsgDeleteAirdropAmino;
}

function createBaseMsgDeleteAirdrop(): MsgDeleteAirdrop {
  return {
    distributor: '',
    identifier: '',
  };
}

export const MsgDeleteAirdrop = {
  typeUrl: '/stride.claim.MsgDeleteAirdrop',
  encode(message: MsgDeleteAirdrop, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.distributor !== '') {
      writer.uint32(10).string(message.distributor);
    }
    if (message.identifier !== '') {
      writer.uint32(18).string(message.identifier);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgDeleteAirdrop {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgDeleteAirdrop();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.distributor = reader.string();
          break;
        case 2:
          message.identifier = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgDeleteAirdrop>): MsgDeleteAirdrop {
    const message = createBaseMsgDeleteAirdrop();
    message.distributor = object.distributor ?? '';
    message.identifier = object.identifier ?? '';
    return message;
  },
  fromAmino(object: MsgDeleteAirdropAmino): MsgDeleteAirdrop {
    const message = createBaseMsgDeleteAirdrop();
    if (object.distributor !== undefined && object.distributor !== null) {
      message.distributor = object.distributor;
    }
    if (object.identifier !== undefined && object.identifier !== null) {
      message.identifier = object.identifier;
    }
    return message;
  },
  toAmino(message: MsgDeleteAirdrop): MsgDeleteAirdropAmino {
    const obj: any = {};
    obj.distributor = message.distributor === '' ? undefined : message.distributor;
    obj.identifier = message.identifier === '' ? undefined : message.identifier;
    return obj;
  },
  fromAminoMsg(object: MsgDeleteAirdropAminoMsg): MsgDeleteAirdrop {
    return MsgDeleteAirdrop.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgDeleteAirdropProtoMsg): MsgDeleteAirdrop {
    return MsgDeleteAirdrop.decode(message.value);
  },
  toProto(message: MsgDeleteAirdrop): Uint8Array {
    return MsgDeleteAirdrop.encode(message).finish();
  },
  toProtoMsg(message: MsgDeleteAirdrop): MsgDeleteAirdropProtoMsg {
    return {
      typeUrl: '/stride.claim.MsgDeleteAirdrop',
      value: MsgDeleteAirdrop.encode(message).finish(),
    };
  },
};

export interface MsgSetAirdropAllocations {
  allocator: string;
  airdropIdentifier: string;
  users: string[];
  weights: string[];
}

export interface MsgSetAirdropAllocationsProtoMsg {
  typeUrl: '/stride.claim.MsgSetAirdropAllocations';
  value: Uint8Array;
}

export interface MsgSetAirdropAllocationsAmino {
  allocator?: string;
  airdrop_identifier?: string;
  users?: string[];
  weights?: string[];
}

export interface MsgSetAirdropAllocationsAminoMsg {
  type: '/stride.claim.MsgSetAirdropAllocations';
  value: MsgSetAirdropAllocationsAmino;
}

function createBaseMsgSetAirdropAllocations(): MsgSetAirdropAllocations {
  return {
    allocator: '',
    airdropIdentifier: '',
    users: [],
    weights: [],
  };
}

export const MsgSetAirdropAllocations = {
  typeUrl: '/stride.claim.MsgSetAirdropAllocations',
  encode(message: MsgSetAirdropAllocations, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.allocator !== '') {
      writer.uint32(10).string(message.allocator);
    }
    if (message.airdropIdentifier !== '') {
      writer.uint32(18).string(message.airdropIdentifier);
    }
    for (const v of message.users) {
      writer.uint32(26).string(v!);
    }
    for (const v of message.weights) {
      writer.uint32(34).string(Decimal.fromUserInput(v!, 18).atomics);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgSetAirdropAllocations {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSetAirdropAllocations();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.allocator = reader.string();
          break;
        case 2:
          message.airdropIdentifier = reader.string();
          break;
        case 3:
          message.users.push(reader.string());
          break;
        case 4:
          message.weights.push(Decimal.fromAtomics(reader.string(), 18).toString());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgSetAirdropAllocations>): MsgSetAirdropAllocations {
    const message = createBaseMsgSetAirdropAllocations();
    message.allocator = object.allocator ?? '';
    message.airdropIdentifier = object.airdropIdentifier ?? '';
    message.users = object.users?.map((e) => e) || [];
    message.weights = object.weights?.map((e) => e) || [];
    return message;
  },
  fromAmino(object: MsgSetAirdropAllocationsAmino): MsgSetAirdropAllocations {
    const message = createBaseMsgSetAirdropAllocations();
    if (object.allocator !== undefined && object.allocator !== null) {
      message.allocator = object.allocator;
    }
    if (object.airdrop_identifier !== undefined && object.airdrop_identifier !== null) {
      message.airdropIdentifier = object.airdrop_identifier;
    }
    message.users = object.users?.map((e) => e) || [];
    message.weights = object.weights?.map((e) => e) || [];
    return message;
  },
  toAmino(message: MsgSetAirdropAllocations): MsgSetAirdropAllocationsAmino {
    const obj: any = {};
    obj.allocator = message.allocator === '' ? undefined : message.allocator;
    obj.airdrop_identifier = message.airdropIdentifier === '' ? undefined : message.airdropIdentifier;
    if (message.users) {
      obj.users = message.users.map((e) => e);
    } else {
      obj.users = message.users;
    }
    if (message.weights) {
      obj.weights = message.weights.map((e) => e);
    } else {
      obj.weights = message.weights;
    }
    return obj;
  },
  fromAminoMsg(object: MsgSetAirdropAllocationsAminoMsg): MsgSetAirdropAllocations {
    return MsgSetAirdropAllocations.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgSetAirdropAllocationsProtoMsg): MsgSetAirdropAllocations {
    return MsgSetAirdropAllocations.decode(message.value);
  },
  toProto(message: MsgSetAirdropAllocations): Uint8Array {
    return MsgSetAirdropAllocations.encode(message).finish();
  },
  toProtoMsg(message: MsgSetAirdropAllocations): MsgSetAirdropAllocationsProtoMsg {
    return {
      typeUrl: '/stride.claim.MsgSetAirdropAllocations',
      value: MsgSetAirdropAllocations.encode(message).finish(),
    };
  },
};
