import { BinaryReader, BinaryWriter } from '../../../binary';
import {
  RawCheckpoint,
  RawCheckpointAmino,
  RawCheckpointSDKType,
  RawCheckpointWithMeta,
  RawCheckpointWithMetaAmino,
  RawCheckpointWithMetaSDKType,
} from './checkpoint';
/**
 * EventCheckpointAccumulating is emitted when a checkpoint reaches the
 * `Accumulating` state.
 */
export interface EventCheckpointAccumulating {
  checkpoint?: RawCheckpointWithMeta;
}
export interface EventCheckpointAccumulatingProtoMsg {
  typeUrl: '/babylon.checkpointing.v1.EventCheckpointAccumulating';
  value: Uint8Array;
}
/**
 * EventCheckpointAccumulating is emitted when a checkpoint reaches the
 * `Accumulating` state.
 */
export interface EventCheckpointAccumulatingAmino {
  checkpoint?: RawCheckpointWithMetaAmino;
}
export interface EventCheckpointAccumulatingAminoMsg {
  type: '/babylon.checkpointing.v1.EventCheckpointAccumulating';
  value: EventCheckpointAccumulatingAmino;
}
/**
 * EventCheckpointAccumulating is emitted when a checkpoint reaches the
 * `Accumulating` state.
 */
export interface EventCheckpointAccumulatingSDKType {
  checkpoint?: RawCheckpointWithMetaSDKType;
}
/**
 * EventCheckpointSealed is emitted when a checkpoint reaches the `Sealed`
 * state.
 */
export interface EventCheckpointSealed {
  checkpoint?: RawCheckpointWithMeta;
}
export interface EventCheckpointSealedProtoMsg {
  typeUrl: '/babylon.checkpointing.v1.EventCheckpointSealed';
  value: Uint8Array;
}
/**
 * EventCheckpointSealed is emitted when a checkpoint reaches the `Sealed`
 * state.
 */
export interface EventCheckpointSealedAmino {
  checkpoint?: RawCheckpointWithMetaAmino;
}
export interface EventCheckpointSealedAminoMsg {
  type: '/babylon.checkpointing.v1.EventCheckpointSealed';
  value: EventCheckpointSealedAmino;
}
/**
 * EventCheckpointSealed is emitted when a checkpoint reaches the `Sealed`
 * state.
 */
export interface EventCheckpointSealedSDKType {
  checkpoint?: RawCheckpointWithMetaSDKType;
}
/**
 * EventCheckpointSubmitted is emitted when a checkpoint reaches the `Submitted`
 * state.
 */
export interface EventCheckpointSubmitted {
  checkpoint?: RawCheckpointWithMeta;
}
export interface EventCheckpointSubmittedProtoMsg {
  typeUrl: '/babylon.checkpointing.v1.EventCheckpointSubmitted';
  value: Uint8Array;
}
/**
 * EventCheckpointSubmitted is emitted when a checkpoint reaches the `Submitted`
 * state.
 */
export interface EventCheckpointSubmittedAmino {
  checkpoint?: RawCheckpointWithMetaAmino;
}
export interface EventCheckpointSubmittedAminoMsg {
  type: '/babylon.checkpointing.v1.EventCheckpointSubmitted';
  value: EventCheckpointSubmittedAmino;
}
/**
 * EventCheckpointSubmitted is emitted when a checkpoint reaches the `Submitted`
 * state.
 */
export interface EventCheckpointSubmittedSDKType {
  checkpoint?: RawCheckpointWithMetaSDKType;
}
/**
 * EventCheckpointConfirmed is emitted when a checkpoint reaches the `Confirmed`
 * state.
 */
export interface EventCheckpointConfirmed {
  checkpoint?: RawCheckpointWithMeta;
}
export interface EventCheckpointConfirmedProtoMsg {
  typeUrl: '/babylon.checkpointing.v1.EventCheckpointConfirmed';
  value: Uint8Array;
}
/**
 * EventCheckpointConfirmed is emitted when a checkpoint reaches the `Confirmed`
 * state.
 */
