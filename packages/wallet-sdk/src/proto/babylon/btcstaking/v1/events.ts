import { BinaryReader, BinaryWriter } from '../../../binary';
import { base64FromBytes, bytesFromBase64 } from '../../../helpers';
import {
  BTCDelegationStatus,
  FinalityProvider,
  FinalityProviderAmino,
  FinalityProviderSDKType,
  SelectiveSlashingEvidence,
  SelectiveSlashingEvidenceAmino,
  SelectiveSlashingEvidenceSDKType,
} from './btcstaking';
/** EventNewFinalityProvider is the event emitted when a finality provider is created */
export interface EventNewFinalityProvider {
  fp?: FinalityProvider;
}
export interface EventNewFinalityProviderProtoMsg {
  typeUrl: '/babylon.btcstaking.v1.EventNewFinalityProvider';
  value: Uint8Array;
}
/** EventNewFinalityProvider is the event emitted when a finality provider is created */
export interface EventNewFinalityProviderAmino {
  fp?: FinalityProviderAmino;
}
export interface EventNewFinalityProviderAminoMsg {
  type: '/babylon.btcstaking.v1.EventNewFinalityProvider';
  value: EventNewFinalityProviderAmino;
}
/** EventNewFinalityProvider is the event emitted when a finality provider is created */
export interface EventNewFinalityProviderSDKType {
  fp?: FinalityProviderSDKType;
}
/**
 * EventBTCDelegationStateUpdate is the event emitted when a BTC delegation's state is
 * updated. There are the following possible state transitions:
 * - non-existing -> pending, which happens upon `MsgCreateBTCDelegation`
 * - pending -> active, which happens upon `MsgAddCovenantSigs`
 * - active -> unbonded, which happens upon `MsgBTCUndelegate` or upon staking tx timelock expires
 */
export interface EventBTCDelegationStateUpdate {
  /**
   * staking_tx_hash is the hash of the staking tx.
   * It uniquely identifies a BTC delegation
   */
  stakingTxHash: string;
  /** new_state is the new state of this BTC delegation */
  newState: BTCDelegationStatus;
}
export interface EventBTCDelegationStateUpdateProtoMsg {
  typeUrl: '/babylon.btcstaking.v1.EventBTCDelegationStateUpdate';
  value: Uint8Array;
}
/**
 * EventBTCDelegationStateUpdate is the event emitted when a BTC delegation's state is
 * updated. There are the following possible state transitions:
 * - non-existing -> pending, which happens upon `MsgCreateBTCDelegation`
 * - pending -> active, which happens upon `MsgAddCovenantSigs`
 * - active -> unbonded, which happens upon `MsgBTCUndelegate` or upon staking tx timelock expires
 */
export interface EventBTCDelegationStateUpdateAmino {
  /**
   * staking_tx_hash is the hash of the staking tx.
   * It uniquely identifies a BTC delegation
   */
  staking_tx_hash?: string;
  /** new_state is the new state of this BTC delegation */
  new_state?: BTCDelegationStatus;
}
export interface EventBTCDelegationStateUpdateAminoMsg {
  type: '/babylon.btcstaking.v1.EventBTCDelegationStateUpdate';
  value: EventBTCDelegationStateUpdateAmino;
}
/**
 * EventBTCDelegationStateUpdate is the event emitted when a BTC delegation's state is
 * updated. There are the following possible state transitions:
 * - non-existing -> pending, which happens upon `MsgCreateBTCDelegation`
 * - pending -> active, which happens upon `MsgAddCovenantSigs`
 * - active -> unbonded, which happens upon `MsgBTCUndelegate` or upon staking tx timelock expires
 */
export interface EventBTCDelegationStateUpdateSDKType {
  staking_tx_hash: string;
  new_state: BTCDelegationStatus;
}
/**
 * EventSelectiveSlashing is the event emitted when an adversarial
 * finality provider selectively slashes a BTC delegation. This will
 * result in slashing of all BTC delegations under this finality provider.
 */
export interface EventSelectiveSlashing {
  /** evidence is the evidence of selective slashing */
  evidence?: SelectiveSlashingEvidence;
}
export interface EventSelectiveSlashingProtoMsg {
  typeUrl: '/babylon.btcstaking.v1.EventSelectiveSlashing';
  value: Uint8Array;
}
/**
 * EventSelectiveSlashing is the event emitted when an adversarial
 * finality provider selectively slashes a BTC delegation. This will
 * result in slashing of all BTC delegations under this finality provider.
 */
