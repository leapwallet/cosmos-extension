import { Decimal } from '@cosmjs/math';

import { BinaryReader, BinaryWriter } from '../../binary';
import { Validator, ValidatorAmino } from './validator';

export interface MsgLiquidStake {
  creator: string;
  amount: string;
  hostDenom: string;
}

export interface MsgLiquidStakeAmino {
  creator?: string;
  amount?: string;
  host_denom?: string;
}

export interface MsgLiquidStakeAminoMsg {
  type: 'stakeibc/LiquidStake';
  value: MsgLiquidStakeAmino;
}

export interface MsgLiquidStakeProtoMsg {
  typeUrl: '/stride.stakeibc.MsgLiquidStake';
  value: Uint8Array;
}

function createBaseMsgLiquidStake(): MsgLiquidStake {
  return {
    creator: '',
    amount: '',
    hostDenom: '',
  };
}

export const MsgLiquidStake = {
  typeUrl: '/stride.stakeibc.MsgLiquidStake',
  encode(message: MsgLiquidStake, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.creator !== '') {
      writer.uint32(10).string(message.creator);
    }
    if (message.amount !== '') {
      writer.uint32(18).string(message.amount);
    }
    if (message.hostDenom !== '') {
      writer.uint32(26).string(message.hostDenom);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgLiquidStake {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgLiquidStake();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.creator = reader.string();
          break;
        case 2:
          message.amount = reader.string();
          break;
        case 3:
          message.hostDenom = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgLiquidStake>): MsgLiquidStake {
    const message = createBaseMsgLiquidStake();
    message.creator = object.creator ?? '';
    message.amount = object.amount ?? '';
    message.hostDenom = object.hostDenom ?? '';
    return message;
  },
  fromAmino(object: MsgLiquidStakeAmino): MsgLiquidStake {
    const message = createBaseMsgLiquidStake();
    if (object.creator !== undefined && object.creator !== null) {
      message.creator = object.creator;
    }
    if (object.amount !== undefined && object.amount !== null) {
      message.amount = object.amount;
    }
    if (object.host_denom !== undefined && object.host_denom !== null) {
      message.hostDenom = object.host_denom;
    }
    return message;
  },
  toAmino(message: MsgLiquidStake): MsgLiquidStakeAmino {
    const obj: any = {};
    obj.creator = message.creator === '' ? undefined : message.creator;
    obj.amount = message.amount === '' ? undefined : message.amount;
    obj.host_denom = message.hostDenom === '' ? undefined : message.hostDenom;
    return obj;
  },
  fromAminoMsg(object: MsgLiquidStakeAminoMsg): MsgLiquidStake {
    return MsgLiquidStake.fromAmino(object.value);
  },
  toAminoMsg(message: MsgLiquidStake): MsgLiquidStakeAminoMsg {
    return {
      type: 'stakeibc/LiquidStake',
      value: MsgLiquidStake.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgLiquidStakeProtoMsg): MsgLiquidStake {
    return MsgLiquidStake.decode(message.value);
  },
  toProto(message: MsgLiquidStake): Uint8Array {
    return MsgLiquidStake.encode(message).finish();
  },
  toProtoMsg(message: MsgLiquidStake): MsgLiquidStakeProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.MsgLiquidStake',
      value: MsgLiquidStake.encode(message).finish(),
    };
  },
};

export interface MsgRedeemStake {
  creator: string;
  amount: string;
  hostZone: string;
  receiver: string;
}

export interface MsgRedeemStakeAmino {
  creator?: string;
  amount?: string;
  host_zone?: string;
  receiver?: string;
}

export interface MsgRedeemStakeAminoMsg {
  type: 'stakeibc/RedeemStake';
  value: MsgRedeemStakeAmino;
}

function createBaseMsgRedeemStake(): MsgRedeemStake {
  return {
    creator: '',
    amount: '',
    hostZone: '',
    receiver: '',
  };
}

export interface MsgRedeemStakeProtoMsg {
  typeUrl: '/stride.stakeibc.MsgRedeemStake';
  value: Uint8Array;
}

