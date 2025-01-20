import { Decimal } from '@cosmjs/math';

import { BinaryReader, BinaryWriter } from '../../../binary';
import { base64FromBytes, bytesFromBase64 } from '../../../helpers';
import { Description, DescriptionAmino, DescriptionSDKType } from '../../core-proto-ts/cosmos/staking/v1beta1/staking';
import { ProofOfPossessionBTC, ProofOfPossessionBTCAmino, ProofOfPossessionBTCSDKType } from './pop';
/**
 * BTCDelegationStatus is the status of a delegation. The state transition path is
 * PENDING -> ACTIVE -> UNBONDED with two possibilities:
 * 1. the typical path when timelock of staking transaction expires.
 * 2. the path when staker requests early undelegation through MsgBTCUndelegate message.
 */
export enum BTCDelegationStatus {
  /** PENDING - PENDING defines a delegation that is waiting for covenant signatures to become active. */
  PENDING = 0,
  /** ACTIVE - ACTIVE defines a delegation that has voting power */
  ACTIVE = 1,
  /**
   * UNBONDED - UNBONDED defines a delegation no longer has voting power:
   * - either reaching the end of staking transaction timelock
   * - or receiving unbonding tx with signatures from staker and covenant committee
   */
  UNBONDED = 2,
  /** ANY - ANY is any of the above status */
  ANY = 3,
  UNRECOGNIZED = -1,
}
export const BTCDelegationStatusSDKType = BTCDelegationStatus;
export const BTCDelegationStatusAmino = BTCDelegationStatus;
export function bTCDelegationStatusFromJSON(object: any): BTCDelegationStatus {
  switch (object) {
    case 0:
    case 'PENDING':
      return BTCDelegationStatus.PENDING;
    case 1:
    case 'ACTIVE':
      return BTCDelegationStatus.ACTIVE;
    case 2:
    case 'UNBONDED':
      return BTCDelegationStatus.UNBONDED;
    case 3:
    case 'ANY':
      return BTCDelegationStatus.ANY;
    case -1:
    case 'UNRECOGNIZED':
    default:
      return BTCDelegationStatus.UNRECOGNIZED;
  }
}
export function bTCDelegationStatusToJSON(object: BTCDelegationStatus): string {
  switch (object) {
    case BTCDelegationStatus.PENDING:
      return 'PENDING';
    case BTCDelegationStatus.ACTIVE:
      return 'ACTIVE';
    case BTCDelegationStatus.UNBONDED:
      return 'UNBONDED';
    case BTCDelegationStatus.ANY:
      return 'ANY';
    case BTCDelegationStatus.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED';
  }
}
/** FinalityProvider defines a finality provider */
export interface FinalityProvider {
  /** addr is the bech32 address identifier of the finality provider. */
  addr: string;
  /** description defines the description terms for the finality provider. */
  description?: Description;
  /** commission defines the commission rate of the finality provider. */
  commission: string;
  /**
   * btc_pk is the Bitcoin secp256k1 PK of this finality provider
   * the PK follows encoding in BIP-340 spec
   */
  btcPk: Uint8Array;
  /**
   * pop is the proof of possession of the btc_pk, where the BTC
   * private key signs the bech32 bbn addr of the finality provider.
   */
  pop?: ProofOfPossessionBTC;
  /**
   * slashed_babylon_height indicates the Babylon height when
   * the finality provider is slashed.
   * if it's 0 then the finality provider is not slashed
   */
  slashedBabylonHeight: bigint;
  /**
   * slashed_btc_height indicates the BTC height when
   * the finality provider is slashed.
   * if it's 0 then the finality provider is not slashed
   */
  slashedBtcHeight: bigint;
  /** sluggish defines whether the finality provider is detected sluggish */
  sluggish: boolean;
}
export interface FinalityProviderProtoMsg {
  typeUrl: '/babylon.btcstaking.v1.FinalityProvider';
  value: Uint8Array;
}
/** FinalityProvider defines a finality provider */
export interface FinalityProviderAmino {
  /** addr is the bech32 address identifier of the finality provider. */
  addr?: string;
  /** description defines the description terms for the finality provider. */
  description?: DescriptionAmino;
  /** commission defines the commission rate of the finality provider. */
  commission?: string;
  /**
   * btc_pk is the Bitcoin secp256k1 PK of this finality provider
   * the PK follows encoding in BIP-340 spec
   */
  btc_pk?: string;
  /**
   * pop is the proof of possession of the btc_pk, where the BTC
   * private key signs the bech32 bbn addr of the finality provider.
   */
  pop?: ProofOfPossessionBTCAmino;
  /**
   * slashed_babylon_height indicates the Babylon height when
   * the finality provider is slashed.
   * if it's 0 then the finality provider is not slashed
   */
  slashed_babylon_height?: string;
  /**
   * slashed_btc_height indicates the BTC height when
   * the finality provider is slashed.
   * if it's 0 then the finality provider is not slashed
   */
  slashed_btc_height?: string;
  /** sluggish defines whether the finality provider is detected sluggish */
  sluggish?: boolean;
}
export interface FinalityProviderAminoMsg {
  type: '/babylon.btcstaking.v1.FinalityProvider';
  value: FinalityProviderAmino;
}
/** FinalityProvider defines a finality provider */
export interface FinalityProviderSDKType {
  addr: string;
  description?: DescriptionSDKType;
  commission: string;
  btc_pk: Uint8Array;
  pop?: ProofOfPossessionBTCSDKType;
  slashed_babylon_height: bigint;
  slashed_btc_height: bigint;
  sluggish: boolean;
}
/** FinalityProviderWithMeta wraps the FinalityProvider with metadata. */
export interface FinalityProviderWithMeta {
  /**
   * btc_pk is the Bitcoin secp256k1 PK of thisfinality provider
   * the PK follows encoding in BIP-340 spec
   */
  btcPk: Uint8Array;
  /** height is the queried Babylon height */
  height: bigint;
  /** voting_power is the voting power of this finality provider at the given height */
  votingPower: bigint;
  /**
   * slashed_babylon_height indicates the Babylon height when
   * the finality provider is slashed.
   * if it's 0 then the finality provider is not slashed
   */
  slashedBabylonHeight: bigint;
  /**
   * slashed_btc_height indicates the BTC height when
   * the finality provider is slashed.
   * if it's 0 then the finality provider is not slashed
   */
  slashedBtcHeight: bigint;
  /** sluggish defines whether the finality provider is detected sluggish */
  sluggish: boolean;
}
export interface FinalityProviderWithMetaProtoMsg {
  typeUrl: '/babylon.btcstaking.v1.FinalityProviderWithMeta';
  value: Uint8Array;
}
/** FinalityProviderWithMeta wraps the FinalityProvider with metadata. */
export interface FinalityProviderWithMetaAmino {
  /**
   * btc_pk is the Bitcoin secp256k1 PK of thisfinality provider
   * the PK follows encoding in BIP-340 spec
   */
  btc_pk?: string;
  /** height is the queried Babylon height */
  height?: string;
  /** voting_power is the voting power of this finality provider at the given height */
  voting_power?: string;
  /**
   * slashed_babylon_height indicates the Babylon height when
   * the finality provider is slashed.
   * if it's 0 then the finality provider is not slashed
   */
  slashed_babylon_height?: string;
  /**
   * slashed_btc_height indicates the BTC height when
   * the finality provider is slashed.
   * if it's 0 then the finality provider is not slashed
   */
  slashed_btc_height?: string;
  /** sluggish defines whether the finality provider is detected sluggish */
  sluggish?: boolean;
}
export interface FinalityProviderWithMetaAminoMsg {
  type: '/babylon.btcstaking.v1.FinalityProviderWithMeta';
  value: FinalityProviderWithMetaAmino;
}
/** FinalityProviderWithMeta wraps the FinalityProvider with metadata. */
export interface FinalityProviderWithMetaSDKType {
  btc_pk: Uint8Array;
  height: bigint;
  voting_power: bigint;
  slashed_babylon_height: bigint;
  slashed_btc_height: bigint;
  sluggish: boolean;
}
/** BTCDelegation defines a BTC delegation */
export interface BTCDelegation {
  /** staker_addr is the address to receive rewards from BTC delegation. */
  stakerAddr: string;
  /**
   * btc_pk is the Bitcoin secp256k1 PK of this BTC delegation
   * the PK follows encoding in BIP-340 spec
   */
  btcPk: Uint8Array;
  /** pop is the proof of possession of babylon_pk and btc_pk */
  pop?: ProofOfPossessionBTC;
  /**
   * fp_btc_pk_list is the list of BIP-340 PKs of the finality providers that
   * this BTC delegation delegates to
   * If there is more than 1 PKs, then this means the delegation is restaked
   * to multiple finality providers
   */
  fpBtcPkList: Uint8Array[];
  /**
   * start_height is the start BTC height of the BTC delegation
   * it is the start BTC height of the timelock
   */
  startHeight: bigint;
  /**
   * end_height is the end height of the BTC delegation
   * it is the end BTC height of the timelock - w
   */
  endHeight: bigint;
  /**
   * total_sat is the total amount of BTC stakes in this delegation
   * quantified in satoshi
   */
  totalSat: bigint;
  /** staking_tx is the staking tx */
  stakingTx: Uint8Array;
  /** staking_output_idx is the index of the staking output in the staking tx */
  stakingOutputIdx: number;
  /**
   * slashing_tx is the slashing tx
   * It is partially signed by SK corresponding to btc_pk, but not signed by
   * finality provider or covenant yet.
   */
  slashingTx: Uint8Array;
  /**
   * delegator_sig is the signature on the slashing tx
   * by the delegator (i.e., SK corresponding to btc_pk).
   * It will be a part of the witness for the staking tx output.
   */
  delegatorSig: Uint8Array;
  /**
   * covenant_sigs is a list of adaptor signatures on the slashing tx
   * by each covenant member
   * It will be a part of the witness for the staking tx output.
   */
  covenantSigs: CovenantAdaptorSignatures[];
  /**
   * unbonding_time describes how long the funds will be locked either in unbonding output
   * or slashing change output
   */
  unbondingTime: number;
  /** btc_undelegation is the information about the early unbonding path of the BTC delegation */
  btcUndelegation?: BTCUndelegation;
  /** version of the params used to validate the delegation */
  paramsVersion: number;
}
export interface BTCDelegationProtoMsg {
  typeUrl: '/babylon.btcstaking.v1.BTCDelegation';
  value: Uint8Array;
}
/** BTCDelegation defines a BTC delegation */
export interface BTCDelegationAmino {
  /** staker_addr is the address to receive rewards from BTC delegation. */
  staker_addr?: string;
  /**
   * btc_pk is the Bitcoin secp256k1 PK of this BTC delegation
   * the PK follows encoding in BIP-340 spec
   */
  btc_pk?: string;
  /** pop is the proof of possession of babylon_pk and btc_pk */
  pop?: ProofOfPossessionBTCAmino;
  /**
   * fp_btc_pk_list is the list of BIP-340 PKs of the finality providers that
   * this BTC delegation delegates to
   * If there is more than 1 PKs, then this means the delegation is restaked
   * to multiple finality providers
   */
  fp_btc_pk_list?: string[];
  /**
   * start_height is the start BTC height of the BTC delegation
   * it is the start BTC height of the timelock
   */
  start_height?: string;
  /**
   * end_height is the end height of the BTC delegation
   * it is the end BTC height of the timelock - w
   */
  end_height?: string;
  /**
   * total_sat is the total amount of BTC stakes in this delegation
   * quantified in satoshi
   */
  total_sat?: string;
  /** staking_tx is the staking tx */
  staking_tx?: string;
  /** staking_output_idx is the index of the staking output in the staking tx */
  staking_output_idx?: number;
  /**
   * slashing_tx is the slashing tx
   * It is partially signed by SK corresponding to btc_pk, but not signed by
   * finality provider or covenant yet.
   */
  slashing_tx?: string;
  /**
   * delegator_sig is the signature on the slashing tx
   * by the delegator (i.e., SK corresponding to btc_pk).
   * It will be a part of the witness for the staking tx output.
   */
  delegator_sig?: string;
  /**
   * covenant_sigs is a list of adaptor signatures on the slashing tx
   * by each covenant member
   * It will be a part of the witness for the staking tx output.
   */
  covenant_sigs?: CovenantAdaptorSignaturesAmino[];
  /**
   * unbonding_time describes how long the funds will be locked either in unbonding output
   * or slashing change output
   */
  unbonding_time?: number;
  /** btc_undelegation is the information about the early unbonding path of the BTC delegation */
  btc_undelegation?: BTCUndelegationAmino;
  /** version of the params used to validate the delegation */
  params_version?: number;
}
export interface BTCDelegationAminoMsg {
  type: '/babylon.btcstaking.v1.BTCDelegation';
  value: BTCDelegationAmino;
}
/** BTCDelegation defines a BTC delegation */
export interface BTCDelegationSDKType {
  staker_addr: string;
  btc_pk: Uint8Array;
  pop?: ProofOfPossessionBTCSDKType;
  fp_btc_pk_list: Uint8Array[];
  start_height: bigint;
  end_height: bigint;
  total_sat: bigint;
  staking_tx: Uint8Array;
  staking_output_idx: number;
  slashing_tx: Uint8Array;
  delegator_sig: Uint8Array;
  covenant_sigs: CovenantAdaptorSignaturesSDKType[];
  unbonding_time: number;
  btc_undelegation?: BTCUndelegationSDKType;
  params_version: number;
}
/** BTCUndelegation contains the information about the early unbonding path of the BTC delegation */
export interface BTCUndelegation {
  /**
   * unbonding_tx is the transaction which will transfer the funds from staking
   * output to unbonding output. Unbonding output will usually have lower timelock
   * than staking output.
   */
  unbondingTx: Uint8Array;
  /**
   * slashing_tx is the slashing tx for unbonding transactions
   * It is partially signed by SK corresponding to btc_pk, but not signed by
   * finality provider or covenant yet.
   */
  slashingTx: Uint8Array;
  /**
   * delegator_unbonding_sig is the signature on the unbonding tx
   * by the delegator (i.e., SK corresponding to btc_pk).
   * It effectively proves that the delegator wants to unbond and thus
   * Babylon will consider this BTC delegation unbonded. Delegator's BTC
   * on Bitcoin will be unbonded after timelock
   */
  delegatorUnbondingSig: Uint8Array;
  /**
   * delegator_slashing_sig is the signature on the slashing tx
   * by the delegator (i.e., SK corresponding to btc_pk).
   * It will be a part of the witness for the unbonding tx output.
   */
  delegatorSlashingSig: Uint8Array;
  /**
   * covenant_slashing_sigs is a list of adaptor signatures on the slashing tx
   * by each covenant member
   * It will be a part of the witness for the staking tx output.
   */
  covenantSlashingSigs: CovenantAdaptorSignatures[];
  /**
   * covenant_unbonding_sig_list is the list of signatures on the unbonding tx
   * by covenant members
   * It must be provided after processing undelegate message by Babylon
   */
  covenantUnbondingSigList: SignatureInfo[];
}
export interface BTCUndelegationProtoMsg {
  typeUrl: '/babylon.btcstaking.v1.BTCUndelegation';
  value: Uint8Array;
}
/** BTCUndelegation contains the information about the early unbonding path of the BTC delegation */
export interface BTCUndelegationAmino {
  /**
   * unbonding_tx is the transaction which will transfer the funds from staking
   * output to unbonding output. Unbonding output will usually have lower timelock
   * than staking output.
   */
  unbonding_tx?: string;
  /**
   * slashing_tx is the slashing tx for unbonding transactions
   * It is partially signed by SK corresponding to btc_pk, but not signed by
   * finality provider or covenant yet.
   */
  slashing_tx?: string;
  /**
   * delegator_unbonding_sig is the signature on the unbonding tx
   * by the delegator (i.e., SK corresponding to btc_pk).
   * It effectively proves that the delegator wants to unbond and thus
   * Babylon will consider this BTC delegation unbonded. Delegator's BTC
   * on Bitcoin will be unbonded after timelock
   */
  delegator_unbonding_sig?: string;
  /**
   * delegator_slashing_sig is the signature on the slashing tx
   * by the delegator (i.e., SK corresponding to btc_pk).
   * It will be a part of the witness for the unbonding tx output.
   */
  delegator_slashing_sig?: string;
  /**
   * covenant_slashing_sigs is a list of adaptor signatures on the slashing tx
   * by each covenant member
   * It will be a part of the witness for the staking tx output.
   */
  covenant_slashing_sigs?: CovenantAdaptorSignaturesAmino[];
  /**
   * covenant_unbonding_sig_list is the list of signatures on the unbonding tx
   * by covenant members
   * It must be provided after processing undelegate message by Babylon
   */
  covenant_unbonding_sig_list?: SignatureInfoAmino[];
}
export interface BTCUndelegationAminoMsg {
  type: '/babylon.btcstaking.v1.BTCUndelegation';
  value: BTCUndelegationAmino;
}
/** BTCUndelegation contains the information about the early unbonding path of the BTC delegation */
export interface BTCUndelegationSDKType {
  unbonding_tx: Uint8Array;
  slashing_tx: Uint8Array;
  delegator_unbonding_sig: Uint8Array;
  delegator_slashing_sig: Uint8Array;
  covenant_slashing_sigs: CovenantAdaptorSignaturesSDKType[];
  covenant_unbonding_sig_list: SignatureInfoSDKType[];
}
/** BTCDelegatorDelegations is a collection of BTC delegations from the same delegator. */
export interface BTCDelegatorDelegations {
  dels: BTCDelegation[];
}
export interface BTCDelegatorDelegationsProtoMsg {
  typeUrl: '/babylon.btcstaking.v1.BTCDelegatorDelegations';
  value: Uint8Array;
}
/** BTCDelegatorDelegations is a collection of BTC delegations from the same delegator. */
export interface BTCDelegatorDelegationsAmino {
  dels?: BTCDelegationAmino[];
}
export interface BTCDelegatorDelegationsAminoMsg {
  type: '/babylon.btcstaking.v1.BTCDelegatorDelegations';
  value: BTCDelegatorDelegationsAmino;
}
/** BTCDelegatorDelegations is a collection of BTC delegations from the same delegator. */
export interface BTCDelegatorDelegationsSDKType {
  dels: BTCDelegationSDKType[];
}
/** BTCDelegatorDelegationIndex is a list of staking tx hashes of BTC delegations from the same delegator. */
export interface BTCDelegatorDelegationIndex {
  stakingTxHashList: Uint8Array[];
}
export interface BTCDelegatorDelegationIndexProtoMsg {
  typeUrl: '/babylon.btcstaking.v1.BTCDelegatorDelegationIndex';
  value: Uint8Array;
}
/** BTCDelegatorDelegationIndex is a list of staking tx hashes of BTC delegations from the same delegator. */
export interface BTCDelegatorDelegationIndexAmino {
  staking_tx_hash_list?: string[];
}
export interface BTCDelegatorDelegationIndexAminoMsg {
  type: '/babylon.btcstaking.v1.BTCDelegatorDelegationIndex';
  value: BTCDelegatorDelegationIndexAmino;
}
/** BTCDelegatorDelegationIndex is a list of staking tx hashes of BTC delegations from the same delegator. */
export interface BTCDelegatorDelegationIndexSDKType {
  staking_tx_hash_list: Uint8Array[];
}
/** SignatureInfo is a BIP-340 signature together with its signer's BIP-340 PK */
export interface SignatureInfo {
  pk: Uint8Array;
  sig: Uint8Array;
}
export interface SignatureInfoProtoMsg {
  typeUrl: '/babylon.btcstaking.v1.SignatureInfo';
  value: Uint8Array;
}
/** SignatureInfo is a BIP-340 signature together with its signer's BIP-340 PK */
export interface SignatureInfoAmino {
  pk?: string;
  sig?: string;
}
export interface SignatureInfoAminoMsg {
  type: '/babylon.btcstaking.v1.SignatureInfo';
  value: SignatureInfoAmino;
}
/** SignatureInfo is a BIP-340 signature together with its signer's BIP-340 PK */
export interface SignatureInfoSDKType {
  pk: Uint8Array;
  sig: Uint8Array;
}
/**
 * CovenantAdaptorSignatures is a list adaptor signatures signed by the
 * covenant with different finality provider's public keys as encryption keys
 */