export interface EventCheckpointConfirmedAmino {
  checkpoint?: RawCheckpointWithMetaAmino;
}
export interface EventCheckpointConfirmedAminoMsg {
  type: '/babylon.checkpointing.v1.EventCheckpointConfirmed';
  value: EventCheckpointConfirmedAmino;
}
/**
 * EventCheckpointConfirmed is emitted when a checkpoint reaches the `Confirmed`
 * state.
 */
export interface EventCheckpointConfirmedSDKType {
  checkpoint?: RawCheckpointWithMetaSDKType;
}
/**
 * EventCheckpointFinalized is emitted when a checkpoint reaches the `Finalized`
 * state.
 */
export interface EventCheckpointFinalized {
  checkpoint?: RawCheckpointWithMeta;
}
export interface EventCheckpointFinalizedProtoMsg {
  typeUrl: '/babylon.checkpointing.v1.EventCheckpointFinalized';
  value: Uint8Array;
}
/**
 * EventCheckpointFinalized is emitted when a checkpoint reaches the `Finalized`
 * state.
 */
export interface EventCheckpointFinalizedAmino {
  checkpoint?: RawCheckpointWithMetaAmino;
}
export interface EventCheckpointFinalizedAminoMsg {
  type: '/babylon.checkpointing.v1.EventCheckpointFinalized';
  value: EventCheckpointFinalizedAmino;
}
/**
 * EventCheckpointFinalized is emitted when a checkpoint reaches the `Finalized`
 * state.
 */
export interface EventCheckpointFinalizedSDKType {
  checkpoint?: RawCheckpointWithMetaSDKType;
}
/**
 * EventCheckpointForgotten is emitted when a checkpoint switches to a
 * `Forgotten` state.
 */
export interface EventCheckpointForgotten {
  checkpoint?: RawCheckpointWithMeta;
}
export interface EventCheckpointForgottenProtoMsg {
  typeUrl: '/babylon.checkpointing.v1.EventCheckpointForgotten';
  value: Uint8Array;
}
/**
 * EventCheckpointForgotten is emitted when a checkpoint switches to a
 * `Forgotten` state.
 */
export interface EventCheckpointForgottenAmino {
  checkpoint?: RawCheckpointWithMetaAmino;
}
export interface EventCheckpointForgottenAminoMsg {
  type: '/babylon.checkpointing.v1.EventCheckpointForgotten';
  value: EventCheckpointForgottenAmino;
}
/**
 * EventCheckpointForgotten is emitted when a checkpoint switches to a
 * `Forgotten` state.
 */
export interface EventCheckpointForgottenSDKType {
  checkpoint?: RawCheckpointWithMetaSDKType;
}
/**
 * EventConflictingCheckpoint is emitted when two conflicting checkpoints are
 * found.
 */
export interface EventConflictingCheckpoint {
  conflictingCheckpoint?: RawCheckpoint;
  localCheckpoint?: RawCheckpointWithMeta;
}
export interface EventConflictingCheckpointProtoMsg {
  typeUrl: '/babylon.checkpointing.v1.EventConflictingCheckpoint';
  value: Uint8Array;
}
/**
 * EventConflictingCheckpoint is emitted when two conflicting checkpoints are
 * found.
 */
export interface EventConflictingCheckpointAmino {
  conflicting_checkpoint?: RawCheckpointAmino;
  local_checkpoint?: RawCheckpointWithMetaAmino;
}
export interface EventConflictingCheckpointAminoMsg {
  type: '/babylon.checkpointing.v1.EventConflictingCheckpoint';
  value: EventConflictingCheckpointAmino;
}
/**
 * EventConflictingCheckpoint is emitted when two conflicting checkpoints are
 * found.
 */
