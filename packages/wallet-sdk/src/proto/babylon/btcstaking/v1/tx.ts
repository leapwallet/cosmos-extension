import { Decimal } from '@cosmjs/math';

import { BinaryReader, BinaryWriter } from '../../../binary';
import { base64FromBytes, bytesFromBase64 } from '../../../helpers';
import { TransactionInfo, TransactionInfoAmino, TransactionInfoSDKType } from '../../btccheckpoint/v1/btccheckpoint';
import { Description, DescriptionAmino, DescriptionSDKType } from '../../core-proto-ts/cosmos/staking/v1beta1/staking';
import { Params, ParamsAmino, ParamsSDKType } from './params';
import { ProofOfPossessionBTC, ProofOfPossessionBTCAmino, ProofOfPossessionBTCSDKType } from './pop';
/** MsgCreateFinalityProvider is the message for creating a finality provider */
export interface MsgCreateFinalityProvider {
  /**
   * addr defines the address of the finality provider that will receive
   * the commissions to all the delegations.
   */
  addr: string;
  /** description defines the description terms for the finality provider */
  description?: Description;
  /** commission defines the commission rate of the finality provider */
  commission: string;
  /**
   * btc_pk is the Bitcoin secp256k1 PK of this finality provider
   * the PK follows encoding in BIP-340 spec
   */
  btcPk: Uint8Array;
  /** pop is the proof of possession of btc_pk over the FP signer address. */
  pop?: ProofOfPossessionBTC;
}
export interface MsgCreateFinalityProviderProtoMsg {
  typeUrl: '/babylon.btcstaking.v1.MsgCreateFinalityProvider';
  value: Uint8Array;
}
/** MsgCreateFinalityProvider is the message for creating a finality provider */
export interface MsgCreateFinalityProviderAmino {
  /**
   * addr defines the address of the finality provider that will receive
   * the commissions to all the delegations.
   */
  addr?: string;
  /** description defines the description terms for the finality provider */
  description?: DescriptionAmino;
  /** commission defines the commission rate of the finality provider */
  commission?: string;
  /**
   * btc_pk is the Bitcoin secp256k1 PK of this finality provider
   * the PK follows encoding in BIP-340 spec
   */
  btc_pk?: string;
  /** pop is the proof of possession of btc_pk over the FP signer address. */
  pop?: ProofOfPossessionBTCAmino;
}
export interface MsgCreateFinalityProviderAminoMsg {
  type: '/babylon.btcstaking.v1.MsgCreateFinalityProvider';
  value: MsgCreateFinalityProviderAmino;
}
/** MsgCreateFinalityProvider is the message for creating a finality provider */
export interface MsgCreateFinalityProviderSDKType {
  addr: string;
  description?: DescriptionSDKType;
  commission: string;
  btc_pk: Uint8Array;
  pop?: ProofOfPossessionBTCSDKType;
}
/** MsgCreateFinalityProviderResponse is the response for MsgCreateFinalityProvider */
export interface MsgCreateFinalityProviderResponse {}
export interface MsgCreateFinalityProviderResponseProtoMsg {
  typeUrl: '/babylon.btcstaking.v1.MsgCreateFinalityProviderResponse';
  value: Uint8Array;
}
/** MsgCreateFinalityProviderResponse is the response for MsgCreateFinalityProvider */
export interface MsgCreateFinalityProviderResponseAmino {}
export interface MsgCreateFinalityProviderResponseAminoMsg {
  type: '/babylon.btcstaking.v1.MsgCreateFinalityProviderResponse';
  value: MsgCreateFinalityProviderResponseAmino;
}
/** MsgCreateFinalityProviderResponse is the response for MsgCreateFinalityProvider */
export interface MsgCreateFinalityProviderResponseSDKType {}
/** MsgEditFinalityProvider is the message for editing an existing finality provider */
export interface MsgEditFinalityProvider {
  /** addr the address of the finality provider that whishes to edit his information. */
  addr: string;
  /** btc_pk is the Bitcoin secp256k1 PK of the finality provider to be edited */
  btcPk: Uint8Array;
  /** description defines the updated description terms for the finality provider */
  description?: Description;
  /** commission defines the updated commission rate of the finality provider */
  commission: string;
}
export interface MsgEditFinalityProviderProtoMsg {
  typeUrl: '/babylon.btcstaking.v1.MsgEditFinalityProvider';
  value: Uint8Array;
}
/** MsgEditFinalityProvider is the message for editing an existing finality provider */
export interface MsgEditFinalityProviderAmino {
  /** addr the address of the finality provider that whishes to edit his information. */
  addr?: string;
  /** btc_pk is the Bitcoin secp256k1 PK of the finality provider to be edited */
  btc_pk?: string;
  /** description defines the updated description terms for the finality provider */
  description?: DescriptionAmino;
  /** commission defines the updated commission rate of the finality provider */
  commission?: string;
}
export interface MsgEditFinalityProviderAminoMsg {
  type: '/babylon.btcstaking.v1.MsgEditFinalityProvider';
  value: MsgEditFinalityProviderAmino;
}
/** MsgEditFinalityProvider is the message for editing an existing finality provider */
export interface MsgEditFinalityProviderSDKType {
  addr: string;
  btc_pk: Uint8Array;
  description?: DescriptionSDKType;
  commission: string;
}
/** MsgEditFinalityProviderResponse is the response for MsgEditFinalityProvider */
export interface MsgEditFinalityProviderResponse {}
export interface MsgEditFinalityProviderResponseProtoMsg {
  typeUrl: '/babylon.btcstaking.v1.MsgEditFinalityProviderResponse';
  value: Uint8Array;
}
/** MsgEditFinalityProviderResponse is the response for MsgEditFinalityProvider */
export interface MsgEditFinalityProviderResponseAmino {}
export interface MsgEditFinalityProviderResponseAminoMsg {
  type: '/babylon.btcstaking.v1.MsgEditFinalityProviderResponse';
  value: MsgEditFinalityProviderResponseAmino;
}
/** MsgEditFinalityProviderResponse is the response for MsgEditFinalityProvider */
export interface MsgEditFinalityProviderResponseSDKType {}
/** MsgCreateBTCDelegation is the message for creating a BTC delegation */
export interface MsgCreateBTCDelegation {
  /** staker_addr is the address to receive rewards from BTC delegation. */
  stakerAddr: string;
  /** pop is the proof of possession of btc_pk by the staker_addr. */
  pop?: ProofOfPossessionBTC;
  /** btc_pk is the Bitcoin secp256k1 PK of the BTC delegator */
  btcPk: Uint8Array;
  /**
   * fp_btc_pk_list is the list of Bitcoin secp256k1 PKs of the finality providers, if there is more than one
   * finality provider pk it means that delegation is re-staked
   */
  fpBtcPkList: Uint8Array[];
  /** staking_time is the time lock used in staking transaction */
  stakingTime: number;
  /** staking_value  is the amount of satoshis locked in staking output */
  stakingValue: bigint;
  /** staking_tx is the staking tx along with the merkle proof of inclusion in btc block */
  stakingTx?: TransactionInfo;
  /**
   * slashing_tx is the slashing tx
   * Note that the tx itself does not contain signatures, which are off-chain.
   */
  slashingTx: Uint8Array;
  /**
   * delegator_slashing_sig is the signature on the slashing tx by the delegator (i.e., SK corresponding to btc_pk).
   * It will be a part of the witness for the staking tx output.
   * The staking tx output further needs signatures from covenant and finality provider in
   * order to be spendable.
   */
  delegatorSlashingSig: Uint8Array;
  /**
   * unbonding_time is the time lock used when funds are being unbonded. It is be used in:
   * - unbonding transaction, time lock spending path
   * - staking slashing transaction, change output
   * - unbonding slashing transaction, change output
   * It must be smaller than math.MaxUInt16 and larger that max(MinUnbondingTime, CheckpointFinalizationTimeout)
   */
  unbondingTime: number;
  /**
   * fields related to unbonding transaction
   * unbonding_tx is a bitcoin unbonding transaction i.e transaction that spends
   * staking output and sends it to the unbonding output
   */
  unbondingTx: Uint8Array;
  /**
   * unbonding_value is amount of satoshis locked in unbonding output.
   * NOTE: staking_value and unbonding_value could be different because of the difference between the fee for staking tx and that for unbonding
   */
  unbondingValue: bigint;
  /**
   * unbonding_slashing_tx is the slashing tx which slash unbonding contract
   * Note that the tx itself does not contain signatures, which are off-chain.
   */
  unbondingSlashingTx: Uint8Array;
  /** delegator_unbonding_slashing_sig is the signature on the slashing tx by the delegator (i.e., SK corresponding to btc_pk). */
  delegatorUnbondingSlashingSig: Uint8Array;
}
export interface MsgCreateBTCDelegationProtoMsg {
  typeUrl: '/babylon.btcstaking.v1.MsgCreateBTCDelegation';
  value: Uint8Array;
}
/** MsgCreateBTCDelegation is the message for creating a BTC delegation */
export interface MsgCreateBTCDelegationAmino {
  /** staker_addr is the address to receive rewards from BTC delegation. */
  staker_addr?: string;
  /** pop is the proof of possession of btc_pk by the staker_addr. */
  pop?: ProofOfPossessionBTCAmino;
  /** btc_pk is the Bitcoin secp256k1 PK of the BTC delegator */
  btc_pk?: string;
  /**
   * fp_btc_pk_list is the list of Bitcoin secp256k1 PKs of the finality providers, if there is more than one
   * finality provider pk it means that delegation is re-staked
   */
  fp_btc_pk_list?: string[];
  /** staking_time is the time lock used in staking transaction */
  staking_time?: number;
  /** staking_value  is the amount of satoshis locked in staking output */
  staking_value?: string;
  /** staking_tx is the staking tx along with the merkle proof of inclusion in btc block */
  staking_tx?: TransactionInfoAmino;
  /**
   * slashing_tx is the slashing tx
   * Note that the tx itself does not contain signatures, which are off-chain.
   */
  slashing_tx?: string;
  /**
   * delegator_slashing_sig is the signature on the slashing tx by the delegator (i.e., SK corresponding to btc_pk).
   * It will be a part of the witness for the staking tx output.
   * The staking tx output further needs signatures from covenant and finality provider in
   * order to be spendable.
   */
  delegator_slashing_sig?: string;
  /**
   * unbonding_time is the time lock used when funds are being unbonded. It is be used in:
   * - unbonding transaction, time lock spending path
   * - staking slashing transaction, change output
   * - unbonding slashing transaction, change output
   * It must be smaller than math.MaxUInt16 and larger that max(MinUnbondingTime, CheckpointFinalizationTimeout)
   */
  unbonding_time?: number;
  /**
   * fields related to unbonding transaction
   * unbonding_tx is a bitcoin unbonding transaction i.e transaction that spends
   * staking output and sends it to the unbonding output
   */
  unbonding_tx?: string;
  /**
   * unbonding_value is amount of satoshis locked in unbonding output.
   * NOTE: staking_value and unbonding_value could be different because of the difference between the fee for staking tx and that for unbonding
   */
  unbonding_value?: string;
  /**
   * unbonding_slashing_tx is the slashing tx which slash unbonding contract
   * Note that the tx itself does not contain signatures, which are off-chain.
   */
  unbonding_slashing_tx?: string;
  /** delegator_unbonding_slashing_sig is the signature on the slashing tx by the delegator (i.e., SK corresponding to btc_pk). */
  delegator_unbonding_slashing_sig?: string;
}
export interface MsgCreateBTCDelegationAminoMsg {
  type: '/babylon.btcstaking.v1.MsgCreateBTCDelegation';
  value: MsgCreateBTCDelegationAmino;
}
/** MsgCreateBTCDelegation is the message for creating a BTC delegation */
export interface MsgCreateBTCDelegationSDKType {
  staker_addr: string;
  pop?: ProofOfPossessionBTCSDKType;
  btc_pk: Uint8Array;
  fp_btc_pk_list: Uint8Array[];
  staking_time: number;
  staking_value: bigint;
  staking_tx?: TransactionInfoSDKType;
  slashing_tx: Uint8Array;
  delegator_slashing_sig: Uint8Array;
  unbonding_time: number;
  unbonding_tx: Uint8Array;
  unbonding_value: bigint;
  unbonding_slashing_tx: Uint8Array;
  delegator_unbonding_slashing_sig: Uint8Array;
}
/** MsgCreateBTCDelegationResponse is the response for MsgCreateBTCDelegation */
export interface MsgCreateBTCDelegationResponse {}
export interface MsgCreateBTCDelegationResponseProtoMsg {
  typeUrl: '/babylon.btcstaking.v1.MsgCreateBTCDelegationResponse';
  value: Uint8Array;
}
/** MsgCreateBTCDelegationResponse is the response for MsgCreateBTCDelegation */
export interface MsgCreateBTCDelegationResponseAmino {}
export interface MsgCreateBTCDelegationResponseAminoMsg {
  type: '/babylon.btcstaking.v1.MsgCreateBTCDelegationResponse';
  value: MsgCreateBTCDelegationResponseAmino;
}
/** MsgCreateBTCDelegationResponse is the response for MsgCreateBTCDelegation */
export interface MsgCreateBTCDelegationResponseSDKType {}
/** MsgAddCovenantSigs is the message for handling signatures from a covenant member */
export interface MsgAddCovenantSigs {
  signer: string;
  /** pk is the BTC public key of the covenant member */
  pk: Uint8Array;
  /**
   * staking_tx_hash is the hash of the staking tx.
   * It uniquely identifies a BTC delegation
   */
  stakingTxHash: string;
  /**
   * sigs is a list of adaptor signatures of the covenant
   * the order of sigs should respect the order of finality providers
   * of the corresponding delegation
   */
  slashingTxSigs: Uint8Array[];
  /**
   * unbonding_tx_sig is the signature of the covenant on the unbonding tx submitted to babylon
   * the signature follows encoding in BIP-340 spec
   */
  unbondingTxSig: Uint8Array;
  /**
   * slashing_unbonding_tx_sigs is a list of adaptor signatures of the covenant
   * on slashing tx corresponding to unbonding tx submitted to babylon
   * the order of sigs should respect the order of finality providers
   * of the corresponding delegation
   */
  slashingUnbondingTxSigs: Uint8Array[];
}
export interface MsgAddCovenantSigsProtoMsg {
  typeUrl: '/babylon.btcstaking.v1.MsgAddCovenantSigs';
  value: Uint8Array;
}
/** MsgAddCovenantSigs is the message for handling signatures from a covenant member */
export interface MsgAddCovenantSigsAmino {
  signer?: string;
  /** pk is the BTC public key of the covenant member */
  pk?: string;
  /**
   * staking_tx_hash is the hash of the staking tx.
   * It uniquely identifies a BTC delegation
   */
  staking_tx_hash?: string;
  /**
   * sigs is a list of adaptor signatures of the covenant
   * the order of sigs should respect the order of finality providers
   * of the corresponding delegation
   */
  slashing_tx_sigs?: string[];
  /**
   * unbonding_tx_sig is the signature of the covenant on the unbonding tx submitted to babylon
   * the signature follows encoding in BIP-340 spec
   */
  unbonding_tx_sig?: string;
  /**
   * slashing_unbonding_tx_sigs is a list of adaptor signatures of the covenant
   * on slashing tx corresponding to unbonding tx submitted to babylon
   * the order of sigs should respect the order of finality providers
   * of the corresponding delegation
   */
  slashing_unbonding_tx_sigs?: string[];
}
export interface MsgAddCovenantSigsAminoMsg {
  type: '/babylon.btcstaking.v1.MsgAddCovenantSigs';
  value: MsgAddCovenantSigsAmino;
}
/** MsgAddCovenantSigs is the message for handling signatures from a covenant member */
export interface MsgAddCovenantSigsSDKType {
  signer: string;
  pk: Uint8Array;
  staking_tx_hash: string;
  slashing_tx_sigs: Uint8Array[];
  unbonding_tx_sig: Uint8Array;
  slashing_unbonding_tx_sigs: Uint8Array[];
}
/** MsgAddCovenantSigsResponse is the response for MsgAddCovenantSigs */
export interface MsgAddCovenantSigsResponse {}
export interface MsgAddCovenantSigsResponseProtoMsg {
  typeUrl: '/babylon.btcstaking.v1.MsgAddCovenantSigsResponse';
  value: Uint8Array;
}
/** MsgAddCovenantSigsResponse is the response for MsgAddCovenantSigs */
export interface MsgAddCovenantSigsResponseAmino {}
export interface MsgAddCovenantSigsResponseAminoMsg {
  type: '/babylon.btcstaking.v1.MsgAddCovenantSigsResponse';
  value: MsgAddCovenantSigsResponseAmino;
}
/** MsgAddCovenantSigsResponse is the response for MsgAddCovenantSigs */
export interface MsgAddCovenantSigsResponseSDKType {}
/**
 * MsgBTCUndelegate is the message for handling signature on unbonding tx
 * from its delegator. This signature effectively proves that the delegator
 * wants to unbond this BTC delegation
 */
