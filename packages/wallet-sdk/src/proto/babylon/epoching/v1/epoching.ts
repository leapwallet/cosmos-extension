import { BinaryReader, BinaryWriter } from '../../../binary';
import { Timestamp } from '../../../google/protobuf/timestamp';
import { base64FromBytes, bytesFromBase64, fromTimestamp, toTimestamp } from '../../../helpers';
import { Coin, CoinAmino, CoinSDKType } from '../../core-proto-ts/cosmos/base/v1beta1/coin';
import {
  MsgBeginRedelegate,
  MsgBeginRedelegateAmino,
  MsgBeginRedelegateSDKType,
  MsgCreateValidator,
  MsgCreateValidatorAmino,
  MsgCreateValidatorSDKType,
  MsgDelegate,
  MsgDelegateAmino,
  MsgDelegateSDKType,
  MsgUndelegate,
  MsgUndelegateAmino,
  MsgUndelegateSDKType,
} from '../../core-proto-ts/cosmos/staking/v1beta1/tx';
/** BondState is the bond state of a validator or delegation */
export enum BondState {
  /** CREATED - CREATED is when the validator/delegation has been created */
  CREATED = 0,
  /** BONDED - CREATED is when the validator/delegation has become bonded */
  BONDED = 1,
  /** UNBONDING - CREATED is when the validator/delegation has become unbonding */
  UNBONDING = 2,
  /** UNBONDED - CREATED is when the validator/delegation has become unbonded */
  UNBONDED = 3,
  /** REMOVED - CREATED is when the validator/delegation has been removed */
  REMOVED = 4,
  UNRECOGNIZED = -1,
}
export const BondStateSDKType = BondState;
export const BondStateAmino = BondState;
export function bondStateFromJSON(object: any): BondState {
  switch (object) {
    case 0:
    case 'CREATED':
      return BondState.CREATED;
    case 1:
    case 'BONDED':
      return BondState.BONDED;
    case 2:
    case 'UNBONDING':
      return BondState.UNBONDING;
    case 3:
    case 'UNBONDED':
      return BondState.UNBONDED;
    case 4:
    case 'REMOVED':
      return BondState.REMOVED;
    case -1:
    case 'UNRECOGNIZED':
    default:
      return BondState.UNRECOGNIZED;
  }
}
export function bondStateToJSON(object: BondState): string {
  switch (object) {
    case BondState.CREATED:
      return 'CREATED';
    case BondState.BONDED:
      return 'BONDED';
    case BondState.UNBONDING:
      return 'UNBONDING';
    case BondState.UNBONDED:
      return 'UNBONDED';
    case BondState.REMOVED:
      return 'REMOVED';
    case BondState.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED';
  }
}
/** Epoch is a structure that contains the metadata of an epoch */
export interface Epoch {
  /** epoch_number is the number of this epoch */
  epochNumber: bigint;
  /** current_epoch_interval is the epoch interval at the time of this epoch */
  currentEpochInterval: bigint;
  /** first_block_height is the height of the first block in this epoch */
  firstBlockHeight: bigint;
  /**
   * last_block_time is the time of the last block in this epoch.
   * Babylon needs to remember the last header's time of each epoch to complete
   * unbonding validators/delegations when a previous epoch's checkpoint is
   * finalised. The last_block_time field is nil in the epoch's beginning, and
   * is set upon the end of this epoch.
   */
  lastBlockTime?: Date;
  /**
   * sealer is the last block of the sealed epoch
   * sealer_app_hash points to the sealer but stored in the 1st header
   * of the next epoch
   */
  sealerAppHash: Uint8Array;
  /**
   * sealer_block_hash is the hash of the sealer
   * the validator set has generated a BLS multisig on the hash,
   * i.e., hash of the last block in the epoch
   */
  sealerBlockHash: Uint8Array;
}
export interface EpochProtoMsg {
  typeUrl: '/babylon.epoching.v1.Epoch';
  value: Uint8Array;
}
/** Epoch is a structure that contains the metadata of an epoch */
export interface EpochAmino {
  /** epoch_number is the number of this epoch */
  epoch_number?: string;
  /** current_epoch_interval is the epoch interval at the time of this epoch */
  current_epoch_interval?: string;
  /** first_block_height is the height of the first block in this epoch */
  first_block_height?: string;
  /**
   * last_block_time is the time of the last block in this epoch.
   * Babylon needs to remember the last header's time of each epoch to complete
   * unbonding validators/delegations when a previous epoch's checkpoint is
   * finalised. The last_block_time field is nil in the epoch's beginning, and
   * is set upon the end of this epoch.
   */
  last_block_time?: string;
  /**
   * sealer is the last block of the sealed epoch
   * sealer_app_hash points to the sealer but stored in the 1st header
   * of the next epoch
   */
  sealer_app_hash?: string;
  /**
   * sealer_block_hash is the hash of the sealer
   * the validator set has generated a BLS multisig on the hash,
   * i.e., hash of the last block in the epoch
   */
  sealer_block_hash?: string;
}
export interface EpochAminoMsg {
  type: '/babylon.epoching.v1.Epoch';
  value: EpochAmino;
}
/** Epoch is a structure that contains the metadata of an epoch */
export interface EpochSDKType {
  epoch_number: bigint;
  current_epoch_interval: bigint;
  first_block_height: bigint;
  last_block_time?: Date;
  sealer_app_hash: Uint8Array;
  sealer_block_hash: Uint8Array;
}
/**
 * QueuedMessage is a message that can change the validator set and is delayed
 * to the end of an epoch
 */
