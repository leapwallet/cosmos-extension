/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable @typescript-eslint/ban-ts-comment */
//@ts-nocheck
import { Any, AnyAmino, AnyProtoMsg, AnySDKType } from 'cosmjs-types/google/protobuf/any';
import { Timestamp } from 'cosmjs-types/google/protobuf/timestamp';

import { BinaryReader, BinaryWriter } from '../../../../../binary';
import { fromTimestamp, toTimestamp } from '../../../../../helpers';
import {
  ClearAdminProposal,
  ClearAdminProposalProtoMsg,
  ClearAdminProposalSDKType,
  ExecuteContractProposal,
  ExecuteContractProposalProtoMsg,
  ExecuteContractProposalSDKType,
  InstantiateContract2Proposal,
  InstantiateContract2ProposalProtoMsg,
  InstantiateContract2ProposalSDKType,
  InstantiateContractProposal,
  InstantiateContractProposalProtoMsg,
  InstantiateContractProposalSDKType,
  MigrateContractProposal,
  MigrateContractProposalProtoMsg,
  MigrateContractProposalSDKType,
  PinCodesProposal,
  PinCodesProposalProtoMsg,
  PinCodesProposalSDKType,
  StoreAndInstantiateContractProposal,
  StoreAndInstantiateContractProposalProtoMsg,
  StoreAndInstantiateContractProposalSDKType,
  StoreCodeProposal,
  StoreCodeProposalProtoMsg,
  StoreCodeProposalSDKType,
  SudoContractProposal,
  SudoContractProposalProtoMsg,
  SudoContractProposalSDKType,
  UnpinCodesProposal,
  UnpinCodesProposalProtoMsg,
  UnpinCodesProposalSDKType,
  UpdateAdminProposal,
  UpdateAdminProposalProtoMsg,
  UpdateAdminProposalSDKType,
  UpdateInstantiateConfigProposal,
  UpdateInstantiateConfigProposalProtoMsg,
  UpdateInstantiateConfigProposalSDKType,
} from '../../../cosmwasm/wasm/v1/proposal_legacy';
import {
  AtomicMarketOrderFeeMultiplierScheduleProposal,
  AtomicMarketOrderFeeMultiplierScheduleProposalProtoMsg,
  AtomicMarketOrderFeeMultiplierScheduleProposalSDKType,
  BatchCommunityPoolSpendProposal,
  BatchCommunityPoolSpendProposalProtoMsg,
  BatchCommunityPoolSpendProposalSDKType,
  BatchExchangeModificationProposal,
  BatchExchangeModificationProposalProtoMsg,
  BatchExchangeModificationProposalSDKType,
  BinaryOptionsMarketLaunchProposal,
  BinaryOptionsMarketLaunchProposalProtoMsg,
  BinaryOptionsMarketLaunchProposalSDKType,
  BinaryOptionsMarketParamUpdateProposal,
  BinaryOptionsMarketParamUpdateProposalProtoMsg,
  BinaryOptionsMarketParamUpdateProposalSDKType,
  DerivativeMarketParamUpdateProposal,
  DerivativeMarketParamUpdateProposalProtoMsg,
  DerivativeMarketParamUpdateProposalSDKType,
  ExpiryFuturesMarketLaunchProposal,
  ExpiryFuturesMarketLaunchProposalProtoMsg,
  ExpiryFuturesMarketLaunchProposalSDKType,
  FeeDiscountProposal,
  FeeDiscountProposalProtoMsg,
  FeeDiscountProposalSDKType,
  MarketForcedSettlementProposal,
  MarketForcedSettlementProposalProtoMsg,
  MarketForcedSettlementProposalSDKType,
  PerpetualMarketLaunchProposal,
  PerpetualMarketLaunchProposalProtoMsg,
  PerpetualMarketLaunchProposalSDKType,
  SpotMarketLaunchProposal,
  SpotMarketLaunchProposalProtoMsg,
  SpotMarketLaunchProposalSDKType,
  SpotMarketParamUpdateProposal,
  SpotMarketParamUpdateProposalProtoMsg,
  SpotMarketParamUpdateProposalSDKType,
  TradingRewardCampaignLaunchProposal,
  TradingRewardCampaignLaunchProposalProtoMsg,
  TradingRewardCampaignLaunchProposalSDKType,
  TradingRewardCampaignUpdateProposal,
  TradingRewardCampaignUpdateProposalProtoMsg,
  TradingRewardCampaignUpdateProposalSDKType,
  TradingRewardPendingPointsUpdateProposal,
  TradingRewardPendingPointsUpdateProposalProtoMsg,
  TradingRewardPendingPointsUpdateProposalSDKType,
  UpdateDenomDecimalsProposal,
  UpdateDenomDecimalsProposalProtoMsg,
  UpdateDenomDecimalsProposalSDKType,
} from '../../../injective/exchange/v1beta1/proposal';
import {
  SetBatchConfigProposal,
  SetBatchConfigProposalProtoMsg,
  SetBatchConfigProposalSDKType,
  SetConfigProposal,
  SetConfigProposalProtoMsg,
  SetConfigProposalSDKType,
} from '../../../injective/ocr/v1beta1/ocr';
import {
  AuthorizeBandOracleRequestProposal,
  AuthorizeBandOracleRequestProposalProtoMsg,
  AuthorizeBandOracleRequestProposalSDKType,
  EnableBandIBCProposal,
  EnableBandIBCProposalProtoMsg,
  EnableBandIBCProposalSDKType,
  GrantBandOraclePrivilegeProposal,
  GrantBandOraclePrivilegeProposalProtoMsg,
  GrantBandOraclePrivilegeProposalSDKType,
  GrantPriceFeederPrivilegeProposal,
  GrantPriceFeederPrivilegeProposalProtoMsg,
  GrantPriceFeederPrivilegeProposalSDKType,
  GrantProviderPrivilegeProposal,
  GrantProviderPrivilegeProposalProtoMsg,
  GrantProviderPrivilegeProposalSDKType,
  GrantStorkPublisherPrivilegeProposal,
  GrantStorkPublisherPrivilegeProposalProtoMsg,
  GrantStorkPublisherPrivilegeProposalSDKType,
  RevokeBandOraclePrivilegeProposal,
  RevokeBandOraclePrivilegeProposalProtoMsg,
  RevokeBandOraclePrivilegeProposalSDKType,
  RevokePriceFeederPrivilegeProposal,
  RevokePriceFeederPrivilegeProposalProtoMsg,
  RevokePriceFeederPrivilegeProposalSDKType,
  RevokeProviderPrivilegeProposal,
  RevokeProviderPrivilegeProposalProtoMsg,
  RevokeProviderPrivilegeProposalSDKType,
  RevokeStorkPublisherPrivilegeProposal,
  RevokeStorkPublisherPrivilegeProposalProtoMsg,
  RevokeStorkPublisherPrivilegeProposalSDKType,
  UpdateBandOracleRequestProposal,
  UpdateBandOracleRequestProposalProtoMsg,
  UpdateBandOracleRequestProposalSDKType,
} from '../../../injective/oracle/v1beta1/proposal';
import {
  BatchContractDeregistrationProposal,
  BatchContractDeregistrationProposalProtoMsg,
  BatchContractDeregistrationProposalSDKType,
  BatchContractRegistrationRequestProposal,
  BatchContractRegistrationRequestProposalProtoMsg,
  BatchContractRegistrationRequestProposalSDKType,
  BatchStoreCodeProposal,
  BatchStoreCodeProposalProtoMsg,
  BatchStoreCodeProposalSDKType,
  ContractRegistrationRequest,
  ContractRegistrationRequestProposal,
  ContractRegistrationRequestProposalProtoMsg,
  ContractRegistrationRequestProposalSDKType,
  ContractRegistrationRequestProtoMsg,
  ContractRegistrationRequestSDKType,
} from '../../../injective/wasmx/v1/proposal';
import { Coin, CoinAmino, CoinSDKType } from '../../base/v1beta1/coin';
import {
  CommunityPoolSpendProposal,
  CommunityPoolSpendProposalProtoMsg,
  CommunityPoolSpendProposalSDKType,
  CommunityPoolSpendProposalWithDeposit,
  CommunityPoolSpendProposalWithDepositProtoMsg,
  CommunityPoolSpendProposalWithDepositSDKType,
} from '../../distribution/v1beta1/distribution';
import {
  ParameterChangeProposal,
  ParameterChangeProposalProtoMsg,
  ParameterChangeProposalSDKType,
} from '../../params/v1beta1/params';
import {
  CancelSoftwareUpgradeProposal,
  CancelSoftwareUpgradeProposalProtoMsg,
  CancelSoftwareUpgradeProposalSDKType,
  SoftwareUpgradeProposal,
  SoftwareUpgradeProposalProtoMsg,
  SoftwareUpgradeProposalSDKType,
} from '../../upgrade/v1beta1/upgrade';
import { TextProposal, TextProposalProtoMsg, TextProposalSDKType } from '../v1beta1/gov';
import {
  Params,
  ParamsAmino,
  ParamsSDKType,
  VoteOption,
  WeightedVoteOption,
  WeightedVoteOptionAmino,
  WeightedVoteOptionSDKType,
} from './gov';
/**
 * MsgSubmitProposal defines an sdk.Msg type that supports submitting arbitrary
 * proposal Content.
 */
export interface MsgSubmitProposal {
  /** messages are the arbitrary messages to be executed if proposal passes. */
  messages: Any[];
  /** initial_deposit is the deposit value that must be paid at proposal submission. */
  initialDeposit: Coin[];
  /** proposer is the account address of the proposer. */
  proposer: string;
  /** metadata is any arbitrary metadata attached to the proposal. */
  metadata: string;
  /**
   * title is the title of the proposal.
   *
   * Since: cosmos-sdk 0.47
   */
  title: string;
  /**
   * summary is the summary of the proposal
   *
   * Since: cosmos-sdk 0.47
   */
  summary: string;
  /**
   * expedited defines if the proposal is expedited or not
   *
   * Since: cosmos-sdk 0.50
   */
  expedited: boolean;
}
export interface MsgSubmitProposalProtoMsg {
  typeUrl: '/cosmos.gov.v1.MsgSubmitProposal';
  value: Uint8Array;
}
/**
 * MsgSubmitProposal defines an sdk.Msg type that supports submitting arbitrary
 * proposal Content.
 */
export interface MsgSubmitProposalAmino {
  /** messages are the arbitrary messages to be executed if proposal passes. */
  messages?: AnyAmino[];
  /** initial_deposit is the deposit value that must be paid at proposal submission. */
  initial_deposit: CoinAmino[];
  /** proposer is the account address of the proposer. */
  proposer?: string;
  /** metadata is any arbitrary metadata attached to the proposal. */
  metadata?: string;
  /**
   * title is the title of the proposal.
   *
   * Since: cosmos-sdk 0.47
   */
  title?: string;
  /**
   * summary is the summary of the proposal
   *
   * Since: cosmos-sdk 0.47
   */
  summary?: string;
  /**
   * expedited defines if the proposal is expedited or not
   *
   * Since: cosmos-sdk 0.50
   */
  expedited?: boolean;
}
export interface MsgSubmitProposalAminoMsg {
  type: 'cosmos-sdk/v1/MsgSubmitProposal';
  value: MsgSubmitProposalAmino;
}
/**
 * MsgSubmitProposal defines an sdk.Msg type that supports submitting arbitrary
 * proposal Content.
 */
export interface MsgSubmitProposalSDKType {
  messages: AnySDKType[];
  initial_deposit: CoinSDKType[];
  proposer: string;
  metadata: string;
  title: string;
  summary: string;
  expedited: boolean;
}
/** MsgSubmitProposalResponse defines the Msg/SubmitProposal response type. */
export interface MsgSubmitProposalResponse {
  /** proposal_id defines the unique id of the proposal. */
  proposalId: bigint;
}
export interface MsgSubmitProposalResponseProtoMsg {
  typeUrl: '/cosmos.gov.v1.MsgSubmitProposalResponse';
  value: Uint8Array;
}
/** MsgSubmitProposalResponse defines the Msg/SubmitProposal response type. */
export interface MsgSubmitProposalResponseAmino {
  /** proposal_id defines the unique id of the proposal. */
  proposal_id?: string;
}
export interface MsgSubmitProposalResponseAminoMsg {
  type: 'cosmos-sdk/v1/MsgSubmitProposalResponse';
  value: MsgSubmitProposalResponseAmino;
}
/** MsgSubmitProposalResponse defines the Msg/SubmitProposal response type. */
export interface MsgSubmitProposalResponseSDKType {
  proposal_id: bigint;
}
/**
 * MsgExecLegacyContent is used to wrap the legacy content field into a message.
 * This ensures backwards compatibility with v1beta1.MsgSubmitProposal.
 */