export interface MsgBTCUndelegate {
  signer: string;
  /**
   * staking_tx_hash is the hash of the staking tx.
   * It uniquely identifies a BTC delegation
   */
  stakingTxHash: string;
  /**
   * unbonding_tx_sig is the signature of the staker on the unbonding tx submitted to babylon
   * the signature follows encoding in BIP-340 spec
   */
  unbondingTxSig: Uint8Array;
}
export interface MsgBTCUndelegateProtoMsg {
  typeUrl: '/babylon.btcstaking.v1.MsgBTCUndelegate';
  value: Uint8Array;
}
/**
 * MsgBTCUndelegate is the message for handling signature on unbonding tx
 * from its delegator. This signature effectively proves that the delegator
 * wants to unbond this BTC delegation
 */
export interface MsgBTCUndelegateAmino {
  signer?: string;
  /**
   * staking_tx_hash is the hash of the staking tx.
   * It uniquely identifies a BTC delegation
   */
  staking_tx_hash?: string;
  /**
   * unbonding_tx_sig is the signature of the staker on the unbonding tx submitted to babylon
   * the signature follows encoding in BIP-340 spec
   */
  unbonding_tx_sig?: string;
}
export interface MsgBTCUndelegateAminoMsg {
  type: '/babylon.btcstaking.v1.MsgBTCUndelegate';
  value: MsgBTCUndelegateAmino;
}
/**
 * MsgBTCUndelegate is the message for handling signature on unbonding tx
 * from its delegator. This signature effectively proves that the delegator
 * wants to unbond this BTC delegation
 */