export interface CovenantAdaptorSignatures {
  /** cov_pk is the public key of the covenant emulator, used as the public key of the adaptor signature */
  covPk: Uint8Array;
  /** adaptor_sigs is a list of adaptor signatures, each encrypted by a restaked BTC finality provider's public key */
  adaptorSigs: Uint8Array[];
}
export interface CovenantAdaptorSignaturesProtoMsg {
  typeUrl: '/babylon.btcstaking.v1.CovenantAdaptorSignatures';
  value: Uint8Array;
}
/**
 * CovenantAdaptorSignatures is a list adaptor signatures signed by the
 * covenant with different finality provider's public keys as encryption keys
 */
export interface CovenantAdaptorSignaturesAmino {
  /** cov_pk is the public key of the covenant emulator, used as the public key of the adaptor signature */
  cov_pk?: string;
  /** adaptor_sigs is a list of adaptor signatures, each encrypted by a restaked BTC finality provider's public key */
  adaptor_sigs?: string[];
}
export interface CovenantAdaptorSignaturesAminoMsg {
  type: '/babylon.btcstaking.v1.CovenantAdaptorSignatures';
  value: CovenantAdaptorSignaturesAmino;
}
/**
 * CovenantAdaptorSignatures is a list adaptor signatures signed by the
 * covenant with different finality provider's public keys as encryption keys
 */
