import { BinaryReader, BinaryWriter } from '../../../binary';
import { base64FromBytes, bytesFromBase64 } from '../../../helpers';
/** EventBeginEpoch is the event emitted when an epoch has started */
export interface EventBeginEpoch {
  epochNumber: bigint;
}
export interface EventBeginEpochProtoMsg {
  typeUrl: '/babylon.epoching.v1.EventBeginEpoch';
  value: Uint8Array;
}
/** EventBeginEpoch is the event emitted when an epoch has started */
export interface EventBeginEpochAmino {
  epoch_number?: string;
}
export interface EventBeginEpochAminoMsg {
  type: '/babylon.epoching.v1.EventBeginEpoch';
  value: EventBeginEpochAmino;
}
/** EventBeginEpoch is the event emitted when an epoch has started */
export interface EventBeginEpochSDKType {
  epoch_number: bigint;
}
/** EventEndEpoch is the event emitted when an epoch has ended */
export interface EventEndEpoch {
  epochNumber: bigint;
}
export interface EventEndEpochProtoMsg {
  typeUrl: '/babylon.epoching.v1.EventEndEpoch';
  value: Uint8Array;
}
/** EventEndEpoch is the event emitted when an epoch has ended */
export interface EventEndEpochAmino {
  epoch_number?: string;
}
export interface EventEndEpochAminoMsg {
  type: '/babylon.epoching.v1.EventEndEpoch';
  value: EventEndEpochAmino;
}
/** EventEndEpoch is the event emitted when an epoch has ended */
export interface EventEndEpochSDKType {
  epoch_number: bigint;
}
/**
 * EventHandleQueuedMsg is the event emitted when a queued message has been
 * handled
 */
export interface EventHandleQueuedMsg {
  originalEventType: string;
  epochNumber: bigint;
  height: bigint;
  txId: Uint8Array;
  msgId: Uint8Array;
  originalAttributes: Uint8Array[];
  error: string;
}
export interface EventHandleQueuedMsgProtoMsg {
  typeUrl: '/babylon.epoching.v1.EventHandleQueuedMsg';
  value: Uint8Array;
}
/**
 * EventHandleQueuedMsg is the event emitted when a queued message has been
 * handled
 */
export interface EventHandleQueuedMsgAmino {
  original_event_type?: string;
  epoch_number?: string;
  height?: string;
  tx_id?: string;
  msg_id?: string;
  original_attributes?: string[];
  error?: string;
}
export interface EventHandleQueuedMsgAminoMsg {
  type: '/babylon.epoching.v1.EventHandleQueuedMsg';
  value: EventHandleQueuedMsgAmino;
}
/**
 * EventHandleQueuedMsg is the event emitted when a queued message has been
 * handled
 */
export interface EventHandleQueuedMsgSDKType {
  original_event_type: string;
  epoch_number: bigint;
  height: bigint;
  tx_id: Uint8Array;
  msg_id: Uint8Array;
  original_attributes: Uint8Array[];
  error: string;
}
/**
 * EventSlashThreshold is the event emitted when a set of validators have been
 * slashed
 */
export interface EventSlashThreshold {
  slashedVotingPower: bigint;
  totalVotingPower: bigint;
  slashedValidators: Uint8Array[];
}
export interface EventSlashThresholdProtoMsg {
  typeUrl: '/babylon.epoching.v1.EventSlashThreshold';
  value: Uint8Array;
}
/**
 * EventSlashThreshold is the event emitted when a set of validators have been
 * slashed
 */
export interface EventSlashThresholdAmino {
  slashed_voting_power?: string;
  total_voting_power?: string;
  slashed_validators?: string[];
}
export interface EventSlashThresholdAminoMsg {
  type: '/babylon.epoching.v1.EventSlashThreshold';
  value: EventSlashThresholdAmino;
}
/**
 * EventSlashThreshold is the event emitted when a set of validators have been
 * slashed
 */
export interface EventSlashThresholdSDKType {
  slashed_voting_power: bigint;
  total_voting_power: bigint;
  slashed_validators: Uint8Array[];
}
/**
 * EventWrappedDelegate is the event emitted when a MsgWrappedDelegate has been
 * queued
 */
export interface EventWrappedDelegate {
  delegatorAddress: string;
  validatorAddress: string;
  amount: bigint;
  denom: string;
  epochBoundary: bigint;
}
export interface EventWrappedDelegateProtoMsg {
  typeUrl: '/babylon.epoching.v1.EventWrappedDelegate';
  value: Uint8Array;
}
/**
 * EventWrappedDelegate is the event emitted when a MsgWrappedDelegate has been
 * queued
 */
export interface EventWrappedDelegateAmino {
  delegator_address?: string;
  validator_address?: string;
  amount?: string;
  denom?: string;
  epoch_boundary?: string;
}
export interface EventWrappedDelegateAminoMsg {
  type: '/babylon.epoching.v1.EventWrappedDelegate';
  value: EventWrappedDelegateAmino;
}
/**
 * EventWrappedDelegate is the event emitted when a MsgWrappedDelegate has been
 * queued
 */