export interface MsgBTCUndelegateSDKType {
  signer: string;
  staking_tx_hash: string;
  unbonding_tx_sig: Uint8Array;
}
/** MsgBTCUndelegateResponse is the response for MsgBTCUndelegate */
export interface MsgBTCUndelegateResponse {}
export interface MsgBTCUndelegateResponseProtoMsg {
  typeUrl: '/babylon.btcstaking.v1.MsgBTCUndelegateResponse';
  value: Uint8Array;
}
/** MsgBTCUndelegateResponse is the response for MsgBTCUndelegate */
export interface MsgBTCUndelegateResponseAmino {}
export interface MsgBTCUndelegateResponseAminoMsg {
  type: '/babylon.btcstaking.v1.MsgBTCUndelegateResponse';
  value: MsgBTCUndelegateResponseAmino;
}
/** MsgBTCUndelegateResponse is the response for MsgBTCUndelegate */
export interface MsgBTCUndelegateResponseSDKType {}
/**
 * MsgSelectiveSlashingEvidence is the message for handling evidence of selective slashing
 * launched by a finality provider
 */
export interface MsgSelectiveSlashingEvidence {
  signer: string;
  /**
   * staking_tx_hash is the hash of the staking tx.
   * It uniquely identifies a BTC delegation
   */
  stakingTxHash: string;
  /**
   * recovered_fp_btc_sk is the BTC SK of the finality provider who
   * launches the selective slashing offence. The SK is recovered by
   * using a covenant adaptor signature and the corresponding Schnorr
   * signature
   */
  recoveredFpBtcSk: Uint8Array;
}
export interface MsgSelectiveSlashingEvidenceProtoMsg {
  typeUrl: '/babylon.btcstaking.v1.MsgSelectiveSlashingEvidence';
  value: Uint8Array;
}
/**
 * MsgSelectiveSlashingEvidence is the message for handling evidence of selective slashing
 * launched by a finality provider
 */
export interface MsgSelectiveSlashingEvidenceAmino {
  signer?: string;
  /**
   * staking_tx_hash is the hash of the staking tx.
   * It uniquely identifies a BTC delegation
   */
  staking_tx_hash?: string;
  /**
   * recovered_fp_btc_sk is the BTC SK of the finality provider who
   * launches the selective slashing offence. The SK is recovered by
   * using a covenant adaptor signature and the corresponding Schnorr
   * signature
   */
  recovered_fp_btc_sk?: string;
}
export interface MsgSelectiveSlashingEvidenceAminoMsg {
  type: '/babylon.btcstaking.v1.MsgSelectiveSlashingEvidence';
  value: MsgSelectiveSlashingEvidenceAmino;
}
/**
 * MsgSelectiveSlashingEvidence is the message for handling evidence of selective slashing
 * launched by a finality provider
 */