export interface MsgExecLegacyContent {
  /** content is the proposal's content. */
  content?:
    | CommunityPoolSpendProposal
    | CommunityPoolSpendProposalWithDeposit
    | TextProposal
    | ParameterChangeProposal
    | SoftwareUpgradeProposal
    | CancelSoftwareUpgradeProposal
    | StoreCodeProposal
    | InstantiateContractProposal
    | InstantiateContract2Proposal
    | MigrateContractProposal
    | SudoContractProposal
    | ExecuteContractProposal
    | UpdateAdminProposal
    | ClearAdminProposal
    | PinCodesProposal
    | UnpinCodesProposal
    | UpdateInstantiateConfigProposal
    | StoreAndInstantiateContractProposal
    | SpotMarketParamUpdateProposal
    | BatchExchangeModificationProposal
    | SpotMarketLaunchProposal
    | PerpetualMarketLaunchProposal
    | BinaryOptionsMarketLaunchProposal
    | ExpiryFuturesMarketLaunchProposal
    | DerivativeMarketParamUpdateProposal
    | MarketForcedSettlementProposal
    | UpdateDenomDecimalsProposal
    | BinaryOptionsMarketParamUpdateProposal
    | TradingRewardCampaignLaunchProposal
    | TradingRewardCampaignUpdateProposal
    | TradingRewardPendingPointsUpdateProposal
    | FeeDiscountProposal
    | BatchCommunityPoolSpendProposal
    | AtomicMarketOrderFeeMultiplierScheduleProposal
    | SetConfigProposal
    | SetBatchConfigProposal
    | GrantBandOraclePrivilegeProposal
    | RevokeBandOraclePrivilegeProposal
    | GrantPriceFeederPrivilegeProposal
    | GrantProviderPrivilegeProposal
    | RevokeProviderPrivilegeProposal
    | RevokePriceFeederPrivilegeProposal
    | AuthorizeBandOracleRequestProposal
    | UpdateBandOracleRequestProposal
    | EnableBandIBCProposal
    | GrantStorkPublisherPrivilegeProposal
    | RevokeStorkPublisherPrivilegeProposal
    | ContractRegistrationRequestProposal
    | BatchContractRegistrationRequestProposal
    | BatchContractDeregistrationProposal
    | ContractRegistrationRequest
    | BatchStoreCodeProposal
    | Any
    | undefined;
  /** authority must be the gov module address. */
  authority: string;
}
export interface MsgExecLegacyContentProtoMsg {
  typeUrl: '/cosmos.gov.v1.MsgExecLegacyContent';
  value: Uint8Array;
}
export type MsgExecLegacyContentEncoded = Omit<MsgExecLegacyContent, 'content'> & {
  /** content is the proposal's content. */ content?:
    | CommunityPoolSpendProposalProtoMsg
    | CommunityPoolSpendProposalWithDepositProtoMsg
    | TextProposalProtoMsg
    | ParameterChangeProposalProtoMsg
    | SoftwareUpgradeProposalProtoMsg
    | CancelSoftwareUpgradeProposalProtoMsg
    | StoreCodeProposalProtoMsg
    | InstantiateContractProposalProtoMsg
    | InstantiateContract2ProposalProtoMsg
    | MigrateContractProposalProtoMsg
    | SudoContractProposalProtoMsg
    | ExecuteContractProposalProtoMsg
    | UpdateAdminProposalProtoMsg
    | ClearAdminProposalProtoMsg
    | PinCodesProposalProtoMsg
    | UnpinCodesProposalProtoMsg
    | UpdateInstantiateConfigProposalProtoMsg
    | StoreAndInstantiateContractProposalProtoMsg
    | SpotMarketParamUpdateProposalProtoMsg
    | BatchExchangeModificationProposalProtoMsg
    | SpotMarketLaunchProposalProtoMsg
    | PerpetualMarketLaunchProposalProtoMsg
    | BinaryOptionsMarketLaunchProposalProtoMsg
    | ExpiryFuturesMarketLaunchProposalProtoMsg
    | DerivativeMarketParamUpdateProposalProtoMsg
    | MarketForcedSettlementProposalProtoMsg
    | UpdateDenomDecimalsProposalProtoMsg
    | BinaryOptionsMarketParamUpdateProposalProtoMsg
    | TradingRewardCampaignLaunchProposalProtoMsg
    | TradingRewardCampaignUpdateProposalProtoMsg
    | TradingRewardPendingPointsUpdateProposalProtoMsg
    | FeeDiscountProposalProtoMsg
    | BatchCommunityPoolSpendProposalProtoMsg
    | AtomicMarketOrderFeeMultiplierScheduleProposalProtoMsg
    | SetConfigProposalProtoMsg
    | SetBatchConfigProposalProtoMsg
    | GrantBandOraclePrivilegeProposalProtoMsg
    | RevokeBandOraclePrivilegeProposalProtoMsg
    | GrantPriceFeederPrivilegeProposalProtoMsg
    | GrantProviderPrivilegeProposalProtoMsg
    | RevokeProviderPrivilegeProposalProtoMsg
    | RevokePriceFeederPrivilegeProposalProtoMsg
    | AuthorizeBandOracleRequestProposalProtoMsg
    | UpdateBandOracleRequestProposalProtoMsg
    | EnableBandIBCProposalProtoMsg
    | GrantStorkPublisherPrivilegeProposalProtoMsg
    | RevokeStorkPublisherPrivilegeProposalProtoMsg
    | ContractRegistrationRequestProposalProtoMsg
    | BatchContractRegistrationRequestProposalProtoMsg
    | BatchContractDeregistrationProposalProtoMsg
    | ContractRegistrationRequestProtoMsg
    | BatchStoreCodeProposalProtoMsg
    | AnyProtoMsg
    | undefined;
};
/**
 * MsgExecLegacyContent is used to wrap the legacy content field into a message.
 * This ensures backwards compatibility with v1beta1.MsgSubmitProposal.
 */
export interface MsgExecLegacyContentAmino {
  /** content is the proposal's content. */
  content?: AnyAmino;
  /** authority must be the gov module address. */
  authority?: string;
}
export interface MsgExecLegacyContentAminoMsg {
  type: 'cosmos-sdk/v1/MsgExecLegacyContent';
  value: MsgExecLegacyContentAmino;
}
/**
 * MsgExecLegacyContent is used to wrap the legacy content field into a message.
 * This ensures backwards compatibility with v1beta1.MsgSubmitProposal.
 */
export interface MsgExecLegacyContentSDKType {
  content?:
    | CommunityPoolSpendProposalSDKType
    | CommunityPoolSpendProposalWithDepositSDKType
    | TextProposalSDKType
    | ParameterChangeProposalSDKType
    | SoftwareUpgradeProposalSDKType
    | CancelSoftwareUpgradeProposalSDKType
    | StoreCodeProposalSDKType
    | InstantiateContractProposalSDKType
    | InstantiateContract2ProposalSDKType
    | MigrateContractProposalSDKType
    | SudoContractProposalSDKType
    | ExecuteContractProposalSDKType
    | UpdateAdminProposalSDKType
    | ClearAdminProposalSDKType
    | PinCodesProposalSDKType
    | UnpinCodesProposalSDKType
    | UpdateInstantiateConfigProposalSDKType
    | StoreAndInstantiateContractProposalSDKType
    | SpotMarketParamUpdateProposalSDKType
    | BatchExchangeModificationProposalSDKType
    | SpotMarketLaunchProposalSDKType
    | PerpetualMarketLaunchProposalSDKType
    | BinaryOptionsMarketLaunchProposalSDKType
    | ExpiryFuturesMarketLaunchProposalSDKType
    | DerivativeMarketParamUpdateProposalSDKType
    | MarketForcedSettlementProposalSDKType
    | UpdateDenomDecimalsProposalSDKType
    | BinaryOptionsMarketParamUpdateProposalSDKType
    | TradingRewardCampaignLaunchProposalSDKType
    | TradingRewardCampaignUpdateProposalSDKType
    | TradingRewardPendingPointsUpdateProposalSDKType
    | FeeDiscountProposalSDKType
    | BatchCommunityPoolSpendProposalSDKType
    | AtomicMarketOrderFeeMultiplierScheduleProposalSDKType
    | SetConfigProposalSDKType
    | SetBatchConfigProposalSDKType
    | GrantBandOraclePrivilegeProposalSDKType
    | RevokeBandOraclePrivilegeProposalSDKType
    | GrantPriceFeederPrivilegeProposalSDKType
    | GrantProviderPrivilegeProposalSDKType
    | RevokeProviderPrivilegeProposalSDKType
    | RevokePriceFeederPrivilegeProposalSDKType
    | AuthorizeBandOracleRequestProposalSDKType
    | UpdateBandOracleRequestProposalSDKType
    | EnableBandIBCProposalSDKType
    | GrantStorkPublisherPrivilegeProposalSDKType
    | RevokeStorkPublisherPrivilegeProposalSDKType
    | ContractRegistrationRequestProposalSDKType
    | BatchContractRegistrationRequestProposalSDKType
    | BatchContractDeregistrationProposalSDKType
    | ContractRegistrationRequestSDKType
    | BatchStoreCodeProposalSDKType
    | AnySDKType
    | undefined;
  authority: string;
}
/** MsgExecLegacyContentResponse defines the Msg/ExecLegacyContent response type. */
export interface MsgExecLegacyContentResponse {}
export interface MsgExecLegacyContentResponseProtoMsg {
  typeUrl: '/cosmos.gov.v1.MsgExecLegacyContentResponse';
  value: Uint8Array;
}
/** MsgExecLegacyContentResponse defines the Msg/ExecLegacyContent response type. */
export interface MsgExecLegacyContentResponseAmino {}
export interface MsgExecLegacyContentResponseAminoMsg {
  type: 'cosmos-sdk/v1/MsgExecLegacyContentResponse';
  value: MsgExecLegacyContentResponseAmino;
}
/** MsgExecLegacyContentResponse defines the Msg/ExecLegacyContent response type. */
export interface MsgExecLegacyContentResponseSDKType {}
/** MsgVote defines a message to cast a vote. */
export interface MsgVote {
  /** proposal_id defines the unique id of the proposal. */
  proposalId: bigint;
  /** voter is the voter address for the proposal. */
  voter: string;
  /** option defines the vote option. */
  option: VoteOption;
  /** metadata is any arbitrary metadata attached to the Vote. */
  metadata: string;
}
export interface MsgVoteProtoMsg {
  typeUrl: '/cosmos.gov.v1.MsgVote';
  value: Uint8Array;
}
/** MsgVote defines a message to cast a vote. */
export interface MsgVoteAmino {
  /** proposal_id defines the unique id of the proposal. */
  proposal_id: string;
  /** voter is the voter address for the proposal. */
  voter?: string;
  /** option defines the vote option. */
  option?: VoteOption;
  /** metadata is any arbitrary metadata attached to the Vote. */
  metadata?: string;
}
export interface MsgVoteAminoMsg {
  type: 'cosmos-sdk/v1/MsgVote';
  value: MsgVoteAmino;
}
/** MsgVote defines a message to cast a vote. */
export interface MsgVoteSDKType {
  proposal_id: bigint;
  voter: string;
  option: VoteOption;
  metadata: string;
}
/** MsgVoteResponse defines the Msg/Vote response type. */
export interface MsgVoteResponse {}
export interface MsgVoteResponseProtoMsg {
  typeUrl: '/cosmos.gov.v1.MsgVoteResponse';
  value: Uint8Array;
}
/** MsgVoteResponse defines the Msg/Vote response type. */
export interface MsgVoteResponseAmino {}
export interface MsgVoteResponseAminoMsg {
  type: 'cosmos-sdk/v1/MsgVoteResponse';
  value: MsgVoteResponseAmino;
}
/** MsgVoteResponse defines the Msg/Vote response type. */
export interface MsgVoteResponseSDKType {}
/** MsgVoteWeighted defines a message to cast a vote. */
export interface MsgVoteWeighted {
  /** proposal_id defines the unique id of the proposal. */
  proposalId: bigint;
  /** voter is the voter address for the proposal. */
  voter: string;
  /** options defines the weighted vote options. */
  options: WeightedVoteOption[];
  /** metadata is any arbitrary metadata attached to the VoteWeighted. */
  metadata: string;
}
export interface MsgVoteWeightedProtoMsg {
  typeUrl: '/cosmos.gov.v1.MsgVoteWeighted';
  value: Uint8Array;
}
/** MsgVoteWeighted defines a message to cast a vote. */
export interface MsgVoteWeightedAmino {
  /** proposal_id defines the unique id of the proposal. */
  proposal_id: string;
  /** voter is the voter address for the proposal. */
  voter?: string;
  /** options defines the weighted vote options. */
  options?: WeightedVoteOptionAmino[];
  /** metadata is any arbitrary metadata attached to the VoteWeighted. */
  metadata?: string;
}
export interface MsgVoteWeightedAminoMsg {
  type: 'cosmos-sdk/v1/MsgVoteWeighted';
  value: MsgVoteWeightedAmino;
}
/** MsgVoteWeighted defines a message to cast a vote. */
export interface MsgVoteWeightedSDKType {
  proposal_id: bigint;
  voter: string;
  options: WeightedVoteOptionSDKType[];
  metadata: string;
}
/** MsgVoteWeightedResponse defines the Msg/VoteWeighted response type. */
export interface MsgVoteWeightedResponse {}
export interface MsgVoteWeightedResponseProtoMsg {
  typeUrl: '/cosmos.gov.v1.MsgVoteWeightedResponse';
  value: Uint8Array;
}
/** MsgVoteWeightedResponse defines the Msg/VoteWeighted response type. */
export interface MsgVoteWeightedResponseAmino {}
export interface MsgVoteWeightedResponseAminoMsg {
  type: 'cosmos-sdk/v1/MsgVoteWeightedResponse';
  value: MsgVoteWeightedResponseAmino;
}
/** MsgVoteWeightedResponse defines the Msg/VoteWeighted response type. */
export interface MsgVoteWeightedResponseSDKType {}
/** MsgDeposit defines a message to submit a deposit to an existing proposal. */
export interface MsgDeposit {
  /** proposal_id defines the unique id of the proposal. */
  proposalId: bigint;
  /** depositor defines the deposit addresses from the proposals. */
  depositor: string;
  /** amount to be deposited by depositor. */
  amount: Coin[];
}
export interface MsgDepositProtoMsg {
  typeUrl: '/cosmos.gov.v1.MsgDeposit';
  value: Uint8Array;
}
/** MsgDeposit defines a message to submit a deposit to an existing proposal. */
export interface MsgDepositAmino {
  /** proposal_id defines the unique id of the proposal. */
  proposal_id: string;
  /** depositor defines the deposit addresses from the proposals. */
  depositor?: string;
  /** amount to be deposited by depositor. */
  amount: CoinAmino[];
}
export interface MsgDepositAminoMsg {
  type: 'cosmos-sdk/v1/MsgDeposit';
  value: MsgDepositAmino;
}
/** MsgDeposit defines a message to submit a deposit to an existing proposal. */
export interface MsgDepositSDKType {
  proposal_id: bigint;
  depositor: string;
  amount: CoinSDKType[];
}
/** MsgDepositResponse defines the Msg/Deposit response type. */
export interface MsgDepositResponse {}
export interface MsgDepositResponseProtoMsg {
  typeUrl: '/cosmos.gov.v1.MsgDepositResponse';
  value: Uint8Array;
}
/** MsgDepositResponse defines the Msg/Deposit response type. */
export interface MsgDepositResponseAmino {}
export interface MsgDepositResponseAminoMsg {
  type: 'cosmos-sdk/v1/MsgDepositResponse';
  value: MsgDepositResponseAmino;
}
/** MsgDepositResponse defines the Msg/Deposit response type. */
export interface MsgDepositResponseSDKType {}
/**
 * MsgUpdateParams is the Msg/UpdateParams request type.
 *
 * Since: cosmos-sdk 0.47
 */
