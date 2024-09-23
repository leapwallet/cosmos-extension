/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable @typescript-eslint/ban-ts-comment */
//@ts-nocheck
import { Decimal } from '@cosmjs/math';
import { Timestamp } from 'cosmjs-types/google/protobuf/timestamp';

import { BinaryReader, BinaryWriter } from '../../../../../binary';
import { base64FromBytes, bytesFromBase64, fromTimestamp, toTimestamp } from '../../../../../helpers';
import { Coin, CoinAmino, CoinSDKType } from '../../../cosmos/base/v1beta1/coin';
export interface Params {
  /** Native denom for LINK coin in the bank keeper */
  linkDenom: string;
  /** The block number interval at which payouts are made */
  payoutBlockInterval: bigint;
  /** The admin for the OCR module */
  moduleAdmin: string;
}
export interface ParamsProtoMsg {
  typeUrl: '/injective.ocr.v1beta1.Params';
  value: Uint8Array;
}
export interface ParamsAmino {
  /** Native denom for LINK coin in the bank keeper */
  link_denom?: string;
  /** The block number interval at which payouts are made */
  payout_block_interval?: string;
  /** The admin for the OCR module */
  module_admin?: string;
}
export interface ParamsAminoMsg {
  type: 'ocr/Params';
  value: ParamsAmino;
}
export interface ParamsSDKType {
  link_denom: string;
  payout_block_interval: bigint;
  module_admin: string;
}
export interface FeedConfig {
  /** signers ith element is address ith oracle uses to sign a report */
  signers: string[];
  /**
   * transmitters ith element is address ith oracle uses to transmit a report
   * via the transmit method
   */
  transmitters: string[];
  /**
   * f maximum number of faulty/dishonest oracles the protocol can tolerate
   * while still working correctly
   */
  f: number;
  /** onchain_config serialized data with reporting plugin params on chain. */
  onchainConfig: Uint8Array;
  /**
   * offchain_config_version version of the serialization format used for
   * "offchain_config" parameter
   */
  offchainConfigVersion: bigint;
  /**
   * offchain_config serialized data used by oracles to configure their offchain
   * operation
   */
  offchainConfig: Uint8Array;
  /** feed-specific params for the Cosmos module. */
  moduleParams?: ModuleParams;
}
export interface FeedConfigProtoMsg {
  typeUrl: '/injective.ocr.v1beta1.FeedConfig';
  value: Uint8Array;
}
export interface FeedConfigAmino {
  /** signers ith element is address ith oracle uses to sign a report */
  signers?: string[];
  /**
   * transmitters ith element is address ith oracle uses to transmit a report
   * via the transmit method
   */
  transmitters?: string[];
  /**
   * f maximum number of faulty/dishonest oracles the protocol can tolerate
   * while still working correctly
   */
  f?: number;
  /** onchain_config serialized data with reporting plugin params on chain. */
  onchain_config?: string;
  /**
   * offchain_config_version version of the serialization format used for
   * "offchain_config" parameter
   */
  offchain_config_version?: string;
  /**
   * offchain_config serialized data used by oracles to configure their offchain
   * operation
   */
  offchain_config?: string;
  /** feed-specific params for the Cosmos module. */
  module_params?: ModuleParamsAmino;
}
export interface FeedConfigAminoMsg {
  type: '/injective.ocr.v1beta1.FeedConfig';
  value: FeedConfigAmino;
}
export interface FeedConfigSDKType {
  signers: string[];
  transmitters: string[];
  f: number;
  onchain_config: Uint8Array;
  offchain_config_version: bigint;
  offchain_config: Uint8Array;
  module_params?: ModuleParamsSDKType;
}
export interface FeedConfigInfo {
  latestConfigDigest: Uint8Array;
  f: number;
  n: number;
  /**
   * config_count ordinal number of this config setting among all config
   * settings
   */
  configCount: bigint;
  latestConfigBlockNumber: bigint;
}
export interface FeedConfigInfoProtoMsg {
  typeUrl: '/injective.ocr.v1beta1.FeedConfigInfo';
  value: Uint8Array;
}
export interface FeedConfigInfoAmino {
  latest_config_digest?: string;
  f?: number;
  n?: number;
  /**
   * config_count ordinal number of this config setting among all config
   * settings
   */
  config_count?: string;
  latest_config_block_number?: string;
}
export interface FeedConfigInfoAminoMsg {
  type: '/injective.ocr.v1beta1.FeedConfigInfo';
  value: FeedConfigInfoAmino;
}
export interface FeedConfigInfoSDKType {
  latest_config_digest: Uint8Array;
  f: number;
  n: number;
  config_count: bigint;
  latest_config_block_number: bigint;
}
export interface ModuleParams {
  /** feed_id is an unique ID for the target of this config */
  feedId: string;
  /** lowest answer the median of a report is allowed to be */
  minAnswer: string;
  /** highest answer the median of a report is allowed to be */
  maxAnswer: string;
  /** Fixed LINK reward for each observer */
  linkPerObservation: string;
  /** Fixed LINK reward for transmitter */
  linkPerTransmission: string;
  /** Native denom for LINK coin in the bank keeper */
  linkDenom: string;
  /** Enables unique reports */
  uniqueReports: boolean;
  /**
   * short human-readable description of observable this feed's answers pertain
   * to
   */
  description: string;
  /** feed administrator */
  feedAdmin: string;
  /** feed billing administrator */
  billingAdmin: string;
}
export interface ModuleParamsProtoMsg {
  typeUrl: '/injective.ocr.v1beta1.ModuleParams';
  value: Uint8Array;
}
export interface ModuleParamsAmino {
  /** feed_id is an unique ID for the target of this config */
  feed_id?: string;
  /** lowest answer the median of a report is allowed to be */
  min_answer?: string;
  /** highest answer the median of a report is allowed to be */
  max_answer?: string;
  /** Fixed LINK reward for each observer */
  link_per_observation?: string;
  /** Fixed LINK reward for transmitter */
  link_per_transmission?: string;
  /** Native denom for LINK coin in the bank keeper */
  link_denom?: string;
  /** Enables unique reports */
  unique_reports?: boolean;
  /**
   * short human-readable description of observable this feed's answers pertain
   * to
   */
  description?: string;
  /** feed administrator */
  feed_admin?: string;
  /** feed billing administrator */
  billing_admin?: string;
}
export interface ModuleParamsAminoMsg {
  type: '/injective.ocr.v1beta1.ModuleParams';
  value: ModuleParamsAmino;
}
export interface ModuleParamsSDKType {
  feed_id: string;
  min_answer: string;
  max_answer: string;
  link_per_observation: string;
  link_per_transmission: string;
  link_denom: string;
  unique_reports: boolean;
  description: string;
  feed_admin: string;
  billing_admin: string;
}
export interface ContractConfig {
  /**
   * config_count ordinal number of this config setting among all config
   * settings
   */
  configCount: bigint;
  /** signers ith element is address ith oracle uses to sign a report */
  signers: string[];
  /**
   * transmitters ith element is address ith oracle uses to transmit a report
   * via the transmit method
   */
  transmitters: string[];
  /**
   * f maximum number of faulty/dishonest oracles the protocol can tolerate
   * while still working correctly
   */
  f: number;
  /** onchain_config serialized data with reporting plugin params on chain. */
  onchainConfig: Uint8Array;
  /**
   * offchain_config_version version of the serialization format used for
   * "offchain_config" parameter
   */
  offchainConfigVersion: bigint;
  /**
   * offchain_config serialized data used by oracles to configure their offchain
   * operation
   */
  offchainConfig: Uint8Array;
}
export interface ContractConfigProtoMsg {
  typeUrl: '/injective.ocr.v1beta1.ContractConfig';
  value: Uint8Array;
}
export interface ContractConfigAmino {
  /**
   * config_count ordinal number of this config setting among all config
   * settings
   */
  config_count?: string;
  /** signers ith element is address ith oracle uses to sign a report */
  signers?: string[];
  /**
   * transmitters ith element is address ith oracle uses to transmit a report
   * via the transmit method
   */
  transmitters?: string[];
  /**
   * f maximum number of faulty/dishonest oracles the protocol can tolerate
   * while still working correctly
   */
  f?: number;
  /** onchain_config serialized data with reporting plugin params on chain. */
  onchain_config?: string;
  /**
   * offchain_config_version version of the serialization format used for
   * "offchain_config" parameter
   */
  offchain_config_version?: string;
  /**
   * offchain_config serialized data used by oracles to configure their offchain
   * operation
   */
  offchain_config?: string;
}
export interface ContractConfigAminoMsg {
  type: '/injective.ocr.v1beta1.ContractConfig';
  value: ContractConfigAmino;
}
export interface ContractConfigSDKType {
  config_count: bigint;
  signers: string[];
  transmitters: string[];
  f: number;
  onchain_config: Uint8Array;
  offchain_config_version: bigint;
  offchain_config: Uint8Array;
}
export interface SetConfigProposal {
  $typeUrl?: '/injective.ocr.v1beta1.SetConfigProposal';
  title: string;
  description: string;
  config?: FeedConfig;
}
export interface SetConfigProposalProtoMsg {
  typeUrl: '/injective.ocr.v1beta1.SetConfigProposal';
  value: Uint8Array;
}
export interface SetConfigProposalAmino {
  title?: string;
  description?: string;
  config?: FeedConfigAmino;
}
export interface SetConfigProposalAminoMsg {
  type: 'ocr/SetConfigProposal';
  value: SetConfigProposalAmino;
}
export interface SetConfigProposalSDKType {
  $typeUrl?: '/injective.ocr.v1beta1.SetConfigProposal';
  title: string;
  description: string;
  config?: FeedConfigSDKType;
}
export interface FeedProperties {
  /** feed_id is an unique ID for the target of this config */
  feedId: string;
  /**
   * f maximum number of faulty/dishonest oracles the protocol can tolerate
   * while still working correctly
   */
  f: number;
  /** onchain_config serialized data with reporting plugin params on chain. */
  onchainConfig: Uint8Array;
  /**
   * offchain_config_version version of the serialization format used for
   * "offchain_config" parameter
   */
  offchainConfigVersion: bigint;
  /**
   * offchain_config serialized data used by oracles to configure their offchain
   * operation
   */
  offchainConfig: Uint8Array;
  /** lowest answer the median of a report is allowed to be */
  minAnswer: string;
  /** highest answer the median of a report is allowed to be */
  maxAnswer: string;
  /** Fixed LINK reward for each observer */
  linkPerObservation: string;
  /** Fixed LINK reward for transmitter */
  linkPerTransmission: string;
  /** Enables unique reports */
  uniqueReports: boolean;
  /**
   * short human-readable description of observable this feed's answers pertain
   * to
   */
  description: string;
}
export interface FeedPropertiesProtoMsg {
  typeUrl: '/injective.ocr.v1beta1.FeedProperties';
  value: Uint8Array;
}
export interface FeedPropertiesAmino {
  /** feed_id is an unique ID for the target of this config */
  feed_id?: string;
  /**
   * f maximum number of faulty/dishonest oracles the protocol can tolerate
   * while still working correctly
   */
  f?: number;
  /** onchain_config serialized data with reporting plugin params on chain. */
  onchain_config?: string;
  /**
   * offchain_config_version version of the serialization format used for
   * "offchain_config" parameter
   */
  offchain_config_version?: string;
  /**
   * offchain_config serialized data used by oracles to configure their offchain
   * operation
   */
  offchain_config?: string;
  /** lowest answer the median of a report is allowed to be */
  min_answer?: string;
  /** highest answer the median of a report is allowed to be */
  max_answer?: string;
  /** Fixed LINK reward for each observer */
  link_per_observation?: string;
  /** Fixed LINK reward for transmitter */
  link_per_transmission?: string;
  /** Enables unique reports */
  unique_reports?: boolean;
  /**
   * short human-readable description of observable this feed's answers pertain
   * to
   */
  description?: string;
}
export interface FeedPropertiesAminoMsg {
  type: '/injective.ocr.v1beta1.FeedProperties';
  value: FeedPropertiesAmino;
}
export interface FeedPropertiesSDKType {
  feed_id: string;
  f: number;
  onchain_config: Uint8Array;
  offchain_config_version: bigint;
  offchain_config: Uint8Array;
  min_answer: string;
  max_answer: string;
  link_per_observation: string;
  link_per_transmission: string;
  unique_reports: boolean;
  description: string;
}
export interface SetBatchConfigProposal {
  $typeUrl?: '/injective.ocr.v1beta1.SetBatchConfigProposal';
  title: string;
  description: string;
  /** signers ith element is address ith oracle uses to sign a report */
  signers: string[];
  /**
   * transmitters ith element is address ith oracle uses to transmit a report
   * via the transmit method
   */
  transmitters: string[];
  /** Native denom for LINK coin in the bank keeper */
  linkDenom: string;
  /** feed properties */
  feedProperties: FeedProperties[];
}
export interface SetBatchConfigProposalProtoMsg {
  typeUrl: '/injective.ocr.v1beta1.SetBatchConfigProposal';
  value: Uint8Array;
}
export interface SetBatchConfigProposalAmino {
  title?: string;
  description?: string;
  /** signers ith element is address ith oracle uses to sign a report */
  signers?: string[];
  /**
   * transmitters ith element is address ith oracle uses to transmit a report
   * via the transmit method
   */
  transmitters?: string[];
  /** Native denom for LINK coin in the bank keeper */
  link_denom?: string;
  /** feed properties */
  feed_properties?: FeedPropertiesAmino[];
}
export interface SetBatchConfigProposalAminoMsg {
  type: 'ocr/SetBatchConfigProposal';
  value: SetBatchConfigProposalAmino;
}
export interface SetBatchConfigProposalSDKType {
  $typeUrl?: '/injective.ocr.v1beta1.SetBatchConfigProposal';
  title: string;
  description: string;
  signers: string[];
  transmitters: string[];
  link_denom: string;
  feed_properties: FeedPropertiesSDKType[];
}
export interface OracleObservationsCounts {
  counts: number[];
}
export interface OracleObservationsCountsProtoMsg {
  typeUrl: '/injective.ocr.v1beta1.OracleObservationsCounts';
  value: Uint8Array;
}
export interface OracleObservationsCountsAmino {
  counts?: number[];
}
export interface OracleObservationsCountsAminoMsg {
  type: '/injective.ocr.v1beta1.OracleObservationsCounts';
  value: OracleObservationsCountsAmino;
}
export interface OracleObservationsCountsSDKType {
  counts: number[];
}
/** LINK-INJ-denominated reimbursements for gas used by transmitters. */
export interface GasReimbursements {
  reimbursements: Coin[];
}
export interface GasReimbursementsProtoMsg {
  typeUrl: '/injective.ocr.v1beta1.GasReimbursements';
  value: Uint8Array;
}
/** LINK-INJ-denominated reimbursements for gas used by transmitters. */
export interface GasReimbursementsAmino {
  reimbursements?: CoinAmino[];
}
export interface GasReimbursementsAminoMsg {
  type: '/injective.ocr.v1beta1.GasReimbursements';
  value: GasReimbursementsAmino;
}
/** LINK-INJ-denominated reimbursements for gas used by transmitters. */
export interface GasReimbursementsSDKType {
  reimbursements: CoinSDKType[];
}
export interface Payee {
  transmitterAddr: string;
  paymentAddr: string;
}
export interface PayeeProtoMsg {
  typeUrl: '/injective.ocr.v1beta1.Payee';
  value: Uint8Array;
}
export interface PayeeAmino {
  transmitter_addr?: string;
  payment_addr?: string;
}
export interface PayeeAminoMsg {
  type: '/injective.ocr.v1beta1.Payee';
  value: PayeeAmino;
}
export interface PayeeSDKType {
  transmitter_addr: string;
  payment_addr: string;
}
/**
 * Transmission records the median answer from the transmit transaction at
 * time timestamp
 */