export interface EventSelectiveSlashingAmino {
  /** evidence is the evidence of selective slashing */
  evidence?: SelectiveSlashingEvidenceAmino;
}
export interface EventSelectiveSlashingAminoMsg {
  type: '/babylon.btcstaking.v1.EventSelectiveSlashing';
  value: EventSelectiveSlashingAmino;
}
/**
 * EventSelectiveSlashing is the event emitted when an adversarial
 * finality provider selectively slashes a BTC delegation. This will
 * result in slashing of all BTC delegations under this finality provider.
 */
export interface EventSelectiveSlashingSDKType {
  evidence?: SelectiveSlashingEvidenceSDKType;
}
/**
 * EventPowerDistUpdate is an event that affects voting power distirbution
 * of BTC staking protocol
 */
export interface EventPowerDistUpdate {
  /** slashed_fp means a finality provider is slashed */
  slashedFp?: EventPowerDistUpdate_EventSlashedFinalityProvider;
  /** btc_del_state_update means a BTC delegation's state is updated */
  btcDelStateUpdate?: EventBTCDelegationStateUpdate;
}
export interface EventPowerDistUpdateProtoMsg {
  typeUrl: '/babylon.btcstaking.v1.EventPowerDistUpdate';
  value: Uint8Array;
}
/**
 * EventPowerDistUpdate is an event that affects voting power distirbution
 * of BTC staking protocol
 */
export interface EventPowerDistUpdateAmino {
  /** slashed_fp means a finality provider is slashed */
  slashed_fp?: EventPowerDistUpdate_EventSlashedFinalityProviderAmino;
  /** btc_del_state_update means a BTC delegation's state is updated */
  btc_del_state_update?: EventBTCDelegationStateUpdateAmino;
}
export interface EventPowerDistUpdateAminoMsg {
  type: '/babylon.btcstaking.v1.EventPowerDistUpdate';
  value: EventPowerDistUpdateAmino;
}
/**
 * EventPowerDistUpdate is an event that affects voting power distirbution
 * of BTC staking protocol
 */
export interface EventPowerDistUpdateSDKType {
  slashed_fp?: EventPowerDistUpdate_EventSlashedFinalityProviderSDKType;
  btc_del_state_update?: EventBTCDelegationStateUpdateSDKType;
}
/**
 * EventSlashedFinalityProvider defines an event that a finality provider
 * is slashed
 * TODO: unify with existing slashing events
 */
export interface EventPowerDistUpdate_EventSlashedFinalityProvider {
  pk: Uint8Array;
}
export interface EventPowerDistUpdate_EventSlashedFinalityProviderProtoMsg {
  typeUrl: '/babylon.btcstaking.v1.EventSlashedFinalityProvider';
  value: Uint8Array;
}
/**
 * EventSlashedFinalityProvider defines an event that a finality provider
 * is slashed
 * TODO: unify with existing slashing events
 */
export interface EventPowerDistUpdate_EventSlashedFinalityProviderAmino {
  pk?: string;
}
export interface EventPowerDistUpdate_EventSlashedFinalityProviderAminoMsg {
  type: '/babylon.btcstaking.v1.EventSlashedFinalityProvider';
  value: EventPowerDistUpdate_EventSlashedFinalityProviderAmino;
}
/**
 * EventSlashedFinalityProvider defines an event that a finality provider
 * is slashed
 * TODO: unify with existing slashing events
 */