export interface MsgSelectiveSlashingEvidenceSDKType {
  signer: string;
  staking_tx_hash: string;
  recovered_fp_btc_sk: Uint8Array;
}
/** MsgSelectiveSlashingEvidenceResponse is the response for MsgSelectiveSlashingEvidence */
export interface MsgSelectiveSlashingEvidenceResponse {}
export interface MsgSelectiveSlashingEvidenceResponseProtoMsg {
  typeUrl: '/babylon.btcstaking.v1.MsgSelectiveSlashingEvidenceResponse';
  value: Uint8Array;
}
/** MsgSelectiveSlashingEvidenceResponse is the response for MsgSelectiveSlashingEvidence */
export interface MsgSelectiveSlashingEvidenceResponseAmino {}
export interface MsgSelectiveSlashingEvidenceResponseAminoMsg {
  type: '/babylon.btcstaking.v1.MsgSelectiveSlashingEvidenceResponse';
  value: MsgSelectiveSlashingEvidenceResponseAmino;
}
/** MsgSelectiveSlashingEvidenceResponse is the response for MsgSelectiveSlashingEvidence */
export interface MsgSelectiveSlashingEvidenceResponseSDKType {}
/** MsgUpdateParams defines a message for updating btcstaking module parameters. */
export interface MsgUpdateParams {
  /**
   * authority is the address of the governance account.
   * just FYI: cosmos.AddressString marks that this field should use type alias
   * for AddressString instead of string, but the functionality is not yet implemented
   * in cosmos-proto
   */
  authority: string;
  /**
   * params defines the finality parameters to update.
   *
   * NOTE: All parameters must be supplied.
   */
  params: Params;
}
export interface MsgUpdateParamsProtoMsg {
  typeUrl: '/babylon.btcstaking.v1.MsgUpdateParams';
  value: Uint8Array;
}
/** MsgUpdateParams defines a message for updating btcstaking module parameters. */
export interface MsgUpdateParamsAmino {
  /**
   * authority is the address of the governance account.
   * just FYI: cosmos.AddressString marks that this field should use type alias
   * for AddressString instead of string, but the functionality is not yet implemented
   * in cosmos-proto
   */
  authority?: string;
  /**
   * params defines the finality parameters to update.
   *
   * NOTE: All parameters must be supplied.
   */
  params?: ParamsAmino;
}
export interface MsgUpdateParamsAminoMsg {
  type: '/babylon.btcstaking.v1.MsgUpdateParams';
  value: MsgUpdateParamsAmino;
}
/** MsgUpdateParams defines a message for updating btcstaking module parameters. */
export interface MsgUpdateParamsSDKType {
  authority: string;
  params: ParamsSDKType;
}
/** MsgUpdateParamsResponse is the response to the MsgUpdateParams message. */
export interface MsgUpdateParamsResponse {}
export interface MsgUpdateParamsResponseProtoMsg {
  typeUrl: '/babylon.btcstaking.v1.MsgUpdateParamsResponse';
  value: Uint8Array;
}
/** MsgUpdateParamsResponse is the response to the MsgUpdateParams message. */
export interface MsgUpdateParamsResponseAmino {}
export interface MsgUpdateParamsResponseAminoMsg {
  type: '/babylon.btcstaking.v1.MsgUpdateParamsResponse';
  value: MsgUpdateParamsResponseAmino;
}
/** MsgUpdateParamsResponse is the response to the MsgUpdateParams message. */
export interface MsgUpdateParamsResponseSDKType {}
function createBaseMsgCreateFinalityProvider(): MsgCreateFinalityProvider {
  return {
    addr: '',
    description: undefined,
    commission: '',
    btcPk: new Uint8Array(),
    pop: undefined,
  };
}
export const MsgCreateFinalityProvider = {
  typeUrl: '/babylon.btcstaking.v1.MsgCreateFinalityProvider',
  encode(message: MsgCreateFinalityProvider, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
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
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgCreateFinalityProvider {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCreateFinalityProvider();
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
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgCreateFinalityProvider>): MsgCreateFinalityProvider {
    const message = createBaseMsgCreateFinalityProvider();
    message.addr = object.addr ?? '';
    message.description =
      object.description !== undefined && object.description !== null
        ? Description.fromPartial(object.description)
        : undefined;
    message.commission = object.commission ?? '';
    message.btcPk = object.btcPk ?? new Uint8Array();
    message.pop =
      object.pop !== undefined && object.pop !== null ? ProofOfPossessionBTC.fromPartial(object.pop) : undefined;
    return message;
  },
  fromAmino(object: MsgCreateFinalityProviderAmino): MsgCreateFinalityProvider {
    const message = createBaseMsgCreateFinalityProvider();
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
    return message;
  },
  toAmino(message: MsgCreateFinalityProvider): MsgCreateFinalityProviderAmino {
    const obj: any = {};
    obj.addr = message.addr === '' ? undefined : message.addr;
    obj.description = message.description ? Description.toAmino(message.description) : undefined;
    obj.commission = message.commission === '' ? undefined : message.commission;
    obj.btc_pk = message.btcPk ? base64FromBytes(message.btcPk) : undefined;
    obj.pop = message.pop ? ProofOfPossessionBTC.toAmino(message.pop) : undefined;
    return obj;
  },
  fromAminoMsg(object: MsgCreateFinalityProviderAminoMsg): MsgCreateFinalityProvider {
    return MsgCreateFinalityProvider.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgCreateFinalityProviderProtoMsg): MsgCreateFinalityProvider {
    return MsgCreateFinalityProvider.decode(message.value);
  },
  toProto(message: MsgCreateFinalityProvider): Uint8Array {
    return MsgCreateFinalityProvider.encode(message).finish();
  },
  toProtoMsg(message: MsgCreateFinalityProvider): MsgCreateFinalityProviderProtoMsg {
    return {
      typeUrl: '/babylon.btcstaking.v1.MsgCreateFinalityProvider',
      value: MsgCreateFinalityProvider.encode(message).finish(),
    };
  },
};
function createBaseMsgCreateFinalityProviderResponse(): MsgCreateFinalityProviderResponse {
  return {};
}
export const MsgCreateFinalityProviderResponse = {
  typeUrl: '/babylon.btcstaking.v1.MsgCreateFinalityProviderResponse',
  encode(_: MsgCreateFinalityProviderResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgCreateFinalityProviderResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCreateFinalityProviderResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(_: Partial<MsgCreateFinalityProviderResponse>): MsgCreateFinalityProviderResponse {
    const message = createBaseMsgCreateFinalityProviderResponse();
    return message;
  },
  fromAmino(_: MsgCreateFinalityProviderResponseAmino): MsgCreateFinalityProviderResponse {
    const message = createBaseMsgCreateFinalityProviderResponse();
    return message;
  },
  toAmino(_: MsgCreateFinalityProviderResponse): MsgCreateFinalityProviderResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: MsgCreateFinalityProviderResponseAminoMsg): MsgCreateFinalityProviderResponse {
    return MsgCreateFinalityProviderResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgCreateFinalityProviderResponseProtoMsg): MsgCreateFinalityProviderResponse {
    return MsgCreateFinalityProviderResponse.decode(message.value);
  },
  toProto(message: MsgCreateFinalityProviderResponse): Uint8Array {
    return MsgCreateFinalityProviderResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgCreateFinalityProviderResponse): MsgCreateFinalityProviderResponseProtoMsg {
    return {
      typeUrl: '/babylon.btcstaking.v1.MsgCreateFinalityProviderResponse',
      value: MsgCreateFinalityProviderResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgEditFinalityProvider(): MsgEditFinalityProvider {
  return {
    addr: '',
    btcPk: new Uint8Array(),
    description: undefined,
    commission: '',
  };
}
export const MsgEditFinalityProvider = {
  typeUrl: '/babylon.btcstaking.v1.MsgEditFinalityProvider',
  encode(message: MsgEditFinalityProvider, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.addr !== '') {
      writer.uint32(10).string(message.addr);
    }
    if (message.btcPk.length !== 0) {
      writer.uint32(18).bytes(message.btcPk);
    }
    if (message.description !== undefined) {
      Description.encode(message.description, writer.uint32(26).fork()).ldelim();
    }
    if (message.commission !== '') {
      writer.uint32(34).string(Decimal.fromUserInput(message.commission, 18).atomics);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgEditFinalityProvider {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgEditFinalityProvider();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.addr = reader.string();
          break;
        case 2:
          message.btcPk = reader.bytes();
          break;
        case 3:
          message.description = Description.decode(reader, reader.uint32());
          break;
        case 4:
          message.commission = Decimal.fromAtomics(reader.string(), 18).toString();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgEditFinalityProvider>): MsgEditFinalityProvider {
    const message = createBaseMsgEditFinalityProvider();
    message.addr = object.addr ?? '';
    message.btcPk = object.btcPk ?? new Uint8Array();
    message.description =
      object.description !== undefined && object.description !== null
        ? Description.fromPartial(object.description)
        : undefined;
    message.commission = object.commission ?? '';
    return message;
  },
  fromAmino(object: MsgEditFinalityProviderAmino): MsgEditFinalityProvider {
    const message = createBaseMsgEditFinalityProvider();
    if (object.addr !== undefined && object.addr !== null) {
      message.addr = object.addr;
    }
    if (object.btc_pk !== undefined && object.btc_pk !== null) {
      message.btcPk = bytesFromBase64(object.btc_pk);
    }
    if (object.description !== undefined && object.description !== null) {
      message.description = Description.fromAmino(object.description);
    }
    if (object.commission !== undefined && object.commission !== null) {
      message.commission = object.commission;
    }
    return message;
  },
  toAmino(message: MsgEditFinalityProvider): MsgEditFinalityProviderAmino {
    const obj: any = {};
    obj.addr = message.addr === '' ? undefined : message.addr;
    obj.btc_pk = message.btcPk ? base64FromBytes(message.btcPk) : undefined;
    obj.description = message.description ? Description.toAmino(message.description) : undefined;
    obj.commission = message.commission === '' ? undefined : message.commission;
    return obj;
  },
  fromAminoMsg(object: MsgEditFinalityProviderAminoMsg): MsgEditFinalityProvider {
    return MsgEditFinalityProvider.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgEditFinalityProviderProtoMsg): MsgEditFinalityProvider {
    return MsgEditFinalityProvider.decode(message.value);
  },
  toProto(message: MsgEditFinalityProvider): Uint8Array {
    return MsgEditFinalityProvider.encode(message).finish();
  },
  toProtoMsg(message: MsgEditFinalityProvider): MsgEditFinalityProviderProtoMsg {
    return {
      typeUrl: '/babylon.btcstaking.v1.MsgEditFinalityProvider',
      value: MsgEditFinalityProvider.encode(message).finish(),
    };
  },
};
function createBaseMsgEditFinalityProviderResponse(): MsgEditFinalityProviderResponse {
  return {};
}
export const MsgEditFinalityProviderResponse = {
  typeUrl: '/babylon.btcstaking.v1.MsgEditFinalityProviderResponse',
  encode(_: MsgEditFinalityProviderResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgEditFinalityProviderResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgEditFinalityProviderResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(_: Partial<MsgEditFinalityProviderResponse>): MsgEditFinalityProviderResponse {
    const message = createBaseMsgEditFinalityProviderResponse();
    return message;
  },
  fromAmino(_: MsgEditFinalityProviderResponseAmino): MsgEditFinalityProviderResponse {
    const message = createBaseMsgEditFinalityProviderResponse();
    return message;
  },
  toAmino(_: MsgEditFinalityProviderResponse): MsgEditFinalityProviderResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: MsgEditFinalityProviderResponseAminoMsg): MsgEditFinalityProviderResponse {
    return MsgEditFinalityProviderResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgEditFinalityProviderResponseProtoMsg): MsgEditFinalityProviderResponse {
    return MsgEditFinalityProviderResponse.decode(message.value);
  },
  toProto(message: MsgEditFinalityProviderResponse): Uint8Array {
    return MsgEditFinalityProviderResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgEditFinalityProviderResponse): MsgEditFinalityProviderResponseProtoMsg {
    return {
      typeUrl: '/babylon.btcstaking.v1.MsgEditFinalityProviderResponse',
      value: MsgEditFinalityProviderResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgCreateBTCDelegation(): MsgCreateBTCDelegation {
  return {
    stakerAddr: '',
    pop: undefined,
    btcPk: new Uint8Array(),
    fpBtcPkList: [],
    stakingTime: 0,
    stakingValue: BigInt(0),
    stakingTx: undefined,
    slashingTx: new Uint8Array(),
    delegatorSlashingSig: new Uint8Array(),
    unbondingTime: 0,
    unbondingTx: new Uint8Array(),
    unbondingValue: BigInt(0),
    unbondingSlashingTx: new Uint8Array(),
    delegatorUnbondingSlashingSig: new Uint8Array(),
  };
}
export const MsgCreateBTCDelegation = {
  typeUrl: '/babylon.btcstaking.v1.MsgCreateBTCDelegation',
  encode(message: MsgCreateBTCDelegation, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.stakerAddr !== '') {
      writer.uint32(10).string(message.stakerAddr);
    }
    if (message.pop !== undefined) {
      ProofOfPossessionBTC.encode(message.pop, writer.uint32(18).fork()).ldelim();
    }
    if (message.btcPk.length !== 0) {
      writer.uint32(26).bytes(message.btcPk);
    }
    for (const v of message.fpBtcPkList) {
      writer.uint32(34).bytes(v!);
    }
    if (message.stakingTime !== 0) {
      writer.uint32(40).uint32(message.stakingTime);
    }
    if (message.stakingValue !== BigInt(0)) {
      writer.uint32(48).int64(message.stakingValue);
    }
    if (message.stakingTx !== undefined) {
      TransactionInfo.encode(message.stakingTx, writer.uint32(58).fork()).ldelim();
    }
    if (message.slashingTx.length !== 0) {
      writer.uint32(66).bytes(message.slashingTx);
    }
    if (message.delegatorSlashingSig.length !== 0) {
      writer.uint32(74).bytes(message.delegatorSlashingSig);
    }
    if (message.unbondingTime !== 0) {
      writer.uint32(80).uint32(message.unbondingTime);
    }
    if (message.unbondingTx.length !== 0) {
      writer.uint32(90).bytes(message.unbondingTx);
    }
    if (message.unbondingValue !== BigInt(0)) {
      writer.uint32(96).int64(message.unbondingValue);
    }
    if (message.unbondingSlashingTx.length !== 0) {
      writer.uint32(106).bytes(message.unbondingSlashingTx);
    }
    if (message.delegatorUnbondingSlashingSig.length !== 0) {
      writer.uint32(114).bytes(message.delegatorUnbondingSlashingSig);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgCreateBTCDelegation {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCreateBTCDelegation();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.stakerAddr = reader.string();
          break;
        case 2:
          message.pop = ProofOfPossessionBTC.decode(reader, reader.uint32());
          break;
        case 3:
          message.btcPk = reader.bytes();
          break;
        case 4:
          message.fpBtcPkList.push(reader.bytes());
          break;
        case 5:
          message.stakingTime = reader.uint32();
          break;
        case 6:
          message.stakingValue = reader.int64();
          break;
        case 7:
          message.stakingTx = TransactionInfo.decode(reader, reader.uint32());
          break;
        case 8:
          message.slashingTx = reader.bytes();
          break;
        case 9:
          message.delegatorSlashingSig = reader.bytes();
          break;
        case 10:
          message.unbondingTime = reader.uint32();
          break;
        case 11:
          message.unbondingTx = reader.bytes();
          break;
        case 12:
          message.unbondingValue = reader.int64();
          break;
        case 13:
          message.unbondingSlashingTx = reader.bytes();
          break;
        case 14:
          message.delegatorUnbondingSlashingSig = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgCreateBTCDelegation>): MsgCreateBTCDelegation {
    const message = createBaseMsgCreateBTCDelegation();
    message.stakerAddr = object.stakerAddr ?? '';
    message.pop =
      object.pop !== undefined && object.pop !== null ? ProofOfPossessionBTC.fromPartial(object.pop) : undefined;
    message.btcPk = object.btcPk ?? new Uint8Array();
    message.fpBtcPkList = object.fpBtcPkList?.map((e) => e) || [];
    message.stakingTime = object.stakingTime ?? 0;
    message.stakingValue =
      object.stakingValue !== undefined && object.stakingValue !== null
        ? BigInt(object.stakingValue.toString())
        : BigInt(0);
    message.stakingTx =
      object.stakingTx !== undefined && object.stakingTx !== null
        ? TransactionInfo.fromPartial(object.stakingTx)
        : undefined;
    message.slashingTx = object.slashingTx ?? new Uint8Array();
    message.delegatorSlashingSig = object.delegatorSlashingSig ?? new Uint8Array();
    message.unbondingTime = object.unbondingTime ?? 0;
    message.unbondingTx = object.unbondingTx ?? new Uint8Array();
    message.unbondingValue =
      object.unbondingValue !== undefined && object.unbondingValue !== null
        ? BigInt(object.unbondingValue.toString())
        : BigInt(0);
    message.unbondingSlashingTx = object.unbondingSlashingTx ?? new Uint8Array();
    message.delegatorUnbondingSlashingSig = object.delegatorUnbondingSlashingSig ?? new Uint8Array();
    return message;
  },
  fromAmino(object: MsgCreateBTCDelegationAmino): MsgCreateBTCDelegation {
    const message = createBaseMsgCreateBTCDelegation();
    if (object.staker_addr !== undefined && object.staker_addr !== null) {
      message.stakerAddr = object.staker_addr;
    }
    if (object.pop !== undefined && object.pop !== null) {
      message.pop = ProofOfPossessionBTC.fromAmino(object.pop);
    }
    if (object.btc_pk !== undefined && object.btc_pk !== null) {
      message.btcPk = bytesFromBase64(object.btc_pk);
    }
    message.fpBtcPkList = object.fp_btc_pk_list?.map((e) => bytesFromBase64(e)) || [];
    if (object.staking_time !== undefined && object.staking_time !== null) {
      message.stakingTime = object.staking_time;
    }
    if (object.staking_value !== undefined && object.staking_value !== null) {
      message.stakingValue = BigInt(object.staking_value);
    }
    if (object.staking_tx !== undefined && object.staking_tx !== null) {
      message.stakingTx = TransactionInfo.fromAmino(object.staking_tx);
    }
    if (object.slashing_tx !== undefined && object.slashing_tx !== null) {
      message.slashingTx = bytesFromBase64(object.slashing_tx);
    }
    if (object.delegator_slashing_sig !== undefined && object.delegator_slashing_sig !== null) {
      message.delegatorSlashingSig = bytesFromBase64(object.delegator_slashing_sig);
    }
    if (object.unbonding_time !== undefined && object.unbonding_time !== null) {
      message.unbondingTime = object.unbonding_time;
    }
    if (object.unbonding_tx !== undefined && object.unbonding_tx !== null) {
      message.unbondingTx = bytesFromBase64(object.unbonding_tx);
    }
    if (object.unbonding_value !== undefined && object.unbonding_value !== null) {
      message.unbondingValue = BigInt(object.unbonding_value);
    }
    if (object.unbonding_slashing_tx !== undefined && object.unbonding_slashing_tx !== null) {
      message.unbondingSlashingTx = bytesFromBase64(object.unbonding_slashing_tx);
    }
    if (object.delegator_unbonding_slashing_sig !== undefined && object.delegator_unbonding_slashing_sig !== null) {
      message.delegatorUnbondingSlashingSig = bytesFromBase64(object.delegator_unbonding_slashing_sig);
    }
    return message;
  },
  toAmino(message: MsgCreateBTCDelegation): MsgCreateBTCDelegationAmino {
    const obj: any = {};
    obj.staker_addr = message.stakerAddr === '' ? undefined : message.stakerAddr;
    obj.pop = message.pop ? ProofOfPossessionBTC.toAmino(message.pop) : undefined;
    obj.btc_pk = message.btcPk ? base64FromBytes(message.btcPk) : undefined;
    if (message.fpBtcPkList) {
      obj.fp_btc_pk_list = message.fpBtcPkList.map((e) => base64FromBytes(e));
    } else {
      obj.fp_btc_pk_list = message.fpBtcPkList;
    }
    obj.staking_time = message.stakingTime === 0 ? undefined : message.stakingTime;
    obj.staking_value = message.stakingValue !== BigInt(0) ? message.stakingValue?.toString() : undefined;
    obj.staking_tx = message.stakingTx ? TransactionInfo.toAmino(message.stakingTx) : undefined;
    obj.slashing_tx = message.slashingTx ? base64FromBytes(message.slashingTx) : undefined;
    obj.delegator_slashing_sig = message.delegatorSlashingSig
      ? base64FromBytes(message.delegatorSlashingSig)
      : undefined;
    obj.unbonding_time = message.unbondingTime === 0 ? undefined : message.unbondingTime;
    obj.unbonding_tx = message.unbondingTx ? base64FromBytes(message.unbondingTx) : undefined;
    obj.unbonding_value = message.unbondingValue !== BigInt(0) ? message.unbondingValue?.toString() : undefined;
    obj.unbonding_slashing_tx = message.unbondingSlashingTx ? base64FromBytes(message.unbondingSlashingTx) : undefined;
    obj.delegator_unbonding_slashing_sig = message.delegatorUnbondingSlashingSig
      ? base64FromBytes(message.delegatorUnbondingSlashingSig)
      : undefined;
    return obj;
  },
  fromAminoMsg(object: MsgCreateBTCDelegationAminoMsg): MsgCreateBTCDelegation {
    return MsgCreateBTCDelegation.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgCreateBTCDelegationProtoMsg): MsgCreateBTCDelegation {
    return MsgCreateBTCDelegation.decode(message.value);
  },
  toProto(message: MsgCreateBTCDelegation): Uint8Array {
    return MsgCreateBTCDelegation.encode(message).finish();
  },
  toProtoMsg(message: MsgCreateBTCDelegation): MsgCreateBTCDelegationProtoMsg {
    return {
      typeUrl: '/babylon.btcstaking.v1.MsgCreateBTCDelegation',
      value: MsgCreateBTCDelegation.encode(message).finish(),
    };
  },
};
function createBaseMsgCreateBTCDelegationResponse(): MsgCreateBTCDelegationResponse {
  return {};
}
export const MsgCreateBTCDelegationResponse = {
  typeUrl: '/babylon.btcstaking.v1.MsgCreateBTCDelegationResponse',
  encode(_: MsgCreateBTCDelegationResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgCreateBTCDelegationResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCreateBTCDelegationResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(_: Partial<MsgCreateBTCDelegationResponse>): MsgCreateBTCDelegationResponse {
    const message = createBaseMsgCreateBTCDelegationResponse();
    return message;
  },
  fromAmino(_: MsgCreateBTCDelegationResponseAmino): MsgCreateBTCDelegationResponse {
    const message = createBaseMsgCreateBTCDelegationResponse();
    return message;
  },
  toAmino(_: MsgCreateBTCDelegationResponse): MsgCreateBTCDelegationResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: MsgCreateBTCDelegationResponseAminoMsg): MsgCreateBTCDelegationResponse {
    return MsgCreateBTCDelegationResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgCreateBTCDelegationResponseProtoMsg): MsgCreateBTCDelegationResponse {
    return MsgCreateBTCDelegationResponse.decode(message.value);
  },
  toProto(message: MsgCreateBTCDelegationResponse): Uint8Array {
    return MsgCreateBTCDelegationResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgCreateBTCDelegationResponse): MsgCreateBTCDelegationResponseProtoMsg {
    return {
      typeUrl: '/babylon.btcstaking.v1.MsgCreateBTCDelegationResponse',
      value: MsgCreateBTCDelegationResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgAddCovenantSigs(): MsgAddCovenantSigs {
  return {
    signer: '',
    pk: new Uint8Array(),
    stakingTxHash: '',
    slashingTxSigs: [],
    unbondingTxSig: new Uint8Array(),
    slashingUnbondingTxSigs: [],
  };
}
export const MsgAddCovenantSigs = {
  typeUrl: '/babylon.btcstaking.v1.MsgAddCovenantSigs',
  encode(message: MsgAddCovenantSigs, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.signer !== '') {
      writer.uint32(10).string(message.signer);
    }
    if (message.pk.length !== 0) {
      writer.uint32(18).bytes(message.pk);
    }
    if (message.stakingTxHash !== '') {
      writer.uint32(26).string(message.stakingTxHash);
    }
    for (const v of message.slashingTxSigs) {
      writer.uint32(34).bytes(v!);
    }
    if (message.unbondingTxSig.length !== 0) {
      writer.uint32(42).bytes(message.unbondingTxSig);
    }
    for (const v of message.slashingUnbondingTxSigs) {
      writer.uint32(50).bytes(v!);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgAddCovenantSigs {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgAddCovenantSigs();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.signer = reader.string();
          break;
        case 2:
          message.pk = reader.bytes();
          break;
        case 3:
          message.stakingTxHash = reader.string();
          break;
        case 4:
          message.slashingTxSigs.push(reader.bytes());
          break;
        case 5:
          message.unbondingTxSig = reader.bytes();
          break;
        case 6:
          message.slashingUnbondingTxSigs.push(reader.bytes());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgAddCovenantSigs>): MsgAddCovenantSigs {
    const message = createBaseMsgAddCovenantSigs();
    message.signer = object.signer ?? '';
    message.pk = object.pk ?? new Uint8Array();
    message.stakingTxHash = object.stakingTxHash ?? '';
    message.slashingTxSigs = object.slashingTxSigs?.map((e) => e) || [];
    message.unbondingTxSig = object.unbondingTxSig ?? new Uint8Array();
    message.slashingUnbondingTxSigs = object.slashingUnbondingTxSigs?.map((e) => e) || [];
    return message;
  },
  fromAmino(object: MsgAddCovenantSigsAmino): MsgAddCovenantSigs {
    const message = createBaseMsgAddCovenantSigs();
    if (object.signer !== undefined && object.signer !== null) {
      message.signer = object.signer;
    }
    if (object.pk !== undefined && object.pk !== null) {
      message.pk = bytesFromBase64(object.pk);
    }
    if (object.staking_tx_hash !== undefined && object.staking_tx_hash !== null) {
      message.stakingTxHash = object.staking_tx_hash;
    }
    message.slashingTxSigs = object.slashing_tx_sigs?.map((e) => bytesFromBase64(e)) || [];
    if (object.unbonding_tx_sig !== undefined && object.unbonding_tx_sig !== null) {
      message.unbondingTxSig = bytesFromBase64(object.unbonding_tx_sig);
    }
    message.slashingUnbondingTxSigs = object.slashing_unbonding_tx_sigs?.map((e) => bytesFromBase64(e)) || [];
    return message;
  },
  toAmino(message: MsgAddCovenantSigs): MsgAddCovenantSigsAmino {
    const obj: any = {};
    obj.signer = message.signer === '' ? undefined : message.signer;
    obj.pk = message.pk ? base64FromBytes(message.pk) : undefined;
    obj.staking_tx_hash = message.stakingTxHash === '' ? undefined : message.stakingTxHash;
    if (message.slashingTxSigs) {
      obj.slashing_tx_sigs = message.slashingTxSigs.map((e) => base64FromBytes(e));
    } else {
      obj.slashing_tx_sigs = message.slashingTxSigs;
    }
    obj.unbonding_tx_sig = message.unbondingTxSig ? base64FromBytes(message.unbondingTxSig) : undefined;
    if (message.slashingUnbondingTxSigs) {
      obj.slashing_unbonding_tx_sigs = message.slashingUnbondingTxSigs.map((e) => base64FromBytes(e));
    } else {
      obj.slashing_unbonding_tx_sigs = message.slashingUnbondingTxSigs;
    }
    return obj;
  },
  fromAminoMsg(object: MsgAddCovenantSigsAminoMsg): MsgAddCovenantSigs {
    return MsgAddCovenantSigs.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgAddCovenantSigsProtoMsg): MsgAddCovenantSigs {
    return MsgAddCovenantSigs.decode(message.value);
  },
  toProto(message: MsgAddCovenantSigs): Uint8Array {
    return MsgAddCovenantSigs.encode(message).finish();
  },
  toProtoMsg(message: MsgAddCovenantSigs): MsgAddCovenantSigsProtoMsg {
    return {
      typeUrl: '/babylon.btcstaking.v1.MsgAddCovenantSigs',
      value: MsgAddCovenantSigs.encode(message).finish(),
    };
  },
};
function createBaseMsgAddCovenantSigsResponse(): MsgAddCovenantSigsResponse {
  return {};
}
export const MsgAddCovenantSigsResponse = {
  typeUrl: '/babylon.btcstaking.v1.MsgAddCovenantSigsResponse',
  encode(_: MsgAddCovenantSigsResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgAddCovenantSigsResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgAddCovenantSigsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(_: Partial<MsgAddCovenantSigsResponse>): MsgAddCovenantSigsResponse {
    const message = createBaseMsgAddCovenantSigsResponse();
    return message;
  },
  fromAmino(_: MsgAddCovenantSigsResponseAmino): MsgAddCovenantSigsResponse {
    const message = createBaseMsgAddCovenantSigsResponse();
    return message;
  },
  toAmino(_: MsgAddCovenantSigsResponse): MsgAddCovenantSigsResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: MsgAddCovenantSigsResponseAminoMsg): MsgAddCovenantSigsResponse {
    return MsgAddCovenantSigsResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgAddCovenantSigsResponseProtoMsg): MsgAddCovenantSigsResponse {
    return MsgAddCovenantSigsResponse.decode(message.value);
  },
  toProto(message: MsgAddCovenantSigsResponse): Uint8Array {
    return MsgAddCovenantSigsResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgAddCovenantSigsResponse): MsgAddCovenantSigsResponseProtoMsg {
    return {
      typeUrl: '/babylon.btcstaking.v1.MsgAddCovenantSigsResponse',
      value: MsgAddCovenantSigsResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgBTCUndelegate(): MsgBTCUndelegate {
  return {
    signer: '',
    stakingTxHash: '',
    unbondingTxSig: new Uint8Array(),
  };
}
export const MsgBTCUndelegate = {
  typeUrl: '/babylon.btcstaking.v1.MsgBTCUndelegate',
  encode(message: MsgBTCUndelegate, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.signer !== '') {
      writer.uint32(10).string(message.signer);
    }
    if (message.stakingTxHash !== '') {
      writer.uint32(18).string(message.stakingTxHash);
    }
    if (message.unbondingTxSig.length !== 0) {
      writer.uint32(26).bytes(message.unbondingTxSig);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgBTCUndelegate {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgBTCUndelegate();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.signer = reader.string();
          break;
        case 2:
          message.stakingTxHash = reader.string();
          break;
        case 3:
          message.unbondingTxSig = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgBTCUndelegate>): MsgBTCUndelegate {
    const message = createBaseMsgBTCUndelegate();
    message.signer = object.signer ?? '';
    message.stakingTxHash = object.stakingTxHash ?? '';
    message.unbondingTxSig = object.unbondingTxSig ?? new Uint8Array();
    return message;
  },
  fromAmino(object: MsgBTCUndelegateAmino): MsgBTCUndelegate {
    const message = createBaseMsgBTCUndelegate();
    if (object.signer !== undefined && object.signer !== null) {
      message.signer = object.signer;
    }
    if (object.staking_tx_hash !== undefined && object.staking_tx_hash !== null) {
      message.stakingTxHash = object.staking_tx_hash;
    }
    if (object.unbonding_tx_sig !== undefined && object.unbonding_tx_sig !== null) {
      message.unbondingTxSig = bytesFromBase64(object.unbonding_tx_sig);
    }
    return message;
  },
  toAmino(message: MsgBTCUndelegate): MsgBTCUndelegateAmino {
    const obj: any = {};
    obj.signer = message.signer === '' ? undefined : message.signer;
    obj.staking_tx_hash = message.stakingTxHash === '' ? undefined : message.stakingTxHash;
    obj.unbonding_tx_sig = message.unbondingTxSig ? base64FromBytes(message.unbondingTxSig) : undefined;
    return obj;
  },
  fromAminoMsg(object: MsgBTCUndelegateAminoMsg): MsgBTCUndelegate {
    return MsgBTCUndelegate.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgBTCUndelegateProtoMsg): MsgBTCUndelegate {
    return MsgBTCUndelegate.decode(message.value);
  },
  toProto(message: MsgBTCUndelegate): Uint8Array {
    return MsgBTCUndelegate.encode(message).finish();
  },
  toProtoMsg(message: MsgBTCUndelegate): MsgBTCUndelegateProtoMsg {
    return {
      typeUrl: '/babylon.btcstaking.v1.MsgBTCUndelegate',
      value: MsgBTCUndelegate.encode(message).finish(),
    };
  },
};
function createBaseMsgBTCUndelegateResponse(): MsgBTCUndelegateResponse {
  return {};
}
export const MsgBTCUndelegateResponse = {
  typeUrl: '/babylon.btcstaking.v1.MsgBTCUndelegateResponse',
  encode(_: MsgBTCUndelegateResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgBTCUndelegateResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgBTCUndelegateResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(_: Partial<MsgBTCUndelegateResponse>): MsgBTCUndelegateResponse {
    const message = createBaseMsgBTCUndelegateResponse();
    return message;
  },
  fromAmino(_: MsgBTCUndelegateResponseAmino): MsgBTCUndelegateResponse {
    const message = createBaseMsgBTCUndelegateResponse();
    return message;
  },
  toAmino(_: MsgBTCUndelegateResponse): MsgBTCUndelegateResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: MsgBTCUndelegateResponseAminoMsg): MsgBTCUndelegateResponse {
    return MsgBTCUndelegateResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgBTCUndelegateResponseProtoMsg): MsgBTCUndelegateResponse {
    return MsgBTCUndelegateResponse.decode(message.value);
  },
  toProto(message: MsgBTCUndelegateResponse): Uint8Array {
    return MsgBTCUndelegateResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgBTCUndelegateResponse): MsgBTCUndelegateResponseProtoMsg {
    return {
      typeUrl: '/babylon.btcstaking.v1.MsgBTCUndelegateResponse',
      value: MsgBTCUndelegateResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgSelectiveSlashingEvidence(): MsgSelectiveSlashingEvidence {
  return {
    signer: '',
    stakingTxHash: '',
    recoveredFpBtcSk: new Uint8Array(),
  };
}
export const MsgSelectiveSlashingEvidence = {
  typeUrl: '/babylon.btcstaking.v1.MsgSelectiveSlashingEvidence',
  encode(message: MsgSelectiveSlashingEvidence, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.signer !== '') {
      writer.uint32(10).string(message.signer);
    }
    if (message.stakingTxHash !== '') {
      writer.uint32(18).string(message.stakingTxHash);
    }
    if (message.recoveredFpBtcSk.length !== 0) {
      writer.uint32(26).bytes(message.recoveredFpBtcSk);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgSelectiveSlashingEvidence {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSelectiveSlashingEvidence();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.signer = reader.string();
          break;
        case 2:
          message.stakingTxHash = reader.string();
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
  fromPartial(object: Partial<MsgSelectiveSlashingEvidence>): MsgSelectiveSlashingEvidence {
    const message = createBaseMsgSelectiveSlashingEvidence();
    message.signer = object.signer ?? '';
    message.stakingTxHash = object.stakingTxHash ?? '';
    message.recoveredFpBtcSk = object.recoveredFpBtcSk ?? new Uint8Array();
    return message;
  },
  fromAmino(object: MsgSelectiveSlashingEvidenceAmino): MsgSelectiveSlashingEvidence {
    const message = createBaseMsgSelectiveSlashingEvidence();
    if (object.signer !== undefined && object.signer !== null) {
      message.signer = object.signer;
    }
    if (object.staking_tx_hash !== undefined && object.staking_tx_hash !== null) {
      message.stakingTxHash = object.staking_tx_hash;
    }
    if (object.recovered_fp_btc_sk !== undefined && object.recovered_fp_btc_sk !== null) {
      message.recoveredFpBtcSk = bytesFromBase64(object.recovered_fp_btc_sk);
    }
    return message;
  },
  toAmino(message: MsgSelectiveSlashingEvidence): MsgSelectiveSlashingEvidenceAmino {
    const obj: any = {};
    obj.signer = message.signer === '' ? undefined : message.signer;
    obj.staking_tx_hash = message.stakingTxHash === '' ? undefined : message.stakingTxHash;
    obj.recovered_fp_btc_sk = message.recoveredFpBtcSk ? base64FromBytes(message.recoveredFpBtcSk) : undefined;
    return obj;
  },
  fromAminoMsg(object: MsgSelectiveSlashingEvidenceAminoMsg): MsgSelectiveSlashingEvidence {
    return MsgSelectiveSlashingEvidence.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgSelectiveSlashingEvidenceProtoMsg): MsgSelectiveSlashingEvidence {
    return MsgSelectiveSlashingEvidence.decode(message.value);
  },
  toProto(message: MsgSelectiveSlashingEvidence): Uint8Array {
    return MsgSelectiveSlashingEvidence.encode(message).finish();
  },
  toProtoMsg(message: MsgSelectiveSlashingEvidence): MsgSelectiveSlashingEvidenceProtoMsg {
    return {
      typeUrl: '/babylon.btcstaking.v1.MsgSelectiveSlashingEvidence',
      value: MsgSelectiveSlashingEvidence.encode(message).finish(),
    };
  },
};
function createBaseMsgSelectiveSlashingEvidenceResponse(): MsgSelectiveSlashingEvidenceResponse {
  return {};
}
export const MsgSelectiveSlashingEvidenceResponse = {
  typeUrl: '/babylon.btcstaking.v1.MsgSelectiveSlashingEvidenceResponse',
  encode(_: MsgSelectiveSlashingEvidenceResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgSelectiveSlashingEvidenceResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSelectiveSlashingEvidenceResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(_: Partial<MsgSelectiveSlashingEvidenceResponse>): MsgSelectiveSlashingEvidenceResponse {
    const message = createBaseMsgSelectiveSlashingEvidenceResponse();
    return message;
  },
  fromAmino(_: MsgSelectiveSlashingEvidenceResponseAmino): MsgSelectiveSlashingEvidenceResponse {
    const message = createBaseMsgSelectiveSlashingEvidenceResponse();
    return message;
  },
  toAmino(_: MsgSelectiveSlashingEvidenceResponse): MsgSelectiveSlashingEvidenceResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: MsgSelectiveSlashingEvidenceResponseAminoMsg): MsgSelectiveSlashingEvidenceResponse {
    return MsgSelectiveSlashingEvidenceResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgSelectiveSlashingEvidenceResponseProtoMsg): MsgSelectiveSlashingEvidenceResponse {
    return MsgSelectiveSlashingEvidenceResponse.decode(message.value);
  },
  toProto(message: MsgSelectiveSlashingEvidenceResponse): Uint8Array {
    return MsgSelectiveSlashingEvidenceResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgSelectiveSlashingEvidenceResponse): MsgSelectiveSlashingEvidenceResponseProtoMsg {
    return {
      typeUrl: '/babylon.btcstaking.v1.MsgSelectiveSlashingEvidenceResponse',
      value: MsgSelectiveSlashingEvidenceResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgUpdateParams(): MsgUpdateParams {
  return {
    authority: '',
    params: Params.fromPartial({}),
  };
}
export const MsgUpdateParams = {
  typeUrl: '/babylon.btcstaking.v1.MsgUpdateParams',
  encode(message: MsgUpdateParams, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.authority !== '') {
      writer.uint32(10).string(message.authority);
    }
    if (message.params !== undefined) {
      Params.encode(message.params, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgUpdateParams {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgUpdateParams();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.authority = reader.string();
          break;
        case 2:
          message.params = Params.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgUpdateParams>): MsgUpdateParams {
    const message = createBaseMsgUpdateParams();
    message.authority = object.authority ?? '';
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    message.params =
      object.params !== undefined && object.params !== null ? Params.fromPartial(object.params) : undefined;
    return message;
  },
  fromAmino(object: MsgUpdateParamsAmino): MsgUpdateParams {
    const message = createBaseMsgUpdateParams();
    if (object.authority !== undefined && object.authority !== null) {
      message.authority = object.authority;
    }
    if (object.params !== undefined && object.params !== null) {
      message.params = Params.fromAmino(object.params);
    }
    return message;
  },
  toAmino(message: MsgUpdateParams): MsgUpdateParamsAmino {
    const obj: any = {};
    obj.authority = message.authority === '' ? undefined : message.authority;
    obj.params = message.params ? Params.toAmino(message.params) : undefined;
    return obj;
  },
  fromAminoMsg(object: MsgUpdateParamsAminoMsg): MsgUpdateParams {
    return MsgUpdateParams.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgUpdateParamsProtoMsg): MsgUpdateParams {
    return MsgUpdateParams.decode(message.value);
  },
  toProto(message: MsgUpdateParams): Uint8Array {
    return MsgUpdateParams.encode(message).finish();
  },
  toProtoMsg(message: MsgUpdateParams): MsgUpdateParamsProtoMsg {
    return {
      typeUrl: '/babylon.btcstaking.v1.MsgUpdateParams',
      value: MsgUpdateParams.encode(message).finish(),
    };
  },
};
function createBaseMsgUpdateParamsResponse(): MsgUpdateParamsResponse {
  return {};
}
export const MsgUpdateParamsResponse = {
  typeUrl: '/babylon.btcstaking.v1.MsgUpdateParamsResponse',
  encode(_: MsgUpdateParamsResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgUpdateParamsResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgUpdateParamsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(_: Partial<MsgUpdateParamsResponse>): MsgUpdateParamsResponse {
    const message = createBaseMsgUpdateParamsResponse();
    return message;
  },
  fromAmino(_: MsgUpdateParamsResponseAmino): MsgUpdateParamsResponse {
    const message = createBaseMsgUpdateParamsResponse();
    return message;
  },
  toAmino(_: MsgUpdateParamsResponse): MsgUpdateParamsResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: MsgUpdateParamsResponseAminoMsg): MsgUpdateParamsResponse {
    return MsgUpdateParamsResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgUpdateParamsResponseProtoMsg): MsgUpdateParamsResponse {
    return MsgUpdateParamsResponse.decode(message.value);
  },
  toProto(message: MsgUpdateParamsResponse): Uint8Array {
    return MsgUpdateParamsResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgUpdateParamsResponse): MsgUpdateParamsResponseProtoMsg {
    return {
      typeUrl: '/babylon.btcstaking.v1.MsgUpdateParamsResponse',
      value: MsgUpdateParamsResponse.encode(message).finish(),
    };
  },
};
