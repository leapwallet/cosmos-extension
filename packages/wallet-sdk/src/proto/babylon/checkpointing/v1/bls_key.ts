import { BinaryReader, BinaryWriter } from '../../../binary';
import { base64FromBytes, bytesFromBase64 } from '../../../helpers';
/** BlsKey wraps BLS public key with PoP */
export interface BlsKey {
  /** pubkey is the BLS public key of a validator */
  pubkey: Uint8Array;
  /** pop is the proof-of-possession of the BLS key */
  pop?: ProofOfPossession;
}
export interface BlsKeyProtoMsg {
  typeUrl: '/babylon.checkpointing.v1.BlsKey';
  value: Uint8Array;
}
/** BlsKey wraps BLS public key with PoP */
export interface BlsKeyAmino {
  /** pubkey is the BLS public key of a validator */
  pubkey?: string;
  /** pop is the proof-of-possession of the BLS key */
  pop?: ProofOfPossessionAmino;
}
export interface BlsKeyAminoMsg {
  type: '/babylon.checkpointing.v1.BlsKey';
  value: BlsKeyAmino;
}
/** BlsKey wraps BLS public key with PoP */
export interface BlsKeySDKType {
  pubkey: Uint8Array;
  pop?: ProofOfPossessionSDKType;
}
/**
 * ProofOfPossession defines proof for the ownership of Ed25519 and BLS private
 * keys
 */
export interface ProofOfPossession {
  /**
   * ed25519_sig is used for verification, ed25519_sig = sign(key = Ed25519_sk,
   * data = BLS_pk)
   */
  ed25519Sig: Uint8Array;
  /**
   * bls_sig is the result of PoP, bls_sig = sign(key = BLS_sk, data =
   * ed25519_sig)
   */
  blsSig: Uint8Array;
}
export interface ProofOfPossessionProtoMsg {
  typeUrl: '/babylon.checkpointing.v1.ProofOfPossession';
  value: Uint8Array;
}
/**
 * ProofOfPossession defines proof for the ownership of Ed25519 and BLS private
 * keys
 */
export interface ProofOfPossessionAmino {
  /**
   * ed25519_sig is used for verification, ed25519_sig = sign(key = Ed25519_sk,
   * data = BLS_pk)
   */
  ed25519_sig?: string;
  /**
   * bls_sig is the result of PoP, bls_sig = sign(key = BLS_sk, data =
   * ed25519_sig)
   */
  bls_sig?: string;
}
export interface ProofOfPossessionAminoMsg {
  type: '/babylon.checkpointing.v1.ProofOfPossession';
  value: ProofOfPossessionAmino;
}
/**
 * ProofOfPossession defines proof for the ownership of Ed25519 and BLS private
 * keys
 */
export interface ProofOfPossessionSDKType {
  ed25519_sig: Uint8Array;
  bls_sig: Uint8Array;
}
/** ValidatorWithBLSSet defines a set of validators with their BLS public keys */
export interface ValidatorWithBlsKeySet {
  valSet: ValidatorWithBlsKey[];
}
export interface ValidatorWithBlsKeySetProtoMsg {
  typeUrl: '/babylon.checkpointing.v1.ValidatorWithBlsKeySet';
  value: Uint8Array;
}
/** ValidatorWithBLSSet defines a set of validators with their BLS public keys */
export interface ValidatorWithBlsKeySetAmino {
  val_set?: ValidatorWithBlsKeyAmino[];
}
export interface ValidatorWithBlsKeySetAminoMsg {
  type: '/babylon.checkpointing.v1.ValidatorWithBlsKeySet';
  value: ValidatorWithBlsKeySetAmino;
}
/** ValidatorWithBLSSet defines a set of validators with their BLS public keys */
export interface ValidatorWithBlsKeySetSDKType {
  val_set: ValidatorWithBlsKeySDKType[];
}
/**
 * ValidatorWithBlsKey couples validator address, voting power, and its bls
 * public key
 */
export interface ValidatorWithBlsKey {
  /** validator_address is the address of the validator */
  validatorAddress: string;
  /** bls_pub_key is the BLS public key of the validator */
  blsPubKey: Uint8Array;
  /** voting_power is the voting power of the validator at the given epoch */
  votingPower: bigint;
}
export interface ValidatorWithBlsKeyProtoMsg {
  typeUrl: '/babylon.checkpointing.v1.ValidatorWithBlsKey';
  value: Uint8Array;
}
/**
 * ValidatorWithBlsKey couples validator address, voting power, and its bls
 * public key
 */