export interface MsgUpdateParams {
  /** authority is the address that controls the module (defaults to x/gov unless overwritten). */
  authority: string;
  /**
   * params defines the x/gov parameters to update.
   *
   * NOTE: All parameters must be supplied.
   */
  params: Params;
}
export interface MsgUpdateParamsProtoMsg {
  typeUrl: '/cosmos.gov.v1.MsgUpdateParams';
  value: Uint8Array;
}
/**
 * MsgUpdateParams is the Msg/UpdateParams request type.
 *
 * Since: cosmos-sdk 0.47
 */
export interface MsgUpdateParamsAmino {
  /** authority is the address that controls the module (defaults to x/gov unless overwritten). */
  authority?: string;
  /**
   * params defines the x/gov parameters to update.
   *
   * NOTE: All parameters must be supplied.
   */
  params: ParamsAmino;
}
export interface MsgUpdateParamsAminoMsg {
  type: 'cosmos-sdk/x/gov/v1/MsgUpdateParams';
  value: MsgUpdateParamsAmino;
}
/**
 * MsgUpdateParams is the Msg/UpdateParams request type.
 *
 * Since: cosmos-sdk 0.47
 */
export interface MsgUpdateParamsSDKType {
  authority: string;
  params: ParamsSDKType;
}
/**
 * MsgUpdateParamsResponse defines the response structure for executing a
 * MsgUpdateParams message.
 *
 * Since: cosmos-sdk 0.47
 */
export interface MsgUpdateParamsResponse {}
export interface MsgUpdateParamsResponseProtoMsg {
  typeUrl: '/cosmos.gov.v1.MsgUpdateParamsResponse';
  value: Uint8Array;
}
/**
 * MsgUpdateParamsResponse defines the response structure for executing a
 * MsgUpdateParams message.
 *
 * Since: cosmos-sdk 0.47
 */
export interface MsgUpdateParamsResponseAmino {}
export interface MsgUpdateParamsResponseAminoMsg {
  type: 'cosmos-sdk/v1/MsgUpdateParamsResponse';
  value: MsgUpdateParamsResponseAmino;
}
/**
 * MsgUpdateParamsResponse defines the response structure for executing a
 * MsgUpdateParams message.
 *
 * Since: cosmos-sdk 0.47
 */
export interface MsgUpdateParamsResponseSDKType {}
/**
 * MsgCancelProposal is the Msg/CancelProposal request type.
 *
 * Since: cosmos-sdk 0.50
 */
export interface MsgCancelProposal {
  /** proposal_id defines the unique id of the proposal. */
  proposalId: bigint;
  /** proposer is the account address of the proposer. */
  proposer: string;
}
export interface MsgCancelProposalProtoMsg {
  typeUrl: '/cosmos.gov.v1.MsgCancelProposal';
  value: Uint8Array;
}
/**
 * MsgCancelProposal is the Msg/CancelProposal request type.
 *
 * Since: cosmos-sdk 0.50
 */
export interface MsgCancelProposalAmino {
  /** proposal_id defines the unique id of the proposal. */
  proposal_id: string;
  /** proposer is the account address of the proposer. */
  proposer?: string;
}
export interface MsgCancelProposalAminoMsg {
  type: 'cosmos-sdk/v1/MsgCancelProposal';
  value: MsgCancelProposalAmino;
}
/**
 * MsgCancelProposal is the Msg/CancelProposal request type.
 *
 * Since: cosmos-sdk 0.50
 */
export interface MsgCancelProposalSDKType {
  proposal_id: bigint;
  proposer: string;
}
/**
 * MsgCancelProposalResponse defines the response structure for executing a
 * MsgCancelProposal message.
 *
 * Since: cosmos-sdk 0.50
 */
export interface MsgCancelProposalResponse {
  /** proposal_id defines the unique id of the proposal. */
  proposalId: bigint;
  /** canceled_time is the time when proposal is canceled. */
  canceledTime: Date;
  /** canceled_height defines the block height at which the proposal is canceled. */
  canceledHeight: bigint;
}
export interface MsgCancelProposalResponseProtoMsg {
  typeUrl: '/cosmos.gov.v1.MsgCancelProposalResponse';
  value: Uint8Array;
}
/**
 * MsgCancelProposalResponse defines the response structure for executing a
 * MsgCancelProposal message.
 *
 * Since: cosmos-sdk 0.50
 */
export interface MsgCancelProposalResponseAmino {
  /** proposal_id defines the unique id of the proposal. */
  proposal_id: string;
  /** canceled_time is the time when proposal is canceled. */
  canceled_time?: string;
  /** canceled_height defines the block height at which the proposal is canceled. */
  canceled_height?: string;
}
export interface MsgCancelProposalResponseAminoMsg {
  type: 'cosmos-sdk/v1/MsgCancelProposalResponse';
  value: MsgCancelProposalResponseAmino;
}
/**
 * MsgCancelProposalResponse defines the response structure for executing a
 * MsgCancelProposal message.
 *
 * Since: cosmos-sdk 0.50
 */