export interface Transmission {
  answer: string;
  /** when were observations made offchain */
  observationsTimestamp: bigint;
  /** when was report received onchain */
  transmissionTimestamp: bigint;
}
export interface TransmissionProtoMsg {
  typeUrl: '/injective.ocr.v1beta1.Transmission';
  value: Uint8Array;
}
/**
 * Transmission records the median answer from the transmit transaction at
 * time timestamp
 */
export interface TransmissionAmino {
  answer?: string;
  /** when were observations made offchain */
  observations_timestamp?: string;
  /** when was report received onchain */
  transmission_timestamp?: string;
}
export interface TransmissionAminoMsg {
  type: '/injective.ocr.v1beta1.Transmission';
  value: TransmissionAmino;
}
/**
 * Transmission records the median answer from the transmit transaction at
 * time timestamp
 */
export interface TransmissionSDKType {
  answer: string;
  observations_timestamp: bigint;
  transmission_timestamp: bigint;
}
export interface EpochAndRound {
  epoch: bigint;
  round: bigint;
}
export interface EpochAndRoundProtoMsg {
  typeUrl: '/injective.ocr.v1beta1.EpochAndRound';
  value: Uint8Array;
}
export interface EpochAndRoundAmino {
  epoch?: string;
  round?: string;
}
export interface EpochAndRoundAminoMsg {
  type: '/injective.ocr.v1beta1.EpochAndRound';
  value: EpochAndRoundAmino;
}
export interface EpochAndRoundSDKType {
  epoch: bigint;
  round: bigint;
}
export interface Report {
  observationsTimestamp: bigint;
  /** ith element is the index of the ith observer */
  observers: Uint8Array;
  observations: string[];
}
export interface ReportProtoMsg {
  typeUrl: '/injective.ocr.v1beta1.Report';
  value: Uint8Array;
}
export interface ReportAmino {
  observations_timestamp?: string;
  /** ith element is the index of the ith observer */
  observers?: string;
  observations?: string[];
}
export interface ReportAminoMsg {
  type: '/injective.ocr.v1beta1.Report';
  value: ReportAmino;
}
export interface ReportSDKType {
  observations_timestamp: bigint;
  observers: Uint8Array;
  observations: string[];
}
export interface ReportToSign {
  configDigest: Uint8Array;
  epoch: bigint;
  round: bigint;
  extraHash: Uint8Array;
  /** Opaque report */
  report: Uint8Array;
}
export interface ReportToSignProtoMsg {
  typeUrl: '/injective.ocr.v1beta1.ReportToSign';
  value: Uint8Array;
}
export interface ReportToSignAmino {
  config_digest?: string;
  epoch?: string;
  round?: string;
  extra_hash?: string;
  /** Opaque report */
  report?: string;
}
export interface ReportToSignAminoMsg {
  type: '/injective.ocr.v1beta1.ReportToSign';
  value: ReportToSignAmino;
}
export interface ReportToSignSDKType {
  config_digest: Uint8Array;
  epoch: bigint;
  round: bigint;
  extra_hash: Uint8Array;
  report: Uint8Array;
}
export interface EventOraclePaid {
  transmitterAddr: string;
  payeeAddr: string;
  amount: Coin;
}
export interface EventOraclePaidProtoMsg {
  typeUrl: '/injective.ocr.v1beta1.EventOraclePaid';
  value: Uint8Array;
}
export interface EventOraclePaidAmino {
  transmitter_addr?: string;
  payee_addr?: string;
  amount?: CoinAmino;
}
export interface EventOraclePaidAminoMsg {
  type: '/injective.ocr.v1beta1.EventOraclePaid';
  value: EventOraclePaidAmino;
}
export interface EventOraclePaidSDKType {
  transmitter_addr: string;
  payee_addr: string;
  amount: CoinSDKType;
}
export interface EventAnswerUpdated {
  current: string;
  roundId: string;
  updatedAt: Date;
}
export interface EventAnswerUpdatedProtoMsg {
  typeUrl: '/injective.ocr.v1beta1.EventAnswerUpdated';
  value: Uint8Array;
}
export interface EventAnswerUpdatedAmino {
  current?: string;
  round_id?: string;
  updated_at?: string;
}
export interface EventAnswerUpdatedAminoMsg {
  type: '/injective.ocr.v1beta1.EventAnswerUpdated';
  value: EventAnswerUpdatedAmino;
}
export interface EventAnswerUpdatedSDKType {
  current: string;
  round_id: string;
  updated_at: Date;
}
export interface EventNewRound {
  roundId: string;
  /** address of starter */
  startedBy: string;
  startedAt: Date;
}
export interface EventNewRoundProtoMsg {
  typeUrl: '/injective.ocr.v1beta1.EventNewRound';
  value: Uint8Array;
}
export interface EventNewRoundAmino {
  round_id?: string;
  /** address of starter */
  started_by?: string;
  started_at?: string;
}
export interface EventNewRoundAminoMsg {
  type: '/injective.ocr.v1beta1.EventNewRound';
  value: EventNewRoundAmino;
}
export interface EventNewRoundSDKType {
  round_id: string;
  started_by: string;
  started_at: Date;
}
export interface EventTransmitted {
  configDigest: Uint8Array;
  epoch: bigint;
}
export interface EventTransmittedProtoMsg {
  typeUrl: '/injective.ocr.v1beta1.EventTransmitted';
  value: Uint8Array;
}
export interface EventTransmittedAmino {
  config_digest?: string;
  epoch?: string;
}
export interface EventTransmittedAminoMsg {
  type: '/injective.ocr.v1beta1.EventTransmitted';
  value: EventTransmittedAmino;
}
export interface EventTransmittedSDKType {
  config_digest: Uint8Array;
  epoch: bigint;
}
export interface EventNewTransmission {
  feedId: string;
  aggregatorRoundId: number;
  answer: string;
  transmitter: string;
  observationsTimestamp: bigint;
  observations: string[];
  observers: Uint8Array;
  configDigest: Uint8Array;
  epochAndRound?: EpochAndRound;
}
export interface EventNewTransmissionProtoMsg {
  typeUrl: '/injective.ocr.v1beta1.EventNewTransmission';
  value: Uint8Array;
}
export interface EventNewTransmissionAmino {
  feed_id?: string;
  aggregator_round_id?: number;
  answer?: string;
  transmitter?: string;
  observations_timestamp?: string;
  observations?: string[];
  observers?: string;
  config_digest?: string;
  epoch_and_round?: EpochAndRoundAmino;
}
export interface EventNewTransmissionAminoMsg {
  type: '/injective.ocr.v1beta1.EventNewTransmission';
  value: EventNewTransmissionAmino;
}
export interface EventNewTransmissionSDKType {
  feed_id: string;
  aggregator_round_id: number;
  answer: string;
  transmitter: string;
  observations_timestamp: bigint;
  observations: string[];
  observers: Uint8Array;
  config_digest: Uint8Array;
  epoch_and_round?: EpochAndRoundSDKType;
}
export interface EventConfigSet {
  /** hash of the config */
  configDigest: Uint8Array;
  /**
   * previous_config_block_number block in which the previous config was set, to
   * simplify historic analysis
   */
  previousConfigBlockNumber: bigint;
  config?: FeedConfig;
  configInfo?: FeedConfigInfo;
}
export interface EventConfigSetProtoMsg {
  typeUrl: '/injective.ocr.v1beta1.EventConfigSet';
  value: Uint8Array;
}
export interface EventConfigSetAmino {
  /** hash of the config */
  config_digest?: string;
  /**
   * previous_config_block_number block in which the previous config was set, to
   * simplify historic analysis
   */
  previous_config_block_number?: string;
  config?: FeedConfigAmino;
  config_info?: FeedConfigInfoAmino;
}
export interface EventConfigSetAminoMsg {
  type: '/injective.ocr.v1beta1.EventConfigSet';
  value: EventConfigSetAmino;
}
export interface EventConfigSetSDKType {
  config_digest: Uint8Array;
  previous_config_block_number: bigint;
  config?: FeedConfigSDKType;
  config_info?: FeedConfigInfoSDKType;
}
function createBaseParams(): Params {
  return {
    linkDenom: '',
    payoutBlockInterval: BigInt(0),
    moduleAdmin: '',
  };
}
export const Params = {
  typeUrl: '/injective.ocr.v1beta1.Params',
  encode(message: Params, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.linkDenom !== '') {
      writer.uint32(10).string(message.linkDenom);
    }
    if (message.payoutBlockInterval !== BigInt(0)) {
      writer.uint32(16).uint64(message.payoutBlockInterval);
    }
    if (message.moduleAdmin !== '') {
      writer.uint32(26).string(message.moduleAdmin);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): Params {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseParams();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.linkDenom = reader.string();
          break;
        case 2:
          message.payoutBlockInterval = reader.uint64();
          break;
        case 3:
          message.moduleAdmin = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<Params>): Params {
    const message = createBaseParams();
    message.linkDenom = object.linkDenom ?? '';
    message.payoutBlockInterval =
      object.payoutBlockInterval !== undefined && object.payoutBlockInterval !== null
        ? BigInt(object.payoutBlockInterval.toString())
        : BigInt(0);
    message.moduleAdmin = object.moduleAdmin ?? '';
    return message;
  },
  fromAmino(object: ParamsAmino): Params {
    const message = createBaseParams();
    if (object.link_denom !== undefined && object.link_denom !== null) {
      message.linkDenom = object.link_denom;
    }
    if (object.payout_block_interval !== undefined && object.payout_block_interval !== null) {
      message.payoutBlockInterval = BigInt(object.payout_block_interval);
    }
    if (object.module_admin !== undefined && object.module_admin !== null) {
      message.moduleAdmin = object.module_admin;
    }
    return message;
  },
  toAmino(message: Params): ParamsAmino {
    const obj: any = {};
    obj.link_denom = message.linkDenom === '' ? undefined : message.linkDenom;
    obj.payout_block_interval =
      message.payoutBlockInterval !== BigInt(0) ? (message.payoutBlockInterval?.toString)() : undefined;
    obj.module_admin = message.moduleAdmin === '' ? undefined : message.moduleAdmin;
    return obj;
  },
  fromAminoMsg(object: ParamsAminoMsg): Params {
    return Params.fromAmino(object.value);
  },
  toAminoMsg(message: Params): ParamsAminoMsg {
    return {
      type: 'ocr/Params',
      value: Params.toAmino(message),
    };
  },
  fromProtoMsg(message: ParamsProtoMsg): Params {
    return Params.decode(message.value);
  },
  toProto(message: Params): Uint8Array {
    return Params.encode(message).finish();
  },
  toProtoMsg(message: Params): ParamsProtoMsg {
    return {
      typeUrl: '/injective.ocr.v1beta1.Params',
      value: Params.encode(message).finish(),
    };
  },
};
function createBaseFeedConfig(): FeedConfig {
  return {
    signers: [],
    transmitters: [],
    f: 0,
    onchainConfig: new Uint8Array(),
    offchainConfigVersion: BigInt(0),
    offchainConfig: new Uint8Array(),
    moduleParams: undefined,
  };
}
export const FeedConfig = {
  typeUrl: '/injective.ocr.v1beta1.FeedConfig',
  encode(message: FeedConfig, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    for (const v of message.signers) {
      writer.uint32(10).string(v!);
    }
    for (const v of message.transmitters) {
      writer.uint32(18).string(v!);
    }
    if (message.f !== 0) {
      writer.uint32(24).uint32(message.f);
    }
    if (message.onchainConfig.length !== 0) {
      writer.uint32(34).bytes(message.onchainConfig);
    }
    if (message.offchainConfigVersion !== BigInt(0)) {
      writer.uint32(40).uint64(message.offchainConfigVersion);
    }
    if (message.offchainConfig.length !== 0) {
      writer.uint32(50).bytes(message.offchainConfig);
    }
    if (message.moduleParams !== undefined) {
      ModuleParams.encode(message.moduleParams, writer.uint32(58).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): FeedConfig {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseFeedConfig();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.signers.push(reader.string());
          break;
        case 2:
          message.transmitters.push(reader.string());
          break;
        case 3:
          message.f = reader.uint32();
          break;
        case 4:
          message.onchainConfig = reader.bytes();
          break;
        case 5:
          message.offchainConfigVersion = reader.uint64();
          break;
        case 6:
          message.offchainConfig = reader.bytes();
          break;
        case 7:
          message.moduleParams = ModuleParams.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<FeedConfig>): FeedConfig {
    const message = createBaseFeedConfig();
    message.signers = object.signers?.map((e) => e) || [];
    message.transmitters = object.transmitters?.map((e) => e) || [];
    message.f = object.f ?? 0;
    message.onchainConfig = object.onchainConfig ?? new Uint8Array();
    message.offchainConfigVersion =
      object.offchainConfigVersion !== undefined && object.offchainConfigVersion !== null
        ? BigInt(object.offchainConfigVersion.toString())
        : BigInt(0);
    message.offchainConfig = object.offchainConfig ?? new Uint8Array();
    message.moduleParams =
      object.moduleParams !== undefined && object.moduleParams !== null
        ? ModuleParams.fromPartial(object.moduleParams)
        : undefined;
    return message;
  },
  fromAmino(object: FeedConfigAmino): FeedConfig {
    const message = createBaseFeedConfig();
    message.signers = object.signers?.map((e) => e) || [];
    message.transmitters = object.transmitters?.map((e) => e) || [];
    if (object.f !== undefined && object.f !== null) {
      message.f = object.f;
    }
    if (object.onchain_config !== undefined && object.onchain_config !== null) {
      message.onchainConfig = bytesFromBase64(object.onchain_config);
    }
    if (object.offchain_config_version !== undefined && object.offchain_config_version !== null) {
      message.offchainConfigVersion = BigInt(object.offchain_config_version);
    }
    if (object.offchain_config !== undefined && object.offchain_config !== null) {
      message.offchainConfig = bytesFromBase64(object.offchain_config);
    }
    if (object.module_params !== undefined && object.module_params !== null) {
      message.moduleParams = ModuleParams.fromAmino(object.module_params);
    }
    return message;
  },
  toAmino(message: FeedConfig): FeedConfigAmino {
    const obj: any = {};
    if (message.signers) {
      obj.signers = message.signers.map((e) => e);
    } else {
      obj.signers = message.signers;
    }
    if (message.transmitters) {
      obj.transmitters = message.transmitters.map((e) => e);
    } else {
      obj.transmitters = message.transmitters;
    }
    obj.f = message.f === 0 ? undefined : message.f;
    obj.onchain_config = message.onchainConfig ? base64FromBytes(message.onchainConfig) : undefined;
    obj.offchain_config_version =
      message.offchainConfigVersion !== BigInt(0) ? (message.offchainConfigVersion?.toString)() : undefined;
    obj.offchain_config = message.offchainConfig ? base64FromBytes(message.offchainConfig) : undefined;
    obj.module_params = message.moduleParams ? ModuleParams.toAmino(message.moduleParams) : undefined;
    return obj;
  },
  fromAminoMsg(object: FeedConfigAminoMsg): FeedConfig {
    return FeedConfig.fromAmino(object.value);
  },
  fromProtoMsg(message: FeedConfigProtoMsg): FeedConfig {
    return FeedConfig.decode(message.value);
  },
  toProto(message: FeedConfig): Uint8Array {
    return FeedConfig.encode(message).finish();
  },
  toProtoMsg(message: FeedConfig): FeedConfigProtoMsg {
    return {
      typeUrl: '/injective.ocr.v1beta1.FeedConfig',
      value: FeedConfig.encode(message).finish(),
    };
  },
};
function createBaseFeedConfigInfo(): FeedConfigInfo {
  return {
    latestConfigDigest: new Uint8Array(),
    f: 0,
    n: 0,
    configCount: BigInt(0),
    latestConfigBlockNumber: BigInt(0),
  };
}
export const FeedConfigInfo = {
  typeUrl: '/injective.ocr.v1beta1.FeedConfigInfo',
  encode(message: FeedConfigInfo, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.latestConfigDigest.length !== 0) {
      writer.uint32(10).bytes(message.latestConfigDigest);
    }
    if (message.f !== 0) {
      writer.uint32(16).uint32(message.f);
    }
    if (message.n !== 0) {
      writer.uint32(24).uint32(message.n);
    }
    if (message.configCount !== BigInt(0)) {
      writer.uint32(32).uint64(message.configCount);
    }
    if (message.latestConfigBlockNumber !== BigInt(0)) {
      writer.uint32(40).int64(message.latestConfigBlockNumber);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): FeedConfigInfo {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseFeedConfigInfo();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.latestConfigDigest = reader.bytes();
          break;
        case 2:
          message.f = reader.uint32();
          break;
        case 3:
          message.n = reader.uint32();
          break;
        case 4:
          message.configCount = reader.uint64();
          break;
        case 5:
          message.latestConfigBlockNumber = reader.int64();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<FeedConfigInfo>): FeedConfigInfo {
    const message = createBaseFeedConfigInfo();
    message.latestConfigDigest = object.latestConfigDigest ?? new Uint8Array();
    message.f = object.f ?? 0;
    message.n = object.n ?? 0;
    message.configCount =
      object.configCount !== undefined && object.configCount !== null
        ? BigInt(object.configCount.toString())
        : BigInt(0);
    message.latestConfigBlockNumber =
      object.latestConfigBlockNumber !== undefined && object.latestConfigBlockNumber !== null
        ? BigInt(object.latestConfigBlockNumber.toString())
        : BigInt(0);
    return message;
  },
  fromAmino(object: FeedConfigInfoAmino): FeedConfigInfo {
    const message = createBaseFeedConfigInfo();
    if (object.latest_config_digest !== undefined && object.latest_config_digest !== null) {
      message.latestConfigDigest = bytesFromBase64(object.latest_config_digest);
    }
    if (object.f !== undefined && object.f !== null) {
      message.f = object.f;
    }
    if (object.n !== undefined && object.n !== null) {
      message.n = object.n;
    }
    if (object.config_count !== undefined && object.config_count !== null) {
      message.configCount = BigInt(object.config_count);
    }
    if (object.latest_config_block_number !== undefined && object.latest_config_block_number !== null) {
      message.latestConfigBlockNumber = BigInt(object.latest_config_block_number);
    }
    return message;
  },
  toAmino(message: FeedConfigInfo): FeedConfigInfoAmino {
    const obj: any = {};
    obj.latest_config_digest = message.latestConfigDigest ? base64FromBytes(message.latestConfigDigest) : undefined;
    obj.f = message.f === 0 ? undefined : message.f;
    obj.n = message.n === 0 ? undefined : message.n;
    obj.config_count = message.configCount !== BigInt(0) ? (message.configCount?.toString)() : undefined;
    obj.latest_config_block_number =
      message.latestConfigBlockNumber !== BigInt(0) ? (message.latestConfigBlockNumber?.toString)() : undefined;
    return obj;
  },
  fromAminoMsg(object: FeedConfigInfoAminoMsg): FeedConfigInfo {
    return FeedConfigInfo.fromAmino(object.value);
  },
  fromProtoMsg(message: FeedConfigInfoProtoMsg): FeedConfigInfo {
    return FeedConfigInfo.decode(message.value);
  },
  toProto(message: FeedConfigInfo): Uint8Array {
    return FeedConfigInfo.encode(message).finish();
  },
  toProtoMsg(message: FeedConfigInfo): FeedConfigInfoProtoMsg {
    return {
      typeUrl: '/injective.ocr.v1beta1.FeedConfigInfo',
      value: FeedConfigInfo.encode(message).finish(),
    };
  },
};
function createBaseModuleParams(): ModuleParams {
  return {
    feedId: '',
    minAnswer: '',
    maxAnswer: '',
    linkPerObservation: '',
    linkPerTransmission: '',
    linkDenom: '',
    uniqueReports: false,
    description: '',
    feedAdmin: '',
    billingAdmin: '',
  };
}
export const ModuleParams = {
  typeUrl: '/injective.ocr.v1beta1.ModuleParams',
  encode(message: ModuleParams, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.feedId !== '') {
      writer.uint32(10).string(message.feedId);
    }
    if (message.minAnswer !== '') {
      writer.uint32(18).string(Decimal.fromUserInput(message.minAnswer, 18).atomics);
    }
    if (message.maxAnswer !== '') {
      writer.uint32(26).string(Decimal.fromUserInput(message.maxAnswer, 18).atomics);
    }
    if (message.linkPerObservation !== '') {
      writer.uint32(34).string(message.linkPerObservation);
    }
    if (message.linkPerTransmission !== '') {
      writer.uint32(42).string(message.linkPerTransmission);
    }
    if (message.linkDenom !== '') {
      writer.uint32(50).string(message.linkDenom);
    }
    if (message.uniqueReports === true) {
      writer.uint32(56).bool(message.uniqueReports);
    }
    if (message.description !== '') {
      writer.uint32(66).string(message.description);
    }
    if (message.feedAdmin !== '') {
      writer.uint32(74).string(message.feedAdmin);
    }
    if (message.billingAdmin !== '') {
      writer.uint32(82).string(message.billingAdmin);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): ModuleParams {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseModuleParams();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.feedId = reader.string();
          break;
        case 2:
          message.minAnswer = Decimal.fromAtomics(reader.string(), 18).toString();
          break;
        case 3:
          message.maxAnswer = Decimal.fromAtomics(reader.string(), 18).toString();
          break;
        case 4:
          message.linkPerObservation = reader.string();
          break;
        case 5:
          message.linkPerTransmission = reader.string();
          break;
        case 6:
          message.linkDenom = reader.string();
          break;
        case 7:
          message.uniqueReports = reader.bool();
          break;
        case 8:
          message.description = reader.string();
          break;
        case 9:
          message.feedAdmin = reader.string();
          break;
        case 10:
          message.billingAdmin = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<ModuleParams>): ModuleParams {
    const message = createBaseModuleParams();
    message.feedId = object.feedId ?? '';
    message.minAnswer = object.minAnswer ?? '';
    message.maxAnswer = object.maxAnswer ?? '';
    message.linkPerObservation = object.linkPerObservation ?? '';
    message.linkPerTransmission = object.linkPerTransmission ?? '';
    message.linkDenom = object.linkDenom ?? '';
    message.uniqueReports = object.uniqueReports ?? false;
    message.description = object.description ?? '';
    message.feedAdmin = object.feedAdmin ?? '';
    message.billingAdmin = object.billingAdmin ?? '';
    return message;
  },
  fromAmino(object: ModuleParamsAmino): ModuleParams {
    const message = createBaseModuleParams();
    if (object.feed_id !== undefined && object.feed_id !== null) {
      message.feedId = object.feed_id;
    }
    if (object.min_answer !== undefined && object.min_answer !== null) {
      message.minAnswer = object.min_answer;
    }
    if (object.max_answer !== undefined && object.max_answer !== null) {
      message.maxAnswer = object.max_answer;
    }
    if (object.link_per_observation !== undefined && object.link_per_observation !== null) {
      message.linkPerObservation = object.link_per_observation;
    }
    if (object.link_per_transmission !== undefined && object.link_per_transmission !== null) {
      message.linkPerTransmission = object.link_per_transmission;
    }
    if (object.link_denom !== undefined && object.link_denom !== null) {
      message.linkDenom = object.link_denom;
    }
    if (object.unique_reports !== undefined && object.unique_reports !== null) {
      message.uniqueReports = object.unique_reports;
    }
    if (object.description !== undefined && object.description !== null) {
      message.description = object.description;
    }
    if (object.feed_admin !== undefined && object.feed_admin !== null) {
      message.feedAdmin = object.feed_admin;
    }
    if (object.billing_admin !== undefined && object.billing_admin !== null) {
      message.billingAdmin = object.billing_admin;
    }
    return message;
  },
  toAmino(message: ModuleParams): ModuleParamsAmino {
    const obj: any = {};
    obj.feed_id = message.feedId === '' ? undefined : message.feedId;
    obj.min_answer = message.minAnswer === '' ? undefined : message.minAnswer;
    obj.max_answer = message.maxAnswer === '' ? undefined : message.maxAnswer;
    obj.link_per_observation = message.linkPerObservation === '' ? undefined : message.linkPerObservation;
    obj.link_per_transmission = message.linkPerTransmission === '' ? undefined : message.linkPerTransmission;
    obj.link_denom = message.linkDenom === '' ? undefined : message.linkDenom;
    obj.unique_reports = message.uniqueReports === false ? undefined : message.uniqueReports;
    obj.description = message.description === '' ? undefined : message.description;
    obj.feed_admin = message.feedAdmin === '' ? undefined : message.feedAdmin;
    obj.billing_admin = message.billingAdmin === '' ? undefined : message.billingAdmin;
    return obj;
  },
  fromAminoMsg(object: ModuleParamsAminoMsg): ModuleParams {
    return ModuleParams.fromAmino(object.value);
  },
  fromProtoMsg(message: ModuleParamsProtoMsg): ModuleParams {
    return ModuleParams.decode(message.value);
  },
  toProto(message: ModuleParams): Uint8Array {
    return ModuleParams.encode(message).finish();
  },
  toProtoMsg(message: ModuleParams): ModuleParamsProtoMsg {
    return {
      typeUrl: '/injective.ocr.v1beta1.ModuleParams',
      value: ModuleParams.encode(message).finish(),
    };
  },
};
function createBaseContractConfig(): ContractConfig {
  return {
    configCount: BigInt(0),
    signers: [],
    transmitters: [],
    f: 0,
    onchainConfig: new Uint8Array(),
    offchainConfigVersion: BigInt(0),
    offchainConfig: new Uint8Array(),
  };
}
export const ContractConfig = {
  typeUrl: '/injective.ocr.v1beta1.ContractConfig',
  encode(message: ContractConfig, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.configCount !== BigInt(0)) {
      writer.uint32(8).uint64(message.configCount);
    }
    for (const v of message.signers) {
      writer.uint32(18).string(v!);
    }
    for (const v of message.transmitters) {
      writer.uint32(26).string(v!);
    }
    if (message.f !== 0) {
      writer.uint32(32).uint32(message.f);
    }
    if (message.onchainConfig.length !== 0) {
      writer.uint32(42).bytes(message.onchainConfig);
    }
    if (message.offchainConfigVersion !== BigInt(0)) {
      writer.uint32(48).uint64(message.offchainConfigVersion);
    }
    if (message.offchainConfig.length !== 0) {
      writer.uint32(58).bytes(message.offchainConfig);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): ContractConfig {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseContractConfig();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.configCount = reader.uint64();
          break;
        case 2:
          message.signers.push(reader.string());
          break;
        case 3:
          message.transmitters.push(reader.string());
          break;
        case 4:
          message.f = reader.uint32();
          break;
        case 5:
          message.onchainConfig = reader.bytes();
          break;
        case 6:
          message.offchainConfigVersion = reader.uint64();
          break;
        case 7:
          message.offchainConfig = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<ContractConfig>): ContractConfig {
    const message = createBaseContractConfig();
    message.configCount =
      object.configCount !== undefined && object.configCount !== null
        ? BigInt(object.configCount.toString())
        : BigInt(0);
    message.signers = object.signers?.map((e) => e) || [];
    message.transmitters = object.transmitters?.map((e) => e) || [];
    message.f = object.f ?? 0;
    message.onchainConfig = object.onchainConfig ?? new Uint8Array();
    message.offchainConfigVersion =
      object.offchainConfigVersion !== undefined && object.offchainConfigVersion !== null
        ? BigInt(object.offchainConfigVersion.toString())
        : BigInt(0);
    message.offchainConfig = object.offchainConfig ?? new Uint8Array();
    return message;
  },
  fromAmino(object: ContractConfigAmino): ContractConfig {
    const message = createBaseContractConfig();
    if (object.config_count !== undefined && object.config_count !== null) {
      message.configCount = BigInt(object.config_count);
    }
    message.signers = object.signers?.map((e) => e) || [];
    message.transmitters = object.transmitters?.map((e) => e) || [];
    if (object.f !== undefined && object.f !== null) {
      message.f = object.f;
    }
    if (object.onchain_config !== undefined && object.onchain_config !== null) {
      message.onchainConfig = bytesFromBase64(object.onchain_config);
    }
    if (object.offchain_config_version !== undefined && object.offchain_config_version !== null) {
      message.offchainConfigVersion = BigInt(object.offchain_config_version);
    }
    if (object.offchain_config !== undefined && object.offchain_config !== null) {
      message.offchainConfig = bytesFromBase64(object.offchain_config);
    }
    return message;
  },
  toAmino(message: ContractConfig): ContractConfigAmino {
    const obj: any = {};
    obj.config_count = message.configCount !== BigInt(0) ? (message.configCount?.toString)() : undefined;
    if (message.signers) {
      obj.signers = message.signers.map((e) => e);
    } else {
      obj.signers = message.signers;
    }
    if (message.transmitters) {
      obj.transmitters = message.transmitters.map((e) => e);
    } else {
      obj.transmitters = message.transmitters;
    }
    obj.f = message.f === 0 ? undefined : message.f;
    obj.onchain_config = message.onchainConfig ? base64FromBytes(message.onchainConfig) : undefined;
    obj.offchain_config_version =
      message.offchainConfigVersion !== BigInt(0) ? (message.offchainConfigVersion?.toString)() : undefined;
    obj.offchain_config = message.offchainConfig ? base64FromBytes(message.offchainConfig) : undefined;
    return obj;
  },
  fromAminoMsg(object: ContractConfigAminoMsg): ContractConfig {
    return ContractConfig.fromAmino(object.value);
  },
  fromProtoMsg(message: ContractConfigProtoMsg): ContractConfig {
    return ContractConfig.decode(message.value);
  },
  toProto(message: ContractConfig): Uint8Array {
    return ContractConfig.encode(message).finish();
  },
  toProtoMsg(message: ContractConfig): ContractConfigProtoMsg {
    return {
      typeUrl: '/injective.ocr.v1beta1.ContractConfig',
      value: ContractConfig.encode(message).finish(),
    };
  },
};
function createBaseSetConfigProposal(): SetConfigProposal {
  return {
    $typeUrl: '/injective.ocr.v1beta1.SetConfigProposal',
    title: '',
    description: '',
    config: undefined,
  };
}
export const SetConfigProposal = {
  typeUrl: '/injective.ocr.v1beta1.SetConfigProposal',
  encode(message: SetConfigProposal, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.title !== '') {
      writer.uint32(10).string(message.title);
    }
    if (message.description !== '') {
      writer.uint32(18).string(message.description);
    }
    if (message.config !== undefined) {
      FeedConfig.encode(message.config, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): SetConfigProposal {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSetConfigProposal();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.title = reader.string();
          break;
        case 2:
          message.description = reader.string();
          break;
        case 3:
          message.config = FeedConfig.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<SetConfigProposal>): SetConfigProposal {
    const message = createBaseSetConfigProposal();
    message.title = object.title ?? '';
    message.description = object.description ?? '';
    message.config =
      object.config !== undefined && object.config !== null ? FeedConfig.fromPartial(object.config) : undefined;
    return message;
  },
  fromAmino(object: SetConfigProposalAmino): SetConfigProposal {
    const message = createBaseSetConfigProposal();
    if (object.title !== undefined && object.title !== null) {
      message.title = object.title;
    }
    if (object.description !== undefined && object.description !== null) {
      message.description = object.description;
    }
    if (object.config !== undefined && object.config !== null) {
      message.config = FeedConfig.fromAmino(object.config);
    }
    return message;
  },
  toAmino(message: SetConfigProposal): SetConfigProposalAmino {
    const obj: any = {};
    obj.title = message.title === '' ? undefined : message.title;
    obj.description = message.description === '' ? undefined : message.description;
    obj.config = message.config ? FeedConfig.toAmino(message.config) : undefined;
    return obj;
  },
  fromAminoMsg(object: SetConfigProposalAminoMsg): SetConfigProposal {
    return SetConfigProposal.fromAmino(object.value);
  },
  toAminoMsg(message: SetConfigProposal): SetConfigProposalAminoMsg {
    return {
      type: 'ocr/SetConfigProposal',
      value: SetConfigProposal.toAmino(message),
    };
  },
  fromProtoMsg(message: SetConfigProposalProtoMsg): SetConfigProposal {
    return SetConfigProposal.decode(message.value);
  },
  toProto(message: SetConfigProposal): Uint8Array {
    return SetConfigProposal.encode(message).finish();
  },
  toProtoMsg(message: SetConfigProposal): SetConfigProposalProtoMsg {
    return {
      typeUrl: '/injective.ocr.v1beta1.SetConfigProposal',
      value: SetConfigProposal.encode(message).finish(),
    };
  },
};
function createBaseFeedProperties(): FeedProperties {
  return {
    feedId: '',
    f: 0,
    onchainConfig: new Uint8Array(),
    offchainConfigVersion: BigInt(0),
    offchainConfig: new Uint8Array(),
    minAnswer: '',
    maxAnswer: '',
    linkPerObservation: '',
    linkPerTransmission: '',
    uniqueReports: false,
    description: '',
  };
}
export const FeedProperties = {
  typeUrl: '/injective.ocr.v1beta1.FeedProperties',
  encode(message: FeedProperties, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.feedId !== '') {
      writer.uint32(10).string(message.feedId);
    }
    if (message.f !== 0) {
      writer.uint32(16).uint32(message.f);
    }
    if (message.onchainConfig.length !== 0) {
      writer.uint32(26).bytes(message.onchainConfig);
    }
    if (message.offchainConfigVersion !== BigInt(0)) {
      writer.uint32(32).uint64(message.offchainConfigVersion);
    }
    if (message.offchainConfig.length !== 0) {
      writer.uint32(42).bytes(message.offchainConfig);
    }
    if (message.minAnswer !== '') {
      writer.uint32(50).string(Decimal.fromUserInput(message.minAnswer, 18).atomics);
    }
    if (message.maxAnswer !== '') {
      writer.uint32(58).string(Decimal.fromUserInput(message.maxAnswer, 18).atomics);
    }
    if (message.linkPerObservation !== '') {
      writer.uint32(66).string(message.linkPerObservation);
    }
    if (message.linkPerTransmission !== '') {
      writer.uint32(74).string(message.linkPerTransmission);
    }
    if (message.uniqueReports === true) {
      writer.uint32(80).bool(message.uniqueReports);
    }
    if (message.description !== '') {
      writer.uint32(90).string(message.description);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): FeedProperties {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseFeedProperties();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.feedId = reader.string();
          break;
        case 2:
          message.f = reader.uint32();
          break;
        case 3:
          message.onchainConfig = reader.bytes();
          break;
        case 4:
          message.offchainConfigVersion = reader.uint64();
          break;
        case 5:
          message.offchainConfig = reader.bytes();
          break;
        case 6:
          message.minAnswer = Decimal.fromAtomics(reader.string(), 18).toString();
          break;
        case 7:
          message.maxAnswer = Decimal.fromAtomics(reader.string(), 18).toString();
          break;
        case 8:
          message.linkPerObservation = reader.string();
          break;
        case 9:
          message.linkPerTransmission = reader.string();
          break;
        case 10:
          message.uniqueReports = reader.bool();
          break;
        case 11:
          message.description = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<FeedProperties>): FeedProperties {
    const message = createBaseFeedProperties();
    message.feedId = object.feedId ?? '';
    message.f = object.f ?? 0;
    message.onchainConfig = object.onchainConfig ?? new Uint8Array();
    message.offchainConfigVersion =
      object.offchainConfigVersion !== undefined && object.offchainConfigVersion !== null
        ? BigInt(object.offchainConfigVersion.toString())
        : BigInt(0);
    message.offchainConfig = object.offchainConfig ?? new Uint8Array();
    message.minAnswer = object.minAnswer ?? '';
    message.maxAnswer = object.maxAnswer ?? '';
    message.linkPerObservation = object.linkPerObservation ?? '';
    message.linkPerTransmission = object.linkPerTransmission ?? '';
    message.uniqueReports = object.uniqueReports ?? false;
    message.description = object.description ?? '';
    return message;
  },
  fromAmino(object: FeedPropertiesAmino): FeedProperties {
    const message = createBaseFeedProperties();
    if (object.feed_id !== undefined && object.feed_id !== null) {
      message.feedId = object.feed_id;
    }
    if (object.f !== undefined && object.f !== null) {
      message.f = object.f;
    }
    if (object.onchain_config !== undefined && object.onchain_config !== null) {
      message.onchainConfig = bytesFromBase64(object.onchain_config);
    }
    if (object.offchain_config_version !== undefined && object.offchain_config_version !== null) {
      message.offchainConfigVersion = BigInt(object.offchain_config_version);
    }
    if (object.offchain_config !== undefined && object.offchain_config !== null) {
      message.offchainConfig = bytesFromBase64(object.offchain_config);
    }
    if (object.min_answer !== undefined && object.min_answer !== null) {
      message.minAnswer = object.min_answer;
    }
    if (object.max_answer !== undefined && object.max_answer !== null) {
      message.maxAnswer = object.max_answer;
    }
    if (object.link_per_observation !== undefined && object.link_per_observation !== null) {
      message.linkPerObservation = object.link_per_observation;
    }
    if (object.link_per_transmission !== undefined && object.link_per_transmission !== null) {
      message.linkPerTransmission = object.link_per_transmission;
    }
    if (object.unique_reports !== undefined && object.unique_reports !== null) {
      message.uniqueReports = object.unique_reports;
    }
    if (object.description !== undefined && object.description !== null) {
      message.description = object.description;
    }
    return message;
  },
  toAmino(message: FeedProperties): FeedPropertiesAmino {
    const obj: any = {};
    obj.feed_id = message.feedId === '' ? undefined : message.feedId;
    obj.f = message.f === 0 ? undefined : message.f;
    obj.onchain_config = message.onchainConfig ? base64FromBytes(message.onchainConfig) : undefined;
    obj.offchain_config_version =
      message.offchainConfigVersion !== BigInt(0) ? (message.offchainConfigVersion?.toString)() : undefined;
    obj.offchain_config = message.offchainConfig ? base64FromBytes(message.offchainConfig) : undefined;
    obj.min_answer = message.minAnswer === '' ? undefined : message.minAnswer;
    obj.max_answer = message.maxAnswer === '' ? undefined : message.maxAnswer;
    obj.link_per_observation = message.linkPerObservation === '' ? undefined : message.linkPerObservation;
    obj.link_per_transmission = message.linkPerTransmission === '' ? undefined : message.linkPerTransmission;
    obj.unique_reports = message.uniqueReports === false ? undefined : message.uniqueReports;
    obj.description = message.description === '' ? undefined : message.description;
    return obj;
  },
  fromAminoMsg(object: FeedPropertiesAminoMsg): FeedProperties {
    return FeedProperties.fromAmino(object.value);
  },
  fromProtoMsg(message: FeedPropertiesProtoMsg): FeedProperties {
    return FeedProperties.decode(message.value);
  },
  toProto(message: FeedProperties): Uint8Array {
    return FeedProperties.encode(message).finish();
  },
  toProtoMsg(message: FeedProperties): FeedPropertiesProtoMsg {
    return {
      typeUrl: '/injective.ocr.v1beta1.FeedProperties',
      value: FeedProperties.encode(message).finish(),
    };
  },
};
function createBaseSetBatchConfigProposal(): SetBatchConfigProposal {
  return {
    $typeUrl: '/injective.ocr.v1beta1.SetBatchConfigProposal',
    title: '',
    description: '',
    signers: [],
    transmitters: [],
    linkDenom: '',
    feedProperties: [],
  };
}
export const SetBatchConfigProposal = {
  typeUrl: '/injective.ocr.v1beta1.SetBatchConfigProposal',
  encode(message: SetBatchConfigProposal, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.title !== '') {
      writer.uint32(10).string(message.title);
    }
    if (message.description !== '') {
      writer.uint32(18).string(message.description);
    }
    for (const v of message.signers) {
      writer.uint32(26).string(v!);
    }
    for (const v of message.transmitters) {
      writer.uint32(34).string(v!);
    }
    if (message.linkDenom !== '') {
      writer.uint32(42).string(message.linkDenom);
    }
    for (const v of message.feedProperties) {
      FeedProperties.encode(v!, writer.uint32(50).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): SetBatchConfigProposal {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSetBatchConfigProposal();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.title = reader.string();
          break;
        case 2:
          message.description = reader.string();
          break;
        case 3:
          message.signers.push(reader.string());
          break;
        case 4:
          message.transmitters.push(reader.string());
          break;
        case 5:
          message.linkDenom = reader.string();
          break;
        case 6:
          message.feedProperties.push(FeedProperties.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<SetBatchConfigProposal>): SetBatchConfigProposal {
    const message = createBaseSetBatchConfigProposal();
    message.title = object.title ?? '';
    message.description = object.description ?? '';
    message.signers = object.signers?.map((e) => e) || [];
    message.transmitters = object.transmitters?.map((e) => e) || [];
    message.linkDenom = object.linkDenom ?? '';
    message.feedProperties = object.feedProperties?.map((e) => FeedProperties.fromPartial(e)) || [];
    return message;
  },
  fromAmino(object: SetBatchConfigProposalAmino): SetBatchConfigProposal {
    const message = createBaseSetBatchConfigProposal();
    if (object.title !== undefined && object.title !== null) {
      message.title = object.title;
    }
    if (object.description !== undefined && object.description !== null) {
      message.description = object.description;
    }
    message.signers = object.signers?.map((e) => e) || [];
    message.transmitters = object.transmitters?.map((e) => e) || [];
    if (object.link_denom !== undefined && object.link_denom !== null) {
      message.linkDenom = object.link_denom;
    }
    message.feedProperties = object.feed_properties?.map((e) => FeedProperties.fromAmino(e)) || [];
    return message;
  },
  toAmino(message: SetBatchConfigProposal): SetBatchConfigProposalAmino {
    const obj: any = {};
    obj.title = message.title === '' ? undefined : message.title;
    obj.description = message.description === '' ? undefined : message.description;
    if (message.signers) {
      obj.signers = message.signers.map((e) => e);
    } else {
      obj.signers = message.signers;
    }
    if (message.transmitters) {
      obj.transmitters = message.transmitters.map((e) => e);
    } else {
      obj.transmitters = message.transmitters;
    }
    obj.link_denom = message.linkDenom === '' ? undefined : message.linkDenom;
    if (message.feedProperties) {
      obj.feed_properties = message.feedProperties.map((e) => (e ? FeedProperties.toAmino(e) : undefined));
    } else {
      obj.feed_properties = message.feedProperties;
    }
    return obj;
  },
  fromAminoMsg(object: SetBatchConfigProposalAminoMsg): SetBatchConfigProposal {
    return SetBatchConfigProposal.fromAmino(object.value);
  },
  toAminoMsg(message: SetBatchConfigProposal): SetBatchConfigProposalAminoMsg {
    return {
      type: 'ocr/SetBatchConfigProposal',
      value: SetBatchConfigProposal.toAmino(message),
    };
  },
  fromProtoMsg(message: SetBatchConfigProposalProtoMsg): SetBatchConfigProposal {
    return SetBatchConfigProposal.decode(message.value);
  },
  toProto(message: SetBatchConfigProposal): Uint8Array {
    return SetBatchConfigProposal.encode(message).finish();
  },
  toProtoMsg(message: SetBatchConfigProposal): SetBatchConfigProposalProtoMsg {
    return {
      typeUrl: '/injective.ocr.v1beta1.SetBatchConfigProposal',
      value: SetBatchConfigProposal.encode(message).finish(),
    };
  },
};
function createBaseOracleObservationsCounts(): OracleObservationsCounts {
  return {
    counts: [],
  };
}
export const OracleObservationsCounts = {
  typeUrl: '/injective.ocr.v1beta1.OracleObservationsCounts',
  encode(message: OracleObservationsCounts, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    writer.uint32(10).fork();
    for (const v of message.counts) {
      writer.uint32(v);
    }
    writer.ldelim();
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): OracleObservationsCounts {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseOracleObservationsCounts();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if ((tag & 7) === 2) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.counts.push(reader.uint32());
            }
          } else {
            message.counts.push(reader.uint32());
          }
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<OracleObservationsCounts>): OracleObservationsCounts {
    const message = createBaseOracleObservationsCounts();
    message.counts = object.counts?.map((e) => e) || [];
    return message;
  },
  fromAmino(object: OracleObservationsCountsAmino): OracleObservationsCounts {
    const message = createBaseOracleObservationsCounts();
    message.counts = object.counts?.map((e) => e) || [];
    return message;
  },
  toAmino(message: OracleObservationsCounts): OracleObservationsCountsAmino {
    const obj: any = {};
    if (message.counts) {
      obj.counts = message.counts.map((e) => e);
    } else {
      obj.counts = message.counts;
    }
    return obj;
  },
  fromAminoMsg(object: OracleObservationsCountsAminoMsg): OracleObservationsCounts {
    return OracleObservationsCounts.fromAmino(object.value);
  },
  fromProtoMsg(message: OracleObservationsCountsProtoMsg): OracleObservationsCounts {
    return OracleObservationsCounts.decode(message.value);
  },
  toProto(message: OracleObservationsCounts): Uint8Array {
    return OracleObservationsCounts.encode(message).finish();
  },
  toProtoMsg(message: OracleObservationsCounts): OracleObservationsCountsProtoMsg {
    return {
      typeUrl: '/injective.ocr.v1beta1.OracleObservationsCounts',
      value: OracleObservationsCounts.encode(message).finish(),
    };
  },
};
function createBaseGasReimbursements(): GasReimbursements {
  return {
    reimbursements: [],
  };
}
export const GasReimbursements = {
  typeUrl: '/injective.ocr.v1beta1.GasReimbursements',
  encode(message: GasReimbursements, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    for (const v of message.reimbursements) {
      Coin.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): GasReimbursements {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGasReimbursements();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.reimbursements.push(Coin.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<GasReimbursements>): GasReimbursements {
    const message = createBaseGasReimbursements();
    message.reimbursements = object.reimbursements?.map((e) => Coin.fromPartial(e)) || [];
    return message;
  },
  fromAmino(object: GasReimbursementsAmino): GasReimbursements {
    const message = createBaseGasReimbursements();
    message.reimbursements = object.reimbursements?.map((e) => Coin.fromAmino(e)) || [];
    return message;
  },
  toAmino(message: GasReimbursements): GasReimbursementsAmino {
    const obj: any = {};
    if (message.reimbursements) {
      obj.reimbursements = message.reimbursements.map((e) => (e ? Coin.toAmino(e) : undefined));
    } else {
      obj.reimbursements = message.reimbursements;
    }
    return obj;
  },
  fromAminoMsg(object: GasReimbursementsAminoMsg): GasReimbursements {
    return GasReimbursements.fromAmino(object.value);
  },
  fromProtoMsg(message: GasReimbursementsProtoMsg): GasReimbursements {
    return GasReimbursements.decode(message.value);
  },
  toProto(message: GasReimbursements): Uint8Array {
    return GasReimbursements.encode(message).finish();
  },
  toProtoMsg(message: GasReimbursements): GasReimbursementsProtoMsg {
    return {
      typeUrl: '/injective.ocr.v1beta1.GasReimbursements',
      value: GasReimbursements.encode(message).finish(),
    };
  },
};
function createBasePayee(): Payee {
  return {
    transmitterAddr: '',
    paymentAddr: '',
  };
}
export const Payee = {
  typeUrl: '/injective.ocr.v1beta1.Payee',
  encode(message: Payee, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.transmitterAddr !== '') {
      writer.uint32(10).string(message.transmitterAddr);
    }
    if (message.paymentAddr !== '') {
      writer.uint32(18).string(message.paymentAddr);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): Payee {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePayee();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.transmitterAddr = reader.string();
          break;
        case 2:
          message.paymentAddr = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<Payee>): Payee {
    const message = createBasePayee();
    message.transmitterAddr = object.transmitterAddr ?? '';
    message.paymentAddr = object.paymentAddr ?? '';
    return message;
  },
  fromAmino(object: PayeeAmino): Payee {
    const message = createBasePayee();
    if (object.transmitter_addr !== undefined && object.transmitter_addr !== null) {
      message.transmitterAddr = object.transmitter_addr;
    }
    if (object.payment_addr !== undefined && object.payment_addr !== null) {
      message.paymentAddr = object.payment_addr;
    }
    return message;
  },
  toAmino(message: Payee): PayeeAmino {
    const obj: any = {};
    obj.transmitter_addr = message.transmitterAddr === '' ? undefined : message.transmitterAddr;
    obj.payment_addr = message.paymentAddr === '' ? undefined : message.paymentAddr;
    return obj;
  },
  fromAminoMsg(object: PayeeAminoMsg): Payee {
    return Payee.fromAmino(object.value);
  },
  fromProtoMsg(message: PayeeProtoMsg): Payee {
    return Payee.decode(message.value);
  },
  toProto(message: Payee): Uint8Array {
    return Payee.encode(message).finish();
  },
  toProtoMsg(message: Payee): PayeeProtoMsg {
    return {
      typeUrl: '/injective.ocr.v1beta1.Payee',
      value: Payee.encode(message).finish(),
    };
  },
};
function createBaseTransmission(): Transmission {
  return {
    answer: '',
    observationsTimestamp: BigInt(0),
    transmissionTimestamp: BigInt(0),
  };
}
export const Transmission = {
  typeUrl: '/injective.ocr.v1beta1.Transmission',
  encode(message: Transmission, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.answer !== '') {
      writer.uint32(10).string(Decimal.fromUserInput(message.answer, 18).atomics);
    }
    if (message.observationsTimestamp !== BigInt(0)) {
      writer.uint32(16).int64(message.observationsTimestamp);
    }
    if (message.transmissionTimestamp !== BigInt(0)) {
      writer.uint32(24).int64(message.transmissionTimestamp);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): Transmission {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTransmission();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.answer = Decimal.fromAtomics(reader.string(), 18).toString();
          break;
        case 2:
          message.observationsTimestamp = reader.int64();
          break;
        case 3:
          message.transmissionTimestamp = reader.int64();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<Transmission>): Transmission {
    const message = createBaseTransmission();
    message.answer = object.answer ?? '';
    message.observationsTimestamp =
      object.observationsTimestamp !== undefined && object.observationsTimestamp !== null
        ? BigInt(object.observationsTimestamp.toString())
        : BigInt(0);
    message.transmissionTimestamp =
      object.transmissionTimestamp !== undefined && object.transmissionTimestamp !== null
        ? BigInt(object.transmissionTimestamp.toString())
        : BigInt(0);
    return message;
  },
  fromAmino(object: TransmissionAmino): Transmission {
    const message = createBaseTransmission();
    if (object.answer !== undefined && object.answer !== null) {
      message.answer = object.answer;
    }
    if (object.observations_timestamp !== undefined && object.observations_timestamp !== null) {
      message.observationsTimestamp = BigInt(object.observations_timestamp);
    }
    if (object.transmission_timestamp !== undefined && object.transmission_timestamp !== null) {
      message.transmissionTimestamp = BigInt(object.transmission_timestamp);
    }
    return message;
  },
  toAmino(message: Transmission): TransmissionAmino {
    const obj: any = {};
    obj.answer = message.answer === '' ? undefined : message.answer;
    obj.observations_timestamp =
      message.observationsTimestamp !== BigInt(0) ? (message.observationsTimestamp?.toString)() : undefined;
    obj.transmission_timestamp =
      message.transmissionTimestamp !== BigInt(0) ? (message.transmissionTimestamp?.toString)() : undefined;
    return obj;
  },
  fromAminoMsg(object: TransmissionAminoMsg): Transmission {
    return Transmission.fromAmino(object.value);
  },
  fromProtoMsg(message: TransmissionProtoMsg): Transmission {
    return Transmission.decode(message.value);
  },
  toProto(message: Transmission): Uint8Array {
    return Transmission.encode(message).finish();
  },
  toProtoMsg(message: Transmission): TransmissionProtoMsg {
    return {
      typeUrl: '/injective.ocr.v1beta1.Transmission',
      value: Transmission.encode(message).finish(),
    };
  },
};
function createBaseEpochAndRound(): EpochAndRound {
  return {
    epoch: BigInt(0),
    round: BigInt(0),
  };
}
export const EpochAndRound = {
  typeUrl: '/injective.ocr.v1beta1.EpochAndRound',
  encode(message: EpochAndRound, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.epoch !== BigInt(0)) {
      writer.uint32(8).uint64(message.epoch);
    }
    if (message.round !== BigInt(0)) {
      writer.uint32(16).uint64(message.round);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): EpochAndRound {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEpochAndRound();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.epoch = reader.uint64();
          break;
        case 2:
          message.round = reader.uint64();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<EpochAndRound>): EpochAndRound {
    const message = createBaseEpochAndRound();
    message.epoch = object.epoch !== undefined && object.epoch !== null ? BigInt(object.epoch.toString()) : BigInt(0);
    message.round = object.round !== undefined && object.round !== null ? BigInt(object.round.toString()) : BigInt(0);
    return message;
  },
  fromAmino(object: EpochAndRoundAmino): EpochAndRound {
    const message = createBaseEpochAndRound();
    if (object.epoch !== undefined && object.epoch !== null) {
      message.epoch = BigInt(object.epoch);
    }
    if (object.round !== undefined && object.round !== null) {
      message.round = BigInt(object.round);
    }
    return message;
  },
  toAmino(message: EpochAndRound): EpochAndRoundAmino {
    const obj: any = {};
    obj.epoch = message.epoch !== BigInt(0) ? (message.epoch?.toString)() : undefined;
    obj.round = message.round !== BigInt(0) ? (message.round?.toString)() : undefined;
    return obj;
  },
  fromAminoMsg(object: EpochAndRoundAminoMsg): EpochAndRound {
    return EpochAndRound.fromAmino(object.value);
  },
  fromProtoMsg(message: EpochAndRoundProtoMsg): EpochAndRound {
    return EpochAndRound.decode(message.value);
  },
  toProto(message: EpochAndRound): Uint8Array {
    return EpochAndRound.encode(message).finish();
  },
  toProtoMsg(message: EpochAndRound): EpochAndRoundProtoMsg {
    return {
      typeUrl: '/injective.ocr.v1beta1.EpochAndRound',
      value: EpochAndRound.encode(message).finish(),
    };
  },
};
function createBaseReport(): Report {
  return {
    observationsTimestamp: BigInt(0),
    observers: new Uint8Array(),
    observations: [],
  };
}
export const Report = {
  typeUrl: '/injective.ocr.v1beta1.Report',
  encode(message: Report, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.observationsTimestamp !== BigInt(0)) {
      writer.uint32(8).int64(message.observationsTimestamp);
    }
    if (message.observers.length !== 0) {
      writer.uint32(18).bytes(message.observers);
    }
    for (const v of message.observations) {
      writer.uint32(26).string(Decimal.fromUserInput(v!, 18).atomics);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): Report {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseReport();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.observationsTimestamp = reader.int64();
          break;
        case 2:
          message.observers = reader.bytes();
          break;
        case 3:
          message.observations.push(Decimal.fromAtomics(reader.string(), 18).toString());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<Report>): Report {
    const message = createBaseReport();
    message.observationsTimestamp =
      object.observationsTimestamp !== undefined && object.observationsTimestamp !== null
        ? BigInt(object.observationsTimestamp.toString())
        : BigInt(0);
    message.observers = object.observers ?? new Uint8Array();
    message.observations = object.observations?.map((e) => e) || [];
    return message;
  },
  fromAmino(object: ReportAmino): Report {
    const message = createBaseReport();
    if (object.observations_timestamp !== undefined && object.observations_timestamp !== null) {
      message.observationsTimestamp = BigInt(object.observations_timestamp);
    }
    if (object.observers !== undefined && object.observers !== null) {
      message.observers = bytesFromBase64(object.observers);
    }
    message.observations = object.observations?.map((e) => e) || [];
    return message;
  },
  toAmino(message: Report): ReportAmino {
    const obj: any = {};
    obj.observations_timestamp =
      message.observationsTimestamp !== BigInt(0) ? (message.observationsTimestamp?.toString)() : undefined;
    obj.observers = message.observers ? base64FromBytes(message.observers) : undefined;
    if (message.observations) {
      obj.observations = message.observations.map((e) => e);
    } else {
      obj.observations = message.observations;
    }
    return obj;
  },
  fromAminoMsg(object: ReportAminoMsg): Report {
    return Report.fromAmino(object.value);
  },
  fromProtoMsg(message: ReportProtoMsg): Report {
    return Report.decode(message.value);
  },
  toProto(message: Report): Uint8Array {
    return Report.encode(message).finish();
  },
  toProtoMsg(message: Report): ReportProtoMsg {
    return {
      typeUrl: '/injective.ocr.v1beta1.Report',
      value: Report.encode(message).finish(),
    };
  },
};
function createBaseReportToSign(): ReportToSign {
  return {
    configDigest: new Uint8Array(),
    epoch: BigInt(0),
    round: BigInt(0),
    extraHash: new Uint8Array(),
    report: new Uint8Array(),
  };
}
export const ReportToSign = {
  typeUrl: '/injective.ocr.v1beta1.ReportToSign',
  encode(message: ReportToSign, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.configDigest.length !== 0) {
      writer.uint32(10).bytes(message.configDigest);
    }
    if (message.epoch !== BigInt(0)) {
      writer.uint32(16).uint64(message.epoch);
    }
    if (message.round !== BigInt(0)) {
      writer.uint32(24).uint64(message.round);
    }
    if (message.extraHash.length !== 0) {
      writer.uint32(34).bytes(message.extraHash);
    }
    if (message.report.length !== 0) {
      writer.uint32(42).bytes(message.report);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): ReportToSign {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseReportToSign();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.configDigest = reader.bytes();
          break;
        case 2:
          message.epoch = reader.uint64();
          break;
        case 3:
          message.round = reader.uint64();
          break;
        case 4:
          message.extraHash = reader.bytes();
          break;
        case 5:
          message.report = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<ReportToSign>): ReportToSign {
    const message = createBaseReportToSign();
    message.configDigest = object.configDigest ?? new Uint8Array();
    message.epoch = object.epoch !== undefined && object.epoch !== null ? BigInt(object.epoch.toString()) : BigInt(0);
    message.round = object.round !== undefined && object.round !== null ? BigInt(object.round.toString()) : BigInt(0);
    message.extraHash = object.extraHash ?? new Uint8Array();
    message.report = object.report ?? new Uint8Array();
    return message;
  },
  fromAmino(object: ReportToSignAmino): ReportToSign {
    const message = createBaseReportToSign();
    if (object.config_digest !== undefined && object.config_digest !== null) {
      message.configDigest = bytesFromBase64(object.config_digest);
    }
    if (object.epoch !== undefined && object.epoch !== null) {
      message.epoch = BigInt(object.epoch);
    }
    if (object.round !== undefined && object.round !== null) {
      message.round = BigInt(object.round);
    }
    if (object.extra_hash !== undefined && object.extra_hash !== null) {
      message.extraHash = bytesFromBase64(object.extra_hash);
    }
    if (object.report !== undefined && object.report !== null) {
      message.report = bytesFromBase64(object.report);
    }
    return message;
  },
  toAmino(message: ReportToSign): ReportToSignAmino {
    const obj: any = {};
    obj.config_digest = message.configDigest ? base64FromBytes(message.configDigest) : undefined;
    obj.epoch = message.epoch !== BigInt(0) ? (message.epoch?.toString)() : undefined;
    obj.round = message.round !== BigInt(0) ? (message.round?.toString)() : undefined;
    obj.extra_hash = message.extraHash ? base64FromBytes(message.extraHash) : undefined;
    obj.report = message.report ? base64FromBytes(message.report) : undefined;
    return obj;
  },
  fromAminoMsg(object: ReportToSignAminoMsg): ReportToSign {
    return ReportToSign.fromAmino(object.value);
  },
  fromProtoMsg(message: ReportToSignProtoMsg): ReportToSign {
    return ReportToSign.decode(message.value);
  },
  toProto(message: ReportToSign): Uint8Array {
    return ReportToSign.encode(message).finish();
  },
  toProtoMsg(message: ReportToSign): ReportToSignProtoMsg {
    return {
      typeUrl: '/injective.ocr.v1beta1.ReportToSign',
      value: ReportToSign.encode(message).finish(),
    };
  },
};
function createBaseEventOraclePaid(): EventOraclePaid {
  return {
    transmitterAddr: '',
    payeeAddr: '',
    amount: Coin.fromPartial({}),
  };
}
export const EventOraclePaid = {
  typeUrl: '/injective.ocr.v1beta1.EventOraclePaid',
  encode(message: EventOraclePaid, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.transmitterAddr !== '') {
      writer.uint32(10).string(message.transmitterAddr);
    }
    if (message.payeeAddr !== '') {
      writer.uint32(18).string(message.payeeAddr);
    }
    if (message.amount !== undefined) {
      Coin.encode(message.amount, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): EventOraclePaid {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEventOraclePaid();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.transmitterAddr = reader.string();
          break;
        case 2:
          message.payeeAddr = reader.string();
          break;
        case 3:
          message.amount = Coin.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<EventOraclePaid>): EventOraclePaid {
    const message = createBaseEventOraclePaid();
    message.transmitterAddr = object.transmitterAddr ?? '';
    message.payeeAddr = object.payeeAddr ?? '';
    message.amount =
      object.amount !== undefined && object.amount !== null ? Coin.fromPartial(object.amount) : undefined;
    return message;
  },
  fromAmino(object: EventOraclePaidAmino): EventOraclePaid {
    const message = createBaseEventOraclePaid();
    if (object.transmitter_addr !== undefined && object.transmitter_addr !== null) {
      message.transmitterAddr = object.transmitter_addr;
    }
    if (object.payee_addr !== undefined && object.payee_addr !== null) {
      message.payeeAddr = object.payee_addr;
    }
    if (object.amount !== undefined && object.amount !== null) {
      message.amount = Coin.fromAmino(object.amount);
    }
    return message;
  },
  toAmino(message: EventOraclePaid): EventOraclePaidAmino {
    const obj: any = {};
    obj.transmitter_addr = message.transmitterAddr === '' ? undefined : message.transmitterAddr;
    obj.payee_addr = message.payeeAddr === '' ? undefined : message.payeeAddr;
    obj.amount = message.amount ? Coin.toAmino(message.amount) : undefined;
    return obj;
  },
  fromAminoMsg(object: EventOraclePaidAminoMsg): EventOraclePaid {
    return EventOraclePaid.fromAmino(object.value);
  },
  fromProtoMsg(message: EventOraclePaidProtoMsg): EventOraclePaid {
    return EventOraclePaid.decode(message.value);
  },
  toProto(message: EventOraclePaid): Uint8Array {
    return EventOraclePaid.encode(message).finish();
  },
  toProtoMsg(message: EventOraclePaid): EventOraclePaidProtoMsg {
    return {
      typeUrl: '/injective.ocr.v1beta1.EventOraclePaid',
      value: EventOraclePaid.encode(message).finish(),
    };
  },
};
function createBaseEventAnswerUpdated(): EventAnswerUpdated {
  return {
    current: '',
    roundId: '',
    updatedAt: new Date(),
  };
}
export const EventAnswerUpdated = {
  typeUrl: '/injective.ocr.v1beta1.EventAnswerUpdated',
  encode(message: EventAnswerUpdated, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.current !== '') {
      writer.uint32(10).string(message.current);
    }
    if (message.roundId !== '') {
      writer.uint32(18).string(message.roundId);
    }
    if (message.updatedAt !== undefined) {
      Timestamp.encode(toTimestamp(message.updatedAt), writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): EventAnswerUpdated {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEventAnswerUpdated();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.current = reader.string();
          break;
        case 2:
          message.roundId = reader.string();
          break;
        case 3:
          message.updatedAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<EventAnswerUpdated>): EventAnswerUpdated {
    const message = createBaseEventAnswerUpdated();
    message.current = object.current ?? '';
    message.roundId = object.roundId ?? '';
    message.updatedAt = object.updatedAt ?? undefined;
    return message;
  },
  fromAmino(object: EventAnswerUpdatedAmino): EventAnswerUpdated {
    const message = createBaseEventAnswerUpdated();
    if (object.current !== undefined && object.current !== null) {
      message.current = object.current;
    }
    if (object.round_id !== undefined && object.round_id !== null) {
      message.roundId = object.round_id;
    }
    if (object.updated_at !== undefined && object.updated_at !== null) {
      message.updatedAt = fromTimestamp(Timestamp.fromAmino(object.updated_at));
    }
    return message;
  },
  toAmino(message: EventAnswerUpdated): EventAnswerUpdatedAmino {
    const obj: any = {};
    obj.current = message.current === '' ? undefined : message.current;
    obj.round_id = message.roundId === '' ? undefined : message.roundId;
    obj.updated_at = message.updatedAt ? Timestamp.toAmino(toTimestamp(message.updatedAt)) : undefined;
    return obj;
  },
  fromAminoMsg(object: EventAnswerUpdatedAminoMsg): EventAnswerUpdated {
    return EventAnswerUpdated.fromAmino(object.value);
  },
  fromProtoMsg(message: EventAnswerUpdatedProtoMsg): EventAnswerUpdated {
    return EventAnswerUpdated.decode(message.value);
  },
  toProto(message: EventAnswerUpdated): Uint8Array {
    return EventAnswerUpdated.encode(message).finish();
  },
  toProtoMsg(message: EventAnswerUpdated): EventAnswerUpdatedProtoMsg {
    return {
      typeUrl: '/injective.ocr.v1beta1.EventAnswerUpdated',
      value: EventAnswerUpdated.encode(message).finish(),
    };
  },
};
function createBaseEventNewRound(): EventNewRound {
  return {
    roundId: '',
    startedBy: '',
    startedAt: new Date(),
  };
}
export const EventNewRound = {
  typeUrl: '/injective.ocr.v1beta1.EventNewRound',
  encode(message: EventNewRound, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.roundId !== '') {
      writer.uint32(10).string(message.roundId);
    }
    if (message.startedBy !== '') {
      writer.uint32(18).string(message.startedBy);
    }
    if (message.startedAt !== undefined) {
      Timestamp.encode(toTimestamp(message.startedAt), writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): EventNewRound {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEventNewRound();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.roundId = reader.string();
          break;
        case 2:
          message.startedBy = reader.string();
          break;
        case 3:
          message.startedAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<EventNewRound>): EventNewRound {
    const message = createBaseEventNewRound();
    message.roundId = object.roundId ?? '';
    message.startedBy = object.startedBy ?? '';
    message.startedAt = object.startedAt ?? undefined;
    return message;
  },
  fromAmino(object: EventNewRoundAmino): EventNewRound {
    const message = createBaseEventNewRound();
    if (object.round_id !== undefined && object.round_id !== null) {
      message.roundId = object.round_id;
    }
    if (object.started_by !== undefined && object.started_by !== null) {
      message.startedBy = object.started_by;
    }
    if (object.started_at !== undefined && object.started_at !== null) {
      message.startedAt = fromTimestamp(Timestamp.fromAmino(object.started_at));
    }
    return message;
  },
  toAmino(message: EventNewRound): EventNewRoundAmino {
    const obj: any = {};
    obj.round_id = message.roundId === '' ? undefined : message.roundId;
    obj.started_by = message.startedBy === '' ? undefined : message.startedBy;
    obj.started_at = message.startedAt ? Timestamp.toAmino(toTimestamp(message.startedAt)) : undefined;
    return obj;
  },
  fromAminoMsg(object: EventNewRoundAminoMsg): EventNewRound {
    return EventNewRound.fromAmino(object.value);
  },
  fromProtoMsg(message: EventNewRoundProtoMsg): EventNewRound {
    return EventNewRound.decode(message.value);
  },
  toProto(message: EventNewRound): Uint8Array {
    return EventNewRound.encode(message).finish();
  },
  toProtoMsg(message: EventNewRound): EventNewRoundProtoMsg {
    return {
      typeUrl: '/injective.ocr.v1beta1.EventNewRound',
      value: EventNewRound.encode(message).finish(),
    };
  },
};
function createBaseEventTransmitted(): EventTransmitted {
  return {
    configDigest: new Uint8Array(),
    epoch: BigInt(0),
  };
}
export const EventTransmitted = {
  typeUrl: '/injective.ocr.v1beta1.EventTransmitted',
  encode(message: EventTransmitted, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.configDigest.length !== 0) {
      writer.uint32(10).bytes(message.configDigest);
    }
    if (message.epoch !== BigInt(0)) {
      writer.uint32(16).uint64(message.epoch);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): EventTransmitted {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEventTransmitted();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.configDigest = reader.bytes();
          break;
        case 2:
          message.epoch = reader.uint64();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<EventTransmitted>): EventTransmitted {
    const message = createBaseEventTransmitted();
    message.configDigest = object.configDigest ?? new Uint8Array();
    message.epoch = object.epoch !== undefined && object.epoch !== null ? BigInt(object.epoch.toString()) : BigInt(0);
    return message;
  },
  fromAmino(object: EventTransmittedAmino): EventTransmitted {
    const message = createBaseEventTransmitted();
    if (object.config_digest !== undefined && object.config_digest !== null) {
      message.configDigest = bytesFromBase64(object.config_digest);
    }
    if (object.epoch !== undefined && object.epoch !== null) {
      message.epoch = BigInt(object.epoch);
    }
    return message;
  },
  toAmino(message: EventTransmitted): EventTransmittedAmino {
    const obj: any = {};
    obj.config_digest = message.configDigest ? base64FromBytes(message.configDigest) : undefined;
    obj.epoch = message.epoch !== BigInt(0) ? (message.epoch?.toString)() : undefined;
    return obj;
  },
  fromAminoMsg(object: EventTransmittedAminoMsg): EventTransmitted {
    return EventTransmitted.fromAmino(object.value);
  },
  fromProtoMsg(message: EventTransmittedProtoMsg): EventTransmitted {
    return EventTransmitted.decode(message.value);
  },
  toProto(message: EventTransmitted): Uint8Array {
    return EventTransmitted.encode(message).finish();
  },
  toProtoMsg(message: EventTransmitted): EventTransmittedProtoMsg {
    return {
      typeUrl: '/injective.ocr.v1beta1.EventTransmitted',
      value: EventTransmitted.encode(message).finish(),
    };
  },
};
function createBaseEventNewTransmission(): EventNewTransmission {
  return {
    feedId: '',
    aggregatorRoundId: 0,
    answer: '',
    transmitter: '',
    observationsTimestamp: BigInt(0),
    observations: [],
    observers: new Uint8Array(),
    configDigest: new Uint8Array(),
    epochAndRound: undefined,
  };
}
export const EventNewTransmission = {
  typeUrl: '/injective.ocr.v1beta1.EventNewTransmission',
  encode(message: EventNewTransmission, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.feedId !== '') {
      writer.uint32(10).string(message.feedId);
    }
    if (message.aggregatorRoundId !== 0) {
      writer.uint32(16).uint32(message.aggregatorRoundId);
    }
    if (message.answer !== '') {
      writer.uint32(26).string(Decimal.fromUserInput(message.answer, 18).atomics);
    }
    if (message.transmitter !== '') {
      writer.uint32(34).string(message.transmitter);
    }
    if (message.observationsTimestamp !== BigInt(0)) {
      writer.uint32(40).int64(message.observationsTimestamp);
    }
    for (const v of message.observations) {
      writer.uint32(50).string(Decimal.fromUserInput(v!, 18).atomics);
    }
    if (message.observers.length !== 0) {
      writer.uint32(58).bytes(message.observers);
    }
    if (message.configDigest.length !== 0) {
      writer.uint32(66).bytes(message.configDigest);
    }
    if (message.epochAndRound !== undefined) {
      EpochAndRound.encode(message.epochAndRound, writer.uint32(74).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): EventNewTransmission {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEventNewTransmission();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.feedId = reader.string();
          break;
        case 2:
          message.aggregatorRoundId = reader.uint32();
          break;
        case 3:
          message.answer = Decimal.fromAtomics(reader.string(), 18).toString();
          break;
        case 4:
          message.transmitter = reader.string();
          break;
        case 5:
          message.observationsTimestamp = reader.int64();
          break;
        case 6:
          message.observations.push(Decimal.fromAtomics(reader.string(), 18).toString());
          break;
        case 7:
          message.observers = reader.bytes();
          break;
        case 8:
          message.configDigest = reader.bytes();
          break;
        case 9:
          message.epochAndRound = EpochAndRound.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<EventNewTransmission>): EventNewTransmission {
    const message = createBaseEventNewTransmission();
    message.feedId = object.feedId ?? '';
    message.aggregatorRoundId = object.aggregatorRoundId ?? 0;
    message.answer = object.answer ?? '';
    message.transmitter = object.transmitter ?? '';
    message.observationsTimestamp =
      object.observationsTimestamp !== undefined && object.observationsTimestamp !== null
        ? BigInt(object.observationsTimestamp.toString())
        : BigInt(0);
    message.observations = object.observations?.map((e) => e) || [];
    message.observers = object.observers ?? new Uint8Array();
    message.configDigest = object.configDigest ?? new Uint8Array();
    message.epochAndRound =
      object.epochAndRound !== undefined && object.epochAndRound !== null
        ? EpochAndRound.fromPartial(object.epochAndRound)
        : undefined;
    return message;
  },
  fromAmino(object: EventNewTransmissionAmino): EventNewTransmission {
    const message = createBaseEventNewTransmission();
    if (object.feed_id !== undefined && object.feed_id !== null) {
      message.feedId = object.feed_id;
    }
    if (object.aggregator_round_id !== undefined && object.aggregator_round_id !== null) {
      message.aggregatorRoundId = object.aggregator_round_id;
    }
    if (object.answer !== undefined && object.answer !== null) {
      message.answer = object.answer;
    }
    if (object.transmitter !== undefined && object.transmitter !== null) {
      message.transmitter = object.transmitter;
    }
    if (object.observations_timestamp !== undefined && object.observations_timestamp !== null) {
      message.observationsTimestamp = BigInt(object.observations_timestamp);
    }
    message.observations = object.observations?.map((e) => e) || [];
    if (object.observers !== undefined && object.observers !== null) {
      message.observers = bytesFromBase64(object.observers);
    }
    if (object.config_digest !== undefined && object.config_digest !== null) {
      message.configDigest = bytesFromBase64(object.config_digest);
    }
    if (object.epoch_and_round !== undefined && object.epoch_and_round !== null) {
      message.epochAndRound = EpochAndRound.fromAmino(object.epoch_and_round);
    }
    return message;
  },
  toAmino(message: EventNewTransmission): EventNewTransmissionAmino {
    const obj: any = {};
    obj.feed_id = message.feedId === '' ? undefined : message.feedId;
    obj.aggregator_round_id = message.aggregatorRoundId === 0 ? undefined : message.aggregatorRoundId;
    obj.answer = message.answer === '' ? undefined : message.answer;
    obj.transmitter = message.transmitter === '' ? undefined : message.transmitter;
    obj.observations_timestamp =
      message.observationsTimestamp !== BigInt(0) ? (message.observationsTimestamp?.toString)() : undefined;
    if (message.observations) {
      obj.observations = message.observations.map((e) => e);
    } else {
      obj.observations = message.observations;
    }
    obj.observers = message.observers ? base64FromBytes(message.observers) : undefined;
    obj.config_digest = message.configDigest ? base64FromBytes(message.configDigest) : undefined;
    obj.epoch_and_round = message.epochAndRound ? EpochAndRound.toAmino(message.epochAndRound) : undefined;
    return obj;
  },
  fromAminoMsg(object: EventNewTransmissionAminoMsg): EventNewTransmission {
    return EventNewTransmission.fromAmino(object.value);
  },
  fromProtoMsg(message: EventNewTransmissionProtoMsg): EventNewTransmission {
    return EventNewTransmission.decode(message.value);
  },
  toProto(message: EventNewTransmission): Uint8Array {
    return EventNewTransmission.encode(message).finish();
  },
  toProtoMsg(message: EventNewTransmission): EventNewTransmissionProtoMsg {
    return {
      typeUrl: '/injective.ocr.v1beta1.EventNewTransmission',
      value: EventNewTransmission.encode(message).finish(),
    };
  },
};
function createBaseEventConfigSet(): EventConfigSet {
  return {
    configDigest: new Uint8Array(),
    previousConfigBlockNumber: BigInt(0),
    config: undefined,
    configInfo: undefined,
  };
}
export const EventConfigSet = {
  typeUrl: '/injective.ocr.v1beta1.EventConfigSet',
  encode(message: EventConfigSet, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.configDigest.length !== 0) {
      writer.uint32(10).bytes(message.configDigest);
    }
    if (message.previousConfigBlockNumber !== BigInt(0)) {
      writer.uint32(16).int64(message.previousConfigBlockNumber);
    }
    if (message.config !== undefined) {
      FeedConfig.encode(message.config, writer.uint32(26).fork()).ldelim();
    }
    if (message.configInfo !== undefined) {
      FeedConfigInfo.encode(message.configInfo, writer.uint32(34).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): EventConfigSet {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEventConfigSet();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.configDigest = reader.bytes();
          break;
        case 2:
          message.previousConfigBlockNumber = reader.int64();
          break;
        case 3:
          message.config = FeedConfig.decode(reader, reader.uint32());
          break;
        case 4:
          message.configInfo = FeedConfigInfo.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<EventConfigSet>): EventConfigSet {
    const message = createBaseEventConfigSet();
    message.configDigest = object.configDigest ?? new Uint8Array();
    message.previousConfigBlockNumber =
      object.previousConfigBlockNumber !== undefined && object.previousConfigBlockNumber !== null
        ? BigInt(object.previousConfigBlockNumber.toString())
        : BigInt(0);
    message.config =
      object.config !== undefined && object.config !== null ? FeedConfig.fromPartial(object.config) : undefined;
    message.configInfo =
      object.configInfo !== undefined && object.configInfo !== null
        ? FeedConfigInfo.fromPartial(object.configInfo)
        : undefined;
    return message;
  },
  fromAmino(object: EventConfigSetAmino): EventConfigSet {
    const message = createBaseEventConfigSet();
    if (object.config_digest !== undefined && object.config_digest !== null) {
      message.configDigest = bytesFromBase64(object.config_digest);
    }
    if (object.previous_config_block_number !== undefined && object.previous_config_block_number !== null) {
      message.previousConfigBlockNumber = BigInt(object.previous_config_block_number);
    }
    if (object.config !== undefined && object.config !== null) {
      message.config = FeedConfig.fromAmino(object.config);
    }
    if (object.config_info !== undefined && object.config_info !== null) {
      message.configInfo = FeedConfigInfo.fromAmino(object.config_info);
    }
    return message;
  },
  toAmino(message: EventConfigSet): EventConfigSetAmino {
    const obj: any = {};
    obj.config_digest = message.configDigest ? base64FromBytes(message.configDigest) : undefined;
    obj.previous_config_block_number =
      message.previousConfigBlockNumber !== BigInt(0) ? (message.previousConfigBlockNumber?.toString)() : undefined;
    obj.config = message.config ? FeedConfig.toAmino(message.config) : undefined;
    obj.config_info = message.configInfo ? FeedConfigInfo.toAmino(message.configInfo) : undefined;
    return obj;
  },
  fromAminoMsg(object: EventConfigSetAminoMsg): EventConfigSet {
    return EventConfigSet.fromAmino(object.value);
  },
  fromProtoMsg(message: EventConfigSetProtoMsg): EventConfigSet {
    return EventConfigSet.decode(message.value);
  },
  toProto(message: EventConfigSet): Uint8Array {
    return EventConfigSet.encode(message).finish();
  },
  toProtoMsg(message: EventConfigSet): EventConfigSetProtoMsg {
    return {
      typeUrl: '/injective.ocr.v1beta1.EventConfigSet',
      value: EventConfigSet.encode(message).finish(),
    };
  },
};