export interface QueuedMessage {
  /** tx_id is the ID of the tx that contains the message */
  txId: Uint8Array;
  /** msg_id is the original message ID, i.e., hash of the marshaled message */
  msgId: Uint8Array;
  /** block_height is the height when this msg is submitted to Babylon */
  blockHeight: bigint;
  /** block_time is the timestamp when this msg is submitted to Babylon */
  blockTime?: Date;
  msgCreateValidator?: MsgCreateValidator;
  msgDelegate?: MsgDelegate;
  msgUndelegate?: MsgUndelegate;
  msgBeginRedelegate?: MsgBeginRedelegate;
}
export interface QueuedMessageProtoMsg {
  typeUrl: '/babylon.epoching.v1.QueuedMessage';
  value: Uint8Array;
}
/**
 * QueuedMessage is a message that can change the validator set and is delayed
 * to the end of an epoch
 */
export interface QueuedMessageAmino {
  /** tx_id is the ID of the tx that contains the message */
  tx_id?: string;
  /** msg_id is the original message ID, i.e., hash of the marshaled message */
  msg_id?: string;
  /** block_height is the height when this msg is submitted to Babylon */
  block_height?: string;
  /** block_time is the timestamp when this msg is submitted to Babylon */
  block_time?: string;
  msg_create_validator?: MsgCreateValidatorAmino;
  msg_delegate?: MsgDelegateAmino;
  msg_undelegate?: MsgUndelegateAmino;
  msg_begin_redelegate?: MsgBeginRedelegateAmino;
}
export interface QueuedMessageAminoMsg {
  type: '/babylon.epoching.v1.QueuedMessage';
  value: QueuedMessageAmino;
}
/**
 * QueuedMessage is a message that can change the validator set and is delayed
 * to the end of an epoch
 */
export interface QueuedMessageSDKType {
  tx_id: Uint8Array;
  msg_id: Uint8Array;
  block_height: bigint;
  block_time?: Date;
  msg_create_validator?: MsgCreateValidatorSDKType;
  msg_delegate?: MsgDelegateSDKType;
  msg_undelegate?: MsgUndelegateSDKType;
  msg_begin_redelegate?: MsgBeginRedelegateSDKType;
}
/** ValStateUpdate is a message that records a state update of a validator */
export interface ValStateUpdate {
  state: BondState;
  blockHeight: bigint;
  blockTime?: Date;
}
export interface ValStateUpdateProtoMsg {
  typeUrl: '/babylon.epoching.v1.ValStateUpdate';
  value: Uint8Array;
}
/** ValStateUpdate is a message that records a state update of a validator */
export interface ValStateUpdateAmino {
  state?: BondState;
  block_height?: string;
  block_time?: string;
}
export interface ValStateUpdateAminoMsg {
  type: '/babylon.epoching.v1.ValStateUpdate';
  value: ValStateUpdateAmino;
}
/** ValStateUpdate is a message that records a state update of a validator */
export interface ValStateUpdateSDKType {
  state: BondState;
  block_height: bigint;
  block_time?: Date;
}
/**
 * ValidatorLifecycle is a message that records the lifecycle of
 * a validator
 */
export interface ValidatorLifecycle {
  valAddr: string;
  valLife: ValStateUpdate[];
}
export interface ValidatorLifecycleProtoMsg {
  typeUrl: '/babylon.epoching.v1.ValidatorLifecycle';
  value: Uint8Array;
}
/**
 * ValidatorLifecycle is a message that records the lifecycle of
 * a validator
 */