export const MsgRedeemStake = {
  typeUrl: '/stride.stakeibc.MsgRedeemStake',
  encode(message: MsgRedeemStake, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.creator !== '') {
      writer.uint32(10).string(message.creator);
    }
    if (message.amount !== '') {
      writer.uint32(18).string(message.amount);
    }
    if (message.hostZone !== '') {
      writer.uint32(26).string(message.hostZone);
    }
    if (message.receiver !== '') {
      writer.uint32(34).string(message.receiver);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgRedeemStake {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgRedeemStake();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.creator = reader.string();
          break;
        case 2:
          message.amount = reader.string();
          break;
        case 3:
          message.hostZone = reader.string();
          break;
        case 4:
          message.receiver = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgRedeemStake>): MsgRedeemStake {
    const message = createBaseMsgRedeemStake();
    message.creator = object.creator ?? '';
    message.amount = object.amount ?? '';
    message.hostZone = object.hostZone ?? '';
    message.receiver = object.receiver ?? '';
    return message;
  },
  fromAmino(object: MsgRedeemStakeAmino): MsgRedeemStake {
    const message = createBaseMsgRedeemStake();
    if (object.creator !== undefined && object.creator !== null) {
      message.creator = object.creator;
    }
    if (object.amount !== undefined && object.amount !== null) {
      message.amount = object.amount;
    }
    if (object.host_zone !== undefined && object.host_zone !== null) {
      message.hostZone = object.host_zone;
    }
    if (object.receiver !== undefined && object.receiver !== null) {
      message.receiver = object.receiver;
    }
    return message;
  },
  toAmino(message: MsgRedeemStake): MsgRedeemStakeAmino {
    const obj: any = {};
    obj.creator = message.creator === '' ? undefined : message.creator;
    obj.amount = message.amount === '' ? undefined : message.amount;
    obj.host_zone = message.hostZone === '' ? undefined : message.hostZone;
    obj.receiver = message.receiver === '' ? undefined : message.receiver;
    return obj;
  },
  fromAminoMsg(object: MsgRedeemStakeAminoMsg): MsgRedeemStake {
    return MsgRedeemStake.fromAmino(object.value);
  },
  toAminoMsg(message: MsgRedeemStake): MsgRedeemStakeAminoMsg {
    return {
      type: 'stakeibc/RedeemStake',
      value: MsgRedeemStake.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgRedeemStakeProtoMsg): MsgRedeemStake {
    return MsgRedeemStake.decode(message.value);
  },
  toProto(message: MsgRedeemStake): Uint8Array {
    return MsgRedeemStake.encode(message).finish();
  },
  toProtoMsg(message: MsgRedeemStake): MsgRedeemStakeProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.MsgRedeemStake',
      value: MsgRedeemStake.encode(message).finish(),
    };
  },
};

export interface MsgRegisterHostZone {
  connectionId: string;
  bech32prefix: string;
  hostDenom: string;
  ibcDenom: string;
  creator: string;
  transferChannelId: string;
  unbondingPeriod: bigint;
  minRedemptionRate: string;
  maxRedemptionRate: string;
  lsmLiquidStakeEnabled: boolean;
  communityPoolTreasuryAddress: string;
  maxMessagesPerIcaTx: bigint;
}

export interface MsgRegisterHostZoneAmino {
  connection_id?: string;
  bech32prefix?: string;
  host_denom?: string;
  ibc_denom?: string;
  creator?: string;
  transfer_channel_id?: string;
  unbonding_period?: string;
  min_redemption_rate?: string;
  max_redemption_rate?: string;
  lsm_liquid_stake_enabled?: boolean;
  community_pool_treasury_address?: string;
  max_messages_per_ica_tx?: string;
}

export interface MsgRegisterHostZoneAminoMsg {
  type: 'stakeibc/RegisterHostZone';
  value: MsgRegisterHostZoneAmino;
}

export interface MsgRegisterHostZoneProtoMsg {
  typeUrl: '/stride.stakeibc.MsgRegisterHostZone';
  value: Uint8Array;
}

function createBaseMsgRegisterHostZone(): MsgRegisterHostZone {
  return {
    connectionId: '',
    bech32prefix: '',
    hostDenom: '',
    ibcDenom: '',
    creator: '',
    transferChannelId: '',
    unbondingPeriod: BigInt(0),
    minRedemptionRate: '',
    maxRedemptionRate: '',
    lsmLiquidStakeEnabled: false,
    communityPoolTreasuryAddress: '',
    maxMessagesPerIcaTx: BigInt(0),
  };
}