export interface EventConflictingCheckpointSDKType {
  conflicting_checkpoint?: RawCheckpointSDKType;
  local_checkpoint?: RawCheckpointWithMetaSDKType;
}
function createBaseEventCheckpointAccumulating(): EventCheckpointAccumulating {
  return {
    checkpoint: undefined,
  };
}
export const EventCheckpointAccumulating = {
  typeUrl: '/babylon.checkpointing.v1.EventCheckpointAccumulating',
  encode(message: EventCheckpointAccumulating, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.checkpoint !== undefined) {
      RawCheckpointWithMeta.encode(message.checkpoint, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): EventCheckpointAccumulating {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEventCheckpointAccumulating();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.checkpoint = RawCheckpointWithMeta.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<EventCheckpointAccumulating>): EventCheckpointAccumulating {
    const message = createBaseEventCheckpointAccumulating();
    message.checkpoint =
      object.checkpoint !== undefined && object.checkpoint !== null
        ? RawCheckpointWithMeta.fromPartial(object.checkpoint)
        : undefined;
    return message;
  },
  fromAmino(object: EventCheckpointAccumulatingAmino): EventCheckpointAccumulating {
    const message = createBaseEventCheckpointAccumulating();
    if (object.checkpoint !== undefined && object.checkpoint !== null) {
      message.checkpoint = RawCheckpointWithMeta.fromAmino(object.checkpoint);
    }
    return message;
  },
  toAmino(message: EventCheckpointAccumulating): EventCheckpointAccumulatingAmino {
    const obj: any = {};
    obj.checkpoint = message.checkpoint ? RawCheckpointWithMeta.toAmino(message.checkpoint) : undefined;
    return obj;
  },
  fromAminoMsg(object: EventCheckpointAccumulatingAminoMsg): EventCheckpointAccumulating {
    return EventCheckpointAccumulating.fromAmino(object.value);
  },
  fromProtoMsg(message: EventCheckpointAccumulatingProtoMsg): EventCheckpointAccumulating {
    return EventCheckpointAccumulating.decode(message.value);
  },
  toProto(message: EventCheckpointAccumulating): Uint8Array {
    return EventCheckpointAccumulating.encode(message).finish();
  },
  toProtoMsg(message: EventCheckpointAccumulating): EventCheckpointAccumulatingProtoMsg {
    return {
      typeUrl: '/babylon.checkpointing.v1.EventCheckpointAccumulating',
      value: EventCheckpointAccumulating.encode(message).finish(),
    };
  },
};
function createBaseEventCheckpointSealed(): EventCheckpointSealed {
  return {
    checkpoint: undefined,
  };
}
export const EventCheckpointSealed = {
  typeUrl: '/babylon.checkpointing.v1.EventCheckpointSealed',
  encode(message: EventCheckpointSealed, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.checkpoint !== undefined) {
      RawCheckpointWithMeta.encode(message.checkpoint, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): EventCheckpointSealed {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEventCheckpointSealed();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.checkpoint = RawCheckpointWithMeta.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<EventCheckpointSealed>): EventCheckpointSealed {
    const message = createBaseEventCheckpointSealed();
    message.checkpoint =
      object.checkpoint !== undefined && object.checkpoint !== null
        ? RawCheckpointWithMeta.fromPartial(object.checkpoint)
        : undefined;
    return message;
  },
  fromAmino(object: EventCheckpointSealedAmino): EventCheckpointSealed {
    const message = createBaseEventCheckpointSealed();
    if (object.checkpoint !== undefined && object.checkpoint !== null) {
      message.checkpoint = RawCheckpointWithMeta.fromAmino(object.checkpoint);
    }
    return message;
  },
  toAmino(message: EventCheckpointSealed): EventCheckpointSealedAmino {
    const obj: any = {};
    obj.checkpoint = message.checkpoint ? RawCheckpointWithMeta.toAmino(message.checkpoint) : undefined;
    return obj;
  },
  fromAminoMsg(object: EventCheckpointSealedAminoMsg): EventCheckpointSealed {
    return EventCheckpointSealed.fromAmino(object.value);
  },
  fromProtoMsg(message: EventCheckpointSealedProtoMsg): EventCheckpointSealed {
    return EventCheckpointSealed.decode(message.value);
  },
  toProto(message: EventCheckpointSealed): Uint8Array {
    return EventCheckpointSealed.encode(message).finish();
  },
  toProtoMsg(message: EventCheckpointSealed): EventCheckpointSealedProtoMsg {
    return {
      typeUrl: '/babylon.checkpointing.v1.EventCheckpointSealed',
      value: EventCheckpointSealed.encode(message).finish(),
    };
  },
};
function createBaseEventCheckpointSubmitted(): EventCheckpointSubmitted {
  return {
    checkpoint: undefined,
  };
}
export const EventCheckpointSubmitted = {
  typeUrl: '/babylon.checkpointing.v1.EventCheckpointSubmitted',
  encode(message: EventCheckpointSubmitted, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.checkpoint !== undefined) {
      RawCheckpointWithMeta.encode(message.checkpoint, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): EventCheckpointSubmitted {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEventCheckpointSubmitted();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.checkpoint = RawCheckpointWithMeta.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<EventCheckpointSubmitted>): EventCheckpointSubmitted {
    const message = createBaseEventCheckpointSubmitted();
    message.checkpoint =
      object.checkpoint !== undefined && object.checkpoint !== null
        ? RawCheckpointWithMeta.fromPartial(object.checkpoint)
        : undefined;
    return message;
  },
  fromAmino(object: EventCheckpointSubmittedAmino): EventCheckpointSubmitted {
    const message = createBaseEventCheckpointSubmitted();
    if (object.checkpoint !== undefined && object.checkpoint !== null) {
      message.checkpoint = RawCheckpointWithMeta.fromAmino(object.checkpoint);
    }
    return message;
  },
  toAmino(message: EventCheckpointSubmitted): EventCheckpointSubmittedAmino {
    const obj: any = {};
    obj.checkpoint = message.checkpoint ? RawCheckpointWithMeta.toAmino(message.checkpoint) : undefined;
    return obj;
  },
  fromAminoMsg(object: EventCheckpointSubmittedAminoMsg): EventCheckpointSubmitted {
    return EventCheckpointSubmitted.fromAmino(object.value);
  },
  fromProtoMsg(message: EventCheckpointSubmittedProtoMsg): EventCheckpointSubmitted {
    return EventCheckpointSubmitted.decode(message.value);
  },
  toProto(message: EventCheckpointSubmitted): Uint8Array {
    return EventCheckpointSubmitted.encode(message).finish();
  },
  toProtoMsg(message: EventCheckpointSubmitted): EventCheckpointSubmittedProtoMsg {
    return {
      typeUrl: '/babylon.checkpointing.v1.EventCheckpointSubmitted',
      value: EventCheckpointSubmitted.encode(message).finish(),
    };
  },
};
function createBaseEventCheckpointConfirmed(): EventCheckpointConfirmed {
  return {
    checkpoint: undefined,
  };
}
export const EventCheckpointConfirmed = {
  typeUrl: '/babylon.checkpointing.v1.EventCheckpointConfirmed',
  encode(message: EventCheckpointConfirmed, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.checkpoint !== undefined) {
      RawCheckpointWithMeta.encode(message.checkpoint, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): EventCheckpointConfirmed {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEventCheckpointConfirmed();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.checkpoint = RawCheckpointWithMeta.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<EventCheckpointConfirmed>): EventCheckpointConfirmed {
    const message = createBaseEventCheckpointConfirmed();
    message.checkpoint =
      object.checkpoint !== undefined && object.checkpoint !== null
        ? RawCheckpointWithMeta.fromPartial(object.checkpoint)
        : undefined;
    return message;
  },
  fromAmino(object: EventCheckpointConfirmedAmino): EventCheckpointConfirmed {
    const message = createBaseEventCheckpointConfirmed();
    if (object.checkpoint !== undefined && object.checkpoint !== null) {
      message.checkpoint = RawCheckpointWithMeta.fromAmino(object.checkpoint);
    }
    return message;
  },
  toAmino(message: EventCheckpointConfirmed): EventCheckpointConfirmedAmino {
    const obj: any = {};
    obj.checkpoint = message.checkpoint ? RawCheckpointWithMeta.toAmino(message.checkpoint) : undefined;
    return obj;
  },
  fromAminoMsg(object: EventCheckpointConfirmedAminoMsg): EventCheckpointConfirmed {
    return EventCheckpointConfirmed.fromAmino(object.value);
  },
  fromProtoMsg(message: EventCheckpointConfirmedProtoMsg): EventCheckpointConfirmed {
    return EventCheckpointConfirmed.decode(message.value);
  },
  toProto(message: EventCheckpointConfirmed): Uint8Array {
    return EventCheckpointConfirmed.encode(message).finish();
  },
  toProtoMsg(message: EventCheckpointConfirmed): EventCheckpointConfirmedProtoMsg {
    return {
      typeUrl: '/babylon.checkpointing.v1.EventCheckpointConfirmed',
      value: EventCheckpointConfirmed.encode(message).finish(),
    };
  },
};
function createBaseEventCheckpointFinalized(): EventCheckpointFinalized {
  return {
    checkpoint: undefined,
  };
}
export const EventCheckpointFinalized = {
  typeUrl: '/babylon.checkpointing.v1.EventCheckpointFinalized',
  encode(message: EventCheckpointFinalized, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.checkpoint !== undefined) {
      RawCheckpointWithMeta.encode(message.checkpoint, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): EventCheckpointFinalized {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEventCheckpointFinalized();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.checkpoint = RawCheckpointWithMeta.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<EventCheckpointFinalized>): EventCheckpointFinalized {
    const message = createBaseEventCheckpointFinalized();
    message.checkpoint =
      object.checkpoint !== undefined && object.checkpoint !== null
        ? RawCheckpointWithMeta.fromPartial(object.checkpoint)
        : undefined;
    return message;
  },
  fromAmino(object: EventCheckpointFinalizedAmino): EventCheckpointFinalized {
    const message = createBaseEventCheckpointFinalized();
    if (object.checkpoint !== undefined && object.checkpoint !== null) {
      message.checkpoint = RawCheckpointWithMeta.fromAmino(object.checkpoint);
    }
    return message;
  },
  toAmino(message: EventCheckpointFinalized): EventCheckpointFinalizedAmino {
    const obj: any = {};
    obj.checkpoint = message.checkpoint ? RawCheckpointWithMeta.toAmino(message.checkpoint) : undefined;
    return obj;
  },
  fromAminoMsg(object: EventCheckpointFinalizedAminoMsg): EventCheckpointFinalized {
    return EventCheckpointFinalized.fromAmino(object.value);
  },
  fromProtoMsg(message: EventCheckpointFinalizedProtoMsg): EventCheckpointFinalized {
    return EventCheckpointFinalized.decode(message.value);
  },
  toProto(message: EventCheckpointFinalized): Uint8Array {
    return EventCheckpointFinalized.encode(message).finish();
  },
  toProtoMsg(message: EventCheckpointFinalized): EventCheckpointFinalizedProtoMsg {
    return {
      typeUrl: '/babylon.checkpointing.v1.EventCheckpointFinalized',
      value: EventCheckpointFinalized.encode(message).finish(),
    };
  },
};
function createBaseEventCheckpointForgotten(): EventCheckpointForgotten {
  return {
    checkpoint: undefined,
  };
}
export const EventCheckpointForgotten = {
  typeUrl: '/babylon.checkpointing.v1.EventCheckpointForgotten',
  encode(message: EventCheckpointForgotten, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.checkpoint !== undefined) {
      RawCheckpointWithMeta.encode(message.checkpoint, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): EventCheckpointForgotten {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEventCheckpointForgotten();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.checkpoint = RawCheckpointWithMeta.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<EventCheckpointForgotten>): EventCheckpointForgotten {
    const message = createBaseEventCheckpointForgotten();
    message.checkpoint =
      object.checkpoint !== undefined && object.checkpoint !== null
        ? RawCheckpointWithMeta.fromPartial(object.checkpoint)
        : undefined;
    return message;
  },
  fromAmino(object: EventCheckpointForgottenAmino): EventCheckpointForgotten {
    const message = createBaseEventCheckpointForgotten();
    if (object.checkpoint !== undefined && object.checkpoint !== null) {
      message.checkpoint = RawCheckpointWithMeta.fromAmino(object.checkpoint);
    }
    return message;
  },
  toAmino(message: EventCheckpointForgotten): EventCheckpointForgottenAmino {
    const obj: any = {};
    obj.checkpoint = message.checkpoint ? RawCheckpointWithMeta.toAmino(message.checkpoint) : undefined;
    return obj;
  },
  fromAminoMsg(object: EventCheckpointForgottenAminoMsg): EventCheckpointForgotten {
    return EventCheckpointForgotten.fromAmino(object.value);
  },
  fromProtoMsg(message: EventCheckpointForgottenProtoMsg): EventCheckpointForgotten {
    return EventCheckpointForgotten.decode(message.value);
  },
  toProto(message: EventCheckpointForgotten): Uint8Array {
    return EventCheckpointForgotten.encode(message).finish();
  },
  toProtoMsg(message: EventCheckpointForgotten): EventCheckpointForgottenProtoMsg {
    return {
      typeUrl: '/babylon.checkpointing.v1.EventCheckpointForgotten',
      value: EventCheckpointForgotten.encode(message).finish(),
    };
  },
};
function createBaseEventConflictingCheckpoint(): EventConflictingCheckpoint {
  return {
    conflictingCheckpoint: undefined,
    localCheckpoint: undefined,
  };
}
export const EventConflictingCheckpoint = {
  typeUrl: '/babylon.checkpointing.v1.EventConflictingCheckpoint',
  encode(message: EventConflictingCheckpoint, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.conflictingCheckpoint !== undefined) {
      RawCheckpoint.encode(message.conflictingCheckpoint, writer.uint32(10).fork()).ldelim();
    }
    if (message.localCheckpoint !== undefined) {
      RawCheckpointWithMeta.encode(message.localCheckpoint, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): EventConflictingCheckpoint {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEventConflictingCheckpoint();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.conflictingCheckpoint = RawCheckpoint.decode(reader, reader.uint32());
          break;
        case 2:
          message.localCheckpoint = RawCheckpointWithMeta.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<EventConflictingCheckpoint>): EventConflictingCheckpoint {
    const message = createBaseEventConflictingCheckpoint();
    message.conflictingCheckpoint =
      object.conflictingCheckpoint !== undefined && object.conflictingCheckpoint !== null
        ? RawCheckpoint.fromPartial(object.conflictingCheckpoint)
        : undefined;
    message.localCheckpoint =
      object.localCheckpoint !== undefined && object.localCheckpoint !== null
        ? RawCheckpointWithMeta.fromPartial(object.localCheckpoint)
        : undefined;
    return message;
  },
  fromAmino(object: EventConflictingCheckpointAmino): EventConflictingCheckpoint {
    const message = createBaseEventConflictingCheckpoint();
    if (object.conflicting_checkpoint !== undefined && object.conflicting_checkpoint !== null) {
      message.conflictingCheckpoint = RawCheckpoint.fromAmino(object.conflicting_checkpoint);
    }
    if (object.local_checkpoint !== undefined && object.local_checkpoint !== null) {
      message.localCheckpoint = RawCheckpointWithMeta.fromAmino(object.local_checkpoint);
    }
    return message;
  },
  toAmino(message: EventConflictingCheckpoint): EventConflictingCheckpointAmino {
    const obj: any = {};
    obj.conflicting_checkpoint = message.conflictingCheckpoint
      ? RawCheckpoint.toAmino(message.conflictingCheckpoint)
      : undefined;
    obj.local_checkpoint = message.localCheckpoint ? RawCheckpointWithMeta.toAmino(message.localCheckpoint) : undefined;
    return obj;
  },
  fromAminoMsg(object: EventConflictingCheckpointAminoMsg): EventConflictingCheckpoint {
    return EventConflictingCheckpoint.fromAmino(object.value);
  },
  fromProtoMsg(message: EventConflictingCheckpointProtoMsg): EventConflictingCheckpoint {
    return EventConflictingCheckpoint.decode(message.value);
  },
  toProto(message: EventConflictingCheckpoint): Uint8Array {
    return EventConflictingCheckpoint.encode(message).finish();
  },
  toProtoMsg(message: EventConflictingCheckpoint): EventConflictingCheckpointProtoMsg {
    return {
      typeUrl: '/babylon.checkpointing.v1.EventConflictingCheckpoint',
      value: EventConflictingCheckpoint.encode(message).finish(),
    };
  },
};