export interface ValidatorLifecycleAmino {
  val_addr?: string;
  val_life?: ValStateUpdateAmino[];
}
export interface ValidatorLifecycleAminoMsg {
  type: '/babylon.epoching.v1.ValidatorLifecycle';
  value: ValidatorLifecycleAmino;
}
/**
 * ValidatorLifecycle is a message that records the lifecycle of
 * a validator
 */
export interface ValidatorLifecycleSDKType {
  val_addr: string;
  val_life: ValStateUpdateSDKType[];
}
/**
 * DelegationStateUpdate is the message that records a state update of a
 * delegation
 */
export interface DelegationStateUpdate {
  state: BondState;
  valAddr: string;
  amount?: Coin;
  blockHeight: bigint;
  blockTime?: Date;
}
export interface DelegationStateUpdateProtoMsg {
  typeUrl: '/babylon.epoching.v1.DelegationStateUpdate';
  value: Uint8Array;
}
/**
 * DelegationStateUpdate is the message that records a state update of a
 * delegation
 */
export interface DelegationStateUpdateAmino {
  state?: BondState;
  val_addr?: string;
  amount?: CoinAmino;
  block_height?: string;
  block_time?: string;
}
export interface DelegationStateUpdateAminoMsg {
  type: '/babylon.epoching.v1.DelegationStateUpdate';
  value: DelegationStateUpdateAmino;
}
/**
 * DelegationStateUpdate is the message that records a state update of a
 * delegation
 */
export interface DelegationStateUpdateSDKType {
  state: BondState;
  val_addr: string;
  amount?: CoinSDKType;
  block_height: bigint;
  block_time?: Date;
}
/**
 * ValidatorLifecycle is a message that records the lifecycle of
 * a delegation
 */
export interface DelegationLifecycle {
  delAddr: string;
  delLife: DelegationStateUpdate[];
}
export interface DelegationLifecycleProtoMsg {
  typeUrl: '/babylon.epoching.v1.DelegationLifecycle';
  value: Uint8Array;
}
/**
 * ValidatorLifecycle is a message that records the lifecycle of
 * a delegation
 */
export interface DelegationLifecycleAmino {
  del_addr?: string;
  del_life?: DelegationStateUpdateAmino[];
}
export interface DelegationLifecycleAminoMsg {
  type: '/babylon.epoching.v1.DelegationLifecycle';
  value: DelegationLifecycleAmino;
}
/**
 * ValidatorLifecycle is a message that records the lifecycle of
 * a delegation
 */