export const MsgRegisterHostZone = {
  typeUrl: '/stride.stakeibc.MsgRegisterHostZone',
  encode(message: MsgRegisterHostZone, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.connectionId !== '') {
      writer.uint32(18).string(message.connectionId);
    }
    if (message.bech32prefix !== '') {
      writer.uint32(98).string(message.bech32prefix);
    }
    if (message.hostDenom !== '') {
      writer.uint32(34).string(message.hostDenom);
    }
    if (message.ibcDenom !== '') {
      writer.uint32(42).string(message.ibcDenom);
    }
    if (message.creator !== '') {
      writer.uint32(50).string(message.creator);
    }
    if (message.transferChannelId !== '') {
      writer.uint32(82).string(message.transferChannelId);
    }
    if (message.unbondingPeriod !== BigInt(0)) {
      writer.uint32(88).uint64(message.unbondingPeriod);
    }
    if (message.minRedemptionRate !== '') {
      writer.uint32(106).string(Decimal.fromUserInput(message.minRedemptionRate, 18).atomics);
    }
    if (message.maxRedemptionRate !== '') {
      writer.uint32(114).string(Decimal.fromUserInput(message.maxRedemptionRate, 18).atomics);
    }
    if (message.lsmLiquidStakeEnabled === true) {
      writer.uint32(120).bool(message.lsmLiquidStakeEnabled);
    }
    if (message.communityPoolTreasuryAddress !== '') {
      writer.uint32(130).string(message.communityPoolTreasuryAddress);
    }
    if (message.maxMessagesPerIcaTx !== BigInt(0)) {
      writer.uint32(136).uint64(message.maxMessagesPerIcaTx);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgRegisterHostZone {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgRegisterHostZone();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 2:
          message.connectionId = reader.string();
          break;
        case 12:
          message.bech32prefix = reader.string();
          break;
        case 4:
          message.hostDenom = reader.string();
          break;
        case 5:
          message.ibcDenom = reader.string();
          break;
        case 6:
          message.creator = reader.string();
          break;
        case 10:
          message.transferChannelId = reader.string();
          break;
        case 11:
          message.unbondingPeriod = reader.uint64();
          break;
        case 13:
          message.minRedemptionRate = Decimal.fromAtomics(reader.string(), 18).toString();
          break;
        case 14:
          message.maxRedemptionRate = Decimal.fromAtomics(reader.string(), 18).toString();
          break;
        case 15:
          message.lsmLiquidStakeEnabled = reader.bool();
          break;
        case 16:
          message.communityPoolTreasuryAddress = reader.string();
          break;
        case 17:
          message.maxMessagesPerIcaTx = reader.uint64();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgRegisterHostZone>): MsgRegisterHostZone {
    const message = createBaseMsgRegisterHostZone();
    message.connectionId = object.connectionId ?? '';
    message.bech32prefix = object.bech32prefix ?? '';
    message.hostDenom = object.hostDenom ?? '';
    message.ibcDenom = object.ibcDenom ?? '';
    message.creator = object.creator ?? '';
    message.transferChannelId = object.transferChannelId ?? '';
    message.unbondingPeriod =
      object.unbondingPeriod !== undefined && object.unbondingPeriod !== null
        ? BigInt(object.unbondingPeriod.toString())
        : BigInt(0);
    message.minRedemptionRate = object.minRedemptionRate ?? '';
    message.maxRedemptionRate = object.maxRedemptionRate ?? '';
    message.lsmLiquidStakeEnabled = object.lsmLiquidStakeEnabled ?? false;
    message.communityPoolTreasuryAddress = object.communityPoolTreasuryAddress ?? '';
    message.maxMessagesPerIcaTx =
      object.maxMessagesPerIcaTx !== undefined && object.maxMessagesPerIcaTx !== null
        ? BigInt(object.maxMessagesPerIcaTx.toString())
        : BigInt(0);
    return message;
  },
  fromAmino(object: MsgRegisterHostZoneAmino): MsgRegisterHostZone {
    const message = createBaseMsgRegisterHostZone();
    if (object.connection_id !== undefined && object.connection_id !== null) {
      message.connectionId = object.connection_id;
    }
    if (object.bech32prefix !== undefined && object.bech32prefix !== null) {
      message.bech32prefix = object.bech32prefix;
    }
    if (object.host_denom !== undefined && object.host_denom !== null) {
      message.hostDenom = object.host_denom;
    }
    if (object.ibc_denom !== undefined && object.ibc_denom !== null) {
      message.ibcDenom = object.ibc_denom;
    }
    if (object.creator !== undefined && object.creator !== null) {
      message.creator = object.creator;
    }
    if (object.transfer_channel_id !== undefined && object.transfer_channel_id !== null) {
      message.transferChannelId = object.transfer_channel_id;
    }
    if (object.unbonding_period !== undefined && object.unbonding_period !== null) {
      message.unbondingPeriod = BigInt(object.unbonding_period);
    }
    if (object.min_redemption_rate !== undefined && object.min_redemption_rate !== null) {
      message.minRedemptionRate = object.min_redemption_rate;
    }
    if (object.max_redemption_rate !== undefined && object.max_redemption_rate !== null) {
      message.maxRedemptionRate = object.max_redemption_rate;
    }
    if (object.lsm_liquid_stake_enabled !== undefined && object.lsm_liquid_stake_enabled !== null) {
      message.lsmLiquidStakeEnabled = object.lsm_liquid_stake_enabled;
    }
    if (object.community_pool_treasury_address !== undefined && object.community_pool_treasury_address !== null) {
      message.communityPoolTreasuryAddress = object.community_pool_treasury_address;
    }
    if (object.max_messages_per_ica_tx !== undefined && object.max_messages_per_ica_tx !== null) {
      message.maxMessagesPerIcaTx = BigInt(object.max_messages_per_ica_tx);
    }
    return message;
  },
  toAmino(message: MsgRegisterHostZone): MsgRegisterHostZoneAmino {
    const obj: any = {};
    obj.connection_id = message.connectionId === '' ? undefined : message.connectionId;
    obj.bech32prefix = message.bech32prefix === '' ? undefined : message.bech32prefix;
    obj.host_denom = message.hostDenom === '' ? undefined : message.hostDenom;
    obj.ibc_denom = message.ibcDenom === '' ? undefined : message.ibcDenom;
    obj.creator = message.creator === '' ? undefined : message.creator;
    obj.transfer_channel_id = message.transferChannelId === '' ? undefined : message.transferChannelId;
    obj.unbonding_period = message.unbondingPeriod !== BigInt(0) ? message.unbondingPeriod.toString() : undefined;
    obj.min_redemption_rate = message.minRedemptionRate === '' ? undefined : message.minRedemptionRate;
    obj.max_redemption_rate = message.maxRedemptionRate === '' ? undefined : message.maxRedemptionRate;
    obj.lsm_liquid_stake_enabled = message.lsmLiquidStakeEnabled === false ? undefined : message.lsmLiquidStakeEnabled;
    obj.community_pool_treasury_address =
      message.communityPoolTreasuryAddress === '' ? undefined : message.communityPoolTreasuryAddress;
    obj.max_messages_per_ica_tx =
      message.maxMessagesPerIcaTx !== BigInt(0) ? message.maxMessagesPerIcaTx.toString() : undefined;
    return obj;
  },
  fromAminoMsg(object: MsgRegisterHostZoneAminoMsg): MsgRegisterHostZone {
    return MsgRegisterHostZone.fromAmino(object.value);
  },
  toAminoMsg(message: MsgRegisterHostZone): MsgRegisterHostZoneAminoMsg {
    return {
      type: 'stakeibc/RegisterHostZone',
      value: MsgRegisterHostZone.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgRegisterHostZoneProtoMsg): MsgRegisterHostZone {
    return MsgRegisterHostZone.decode(message.value);
  },
  toProto(message: MsgRegisterHostZone): Uint8Array {
    return MsgRegisterHostZone.encode(message).finish();
  },
  toProtoMsg(message: MsgRegisterHostZone): MsgRegisterHostZoneProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.MsgRegisterHostZone',
      value: MsgRegisterHostZone.encode(message).finish(),
    };
  },
};