export interface CovenantAdaptorSignaturesSDKType {
  cov_pk: Uint8Array;
  adaptor_sigs: Uint8Array[];
}
/**
 * SelectiveSlashingEvidence is the evidence that the finality provider
 * selectively slashed a BTC delegation
 * NOTE: it's possible that a slashed finality provider exploits the
 * SelectiveSlashingEvidence endpoint while it is actually slashed due to
 * equivocation. But such behaviour does not affect the system's security
 * or gives any benefit for the adversary
 */
export interface SelectiveSlashingEvidence {
  /**
   * staking_tx_hash is the hash of the staking tx.
   * It uniquely identifies a BTC delegation
   */
  stakingTxHash: string;
  /**
   * fp_btc_pk is the BTC PK of the finality provider who
   * launches the selective slashing offence
   */
  fpBtcPk: Uint8Array;
  /**
   * recovered_fp_btc_sk is the finality provider's BTC SK recovered from
   * the covenant adaptor/Schnorr signature pair. It is the consequence
   * of selective slashing.
   */
  recoveredFpBtcSk: Uint8Array;
}
export interface SelectiveSlashingEvidenceProtoMsg {
  typeUrl: '/babylon.btcstaking.v1.SelectiveSlashingEvidence';
  value: Uint8Array;
}
/**
 * SelectiveSlashingEvidence is the evidence that the finality provider
 * selectively slashed a BTC delegation
 * NOTE: it's possible that a slashed finality provider exploits the
 * SelectiveSlashingEvidence endpoint while it is actually slashed due to
 * equivocation. But such behaviour does not affect the system's security
 * or gives any benefit for the adversary
 */
export interface SelectiveSlashingEvidenceAmino {
  /**
   * staking_tx_hash is the hash of the staking tx.
   * It uniquely identifies a BTC delegation
   */
  staking_tx_hash?: string;
  /**
   * fp_btc_pk is the BTC PK of the finality provider who
   * launches the selective slashing offence
   */
  fp_btc_pk?: string;
  /**
   * recovered_fp_btc_sk is the finality provider's BTC SK recovered from
   * the covenant adaptor/Schnorr signature pair. It is the consequence
   * of selective slashing.
   */
  recovered_fp_btc_sk?: string;
}
export interface SelectiveSlashingEvidenceAminoMsg {
  type: '/babylon.btcstaking.v1.SelectiveSlashingEvidence';
  value: SelectiveSlashingEvidenceAmino;
}
/**
 * SelectiveSlashingEvidence is the evidence that the finality provider
 * selectively slashed a BTC delegation
 * NOTE: it's possible that a slashed finality provider exploits the
 * SelectiveSlashingEvidence endpoint while it is actually slashed due to
 * equivocation. But such behaviour does not affect the system's security
 * or gives any benefit for the adversary
 */