export interface ValidatorWithBlsKeyAmino {
  /** validator_address is the address of the validator */
  validator_address?: string;
  /** bls_pub_key is the BLS public key of the validator */
  bls_pub_key?: string;
  /** voting_power is the voting power of the validator at the given epoch */
  voting_power?: string;
}
export interface ValidatorWithBlsKeyAminoMsg {
  type: '/babylon.checkpointing.v1.ValidatorWithBlsKey';
  value: ValidatorWithBlsKeyAmino;
}
/**
 * ValidatorWithBlsKey couples validator address, voting power, and its bls
 * public key
 */
export interface ValidatorWithBlsKeySDKType {
  validator_address: string;
  bls_pub_key: Uint8Array;
  voting_power: bigint;
}
/** VoteExtension defines the structure used to create a BLS vote extension. */
export interface VoteExtension {
  /** signer is the address of the vote extension signer */
  signer: string;
  /** validator_address is the address of the validator */
  validatorAddress: string;
  /** block_hash is the hash of the block that the vote extension is signed over */
  blockHash: Uint8Array;
  /** epoch_num is the epoch number of the vote extension */
  epochNum: bigint;
  /** height is the height of the vote extension */
  height: bigint;
  /** bls_sig is the BLS signature */
  blsSig: Uint8Array;
}
export interface VoteExtensionProtoMsg {
  typeUrl: '/babylon.checkpointing.v1.VoteExtension';
  value: Uint8Array;
}
/** VoteExtension defines the structure used to create a BLS vote extension. */
export interface VoteExtensionAmino {
  /** signer is the address of the vote extension signer */
  signer?: string;
  /** validator_address is the address of the validator */
  validator_address?: string;
  /** block_hash is the hash of the block that the vote extension is signed over */
  block_hash?: string;
  /** epoch_num is the epoch number of the vote extension */
  epoch_num?: string;
  /** height is the height of the vote extension */
  height?: string;
  /** bls_sig is the BLS signature */
  bls_sig?: string;
}
export interface VoteExtensionAminoMsg {
  type: '/babylon.checkpointing.v1.VoteExtension';
  value: VoteExtensionAmino;
}
/** VoteExtension defines the structure used to create a BLS vote extension. */
export interface VoteExtensionSDKType {
  signer: string;
  validator_address: string;
  block_hash: Uint8Array;
  epoch_num: bigint;
  height: bigint;
  bls_sig: Uint8Array;
}
function createBaseBlsKey(): BlsKey {
  return {
    pubkey: new Uint8Array(),
    pop: undefined,
  };
}
export const BlsKey = {
  typeUrl: '/babylon.checkpointing.v1.BlsKey',
  encode(message: BlsKey, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.pubkey.length !== 0) {
      writer.uint32(10).bytes(message.pubkey);
    }
    if (message.pop !== undefined) {
      ProofOfPossession.encode(message.pop, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): BlsKey {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBlsKey();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.pubkey = reader.bytes();
          break;
        case 2:
          message.pop = ProofOfPossession.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<BlsKey>): BlsKey {
    const message = createBaseBlsKey();
    message.pubkey = object.pubkey ?? new Uint8Array();
    message.pop =
      object.pop !== undefined && object.pop !== null ? ProofOfPossession.fromPartial(object.pop) : undefined;
    return message;
  },
  fromAmino(object: BlsKeyAmino): BlsKey {
    const message = createBaseBlsKey();
    if (object.pubkey !== undefined && object.pubkey !== null) {
      message.pubkey = bytesFromBase64(object.pubkey);
    }
    if (object.pop !== undefined && object.pop !== null) {
      message.pop = ProofOfPossession.fromAmino(object.pop);
    }
    return message;
  },
  toAmino(message: BlsKey): BlsKeyAmino {
    const obj: any = {};
    obj.pubkey = message.pubkey ? base64FromBytes(message.pubkey) : undefined;
    obj.pop = message.pop ? ProofOfPossession.toAmino(message.pop) : undefined;
    return obj;
  },
  fromAminoMsg(object: BlsKeyAminoMsg): BlsKey {
    return BlsKey.fromAmino(object.value);
  },
  fromProtoMsg(message: BlsKeyProtoMsg): BlsKey {
    return BlsKey.decode(message.value);
  },
  toProto(message: BlsKey): Uint8Array {
    return BlsKey.encode(message).finish();
  },
  toProtoMsg(message: BlsKey): BlsKeyProtoMsg {
    return {
      typeUrl: '/babylon.checkpointing.v1.BlsKey',
      value: BlsKey.encode(message).finish(),
    };
  },
};
function createBaseProofOfPossession(): ProofOfPossession {
  return {
    ed25519Sig: new Uint8Array(),
    blsSig: new Uint8Array(),
  };
}
export const ProofOfPossession = {
  typeUrl: '/babylon.checkpointing.v1.ProofOfPossession',
  encode(message: ProofOfPossession, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.ed25519Sig.length !== 0) {
      writer.uint32(10).bytes(message.ed25519Sig);
    }
    if (message.blsSig.length !== 0) {
      writer.uint32(18).bytes(message.blsSig);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): ProofOfPossession {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseProofOfPossession();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.ed25519Sig = reader.bytes();
          break;
        case 2:
          message.blsSig = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<ProofOfPossession>): ProofOfPossession {
    const message = createBaseProofOfPossession();
    message.ed25519Sig = object.ed25519Sig ?? new Uint8Array();
    message.blsSig = object.blsSig ?? new Uint8Array();
    return message;
  },
  fromAmino(object: ProofOfPossessionAmino): ProofOfPossession {
    const message = createBaseProofOfPossession();
    if (object.ed25519_sig !== undefined && object.ed25519_sig !== null) {
      message.ed25519Sig = bytesFromBase64(object.ed25519_sig);
    }
    if (object.bls_sig !== undefined && object.bls_sig !== null) {
      message.blsSig = bytesFromBase64(object.bls_sig);
    }
    return message;
  },
  toAmino(message: ProofOfPossession): ProofOfPossessionAmino {
    const obj: any = {};
    obj.ed25519_sig = message.ed25519Sig ? base64FromBytes(message.ed25519Sig) : undefined;
    obj.bls_sig = message.blsSig ? base64FromBytes(message.blsSig) : undefined;
    return obj;
  },
  fromAminoMsg(object: ProofOfPossessionAminoMsg): ProofOfPossession {
    return ProofOfPossession.fromAmino(object.value);
  },
  fromProtoMsg(message: ProofOfPossessionProtoMsg): ProofOfPossession {
    return ProofOfPossession.decode(message.value);
  },
  toProto(message: ProofOfPossession): Uint8Array {
    return ProofOfPossession.encode(message).finish();
  },
  toProtoMsg(message: ProofOfPossession): ProofOfPossessionProtoMsg {
    return {
      typeUrl: '/babylon.checkpointing.v1.ProofOfPossession',
      value: ProofOfPossession.encode(message).finish(),
    };
  },
};
function createBaseValidatorWithBlsKeySet(): ValidatorWithBlsKeySet {
  return {
    valSet: [],
  };
}
export const ValidatorWithBlsKeySet = {
  typeUrl: '/babylon.checkpointing.v1.ValidatorWithBlsKeySet',
  encode(message: ValidatorWithBlsKeySet, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    for (const v of message.valSet) {
      ValidatorWithBlsKey.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): ValidatorWithBlsKeySet {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseValidatorWithBlsKeySet();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.valSet.push(ValidatorWithBlsKey.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<ValidatorWithBlsKeySet>): ValidatorWithBlsKeySet {
    const message = createBaseValidatorWithBlsKeySet();
    message.valSet = object.valSet?.map((e) => ValidatorWithBlsKey.fromPartial(e)) || [];
    return message;
  },
  fromAmino(object: ValidatorWithBlsKeySetAmino): ValidatorWithBlsKeySet {
    const message = createBaseValidatorWithBlsKeySet();
    message.valSet = object.val_set?.map((e) => ValidatorWithBlsKey.fromAmino(e)) || [];
    return message;
  },
  toAmino(message: ValidatorWithBlsKeySet): ValidatorWithBlsKeySetAmino {
    const obj: any = {};
    if (message.valSet) {
      obj.val_set = message.valSet.map((e) => (e ? ValidatorWithBlsKey.toAmino(e) : undefined));
    } else {
      obj.val_set = message.valSet;
    }
    return obj;
  },
  fromAminoMsg(object: ValidatorWithBlsKeySetAminoMsg): ValidatorWithBlsKeySet {
    return ValidatorWithBlsKeySet.fromAmino(object.value);
  },
  fromProtoMsg(message: ValidatorWithBlsKeySetProtoMsg): ValidatorWithBlsKeySet {
    return ValidatorWithBlsKeySet.decode(message.value);
  },
  toProto(message: ValidatorWithBlsKeySet): Uint8Array {
    return ValidatorWithBlsKeySet.encode(message).finish();
  },
  toProtoMsg(message: ValidatorWithBlsKeySet): ValidatorWithBlsKeySetProtoMsg {
    return {
      typeUrl: '/babylon.checkpointing.v1.ValidatorWithBlsKeySet',
      value: ValidatorWithBlsKeySet.encode(message).finish(),
    };
  },
};
function createBaseValidatorWithBlsKey(): ValidatorWithBlsKey {
  return {
    validatorAddress: '',
    blsPubKey: new Uint8Array(),
    votingPower: BigInt(0),
  };
}
export const ValidatorWithBlsKey = {
  typeUrl: '/babylon.checkpointing.v1.ValidatorWithBlsKey',
  encode(message: ValidatorWithBlsKey, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.validatorAddress !== '') {
      writer.uint32(10).string(message.validatorAddress);
    }
    if (message.blsPubKey.length !== 0) {
      writer.uint32(18).bytes(message.blsPubKey);
    }
    if (message.votingPower !== BigInt(0)) {
      writer.uint32(24).uint64(message.votingPower);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): ValidatorWithBlsKey {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseValidatorWithBlsKey();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.validatorAddress = reader.string();
          break;
        case 2:
          message.blsPubKey = reader.bytes();
          break;
        case 3:
          message.votingPower = reader.uint64();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<ValidatorWithBlsKey>): ValidatorWithBlsKey {
    const message = createBaseValidatorWithBlsKey();
    message.validatorAddress = object.validatorAddress ?? '';
    message.blsPubKey = object.blsPubKey ?? new Uint8Array();
    message.votingPower =
      object.votingPower !== undefined && object.votingPower !== null
        ? BigInt(object.votingPower.toString())
        : BigInt(0);
    return message;
  },
  fromAmino(object: ValidatorWithBlsKeyAmino): ValidatorWithBlsKey {
    const message = createBaseValidatorWithBlsKey();
    if (object.validator_address !== undefined && object.validator_address !== null) {
      message.validatorAddress = object.validator_address;
    }
    if (object.bls_pub_key !== undefined && object.bls_pub_key !== null) {
      message.blsPubKey = bytesFromBase64(object.bls_pub_key);
    }
    if (object.voting_power !== undefined && object.voting_power !== null) {
      message.votingPower = BigInt(object.voting_power);
    }
    return message;
  },
  toAmino(message: ValidatorWithBlsKey): ValidatorWithBlsKeyAmino {
    const obj: any = {};
    obj.validator_address = message.validatorAddress === '' ? undefined : message.validatorAddress;
    obj.bls_pub_key = message.blsPubKey ? base64FromBytes(message.blsPubKey) : undefined;
    obj.voting_power = message.votingPower !== BigInt(0) ? message.votingPower?.toString() : undefined;
    return obj;
  },
  fromAminoMsg(object: ValidatorWithBlsKeyAminoMsg): ValidatorWithBlsKey {
    return ValidatorWithBlsKey.fromAmino(object.value);
  },
  fromProtoMsg(message: ValidatorWithBlsKeyProtoMsg): ValidatorWithBlsKey {
    return ValidatorWithBlsKey.decode(message.value);
  },
  toProto(message: ValidatorWithBlsKey): Uint8Array {
    return ValidatorWithBlsKey.encode(message).finish();
  },
  toProtoMsg(message: ValidatorWithBlsKey): ValidatorWithBlsKeyProtoMsg {
    return {
      typeUrl: '/babylon.checkpointing.v1.ValidatorWithBlsKey',
      value: ValidatorWithBlsKey.encode(message).finish(),
    };
  },
};
function createBaseVoteExtension(): VoteExtension {
  return {
    signer: '',
    validatorAddress: '',
    blockHash: new Uint8Array(),
    epochNum: BigInt(0),
    height: BigInt(0),
    blsSig: new Uint8Array(),
  };
}
export const VoteExtension = {
  typeUrl: '/babylon.checkpointing.v1.VoteExtension',
  encode(message: VoteExtension, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.signer !== '') {
      writer.uint32(10).string(message.signer);
    }
    if (message.validatorAddress !== '') {
      writer.uint32(18).string(message.validatorAddress);
    }
    if (message.blockHash.length !== 0) {
      writer.uint32(26).bytes(message.blockHash);
    }
    if (message.epochNum !== BigInt(0)) {
      writer.uint32(32).uint64(message.epochNum);
    }
    if (message.height !== BigInt(0)) {
      writer.uint32(40).uint64(message.height);
    }
    if (message.blsSig.length !== 0) {
      writer.uint32(50).bytes(message.blsSig);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): VoteExtension {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseVoteExtension();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.signer = reader.string();
          break;
        case 2:
          message.validatorAddress = reader.string();
          break;
        case 3:
          message.blockHash = reader.bytes();
          break;
        case 4:
          message.epochNum = reader.uint64();
          break;
        case 5:
          message.height = reader.uint64();
          break;
        case 6:
          message.blsSig = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<VoteExtension>): VoteExtension {
    const message = createBaseVoteExtension();
    message.signer = object.signer ?? '';
    message.validatorAddress = object.validatorAddress ?? '';
    message.blockHash = object.blockHash ?? new Uint8Array();
    message.epochNum =
      object.epochNum !== undefined && object.epochNum !== null ? BigInt(object.epochNum.toString()) : BigInt(0);
    message.height =
      object.height !== undefined && object.height !== null ? BigInt(object.height.toString()) : BigInt(0);
    message.blsSig = object.blsSig ?? new Uint8Array();
    return message;
  },
  fromAmino(object: VoteExtensionAmino): VoteExtension {
    const message = createBaseVoteExtension();
    if (object.signer !== undefined && object.signer !== null) {
      message.signer = object.signer;
    }
    if (object.validator_address !== undefined && object.validator_address !== null) {
      message.validatorAddress = object.validator_address;
    }
    if (object.block_hash !== undefined && object.block_hash !== null) {
      message.blockHash = bytesFromBase64(object.block_hash);
    }
    if (object.epoch_num !== undefined && object.epoch_num !== null) {
      message.epochNum = BigInt(object.epoch_num);
    }
    if (object.height !== undefined && object.height !== null) {
      message.height = BigInt(object.height);
    }
    if (object.bls_sig !== undefined && object.bls_sig !== null) {
      message.blsSig = bytesFromBase64(object.bls_sig);
    }
    return message;
  },
  toAmino(message: VoteExtension): VoteExtensionAmino {
    const obj: any = {};
    obj.signer = message.signer === '' ? undefined : message.signer;
    obj.validator_address = message.validatorAddress === '' ? undefined : message.validatorAddress;
    obj.block_hash = message.blockHash ? base64FromBytes(message.blockHash) : undefined;
    obj.epoch_num = message.epochNum !== BigInt(0) ? message.epochNum?.toString() : undefined;
    obj.height = message.height !== BigInt(0) ? message.height?.toString() : undefined;
    obj.bls_sig = message.blsSig ? base64FromBytes(message.blsSig) : undefined;
    return obj;
  },
  fromAminoMsg(object: VoteExtensionAminoMsg): VoteExtension {
    return VoteExtension.fromAmino(object.value);
  },
  fromProtoMsg(message: VoteExtensionProtoMsg): VoteExtension {
    return VoteExtension.decode(message.value);
  },
  toProto(message: VoteExtension): Uint8Array {
    return VoteExtension.encode(message).finish();
  },
  toProtoMsg(message: VoteExtension): VoteExtensionProtoMsg {
    return {
      typeUrl: '/babylon.checkpointing.v1.VoteExtension',
      value: VoteExtension.encode(message).finish(),
    };
  },
};