export interface MsgClaimUndelegatedTokens {
  creator: string;
  /** UserUnbondingRecords are keyed on {chain_id}.{epoch}.{receiver} */
  hostZoneId: string;
  epoch: bigint;
  receiver: string;
}

export interface MsgClaimUndelegatedTokensAmino {
  creator?: string;
  /** UserUnbondingRecords are keyed on {chain_id}.{epoch}.{receiver} */
  host_zone_id?: string;
  epoch?: string;
  receiver?: string;
}

export interface MsgClaimUndelegatedTokensAminoMsg {
  type: 'stakeibc/ClaimUndelegatedTokens';
  value: MsgClaimUndelegatedTokensAmino;
}

export interface MsgClaimUndelegatedTokensProtoMsg {
  typeUrl: '/stride.stakeibc.MsgClaimUndelegatedTokens';
  value: Uint8Array;
}

function createBaseMsgClaimUndelegatedTokens(): MsgClaimUndelegatedTokens {
  return {
    creator: '',
    hostZoneId: '',
    epoch: BigInt(0),
    receiver: '',
  };
}

export const MsgClaimUndelegatedTokens = {
  typeUrl: '/stride.stakeibc.MsgClaimUndelegatedTokens',
  encode(message: MsgClaimUndelegatedTokens, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.creator !== '') {
      writer.uint32(10).string(message.creator);
    }
    if (message.hostZoneId !== '') {
      writer.uint32(18).string(message.hostZoneId);
    }
    if (message.epoch !== BigInt(0)) {
      writer.uint32(24).uint64(message.epoch);
    }
    if (message.receiver !== '') {
      writer.uint32(42).string(message.receiver);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgClaimUndelegatedTokens {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgClaimUndelegatedTokens();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.creator = reader.string();
          break;
        case 2:
          message.hostZoneId = reader.string();
          break;
        case 3:
          message.epoch = reader.uint64();
          break;
        case 5:
          message.receiver = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgClaimUndelegatedTokens>): MsgClaimUndelegatedTokens {
    const message = createBaseMsgClaimUndelegatedTokens();
    message.creator = object.creator ?? '';
    message.hostZoneId = object.hostZoneId ?? '';
    message.epoch = object.epoch !== undefined && object.epoch !== null ? BigInt(object.epoch.toString()) : BigInt(0);
    message.receiver = object.receiver ?? '';
    return message;
  },
  fromAmino(object: MsgClaimUndelegatedTokensAmino): MsgClaimUndelegatedTokens {
    const message = createBaseMsgClaimUndelegatedTokens();
    if (object.creator !== undefined && object.creator !== null) {
      message.creator = object.creator;
    }
    if (object.host_zone_id !== undefined && object.host_zone_id !== null) {
      message.hostZoneId = object.host_zone_id;
    }
    if (object.epoch !== undefined && object.epoch !== null) {
      message.epoch = BigInt(object.epoch);
    }
    if (object.receiver !== undefined && object.receiver !== null) {
      message.receiver = object.receiver;
    }
    return message;
  },
  toAmino(message: MsgClaimUndelegatedTokens): MsgClaimUndelegatedTokensAmino {
    const obj: any = {};
    obj.creator = message.creator === '' ? undefined : message.creator;
    obj.host_zone_id = message.hostZoneId === '' ? undefined : message.hostZoneId;
    obj.epoch = message.epoch !== BigInt(0) ? message.epoch.toString() : undefined;
    obj.receiver = message.receiver === '' ? undefined : message.receiver;
    return obj;
  },
  fromAminoMsg(object: MsgClaimUndelegatedTokensAminoMsg): MsgClaimUndelegatedTokens {
    return MsgClaimUndelegatedTokens.fromAmino(object.value);
  },
  toAminoMsg(message: MsgClaimUndelegatedTokens): MsgClaimUndelegatedTokensAminoMsg {
    return {
      type: 'stakeibc/ClaimUndelegatedTokens',
      value: MsgClaimUndelegatedTokens.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgClaimUndelegatedTokensProtoMsg): MsgClaimUndelegatedTokens {
    return MsgClaimUndelegatedTokens.decode(message.value);
  },
  toProto(message: MsgClaimUndelegatedTokens): Uint8Array {
    return MsgClaimUndelegatedTokens.encode(message).finish();
  },
  toProtoMsg(message: MsgClaimUndelegatedTokens): MsgClaimUndelegatedTokensProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.MsgClaimUndelegatedTokens',
      value: MsgClaimUndelegatedTokens.encode(message).finish(),
    };
  },
};