export interface SelectiveSlashingEvidenceSDKType {
  staking_tx_hash: string;
  fp_btc_pk: Uint8Array;
  recovered_fp_btc_sk: Uint8Array;
}
function createBaseFinalityProvider(): FinalityProvider {
  return {
    addr: '',
    description: undefined,
    commission: '',
    btcPk: new Uint8Array(),
    pop: undefined,
    slashedBabylonHeight: BigInt(0),
    slashedBtcHeight: BigInt(0),
    sluggish: false,
  };
}
export const FinalityProvider = {
  typeUrl: '/babylon.btcstaking.v1.FinalityProvider',
  encode(message: FinalityProvider, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.addr !== '') {
      writer.uint32(10).string(message.addr);
    }
    if (message.description !== undefined) {
      Description.encode(message.description, writer.uint32(18).fork()).ldelim();
    }
    if (message.commission !== '') {
      writer.uint32(26).string(Decimal.fromUserInput(message.commission, 18).atomics);
    }
    if (message.btcPk.length !== 0) {
      writer.uint32(34).bytes(message.btcPk);
    }
    if (message.pop !== undefined) {
      ProofOfPossessionBTC.encode(message.pop, writer.uint32(42).fork()).ldelim();
    }
    if (message.slashedBabylonHeight !== BigInt(0)) {
      writer.uint32(48).uint64(message.slashedBabylonHeight);
    }
    if (message.slashedBtcHeight !== BigInt(0)) {
      writer.uint32(56).uint64(message.slashedBtcHeight);
    }
    if (message.sluggish === true) {
      writer.uint32(64).bool(message.sluggish);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): FinalityProvider {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseFinalityProvider();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.addr = reader.string();
          break;
        case 2:
          message.description = Description.decode(reader, reader.uint32());
          break;
        case 3:
          message.commission = Decimal.fromAtomics(reader.string(), 18).toString();
          break;
        case 4:
          message.btcPk = reader.bytes();
          break;
        case 5:
          message.pop = ProofOfPossessionBTC.decode(reader, reader.uint32());
          break;
        case 6:
          message.slashedBabylonHeight = reader.uint64();
          break;
        case 7:
          message.slashedBtcHeight = reader.uint64();
          break;
        case 8:
          message.sluggish = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<FinalityProvider>): FinalityProvider {
    const message = createBaseFinalityProvider();
    message.addr = object.addr ?? '';
    message.description =
      object.description !== undefined && object.description !== null
        ? Description.fromPartial(object.description)
        : undefined;
    message.commission = object.commission ?? '';
    message.btcPk = object.btcPk ?? new Uint8Array();
    message.pop =
      object.pop !== undefined && object.pop !== null ? ProofOfPossessionBTC.fromPartial(object.pop) : undefined;
    message.slashedBabylonHeight =
      object.slashedBabylonHeight !== undefined && object.slashedBabylonHeight !== null
        ? BigInt(object.slashedBabylonHeight.toString())
        : BigInt(0);
    message.slashedBtcHeight =
      object.slashedBtcHeight !== undefined && object.slashedBtcHeight !== null
        ? BigInt(object.slashedBtcHeight.toString())
        : BigInt(0);
    message.sluggish = object.sluggish ?? false;
    return message;
  },
  fromAmino(object: FinalityProviderAmino): FinalityProvider {
    const message = createBaseFinalityProvider();
    if (object.addr !== undefined && object.addr !== null) {
      message.addr = object.addr;
    }
    if (object.description !== undefined && object.description !== null) {
      message.description = Description.fromAmino(object.description);
    }
    if (object.commission !== undefined && object.commission !== null) {
      message.commission = object.commission;
    }
    if (object.btc_pk !== undefined && object.btc_pk !== null) {
      message.btcPk = bytesFromBase64(object.btc_pk);
    }
    if (object.pop !== undefined && object.pop !== null) {
      message.pop = ProofOfPossessionBTC.fromAmino(object.pop);
    }
    if (object.slashed_babylon_height !== undefined && object.slashed_babylon_height !== null) {
      message.slashedBabylonHeight = BigInt(object.slashed_babylon_height);
    }
    if (object.slashed_btc_height !== undefined && object.slashed_btc_height !== null) {
      message.slashedBtcHeight = BigInt(object.slashed_btc_height);
    }
    if (object.sluggish !== undefined && object.sluggish !== null) {
      message.sluggish = object.sluggish;
    }
    return message;
  },
  toAmino(message: FinalityProvider): FinalityProviderAmino {
    const obj: any = {};
    obj.addr = message.addr === '' ? undefined : message.addr;
    obj.description = message.description ? Description.toAmino(message.description) : undefined;
    obj.commission = message.commission === '' ? undefined : message.commission;
    obj.btc_pk = message.btcPk ? base64FromBytes(message.btcPk) : undefined;
    obj.pop = message.pop ? ProofOfPossessionBTC.toAmino(message.pop) : undefined;
    obj.slashed_babylon_height =
      message.slashedBabylonHeight !== BigInt(0) ? message.slashedBabylonHeight?.toString() : undefined;
    obj.slashed_btc_height = message.slashedBtcHeight !== BigInt(0) ? message.slashedBtcHeight?.toString() : undefined;
    obj.sluggish = message.sluggish === false ? undefined : message.sluggish;
    return obj;
  },
  fromAminoMsg(object: FinalityProviderAminoMsg): FinalityProvider {
    return FinalityProvider.fromAmino(object.value);
  },
  fromProtoMsg(message: FinalityProviderProtoMsg): FinalityProvider {
    return FinalityProvider.decode(message.value);
  },
  toProto(message: FinalityProvider): Uint8Array {
    return FinalityProvider.encode(message).finish();
  },
  toProtoMsg(message: FinalityProvider): FinalityProviderProtoMsg {
    return {
      typeUrl: '/babylon.btcstaking.v1.FinalityProvider',
      value: FinalityProvider.encode(message).finish(),
    };
  },
};
function createBaseFinalityProviderWithMeta(): FinalityProviderWithMeta {
  return {
    btcPk: new Uint8Array(),
    height: BigInt(0),
    votingPower: BigInt(0),
    slashedBabylonHeight: BigInt(0),
    slashedBtcHeight: BigInt(0),
    sluggish: false,
  };
}
export const FinalityProviderWithMeta = {
  typeUrl: '/babylon.btcstaking.v1.FinalityProviderWithMeta',
  encode(message: FinalityProviderWithMeta, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.btcPk.length !== 0) {
      writer.uint32(10).bytes(message.btcPk);
    }
    if (message.height !== BigInt(0)) {
      writer.uint32(16).uint64(message.height);
    }
    if (message.votingPower !== BigInt(0)) {
      writer.uint32(24).uint64(message.votingPower);
    }
    if (message.slashedBabylonHeight !== BigInt(0)) {
      writer.uint32(32).uint64(message.slashedBabylonHeight);
    }
    if (message.slashedBtcHeight !== BigInt(0)) {
      writer.uint32(40).uint64(message.slashedBtcHeight);
    }
    if (message.sluggish === true) {
      writer.uint32(48).bool(message.sluggish);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): FinalityProviderWithMeta {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseFinalityProviderWithMeta();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.btcPk = reader.bytes();
          break;
        case 2:
          message.height = reader.uint64();
          break;
        case 3:
          message.votingPower = reader.uint64();
          break;
        case 4:
          message.slashedBabylonHeight = reader.uint64();
          break;
        case 5:
          message.slashedBtcHeight = reader.uint64();
          break;
        case 6:
          message.sluggish = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<FinalityProviderWithMeta>): FinalityProviderWithMeta {
    const message = createBaseFinalityProviderWithMeta();
    message.btcPk = object.btcPk ?? new Uint8Array();
    message.height =
      object.height !== undefined && object.height !== null ? BigInt(object.height.toString()) : BigInt(0);
    message.votingPower =
      object.votingPower !== undefined && object.votingPower !== null
        ? BigInt(object.votingPower.toString())
        : BigInt(0);
    message.slashedBabylonHeight =
      object.slashedBabylonHeight !== undefined && object.slashedBabylonHeight !== null
        ? BigInt(object.slashedBabylonHeight.toString())
        : BigInt(0);
    message.slashedBtcHeight =
      object.slashedBtcHeight !== undefined && object.slashedBtcHeight !== null
        ? BigInt(object.slashedBtcHeight.toString())
        : BigInt(0);
    message.sluggish = object.sluggish ?? false;
    return message;
  },
  fromAmino(object: FinalityProviderWithMetaAmino): FinalityProviderWithMeta {
    const message = createBaseFinalityProviderWithMeta();
    if (object.btc_pk !== undefined && object.btc_pk !== null) {
      message.btcPk = bytesFromBase64(object.btc_pk);
    }
    if (object.height !== undefined && object.height !== null) {
      message.height = BigInt(object.height);
    }
    if (object.voting_power !== undefined && object.voting_power !== null) {
      message.votingPower = BigInt(object.voting_power);
    }
    if (object.slashed_babylon_height !== undefined && object.slashed_babylon_height !== null) {
      message.slashedBabylonHeight = BigInt(object.slashed_babylon_height);
    }
    if (object.slashed_btc_height !== undefined && object.slashed_btc_height !== null) {
      message.slashedBtcHeight = BigInt(object.slashed_btc_height);
    }
    if (object.sluggish !== undefined && object.sluggish !== null) {
      message.sluggish = object.sluggish;
    }
    return message;
  },
  toAmino(message: FinalityProviderWithMeta): FinalityProviderWithMetaAmino {
    const obj: any = {};
    obj.btc_pk = message.btcPk ? base64FromBytes(message.btcPk) : undefined;
    obj.height = message.height !== BigInt(0) ? message.height?.toString() : undefined;
    obj.voting_power = message.votingPower !== BigInt(0) ? message.votingPower?.toString() : undefined;
    obj.slashed_babylon_height =
      message.slashedBabylonHeight !== BigInt(0) ? message.slashedBabylonHeight?.toString() : undefined;
    obj.slashed_btc_height = message.slashedBtcHeight !== BigInt(0) ? message.slashedBtcHeight?.toString() : undefined;
    obj.sluggish = message.sluggish === false ? undefined : message.sluggish;
    return obj;
  },
  fromAminoMsg(object: FinalityProviderWithMetaAminoMsg): FinalityProviderWithMeta {
    return FinalityProviderWithMeta.fromAmino(object.value);
  },
  fromProtoMsg(message: FinalityProviderWithMetaProtoMsg): FinalityProviderWithMeta {
    return FinalityProviderWithMeta.decode(message.value);
  },
  toProto(message: FinalityProviderWithMeta): Uint8Array {
    return FinalityProviderWithMeta.encode(message).finish();
  },
  toProtoMsg(message: FinalityProviderWithMeta): FinalityProviderWithMetaProtoMsg {
    return {
      typeUrl: '/babylon.btcstaking.v1.FinalityProviderWithMeta',
      value: FinalityProviderWithMeta.encode(message).finish(),
    };
  },
};
function createBaseBTCDelegation(): BTCDelegation {
  return {
    stakerAddr: '',
    btcPk: new Uint8Array(),
    pop: undefined,
    fpBtcPkList: [],
    startHeight: BigInt(0),
    endHeight: BigInt(0),
    totalSat: BigInt(0),
    stakingTx: new Uint8Array(),
    stakingOutputIdx: 0,
    slashingTx: new Uint8Array(),
    delegatorSig: new Uint8Array(),
    covenantSigs: [],
    unbondingTime: 0,
    btcUndelegation: undefined,
    paramsVersion: 0,
  };
}
export const BTCDelegation = {
  typeUrl: '/babylon.btcstaking.v1.BTCDelegation',
  encode(message: BTCDelegation, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.stakerAddr !== '') {
      writer.uint32(10).string(message.stakerAddr);
    }
    if (message.btcPk.length !== 0) {
      writer.uint32(18).bytes(message.btcPk);
    }
    if (message.pop !== undefined) {
      ProofOfPossessionBTC.encode(message.pop, writer.uint32(26).fork()).ldelim();
    }
    for (const v of message.fpBtcPkList) {
      writer.uint32(34).bytes(v!);
    }
    if (message.startHeight !== BigInt(0)) {
      writer.uint32(40).uint64(message.startHeight);
    }
    if (message.endHeight !== BigInt(0)) {
      writer.uint32(48).uint64(message.endHeight);
    }
    if (message.totalSat !== BigInt(0)) {
      writer.uint32(56).uint64(message.totalSat);
    }
    if (message.stakingTx.length !== 0) {
      writer.uint32(66).bytes(message.stakingTx);
    }
    if (message.stakingOutputIdx !== 0) {
      writer.uint32(72).uint32(message.stakingOutputIdx);
    }
    if (message.slashingTx.length !== 0) {
      writer.uint32(82).bytes(message.slashingTx);
    }
    if (message.delegatorSig.length !== 0) {
      writer.uint32(90).bytes(message.delegatorSig);
    }
    for (const v of message.covenantSigs) {
      CovenantAdaptorSignatures.encode(v!, writer.uint32(98).fork()).ldelim();
    }
    if (message.unbondingTime !== 0) {
      writer.uint32(104).uint32(message.unbondingTime);
    }
    if (message.btcUndelegation !== undefined) {
      BTCUndelegation.encode(message.btcUndelegation, writer.uint32(114).fork()).ldelim();
    }
    if (message.paramsVersion !== 0) {
      writer.uint32(120).uint32(message.paramsVersion);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): BTCDelegation {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBTCDelegation();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.stakerAddr = reader.string();
          break;
        case 2:
          message.btcPk = reader.bytes();
          break;
        case 3:
          message.pop = ProofOfPossessionBTC.decode(reader, reader.uint32());
          break;
        case 4:
          message.fpBtcPkList.push(reader.bytes());
          break;
        case 5:
          message.startHeight = reader.uint64();
          break;
        case 6:
          message.endHeight = reader.uint64();
          break;
        case 7:
          message.totalSat = reader.uint64();
          break;
        case 8:
          message.stakingTx = reader.bytes();
          break;
        case 9:
          message.stakingOutputIdx = reader.uint32();
          break;
        case 10:
          message.slashingTx = reader.bytes();
          break;
        case 11:
          message.delegatorSig = reader.bytes();
          break;
        case 12:
          message.covenantSigs.push(CovenantAdaptorSignatures.decode(reader, reader.uint32()));
          break;
        case 13:
          message.unbondingTime = reader.uint32();
          break;
        case 14:
          message.btcUndelegation = BTCUndelegation.decode(reader, reader.uint32());
          break;
        case 15:
          message.paramsVersion = reader.uint32();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<BTCDelegation>): BTCDelegation {
    const message = createBaseBTCDelegation();
    message.stakerAddr = object.stakerAddr ?? '';
    message.btcPk = object.btcPk ?? new Uint8Array();
    message.pop =
      object.pop !== undefined && object.pop !== null ? ProofOfPossessionBTC.fromPartial(object.pop) : undefined;
    message.fpBtcPkList = object.fpBtcPkList?.map((e) => e) || [];
    message.startHeight =
      object.startHeight !== undefined && object.startHeight !== null
        ? BigInt(object.startHeight.toString())
        : BigInt(0);
    message.endHeight =
      object.endHeight !== undefined && object.endHeight !== null ? BigInt(object.endHeight.toString()) : BigInt(0);
    message.totalSat =
      object.totalSat !== undefined && object.totalSat !== null ? BigInt(object.totalSat.toString()) : BigInt(0);
    message.stakingTx = object.stakingTx ?? new Uint8Array();
    message.stakingOutputIdx = object.stakingOutputIdx ?? 0;
    message.slashingTx = object.slashingTx ?? new Uint8Array();
    message.delegatorSig = object.delegatorSig ?? new Uint8Array();
    message.covenantSigs = object.covenantSigs?.map((e) => CovenantAdaptorSignatures.fromPartial(e)) || [];
    message.unbondingTime = object.unbondingTime ?? 0;
    message.btcUndelegation =
      object.btcUndelegation !== undefined && object.btcUndelegation !== null
        ? BTCUndelegation.fromPartial(object.btcUndelegation)
        : undefined;
    message.paramsVersion = object.paramsVersion ?? 0;
    return message;
  },
  fromAmino(object: BTCDelegationAmino): BTCDelegation {
    const message = createBaseBTCDelegation();
    if (object.staker_addr !== undefined && object.staker_addr !== null) {
      message.stakerAddr = object.staker_addr;
    }
    if (object.btc_pk !== undefined && object.btc_pk !== null) {
      message.btcPk = bytesFromBase64(object.btc_pk);
    }
    if (object.pop !== undefined && object.pop !== null) {
      message.pop = ProofOfPossessionBTC.fromAmino(object.pop);
    }
    message.fpBtcPkList = object.fp_btc_pk_list?.map((e) => bytesFromBase64(e)) || [];
    if (object.start_height !== undefined && object.start_height !== null) {
      message.startHeight = BigInt(object.start_height);
    }
    if (object.end_height !== undefined && object.end_height !== null) {
      message.endHeight = BigInt(object.end_height);
    }
    if (object.total_sat !== undefined && object.total_sat !== null) {
      message.totalSat = BigInt(object.total_sat);
    }
    if (object.staking_tx !== undefined && object.staking_tx !== null) {
      message.stakingTx = bytesFromBase64(object.staking_tx);
    }
    if (object.staking_output_idx !== undefined && object.staking_output_idx !== null) {
      message.stakingOutputIdx = object.staking_output_idx;
    }
    if (object.slashing_tx !== undefined && object.slashing_tx !== null) {
      message.slashingTx = bytesFromBase64(object.slashing_tx);
    }
    if (object.delegator_sig !== undefined && object.delegator_sig !== null) {
      message.delegatorSig = bytesFromBase64(object.delegator_sig);
    }
    message.covenantSigs = object.covenant_sigs?.map((e) => CovenantAdaptorSignatures.fromAmino(e)) || [];
    if (object.unbonding_time !== undefined && object.unbonding_time !== null) {
      message.unbondingTime = object.unbonding_time;
    }
    if (object.btc_undelegation !== undefined && object.btc_undelegation !== null) {
      message.btcUndelegation = BTCUndelegation.fromAmino(object.btc_undelegation);
    }
    if (object.params_version !== undefined && object.params_version !== null) {
      message.paramsVersion = object.params_version;
    }
    return message;
  },
  toAmino(message: BTCDelegation): BTCDelegationAmino {
    const obj: any = {};
    obj.staker_addr = message.stakerAddr === '' ? undefined : message.stakerAddr;
    obj.btc_pk = message.btcPk ? base64FromBytes(message.btcPk) : undefined;
    obj.pop = message.pop ? ProofOfPossessionBTC.toAmino(message.pop) : undefined;
    if (message.fpBtcPkList) {
      obj.fp_btc_pk_list = message.fpBtcPkList.map((e) => base64FromBytes(e));
    } else {
      obj.fp_btc_pk_list = message.fpBtcPkList;
    }
    obj.start_height = message.startHeight !== BigInt(0) ? message.startHeight?.toString() : undefined;
    obj.end_height = message.endHeight !== BigInt(0) ? message.endHeight?.toString() : undefined;
    obj.total_sat = message.totalSat !== BigInt(0) ? message.totalSat?.toString() : undefined;
    obj.staking_tx = message.stakingTx ? base64FromBytes(message.stakingTx) : undefined;
    obj.staking_output_idx = message.stakingOutputIdx === 0 ? undefined : message.stakingOutputIdx;
    obj.slashing_tx = message.slashingTx ? base64FromBytes(message.slashingTx) : undefined;
    obj.delegator_sig = message.delegatorSig ? base64FromBytes(message.delegatorSig) : undefined;
    if (message.covenantSigs) {
      obj.covenant_sigs = message.covenantSigs.map((e) => (e ? CovenantAdaptorSignatures.toAmino(e) : undefined));
    } else {
      obj.covenant_sigs = message.covenantSigs;
    }
    obj.unbonding_time = message.unbondingTime === 0 ? undefined : message.unbondingTime;
    obj.btc_undelegation = message.btcUndelegation ? BTCUndelegation.toAmino(message.btcUndelegation) : undefined;
    obj.params_version = message.paramsVersion === 0 ? undefined : message.paramsVersion;
    return obj;
  },
  fromAminoMsg(object: BTCDelegationAminoMsg): BTCDelegation {
    return BTCDelegation.fromAmino(object.value);
  },
  fromProtoMsg(message: BTCDelegationProtoMsg): BTCDelegation {
    return BTCDelegation.decode(message.value);
  },
  toProto(message: BTCDelegation): Uint8Array {
    return BTCDelegation.encode(message).finish();
  },
  toProtoMsg(message: BTCDelegation): BTCDelegationProtoMsg {
    return {
      typeUrl: '/babylon.btcstaking.v1.BTCDelegation',
      value: BTCDelegation.encode(message).finish(),
    };
  },
};
function createBaseBTCUndelegation(): BTCUndelegation {
  return {
    unbondingTx: new Uint8Array(),
    slashingTx: new Uint8Array(),
    delegatorUnbondingSig: new Uint8Array(),
    delegatorSlashingSig: new Uint8Array(),
    covenantSlashingSigs: [],
    covenantUnbondingSigList: [],
  };
}
export const BTCUndelegation = {
  typeUrl: '/babylon.btcstaking.v1.BTCUndelegation',
  encode(message: BTCUndelegation, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.unbondingTx.length !== 0) {
      writer.uint32(10).bytes(message.unbondingTx);
    }
    if (message.slashingTx.length !== 0) {
      writer.uint32(18).bytes(message.slashingTx);
    }
    if (message.delegatorUnbondingSig.length !== 0) {
      writer.uint32(26).bytes(message.delegatorUnbondingSig);
    }
    if (message.delegatorSlashingSig.length !== 0) {
      writer.uint32(34).bytes(message.delegatorSlashingSig);
    }
    for (const v of message.covenantSlashingSigs) {
      CovenantAdaptorSignatures.encode(v!, writer.uint32(42).fork()).ldelim();
    }
    for (const v of message.covenantUnbondingSigList) {
      SignatureInfo.encode(v!, writer.uint32(50).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): BTCUndelegation {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBTCUndelegation();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.unbondingTx = reader.bytes();
          break;
        case 2:
          message.slashingTx = reader.bytes();
          break;
        case 3:
          message.delegatorUnbondingSig = reader.bytes();
          break;
        case 4:
          message.delegatorSlashingSig = reader.bytes();
          break;
        case 5:
          message.covenantSlashingSigs.push(CovenantAdaptorSignatures.decode(reader, reader.uint32()));
          break;
        case 6:
          message.covenantUnbondingSigList.push(SignatureInfo.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<BTCUndelegation>): BTCUndelegation {
    const message = createBaseBTCUndelegation();
    message.unbondingTx = object.unbondingTx ?? new Uint8Array();
    message.slashingTx = object.slashingTx ?? new Uint8Array();
    message.delegatorUnbondingSig = object.delegatorUnbondingSig ?? new Uint8Array();
    message.delegatorSlashingSig = object.delegatorSlashingSig ?? new Uint8Array();
    message.covenantSlashingSigs =
      object.covenantSlashingSigs?.map((e) => CovenantAdaptorSignatures.fromPartial(e)) || [];
    message.covenantUnbondingSigList = object.covenantUnbondingSigList?.map((e) => SignatureInfo.fromPartial(e)) || [];
    return message;
  },
  fromAmino(object: BTCUndelegationAmino): BTCUndelegation {
    const message = createBaseBTCUndelegation();
    if (object.unbonding_tx !== undefined && object.unbonding_tx !== null) {
      message.unbondingTx = bytesFromBase64(object.unbonding_tx);
    }
    if (object.slashing_tx !== undefined && object.slashing_tx !== null) {
      message.slashingTx = bytesFromBase64(object.slashing_tx);
    }
    if (object.delegator_unbonding_sig !== undefined && object.delegator_unbonding_sig !== null) {
      message.delegatorUnbondingSig = bytesFromBase64(object.delegator_unbonding_sig);
    }
    if (object.delegator_slashing_sig !== undefined && object.delegator_slashing_sig !== null) {
      message.delegatorSlashingSig = bytesFromBase64(object.delegator_slashing_sig);
    }
    message.covenantSlashingSigs =
      object.covenant_slashing_sigs?.map((e) => CovenantAdaptorSignatures.fromAmino(e)) || [];
    message.covenantUnbondingSigList = object.covenant_unbonding_sig_list?.map((e) => SignatureInfo.fromAmino(e)) || [];
    return message;
  },
  toAmino(message: BTCUndelegation): BTCUndelegationAmino {
    const obj: any = {};
    obj.unbonding_tx = message.unbondingTx ? base64FromBytes(message.unbondingTx) : undefined;
    obj.slashing_tx = message.slashingTx ? base64FromBytes(message.slashingTx) : undefined;
    obj.delegator_unbonding_sig = message.delegatorUnbondingSig
      ? base64FromBytes(message.delegatorUnbondingSig)
      : undefined;
    obj.delegator_slashing_sig = message.delegatorSlashingSig
      ? base64FromBytes(message.delegatorSlashingSig)
      : undefined;
    if (message.covenantSlashingSigs) {
      obj.covenant_slashing_sigs = message.covenantSlashingSigs.map((e) =>
        e ? CovenantAdaptorSignatures.toAmino(e) : undefined,
      );
    } else {
      obj.covenant_slashing_sigs = message.covenantSlashingSigs;
    }
    if (message.covenantUnbondingSigList) {
      obj.covenant_unbonding_sig_list = message.covenantUnbondingSigList.map((e) =>
        e ? SignatureInfo.toAmino(e) : undefined,
      );
    } else {
      obj.covenant_unbonding_sig_list = message.covenantUnbondingSigList;
    }
    return obj;
  },
  fromAminoMsg(object: BTCUndelegationAminoMsg): BTCUndelegation {
    return BTCUndelegation.fromAmino(object.value);
  },
  fromProtoMsg(message: BTCUndelegationProtoMsg): BTCUndelegation {
    return BTCUndelegation.decode(message.value);
  },
  toProto(message: BTCUndelegation): Uint8Array {
    return BTCUndelegation.encode(message).finish();
  },
  toProtoMsg(message: BTCUndelegation): BTCUndelegationProtoMsg {
    return {
      typeUrl: '/babylon.btcstaking.v1.BTCUndelegation',
      value: BTCUndelegation.encode(message).finish(),
    };
  },
};
function createBaseBTCDelegatorDelegations(): BTCDelegatorDelegations {
  return {
    dels: [],
  };
}
export const BTCDelegatorDelegations = {
  typeUrl: '/babylon.btcstaking.v1.BTCDelegatorDelegations',
  encode(message: BTCDelegatorDelegations, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    for (const v of message.dels) {
      BTCDelegation.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): BTCDelegatorDelegations {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBTCDelegatorDelegations();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.dels.push(BTCDelegation.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<BTCDelegatorDelegations>): BTCDelegatorDelegations {
    const message = createBaseBTCDelegatorDelegations();
    message.dels = object.dels?.map((e) => BTCDelegation.fromPartial(e)) || [];
    return message;
  },
  fromAmino(object: BTCDelegatorDelegationsAmino): BTCDelegatorDelegations {
    const message = createBaseBTCDelegatorDelegations();
    message.dels = object.dels?.map((e) => BTCDelegation.fromAmino(e)) || [];
    return message;
  },
  toAmino(message: BTCDelegatorDelegations): BTCDelegatorDelegationsAmino {
    const obj: any = {};
    if (message.dels) {
      obj.dels = message.dels.map((e) => (e ? BTCDelegation.toAmino(e) : undefined));
    } else {
      obj.dels = message.dels;
    }
    return obj;
  },
  fromAminoMsg(object: BTCDelegatorDelegationsAminoMsg): BTCDelegatorDelegations {
    return BTCDelegatorDelegations.fromAmino(object.value);
  },
  fromProtoMsg(message: BTCDelegatorDelegationsProtoMsg): BTCDelegatorDelegations {
    return BTCDelegatorDelegations.decode(message.value);
  },
  toProto(message: BTCDelegatorDelegations): Uint8Array {
    return BTCDelegatorDelegations.encode(message).finish();
  },
  toProtoMsg(message: BTCDelegatorDelegations): BTCDelegatorDelegationsProtoMsg {
    return {
      typeUrl: '/babylon.btcstaking.v1.BTCDelegatorDelegations',
      value: BTCDelegatorDelegations.encode(message).finish(),
    };
  },
};
function createBaseBTCDelegatorDelegationIndex(): BTCDelegatorDelegationIndex {
  return {
    stakingTxHashList: [],
  };
}
export const BTCDelegatorDelegationIndex = {
  typeUrl: '/babylon.btcstaking.v1.BTCDelegatorDelegationIndex',
  encode(message: BTCDelegatorDelegationIndex, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    for (const v of message.stakingTxHashList) {
      writer.uint32(10).bytes(v!);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): BTCDelegatorDelegationIndex {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBTCDelegatorDelegationIndex();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.stakingTxHashList.push(reader.bytes());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<BTCDelegatorDelegationIndex>): BTCDelegatorDelegationIndex {
    const message = createBaseBTCDelegatorDelegationIndex();
    message.stakingTxHashList = object.stakingTxHashList?.map((e) => e) || [];
    return message;
  },
  fromAmino(object: BTCDelegatorDelegationIndexAmino): BTCDelegatorDelegationIndex {
    const message = createBaseBTCDelegatorDelegationIndex();
    message.stakingTxHashList = object.staking_tx_hash_list?.map((e) => bytesFromBase64(e)) || [];
    return message;
  },
  toAmino(message: BTCDelegatorDelegationIndex): BTCDelegatorDelegationIndexAmino {
    const obj: any = {};
    if (message.stakingTxHashList) {
      obj.staking_tx_hash_list = message.stakingTxHashList.map((e) => base64FromBytes(e));
    } else {
      obj.staking_tx_hash_list = message.stakingTxHashList;
    }
    return obj;
  },
  fromAminoMsg(object: BTCDelegatorDelegationIndexAminoMsg): BTCDelegatorDelegationIndex {
    return BTCDelegatorDelegationIndex.fromAmino(object.value);
  },
  fromProtoMsg(message: BTCDelegatorDelegationIndexProtoMsg): BTCDelegatorDelegationIndex {
    return BTCDelegatorDelegationIndex.decode(message.value);
  },
  toProto(message: BTCDelegatorDelegationIndex): Uint8Array {
    return BTCDelegatorDelegationIndex.encode(message).finish();
  },
  toProtoMsg(message: BTCDelegatorDelegationIndex): BTCDelegatorDelegationIndexProtoMsg {
    return {
      typeUrl: '/babylon.btcstaking.v1.BTCDelegatorDelegationIndex',
      value: BTCDelegatorDelegationIndex.encode(message).finish(),
    };
  },
};
function createBaseSignatureInfo(): SignatureInfo {
  return {
    pk: new Uint8Array(),
    sig: new Uint8Array(),
  };
}
export const SignatureInfo = {
  typeUrl: '/babylon.btcstaking.v1.SignatureInfo',
  encode(message: SignatureInfo, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.pk.length !== 0) {
      writer.uint32(10).bytes(message.pk);
    }
    if (message.sig.length !== 0) {
      writer.uint32(18).bytes(message.sig);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): SignatureInfo {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSignatureInfo();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.pk = reader.bytes();
          break;
        case 2:
          message.sig = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<SignatureInfo>): SignatureInfo {
    const message = createBaseSignatureInfo();
    message.pk = object.pk ?? new Uint8Array();
    message.sig = object.sig ?? new Uint8Array();
    return message;
  },
  fromAmino(object: SignatureInfoAmino): SignatureInfo {
    const message = createBaseSignatureInfo();
    if (object.pk !== undefined && object.pk !== null) {
      message.pk = bytesFromBase64(object.pk);
    }
    if (object.sig !== undefined && object.sig !== null) {
      message.sig = bytesFromBase64(object.sig);
    }
    return message;
  },
  toAmino(message: SignatureInfo): SignatureInfoAmino {
    const obj: any = {};
    obj.pk = message.pk ? base64FromBytes(message.pk) : undefined;
    obj.sig = message.sig ? base64FromBytes(message.sig) : undefined;
    return obj;
  },
  fromAminoMsg(object: SignatureInfoAminoMsg): SignatureInfo {
    return SignatureInfo.fromAmino(object.value);
  },
  fromProtoMsg(message: SignatureInfoProtoMsg): SignatureInfo {
    return SignatureInfo.decode(message.value);
  },
  toProto(message: SignatureInfo): Uint8Array {
    return SignatureInfo.encode(message).finish();
  },
  toProtoMsg(message: SignatureInfo): SignatureInfoProtoMsg {
    return {
      typeUrl: '/babylon.btcstaking.v1.SignatureInfo',
      value: SignatureInfo.encode(message).finish(),
    };
  },
};
function createBaseCovenantAdaptorSignatures(): CovenantAdaptorSignatures {
  return {
    covPk: new Uint8Array(),
    adaptorSigs: [],
  };
}
export const CovenantAdaptorSignatures = {
  typeUrl: '/babylon.btcstaking.v1.CovenantAdaptorSignatures',
  encode(message: CovenantAdaptorSignatures, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.covPk.length !== 0) {
      writer.uint32(10).bytes(message.covPk);
    }
    for (const v of message.adaptorSigs) {
      writer.uint32(18).bytes(v!);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): CovenantAdaptorSignatures {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCovenantAdaptorSignatures();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.covPk = reader.bytes();
          break;
        case 2:
          message.adaptorSigs.push(reader.bytes());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<CovenantAdaptorSignatures>): CovenantAdaptorSignatures {
    const message = createBaseCovenantAdaptorSignatures();
    message.covPk = object.covPk ?? new Uint8Array();
    message.adaptorSigs = object.adaptorSigs?.map((e) => e) || [];
    return message;
  },
  fromAmino(object: CovenantAdaptorSignaturesAmino): CovenantAdaptorSignatures {
    const message = createBaseCovenantAdaptorSignatures();
    if (object.cov_pk !== undefined && object.cov_pk !== null) {
      message.covPk = bytesFromBase64(object.cov_pk);
    }
    message.adaptorSigs = object.adaptor_sigs?.map((e) => bytesFromBase64(e)) || [];
    return message;
  },
  toAmino(message: CovenantAdaptorSignatures): CovenantAdaptorSignaturesAmino {
    const obj: any = {};
    obj.cov_pk = message.covPk ? base64FromBytes(message.covPk) : undefined;
    if (message.adaptorSigs) {
      obj.adaptor_sigs = message.adaptorSigs.map((e) => base64FromBytes(e));
    } else {
      obj.adaptor_sigs = message.adaptorSigs;
    }
    return obj;
  },
  fromAminoMsg(object: CovenantAdaptorSignaturesAminoMsg): CovenantAdaptorSignatures {
    return CovenantAdaptorSignatures.fromAmino(object.value);
  },
  fromProtoMsg(message: CovenantAdaptorSignaturesProtoMsg): CovenantAdaptorSignatures {
    return CovenantAdaptorSignatures.decode(message.value);
  },
  toProto(message: CovenantAdaptorSignatures): Uint8Array {
    return CovenantAdaptorSignatures.encode(message).finish();
  },
  toProtoMsg(message: CovenantAdaptorSignatures): CovenantAdaptorSignaturesProtoMsg {
    return {
      typeUrl: '/babylon.btcstaking.v1.CovenantAdaptorSignatures',
      value: CovenantAdaptorSignatures.encode(message).finish(),
    };
  },
};
function createBaseSelectiveSlashingEvidence(): SelectiveSlashingEvidence {
  return {
    stakingTxHash: '',
    fpBtcPk: new Uint8Array(),
    recoveredFpBtcSk: new Uint8Array(),
  };
}
export const SelectiveSlashingEvidence = {
  typeUrl: '/babylon.btcstaking.v1.SelectiveSlashingEvidence',
  encode(message: SelectiveSlashingEvidence, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.stakingTxHash !== '') {
      writer.uint32(10).string(message.stakingTxHash);
    }
    if (message.fpBtcPk.length !== 0) {
      writer.uint32(18).bytes(message.fpBtcPk);
    }
    if (message.recoveredFpBtcSk.length !== 0) {
      writer.uint32(26).bytes(message.recoveredFpBtcSk);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): SelectiveSlashingEvidence {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSelectiveSlashingEvidence();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.stakingTxHash = reader.string();
          break;
        case 2:
          message.fpBtcPk = reader.bytes();
          break;
        case 3:
          message.recoveredFpBtcSk = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<SelectiveSlashingEvidence>): SelectiveSlashingEvidence {
    const message = createBaseSelectiveSlashingEvidence();
    message.stakingTxHash = object.stakingTxHash ?? '';
    message.fpBtcPk = object.fpBtcPk ?? new Uint8Array();
    message.recoveredFpBtcSk = object.recoveredFpBtcSk ?? new Uint8Array();
    return message;
  },
  fromAmino(object: SelectiveSlashingEvidenceAmino): SelectiveSlashingEvidence {
    const message = createBaseSelectiveSlashingEvidence();
    if (object.staking_tx_hash !== undefined && object.staking_tx_hash !== null) {
      message.stakingTxHash = object.staking_tx_hash;
    }
    if (object.fp_btc_pk !== undefined && object.fp_btc_pk !== null) {
      message.fpBtcPk = bytesFromBase64(object.fp_btc_pk);
    }
    if (object.recovered_fp_btc_sk !== undefined && object.recovered_fp_btc_sk !== null) {
      message.recoveredFpBtcSk = bytesFromBase64(object.recovered_fp_btc_sk);
    }
    return message;
  },
  toAmino(message: SelectiveSlashingEvidence): SelectiveSlashingEvidenceAmino {
    const obj: any = {};
    obj.staking_tx_hash = message.stakingTxHash === '' ? undefined : message.stakingTxHash;
    obj.fp_btc_pk = message.fpBtcPk ? base64FromBytes(message.fpBtcPk) : undefined;
    obj.recovered_fp_btc_sk = message.recoveredFpBtcSk ? base64FromBytes(message.recoveredFpBtcSk) : undefined;
    return obj;
  },
  fromAminoMsg(object: SelectiveSlashingEvidenceAminoMsg): SelectiveSlashingEvidence {
    return SelectiveSlashingEvidence.fromAmino(object.value);
  },
  fromProtoMsg(message: SelectiveSlashingEvidenceProtoMsg): SelectiveSlashingEvidence {
    return SelectiveSlashingEvidence.decode(message.value);
  },
  toProto(message: SelectiveSlashingEvidence): Uint8Array {
    return SelectiveSlashingEvidence.encode(message).finish();
  },
  toProtoMsg(message: SelectiveSlashingEvidence): SelectiveSlashingEvidenceProtoMsg {
    return {
      typeUrl: '/babylon.btcstaking.v1.SelectiveSlashingEvidence',
      value: SelectiveSlashingEvidence.encode(message).finish(),
    };
  },
};