export interface EventPowerDistUpdate_EventSlashedFinalityProviderSDKType {
  pk: Uint8Array;
}
function createBaseEventNewFinalityProvider(): EventNewFinalityProvider {
  return {
    fp: undefined,
  };
}
export const EventNewFinalityProvider = {
  typeUrl: '/babylon.btcstaking.v1.EventNewFinalityProvider',
  encode(message: EventNewFinalityProvider, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.fp !== undefined) {
      FinalityProvider.encode(message.fp, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): EventNewFinalityProvider {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEventNewFinalityProvider();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.fp = FinalityProvider.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<EventNewFinalityProvider>): EventNewFinalityProvider {
    const message = createBaseEventNewFinalityProvider();
    message.fp = object.fp !== undefined && object.fp !== null ? FinalityProvider.fromPartial(object.fp) : undefined;
    return message;
  },
  fromAmino(object: EventNewFinalityProviderAmino): EventNewFinalityProvider {
    const message = createBaseEventNewFinalityProvider();
    if (object.fp !== undefined && object.fp !== null) {
      message.fp = FinalityProvider.fromAmino(object.fp);
    }
    return message;
  },
  toAmino(message: EventNewFinalityProvider): EventNewFinalityProviderAmino {
    const obj: any = {};
    obj.fp = message.fp ? FinalityProvider.toAmino(message.fp) : undefined;
    return obj;
  },
  fromAminoMsg(object: EventNewFinalityProviderAminoMsg): EventNewFinalityProvider {
    return EventNewFinalityProvider.fromAmino(object.value);
  },
  fromProtoMsg(message: EventNewFinalityProviderProtoMsg): EventNewFinalityProvider {
    return EventNewFinalityProvider.decode(message.value);
  },
  toProto(message: EventNewFinalityProvider): Uint8Array {
    return EventNewFinalityProvider.encode(message).finish();
  },
  toProtoMsg(message: EventNewFinalityProvider): EventNewFinalityProviderProtoMsg {
    return {
      typeUrl: '/babylon.btcstaking.v1.EventNewFinalityProvider',
      value: EventNewFinalityProvider.encode(message).finish(),
    };
  },
};
function createBaseEventBTCDelegationStateUpdate(): EventBTCDelegationStateUpdate {
  return {
    stakingTxHash: '',
    newState: 0,
  };
}
export const EventBTCDelegationStateUpdate = {
  typeUrl: '/babylon.btcstaking.v1.EventBTCDelegationStateUpdate',
  encode(message: EventBTCDelegationStateUpdate, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.stakingTxHash !== '') {
      writer.uint32(10).string(message.stakingTxHash);
    }
    if (message.newState !== 0) {
      writer.uint32(16).int32(message.newState);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): EventBTCDelegationStateUpdate {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEventBTCDelegationStateUpdate();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.stakingTxHash = reader.string();
          break;
        case 2:
          message.newState = reader.int32() as any;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<EventBTCDelegationStateUpdate>): EventBTCDelegationStateUpdate {
    const message = createBaseEventBTCDelegationStateUpdate();
    message.stakingTxHash = object.stakingTxHash ?? '';
    message.newState = object.newState ?? 0;
    return message;
  },
  fromAmino(object: EventBTCDelegationStateUpdateAmino): EventBTCDelegationStateUpdate {
    const message = createBaseEventBTCDelegationStateUpdate();
    if (object.staking_tx_hash !== undefined && object.staking_tx_hash !== null) {
      message.stakingTxHash = object.staking_tx_hash;
    }
    if (object.new_state !== undefined && object.new_state !== null) {
      message.newState = object.new_state;
    }
    return message;
  },
  toAmino(message: EventBTCDelegationStateUpdate): EventBTCDelegationStateUpdateAmino {
    const obj: any = {};
    obj.staking_tx_hash = message.stakingTxHash === '' ? undefined : message.stakingTxHash;
    obj.new_state = message.newState === 0 ? undefined : message.newState;
    return obj;
  },
  fromAminoMsg(object: EventBTCDelegationStateUpdateAminoMsg): EventBTCDelegationStateUpdate {
    return EventBTCDelegationStateUpdate.fromAmino(object.value);
  },
  fromProtoMsg(message: EventBTCDelegationStateUpdateProtoMsg): EventBTCDelegationStateUpdate {
    return EventBTCDelegationStateUpdate.decode(message.value);
  },
  toProto(message: EventBTCDelegationStateUpdate): Uint8Array {
    return EventBTCDelegationStateUpdate.encode(message).finish();
  },
  toProtoMsg(message: EventBTCDelegationStateUpdate): EventBTCDelegationStateUpdateProtoMsg {
    return {
      typeUrl: '/babylon.btcstaking.v1.EventBTCDelegationStateUpdate',
      value: EventBTCDelegationStateUpdate.encode(message).finish(),
    };
  },
};
function createBaseEventSelectiveSlashing(): EventSelectiveSlashing {
  return {
    evidence: undefined,
  };
}
export const EventSelectiveSlashing = {
  typeUrl: '/babylon.btcstaking.v1.EventSelectiveSlashing',
  encode(message: EventSelectiveSlashing, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.evidence !== undefined) {
      SelectiveSlashingEvidence.encode(message.evidence, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): EventSelectiveSlashing {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEventSelectiveSlashing();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.evidence = SelectiveSlashingEvidence.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<EventSelectiveSlashing>): EventSelectiveSlashing {
    const message = createBaseEventSelectiveSlashing();
    message.evidence =
      object.evidence !== undefined && object.evidence !== null
        ? SelectiveSlashingEvidence.fromPartial(object.evidence)
        : undefined;
    return message;
  },
  fromAmino(object: EventSelectiveSlashingAmino): EventSelectiveSlashing {
    const message = createBaseEventSelectiveSlashing();
    if (object.evidence !== undefined && object.evidence !== null) {
      message.evidence = SelectiveSlashingEvidence.fromAmino(object.evidence);
    }
    return message;
  },
  toAmino(message: EventSelectiveSlashing): EventSelectiveSlashingAmino {
    const obj: any = {};
    obj.evidence = message.evidence ? SelectiveSlashingEvidence.toAmino(message.evidence) : undefined;
    return obj;
  },
  fromAminoMsg(object: EventSelectiveSlashingAminoMsg): EventSelectiveSlashing {
    return EventSelectiveSlashing.fromAmino(object.value);
  },
  fromProtoMsg(message: EventSelectiveSlashingProtoMsg): EventSelectiveSlashing {
    return EventSelectiveSlashing.decode(message.value);
  },
  toProto(message: EventSelectiveSlashing): Uint8Array {
    return EventSelectiveSlashing.encode(message).finish();
  },
  toProtoMsg(message: EventSelectiveSlashing): EventSelectiveSlashingProtoMsg {
    return {
      typeUrl: '/babylon.btcstaking.v1.EventSelectiveSlashing',
      value: EventSelectiveSlashing.encode(message).finish(),
    };
  },
};
function createBaseEventPowerDistUpdate(): EventPowerDistUpdate {
  return {
    slashedFp: undefined,
    btcDelStateUpdate: undefined,
  };
}
export const EventPowerDistUpdate = {
  typeUrl: '/babylon.btcstaking.v1.EventPowerDistUpdate',
  encode(message: EventPowerDistUpdate, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.slashedFp !== undefined) {
      EventPowerDistUpdate_EventSlashedFinalityProvider.encode(message.slashedFp, writer.uint32(10).fork()).ldelim();
    }
    if (message.btcDelStateUpdate !== undefined) {
      EventBTCDelegationStateUpdate.encode(message.btcDelStateUpdate, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): EventPowerDistUpdate {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEventPowerDistUpdate();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.slashedFp = EventPowerDistUpdate_EventSlashedFinalityProvider.decode(reader, reader.uint32());
          break;
        case 2:
          message.btcDelStateUpdate = EventBTCDelegationStateUpdate.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<EventPowerDistUpdate>): EventPowerDistUpdate {
    const message = createBaseEventPowerDistUpdate();
    message.slashedFp =
      object.slashedFp !== undefined && object.slashedFp !== null
        ? EventPowerDistUpdate_EventSlashedFinalityProvider.fromPartial(object.slashedFp)
        : undefined;
    message.btcDelStateUpdate =
      object.btcDelStateUpdate !== undefined && object.btcDelStateUpdate !== null
        ? EventBTCDelegationStateUpdate.fromPartial(object.btcDelStateUpdate)
        : undefined;
    return message;
  },
  fromAmino(object: EventPowerDistUpdateAmino): EventPowerDistUpdate {
    const message = createBaseEventPowerDistUpdate();
    if (object.slashed_fp !== undefined && object.slashed_fp !== null) {
      message.slashedFp = EventPowerDistUpdate_EventSlashedFinalityProvider.fromAmino(object.slashed_fp);
    }
    if (object.btc_del_state_update !== undefined && object.btc_del_state_update !== null) {
      message.btcDelStateUpdate = EventBTCDelegationStateUpdate.fromAmino(object.btc_del_state_update);
    }
    return message;
  },
  toAmino(message: EventPowerDistUpdate): EventPowerDistUpdateAmino {
    const obj: any = {};
    obj.slashed_fp = message.slashedFp
      ? EventPowerDistUpdate_EventSlashedFinalityProvider.toAmino(message.slashedFp)
      : undefined;
    obj.btc_del_state_update = message.btcDelStateUpdate
      ? EventBTCDelegationStateUpdate.toAmino(message.btcDelStateUpdate)
      : undefined;
    return obj;
  },
  fromAminoMsg(object: EventPowerDistUpdateAminoMsg): EventPowerDistUpdate {
    return EventPowerDistUpdate.fromAmino(object.value);
  },
  fromProtoMsg(message: EventPowerDistUpdateProtoMsg): EventPowerDistUpdate {
    return EventPowerDistUpdate.decode(message.value);
  },
  toProto(message: EventPowerDistUpdate): Uint8Array {
    return EventPowerDistUpdate.encode(message).finish();
  },
  toProtoMsg(message: EventPowerDistUpdate): EventPowerDistUpdateProtoMsg {
    return {
      typeUrl: '/babylon.btcstaking.v1.EventPowerDistUpdate',
      value: EventPowerDistUpdate.encode(message).finish(),
    };
  },
};
function createBaseEventPowerDistUpdate_EventSlashedFinalityProvider(): EventPowerDistUpdate_EventSlashedFinalityProvider {
  return {
    pk: new Uint8Array(),
  };
}
export const EventPowerDistUpdate_EventSlashedFinalityProvider = {
  typeUrl: '/babylon.btcstaking.v1.EventSlashedFinalityProvider',
  encode(
    message: EventPowerDistUpdate_EventSlashedFinalityProvider,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.pk.length !== 0) {
      writer.uint32(10).bytes(message.pk);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): EventPowerDistUpdate_EventSlashedFinalityProvider {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEventPowerDistUpdate_EventSlashedFinalityProvider();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.pk = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<EventPowerDistUpdate_EventSlashedFinalityProvider>,
  ): EventPowerDistUpdate_EventSlashedFinalityProvider {
    const message = createBaseEventPowerDistUpdate_EventSlashedFinalityProvider();
    message.pk = object.pk ?? new Uint8Array();
    return message;
  },
  fromAmino(
    object: EventPowerDistUpdate_EventSlashedFinalityProviderAmino,
  ): EventPowerDistUpdate_EventSlashedFinalityProvider {
    const message = createBaseEventPowerDistUpdate_EventSlashedFinalityProvider();
    if (object.pk !== undefined && object.pk !== null) {
      message.pk = bytesFromBase64(object.pk);
    }
    return message;
  },
  toAmino(
    message: EventPowerDistUpdate_EventSlashedFinalityProvider,
  ): EventPowerDistUpdate_EventSlashedFinalityProviderAmino {
    const obj: any = {};
    obj.pk = message.pk ? base64FromBytes(message.pk) : undefined;
    return obj;
  },
  fromAminoMsg(
    object: EventPowerDistUpdate_EventSlashedFinalityProviderAminoMsg,
  ): EventPowerDistUpdate_EventSlashedFinalityProvider {
    return EventPowerDistUpdate_EventSlashedFinalityProvider.fromAmino(object.value);
  },
  fromProtoMsg(
    message: EventPowerDistUpdate_EventSlashedFinalityProviderProtoMsg,
  ): EventPowerDistUpdate_EventSlashedFinalityProvider {
    return EventPowerDistUpdate_EventSlashedFinalityProvider.decode(message.value);
  },
  toProto(message: EventPowerDistUpdate_EventSlashedFinalityProvider): Uint8Array {
    return EventPowerDistUpdate_EventSlashedFinalityProvider.encode(message).finish();
  },
  toProtoMsg(
    message: EventPowerDistUpdate_EventSlashedFinalityProvider,
  ): EventPowerDistUpdate_EventSlashedFinalityProviderProtoMsg {
    return {
      typeUrl: '/babylon.btcstaking.v1.EventSlashedFinalityProvider',
      value: EventPowerDistUpdate_EventSlashedFinalityProvider.encode(message).finish(),
    };
  },
};