export interface MsgRebalanceValidators {
  creator: string;
  hostZone: string;
  numRebalance: bigint;
}

export interface MsgRebalanceValidatorsAmino {
  creator?: string;
  host_zone?: string;
  num_rebalance?: string;
}

export interface MsgRebalanceValidatorsAminoMsg {
  type: 'stakeibc/RebalanceValidators';
  value: MsgRebalanceValidatorsAmino;
}

export interface MsgRebalanceValidatorsProtoMsg {
  typeUrl: '/stride.stakeibc.MsgRebalanceValidators';
  value: Uint8Array;
}

function createBaseMsgRebalanceValidators(): MsgRebalanceValidators {
  return {
    creator: '',
    hostZone: '',
    numRebalance: BigInt(0),
  };
}

export const MsgRebalanceValidators = {
  typeUrl: '/stride.stakeibc.MsgRebalanceValidators',
  encode(message: MsgRebalanceValidators, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.creator !== '') {
      writer.uint32(10).string(message.creator);
    }
    if (message.hostZone !== '') {
      writer.uint32(18).string(message.hostZone);
    }
    if (message.numRebalance !== BigInt(0)) {
      writer.uint32(24).uint64(message.numRebalance);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgRebalanceValidators {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgRebalanceValidators();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.creator = reader.string();
          break;
        case 2:
          message.hostZone = reader.string();
          break;
        case 3:
          message.numRebalance = reader.uint64();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgRebalanceValidators>): MsgRebalanceValidators {
    const message = createBaseMsgRebalanceValidators();
    message.creator = object.creator ?? '';
    message.hostZone = object.hostZone ?? '';
    message.numRebalance =
      object.numRebalance !== undefined && object.numRebalance !== null
        ? BigInt(object.numRebalance.toString())
        : BigInt(0);
    return message;
  },
  fromAmino(object: MsgRebalanceValidatorsAmino): MsgRebalanceValidators {
    const message = createBaseMsgRebalanceValidators();
    if (object.creator !== undefined && object.creator !== null) {
      message.creator = object.creator;
    }
    if (object.host_zone !== undefined && object.host_zone !== null) {
      message.hostZone = object.host_zone;
    }
    if (object.num_rebalance !== undefined && object.num_rebalance !== null) {
      message.numRebalance = BigInt(object.num_rebalance);
    }
    return message;
  },
  toAmino(message: MsgRebalanceValidators): MsgRebalanceValidatorsAmino {
    const obj: any = {};
    obj.creator = message.creator === '' ? undefined : message.creator;
    obj.host_zone = message.hostZone === '' ? undefined : message.hostZone;
    obj.num_rebalance = message.numRebalance !== BigInt(0) ? message.numRebalance.toString() : undefined;
    return obj;
  },
  fromAminoMsg(object: MsgRebalanceValidatorsAminoMsg): MsgRebalanceValidators {
    return MsgRebalanceValidators.fromAmino(object.value);
  },
  toAminoMsg(message: MsgRebalanceValidators): MsgRebalanceValidatorsAminoMsg {
    return {
      type: 'stakeibc/RebalanceValidators',
      value: MsgRebalanceValidators.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgRebalanceValidatorsProtoMsg): MsgRebalanceValidators {
    return MsgRebalanceValidators.decode(message.value);
  },
  toProto(message: MsgRebalanceValidators): Uint8Array {
    return MsgRebalanceValidators.encode(message).finish();
  },
  toProtoMsg(message: MsgRebalanceValidators): MsgRebalanceValidatorsProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.MsgRebalanceValidators',
      value: MsgRebalanceValidators.encode(message).finish(),
    };
  },
};

export interface MsgAddValidators {
  creator: string;
  hostZone: string;
  validators: Validator[];
}

export interface MsgAddValidatorsAmino {
  creator?: string;
  host_zone?: string;
  validators?: ValidatorAmino[];
}

export interface MsgAddValidatorsAminoMsg {
  type: '/stride.stakeibc.MsgAddValidators';
  value: MsgAddValidatorsAmino;
}

export interface MsgAddValidatorsProtoMsg {
  typeUrl: '/stride.stakeibc.MsgAddValidators';
  value: Uint8Array;
}

function createBaseMsgAddValidators(): MsgAddValidators {
  return {
    creator: '',
    hostZone: '',
    validators: [],
  };
}