export interface DelegationLifecycleSDKType {
  del_addr: string;
  del_life: DelegationStateUpdateSDKType[];
}
/** Validator is a message that denotes a validator */
export interface Validator {
  /** addr is the validator's address (in sdk.ValAddress) */
  addr: Uint8Array;
  /** power is the validator's voting power */
  power: bigint;
}
export interface ValidatorProtoMsg {
  typeUrl: '/babylon.epoching.v1.Validator';
  value: Uint8Array;
}
/** Validator is a message that denotes a validator */
export interface ValidatorAmino {
  /** addr is the validator's address (in sdk.ValAddress) */
  addr?: string;
  /** power is the validator's voting power */
  power?: string;
}
export interface ValidatorAminoMsg {
  type: '/babylon.epoching.v1.Validator';
  value: ValidatorAmino;
}
/** Validator is a message that denotes a validator */
export interface ValidatorSDKType {
  addr: Uint8Array;
  power: bigint;
}
function createBaseEpoch(): Epoch {
  return {
    epochNumber: BigInt(0),
    currentEpochInterval: BigInt(0),
    firstBlockHeight: BigInt(0),
    lastBlockTime: undefined,
    sealerAppHash: new Uint8Array(),
    sealerBlockHash: new Uint8Array(),
  };
}
export const Epoch = {
  typeUrl: '/babylon.epoching.v1.Epoch',
  encode(message: Epoch, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.epochNumber !== BigInt(0)) {
      writer.uint32(8).uint64(message.epochNumber);
    }
    if (message.currentEpochInterval !== BigInt(0)) {
      writer.uint32(16).uint64(message.currentEpochInterval);
    }
    if (message.firstBlockHeight !== BigInt(0)) {
      writer.uint32(24).uint64(message.firstBlockHeight);
    }
    if (message.lastBlockTime !== undefined) {
      Timestamp.encode(toTimestamp(message.lastBlockTime), writer.uint32(34).fork()).ldelim();
    }
    if (message.sealerAppHash.length !== 0) {
      writer.uint32(42).bytes(message.sealerAppHash);
    }
    if (message.sealerBlockHash.length !== 0) {
      writer.uint32(50).bytes(message.sealerBlockHash);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): Epoch {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEpoch();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.epochNumber = reader.uint64();
          break;
        case 2:
          message.currentEpochInterval = reader.uint64();
          break;
        case 3:
          message.firstBlockHeight = reader.uint64();
          break;
        case 4:
          message.lastBlockTime = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          break;
        case 5:
          message.sealerAppHash = reader.bytes();
          break;
        case 6:
          message.sealerBlockHash = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<Epoch>): Epoch {
    const message = createBaseEpoch();
    message.epochNumber =
      object.epochNumber !== undefined && object.epochNumber !== null
        ? BigInt(object.epochNumber.toString())
        : BigInt(0);
    message.currentEpochInterval =
      object.currentEpochInterval !== undefined && object.currentEpochInterval !== null
        ? BigInt(object.currentEpochInterval.toString())
        : BigInt(0);
    message.firstBlockHeight =
      object.firstBlockHeight !== undefined && object.firstBlockHeight !== null
        ? BigInt(object.firstBlockHeight.toString())
        : BigInt(0);
    message.lastBlockTime = object.lastBlockTime ?? undefined;
    message.sealerAppHash = object.sealerAppHash ?? new Uint8Array();
    message.sealerBlockHash = object.sealerBlockHash ?? new Uint8Array();
    return message;
  },
  fromAmino(object: EpochAmino): Epoch {
    const message = createBaseEpoch();
    if (object.epoch_number !== undefined && object.epoch_number !== null) {
      message.epochNumber = BigInt(object.epoch_number);
    }
    if (object.current_epoch_interval !== undefined && object.current_epoch_interval !== null) {
      message.currentEpochInterval = BigInt(object.current_epoch_interval);
    }
    if (object.first_block_height !== undefined && object.first_block_height !== null) {
      message.firstBlockHeight = BigInt(object.first_block_height);
    }
    if (object.last_block_time !== undefined && object.last_block_time !== null) {
      message.lastBlockTime = fromTimestamp(Timestamp.fromAmino(object.last_block_time));
    }
    if (object.sealer_app_hash !== undefined && object.sealer_app_hash !== null) {
      message.sealerAppHash = bytesFromBase64(object.sealer_app_hash);
    }
    if (object.sealer_block_hash !== undefined && object.sealer_block_hash !== null) {
      message.sealerBlockHash = bytesFromBase64(object.sealer_block_hash);
    }
    return message;
  },
  toAmino(message: Epoch): EpochAmino {
    const obj: any = {};
    obj.epoch_number = message.epochNumber !== BigInt(0) ? message.epochNumber?.toString() : undefined;
    obj.current_epoch_interval =
      message.currentEpochInterval !== BigInt(0) ? message.currentEpochInterval?.toString() : undefined;
    obj.first_block_height = message.firstBlockHeight !== BigInt(0) ? message.firstBlockHeight?.toString() : undefined;
    obj.last_block_time = message.lastBlockTime ? Timestamp.toAmino(toTimestamp(message.lastBlockTime)) : undefined;
    obj.sealer_app_hash = message.sealerAppHash ? base64FromBytes(message.sealerAppHash) : undefined;
    obj.sealer_block_hash = message.sealerBlockHash ? base64FromBytes(message.sealerBlockHash) : undefined;
    return obj;
  },
  fromAminoMsg(object: EpochAminoMsg): Epoch {
    return Epoch.fromAmino(object.value);
  },
  fromProtoMsg(message: EpochProtoMsg): Epoch {
    return Epoch.decode(message.value);
  },
  toProto(message: Epoch): Uint8Array {
    return Epoch.encode(message).finish();
  },
  toProtoMsg(message: Epoch): EpochProtoMsg {
    return {
      typeUrl: '/babylon.epoching.v1.Epoch',
      value: Epoch.encode(message).finish(),
    };
  },
};
function createBaseQueuedMessage(): QueuedMessage {
  return {
    txId: new Uint8Array(),
    msgId: new Uint8Array(),
    blockHeight: BigInt(0),
    blockTime: undefined,
    msgCreateValidator: undefined,
    msgDelegate: undefined,
    msgUndelegate: undefined,
    msgBeginRedelegate: undefined,
  };
}
export const QueuedMessage = {
  typeUrl: '/babylon.epoching.v1.QueuedMessage',
  encode(message: QueuedMessage, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.txId.length !== 0) {
      writer.uint32(10).bytes(message.txId);
    }
    if (message.msgId.length !== 0) {
      writer.uint32(18).bytes(message.msgId);
    }
    if (message.blockHeight !== BigInt(0)) {
      writer.uint32(24).uint64(message.blockHeight);
    }
    if (message.blockTime !== undefined) {
      Timestamp.encode(toTimestamp(message.blockTime), writer.uint32(34).fork()).ldelim();
    }
    if (message.msgCreateValidator !== undefined) {
      MsgCreateValidator.encode(message.msgCreateValidator, writer.uint32(42).fork()).ldelim();
    }
    if (message.msgDelegate !== undefined) {
      MsgDelegate.encode(message.msgDelegate, writer.uint32(50).fork()).ldelim();
    }
    if (message.msgUndelegate !== undefined) {
      MsgUndelegate.encode(message.msgUndelegate, writer.uint32(58).fork()).ldelim();
    }
    if (message.msgBeginRedelegate !== undefined) {
      MsgBeginRedelegate.encode(message.msgBeginRedelegate, writer.uint32(66).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): QueuedMessage {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueuedMessage();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.txId = reader.bytes();
          break;
        case 2:
          message.msgId = reader.bytes();
          break;
        case 3:
          message.blockHeight = reader.uint64();
          break;
        case 4:
          message.blockTime = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          break;
        case 5:
          message.msgCreateValidator = MsgCreateValidator.decode(reader, reader.uint32());
          break;
        case 6:
          message.msgDelegate = MsgDelegate.decode(reader, reader.uint32());
          break;
        case 7:
          message.msgUndelegate = MsgUndelegate.decode(reader, reader.uint32());
          break;
        case 8:
          message.msgBeginRedelegate = MsgBeginRedelegate.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<QueuedMessage>): QueuedMessage {
    const message = createBaseQueuedMessage();
    message.txId = object.txId ?? new Uint8Array();
    message.msgId = object.msgId ?? new Uint8Array();
    message.blockHeight =
      object.blockHeight !== undefined && object.blockHeight !== null
        ? BigInt(object.blockHeight.toString())
        : BigInt(0);
    message.blockTime = object.blockTime ?? undefined;
    message.msgCreateValidator =
      object.msgCreateValidator !== undefined && object.msgCreateValidator !== null
        ? MsgCreateValidator.fromPartial(object.msgCreateValidator)
        : undefined;
    message.msgDelegate =
      object.msgDelegate !== undefined && object.msgDelegate !== null
        ? MsgDelegate.fromPartial(object.msgDelegate)
        : undefined;
    message.msgUndelegate =
      object.msgUndelegate !== undefined && object.msgUndelegate !== null
        ? MsgUndelegate.fromPartial(object.msgUndelegate)
        : undefined;
    message.msgBeginRedelegate =
      object.msgBeginRedelegate !== undefined && object.msgBeginRedelegate !== null
        ? MsgBeginRedelegate.fromPartial(object.msgBeginRedelegate)
        : undefined;
    return message;
  },
  fromAmino(object: QueuedMessageAmino): QueuedMessage {
    const message = createBaseQueuedMessage();
    if (object.tx_id !== undefined && object.tx_id !== null) {
      message.txId = bytesFromBase64(object.tx_id);
    }
    if (object.msg_id !== undefined && object.msg_id !== null) {
      message.msgId = bytesFromBase64(object.msg_id);
    }
    if (object.block_height !== undefined && object.block_height !== null) {
      message.blockHeight = BigInt(object.block_height);
    }
    if (object.block_time !== undefined && object.block_time !== null) {
      message.blockTime = fromTimestamp(Timestamp.fromAmino(object.block_time));
    }
    if (object.msg_create_validator !== undefined && object.msg_create_validator !== null) {
      message.msgCreateValidator = MsgCreateValidator.fromAmino(object.msg_create_validator);
    }
    if (object.msg_delegate !== undefined && object.msg_delegate !== null) {
      message.msgDelegate = MsgDelegate.fromAmino(object.msg_delegate);
    }
    if (object.msg_undelegate !== undefined && object.msg_undelegate !== null) {
      message.msgUndelegate = MsgUndelegate.fromAmino(object.msg_undelegate);
    }
    if (object.msg_begin_redelegate !== undefined && object.msg_begin_redelegate !== null) {
      message.msgBeginRedelegate = MsgBeginRedelegate.fromAmino(object.msg_begin_redelegate);
    }
    return message;
  },
  toAmino(message: QueuedMessage): QueuedMessageAmino {
    const obj: any = {};
    obj.tx_id = message.txId ? base64FromBytes(message.txId) : undefined;
    obj.msg_id = message.msgId ? base64FromBytes(message.msgId) : undefined;
    obj.block_height = message.blockHeight !== BigInt(0) ? message.blockHeight?.toString() : undefined;
    obj.block_time = message.blockTime ? Timestamp.toAmino(toTimestamp(message.blockTime)) : undefined;
    obj.msg_create_validator = message.msgCreateValidator
      ? MsgCreateValidator.toAmino(message.msgCreateValidator)
      : undefined;
    obj.msg_delegate = message.msgDelegate ? MsgDelegate.toAmino(message.msgDelegate) : undefined;
    obj.msg_undelegate = message.msgUndelegate ? MsgUndelegate.toAmino(message.msgUndelegate) : undefined;
    obj.msg_begin_redelegate = message.msgBeginRedelegate
      ? MsgBeginRedelegate.toAmino(message.msgBeginRedelegate)
      : undefined;
    return obj;
  },
  fromAminoMsg(object: QueuedMessageAminoMsg): QueuedMessage {
    return QueuedMessage.fromAmino(object.value);
  },
  fromProtoMsg(message: QueuedMessageProtoMsg): QueuedMessage {
    return QueuedMessage.decode(message.value);
  },
  toProto(message: QueuedMessage): Uint8Array {
    return QueuedMessage.encode(message).finish();
  },
  toProtoMsg(message: QueuedMessage): QueuedMessageProtoMsg {
    return {
      typeUrl: '/babylon.epoching.v1.QueuedMessage',
      value: QueuedMessage.encode(message).finish(),
    };
  },
};
function createBaseValStateUpdate(): ValStateUpdate {
  return {
    state: 0,
    blockHeight: BigInt(0),
    blockTime: undefined,
  };
}
export const ValStateUpdate = {
  typeUrl: '/babylon.epoching.v1.ValStateUpdate',
  encode(message: ValStateUpdate, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
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
  decode(input: BinaryReader | Uint8Array, length?: number): ValStateUpdate {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseValStateUpdate();
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
  fromPartial(object: Partial<ValStateUpdate>): ValStateUpdate {
    const message = createBaseValStateUpdate();
    message.state = object.state ?? 0;
    message.blockHeight =
      object.blockHeight !== undefined && object.blockHeight !== null
        ? BigInt(object.blockHeight.toString())
        : BigInt(0);
    message.blockTime = object.blockTime ?? undefined;
    return message;
  },
  fromAmino(object: ValStateUpdateAmino): ValStateUpdate {
    const message = createBaseValStateUpdate();
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
  toAmino(message: ValStateUpdate): ValStateUpdateAmino {
    const obj: any = {};
    obj.state = message.state === 0 ? undefined : message.state;
    obj.block_height = message.blockHeight !== BigInt(0) ? message.blockHeight?.toString() : undefined;
    obj.block_time = message.blockTime ? Timestamp.toAmino(toTimestamp(message.blockTime)) : undefined;
    return obj;
  },
  fromAminoMsg(object: ValStateUpdateAminoMsg): ValStateUpdate {
    return ValStateUpdate.fromAmino(object.value);
  },
  fromProtoMsg(message: ValStateUpdateProtoMsg): ValStateUpdate {
    return ValStateUpdate.decode(message.value);
  },
  toProto(message: ValStateUpdate): Uint8Array {
    return ValStateUpdate.encode(message).finish();
  },
  toProtoMsg(message: ValStateUpdate): ValStateUpdateProtoMsg {
    return {
      typeUrl: '/babylon.epoching.v1.ValStateUpdate',
      value: ValStateUpdate.encode(message).finish(),
    };
  },
};
function createBaseValidatorLifecycle(): ValidatorLifecycle {
  return {
    valAddr: '',
    valLife: [],
  };
}
export const ValidatorLifecycle = {
  typeUrl: '/babylon.epoching.v1.ValidatorLifecycle',
  encode(message: ValidatorLifecycle, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.valAddr !== '') {
      writer.uint32(10).string(message.valAddr);
    }
    for (const v of message.valLife) {
      ValStateUpdate.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): ValidatorLifecycle {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseValidatorLifecycle();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.valAddr = reader.string();
          break;
        case 2:
          message.valLife.push(ValStateUpdate.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<ValidatorLifecycle>): ValidatorLifecycle {
    const message = createBaseValidatorLifecycle();
    message.valAddr = object.valAddr ?? '';
    message.valLife = object.valLife?.map((e) => ValStateUpdate.fromPartial(e)) || [];
    return message;
  },
  fromAmino(object: ValidatorLifecycleAmino): ValidatorLifecycle {
    const message = createBaseValidatorLifecycle();
    if (object.val_addr !== undefined && object.val_addr !== null) {
      message.valAddr = object.val_addr;
    }
    message.valLife = object.val_life?.map((e) => ValStateUpdate.fromAmino(e)) || [];
    return message;
  },
  toAmino(message: ValidatorLifecycle): ValidatorLifecycleAmino {
    const obj: any = {};
    obj.val_addr = message.valAddr === '' ? undefined : message.valAddr;
    if (message.valLife) {
      obj.val_life = message.valLife.map((e) => (e ? ValStateUpdate.toAmino(e) : undefined));
    } else {
      obj.val_life = message.valLife;
    }
    return obj;
  },
  fromAminoMsg(object: ValidatorLifecycleAminoMsg): ValidatorLifecycle {
    return ValidatorLifecycle.fromAmino(object.value);
  },
  fromProtoMsg(message: ValidatorLifecycleProtoMsg): ValidatorLifecycle {
    return ValidatorLifecycle.decode(message.value);
  },
  toProto(message: ValidatorLifecycle): Uint8Array {
    return ValidatorLifecycle.encode(message).finish();
  },
  toProtoMsg(message: ValidatorLifecycle): ValidatorLifecycleProtoMsg {
    return {
      typeUrl: '/babylon.epoching.v1.ValidatorLifecycle',
      value: ValidatorLifecycle.encode(message).finish(),
    };
  },
};
function createBaseDelegationStateUpdate(): DelegationStateUpdate {
  return {
    state: 0,
    valAddr: '',
    amount: undefined,
    blockHeight: BigInt(0),
    blockTime: undefined,
  };
}
export const DelegationStateUpdate = {
  typeUrl: '/babylon.epoching.v1.DelegationStateUpdate',
  encode(message: DelegationStateUpdate, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.state !== 0) {
      writer.uint32(8).int32(message.state);
    }
    if (message.valAddr !== '') {
      writer.uint32(18).string(message.valAddr);
    }
    if (message.amount !== undefined) {
      Coin.encode(message.amount, writer.uint32(26).fork()).ldelim();
    }
    if (message.blockHeight !== BigInt(0)) {
      writer.uint32(32).uint64(message.blockHeight);
    }
    if (message.blockTime !== undefined) {
      Timestamp.encode(toTimestamp(message.blockTime), writer.uint32(42).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): DelegationStateUpdate {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDelegationStateUpdate();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.state = reader.int32() as any;
          break;
        case 2:
          message.valAddr = reader.string();
          break;
        case 3:
          message.amount = Coin.decode(reader, reader.uint32());
          break;
        case 4:
          message.blockHeight = reader.uint64();
          break;
        case 5:
          message.blockTime = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<DelegationStateUpdate>): DelegationStateUpdate {
    const message = createBaseDelegationStateUpdate();
    message.state = object.state ?? 0;
    message.valAddr = object.valAddr ?? '';
    message.amount =
      object.amount !== undefined && object.amount !== null ? Coin.fromPartial(object.amount) : undefined;
    message.blockHeight =
      object.blockHeight !== undefined && object.blockHeight !== null
        ? BigInt(object.blockHeight.toString())
        : BigInt(0);
    message.blockTime = object.blockTime ?? undefined;
    return message;
  },
  fromAmino(object: DelegationStateUpdateAmino): DelegationStateUpdate {
    const message = createBaseDelegationStateUpdate();
    if (object.state !== undefined && object.state !== null) {
      message.state = object.state;
    }
    if (object.val_addr !== undefined && object.val_addr !== null) {
      message.valAddr = object.val_addr;
    }
    if (object.amount !== undefined && object.amount !== null) {
      message.amount = Coin.fromAmino(object.amount);
    }
    if (object.block_height !== undefined && object.block_height !== null) {
      message.blockHeight = BigInt(object.block_height);
    }
    if (object.block_time !== undefined && object.block_time !== null) {
      message.blockTime = fromTimestamp(Timestamp.fromAmino(object.block_time));
    }
    return message;
  },
  toAmino(message: DelegationStateUpdate): DelegationStateUpdateAmino {
    const obj: any = {};
    obj.state = message.state === 0 ? undefined : message.state;
    obj.val_addr = message.valAddr === '' ? undefined : message.valAddr;
    obj.amount = message.amount ? Coin.toAmino(message.amount) : undefined;
    obj.block_height = message.blockHeight !== BigInt(0) ? message.blockHeight?.toString() : undefined;
    obj.block_time = message.blockTime ? Timestamp.toAmino(toTimestamp(message.blockTime)) : undefined;
    return obj;
  },
  fromAminoMsg(object: DelegationStateUpdateAminoMsg): DelegationStateUpdate {
    return DelegationStateUpdate.fromAmino(object.value);
  },
  fromProtoMsg(message: DelegationStateUpdateProtoMsg): DelegationStateUpdate {
    return DelegationStateUpdate.decode(message.value);
  },
  toProto(message: DelegationStateUpdate): Uint8Array {
    return DelegationStateUpdate.encode(message).finish();
  },
  toProtoMsg(message: DelegationStateUpdate): DelegationStateUpdateProtoMsg {
    return {
      typeUrl: '/babylon.epoching.v1.DelegationStateUpdate',
      value: DelegationStateUpdate.encode(message).finish(),
    };
  },
};
function createBaseDelegationLifecycle(): DelegationLifecycle {
  return {
    delAddr: '',
    delLife: [],
  };
}
export const DelegationLifecycle = {
  typeUrl: '/babylon.epoching.v1.DelegationLifecycle',
  encode(message: DelegationLifecycle, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.delAddr !== '') {
      writer.uint32(10).string(message.delAddr);
    }
    for (const v of message.delLife) {
      DelegationStateUpdate.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): DelegationLifecycle {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDelegationLifecycle();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.delAddr = reader.string();
          break;
        case 2:
          message.delLife.push(DelegationStateUpdate.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<DelegationLifecycle>): DelegationLifecycle {
    const message = createBaseDelegationLifecycle();
    message.delAddr = object.delAddr ?? '';
    message.delLife = object.delLife?.map((e) => DelegationStateUpdate.fromPartial(e)) || [];
    return message;
  },
  fromAmino(object: DelegationLifecycleAmino): DelegationLifecycle {
    const message = createBaseDelegationLifecycle();
    if (object.del_addr !== undefined && object.del_addr !== null) {
      message.delAddr = object.del_addr;
    }
    message.delLife = object.del_life?.map((e) => DelegationStateUpdate.fromAmino(e)) || [];
    return message;
  },
  toAmino(message: DelegationLifecycle): DelegationLifecycleAmino {
    const obj: any = {};
    obj.del_addr = message.delAddr === '' ? undefined : message.delAddr;
    if (message.delLife) {
      obj.del_life = message.delLife.map((e) => (e ? DelegationStateUpdate.toAmino(e) : undefined));
    } else {
      obj.del_life = message.delLife;
    }
    return obj;
  },
  fromAminoMsg(object: DelegationLifecycleAminoMsg): DelegationLifecycle {
    return DelegationLifecycle.fromAmino(object.value);
  },
  fromProtoMsg(message: DelegationLifecycleProtoMsg): DelegationLifecycle {
    return DelegationLifecycle.decode(message.value);
  },
  toProto(message: DelegationLifecycle): Uint8Array {
    return DelegationLifecycle.encode(message).finish();
  },
  toProtoMsg(message: DelegationLifecycle): DelegationLifecycleProtoMsg {
    return {
      typeUrl: '/babylon.epoching.v1.DelegationLifecycle',
      value: DelegationLifecycle.encode(message).finish(),
    };
  },
};
function createBaseValidator(): Validator {
  return {
    addr: new Uint8Array(),
    power: BigInt(0),
  };
}
export const Validator = {
  typeUrl: '/babylon.epoching.v1.Validator',
  encode(message: Validator, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.addr.length !== 0) {
      writer.uint32(10).bytes(message.addr);
    }
    if (message.power !== BigInt(0)) {
      writer.uint32(16).int64(message.power);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): Validator {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseValidator();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.addr = reader.bytes();
          break;
        case 2:
          message.power = reader.int64();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<Validator>): Validator {
    const message = createBaseValidator();
    message.addr = object.addr ?? new Uint8Array();
    message.power = object.power !== undefined && object.power !== null ? BigInt(object.power.toString()) : BigInt(0);
    return message;
  },
  fromAmino(object: ValidatorAmino): Validator {
    const message = createBaseValidator();
    if (object.addr !== undefined && object.addr !== null) {
      message.addr = bytesFromBase64(object.addr);
    }
    if (object.power !== undefined && object.power !== null) {
      message.power = BigInt(object.power);
    }
    return message;
  },
  toAmino(message: Validator): ValidatorAmino {
    const obj: any = {};
    obj.addr = message.addr ? base64FromBytes(message.addr) : undefined;
    obj.power = message.power !== BigInt(0) ? message.power?.toString() : undefined;
    return obj;
  },
  fromAminoMsg(object: ValidatorAminoMsg): Validator {
    return Validator.fromAmino(object.value);
  },
  fromProtoMsg(message: ValidatorProtoMsg): Validator {
    return Validator.decode(message.value);
  },
  toProto(message: Validator): Uint8Array {
    return Validator.encode(message).finish();
  },
  toProtoMsg(message: Validator): ValidatorProtoMsg {
    return {
      typeUrl: '/babylon.epoching.v1.Validator',
      value: Validator.encode(message).finish(),
    };
  },
};