export interface EventWrappedDelegateSDKType {
  delegator_address: string;
  validator_address: string;
  amount: bigint;
  denom: string;
  epoch_boundary: bigint;
}
/**
 * EventWrappedUndelegate is the event emitted when a MsgWrappedUndelegate has
 * been queued
 */
export interface EventWrappedUndelegate {
  delegatorAddress: string;
  validatorAddress: string;
  amount: bigint;
  denom: string;
  epochBoundary: bigint;
}
export interface EventWrappedUndelegateProtoMsg {
  typeUrl: '/babylon.epoching.v1.EventWrappedUndelegate';
  value: Uint8Array;
}
/**
 * EventWrappedUndelegate is the event emitted when a MsgWrappedUndelegate has
 * been queued
 */
export interface EventWrappedUndelegateAmino {
  delegator_address?: string;
  validator_address?: string;
  amount?: string;
  denom?: string;
  epoch_boundary?: string;
}
export interface EventWrappedUndelegateAminoMsg {
  type: '/babylon.epoching.v1.EventWrappedUndelegate';
  value: EventWrappedUndelegateAmino;
}
/**
 * EventWrappedUndelegate is the event emitted when a MsgWrappedUndelegate has
 * been queued
 */
export interface EventWrappedUndelegateSDKType {
  delegator_address: string;
  validator_address: string;
  amount: bigint;
  denom: string;
  epoch_boundary: bigint;
}
/**
 * EventWrappedBeginRedelegate is the event emitted when a
 * MsgWrappedBeginRedelegate has been queued
 */
export interface EventWrappedBeginRedelegate {
  delegatorAddress: string;
  sourceValidatorAddress: string;
  destinationValidatorAddress: string;
  amount: bigint;
  denom: string;
  epochBoundary: bigint;
}
export interface EventWrappedBeginRedelegateProtoMsg {
  typeUrl: '/babylon.epoching.v1.EventWrappedBeginRedelegate';
  value: Uint8Array;
}
/**
 * EventWrappedBeginRedelegate is the event emitted when a
 * MsgWrappedBeginRedelegate has been queued
 */
export interface EventWrappedBeginRedelegateAmino {
  delegator_address?: string;
  source_validator_address?: string;
  destination_validator_address?: string;
  amount?: string;
  denom?: string;
  epoch_boundary?: string;
}
export interface EventWrappedBeginRedelegateAminoMsg {
  type: '/babylon.epoching.v1.EventWrappedBeginRedelegate';
  value: EventWrappedBeginRedelegateAmino;
}
/**
 * EventWrappedBeginRedelegate is the event emitted when a
 * MsgWrappedBeginRedelegate has been queued
 */
export interface EventWrappedBeginRedelegateSDKType {
  delegator_address: string;
  source_validator_address: string;
  destination_validator_address: string;
  amount: bigint;
  denom: string;
  epoch_boundary: bigint;
}
/**
 * EventWrappedCancelUnbondingDelegation is the event emitted when a
 * MsgWrappedCancelUnbondingDelegation has been queued
 */
export interface EventWrappedCancelUnbondingDelegation {
  delegatorAddress: string;
  validatorAddress: string;
  amount: bigint;
  creationHeight: bigint;
  epochBoundary: bigint;
}
export interface EventWrappedCancelUnbondingDelegationProtoMsg {
  typeUrl: '/babylon.epoching.v1.EventWrappedCancelUnbondingDelegation';
  value: Uint8Array;
}
/**
 * EventWrappedCancelUnbondingDelegation is the event emitted when a
 * MsgWrappedCancelUnbondingDelegation has been queued
 */
export interface EventWrappedCancelUnbondingDelegationAmino {
  delegator_address?: string;
  validator_address?: string;
  amount?: string;
  creation_height?: string;
  epoch_boundary?: string;
}
export interface EventWrappedCancelUnbondingDelegationAminoMsg {
  type: '/babylon.epoching.v1.EventWrappedCancelUnbondingDelegation';
  value: EventWrappedCancelUnbondingDelegationAmino;
}
/**
 * EventWrappedCancelUnbondingDelegation is the event emitted when a
 * MsgWrappedCancelUnbondingDelegation has been queued
 */