export const MsgAddValidators = {
  typeUrl: '/stride.stakeibc.MsgAddValidators',
  encode(message: MsgAddValidators, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.creator !== '') {
      writer.uint32(10).string(message.creator);
    }
    if (message.hostZone !== '') {
      writer.uint32(18).string(message.hostZone);
    }
    for (const v of message.validators) {
      Validator.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgAddValidators {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgAddValidators();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.creator = reader.string();
          break;
        case 2:
          message.hostZone = reader.string();
          break;
        case 3:
          message.validators.push(Validator.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgAddValidators>): MsgAddValidators {
    const message = createBaseMsgAddValidators();
    message.creator = object.creator ?? '';
    message.hostZone = object.hostZone ?? '';
    message.validators = object.validators?.map((e) => Validator.fromPartial(e)) || [];
    return message;
  },
  fromAmino(object: MsgAddValidatorsAmino): MsgAddValidators {
    const message = createBaseMsgAddValidators();
    if (object.creator !== undefined && object.creator !== null) {
      message.creator = object.creator;
    }
    if (object.host_zone !== undefined && object.host_zone !== null) {
      message.hostZone = object.host_zone;
    }
    message.validators = object.validators?.map((e) => Validator.fromAmino(e)) || [];
    return message;
  },
  toAmino(message: MsgAddValidators): MsgAddValidatorsAmino {
    const obj: any = {};
    obj.creator = message.creator === '' ? undefined : message.creator;
    obj.host_zone = message.hostZone === '' ? undefined : message.hostZone;
    if (message.validators) {
      obj.validators = message.validators.map((e) => (e ? Validator.toAmino(e) : undefined));
    } else {
      obj.validators = message.validators;
    }
    return obj;
  },
  fromAminoMsg(object: MsgAddValidatorsAminoMsg): MsgAddValidators {
    return MsgAddValidators.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgAddValidatorsProtoMsg): MsgAddValidators {
    return MsgAddValidators.decode(message.value);
  },
  toProto(message: MsgAddValidators): Uint8Array {
    return MsgAddValidators.encode(message).finish();
  },
  toProtoMsg(message: MsgAddValidators): MsgAddValidatorsProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.MsgAddValidators',
      value: MsgAddValidators.encode(message).finish(),
    };
  },
};

export interface MsgDeleteValidator {
  creator: string;
  hostZone: string;
  valAddr: string;
}

export interface MsgDeleteValidatorAmino {
  creator?: string;
  host_zone?: string;
  val_addr?: string;
}

export interface MsgDeleteValidatorAminoMsg {
  type: 'stakeibc/DeleteValidator';
  value: MsgDeleteValidatorAmino;
}

export interface MsgDeleteValidatorProtoMsg {
  typeUrl: '/stride.stakeibc.MsgDeleteValidator';
  value: Uint8Array;
}

function createBaseMsgDeleteValidator(): MsgDeleteValidator {
  return {
    creator: '',
    hostZone: '',
    valAddr: '',
  };
}

export const MsgDeleteValidator = {
  typeUrl: '/stride.stakeibc.MsgDeleteValidator',
  encode(message: MsgDeleteValidator, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.creator !== '') {
      writer.uint32(10).string(message.creator);
    }
    if (message.hostZone !== '') {
      writer.uint32(18).string(message.hostZone);
    }
    if (message.valAddr !== '') {
      writer.uint32(26).string(message.valAddr);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgDeleteValidator {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgDeleteValidator();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.creator = reader.string();
          break;
        case 2:
          message.hostZone = reader.string();
          break;
        case 3:
          message.valAddr = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgDeleteValidator>): MsgDeleteValidator {
    const message = createBaseMsgDeleteValidator();
    message.creator = object.creator ?? '';
    message.hostZone = object.hostZone ?? '';
    message.valAddr = object.valAddr ?? '';
    return message;
  },
  fromAmino(object: MsgDeleteValidatorAmino): MsgDeleteValidator {
    const message = createBaseMsgDeleteValidator();
    if (object.creator !== undefined && object.creator !== null) {
      message.creator = object.creator;
    }
    if (object.host_zone !== undefined && object.host_zone !== null) {
      message.hostZone = object.host_zone;
    }
    if (object.val_addr !== undefined && object.val_addr !== null) {
      message.valAddr = object.val_addr;
    }
    return message;
  },
  toAmino(message: MsgDeleteValidator): MsgDeleteValidatorAmino {
    const obj: any = {};
    obj.creator = message.creator === '' ? undefined : message.creator;
    obj.host_zone = message.hostZone === '' ? undefined : message.hostZone;
    obj.val_addr = message.valAddr === '' ? undefined : message.valAddr;
    return obj;
  },
  fromAminoMsg(object: MsgDeleteValidatorAminoMsg): MsgDeleteValidator {
    return MsgDeleteValidator.fromAmino(object.value);
  },
  toAminoMsg(message: MsgDeleteValidator): MsgDeleteValidatorAminoMsg {
    return {
      type: 'stakeibc/DeleteValidator',
      value: MsgDeleteValidator.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgDeleteValidatorProtoMsg): MsgDeleteValidator {
    return MsgDeleteValidator.decode(message.value);
  },
  toProto(message: MsgDeleteValidator): Uint8Array {
    return MsgDeleteValidator.encode(message).finish();
  },
  toProtoMsg(message: MsgDeleteValidator): MsgDeleteValidatorProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.MsgDeleteValidator',
      value: MsgDeleteValidator.encode(message).finish(),
    };
  },
};

export interface MsgRestoreInterchainAccount {
  creator: string;
  chainId: string;
  connectionId: string;
  accountOwner: string;
}

export interface MsgRestoreInterchainAccountAmino {
  creator?: string;
  chain_id?: string;
  connection_id?: string;
  account_owner?: string;
}

export interface MsgRestoreInterchainAccountAminoMsg {
  type: 'stakeibc/RestoreInterchainAccount';
  value: MsgRestoreInterchainAccountAmino;
}

export interface MsgRestoreInterchainAccountProtoMsg {
  typeUrl: '/stride.stakeibc.MsgRestoreInterchainAccount';
  value: Uint8Array;
}