export interface MsgCancelProposalResponseSDKType {
  proposal_id: bigint;
  canceled_time: Date;
  canceled_height: bigint;
}
function createBaseMsgSubmitProposal(): MsgSubmitProposal {
  return {
    messages: [],
    initialDeposit: [],
    proposer: '',
    metadata: '',
    title: '',
    summary: '',
    expedited: false,
  };
}
export const MsgSubmitProposal = {
  typeUrl: '/cosmos.gov.v1.MsgSubmitProposal',
  encode(message: MsgSubmitProposal, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    for (const v of message.messages) {
      Any.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    for (const v of message.initialDeposit) {
      Coin.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    if (message.proposer !== '') {
      writer.uint32(26).string(message.proposer);
    }
    if (message.metadata !== '') {
      writer.uint32(34).string(message.metadata);
    }
    if (message.title !== '') {
      writer.uint32(42).string(message.title);
    }
    if (message.summary !== '') {
      writer.uint32(50).string(message.summary);
    }
    if (message.expedited === true) {
      writer.uint32(56).bool(message.expedited);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgSubmitProposal {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSubmitProposal();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.messages.push(Any.decode(reader, reader.uint32()));
          break;
        case 2:
          message.initialDeposit.push(Coin.decode(reader, reader.uint32()));
          break;
        case 3:
          message.proposer = reader.string();
          break;
        case 4:
          message.metadata = reader.string();
          break;
        case 5:
          message.title = reader.string();
          break;
        case 6:
          message.summary = reader.string();
          break;
        case 7:
          message.expedited = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgSubmitProposal>): MsgSubmitProposal {
    const message = createBaseMsgSubmitProposal();
    message.messages = object.messages?.map((e) => Any.fromPartial(e)) || [];
    message.initialDeposit = object.initialDeposit?.map((e) => Coin.fromPartial(e)) || [];
    message.proposer = object.proposer ?? '';
    message.metadata = object.metadata ?? '';
    message.title = object.title ?? '';
    message.summary = object.summary ?? '';
    message.expedited = object.expedited ?? false;
    return message;
  },
  fromAmino(object: MsgSubmitProposalAmino): MsgSubmitProposal {
    const message = createBaseMsgSubmitProposal();
    message.messages = object.messages?.map((e) => Any.fromAmino(e)) || [];
    message.initialDeposit = object.initial_deposit?.map((e) => Coin.fromAmino(e)) || [];
    if (object.proposer !== undefined && object.proposer !== null) {
      message.proposer = object.proposer;
    }
    if (object.metadata !== undefined && object.metadata !== null) {
      message.metadata = object.metadata;
    }
    if (object.title !== undefined && object.title !== null) {
      message.title = object.title;
    }
    if (object.summary !== undefined && object.summary !== null) {
      message.summary = object.summary;
    }
    if (object.expedited !== undefined && object.expedited !== null) {
      message.expedited = object.expedited;
    }
    return message;
  },
  toAmino(message: MsgSubmitProposal): MsgSubmitProposalAmino {
    const obj: any = {};
    if (message.messages) {
      obj.messages = message.messages.map((e) => (e ? Any.toAmino(e) : undefined));
    } else {
      obj.messages = message.messages;
    }
    if (message.initialDeposit) {
      obj.initial_deposit = message.initialDeposit.map((e) => (e ? Coin.toAmino(e) : undefined));
    } else {
      obj.initial_deposit = message.initialDeposit;
    }
    obj.proposer = message.proposer === '' ? undefined : message.proposer;
    obj.metadata = message.metadata === '' ? undefined : message.metadata;
    obj.title = message.title === '' ? undefined : message.title;
    obj.summary = message.summary === '' ? undefined : message.summary;
    obj.expedited = message.expedited === false ? undefined : message.expedited;
    return obj;
  },
  fromAminoMsg(object: MsgSubmitProposalAminoMsg): MsgSubmitProposal {
    return MsgSubmitProposal.fromAmino(object.value);
  },
  toAminoMsg(message: MsgSubmitProposal): MsgSubmitProposalAminoMsg {
    return {
      type: 'cosmos-sdk/v1/MsgSubmitProposal',
      value: MsgSubmitProposal.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgSubmitProposalProtoMsg): MsgSubmitProposal {
    return MsgSubmitProposal.decode(message.value);
  },
  toProto(message: MsgSubmitProposal): Uint8Array {
    return MsgSubmitProposal.encode(message).finish();
  },
  toProtoMsg(message: MsgSubmitProposal): MsgSubmitProposalProtoMsg {
    return {
      typeUrl: '/cosmos.gov.v1.MsgSubmitProposal',
      value: MsgSubmitProposal.encode(message).finish(),
    };
  },
};
function createBaseMsgSubmitProposalResponse(): MsgSubmitProposalResponse {
  return {
    proposalId: BigInt(0),
  };
}
export const MsgSubmitProposalResponse = {
  typeUrl: '/cosmos.gov.v1.MsgSubmitProposalResponse',
  encode(message: MsgSubmitProposalResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.proposalId !== BigInt(0)) {
      writer.uint32(8).uint64(message.proposalId);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgSubmitProposalResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSubmitProposalResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.proposalId = reader.uint64();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgSubmitProposalResponse>): MsgSubmitProposalResponse {
    const message = createBaseMsgSubmitProposalResponse();
    message.proposalId =
      object.proposalId !== undefined && object.proposalId !== null ? BigInt(object.proposalId.toString()) : BigInt(0);
    return message;
  },
  fromAmino(object: MsgSubmitProposalResponseAmino): MsgSubmitProposalResponse {
    const message = createBaseMsgSubmitProposalResponse();
    if (object.proposal_id !== undefined && object.proposal_id !== null) {
      message.proposalId = BigInt(object.proposal_id);
    }
    return message;
  },
  toAmino(message: MsgSubmitProposalResponse): MsgSubmitProposalResponseAmino {
    const obj: any = {};
    obj.proposal_id = message.proposalId !== BigInt(0) ? (message.proposalId?.toString)() : undefined;
    return obj;
  },
  fromAminoMsg(object: MsgSubmitProposalResponseAminoMsg): MsgSubmitProposalResponse {
    return MsgSubmitProposalResponse.fromAmino(object.value);
  },
  toAminoMsg(message: MsgSubmitProposalResponse): MsgSubmitProposalResponseAminoMsg {
    return {
      type: 'cosmos-sdk/v1/MsgSubmitProposalResponse',
      value: MsgSubmitProposalResponse.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgSubmitProposalResponseProtoMsg): MsgSubmitProposalResponse {
    return MsgSubmitProposalResponse.decode(message.value);
  },
  toProto(message: MsgSubmitProposalResponse): Uint8Array {
    return MsgSubmitProposalResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgSubmitProposalResponse): MsgSubmitProposalResponseProtoMsg {
    return {
      typeUrl: '/cosmos.gov.v1.MsgSubmitProposalResponse',
      value: MsgSubmitProposalResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgExecLegacyContent(): MsgExecLegacyContent {
  return {
    content: undefined,
    authority: '',
  };
}
export const MsgExecLegacyContent = {
  typeUrl: '/cosmos.gov.v1.MsgExecLegacyContent',
  encode(message: MsgExecLegacyContent, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.content !== undefined) {
      Any.encode(message.content as Any, writer.uint32(10).fork()).ldelim();
    }
    if (message.authority !== '') {
      writer.uint32(18).string(message.authority);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgExecLegacyContent {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgExecLegacyContent();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.content = Cosmos_govv1beta1Content_InterfaceDecoder(reader) as Any;
          break;
        case 2:
          message.authority = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgExecLegacyContent>): MsgExecLegacyContent {
    const message = createBaseMsgExecLegacyContent();
    message.content =
      object.content !== undefined && object.content !== null ? Any.fromPartial(object.content) : undefined;
    message.authority = object.authority ?? '';
    return message;
  },
  fromAmino(object: MsgExecLegacyContentAmino): MsgExecLegacyContent {
    const message = createBaseMsgExecLegacyContent();
    if (object.content !== undefined && object.content !== null) {
      message.content = Cosmos_govv1beta1Content_FromAmino(object.content);
    }
    if (object.authority !== undefined && object.authority !== null) {
      message.authority = object.authority;
    }
    return message;
  },
  toAmino(message: MsgExecLegacyContent): MsgExecLegacyContentAmino {
    const obj: any = {};
    obj.content = message.content ? Cosmos_govv1beta1Content_ToAmino(message.content as Any) : undefined;
    obj.authority = message.authority === '' ? undefined : message.authority;
    return obj;
  },
  fromAminoMsg(object: MsgExecLegacyContentAminoMsg): MsgExecLegacyContent {
    return MsgExecLegacyContent.fromAmino(object.value);
  },
  toAminoMsg(message: MsgExecLegacyContent): MsgExecLegacyContentAminoMsg {
    return {
      type: 'cosmos-sdk/v1/MsgExecLegacyContent',
      value: MsgExecLegacyContent.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgExecLegacyContentProtoMsg): MsgExecLegacyContent {
    return MsgExecLegacyContent.decode(message.value);
  },
  toProto(message: MsgExecLegacyContent): Uint8Array {
    return MsgExecLegacyContent.encode(message).finish();
  },
  toProtoMsg(message: MsgExecLegacyContent): MsgExecLegacyContentProtoMsg {
    return {
      typeUrl: '/cosmos.gov.v1.MsgExecLegacyContent',
      value: MsgExecLegacyContent.encode(message).finish(),
    };
  },
};
function createBaseMsgExecLegacyContentResponse(): MsgExecLegacyContentResponse {
  return {};
}
export const MsgExecLegacyContentResponse = {
  typeUrl: '/cosmos.gov.v1.MsgExecLegacyContentResponse',
  encode(_: MsgExecLegacyContentResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgExecLegacyContentResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgExecLegacyContentResponse();
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
  fromPartial(_: Partial<MsgExecLegacyContentResponse>): MsgExecLegacyContentResponse {
    const message = createBaseMsgExecLegacyContentResponse();
    return message;
  },
  fromAmino(_: MsgExecLegacyContentResponseAmino): MsgExecLegacyContentResponse {
    const message = createBaseMsgExecLegacyContentResponse();
    return message;
  },
  toAmino(_: MsgExecLegacyContentResponse): MsgExecLegacyContentResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: MsgExecLegacyContentResponseAminoMsg): MsgExecLegacyContentResponse {
    return MsgExecLegacyContentResponse.fromAmino(object.value);
  },
  toAminoMsg(message: MsgExecLegacyContentResponse): MsgExecLegacyContentResponseAminoMsg {
    return {
      type: 'cosmos-sdk/v1/MsgExecLegacyContentResponse',
      value: MsgExecLegacyContentResponse.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgExecLegacyContentResponseProtoMsg): MsgExecLegacyContentResponse {
    return MsgExecLegacyContentResponse.decode(message.value);
  },
  toProto(message: MsgExecLegacyContentResponse): Uint8Array {
    return MsgExecLegacyContentResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgExecLegacyContentResponse): MsgExecLegacyContentResponseProtoMsg {
    return {
      typeUrl: '/cosmos.gov.v1.MsgExecLegacyContentResponse',
      value: MsgExecLegacyContentResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgVote(): MsgVote {
  return {
    proposalId: BigInt(0),
    voter: '',
    option: 0,
    metadata: '',
  };
}
export const MsgVote = {
  typeUrl: '/cosmos.gov.v1.MsgVote',
  encode(message: MsgVote, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.proposalId !== BigInt(0)) {
      writer.uint32(8).uint64(message.proposalId);
    }
    if (message.voter !== '') {
      writer.uint32(18).string(message.voter);
    }
    if (message.option !== 0) {
      writer.uint32(24).int32(message.option);
    }
    if (message.metadata !== '') {
      writer.uint32(34).string(message.metadata);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgVote {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgVote();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.proposalId = reader.uint64();
          break;
        case 2:
          message.voter = reader.string();
          break;
        case 3:
          message.option = reader.int32() as any;
          break;
        case 4:
          message.metadata = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgVote>): MsgVote {
    const message = createBaseMsgVote();
    message.proposalId =
      object.proposalId !== undefined && object.proposalId !== null ? BigInt(object.proposalId.toString()) : BigInt(0);
    message.voter = object.voter ?? '';
    message.option = object.option ?? 0;
    message.metadata = object.metadata ?? '';
    return message;
  },
  fromAmino(object: MsgVoteAmino): MsgVote {
    const message = createBaseMsgVote();
    if (object.proposal_id !== undefined && object.proposal_id !== null) {
      message.proposalId = BigInt(object.proposal_id);
    }
    if (object.voter !== undefined && object.voter !== null) {
      message.voter = object.voter;
    }
    if (object.option !== undefined && object.option !== null) {
      message.option = object.option;
    }
    if (object.metadata !== undefined && object.metadata !== null) {
      message.metadata = object.metadata;
    }
    return message;
  },
  toAmino(message: MsgVote): MsgVoteAmino {
    const obj: any = {};
    obj.proposal_id = message.proposalId ? (message.proposalId?.toString)() : '0';
    obj.voter = message.voter === '' ? undefined : message.voter;
    obj.option = message.option === 0 ? undefined : message.option;
    obj.metadata = message.metadata === '' ? undefined : message.metadata;
    return obj;
  },
  fromAminoMsg(object: MsgVoteAminoMsg): MsgVote {
    return MsgVote.fromAmino(object.value);
  },
  toAminoMsg(message: MsgVote): MsgVoteAminoMsg {
    return {
      type: 'cosmos-sdk/v1/MsgVote',
      value: MsgVote.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgVoteProtoMsg): MsgVote {
    return MsgVote.decode(message.value);
  },
  toProto(message: MsgVote): Uint8Array {
    return MsgVote.encode(message).finish();
  },
  toProtoMsg(message: MsgVote): MsgVoteProtoMsg {
    return {
      typeUrl: '/cosmos.gov.v1.MsgVote',
      value: MsgVote.encode(message).finish(),
    };
  },
};
function createBaseMsgVoteResponse(): MsgVoteResponse {
  return {};
}
export const MsgVoteResponse = {
  typeUrl: '/cosmos.gov.v1.MsgVoteResponse',
  encode(_: MsgVoteResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgVoteResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgVoteResponse();
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
  fromPartial(_: Partial<MsgVoteResponse>): MsgVoteResponse {
    const message = createBaseMsgVoteResponse();
    return message;
  },
  fromAmino(_: MsgVoteResponseAmino): MsgVoteResponse {
    const message = createBaseMsgVoteResponse();
    return message;
  },
  toAmino(_: MsgVoteResponse): MsgVoteResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: MsgVoteResponseAminoMsg): MsgVoteResponse {
    return MsgVoteResponse.fromAmino(object.value);
  },
  toAminoMsg(message: MsgVoteResponse): MsgVoteResponseAminoMsg {
    return {
      type: 'cosmos-sdk/v1/MsgVoteResponse',
      value: MsgVoteResponse.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgVoteResponseProtoMsg): MsgVoteResponse {
    return MsgVoteResponse.decode(message.value);
  },
  toProto(message: MsgVoteResponse): Uint8Array {
    return MsgVoteResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgVoteResponse): MsgVoteResponseProtoMsg {
    return {
      typeUrl: '/cosmos.gov.v1.MsgVoteResponse',
      value: MsgVoteResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgVoteWeighted(): MsgVoteWeighted {
  return {
    proposalId: BigInt(0),
    voter: '',
    options: [],
    metadata: '',
  };
}
export const MsgVoteWeighted = {
  typeUrl: '/cosmos.gov.v1.MsgVoteWeighted',
  encode(message: MsgVoteWeighted, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.proposalId !== BigInt(0)) {
      writer.uint32(8).uint64(message.proposalId);
    }
    if (message.voter !== '') {
      writer.uint32(18).string(message.voter);
    }
    for (const v of message.options) {
      WeightedVoteOption.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    if (message.metadata !== '') {
      writer.uint32(34).string(message.metadata);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgVoteWeighted {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgVoteWeighted();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.proposalId = reader.uint64();
          break;
        case 2:
          message.voter = reader.string();
          break;
        case 3:
          message.options.push(WeightedVoteOption.decode(reader, reader.uint32()));
          break;
        case 4:
          message.metadata = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgVoteWeighted>): MsgVoteWeighted {
    const message = createBaseMsgVoteWeighted();
    message.proposalId =
      object.proposalId !== undefined && object.proposalId !== null ? BigInt(object.proposalId.toString()) : BigInt(0);
    message.voter = object.voter ?? '';
    message.options = object.options?.map((e) => WeightedVoteOption.fromPartial(e)) || [];
    message.metadata = object.metadata ?? '';
    return message;
  },
  fromAmino(object: MsgVoteWeightedAmino): MsgVoteWeighted {
    const message = createBaseMsgVoteWeighted();
    if (object.proposal_id !== undefined && object.proposal_id !== null) {
      message.proposalId = BigInt(object.proposal_id);
    }
    if (object.voter !== undefined && object.voter !== null) {
      message.voter = object.voter;
    }
    message.options = object.options?.map((e) => WeightedVoteOption.fromAmino(e)) || [];
    if (object.metadata !== undefined && object.metadata !== null) {
      message.metadata = object.metadata;
    }
    return message;
  },
  toAmino(message: MsgVoteWeighted): MsgVoteWeightedAmino {
    const obj: any = {};
    obj.proposal_id = message.proposalId ? (message.proposalId?.toString)() : '0';
    obj.voter = message.voter === '' ? undefined : message.voter;
    if (message.options) {
      obj.options = message.options.map((e) => (e ? WeightedVoteOption.toAmino(e) : undefined));
    } else {
      obj.options = message.options;
    }
    obj.metadata = message.metadata === '' ? undefined : message.metadata;
    return obj;
  },
  fromAminoMsg(object: MsgVoteWeightedAminoMsg): MsgVoteWeighted {
    return MsgVoteWeighted.fromAmino(object.value);
  },
  toAminoMsg(message: MsgVoteWeighted): MsgVoteWeightedAminoMsg {
    return {
      type: 'cosmos-sdk/v1/MsgVoteWeighted',
      value: MsgVoteWeighted.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgVoteWeightedProtoMsg): MsgVoteWeighted {
    return MsgVoteWeighted.decode(message.value);
  },
  toProto(message: MsgVoteWeighted): Uint8Array {
    return MsgVoteWeighted.encode(message).finish();
  },
  toProtoMsg(message: MsgVoteWeighted): MsgVoteWeightedProtoMsg {
    return {
      typeUrl: '/cosmos.gov.v1.MsgVoteWeighted',
      value: MsgVoteWeighted.encode(message).finish(),
    };
  },
};
function createBaseMsgVoteWeightedResponse(): MsgVoteWeightedResponse {
  return {};
}
export const MsgVoteWeightedResponse = {
  typeUrl: '/cosmos.gov.v1.MsgVoteWeightedResponse',
  encode(_: MsgVoteWeightedResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgVoteWeightedResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgVoteWeightedResponse();
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
  fromPartial(_: Partial<MsgVoteWeightedResponse>): MsgVoteWeightedResponse {
    const message = createBaseMsgVoteWeightedResponse();
    return message;
  },
  fromAmino(_: MsgVoteWeightedResponseAmino): MsgVoteWeightedResponse {
    const message = createBaseMsgVoteWeightedResponse();
    return message;
  },
  toAmino(_: MsgVoteWeightedResponse): MsgVoteWeightedResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: MsgVoteWeightedResponseAminoMsg): MsgVoteWeightedResponse {
    return MsgVoteWeightedResponse.fromAmino(object.value);
  },
  toAminoMsg(message: MsgVoteWeightedResponse): MsgVoteWeightedResponseAminoMsg {
    return {
      type: 'cosmos-sdk/v1/MsgVoteWeightedResponse',
      value: MsgVoteWeightedResponse.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgVoteWeightedResponseProtoMsg): MsgVoteWeightedResponse {
    return MsgVoteWeightedResponse.decode(message.value);
  },
  toProto(message: MsgVoteWeightedResponse): Uint8Array {
    return MsgVoteWeightedResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgVoteWeightedResponse): MsgVoteWeightedResponseProtoMsg {
    return {
      typeUrl: '/cosmos.gov.v1.MsgVoteWeightedResponse',
      value: MsgVoteWeightedResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgDeposit(): MsgDeposit {
  return {
    proposalId: BigInt(0),
    depositor: '',
    amount: [],
  };
}
export const MsgDeposit = {
  typeUrl: '/cosmos.gov.v1.MsgDeposit',
  encode(message: MsgDeposit, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.proposalId !== BigInt(0)) {
      writer.uint32(8).uint64(message.proposalId);
    }
    if (message.depositor !== '') {
      writer.uint32(18).string(message.depositor);
    }
    for (const v of message.amount) {
      Coin.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgDeposit {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgDeposit();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.proposalId = reader.uint64();
          break;
        case 2:
          message.depositor = reader.string();
          break;
        case 3:
          message.amount.push(Coin.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgDeposit>): MsgDeposit {
    const message = createBaseMsgDeposit();
    message.proposalId =
      object.proposalId !== undefined && object.proposalId !== null ? BigInt(object.proposalId.toString()) : BigInt(0);
    message.depositor = object.depositor ?? '';
    message.amount = object.amount?.map((e) => Coin.fromPartial(e)) || [];
    return message;
  },
  fromAmino(object: MsgDepositAmino): MsgDeposit {
    const message = createBaseMsgDeposit();
    if (object.proposal_id !== undefined && object.proposal_id !== null) {
      message.proposalId = BigInt(object.proposal_id);
    }
    if (object.depositor !== undefined && object.depositor !== null) {
      message.depositor = object.depositor;
    }
    message.amount = object.amount?.map((e) => Coin.fromAmino(e)) || [];
    return message;
  },
  toAmino(message: MsgDeposit): MsgDepositAmino {
    const obj: any = {};
    obj.proposal_id = message.proposalId ? (message.proposalId?.toString)() : '0';
    obj.depositor = message.depositor === '' ? undefined : message.depositor;
    if (message.amount) {
      obj.amount = message.amount.map((e) => (e ? Coin.toAmino(e) : undefined));
    } else {
      obj.amount = message.amount;
    }
    return obj;
  },
  fromAminoMsg(object: MsgDepositAminoMsg): MsgDeposit {
    return MsgDeposit.fromAmino(object.value);
  },
  toAminoMsg(message: MsgDeposit): MsgDepositAminoMsg {
    return {
      type: 'cosmos-sdk/v1/MsgDeposit',
      value: MsgDeposit.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgDepositProtoMsg): MsgDeposit {
    return MsgDeposit.decode(message.value);
  },
  toProto(message: MsgDeposit): Uint8Array {
    return MsgDeposit.encode(message).finish();
  },
  toProtoMsg(message: MsgDeposit): MsgDepositProtoMsg {
    return {
      typeUrl: '/cosmos.gov.v1.MsgDeposit',
      value: MsgDeposit.encode(message).finish(),
    };
  },
};
function createBaseMsgDepositResponse(): MsgDepositResponse {
  return {};
}
export const MsgDepositResponse = {
  typeUrl: '/cosmos.gov.v1.MsgDepositResponse',
  encode(_: MsgDepositResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgDepositResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgDepositResponse();
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
  fromPartial(_: Partial<MsgDepositResponse>): MsgDepositResponse {
    const message = createBaseMsgDepositResponse();
    return message;
  },
  fromAmino(_: MsgDepositResponseAmino): MsgDepositResponse {
    const message = createBaseMsgDepositResponse();
    return message;
  },
  toAmino(_: MsgDepositResponse): MsgDepositResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: MsgDepositResponseAminoMsg): MsgDepositResponse {
    return MsgDepositResponse.fromAmino(object.value);
  },
  toAminoMsg(message: MsgDepositResponse): MsgDepositResponseAminoMsg {
    return {
      type: 'cosmos-sdk/v1/MsgDepositResponse',
      value: MsgDepositResponse.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgDepositResponseProtoMsg): MsgDepositResponse {
    return MsgDepositResponse.decode(message.value);
  },
  toProto(message: MsgDepositResponse): Uint8Array {
    return MsgDepositResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgDepositResponse): MsgDepositResponseProtoMsg {
    return {
      typeUrl: '/cosmos.gov.v1.MsgDepositResponse',
      value: MsgDepositResponse.encode(message).finish(),
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
  typeUrl: '/cosmos.gov.v1.MsgUpdateParams',
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
    obj.params = message.params ? Params.toAmino(message.params) : Params.toAmino(Params.fromPartial({}));
    return obj;
  },
  fromAminoMsg(object: MsgUpdateParamsAminoMsg): MsgUpdateParams {
    return MsgUpdateParams.fromAmino(object.value);
  },
  toAminoMsg(message: MsgUpdateParams): MsgUpdateParamsAminoMsg {
    return {
      type: 'cosmos-sdk/x/gov/v1/MsgUpdateParams',
      value: MsgUpdateParams.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgUpdateParamsProtoMsg): MsgUpdateParams {
    return MsgUpdateParams.decode(message.value);
  },
  toProto(message: MsgUpdateParams): Uint8Array {
    return MsgUpdateParams.encode(message).finish();
  },
  toProtoMsg(message: MsgUpdateParams): MsgUpdateParamsProtoMsg {
    return {
      typeUrl: '/cosmos.gov.v1.MsgUpdateParams',
      value: MsgUpdateParams.encode(message).finish(),
    };
  },
};
function createBaseMsgUpdateParamsResponse(): MsgUpdateParamsResponse {
  return {};
}
export const MsgUpdateParamsResponse = {
  typeUrl: '/cosmos.gov.v1.MsgUpdateParamsResponse',
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
  toAminoMsg(message: MsgUpdateParamsResponse): MsgUpdateParamsResponseAminoMsg {
    return {
      type: 'cosmos-sdk/v1/MsgUpdateParamsResponse',
      value: MsgUpdateParamsResponse.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgUpdateParamsResponseProtoMsg): MsgUpdateParamsResponse {
    return MsgUpdateParamsResponse.decode(message.value);
  },
  toProto(message: MsgUpdateParamsResponse): Uint8Array {
    return MsgUpdateParamsResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgUpdateParamsResponse): MsgUpdateParamsResponseProtoMsg {
    return {
      typeUrl: '/cosmos.gov.v1.MsgUpdateParamsResponse',
      value: MsgUpdateParamsResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgCancelProposal(): MsgCancelProposal {
  return {
    proposalId: BigInt(0),
    proposer: '',
  };
}
export const MsgCancelProposal = {
  typeUrl: '/cosmos.gov.v1.MsgCancelProposal',
  encode(message: MsgCancelProposal, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.proposalId !== BigInt(0)) {
      writer.uint32(8).uint64(message.proposalId);
    }
    if (message.proposer !== '') {
      writer.uint32(18).string(message.proposer);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgCancelProposal {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCancelProposal();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.proposalId = reader.uint64();
          break;
        case 2:
          message.proposer = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgCancelProposal>): MsgCancelProposal {
    const message = createBaseMsgCancelProposal();
    message.proposalId =
      object.proposalId !== undefined && object.proposalId !== null ? BigInt(object.proposalId.toString()) : BigInt(0);
    message.proposer = object.proposer ?? '';
    return message;
  },
  fromAmino(object: MsgCancelProposalAmino): MsgCancelProposal {
    const message = createBaseMsgCancelProposal();
    if (object.proposal_id !== undefined && object.proposal_id !== null) {
      message.proposalId = BigInt(object.proposal_id);
    }
    if (object.proposer !== undefined && object.proposer !== null) {
      message.proposer = object.proposer;
    }
    return message;
  },
  toAmino(message: MsgCancelProposal): MsgCancelProposalAmino {
    const obj: any = {};
    obj.proposal_id = message.proposalId ? (message.proposalId?.toString)() : '0';
    obj.proposer = message.proposer === '' ? undefined : message.proposer;
    return obj;
  },
  fromAminoMsg(object: MsgCancelProposalAminoMsg): MsgCancelProposal {
    return MsgCancelProposal.fromAmino(object.value);
  },
  toAminoMsg(message: MsgCancelProposal): MsgCancelProposalAminoMsg {
    return {
      type: 'cosmos-sdk/v1/MsgCancelProposal',
      value: MsgCancelProposal.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgCancelProposalProtoMsg): MsgCancelProposal {
    return MsgCancelProposal.decode(message.value);
  },
  toProto(message: MsgCancelProposal): Uint8Array {
    return MsgCancelProposal.encode(message).finish();
  },
  toProtoMsg(message: MsgCancelProposal): MsgCancelProposalProtoMsg {
    return {
      typeUrl: '/cosmos.gov.v1.MsgCancelProposal',
      value: MsgCancelProposal.encode(message).finish(),
    };
  },
};
function createBaseMsgCancelProposalResponse(): MsgCancelProposalResponse {
  return {
    proposalId: BigInt(0),
    canceledTime: new Date(),
    canceledHeight: BigInt(0),
  };
}
export const MsgCancelProposalResponse = {
  typeUrl: '/cosmos.gov.v1.MsgCancelProposalResponse',
  encode(message: MsgCancelProposalResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.proposalId !== BigInt(0)) {
      writer.uint32(8).uint64(message.proposalId);
    }
    if (message.canceledTime !== undefined) {
      Timestamp.encode(toTimestamp(message.canceledTime), writer.uint32(18).fork()).ldelim();
    }
    if (message.canceledHeight !== BigInt(0)) {
      writer.uint32(24).uint64(message.canceledHeight);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgCancelProposalResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCancelProposalResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.proposalId = reader.uint64();
          break;
        case 2:
          message.canceledTime = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          break;
        case 3:
          message.canceledHeight = reader.uint64();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgCancelProposalResponse>): MsgCancelProposalResponse {
    const message = createBaseMsgCancelProposalResponse();
    message.proposalId =
      object.proposalId !== undefined && object.proposalId !== null ? BigInt(object.proposalId.toString()) : BigInt(0);
    message.canceledTime = object.canceledTime ?? undefined;
    message.canceledHeight =
      object.canceledHeight !== undefined && object.canceledHeight !== null
        ? BigInt(object.canceledHeight.toString())
        : BigInt(0);
    return message;
  },
  fromAmino(object: MsgCancelProposalResponseAmino): MsgCancelProposalResponse {
    const message = createBaseMsgCancelProposalResponse();
    if (object.proposal_id !== undefined && object.proposal_id !== null) {
      message.proposalId = BigInt(object.proposal_id);
    }
    if (object.canceled_time !== undefined && object.canceled_time !== null) {
      message.canceledTime = fromTimestamp(Timestamp.fromAmino(object.canceled_time));
    }
    if (object.canceled_height !== undefined && object.canceled_height !== null) {
      message.canceledHeight = BigInt(object.canceled_height);
    }
    return message;
  },
  toAmino(message: MsgCancelProposalResponse): MsgCancelProposalResponseAmino {
    const obj: any = {};
    obj.proposal_id = message.proposalId ? (message.proposalId?.toString)() : '0';
    obj.canceled_time = message.canceledTime ? Timestamp.toAmino(toTimestamp(message.canceledTime)) : undefined;
    obj.canceled_height = message.canceledHeight !== BigInt(0) ? (message.canceledHeight?.toString)() : undefined;
    return obj;
  },
  fromAminoMsg(object: MsgCancelProposalResponseAminoMsg): MsgCancelProposalResponse {
    return MsgCancelProposalResponse.fromAmino(object.value);
  },
  toAminoMsg(message: MsgCancelProposalResponse): MsgCancelProposalResponseAminoMsg {
    return {
      type: 'cosmos-sdk/v1/MsgCancelProposalResponse',
      value: MsgCancelProposalResponse.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgCancelProposalResponseProtoMsg): MsgCancelProposalResponse {
    return MsgCancelProposalResponse.decode(message.value);
  },
  toProto(message: MsgCancelProposalResponse): Uint8Array {
    return MsgCancelProposalResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgCancelProposalResponse): MsgCancelProposalResponseProtoMsg {
    return {
      typeUrl: '/cosmos.gov.v1.MsgCancelProposalResponse',
      value: MsgCancelProposalResponse.encode(message).finish(),
    };
  },
};
export const Cosmos_govv1beta1Content_InterfaceDecoder = (
  input: BinaryReader | Uint8Array,
):
  | CommunityPoolSpendProposal
  | CommunityPoolSpendProposalWithDeposit
  | TextProposal
  | ParameterChangeProposal
  | SoftwareUpgradeProposal
  | CancelSoftwareUpgradeProposal
  | StoreCodeProposal
  | InstantiateContractProposal
  | InstantiateContract2Proposal
  | MigrateContractProposal
  | SudoContractProposal
  | ExecuteContractProposal
  | UpdateAdminProposal
  | ClearAdminProposal
  | PinCodesProposal
  | UnpinCodesProposal
  | UpdateInstantiateConfigProposal
  | StoreAndInstantiateContractProposal
  | SpotMarketParamUpdateProposal
  | BatchExchangeModificationProposal
  | SpotMarketLaunchProposal
  | PerpetualMarketLaunchProposal
  | BinaryOptionsMarketLaunchProposal
  | ExpiryFuturesMarketLaunchProposal
  | DerivativeMarketParamUpdateProposal
  | MarketForcedSettlementProposal
  | UpdateDenomDecimalsProposal
  | BinaryOptionsMarketParamUpdateProposal
  | TradingRewardCampaignLaunchProposal
  | TradingRewardCampaignUpdateProposal
  | TradingRewardPendingPointsUpdateProposal
  | FeeDiscountProposal
  | BatchCommunityPoolSpendProposal
  | AtomicMarketOrderFeeMultiplierScheduleProposal
  | SetConfigProposal
  | SetBatchConfigProposal
  | GrantBandOraclePrivilegeProposal
  | RevokeBandOraclePrivilegeProposal
  | GrantPriceFeederPrivilegeProposal
  | GrantProviderPrivilegeProposal
  | RevokeProviderPrivilegeProposal
  | RevokePriceFeederPrivilegeProposal
  | AuthorizeBandOracleRequestProposal
  | UpdateBandOracleRequestProposal
  | EnableBandIBCProposal
  | GrantStorkPublisherPrivilegeProposal
  | RevokeStorkPublisherPrivilegeProposal
  | ContractRegistrationRequestProposal
  | BatchContractRegistrationRequestProposal
  | BatchContractDeregistrationProposal
  | ContractRegistrationRequest
  | BatchStoreCodeProposal
  | Any => {
  const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
  const data = Any.decode(reader, reader.uint32());
  switch (data.typeUrl) {
    case '/cosmos.distribution.v1beta1.CommunityPoolSpendProposal':
      return CommunityPoolSpendProposal.decode(data.value);
    case '/cosmos.distribution.v1beta1.CommunityPoolSpendProposalWithDeposit':
      return CommunityPoolSpendProposalWithDeposit.decode(data.value);
    case '/cosmos.gov.v1beta1.TextProposal':
      return TextProposal.decode(data.value);
    case '/cosmos.params.v1beta1.ParameterChangeProposal':
      return ParameterChangeProposal.decode(data.value);
    case '/cosmos.upgrade.v1beta1.SoftwareUpgradeProposal':
      return SoftwareUpgradeProposal.decode(data.value);
    case '/cosmos.upgrade.v1beta1.CancelSoftwareUpgradeProposal':
      return CancelSoftwareUpgradeProposal.decode(data.value);
    case '/cosmwasm.wasm.v1.StoreCodeProposal':
      return StoreCodeProposal.decode(data.value);
    case '/cosmwasm.wasm.v1.InstantiateContractProposal':
      return InstantiateContractProposal.decode(data.value);
    case '/cosmwasm.wasm.v1.InstantiateContract2Proposal':
      return InstantiateContract2Proposal.decode(data.value);
    case '/cosmwasm.wasm.v1.MigrateContractProposal':
      return MigrateContractProposal.decode(data.value);
    case '/cosmwasm.wasm.v1.SudoContractProposal':
      return SudoContractProposal.decode(data.value);
    case '/cosmwasm.wasm.v1.ExecuteContractProposal':
      return ExecuteContractProposal.decode(data.value);
    case '/cosmwasm.wasm.v1.UpdateAdminProposal':
      return UpdateAdminProposal.decode(data.value);
    case '/cosmwasm.wasm.v1.ClearAdminProposal':
      return ClearAdminProposal.decode(data.value);
    case '/cosmwasm.wasm.v1.PinCodesProposal':
      return PinCodesProposal.decode(data.value);
    case '/cosmwasm.wasm.v1.UnpinCodesProposal':
      return UnpinCodesProposal.decode(data.value);
    case '/cosmwasm.wasm.v1.UpdateInstantiateConfigProposal':
      return UpdateInstantiateConfigProposal.decode(data.value);
    case '/cosmwasm.wasm.v1.StoreAndInstantiateContractProposal':
      return StoreAndInstantiateContractProposal.decode(data.value);
    case '/injective.exchange.v1beta1.SpotMarketParamUpdateProposal':
      return SpotMarketParamUpdateProposal.decode(data.value);
    case '/injective.exchange.v1beta1.BatchExchangeModificationProposal':
      return BatchExchangeModificationProposal.decode(data.value);
    case '/injective.exchange.v1beta1.SpotMarketLaunchProposal':
      return SpotMarketLaunchProposal.decode(data.value);
    case '/injective.exchange.v1beta1.PerpetualMarketLaunchProposal':
      return PerpetualMarketLaunchProposal.decode(data.value);
    case '/injective.exchange.v1beta1.BinaryOptionsMarketLaunchProposal':
      return BinaryOptionsMarketLaunchProposal.decode(data.value);
    case '/injective.exchange.v1beta1.ExpiryFuturesMarketLaunchProposal':
      return ExpiryFuturesMarketLaunchProposal.decode(data.value);
    case '/injective.exchange.v1beta1.DerivativeMarketParamUpdateProposal':
      return DerivativeMarketParamUpdateProposal.decode(data.value);
    case '/injective.exchange.v1beta1.MarketForcedSettlementProposal':
      return MarketForcedSettlementProposal.decode(data.value);
    case '/injective.exchange.v1beta1.UpdateDenomDecimalsProposal':
      return UpdateDenomDecimalsProposal.decode(data.value);
    case '/injective.exchange.v1beta1.BinaryOptionsMarketParamUpdateProposal':
      return BinaryOptionsMarketParamUpdateProposal.decode(data.value);
    case '/injective.exchange.v1beta1.TradingRewardCampaignLaunchProposal':
      return TradingRewardCampaignLaunchProposal.decode(data.value);
    case '/injective.exchange.v1beta1.TradingRewardCampaignUpdateProposal':
      return TradingRewardCampaignUpdateProposal.decode(data.value);
    case '/injective.exchange.v1beta1.TradingRewardPendingPointsUpdateProposal':
      return TradingRewardPendingPointsUpdateProposal.decode(data.value);
    case '/injective.exchange.v1beta1.FeeDiscountProposal':
      return FeeDiscountProposal.decode(data.value);
    case '/injective.exchange.v1beta1.BatchCommunityPoolSpendProposal':
      return BatchCommunityPoolSpendProposal.decode(data.value);
    case '/injective.exchange.v1beta1.AtomicMarketOrderFeeMultiplierScheduleProposal':
      return AtomicMarketOrderFeeMultiplierScheduleProposal.decode(data.value);
    case '/injective.ocr.v1beta1.SetConfigProposal':
      return SetConfigProposal.decode(data.value);
    case '/injective.ocr.v1beta1.SetBatchConfigProposal':
      return SetBatchConfigProposal.decode(data.value);
    case '/injective.oracle.v1beta1.GrantBandOraclePrivilegeProposal':
      return GrantBandOraclePrivilegeProposal.decode(data.value);
    case '/injective.oracle.v1beta1.RevokeBandOraclePrivilegeProposal':
      return RevokeBandOraclePrivilegeProposal.decode(data.value);
    case '/injective.oracle.v1beta1.GrantPriceFeederPrivilegeProposal':
      return GrantPriceFeederPrivilegeProposal.decode(data.value);
    case '/injective.oracle.v1beta1.GrantProviderPrivilegeProposal':
      return GrantProviderPrivilegeProposal.decode(data.value);
    case '/injective.oracle.v1beta1.RevokeProviderPrivilegeProposal':
      return RevokeProviderPrivilegeProposal.decode(data.value);
    case '/injective.oracle.v1beta1.RevokePriceFeederPrivilegeProposal':
      return RevokePriceFeederPrivilegeProposal.decode(data.value);
    case '/injective.oracle.v1beta1.AuthorizeBandOracleRequestProposal':
      return AuthorizeBandOracleRequestProposal.decode(data.value);
    case '/injective.oracle.v1beta1.UpdateBandOracleRequestProposal':
      return UpdateBandOracleRequestProposal.decode(data.value);
    case '/injective.oracle.v1beta1.EnableBandIBCProposal':
      return EnableBandIBCProposal.decode(data.value);
    case '/injective.oracle.v1beta1.GrantStorkPublisherPrivilegeProposal':
      return GrantStorkPublisherPrivilegeProposal.decode(data.value);
    case '/injective.oracle.v1beta1.RevokeStorkPublisherPrivilegeProposal':
      return RevokeStorkPublisherPrivilegeProposal.decode(data.value);
    case '/injective.wasmx.v1.ContractRegistrationRequestProposal':
      return ContractRegistrationRequestProposal.decode(data.value);
    case '/injective.wasmx.v1.BatchContractRegistrationRequestProposal':
      return BatchContractRegistrationRequestProposal.decode(data.value);
    case '/injective.wasmx.v1.BatchContractDeregistrationProposal':
      return BatchContractDeregistrationProposal.decode(data.value);
    case '/injective.wasmx.v1.ContractRegistrationRequest':
      return ContractRegistrationRequest.decode(data.value);
    case '/injective.wasmx.v1.BatchStoreCodeProposal':
      return BatchStoreCodeProposal.decode(data.value);
    default:
      return data;
  }
};
export const Cosmos_govv1beta1Content_FromAmino = (content: AnyAmino): Any => {
  switch (content.type) {
    case 'cosmos-sdk/v1/CommunityPoolSpendProposal':
      return Any.fromPartial({
        typeUrl: '/cosmos.distribution.v1beta1.CommunityPoolSpendProposal',
        value: CommunityPoolSpendProposal.encode(
          CommunityPoolSpendProposal.fromPartial(CommunityPoolSpendProposal.fromAmino(content.value)),
        ).finish(),
      });
    case 'cosmos-sdk/v1/CommunityPoolSpendProposalWithDeposit':
      return Any.fromPartial({
        typeUrl: '/cosmos.distribution.v1beta1.CommunityPoolSpendProposalWithDeposit',
        value: CommunityPoolSpendProposalWithDeposit.encode(
          CommunityPoolSpendProposalWithDeposit.fromPartial(
            CommunityPoolSpendProposalWithDeposit.fromAmino(content.value),
          ),
        ).finish(),
      });
    case 'cosmos-sdk/TextProposal':
      return Any.fromPartial({
        typeUrl: '/cosmos.gov.v1beta1.TextProposal',
        value: TextProposal.encode(TextProposal.fromPartial(TextProposal.fromAmino(content.value))).finish(),
      });
    case 'cosmos-sdk/ParameterChangeProposal':
      return Any.fromPartial({
        typeUrl: '/cosmos.params.v1beta1.ParameterChangeProposal',
        value: ParameterChangeProposal.encode(
          ParameterChangeProposal.fromPartial(ParameterChangeProposal.fromAmino(content.value)),
        ).finish(),
      });
    case 'cosmos-sdk/SoftwareUpgradeProposal':
      return Any.fromPartial({
        typeUrl: '/cosmos.upgrade.v1beta1.SoftwareUpgradeProposal',
        value: SoftwareUpgradeProposal.encode(
          SoftwareUpgradeProposal.fromPartial(SoftwareUpgradeProposal.fromAmino(content.value)),
        ).finish(),
      });
    case 'cosmos-sdk/CancelSoftwareUpgradeProposal':
      return Any.fromPartial({
        typeUrl: '/cosmos.upgrade.v1beta1.CancelSoftwareUpgradeProposal',
        value: CancelSoftwareUpgradeProposal.encode(
          CancelSoftwareUpgradeProposal.fromPartial(CancelSoftwareUpgradeProposal.fromAmino(content.value)),
        ).finish(),
      });
    case 'wasm/StoreCodeProposal':
      return Any.fromPartial({
        typeUrl: '/cosmwasm.wasm.v1.StoreCodeProposal',
        value: StoreCodeProposal.encode(
          StoreCodeProposal.fromPartial(StoreCodeProposal.fromAmino(content.value)),
        ).finish(),
      });
    case 'wasm/InstantiateContractProposal':
      return Any.fromPartial({
        typeUrl: '/cosmwasm.wasm.v1.InstantiateContractProposal',
        value: InstantiateContractProposal.encode(
          InstantiateContractProposal.fromPartial(InstantiateContractProposal.fromAmino(content.value)),
        ).finish(),
      });
    case 'wasm/InstantiateContract2Proposal':
      return Any.fromPartial({
        typeUrl: '/cosmwasm.wasm.v1.InstantiateContract2Proposal',
        value: InstantiateContract2Proposal.encode(
          InstantiateContract2Proposal.fromPartial(InstantiateContract2Proposal.fromAmino(content.value)),
        ).finish(),
      });
    case 'wasm/MigrateContractProposal':
      return Any.fromPartial({
        typeUrl: '/cosmwasm.wasm.v1.MigrateContractProposal',
        value: MigrateContractProposal.encode(
          MigrateContractProposal.fromPartial(MigrateContractProposal.fromAmino(content.value)),
        ).finish(),
      });
    case 'wasm/SudoContractProposal':
      return Any.fromPartial({
        typeUrl: '/cosmwasm.wasm.v1.SudoContractProposal',
        value: SudoContractProposal.encode(
          SudoContractProposal.fromPartial(SudoContractProposal.fromAmino(content.value)),
        ).finish(),
      });
    case 'wasm/ExecuteContractProposal':
      return Any.fromPartial({
        typeUrl: '/cosmwasm.wasm.v1.ExecuteContractProposal',
        value: ExecuteContractProposal.encode(
          ExecuteContractProposal.fromPartial(ExecuteContractProposal.fromAmino(content.value)),
        ).finish(),
      });
    case 'wasm/UpdateAdminProposal':
      return Any.fromPartial({
        typeUrl: '/cosmwasm.wasm.v1.UpdateAdminProposal',
        value: UpdateAdminProposal.encode(
          UpdateAdminProposal.fromPartial(UpdateAdminProposal.fromAmino(content.value)),
        ).finish(),
      });
    case 'wasm/ClearAdminProposal':
      return Any.fromPartial({
        typeUrl: '/cosmwasm.wasm.v1.ClearAdminProposal',
        value: ClearAdminProposal.encode(
          ClearAdminProposal.fromPartial(ClearAdminProposal.fromAmino(content.value)),
        ).finish(),
      });
    case 'wasm/PinCodesProposal':
      return Any.fromPartial({
        typeUrl: '/cosmwasm.wasm.v1.PinCodesProposal',
        value: PinCodesProposal.encode(
          PinCodesProposal.fromPartial(PinCodesProposal.fromAmino(content.value)),
        ).finish(),
      });
    case 'wasm/UnpinCodesProposal':
      return Any.fromPartial({
        typeUrl: '/cosmwasm.wasm.v1.UnpinCodesProposal',
        value: UnpinCodesProposal.encode(
          UnpinCodesProposal.fromPartial(UnpinCodesProposal.fromAmino(content.value)),
        ).finish(),
      });
    case 'wasm/UpdateInstantiateConfigProposal':
      return Any.fromPartial({
        typeUrl: '/cosmwasm.wasm.v1.UpdateInstantiateConfigProposal',
        value: UpdateInstantiateConfigProposal.encode(
          UpdateInstantiateConfigProposal.fromPartial(UpdateInstantiateConfigProposal.fromAmino(content.value)),
        ).finish(),
      });
    case 'wasm/StoreAndInstantiateContractProposal':
      return Any.fromPartial({
        typeUrl: '/cosmwasm.wasm.v1.StoreAndInstantiateContractProposal',
        value: StoreAndInstantiateContractProposal.encode(
          StoreAndInstantiateContractProposal.fromPartial(StoreAndInstantiateContractProposal.fromAmino(content.value)),
        ).finish(),
      });
    case 'exchange/SpotMarketParamUpdateProposal':
      return Any.fromPartial({
        typeUrl: '/injective.exchange.v1beta1.SpotMarketParamUpdateProposal',
        value: SpotMarketParamUpdateProposal.encode(
          SpotMarketParamUpdateProposal.fromPartial(SpotMarketParamUpdateProposal.fromAmino(content.value)),
        ).finish(),
      });
    case 'exchange/BatchExchangeModificationProposal':
      return Any.fromPartial({
        typeUrl: '/injective.exchange.v1beta1.BatchExchangeModificationProposal',
        value: BatchExchangeModificationProposal.encode(
          BatchExchangeModificationProposal.fromPartial(BatchExchangeModificationProposal.fromAmino(content.value)),
        ).finish(),
      });
    case 'exchange/SpotMarketLaunchProposal':
      return Any.fromPartial({
        typeUrl: '/injective.exchange.v1beta1.SpotMarketLaunchProposal',
        value: SpotMarketLaunchProposal.encode(
          SpotMarketLaunchProposal.fromPartial(SpotMarketLaunchProposal.fromAmino(content.value)),
        ).finish(),
      });
    case 'exchange/PerpetualMarketLaunchProposal':
      return Any.fromPartial({
        typeUrl: '/injective.exchange.v1beta1.PerpetualMarketLaunchProposal',
        value: PerpetualMarketLaunchProposal.encode(
          PerpetualMarketLaunchProposal.fromPartial(PerpetualMarketLaunchProposal.fromAmino(content.value)),
        ).finish(),
      });
    case 'exchange/BinaryOptionsMarketLaunchProposal':
      return Any.fromPartial({
        typeUrl: '/injective.exchange.v1beta1.BinaryOptionsMarketLaunchProposal',
        value: BinaryOptionsMarketLaunchProposal.encode(
          BinaryOptionsMarketLaunchProposal.fromPartial(BinaryOptionsMarketLaunchProposal.fromAmino(content.value)),
        ).finish(),
      });
    case 'exchange/ExpiryFuturesMarketLaunchProposal':
      return Any.fromPartial({
        typeUrl: '/injective.exchange.v1beta1.ExpiryFuturesMarketLaunchProposal',
        value: ExpiryFuturesMarketLaunchProposal.encode(
          ExpiryFuturesMarketLaunchProposal.fromPartial(ExpiryFuturesMarketLaunchProposal.fromAmino(content.value)),
        ).finish(),
      });
    case 'exchange/DerivativeMarketParamUpdateProposal':
      return Any.fromPartial({
        typeUrl: '/injective.exchange.v1beta1.DerivativeMarketParamUpdateProposal',
        value: DerivativeMarketParamUpdateProposal.encode(
          DerivativeMarketParamUpdateProposal.fromPartial(DerivativeMarketParamUpdateProposal.fromAmino(content.value)),
        ).finish(),
      });
    case 'exchange/MarketForcedSettlementProposal':
      return Any.fromPartial({
        typeUrl: '/injective.exchange.v1beta1.MarketForcedSettlementProposal',
        value: MarketForcedSettlementProposal.encode(
          MarketForcedSettlementProposal.fromPartial(MarketForcedSettlementProposal.fromAmino(content.value)),
        ).finish(),
      });
    case 'exchange/UpdateDenomDecimalsProposal':
      return Any.fromPartial({
        typeUrl: '/injective.exchange.v1beta1.UpdateDenomDecimalsProposal',
        value: UpdateDenomDecimalsProposal.encode(
          UpdateDenomDecimalsProposal.fromPartial(UpdateDenomDecimalsProposal.fromAmino(content.value)),
        ).finish(),
      });
    case 'exchange/BinaryOptionsMarketParamUpdateProposal':
      return Any.fromPartial({
        typeUrl: '/injective.exchange.v1beta1.BinaryOptionsMarketParamUpdateProposal',
        value: BinaryOptionsMarketParamUpdateProposal.encode(
          BinaryOptionsMarketParamUpdateProposal.fromPartial(
            BinaryOptionsMarketParamUpdateProposal.fromAmino(content.value),
          ),
        ).finish(),
      });
    case 'exchange/TradingRewardCampaignLaunchProposal':
      return Any.fromPartial({
        typeUrl: '/injective.exchange.v1beta1.TradingRewardCampaignLaunchProposal',
        value: TradingRewardCampaignLaunchProposal.encode(
          TradingRewardCampaignLaunchProposal.fromPartial(TradingRewardCampaignLaunchProposal.fromAmino(content.value)),
        ).finish(),
      });
    case 'exchange/TradingRewardCampaignUpdateProposal':
      return Any.fromPartial({
        typeUrl: '/injective.exchange.v1beta1.TradingRewardCampaignUpdateProposal',
        value: TradingRewardCampaignUpdateProposal.encode(
          TradingRewardCampaignUpdateProposal.fromPartial(TradingRewardCampaignUpdateProposal.fromAmino(content.value)),
        ).finish(),
      });
    case 'exchange/TradingRewardPendingPointsUpdateProposal':
      return Any.fromPartial({
        typeUrl: '/injective.exchange.v1beta1.TradingRewardPendingPointsUpdateProposal',
        value: TradingRewardPendingPointsUpdateProposal.encode(
          TradingRewardPendingPointsUpdateProposal.fromPartial(
            TradingRewardPendingPointsUpdateProposal.fromAmino(content.value),
          ),
        ).finish(),
      });
    case 'exchange/FeeDiscountProposal':
      return Any.fromPartial({
        typeUrl: '/injective.exchange.v1beta1.FeeDiscountProposal',
        value: FeeDiscountProposal.encode(
          FeeDiscountProposal.fromPartial(FeeDiscountProposal.fromAmino(content.value)),
        ).finish(),
      });
    case 'exchange/BatchCommunityPoolSpendProposal':
      return Any.fromPartial({
        typeUrl: '/injective.exchange.v1beta1.BatchCommunityPoolSpendProposal',
        value: BatchCommunityPoolSpendProposal.encode(
          BatchCommunityPoolSpendProposal.fromPartial(BatchCommunityPoolSpendProposal.fromAmino(content.value)),
        ).finish(),
      });
    case 'exchange/AtomicMarketOrderFeeMultiplierScheduleProposal':
      return Any.fromPartial({
        typeUrl: '/injective.exchange.v1beta1.AtomicMarketOrderFeeMultiplierScheduleProposal',
        value: AtomicMarketOrderFeeMultiplierScheduleProposal.encode(
          AtomicMarketOrderFeeMultiplierScheduleProposal.fromPartial(
            AtomicMarketOrderFeeMultiplierScheduleProposal.fromAmino(content.value),
          ),
        ).finish(),
      });
    case 'ocr/SetConfigProposal':
      return Any.fromPartial({
        typeUrl: '/injective.ocr.v1beta1.SetConfigProposal',
        value: SetConfigProposal.encode(
          SetConfigProposal.fromPartial(SetConfigProposal.fromAmino(content.value)),
        ).finish(),
      });
    case 'ocr/SetBatchConfigProposal':
      return Any.fromPartial({
        typeUrl: '/injective.ocr.v1beta1.SetBatchConfigProposal',
        value: SetBatchConfigProposal.encode(
          SetBatchConfigProposal.fromPartial(SetBatchConfigProposal.fromAmino(content.value)),
        ).finish(),
      });
    case 'oracle/GrantBandOraclePrivilegeProposal':
      return Any.fromPartial({
        typeUrl: '/injective.oracle.v1beta1.GrantBandOraclePrivilegeProposal',
        value: GrantBandOraclePrivilegeProposal.encode(
          GrantBandOraclePrivilegeProposal.fromPartial(GrantBandOraclePrivilegeProposal.fromAmino(content.value)),
        ).finish(),
      });
    case 'oracle/RevokeBandOraclePrivilegeProposal':
      return Any.fromPartial({
        typeUrl: '/injective.oracle.v1beta1.RevokeBandOraclePrivilegeProposal',
        value: RevokeBandOraclePrivilegeProposal.encode(
          RevokeBandOraclePrivilegeProposal.fromPartial(RevokeBandOraclePrivilegeProposal.fromAmino(content.value)),
        ).finish(),
      });
    case 'oracle/GrantPriceFeederPrivilegeProposal':
      return Any.fromPartial({
        typeUrl: '/injective.oracle.v1beta1.GrantPriceFeederPrivilegeProposal',
        value: GrantPriceFeederPrivilegeProposal.encode(
          GrantPriceFeederPrivilegeProposal.fromPartial(GrantPriceFeederPrivilegeProposal.fromAmino(content.value)),
        ).finish(),
      });
    case 'oracle/GrantProviderPrivilegeProposal':
      return Any.fromPartial({
        typeUrl: '/injective.oracle.v1beta1.GrantProviderPrivilegeProposal',
        value: GrantProviderPrivilegeProposal.encode(
          GrantProviderPrivilegeProposal.fromPartial(GrantProviderPrivilegeProposal.fromAmino(content.value)),
        ).finish(),
      });
    case 'oracle/RevokeProviderPrivilegeProposal':
      return Any.fromPartial({
        typeUrl: '/injective.oracle.v1beta1.RevokeProviderPrivilegeProposal',
        value: RevokeProviderPrivilegeProposal.encode(
          RevokeProviderPrivilegeProposal.fromPartial(RevokeProviderPrivilegeProposal.fromAmino(content.value)),
        ).finish(),
      });
    case 'oracle/RevokePriceFeederPrivilegeProposal':
      return Any.fromPartial({
        typeUrl: '/injective.oracle.v1beta1.RevokePriceFeederPrivilegeProposal',
        value: RevokePriceFeederPrivilegeProposal.encode(
          RevokePriceFeederPrivilegeProposal.fromPartial(RevokePriceFeederPrivilegeProposal.fromAmino(content.value)),
        ).finish(),
      });
    case 'oracle/AuthorizeBandOracleRequestProposal':
      return Any.fromPartial({
        typeUrl: '/injective.oracle.v1beta1.AuthorizeBandOracleRequestProposal',
        value: AuthorizeBandOracleRequestProposal.encode(
          AuthorizeBandOracleRequestProposal.fromPartial(AuthorizeBandOracleRequestProposal.fromAmino(content.value)),
        ).finish(),
      });
    case 'oracle/UpdateBandOracleRequestProposal':
      return Any.fromPartial({
        typeUrl: '/injective.oracle.v1beta1.UpdateBandOracleRequestProposal',
        value: UpdateBandOracleRequestProposal.encode(
          UpdateBandOracleRequestProposal.fromPartial(UpdateBandOracleRequestProposal.fromAmino(content.value)),
        ).finish(),
      });
    case 'oracle/EnableBandIBCProposal':
      return Any.fromPartial({
        typeUrl: '/injective.oracle.v1beta1.EnableBandIBCProposal',
        value: EnableBandIBCProposal.encode(
          EnableBandIBCProposal.fromPartial(EnableBandIBCProposal.fromAmino(content.value)),
        ).finish(),
      });
    case 'oracle/GrantStorkPublisherPrivilegeProposal':
      return Any.fromPartial({
        typeUrl: '/injective.oracle.v1beta1.GrantStorkPublisherPrivilegeProposal',
        value: GrantStorkPublisherPrivilegeProposal.encode(
          GrantStorkPublisherPrivilegeProposal.fromPartial(
            GrantStorkPublisherPrivilegeProposal.fromAmino(content.value),
          ),
        ).finish(),
      });
    case 'oracle/RevokeStorkPublisherPrivilegeProposal':
      return Any.fromPartial({
        typeUrl: '/injective.oracle.v1beta1.RevokeStorkPublisherPrivilegeProposal',
        value: RevokeStorkPublisherPrivilegeProposal.encode(
          RevokeStorkPublisherPrivilegeProposal.fromPartial(
            RevokeStorkPublisherPrivilegeProposal.fromAmino(content.value),
          ),
        ).finish(),
      });
    case 'wasmx/ContractRegistrationRequestProposal':
      return Any.fromPartial({
        typeUrl: '/injective.wasmx.v1.ContractRegistrationRequestProposal',
        value: ContractRegistrationRequestProposal.encode(
          ContractRegistrationRequestProposal.fromPartial(ContractRegistrationRequestProposal.fromAmino(content.value)),
        ).finish(),
      });
    case 'wasmx/BatchContractRegistrationRequestProposal':
      return Any.fromPartial({
        typeUrl: '/injective.wasmx.v1.BatchContractRegistrationRequestProposal',
        value: BatchContractRegistrationRequestProposal.encode(
          BatchContractRegistrationRequestProposal.fromPartial(
            BatchContractRegistrationRequestProposal.fromAmino(content.value),
          ),
        ).finish(),
      });
    case 'wasmx/BatchContractDeregistrationProposal':
      return Any.fromPartial({
        typeUrl: '/injective.wasmx.v1.BatchContractDeregistrationProposal',
        value: BatchContractDeregistrationProposal.encode(
          BatchContractDeregistrationProposal.fromPartial(BatchContractDeregistrationProposal.fromAmino(content.value)),
        ).finish(),
      });
    case '/injective.wasmx.v1.ContractRegistrationRequest':
      return Any.fromPartial({
        typeUrl: '/injective.wasmx.v1.ContractRegistrationRequest',
        value: ContractRegistrationRequest.encode(
          ContractRegistrationRequest.fromPartial(ContractRegistrationRequest.fromAmino(content.value)),
        ).finish(),
      });
    case 'wasmx/BatchStoreCodeProposal':
      return Any.fromPartial({
        typeUrl: '/injective.wasmx.v1.BatchStoreCodeProposal',
        value: BatchStoreCodeProposal.encode(
          BatchStoreCodeProposal.fromPartial(BatchStoreCodeProposal.fromAmino(content.value)),
        ).finish(),
      });
    default:
      return Any.fromAmino(content);
  }
};
export const Cosmos_govv1beta1Content_ToAmino = (content: Any) => {
  switch (content.typeUrl) {
    case '/cosmos.distribution.v1beta1.CommunityPoolSpendProposal':
      return {
        type: 'cosmos-sdk/v1/CommunityPoolSpendProposal',
        value: CommunityPoolSpendProposal.toAmino(CommunityPoolSpendProposal.decode(content.value, undefined)),
      };
    case '/cosmos.distribution.v1beta1.CommunityPoolSpendProposalWithDeposit':
      return {
        type: 'cosmos-sdk/v1/CommunityPoolSpendProposalWithDeposit',
        value: CommunityPoolSpendProposalWithDeposit.toAmino(
          CommunityPoolSpendProposalWithDeposit.decode(content.value, undefined),
        ),
      };
    case '/cosmos.gov.v1beta1.TextProposal':
      return {
        type: 'cosmos-sdk/TextProposal',
        value: TextProposal.toAmino(TextProposal.decode(content.value, undefined)),
      };
    case '/cosmos.params.v1beta1.ParameterChangeProposal':
      return {
        type: 'cosmos-sdk/ParameterChangeProposal',
        value: ParameterChangeProposal.toAmino(ParameterChangeProposal.decode(content.value, undefined)),
      };
    case '/cosmos.upgrade.v1beta1.SoftwareUpgradeProposal':
      return {
        type: 'cosmos-sdk/SoftwareUpgradeProposal',
        value: SoftwareUpgradeProposal.toAmino(SoftwareUpgradeProposal.decode(content.value, undefined)),
      };
    case '/cosmos.upgrade.v1beta1.CancelSoftwareUpgradeProposal':
      return {
        type: 'cosmos-sdk/CancelSoftwareUpgradeProposal',
        value: CancelSoftwareUpgradeProposal.toAmino(CancelSoftwareUpgradeProposal.decode(content.value, undefined)),
      };
    case '/cosmwasm.wasm.v1.StoreCodeProposal':
      return {
        type: 'wasm/StoreCodeProposal',
        value: StoreCodeProposal.toAmino(StoreCodeProposal.decode(content.value, undefined)),
      };
    case '/cosmwasm.wasm.v1.InstantiateContractProposal':
      return {
        type: 'wasm/InstantiateContractProposal',
        value: InstantiateContractProposal.toAmino(InstantiateContractProposal.decode(content.value, undefined)),
      };
    case '/cosmwasm.wasm.v1.InstantiateContract2Proposal':
      return {
        type: 'wasm/InstantiateContract2Proposal',
        value: InstantiateContract2Proposal.toAmino(InstantiateContract2Proposal.decode(content.value, undefined)),
      };
    case '/cosmwasm.wasm.v1.MigrateContractProposal':
      return {
        type: 'wasm/MigrateContractProposal',
        value: MigrateContractProposal.toAmino(MigrateContractProposal.decode(content.value, undefined)),
      };
    case '/cosmwasm.wasm.v1.SudoContractProposal':
      return {
        type: 'wasm/SudoContractProposal',
        value: SudoContractProposal.toAmino(SudoContractProposal.decode(content.value, undefined)),
      };
    case '/cosmwasm.wasm.v1.ExecuteContractProposal':
      return {
        type: 'wasm/ExecuteContractProposal',
        value: ExecuteContractProposal.toAmino(ExecuteContractProposal.decode(content.value, undefined)),
      };
    case '/cosmwasm.wasm.v1.UpdateAdminProposal':
      return {
        type: 'wasm/UpdateAdminProposal',
        value: UpdateAdminProposal.toAmino(UpdateAdminProposal.decode(content.value, undefined)),
      };
    case '/cosmwasm.wasm.v1.ClearAdminProposal':
      return {
        type: 'wasm/ClearAdminProposal',
        value: ClearAdminProposal.toAmino(ClearAdminProposal.decode(content.value, undefined)),
      };
    case '/cosmwasm.wasm.v1.PinCodesProposal':
      return {
        type: 'wasm/PinCodesProposal',
        value: PinCodesProposal.toAmino(PinCodesProposal.decode(content.value, undefined)),
      };
    case '/cosmwasm.wasm.v1.UnpinCodesProposal':
      return {
        type: 'wasm/UnpinCodesProposal',
        value: UnpinCodesProposal.toAmino(UnpinCodesProposal.decode(content.value, undefined)),
      };
    case '/cosmwasm.wasm.v1.UpdateInstantiateConfigProposal':
      return {
        type: 'wasm/UpdateInstantiateConfigProposal',
        value: UpdateInstantiateConfigProposal.toAmino(
          UpdateInstantiateConfigProposal.decode(content.value, undefined),
        ),
      };
    case '/cosmwasm.wasm.v1.StoreAndInstantiateContractProposal':
      return {
        type: 'wasm/StoreAndInstantiateContractProposal',
        value: StoreAndInstantiateContractProposal.toAmino(
          StoreAndInstantiateContractProposal.decode(content.value, undefined),
        ),
      };
    case '/injective.exchange.v1beta1.SpotMarketParamUpdateProposal':
      return {
        type: 'exchange/SpotMarketParamUpdateProposal',
        value: SpotMarketParamUpdateProposal.toAmino(SpotMarketParamUpdateProposal.decode(content.value, undefined)),
      };
    case '/injective.exchange.v1beta1.BatchExchangeModificationProposal':
      return {
        type: 'exchange/BatchExchangeModificationProposal',
        value: BatchExchangeModificationProposal.toAmino(
          BatchExchangeModificationProposal.decode(content.value, undefined),
        ),
      };
    case '/injective.exchange.v1beta1.SpotMarketLaunchProposal':
      return {
        type: 'exchange/SpotMarketLaunchProposal',
        value: SpotMarketLaunchProposal.toAmino(SpotMarketLaunchProposal.decode(content.value, undefined)),
      };
    case '/injective.exchange.v1beta1.PerpetualMarketLaunchProposal':
      return {
        type: 'exchange/PerpetualMarketLaunchProposal',
        value: PerpetualMarketLaunchProposal.toAmino(PerpetualMarketLaunchProposal.decode(content.value, undefined)),
      };
    case '/injective.exchange.v1beta1.BinaryOptionsMarketLaunchProposal':
      return {
        type: 'exchange/BinaryOptionsMarketLaunchProposal',
        value: BinaryOptionsMarketLaunchProposal.toAmino(
          BinaryOptionsMarketLaunchProposal.decode(content.value, undefined),
        ),
      };
    case '/injective.exchange.v1beta1.ExpiryFuturesMarketLaunchProposal':
      return {
        type: 'exchange/ExpiryFuturesMarketLaunchProposal',
        value: ExpiryFuturesMarketLaunchProposal.toAmino(
          ExpiryFuturesMarketLaunchProposal.decode(content.value, undefined),
        ),
      };
    case '/injective.exchange.v1beta1.DerivativeMarketParamUpdateProposal':
      return {
        type: 'exchange/DerivativeMarketParamUpdateProposal',
        value: DerivativeMarketParamUpdateProposal.toAmino(
          DerivativeMarketParamUpdateProposal.decode(content.value, undefined),
        ),
      };
    case '/injective.exchange.v1beta1.MarketForcedSettlementProposal':
      return {
        type: 'exchange/MarketForcedSettlementProposal',
        value: MarketForcedSettlementProposal.toAmino(MarketForcedSettlementProposal.decode(content.value, undefined)),
      };
    case '/injective.exchange.v1beta1.UpdateDenomDecimalsProposal':
      return {
        type: 'exchange/UpdateDenomDecimalsProposal',
        value: UpdateDenomDecimalsProposal.toAmino(UpdateDenomDecimalsProposal.decode(content.value, undefined)),
      };
    case '/injective.exchange.v1beta1.BinaryOptionsMarketParamUpdateProposal':
      return {
        type: 'exchange/BinaryOptionsMarketParamUpdateProposal',
        value: BinaryOptionsMarketParamUpdateProposal.toAmino(
          BinaryOptionsMarketParamUpdateProposal.decode(content.value, undefined),
        ),
      };
    case '/injective.exchange.v1beta1.TradingRewardCampaignLaunchProposal':
      return {
        type: 'exchange/TradingRewardCampaignLaunchProposal',
        value: TradingRewardCampaignLaunchProposal.toAmino(
          TradingRewardCampaignLaunchProposal.decode(content.value, undefined),
        ),
      };
    case '/injective.exchange.v1beta1.TradingRewardCampaignUpdateProposal':
      return {
        type: 'exchange/TradingRewardCampaignUpdateProposal',
        value: TradingRewardCampaignUpdateProposal.toAmino(
          TradingRewardCampaignUpdateProposal.decode(content.value, undefined),
        ),
      };
    case '/injective.exchange.v1beta1.TradingRewardPendingPointsUpdateProposal':
      return {
        type: 'exchange/TradingRewardPendingPointsUpdateProposal',
        value: TradingRewardPendingPointsUpdateProposal.toAmino(
          TradingRewardPendingPointsUpdateProposal.decode(content.value, undefined),
        ),
      };
    case '/injective.exchange.v1beta1.FeeDiscountProposal':
      return {
        type: 'exchange/FeeDiscountProposal',
        value: FeeDiscountProposal.toAmino(FeeDiscountProposal.decode(content.value, undefined)),
      };
    case '/injective.exchange.v1beta1.BatchCommunityPoolSpendProposal':
      return {
        type: 'exchange/BatchCommunityPoolSpendProposal',
        value: BatchCommunityPoolSpendProposal.toAmino(
          BatchCommunityPoolSpendProposal.decode(content.value, undefined),
        ),
      };
    case '/injective.exchange.v1beta1.AtomicMarketOrderFeeMultiplierScheduleProposal':
      return {
        type: 'exchange/AtomicMarketOrderFeeMultiplierScheduleProposal',
        value: AtomicMarketOrderFeeMultiplierScheduleProposal.toAmino(
          AtomicMarketOrderFeeMultiplierScheduleProposal.decode(content.value, undefined),
        ),
      };
    case '/injective.ocr.v1beta1.SetConfigProposal':
      return {
        type: 'ocr/SetConfigProposal',
        value: SetConfigProposal.toAmino(SetConfigProposal.decode(content.value, undefined)),
      };
    case '/injective.ocr.v1beta1.SetBatchConfigProposal':
      return {
        type: 'ocr/SetBatchConfigProposal',
        value: SetBatchConfigProposal.toAmino(SetBatchConfigProposal.decode(content.value, undefined)),
      };
    case '/injective.oracle.v1beta1.GrantBandOraclePrivilegeProposal':
      return {
        type: 'oracle/GrantBandOraclePrivilegeProposal',
        value: GrantBandOraclePrivilegeProposal.toAmino(
          GrantBandOraclePrivilegeProposal.decode(content.value, undefined),
        ),
      };
    case '/injective.oracle.v1beta1.RevokeBandOraclePrivilegeProposal':
      return {
        type: 'oracle/RevokeBandOraclePrivilegeProposal',
        value: RevokeBandOraclePrivilegeProposal.toAmino(
          RevokeBandOraclePrivilegeProposal.decode(content.value, undefined),
        ),
      };
    case '/injective.oracle.v1beta1.GrantPriceFeederPrivilegeProposal':
      return {
        type: 'oracle/GrantPriceFeederPrivilegeProposal',
        value: GrantPriceFeederPrivilegeProposal.toAmino(
          GrantPriceFeederPrivilegeProposal.decode(content.value, undefined),
        ),
      };
    case '/injective.oracle.v1beta1.GrantProviderPrivilegeProposal':
      return {
        type: 'oracle/GrantProviderPrivilegeProposal',
        value: GrantProviderPrivilegeProposal.toAmino(GrantProviderPrivilegeProposal.decode(content.value, undefined)),
      };
    case '/injective.oracle.v1beta1.RevokeProviderPrivilegeProposal':
      return {
        type: 'oracle/RevokeProviderPrivilegeProposal',
        value: RevokeProviderPrivilegeProposal.toAmino(
          RevokeProviderPrivilegeProposal.decode(content.value, undefined),
        ),
      };
    case '/injective.oracle.v1beta1.RevokePriceFeederPrivilegeProposal':
      return {
        type: 'oracle/RevokePriceFeederPrivilegeProposal',
        value: RevokePriceFeederPrivilegeProposal.toAmino(
          RevokePriceFeederPrivilegeProposal.decode(content.value, undefined),
        ),
      };
    case '/injective.oracle.v1beta1.AuthorizeBandOracleRequestProposal':
      return {
        type: 'oracle/AuthorizeBandOracleRequestProposal',
        value: AuthorizeBandOracleRequestProposal.toAmino(
          AuthorizeBandOracleRequestProposal.decode(content.value, undefined),
        ),
      };
    case '/injective.oracle.v1beta1.UpdateBandOracleRequestProposal':
      return {
        type: 'oracle/UpdateBandOracleRequestProposal',
        value: UpdateBandOracleRequestProposal.toAmino(
          UpdateBandOracleRequestProposal.decode(content.value, undefined),
        ),
      };
    case '/injective.oracle.v1beta1.EnableBandIBCProposal':
      return {
        type: 'oracle/EnableBandIBCProposal',
        value: EnableBandIBCProposal.toAmino(EnableBandIBCProposal.decode(content.value, undefined)),
      };
    case '/injective.oracle.v1beta1.GrantStorkPublisherPrivilegeProposal':
      return {
        type: 'oracle/GrantStorkPublisherPrivilegeProposal',
        value: GrantStorkPublisherPrivilegeProposal.toAmino(
          GrantStorkPublisherPrivilegeProposal.decode(content.value, undefined),
        ),
      };
    case '/injective.oracle.v1beta1.RevokeStorkPublisherPrivilegeProposal':
      return {
        type: 'oracle/RevokeStorkPublisherPrivilegeProposal',
        value: RevokeStorkPublisherPrivilegeProposal.toAmino(
          RevokeStorkPublisherPrivilegeProposal.decode(content.value, undefined),
        ),
      };
    case '/injective.wasmx.v1.ContractRegistrationRequestProposal':
      return {
        type: 'wasmx/ContractRegistrationRequestProposal',
        value: ContractRegistrationRequestProposal.toAmino(
          ContractRegistrationRequestProposal.decode(content.value, undefined),
        ),
      };
    case '/injective.wasmx.v1.BatchContractRegistrationRequestProposal':
      return {
        type: 'wasmx/BatchContractRegistrationRequestProposal',
        value: BatchContractRegistrationRequestProposal.toAmino(
          BatchContractRegistrationRequestProposal.decode(content.value, undefined),
        ),
      };
    case '/injective.wasmx.v1.BatchContractDeregistrationProposal':
      return {
        type: 'wasmx/BatchContractDeregistrationProposal',
        value: BatchContractDeregistrationProposal.toAmino(
          BatchContractDeregistrationProposal.decode(content.value, undefined),
        ),
      };
    case '/injective.wasmx.v1.ContractRegistrationRequest':
      return {
        type: '/injective.wasmx.v1.ContractRegistrationRequest',
        value: ContractRegistrationRequest.toAmino(ContractRegistrationRequest.decode(content.value, undefined)),
      };
    case '/injective.wasmx.v1.BatchStoreCodeProposal':
      return {
        type: 'wasmx/BatchStoreCodeProposal',
        value: BatchStoreCodeProposal.toAmino(BatchStoreCodeProposal.decode(content.value, undefined)),
      };
    default:
      return Any.toAmino(content);
  }
};