export interface EventWrappedCancelUnbondingDelegationSDKType {
  delegator_address: string;
  validator_address: string;
  amount: bigint;
  creation_height: bigint;
  epoch_boundary: bigint;
}
function createBaseEventBeginEpoch(): EventBeginEpoch {
  return {
    epochNumber: BigInt(0),
  };
}
export const EventBeginEpoch = {
  typeUrl: '/babylon.epoching.v1.EventBeginEpoch',
  encode(message: EventBeginEpoch, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.epochNumber !== BigInt(0)) {
      writer.uint32(8).uint64(message.epochNumber);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): EventBeginEpoch {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEventBeginEpoch();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.epochNumber = reader.uint64();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<EventBeginEpoch>): EventBeginEpoch {
    const message = createBaseEventBeginEpoch();
    message.epochNumber =
      object.epochNumber !== undefined && object.epochNumber !== null
        ? BigInt(object.epochNumber.toString())
        : BigInt(0);
    return message;
  },
  fromAmino(object: EventBeginEpochAmino): EventBeginEpoch {
    const message = createBaseEventBeginEpoch();
    if (object.epoch_number !== undefined && object.epoch_number !== null) {
      message.epochNumber = BigInt(object.epoch_number);
    }
    return message;
  },
  toAmino(message: EventBeginEpoch): EventBeginEpochAmino {
    const obj: any = {};
    obj.epoch_number = message.epochNumber !== BigInt(0) ? message.epochNumber?.toString() : undefined;
    return obj;
  },
  fromAminoMsg(object: EventBeginEpochAminoMsg): EventBeginEpoch {
    return EventBeginEpoch.fromAmino(object.value);
  },
  fromProtoMsg(message: EventBeginEpochProtoMsg): EventBeginEpoch {
    return EventBeginEpoch.decode(message.value);
  },
  toProto(message: EventBeginEpoch): Uint8Array {
    return EventBeginEpoch.encode(message).finish();
  },
  toProtoMsg(message: EventBeginEpoch): EventBeginEpochProtoMsg {
    return {
      typeUrl: '/babylon.epoching.v1.EventBeginEpoch',
      value: EventBeginEpoch.encode(message).finish(),
    };
  },
};
function createBaseEventEndEpoch(): EventEndEpoch {
  return {
    epochNumber: BigInt(0),
  };
}
export const EventEndEpoch = {
  typeUrl: '/babylon.epoching.v1.EventEndEpoch',
  encode(message: EventEndEpoch, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.epochNumber !== BigInt(0)) {
      writer.uint32(8).uint64(message.epochNumber);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): EventEndEpoch {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEventEndEpoch();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.epochNumber = reader.uint64();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<EventEndEpoch>): EventEndEpoch {
    const message = createBaseEventEndEpoch();
    message.epochNumber =
      object.epochNumber !== undefined && object.epochNumber !== null
        ? BigInt(object.epochNumber.toString())
        : BigInt(0);
    return message;
  },
  fromAmino(object: EventEndEpochAmino): EventEndEpoch {
    const message = createBaseEventEndEpoch();
    if (object.epoch_number !== undefined && object.epoch_number !== null) {
      message.epochNumber = BigInt(object.epoch_number);
    }
    return message;
  },
  toAmino(message: EventEndEpoch): EventEndEpochAmino {
    const obj: any = {};
    obj.epoch_number = message.epochNumber !== BigInt(0) ? message.epochNumber?.toString() : undefined;
    return obj;
  },
  fromAminoMsg(object: EventEndEpochAminoMsg): EventEndEpoch {
    return EventEndEpoch.fromAmino(object.value);
  },
  fromProtoMsg(message: EventEndEpochProtoMsg): EventEndEpoch {
    return EventEndEpoch.decode(message.value);
  },
  toProto(message: EventEndEpoch): Uint8Array {
    return EventEndEpoch.encode(message).finish();
  },
  toProtoMsg(message: EventEndEpoch): EventEndEpochProtoMsg {
    return {
      typeUrl: '/babylon.epoching.v1.EventEndEpoch',
      value: EventEndEpoch.encode(message).finish(),
    };
  },
};
function createBaseEventHandleQueuedMsg(): EventHandleQueuedMsg {
  return {
    originalEventType: '',
    epochNumber: BigInt(0),
    height: BigInt(0),
    txId: new Uint8Array(),
    msgId: new Uint8Array(),
    originalAttributes: [],
    error: '',
  };
}
export const EventHandleQueuedMsg = {
  typeUrl: '/babylon.epoching.v1.EventHandleQueuedMsg',
  encode(message: EventHandleQueuedMsg, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.originalEventType !== '') {
      writer.uint32(10).string(message.originalEventType);
    }
    if (message.epochNumber !== BigInt(0)) {
      writer.uint32(16).uint64(message.epochNumber);
    }
    if (message.height !== BigInt(0)) {
      writer.uint32(24).uint64(message.height);
    }
    if (message.txId.length !== 0) {
      writer.uint32(34).bytes(message.txId);
    }
    if (message.msgId.length !== 0) {
      writer.uint32(42).bytes(message.msgId);
    }
    for (const v of message.originalAttributes) {
      writer.uint32(50).bytes(v!);
    }
    if (message.error !== '') {
      writer.uint32(58).string(message.error);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): EventHandleQueuedMsg {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEventHandleQueuedMsg();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.originalEventType = reader.string();
          break;
        case 2:
          message.epochNumber = reader.uint64();
          break;
        case 3:
          message.height = reader.uint64();
          break;
        case 4:
          message.txId = reader.bytes();
          break;
        case 5:
          message.msgId = reader.bytes();
          break;
        case 6:
          message.originalAttributes.push(reader.bytes());
          break;
        case 7:
          message.error = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<EventHandleQueuedMsg>): EventHandleQueuedMsg {
    const message = createBaseEventHandleQueuedMsg();
    message.originalEventType = object.originalEventType ?? '';
    message.epochNumber =
      object.epochNumber !== undefined && object.epochNumber !== null
        ? BigInt(object.epochNumber.toString())
        : BigInt(0);
    message.height =
      object.height !== undefined && object.height !== null ? BigInt(object.height.toString()) : BigInt(0);
    message.txId = object.txId ?? new Uint8Array();
    message.msgId = object.msgId ?? new Uint8Array();
    message.originalAttributes = object.originalAttributes?.map((e) => e) || [];
    message.error = object.error ?? '';
    return message;
  },
  fromAmino(object: EventHandleQueuedMsgAmino): EventHandleQueuedMsg {
    const message = createBaseEventHandleQueuedMsg();
    if (object.original_event_type !== undefined && object.original_event_type !== null) {
      message.originalEventType = object.original_event_type;
    }
    if (object.epoch_number !== undefined && object.epoch_number !== null) {
      message.epochNumber = BigInt(object.epoch_number);
    }
    if (object.height !== undefined && object.height !== null) {
      message.height = BigInt(object.height);
    }
    if (object.tx_id !== undefined && object.tx_id !== null) {
      message.txId = bytesFromBase64(object.tx_id);
    }
    if (object.msg_id !== undefined && object.msg_id !== null) {
      message.msgId = bytesFromBase64(object.msg_id);
    }
    message.originalAttributes = object.original_attributes?.map((e) => bytesFromBase64(e)) || [];
    if (object.error !== undefined && object.error !== null) {
      message.error = object.error;
    }
    return message;
  },
  toAmino(message: EventHandleQueuedMsg): EventHandleQueuedMsgAmino {
    const obj: any = {};
    obj.original_event_type = message.originalEventType === '' ? undefined : message.originalEventType;
    obj.epoch_number = message.epochNumber !== BigInt(0) ? message.epochNumber?.toString() : undefined;
    obj.height = message.height !== BigInt(0) ? message.height?.toString() : undefined;
    obj.tx_id = message.txId ? base64FromBytes(message.txId) : undefined;
    obj.msg_id = message.msgId ? base64FromBytes(message.msgId) : undefined;
    if (message.originalAttributes) {
      obj.original_attributes = message.originalAttributes.map((e) => base64FromBytes(e));
    } else {
      obj.original_attributes = message.originalAttributes;
    }
    obj.error = message.error === '' ? undefined : message.error;
    return obj;
  },
  fromAminoMsg(object: EventHandleQueuedMsgAminoMsg): EventHandleQueuedMsg {
    return EventHandleQueuedMsg.fromAmino(object.value);
  },
  fromProtoMsg(message: EventHandleQueuedMsgProtoMsg): EventHandleQueuedMsg {
    return EventHandleQueuedMsg.decode(message.value);
  },
  toProto(message: EventHandleQueuedMsg): Uint8Array {
    return EventHandleQueuedMsg.encode(message).finish();
  },
  toProtoMsg(message: EventHandleQueuedMsg): EventHandleQueuedMsgProtoMsg {
    return {
      typeUrl: '/babylon.epoching.v1.EventHandleQueuedMsg',
      value: EventHandleQueuedMsg.encode(message).finish(),
    };
  },
};
function createBaseEventSlashThreshold(): EventSlashThreshold {
  return {
    slashedVotingPower: BigInt(0),
    totalVotingPower: BigInt(0),
    slashedValidators: [],
  };
}
export const EventSlashThreshold = {
  typeUrl: '/babylon.epoching.v1.EventSlashThreshold',
  encode(message: EventSlashThreshold, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.slashedVotingPower !== BigInt(0)) {
      writer.uint32(8).int64(message.slashedVotingPower);
    }
    if (message.totalVotingPower !== BigInt(0)) {
      writer.uint32(16).int64(message.totalVotingPower);
    }
    for (const v of message.slashedValidators) {
      writer.uint32(26).bytes(v!);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): EventSlashThreshold {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEventSlashThreshold();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.slashedVotingPower = reader.int64();
          break;
        case 2:
          message.totalVotingPower = reader.int64();
          break;
        case 3:
          message.slashedValidators.push(reader.bytes());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<EventSlashThreshold>): EventSlashThreshold {
    const message = createBaseEventSlashThreshold();
    message.slashedVotingPower =
      object.slashedVotingPower !== undefined && object.slashedVotingPower !== null
        ? BigInt(object.slashedVotingPower.toString())
        : BigInt(0);
    message.totalVotingPower =
      object.totalVotingPower !== undefined && object.totalVotingPower !== null
        ? BigInt(object.totalVotingPower.toString())
        : BigInt(0);
    message.slashedValidators = object.slashedValidators?.map((e) => e) || [];
    return message;
  },
  fromAmino(object: EventSlashThresholdAmino): EventSlashThreshold {
    const message = createBaseEventSlashThreshold();
    if (object.slashed_voting_power !== undefined && object.slashed_voting_power !== null) {
      message.slashedVotingPower = BigInt(object.slashed_voting_power);
    }
    if (object.total_voting_power !== undefined && object.total_voting_power !== null) {
      message.totalVotingPower = BigInt(object.total_voting_power);
    }
    message.slashedValidators = object.slashed_validators?.map((e) => bytesFromBase64(e)) || [];
    return message;
  },
  toAmino(message: EventSlashThreshold): EventSlashThresholdAmino {
    const obj: any = {};
    obj.slashed_voting_power =
      message.slashedVotingPower !== BigInt(0) ? message.slashedVotingPower?.toString() : undefined;
    obj.total_voting_power = message.totalVotingPower !== BigInt(0) ? message.totalVotingPower?.toString() : undefined;
    if (message.slashedValidators) {
      obj.slashed_validators = message.slashedValidators.map((e) => base64FromBytes(e));
    } else {
      obj.slashed_validators = message.slashedValidators;
    }
    return obj;
  },
  fromAminoMsg(object: EventSlashThresholdAminoMsg): EventSlashThreshold {
    return EventSlashThreshold.fromAmino(object.value);
  },
  fromProtoMsg(message: EventSlashThresholdProtoMsg): EventSlashThreshold {
    return EventSlashThreshold.decode(message.value);
  },
  toProto(message: EventSlashThreshold): Uint8Array {
    return EventSlashThreshold.encode(message).finish();
  },
  toProtoMsg(message: EventSlashThreshold): EventSlashThresholdProtoMsg {
    return {
      typeUrl: '/babylon.epoching.v1.EventSlashThreshold',
      value: EventSlashThreshold.encode(message).finish(),
    };
  },
};
function createBaseEventWrappedDelegate(): EventWrappedDelegate {
  return {
    delegatorAddress: '',
    validatorAddress: '',
    amount: BigInt(0),
    denom: '',
    epochBoundary: BigInt(0),
  };
}
export const EventWrappedDelegate = {
  typeUrl: '/babylon.epoching.v1.EventWrappedDelegate',
  encode(message: EventWrappedDelegate, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.delegatorAddress !== '') {
      writer.uint32(10).string(message.delegatorAddress);
    }
    if (message.validatorAddress !== '') {
      writer.uint32(18).string(message.validatorAddress);
    }
    if (message.amount !== BigInt(0)) {
      writer.uint32(24).uint64(message.amount);
    }
    if (message.denom !== '') {
      writer.uint32(34).string(message.denom);
    }
    if (message.epochBoundary !== BigInt(0)) {
      writer.uint32(40).uint64(message.epochBoundary);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): EventWrappedDelegate {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEventWrappedDelegate();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.delegatorAddress = reader.string();
          break;
        case 2:
          message.validatorAddress = reader.string();
          break;
        case 3:
          message.amount = reader.uint64();
          break;
        case 4:
          message.denom = reader.string();
          break;
        case 5:
          message.epochBoundary = reader.uint64();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<EventWrappedDelegate>): EventWrappedDelegate {
    const message = createBaseEventWrappedDelegate();
    message.delegatorAddress = object.delegatorAddress ?? '';
    message.validatorAddress = object.validatorAddress ?? '';
    message.amount =
      object.amount !== undefined && object.amount !== null ? BigInt(object.amount.toString()) : BigInt(0);
    message.denom = object.denom ?? '';
    message.epochBoundary =
      object.epochBoundary !== undefined && object.epochBoundary !== null
        ? BigInt(object.epochBoundary.toString())
        : BigInt(0);
    return message;
  },
  fromAmino(object: EventWrappedDelegateAmino): EventWrappedDelegate {
    const message = createBaseEventWrappedDelegate();
    if (object.delegator_address !== undefined && object.delegator_address !== null) {
      message.delegatorAddress = object.delegator_address;
    }
    if (object.validator_address !== undefined && object.validator_address !== null) {
      message.validatorAddress = object.validator_address;
    }
    if (object.amount !== undefined && object.amount !== null) {
      message.amount = BigInt(object.amount);
    }
    if (object.denom !== undefined && object.denom !== null) {
      message.denom = object.denom;
    }
    if (object.epoch_boundary !== undefined && object.epoch_boundary !== null) {
      message.epochBoundary = BigInt(object.epoch_boundary);
    }
    return message;
  },
  toAmino(message: EventWrappedDelegate): EventWrappedDelegateAmino {
    const obj: any = {};
    obj.delegator_address = message.delegatorAddress === '' ? undefined : message.delegatorAddress;
    obj.validator_address = message.validatorAddress === '' ? undefined : message.validatorAddress;
    obj.amount = message.amount !== BigInt(0) ? message.amount?.toString() : undefined;
    obj.denom = message.denom === '' ? undefined : message.denom;
    obj.epoch_boundary = message.epochBoundary !== BigInt(0) ? message.epochBoundary?.toString() : undefined;
    return obj;
  },
  fromAminoMsg(object: EventWrappedDelegateAminoMsg): EventWrappedDelegate {
    return EventWrappedDelegate.fromAmino(object.value);
  },
  fromProtoMsg(message: EventWrappedDelegateProtoMsg): EventWrappedDelegate {
    return EventWrappedDelegate.decode(message.value);
  },
  toProto(message: EventWrappedDelegate): Uint8Array {
    return EventWrappedDelegate.encode(message).finish();
  },
  toProtoMsg(message: EventWrappedDelegate): EventWrappedDelegateProtoMsg {
    return {
      typeUrl: '/babylon.epoching.v1.EventWrappedDelegate',
      value: EventWrappedDelegate.encode(message).finish(),
    };
  },
};
function createBaseEventWrappedUndelegate(): EventWrappedUndelegate {
  return {
    delegatorAddress: '',
    validatorAddress: '',
    amount: BigInt(0),
    denom: '',
    epochBoundary: BigInt(0),
  };
}
export const EventWrappedUndelegate = {
  typeUrl: '/babylon.epoching.v1.EventWrappedUndelegate',
  encode(message: EventWrappedUndelegate, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.delegatorAddress !== '') {
      writer.uint32(10).string(message.delegatorAddress);
    }
    if (message.validatorAddress !== '') {
      writer.uint32(18).string(message.validatorAddress);
    }
    if (message.amount !== BigInt(0)) {
      writer.uint32(24).uint64(message.amount);
    }
    if (message.denom !== '') {
      writer.uint32(34).string(message.denom);
    }
    if (message.epochBoundary !== BigInt(0)) {
      writer.uint32(40).uint64(message.epochBoundary);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): EventWrappedUndelegate {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEventWrappedUndelegate();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.delegatorAddress = reader.string();
          break;
        case 2:
          message.validatorAddress = reader.string();
          break;
        case 3:
          message.amount = reader.uint64();
          break;
        case 4:
          message.denom = reader.string();
          break;
        case 5:
          message.epochBoundary = reader.uint64();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<EventWrappedUndelegate>): EventWrappedUndelegate {
    const message = createBaseEventWrappedUndelegate();
    message.delegatorAddress = object.delegatorAddress ?? '';
    message.validatorAddress = object.validatorAddress ?? '';
    message.amount =
      object.amount !== undefined && object.amount !== null ? BigInt(object.amount.toString()) : BigInt(0);
    message.denom = object.denom ?? '';
    message.epochBoundary =
      object.epochBoundary !== undefined && object.epochBoundary !== null
        ? BigInt(object.epochBoundary.toString())
        : BigInt(0);
    return message;
  },
  fromAmino(object: EventWrappedUndelegateAmino): EventWrappedUndelegate {
    const message = createBaseEventWrappedUndelegate();
    if (object.delegator_address !== undefined && object.delegator_address !== null) {
      message.delegatorAddress = object.delegator_address;
    }
    if (object.validator_address !== undefined && object.validator_address !== null) {
      message.validatorAddress = object.validator_address;
    }
    if (object.amount !== undefined && object.amount !== null) {
      message.amount = BigInt(object.amount);
    }
    if (object.denom !== undefined && object.denom !== null) {
      message.denom = object.denom;
    }
    if (object.epoch_boundary !== undefined && object.epoch_boundary !== null) {
      message.epochBoundary = BigInt(object.epoch_boundary);
    }
    return message;
  },
  toAmino(message: EventWrappedUndelegate): EventWrappedUndelegateAmino {
    const obj: any = {};
    obj.delegator_address = message.delegatorAddress === '' ? undefined : message.delegatorAddress;
    obj.validator_address = message.validatorAddress === '' ? undefined : message.validatorAddress;
    obj.amount = message.amount !== BigInt(0) ? message.amount?.toString() : undefined;
    obj.denom = message.denom === '' ? undefined : message.denom;
    obj.epoch_boundary = message.epochBoundary !== BigInt(0) ? message.epochBoundary?.toString() : undefined;
    return obj;
  },
  fromAminoMsg(object: EventWrappedUndelegateAminoMsg): EventWrappedUndelegate {
    return EventWrappedUndelegate.fromAmino(object.value);
  },
  fromProtoMsg(message: EventWrappedUndelegateProtoMsg): EventWrappedUndelegate {
    return EventWrappedUndelegate.decode(message.value);
  },
  toProto(message: EventWrappedUndelegate): Uint8Array {
    return EventWrappedUndelegate.encode(message).finish();
  },
  toProtoMsg(message: EventWrappedUndelegate): EventWrappedUndelegateProtoMsg {
    return {
      typeUrl: '/babylon.epoching.v1.EventWrappedUndelegate',
      value: EventWrappedUndelegate.encode(message).finish(),
    };
  },
};
function createBaseEventWrappedBeginRedelegate(): EventWrappedBeginRedelegate {
  return {
    delegatorAddress: '',
    sourceValidatorAddress: '',
    destinationValidatorAddress: '',
    amount: BigInt(0),
    denom: '',
    epochBoundary: BigInt(0),
  };
}
export const EventWrappedBeginRedelegate = {
  typeUrl: '/babylon.epoching.v1.EventWrappedBeginRedelegate',
  encode(message: EventWrappedBeginRedelegate, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.delegatorAddress !== '') {
      writer.uint32(10).string(message.delegatorAddress);
    }
    if (message.sourceValidatorAddress !== '') {
      writer.uint32(18).string(message.sourceValidatorAddress);
    }
    if (message.destinationValidatorAddress !== '') {
      writer.uint32(26).string(message.destinationValidatorAddress);
    }
    if (message.amount !== BigInt(0)) {
      writer.uint32(32).uint64(message.amount);
    }
    if (message.denom !== '') {
      writer.uint32(42).string(message.denom);
    }
    if (message.epochBoundary !== BigInt(0)) {
      writer.uint32(48).uint64(message.epochBoundary);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): EventWrappedBeginRedelegate {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEventWrappedBeginRedelegate();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.delegatorAddress = reader.string();
          break;
        case 2:
          message.sourceValidatorAddress = reader.string();
          break;
        case 3:
          message.destinationValidatorAddress = reader.string();
          break;
        case 4:
          message.amount = reader.uint64();
          break;
        case 5:
          message.denom = reader.string();
          break;
        case 6:
          message.epochBoundary = reader.uint64();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<EventWrappedBeginRedelegate>): EventWrappedBeginRedelegate {
    const message = createBaseEventWrappedBeginRedelegate();
    message.delegatorAddress = object.delegatorAddress ?? '';
    message.sourceValidatorAddress = object.sourceValidatorAddress ?? '';
    message.destinationValidatorAddress = object.destinationValidatorAddress ?? '';
    message.amount =
      object.amount !== undefined && object.amount !== null ? BigInt(object.amount.toString()) : BigInt(0);
    message.denom = object.denom ?? '';
    message.epochBoundary =
      object.epochBoundary !== undefined && object.epochBoundary !== null
        ? BigInt(object.epochBoundary.toString())
        : BigInt(0);
    return message;
  },
  fromAmino(object: EventWrappedBeginRedelegateAmino): EventWrappedBeginRedelegate {
    const message = createBaseEventWrappedBeginRedelegate();
    if (object.delegator_address !== undefined && object.delegator_address !== null) {
      message.delegatorAddress = object.delegator_address;
    }
    if (object.source_validator_address !== undefined && object.source_validator_address !== null) {
      message.sourceValidatorAddress = object.source_validator_address;
    }
    if (object.destination_validator_address !== undefined && object.destination_validator_address !== null) {
      message.destinationValidatorAddress = object.destination_validator_address;
    }
    if (object.amount !== undefined && object.amount !== null) {
      message.amount = BigInt(object.amount);
    }
    if (object.denom !== undefined && object.denom !== null) {
      message.denom = object.denom;
    }
    if (object.epoch_boundary !== undefined && object.epoch_boundary !== null) {
      message.epochBoundary = BigInt(object.epoch_boundary);
    }
    return message;
  },
  toAmino(message: EventWrappedBeginRedelegate): EventWrappedBeginRedelegateAmino {
    const obj: any = {};
    obj.delegator_address = message.delegatorAddress === '' ? undefined : message.delegatorAddress;
    obj.source_validator_address = message.sourceValidatorAddress === '' ? undefined : message.sourceValidatorAddress;
    obj.destination_validator_address =
      message.destinationValidatorAddress === '' ? undefined : message.destinationValidatorAddress;
    obj.amount = message.amount !== BigInt(0) ? message.amount?.toString() : undefined;
    obj.denom = message.denom === '' ? undefined : message.denom;
    obj.epoch_boundary = message.epochBoundary !== BigInt(0) ? message.epochBoundary?.toString() : undefined;
    return obj;
  },
  fromAminoMsg(object: EventWrappedBeginRedelegateAminoMsg): EventWrappedBeginRedelegate {
    return EventWrappedBeginRedelegate.fromAmino(object.value);
  },
  fromProtoMsg(message: EventWrappedBeginRedelegateProtoMsg): EventWrappedBeginRedelegate {
    return EventWrappedBeginRedelegate.decode(message.value);
  },
  toProto(message: EventWrappedBeginRedelegate): Uint8Array {
    return EventWrappedBeginRedelegate.encode(message).finish();
  },
  toProtoMsg(message: EventWrappedBeginRedelegate): EventWrappedBeginRedelegateProtoMsg {
    return {
      typeUrl: '/babylon.epoching.v1.EventWrappedBeginRedelegate',
      value: EventWrappedBeginRedelegate.encode(message).finish(),
    };
  },
};
function createBaseEventWrappedCancelUnbondingDelegation(): EventWrappedCancelUnbondingDelegation {
  return {
    delegatorAddress: '',
    validatorAddress: '',
    amount: BigInt(0),
    creationHeight: BigInt(0),
    epochBoundary: BigInt(0),
  };
}
export const EventWrappedCancelUnbondingDelegation = {
  typeUrl: '/babylon.epoching.v1.EventWrappedCancelUnbondingDelegation',
  encode(message: EventWrappedCancelUnbondingDelegation, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.delegatorAddress !== '') {
      writer.uint32(10).string(message.delegatorAddress);
    }
    if (message.validatorAddress !== '') {
      writer.uint32(18).string(message.validatorAddress);
    }
    if (message.amount !== BigInt(0)) {
      writer.uint32(24).uint64(message.amount);
    }
    if (message.creationHeight !== BigInt(0)) {
      writer.uint32(32).int64(message.creationHeight);
    }
    if (message.epochBoundary !== BigInt(0)) {
      writer.uint32(40).uint64(message.epochBoundary);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): EventWrappedCancelUnbondingDelegation {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEventWrappedCancelUnbondingDelegation();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.delegatorAddress = reader.string();
          break;
        case 2:
          message.validatorAddress = reader.string();
          break;
        case 3:
          message.amount = reader.uint64();
          break;
        case 4:
          message.creationHeight = reader.int64();
          break;
        case 5:
          message.epochBoundary = reader.uint64();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<EventWrappedCancelUnbondingDelegation>): EventWrappedCancelUnbondingDelegation {
    const message = createBaseEventWrappedCancelUnbondingDelegation();
    message.delegatorAddress = object.delegatorAddress ?? '';
    message.validatorAddress = object.validatorAddress ?? '';
    message.amount =
      object.amount !== undefined && object.amount !== null ? BigInt(object.amount.toString()) : BigInt(0);
    message.creationHeight =
      object.creationHeight !== undefined && object.creationHeight !== null
        ? BigInt(object.creationHeight.toString())
        : BigInt(0);
    message.epochBoundary =
      object.epochBoundary !== undefined && object.epochBoundary !== null
        ? BigInt(object.epochBoundary.toString())
        : BigInt(0);
    return message;
  },
  fromAmino(object: EventWrappedCancelUnbondingDelegationAmino): EventWrappedCancelUnbondingDelegation {
    const message = createBaseEventWrappedCancelUnbondingDelegation();
    if (object.delegator_address !== undefined && object.delegator_address !== null) {
      message.delegatorAddress = object.delegator_address;
    }
    if (object.validator_address !== undefined && object.validator_address !== null) {
      message.validatorAddress = object.validator_address;
    }
    if (object.amount !== undefined && object.amount !== null) {
      message.amount = BigInt(object.amount);
    }
    if (object.creation_height !== undefined && object.creation_height !== null) {
      message.creationHeight = BigInt(object.creation_height);
    }
    if (object.epoch_boundary !== undefined && object.epoch_boundary !== null) {
      message.epochBoundary = BigInt(object.epoch_boundary);
    }
    return message;
  },
  toAmino(message: EventWrappedCancelUnbondingDelegation): EventWrappedCancelUnbondingDelegationAmino {
    const obj: any = {};
    obj.delegator_address = message.delegatorAddress === '' ? undefined : message.delegatorAddress;
    obj.validator_address = message.validatorAddress === '' ? undefined : message.validatorAddress;
    obj.amount = message.amount !== BigInt(0) ? message.amount?.toString() : undefined;
    obj.creation_height = message.creationHeight !== BigInt(0) ? message.creationHeight?.toString() : undefined;
    obj.epoch_boundary = message.epochBoundary !== BigInt(0) ? message.epochBoundary?.toString() : undefined;
    return obj;
  },
  fromAminoMsg(object: EventWrappedCancelUnbondingDelegationAminoMsg): EventWrappedCancelUnbondingDelegation {
    return EventWrappedCancelUnbondingDelegation.fromAmino(object.value);
  },
  fromProtoMsg(message: EventWrappedCancelUnbondingDelegationProtoMsg): EventWrappedCancelUnbondingDelegation {
    return EventWrappedCancelUnbondingDelegation.decode(message.value);
  },
  toProto(message: EventWrappedCancelUnbondingDelegation): Uint8Array {
    return EventWrappedCancelUnbondingDelegation.encode(message).finish();
  },
  toProtoMsg(message: EventWrappedCancelUnbondingDelegation): EventWrappedCancelUnbondingDelegationProtoMsg {
    return {
      typeUrl: '/babylon.epoching.v1.EventWrappedCancelUnbondingDelegation',
      value: EventWrappedCancelUnbondingDelegation.encode(message).finish(),
    };
  },
};