function createBaseMsgRestoreInterchainAccount(): MsgRestoreInterchainAccount {
  return {
    creator: '',
    chainId: '',
    connectionId: '',
    accountOwner: '',
  };
}

export const MsgRestoreInterchainAccount = {
  typeUrl: '/stride.stakeibc.MsgRestoreInterchainAccount',
  encode(message: MsgRestoreInterchainAccount, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.creator !== '') {
      writer.uint32(10).string(message.creator);
    }
    if (message.chainId !== '') {
      writer.uint32(18).string(message.chainId);
    }
    if (message.connectionId !== '') {
      writer.uint32(26).string(message.connectionId);
    }
    if (message.accountOwner !== '') {
      writer.uint32(34).string(message.accountOwner);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgRestoreInterchainAccount {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgRestoreInterchainAccount();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.creator = reader.string();
          break;
        case 2:
          message.chainId = reader.string();
          break;
        case 3:
          message.connectionId = reader.string();
          break;
        case 4:
          message.accountOwner = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgRestoreInterchainAccount>): MsgRestoreInterchainAccount {
    const message = createBaseMsgRestoreInterchainAccount();
    message.creator = object.creator ?? '';
    message.chainId = object.chainId ?? '';
    message.connectionId = object.connectionId ?? '';
    message.accountOwner = object.accountOwner ?? '';
    return message;
  },
  fromAmino(object: MsgRestoreInterchainAccountAmino): MsgRestoreInterchainAccount {
    const message = createBaseMsgRestoreInterchainAccount();
    if (object.creator !== undefined && object.creator !== null) {
      message.creator = object.creator;
    }
    if (object.chain_id !== undefined && object.chain_id !== null) {
      message.chainId = object.chain_id;
    }
    if (object.connection_id !== undefined && object.connection_id !== null) {
      message.connectionId = object.connection_id;
    }
    if (object.account_owner !== undefined && object.account_owner !== null) {
      message.accountOwner = object.account_owner;
    }
    return message;
  },
  toAmino(message: MsgRestoreInterchainAccount): MsgRestoreInterchainAccountAmino {
    const obj: any = {};
    obj.creator = message.creator === '' ? undefined : message.creator;
    obj.chain_id = message.chainId === '' ? undefined : message.chainId;
    obj.connection_id = message.connectionId === '' ? undefined : message.connectionId;
    obj.account_owner = message.accountOwner === '' ? undefined : message.accountOwner;
    return obj;
  },
  fromAminoMsg(object: MsgRestoreInterchainAccountAminoMsg): MsgRestoreInterchainAccount {
    return MsgRestoreInterchainAccount.fromAmino(object.value);
  },
  toAminoMsg(message: MsgRestoreInterchainAccount): MsgRestoreInterchainAccountAminoMsg {
    return {
      type: 'stakeibc/RestoreInterchainAccount',
      value: MsgRestoreInterchainAccount.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgRestoreInterchainAccountProtoMsg): MsgRestoreInterchainAccount {
    return MsgRestoreInterchainAccount.decode(message.value);
  },
  toProto(message: MsgRestoreInterchainAccount): Uint8Array {
    return MsgRestoreInterchainAccount.encode(message).finish();
  },
  toProtoMsg(message: MsgRestoreInterchainAccount): MsgRestoreInterchainAccountProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.MsgRestoreInterchainAccount',
      value: MsgRestoreInterchainAccount.encode(message).finish(),
    };
  },
};

export interface MsgUpdateValidatorSharesExchRate {
  creator: string;
  chainId: string;
  valoper: string;
}

export interface MsgUpdateValidatorSharesExchRateAmino {
  creator?: string;
  chain_id?: string;
  valoper?: string;
}

export interface MsgUpdateValidatorSharesExchRateAminoMsg {
  type: 'stakeibc/UpdateValidatorSharesExchRate';
  value: MsgUpdateValidatorSharesExchRateAmino;
}

export interface MsgUpdateValidatorSharesExchRateProtoMsg {
  typeUrl: '/stride.stakeibc.MsgUpdateValidatorSharesExchRate';
  value: Uint8Array;
}

function createBaseMsgUpdateValidatorSharesExchRate(): MsgUpdateValidatorSharesExchRate {
  return {
    creator: '',
    chainId: '',
    valoper: '',
  };
}

