import { BinaryReader, BinaryWriter } from '../../../binary';
import { Timestamp } from '../../../google/protobuf/timestamp';
import { base64FromBytes, bytesFromBase64, fromTimestamp, toTimestamp } from '../../../helpers';
/** CheckpointStatus is the status of a checkpoint. */
export enum CheckpointStatus {
  /** CKPT_STATUS_ACCUMULATING - ACCUMULATING defines a checkpoint that is awaiting for BLS signatures. */
  CKPT_STATUS_ACCUMULATING = 0,
  /** CKPT_STATUS_SEALED - SEALED defines a checkpoint that has accumulated sufficient BLS signatures. */
  CKPT_STATUS_SEALED = 1,
  /** CKPT_STATUS_SUBMITTED - SUBMITTED defines a checkpoint that is included on BTC. */
  CKPT_STATUS_SUBMITTED = 2,
  /** CKPT_STATUS_CONFIRMED - CONFIRMED defines a checkpoint that is k-deep on BTC. */
  CKPT_STATUS_CONFIRMED = 3,
  /** CKPT_STATUS_FINALIZED - FINALIZED defines a checkpoint that is w-deep on BTC. */
  CKPT_STATUS_FINALIZED = 4,
  UNRECOGNIZED = -1,
}
export const CheckpointStatusSDKType = CheckpointStatus;
export const CheckpointStatusAmino = CheckpointStatus;
export function checkpointStatusFromJSON(object: any): CheckpointStatus {
  switch (object) {
    case 0:
    case 'CKPT_STATUS_ACCUMULATING':
      return CheckpointStatus.CKPT_STATUS_ACCUMULATING;
    case 1:
    case 'CKPT_STATUS_SEALED':
      return CheckpointStatus.CKPT_STATUS_SEALED;
    case 2:
    case 'CKPT_STATUS_SUBMITTED':
      return CheckpointStatus.CKPT_STATUS_SUBMITTED;
    case 3:
    case 'CKPT_STATUS_CONFIRMED':
      return CheckpointStatus.CKPT_STATUS_CONFIRMED;
    case 4:
    case 'CKPT_STATUS_FINALIZED':
      return CheckpointStatus.CKPT_STATUS_FINALIZED;
    case -1:
    case 'UNRECOGNIZED':
    default:
      return CheckpointStatus.UNRECOGNIZED;
  }
}
export function checkpointStatusToJSON(object: CheckpointStatus): string {
  switch (object) {
    case CheckpointStatus.CKPT_STATUS_ACCUMULATING:
      return 'CKPT_STATUS_ACCUMULATING';
    case CheckpointStatus.CKPT_STATUS_SEALED:
      return 'CKPT_STATUS_SEALED';
    case CheckpointStatus.CKPT_STATUS_SUBMITTED:
      return 'CKPT_STATUS_SUBMITTED';
    case CheckpointStatus.CKPT_STATUS_CONFIRMED:
      return 'CKPT_STATUS_CONFIRMED';
    case CheckpointStatus.CKPT_STATUS_FINALIZED:
      return 'CKPT_STATUS_FINALIZED';
    case CheckpointStatus.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED';
  }
}
/** RawCheckpoint wraps the BLS multi sig with metadata */
export interface RawCheckpoint {
  /** epoch_num defines the epoch number the raw checkpoint is for */
  epochNum: bigint;
  /**
   * block_hash defines the 'BlockID.Hash', which is the hash of
   * the block that individual BLS sigs are signed on
   */
  blockHash: Uint8Array;
  /** bitmap defines the bitmap that indicates the signers of the BLS multi sig */
  bitmap: Uint8Array;
  /**
   * bls_multi_sig defines the multi sig that is aggregated from individual BLS
   * sigs
   */
  blsMultiSig: Uint8Array;
}
export interface RawCheckpointProtoMsg {
  typeUrl: '/babylon.checkpointing.v1.RawCheckpoint';
  value: Uint8Array;
}
/** RawCheckpoint wraps the BLS multi sig with metadata */
export interface RawCheckpointAmino {
  /** epoch_num defines the epoch number the raw checkpoint is for */
  epoch_num?: string;
  /**
   * block_hash defines the 'BlockID.Hash', which is the hash of
   * the block that individual BLS sigs are signed on
   */
  block_hash?: string;
  /** bitmap defines the bitmap that indicates the signers of the BLS multi sig */
  bitmap?: string;
  /**
   * bls_multi_sig defines the multi sig that is aggregated from individual BLS
   * sigs
   */
  bls_multi_sig?: string;
}
export interface RawCheckpointAminoMsg {
  type: '/babylon.checkpointing.v1.RawCheckpoint';
  value: RawCheckpointAmino;
}
/** RawCheckpoint wraps the BLS multi sig with metadata */
export interface RawCheckpointSDKType {
  epoch_num: bigint;
  block_hash: Uint8Array;
  bitmap: Uint8Array;
  bls_multi_sig: Uint8Array;
}
/** RawCheckpointWithMeta wraps the raw checkpoint with metadata. */
export interface RawCheckpointWithMeta {
  ckpt?: RawCheckpoint;
  /** status defines the status of the checkpoint */
  status: CheckpointStatus;
  /** bls_aggr_pk defines the aggregated BLS public key */
  blsAggrPk: Uint8Array;
  /** power_sum defines the accumulated voting power for the checkpoint */
  powerSum: bigint;
  /**
   * lifecycle defines the lifecycle of this checkpoint, i.e., each state
   * transition and the time (in both timestamp and block height) of this
   * transition.
   */
  lifecycle: CheckpointStateUpdate[];
}
export interface RawCheckpointWithMetaProtoMsg {
  typeUrl: '/babylon.checkpointing.v1.RawCheckpointWithMeta';
  value: Uint8Array;
}
/** RawCheckpointWithMeta wraps the raw checkpoint with metadata. */
export interface RawCheckpointWithMetaAmino {
  ckpt?: RawCheckpointAmino;
  /** status defines the status of the checkpoint */
  status?: CheckpointStatus;
  /** bls_aggr_pk defines the aggregated BLS public key */
  bls_aggr_pk?: string;
  /** power_sum defines the accumulated voting power for the checkpoint */
  power_sum?: string;
  /**
   * lifecycle defines the lifecycle of this checkpoint, i.e., each state
   * transition and the time (in both timestamp and block height) of this
   * transition.
   */
  lifecycle?: CheckpointStateUpdateAmino[];
}
export interface RawCheckpointWithMetaAminoMsg {
  type: '/babylon.checkpointing.v1.RawCheckpointWithMeta';
  value: RawCheckpointWithMetaAmino;
}
/** RawCheckpointWithMeta wraps the raw checkpoint with metadata. */
export interface RawCheckpointWithMetaSDKType {
  ckpt?: RawCheckpointSDKType;
  status: CheckpointStatus;
  bls_aggr_pk: Uint8Array;
  power_sum: bigint;
  lifecycle: CheckpointStateUpdateSDKType[];
}
/** InjectedCheckpoint wraps the checkpoint and the extended votes */
export interface InjectedCheckpoint {
  ckpt?: RawCheckpointWithMeta;
}
export interface InjectedCheckpointProtoMsg {
  typeUrl: '/babylon.checkpointing.v1.InjectedCheckpoint';
  value: Uint8Array;
}
/** InjectedCheckpoint wraps the checkpoint and the extended votes */
export interface InjectedCheckpointAmino {
  ckpt?: RawCheckpointWithMetaAmino;
}
export interface InjectedCheckpointAminoMsg {
  type: '/babylon.checkpointing.v1.InjectedCheckpoint';
  value: InjectedCheckpointAmino;
}
/** InjectedCheckpoint wraps the checkpoint and the extended votes */
export interface InjectedCheckpointSDKType {
  ckpt?: RawCheckpointWithMetaSDKType;
}
/** CheckpointStateUpdate defines a state transition on the checkpoint. */
export interface CheckpointStateUpdate {
  /** state defines the event of a state transition towards this state */
  state: CheckpointStatus;
  /**
   * block_height is the height of the Babylon block that triggers the state
   * update
   */
  blockHeight: bigint;
  /**
   * block_time is the timestamp in the Babylon block that triggers the state
   * update
   */
  blockTime?: Date;
}
export interface CheckpointStateUpdateProtoMsg {
  typeUrl: '/babylon.checkpointing.v1.CheckpointStateUpdate';
  value: Uint8Array;
}
/** CheckpointStateUpdate defines a state transition on the checkpoint. */
export interface CheckpointStateUpdateAmino {
  /** state defines the event of a state transition towards this state */
  state?: CheckpointStatus;
  /**
   * block_height is the height of the Babylon block that triggers the state
   * update
   */
  block_height?: string;
  /**
   * block_time is the timestamp in the Babylon block that triggers the state
   * update
   */
  block_time?: string;
}
export interface CheckpointStateUpdateAminoMsg {
  type: '/babylon.checkpointing.v1.CheckpointStateUpdate';
  value: CheckpointStateUpdateAmino;
}
/** CheckpointStateUpdate defines a state transition on the checkpoint. */
export interface CheckpointStateUpdateSDKType {
  state: CheckpointStatus;
  block_height: bigint;
  block_time?: Date;
}
/** BlsSig wraps the BLS sig with metadata. */
export interface BlsSig {
  /** epoch_num defines the epoch number that the BLS sig is signed on */
  epochNum: bigint;
  /**
   * block_hash defines the 'BlockID.Hash', which is the hash of
   * the block that individual BLS sigs are signed on
   */
  blockHash: Uint8Array;
  blsSig: Uint8Array;
  /**
   * can't find cosmos_proto.scalar when compiling due to cosmos v0.45.4 does
   * not support scalar string signer_address = 4 [(cosmos_proto.scalar) =
   * "cosmos.AddressString"]
   * the signer_address defines the address of the
   * signer
   */
  signerAddress: string;
  /** validator_address defines the validator's consensus address */
  validatorAddress: string;
}
export interface BlsSigProtoMsg {
  typeUrl: '/babylon.checkpointing.v1.BlsSig';
  value: Uint8Array;
}
/** BlsSig wraps the BLS sig with metadata. */
export interface BlsSigAmino {
  /** epoch_num defines the epoch number that the BLS sig is signed on */
  epoch_num?: string;
  /**
   * block_hash defines the 'BlockID.Hash', which is the hash of
   * the block that individual BLS sigs are signed on
   */
  block_hash?: string;
  bls_sig?: string;
  /**
   * can't find cosmos_proto.scalar when compiling due to cosmos v0.45.4 does
   * not support scalar string signer_address = 4 [(cosmos_proto.scalar) =
   * "cosmos.AddressString"]
   * the signer_address defines the address of the
   * signer
   */
  signer_address?: string;
  /** validator_address defines the validator's consensus address */
  validator_address?: string;
}
export interface BlsSigAminoMsg {
  type: '/babylon.checkpointing.v1.BlsSig';
  value: BlsSigAmino;
}
/** BlsSig wraps the BLS sig with metadata. */
export interface BlsSigSDKType {
  epoch_num: bigint;
  block_hash: Uint8Array;
  bls_sig: Uint8Array;
  signer_address: string;
  validator_address: string;
}
function createBaseRawCheckpoint(): RawCheckpoint {
  return {
    epochNum: BigInt(0),
    blockHash: new Uint8Array(),
    bitmap: new Uint8Array(),
    blsMultiSig: new Uint8Array(),
  };
}
export const RawCheckpoint = {
  typeUrl: '/babylon.checkpointing.v1.RawCheckpoint',
  encode(message: RawCheckpoint, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.epochNum !== BigInt(0)) {
      writer.uint32(8).uint64(message.epochNum);
    }
    if (message.blockHash.length !== 0) {
      writer.uint32(18).bytes(message.blockHash);
    }
    if (message.bitmap.length !== 0) {
      writer.uint32(26).bytes(message.bitmap);
    }
    if (message.blsMultiSig.length !== 0) {
      writer.uint32(34).bytes(message.blsMultiSig);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): RawCheckpoint {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRawCheckpoint();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.epochNum = reader.uint64();
          break;
        case 2:
          message.blockHash = reader.bytes();
          break;
        case 3:
          message.bitmap = reader.bytes();
          break;
        case 4:
          message.blsMultiSig = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<RawCheckpoint>): RawCheckpoint {
    const message = createBaseRawCheckpoint();
    message.epochNum =
      object.epochNum !== undefined && object.epochNum !== null ? BigInt(object.epochNum.toString()) : BigInt(0);
    message.blockHash = object.blockHash ?? new Uint8Array();
    message.bitmap = object.bitmap ?? new Uint8Array();
    message.blsMultiSig = object.blsMultiSig ?? new Uint8Array();
    return message;
  },
  fromAmino(object: RawCheckpointAmino): RawCheckpoint {
    const message = createBaseRawCheckpoint();
    if (object.epoch_num !== undefined && object.epoch_num !== null) {
      message.epochNum = BigInt(object.epoch_num);
    }
    if (object.block_hash !== undefined && object.block_hash !== null) {
      message.blockHash = bytesFromBase64(object.block_hash);
    }
    if (object.bitmap !== undefined && object.bitmap !== null) {
      message.bitmap = bytesFromBase64(object.bitmap);
    }
    if (object.bls_multi_sig !== undefined && object.bls_multi_sig !== null) {
      message.blsMultiSig = bytesFromBase64(object.bls_multi_sig);
    }
    return message;
  },
  toAmino(message: RawCheckpoint): RawCheckpointAmino {
    const obj: any = {};
    obj.epoch_num = message.epochNum !== BigInt(0) ? message.epochNum?.toString() : undefined;
    obj.block_hash = message.blockHash ? base64FromBytes(message.blockHash) : undefined;
    obj.bitmap = message.bitmap ? base64FromBytes(message.bitmap) : undefined;
    obj.bls_multi_sig = message.blsMultiSig ? base64FromBytes(message.blsMultiSig) : undefined;
    return obj;
  },
  fromAminoMsg(object: RawCheckpointAminoMsg): RawCheckpoint {
    return RawCheckpoint.fromAmino(object.value);
  },
  fromProtoMsg(message: RawCheckpointProtoMsg): RawCheckpoint {
    return RawCheckpoint.decode(message.value);
  },
  toProto(message: RawCheckpoint): Uint8Array {
    return RawCheckpoint.encode(message).finish();
  },
  toProtoMsg(message: RawCheckpoint): RawCheckpointProtoMsg {
    return {
      typeUrl: '/babylon.checkpointing.v1.RawCheckpoint',
      value: RawCheckpoint.encode(message).finish(),
    };
  },
};
function createBaseRawCheckpointWithMeta(): RawCheckpointWithMeta {
  return {
    ckpt: undefined,
    status: 0,
    blsAggrPk: new Uint8Array(),
    powerSum: BigInt(0),
    lifecycle: [],
  };
}
export const RawCheckpointWithMeta = {
  typeUrl: '/babylon.checkpointing.v1.RawCheckpointWithMeta',
  encode(message: RawCheckpointWithMeta, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.ckpt !== undefined) {
      RawCheckpoint.encode(message.ckpt, writer.uint32(10).fork()).ldelim();
    }
    if (message.status !== 0) {
      writer.uint32(16).int32(message.status);
    }
    if (message.blsAggrPk.length !== 0) {
      writer.uint32(26).bytes(message.blsAggrPk);
    }
    if (message.powerSum !== BigInt(0)) {
      writer.uint32(32).uint64(message.powerSum);
    }
    for (const v of message.lifecycle) {
      CheckpointStateUpdate.encode(v!, writer.uint32(42).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): RawCheckpointWithMeta {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRawCheckpointWithMeta();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.ckpt = RawCheckpoint.decode(reader, reader.uint32());
          break;
        case 2:
          message.status = reader.int32() as any;
          break;
        case 3:
          message.blsAggrPk = reader.bytes();
          break;
        case 4:
          message.powerSum = reader.uint64();
          break;
        case 5:
          message.lifecycle.push(CheckpointStateUpdate.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<RawCheckpointWithMeta>): RawCheckpointWithMeta {
    const message = createBaseRawCheckpointWithMeta();
    message.ckpt =
      object.ckpt !== undefined && object.ckpt !== null ? RawCheckpoint.fromPartial(object.ckpt) : undefined;
    message.status = object.status ?? 0;
    message.blsAggrPk = object.blsAggrPk ?? new Uint8Array();
    message.powerSum =
      object.powerSum !== undefined && object.powerSum !== null ? BigInt(object.powerSum.toString()) : BigInt(0);
    message.lifecycle = object.lifecycle?.map((e) => CheckpointStateUpdate.fromPartial(e)) || [];
    return message;
  },
  fromAmino(object: RawCheckpointWithMetaAmino): RawCheckpointWithMeta {
    const message = createBaseRawCheckpointWithMeta();
    if (object.ckpt !== undefined && object.ckpt !== null) {
      message.ckpt = RawCheckpoint.fromAmino(object.ckpt);
    }
    if (object.status !== undefined && object.status !== null) {
      message.status = object.status;
    }
    if (object.bls_aggr_pk !== undefined && object.bls_aggr_pk !== null) {
      message.blsAggrPk = bytesFromBase64(object.bls_aggr_pk);
    }
    if (object.power_sum !== undefined && object.power_sum !== null) {
      message.powerSum = BigInt(object.power_sum);
    }
    message.lifecycle = object.lifecycle?.map((e) => CheckpointStateUpdate.fromAmino(e)) || [];
    return message;
  },
  toAmino(message: RawCheckpointWithMeta): RawCheckpointWithMetaAmino {
    const obj: any = {};
    obj.ckpt = message.ckpt ? RawCheckpoint.toAmino(message.ckpt) : undefined;
    obj.status = message.status === 0 ? undefined : message.status;
    obj.bls_aggr_pk = message.blsAggrPk ? base64FromBytes(message.blsAggrPk) : undefined;
    obj.power_sum = message.powerSum !== BigInt(0) ? message.powerSum?.toString() : undefined;
    if (message.lifecycle) {
      obj.lifecycle = message.lifecycle.map((e) => (e ? CheckpointStateUpdate.toAmino(e) : undefined));
    } else {
      obj.lifecycle = message.lifecycle;
    }
    return obj;
  },
  fromAminoMsg(object: RawCheckpointWithMetaAminoMsg): RawCheckpointWithMeta {
    return RawCheckpointWithMeta.fromAmino(object.value);
  },
  fromProtoMsg(message: RawCheckpointWithMetaProtoMsg): RawCheckpointWithMeta {
    return RawCheckpointWithMeta.decode(message.value);
  },
  toProto(message: RawCheckpointWithMeta): Uint8Array {
    return RawCheckpointWithMeta.encode(message).finish();
  },
  toProtoMsg(message: RawCheckpointWithMeta): RawCheckpointWithMetaProtoMsg {
    return {
      typeUrl: '/babylon.checkpointing.v1.RawCheckpointWithMeta',
      value: RawCheckpointWithMeta.encode(message).finish(),
    };
  },
};
function createBaseInjectedCheckpoint(): InjectedCheckpoint {
  return {
    ckpt: undefined,
  };
}
export const InjectedCheckpoint = {
  typeUrl: '/babylon.checkpointing.v1.InjectedCheckpoint',
  encode(message: InjectedCheckpoint, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.ckpt !== undefined) {
      RawCheckpointWithMeta.encode(message.ckpt, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): InjectedCheckpoint {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseInjectedCheckpoint();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.ckpt = RawCheckpointWithMeta.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<InjectedCheckpoint>): InjectedCheckpoint {
    const message = createBaseInjectedCheckpoint();
    message.ckpt =
      object.ckpt !== undefined && object.ckpt !== null ? RawCheckpointWithMeta.fromPartial(object.ckpt) : undefined;
    return message;
  },
  fromAmino(object: InjectedCheckpointAmino): InjectedCheckpoint {
    const message = createBaseInjectedCheckpoint();
    if (object.ckpt !== undefined && object.ckpt !== null) {
      message.ckpt = RawCheckpointWithMeta.fromAmino(object.ckpt);
    }
    return message;
  },
  toAmino(message: InjectedCheckpoint): InjectedCheckpointAmino {
    const obj: any = {};
    obj.ckpt = message.ckpt ? RawCheckpointWithMeta.toAmino(message.ckpt) : undefined;
    return obj;
  },
  fromAminoMsg(object: InjectedCheckpointAminoMsg): InjectedCheckpoint {
    return InjectedCheckpoint.fromAmino(object.value);
  },
  fromProtoMsg(message: InjectedCheckpointProtoMsg): InjectedCheckpoint {
    return InjectedCheckpoint.decode(message.value);
  },
  toProto(message: InjectedCheckpoint): Uint8Array {
    return InjectedCheckpoint.encode(message).finish();
  },
  toProtoMsg(message: InjectedCheckpoint): InjectedCheckpointProtoMsg {
    return {
      typeUrl: '/babylon.checkpointing.v1.InjectedCheckpoint',
      value: InjectedCheckpoint.encode(message).finish(),
    };
  },
};
function createBaseCheckpointStateUpdate(): CheckpointStateUpdate {
  return {
    state: 0,
    blockHeight: BigInt(0),
    blockTime: undefined,
  };
}
export const CheckpointStateUpdate = {
  typeUrl: '/babylon.checkpointing.v1.CheckpointStateUpdate',
  encode(message: CheckpointStateUpdate, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.state !== 0) {
      writer.uint32(8).int32(message.state);
    }
    if (message.blockHeight !== BigInt(0)) {
      writer.uint32(16).uint64(message.blockHeight);
    }
    if (message.blockTime !== undefined) {
      Timestamp.encode(toTimestamp(message.blockTime), writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): CheckpointStateUpdate {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCheckpointStateUpdate();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.state = reader.int32() as any;
          break;
        case 2:
          message.blockHeight = reader.uint64();
          break;
        case 3:
          message.blockTime = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<CheckpointStateUpdate>): CheckpointStateUpdate {
    const message = createBaseCheckpointStateUpdate();
    message.state = object.state ?? 0;
    message.blockHeight =
      object.blockHeight !== undefined && object.blockHeight !== null
        ? BigInt(object.blockHeight.toString())
        : BigInt(0);
    message.blockTime = object.blockTime ?? undefined;
    return message;
  },
  fromAmino(object: CheckpointStateUpdateAmino): CheckpointStateUpdate {
    const message = createBaseCheckpointStateUpdate();
    if (object.state !== undefined && object.state !== null) {
      message.state = object.state;
    }
    if (object.block_height !== undefined && object.block_height !== null) {
      message.blockHeight = BigInt(object.block_height);
    }
    if (object.block_time !== undefined && object.block_time !== null) {
      message.blockTime = fromTimestamp(Timestamp.fromAmino(object.block_time));
    }
    return message;
  },
  toAmino(message: CheckpointStateUpdate): CheckpointStateUpdateAmino {
    const obj: any = {};
    obj.state = message.state === 0 ? undefined : message.state;
    obj.block_height = message.blockHeight !== BigInt(0) ? message.blockHeight?.toString() : undefined;
    obj.block_time = message.blockTime ? Timestamp.toAmino(toTimestamp(message.blockTime)) : undefined;
    return obj;
  },
  fromAminoMsg(object: CheckpointStateUpdateAminoMsg): CheckpointStateUpdate {
    return CheckpointStateUpdate.fromAmino(object.value);
  },
  fromProtoMsg(message: CheckpointStateUpdateProtoMsg): CheckpointStateUpdate {
    return CheckpointStateUpdate.decode(message.value);
  },
  toProto(message: CheckpointStateUpdate): Uint8Array {
    return CheckpointStateUpdate.encode(message).finish();
  },
  toProtoMsg(message: CheckpointStateUpdate): CheckpointStateUpdateProtoMsg {
    return {
      typeUrl: '/babylon.checkpointing.v1.CheckpointStateUpdate',
      value: CheckpointStateUpdate.encode(message).finish(),
    };
  },
};
function createBaseBlsSig(): BlsSig {
  return {
    epochNum: BigInt(0),
    blockHash: new Uint8Array(),
    blsSig: new Uint8Array(),
    signerAddress: '',
    validatorAddress: '',
  };
}
export const BlsSig = {
  typeUrl: '/babylon.checkpointing.v1.BlsSig',
  encode(message: BlsSig, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.epochNum !== BigInt(0)) {
      writer.uint32(8).uint64(message.epochNum);
    }
    if (message.blockHash.length !== 0) {
      writer.uint32(18).bytes(message.blockHash);
    }
    if (message.blsSig.length !== 0) {
      writer.uint32(26).bytes(message.blsSig);
    }
    if (message.signerAddress !== '') {
      writer.uint32(34).string(message.signerAddress);
    }
    if (message.validatorAddress !== '') {
      writer.uint32(42).string(message.validatorAddress);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): BlsSig {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBlsSig();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.epochNum = reader.uint64();
          break;
        case 2:
          message.blockHash = reader.bytes();
          break;
        case 3:
          message.blsSig = reader.bytes();
          break;
        case 4:
          message.signerAddress = reader.string();
          break;
        case 5:
          message.validatorAddress = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<BlsSig>): BlsSig {
    const message = createBaseBlsSig();
    message.epochNum =
      object.epochNum !== undefined && object.epochNum !== null ? BigInt(object.epochNum.toString()) : BigInt(0);
    message.blockHash = object.blockHash ?? new Uint8Array();
    message.blsSig = object.blsSig ?? new Uint8Array();
    message.signerAddress = object.signerAddress ?? '';
    message.validatorAddress = object.validatorAddress ?? '';
    return message;
  },
  fromAmino(object: BlsSigAmino): BlsSig {
    const message = createBaseBlsSig();
    if (object.epoch_num !== undefined && object.epoch_num !== null) {
      message.epochNum = BigInt(object.epoch_num);
    }
    if (object.block_hash !== undefined && object.block_hash !== null) {
      message.blockHash = bytesFromBase64(object.block_hash);
    }
    if (object.bls_sig !== undefined && object.bls_sig !== null) {
      message.blsSig = bytesFromBase64(object.bls_sig);
    }
    if (object.signer_address !== undefined && object.signer_address !== null) {
      message.signerAddress = object.signer_address;
    }
    if (object.validator_address !== undefined && object.validator_address !== null) {
      message.validatorAddress = object.validator_address;
    }
    return message;
  },
  toAmino(message: BlsSig): BlsSigAmino {
    const obj: any = {};
    obj.epoch_num = message.epochNum !== BigInt(0) ? message.epochNum?.toString() : undefined;
    obj.block_hash = message.blockHash ? base64FromBytes(message.blockHash) : undefined;
    obj.bls_sig = message.blsSig ? base64FromBytes(message.blsSig) : undefined;
    obj.signer_address = message.signerAddress === '' ? undefined : message.signerAddress;
    obj.validator_address = message.validatorAddress === '' ? undefined : message.validatorAddress;
    return obj;
  },
  fromAminoMsg(object: BlsSigAminoMsg): BlsSig {
    return BlsSig.fromAmino(object.value);
  },
  fromProtoMsg(message: BlsSigProtoMsg): BlsSig {
    return BlsSig.decode(message.value);
  },
  toProto(message: BlsSig): Uint8Array {
    return BlsSig.encode(message).finish();
  },
  toProtoMsg(message: BlsSig): BlsSigProtoMsg {
    return {
      typeUrl: '/babylon.checkpointing.v1.BlsSig',
      value: BlsSig.encode(message).finish(),
    };
  },
};