export const MsgUpdateValidatorSharesExchRate = {
  typeUrl: '/stride.stakeibc.MsgUpdateValidatorSharesExchRate',
  encode(message: MsgUpdateValidatorSharesExchRate, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.creator !== '') {
      writer.uint32(10).string(message.creator);
    }
    if (message.chainId !== '') {
      writer.uint32(18).string(message.chainId);
    }
    if (message.valoper !== '') {
      writer.uint32(26).string(message.valoper);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgUpdateValidatorSharesExchRate {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgUpdateValidatorSharesExchRate();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.creator = reader.string();
          break;
        case 2:
          message.chainId = reader.string();
          break;
        case 3:
          message.valoper = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgUpdateValidatorSharesExchRate>): MsgUpdateValidatorSharesExchRate {
    const message = createBaseMsgUpdateValidatorSharesExchRate();
    message.creator = object.creator ?? '';
    message.chainId = object.chainId ?? '';
    message.valoper = object.valoper ?? '';
    return message;
  },
  fromAmino(object: MsgUpdateValidatorSharesExchRateAmino): MsgUpdateValidatorSharesExchRate {
    const message = createBaseMsgUpdateValidatorSharesExchRate();
    if (object.creator !== undefined && object.creator !== null) {
      message.creator = object.creator;
    }
    if (object.chain_id !== undefined && object.chain_id !== null) {
      message.chainId = object.chain_id;
    }
    if (object.valoper !== undefined && object.valoper !== null) {
      message.valoper = object.valoper;
    }
    return message;
  },
  toAmino(message: MsgUpdateValidatorSharesExchRate): MsgUpdateValidatorSharesExchRateAmino {
    const obj: any = {};
    obj.creator = message.creator === '' ? undefined : message.creator;
    obj.chain_id = message.chainId === '' ? undefined : message.chainId;
    obj.valoper = message.valoper === '' ? undefined : message.valoper;
    return obj;
  },
  fromAminoMsg(object: MsgUpdateValidatorSharesExchRateAminoMsg): MsgUpdateValidatorSharesExchRate {
    return MsgUpdateValidatorSharesExchRate.fromAmino(object.value);
  },
  toAminoMsg(message: MsgUpdateValidatorSharesExchRate): MsgUpdateValidatorSharesExchRateAminoMsg {
    return {
      type: 'stakeibc/UpdateValidatorSharesExchRate',
      value: MsgUpdateValidatorSharesExchRate.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgUpdateValidatorSharesExchRateProtoMsg): MsgUpdateValidatorSharesExchRate {
    return MsgUpdateValidatorSharesExchRate.decode(message.value);
  },
  toProto(message: MsgUpdateValidatorSharesExchRate): Uint8Array {
    return MsgUpdateValidatorSharesExchRate.encode(message).finish();
  },
  toProtoMsg(message: MsgUpdateValidatorSharesExchRate): MsgUpdateValidatorSharesExchRateProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.MsgUpdateValidatorSharesExchRate',
      value: MsgUpdateValidatorSharesExchRate.encode(message).finish(),
    };
  },
};

export interface MsgClearBalance {
  creator: string;
  chainId: string;
  amount: string;
  channel: string;
}

export interface MsgClearBalanceAmino {
  creator?: string;
  chain_id?: string;
  amount?: string;
  channel?: string;
}

export interface MsgClearBalanceAminoMsg {
  type: 'still-no-defined';
  value: MsgClearBalanceAmino;
}

export interface MsgClearBalanceProtoMsg {
  typeUrl: '/stride.stakeibc.MsgClearBalance';
  value: Uint8Array;
}

function createBaseMsgClearBalance(): MsgClearBalance {
  return {
    creator: '',
    chainId: '',
    amount: '',
    channel: '',
  };
}

export const MsgClearBalance = {
  typeUrl: '/stride.stakeibc.MsgClearBalance',
  encode(message: MsgClearBalance, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.creator !== '') {
      writer.uint32(10).string(message.creator);
    }
    if (message.chainId !== '') {
      writer.uint32(18).string(message.chainId);
    }
    if (message.amount !== '') {
      writer.uint32(26).string(message.amount);
    }
    if (message.channel !== '') {
      writer.uint32(34).string(message.channel);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgClearBalance {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgClearBalance();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.creator = reader.string();
          break;
        case 2:
          message.chainId = reader.string();
          break;
        case 3:
          message.amount = reader.string();
          break;
        case 4:
          message.channel = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgClearBalance>): MsgClearBalance {
    const message = createBaseMsgClearBalance();
    message.creator = object.creator ?? '';
    message.chainId = object.chainId ?? '';
    message.amount = object.amount ?? '';
    message.channel = object.channel ?? '';
    return message;
  },
  fromAmino(object: MsgClearBalanceAmino): MsgClearBalance {
    const message = createBaseMsgClearBalance();
    if (object.creator !== undefined && object.creator !== null) {
      message.creator = object.creator;
    }
    if (object.chain_id !== undefined && object.chain_id !== null) {
      message.chainId = object.chain_id;
    }
    if (object.amount !== undefined && object.amount !== null) {
      message.amount = object.amount;
    }
    if (object.channel !== undefined && object.channel !== null) {
      message.channel = object.channel;
    }
    return message;
  },
  toAmino(message: MsgClearBalance): MsgClearBalanceAmino {
    const obj: any = {};
    obj.creator = message.creator === '' ? undefined : message.creator;
    obj.chain_id = message.chainId === '' ? undefined : message.chainId;
    obj.amount = message.amount === '' ? undefined : message.amount;
    obj.channel = message.channel === '' ? undefined : message.channel;
    return obj;
  },
  fromAminoMsg(object: MsgClearBalanceAminoMsg): MsgClearBalance {
    return MsgClearBalance.fromAmino(object.value);
  },
  toAminoMsg(message: MsgClearBalance): MsgClearBalanceAminoMsg {
    return {
      type: 'still-no-defined',
      value: MsgClearBalance.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgClearBalanceProtoMsg): MsgClearBalance {
    return MsgClearBalance.decode(message.value);
  },
  toProto(message: MsgClearBalance): Uint8Array {
    return MsgClearBalance.encode(message).finish();
  },
  toProtoMsg(message: MsgClearBalance): MsgClearBalanceProtoMsg {
    return {
      typeUrl: '/stride.stakeibc.MsgClearBalance',
      value: MsgClearBalance.encode(message).finish(),
    };
  },
};
