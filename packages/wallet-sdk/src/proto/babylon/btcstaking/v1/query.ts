import { Decimal } from '@cosmjs/math';

import { BinaryReader, BinaryWriter } from '../../../binary';
import { base64FromBytes, bytesFromBase64 } from '../../../helpers';
import {
  PageRequest,
  PageRequestAmino,
  PageRequestSDKType,
  PageResponse,
  PageResponseAmino,
  PageResponseSDKType,
} from '../../core-proto-ts/cosmos/base/query/v1beta1/pagination';
import {
  Description,
  DescriptionAmino,
  DescriptionSDKType,
  Params,
  ParamsAmino,
  ParamsSDKType,
} from '../../core-proto-ts/cosmos/staking/v1beta1/staking';
import {
  BTCDelegationStatus,
  CovenantAdaptorSignatures,
  CovenantAdaptorSignaturesAmino,
  CovenantAdaptorSignaturesSDKType,
  FinalityProviderWithMeta,
  FinalityProviderWithMetaAmino,
  FinalityProviderWithMetaSDKType,
  SignatureInfo,
  SignatureInfoAmino,
  SignatureInfoSDKType,
} from './btcstaking';
import { ProofOfPossessionBTC, ProofOfPossessionBTCAmino, ProofOfPossessionBTCSDKType } from './pop';
/** QueryParamsRequest is request type for the Query/Params RPC method. */
export interface QueryParamsRequest {}
export interface QueryParamsRequestProtoMsg {
  typeUrl: '/babylon.btcstaking.v1.QueryParamsRequest';
  value: Uint8Array;
}
/** QueryParamsRequest is request type for the Query/Params RPC method. */
export interface QueryParamsRequestAmino {}
export interface QueryParamsRequestAminoMsg {
  type: '/babylon.btcstaking.v1.QueryParamsRequest';
  value: QueryParamsRequestAmino;
}
/** QueryParamsRequest is request type for the Query/Params RPC method. */
export interface QueryParamsRequestSDKType {}
/** QueryParamsResponse is response type for the Query/Params RPC method. */
export interface QueryParamsResponse {
  /** params holds all the parameters of this module. */
  params: Params;
}
export interface QueryParamsResponseProtoMsg {
  typeUrl: '/babylon.btcstaking.v1.QueryParamsResponse';
  value: Uint8Array;
}
/** QueryParamsResponse is response type for the Query/Params RPC method. */
export interface QueryParamsResponseAmino {
  /** params holds all the parameters of this module. */
  params?: ParamsAmino;
}
export interface QueryParamsResponseAminoMsg {
  type: '/babylon.btcstaking.v1.QueryParamsResponse';
  value: QueryParamsResponseAmino;
}
/** QueryParamsResponse is response type for the Query/Params RPC method. */
export interface QueryParamsResponseSDKType {
  params: ParamsSDKType;
}
/** QueryParamsRequest is request type for the Query/Params RPC method. */
export interface QueryParamsByVersionRequest {
  version: number;
}
export interface QueryParamsByVersionRequestProtoMsg {
  typeUrl: '/babylon.btcstaking.v1.QueryParamsByVersionRequest';
  value: Uint8Array;
}
/** QueryParamsRequest is request type for the Query/Params RPC method. */
export interface QueryParamsByVersionRequestAmino {
  version?: number;
}
export interface QueryParamsByVersionRequestAminoMsg {
  type: '/babylon.btcstaking.v1.QueryParamsByVersionRequest';
  value: QueryParamsByVersionRequestAmino;
}
/** QueryParamsRequest is request type for the Query/Params RPC method. */
export interface QueryParamsByVersionRequestSDKType {
  version: number;
}
/** QueryParamsResponse is response type for the Query/Params RPC method. */
export interface QueryParamsByVersionResponse {
  /** params holds all the parameters of this module. */
  params: Params;
}
export interface QueryParamsByVersionResponseProtoMsg {
  typeUrl: '/babylon.btcstaking.v1.QueryParamsByVersionResponse';
  value: Uint8Array;
}
/** QueryParamsResponse is response type for the Query/Params RPC method. */
export interface QueryParamsByVersionResponseAmino {
  /** params holds all the parameters of this module. */
  params?: ParamsAmino;
}
export interface QueryParamsByVersionResponseAminoMsg {
  type: '/babylon.btcstaking.v1.QueryParamsByVersionResponse';
  value: QueryParamsByVersionResponseAmino;
}
/** QueryParamsResponse is response type for the Query/Params RPC method. */
export interface QueryParamsByVersionResponseSDKType {
  params: ParamsSDKType;
}
/**
 * QueryFinalityProvidersRequest is the request type for the
 * Query/FinalityProviders RPC method.
 */
export interface QueryFinalityProvidersRequest {
  /** pagination defines an optional pagination for the request. */
  pagination?: PageRequest;
}
export interface QueryFinalityProvidersRequestProtoMsg {
  typeUrl: '/babylon.btcstaking.v1.QueryFinalityProvidersRequest';
  value: Uint8Array;
}
/**
 * QueryFinalityProvidersRequest is the request type for the
 * Query/FinalityProviders RPC method.
 */
export interface QueryFinalityProvidersRequestAmino {
  /** pagination defines an optional pagination for the request. */
  pagination?: PageRequestAmino;
}
export interface QueryFinalityProvidersRequestAminoMsg {
  type: '/babylon.btcstaking.v1.QueryFinalityProvidersRequest';
  value: QueryFinalityProvidersRequestAmino;
}
/**
 * QueryFinalityProvidersRequest is the request type for the
 * Query/FinalityProviders RPC method.
 */
export interface QueryFinalityProvidersRequestSDKType {
  pagination?: PageRequestSDKType;
}
/**
 * QueryFinalityProvidersResponse is the response type for the
 * Query/FinalityProviders RPC method.
 */
export interface QueryFinalityProvidersResponse {
  /** finality_providers contains all the finality providers */
  finalityProviders: FinalityProviderResponse[];
  /** pagination defines the pagination in the response. */
  pagination?: PageResponse;
}
export interface QueryFinalityProvidersResponseProtoMsg {
  typeUrl: '/babylon.btcstaking.v1.QueryFinalityProvidersResponse';
  value: Uint8Array;
}
/**
 * QueryFinalityProvidersResponse is the response type for the
 * Query/FinalityProviders RPC method.
 */
export interface QueryFinalityProvidersResponseAmino {
  /** finality_providers contains all the finality providers */
  finality_providers?: FinalityProviderResponseAmino[];
  /** pagination defines the pagination in the response. */
  pagination?: PageResponseAmino;
}
export interface QueryFinalityProvidersResponseAminoMsg {
  type: '/babylon.btcstaking.v1.QueryFinalityProvidersResponse';
  value: QueryFinalityProvidersResponseAmino;
}
/**
 * QueryFinalityProvidersResponse is the response type for the
 * Query/FinalityProviders RPC method.
 */
export interface QueryFinalityProvidersResponseSDKType {
  finality_providers: FinalityProviderResponseSDKType[];
  pagination?: PageResponseSDKType;
}
/** QueryFinalityProviderRequest requests information about a finality provider */
export interface QueryFinalityProviderRequest {
  /** fp_btc_pk_hex is the hex str of Bitcoin secp256k1 PK of the finality provider */
  fpBtcPkHex: string;
}
export interface QueryFinalityProviderRequestProtoMsg {
  typeUrl: '/babylon.btcstaking.v1.QueryFinalityProviderRequest';
  value: Uint8Array;
}
/** QueryFinalityProviderRequest requests information about a finality provider */
export interface QueryFinalityProviderRequestAmino {
  /** fp_btc_pk_hex is the hex str of Bitcoin secp256k1 PK of the finality provider */
  fp_btc_pk_hex?: string;
}
export interface QueryFinalityProviderRequestAminoMsg {
  type: '/babylon.btcstaking.v1.QueryFinalityProviderRequest';
  value: QueryFinalityProviderRequestAmino;
}
/** QueryFinalityProviderRequest requests information about a finality provider */
export interface QueryFinalityProviderRequestSDKType {
  fp_btc_pk_hex: string;
}
/** QueryFinalityProviderResponse contains information about a finality provider */
export interface QueryFinalityProviderResponse {
  /** finality_provider contains the FinalityProvider */
  finalityProvider?: FinalityProviderResponse;
}
export interface QueryFinalityProviderResponseProtoMsg {
  typeUrl: '/babylon.btcstaking.v1.QueryFinalityProviderResponse';
  value: Uint8Array;
}
/** QueryFinalityProviderResponse contains information about a finality provider */
export interface QueryFinalityProviderResponseAmino {
  /** finality_provider contains the FinalityProvider */
  finality_provider?: FinalityProviderResponseAmino;
}
export interface QueryFinalityProviderResponseAminoMsg {
  type: '/babylon.btcstaking.v1.QueryFinalityProviderResponse';
  value: QueryFinalityProviderResponseAmino;
}
/** QueryFinalityProviderResponse contains information about a finality provider */
export interface QueryFinalityProviderResponseSDKType {
  finality_provider?: FinalityProviderResponseSDKType;
}
/**
 * QueryBTCDelegationsRequest is the request type for the
 * Query/BTCDelegations RPC method.
 */
export interface QueryBTCDelegationsRequest {
  /** status is the queried status for BTC delegations */
  status: BTCDelegationStatus;
  /** pagination defines an optional pagination for the request. */
  pagination?: PageRequest;
}
export interface QueryBTCDelegationsRequestProtoMsg {
  typeUrl: '/babylon.btcstaking.v1.QueryBTCDelegationsRequest';
  value: Uint8Array;
}
/**
 * QueryBTCDelegationsRequest is the request type for the
 * Query/BTCDelegations RPC method.
 */
export interface QueryBTCDelegationsRequestAmino {
  /** status is the queried status for BTC delegations */
  status?: BTCDelegationStatus;
  /** pagination defines an optional pagination for the request. */
  pagination?: PageRequestAmino;
}
export interface QueryBTCDelegationsRequestAminoMsg {
  type: '/babylon.btcstaking.v1.QueryBTCDelegationsRequest';
  value: QueryBTCDelegationsRequestAmino;
}
/**
 * QueryBTCDelegationsRequest is the request type for the
 * Query/BTCDelegations RPC method.
 */
export interface QueryBTCDelegationsRequestSDKType {
  status: BTCDelegationStatus;
  pagination?: PageRequestSDKType;
}
/**
 * QueryBTCDelegationsResponse is the response type for the
 * Query/BTCDelegations RPC method.
 */
export interface QueryBTCDelegationsResponse {
  /** btc_delegations contains all the queried BTC delegations under the given status */
  btcDelegations: BTCDelegationResponse[];
  /** pagination defines the pagination in the response. */
  pagination?: PageResponse;
}
export interface QueryBTCDelegationsResponseProtoMsg {
  typeUrl: '/babylon.btcstaking.v1.QueryBTCDelegationsResponse';
  value: Uint8Array;
}
/**
 * QueryBTCDelegationsResponse is the response type for the
 * Query/BTCDelegations RPC method.
 */
export interface QueryBTCDelegationsResponseAmino {
  /** btc_delegations contains all the queried BTC delegations under the given status */
  btc_delegations?: BTCDelegationResponseAmino[];
  /** pagination defines the pagination in the response. */
  pagination?: PageResponseAmino;
}
export interface QueryBTCDelegationsResponseAminoMsg {
  type: '/babylon.btcstaking.v1.QueryBTCDelegationsResponse';
  value: QueryBTCDelegationsResponseAmino;
}
/**
 * QueryBTCDelegationsResponse is the response type for the
 * Query/BTCDelegations RPC method.
 */
export interface QueryBTCDelegationsResponseSDKType {
  btc_delegations: BTCDelegationResponseSDKType[];
  pagination?: PageResponseSDKType;
}
/**
 * QueryFinalityProviderPowerAtHeightRequest is the request type for the
 * Query/FinalityProviderPowerAtHeight RPC method.
 */
export interface QueryFinalityProviderPowerAtHeightRequest {
  /**
   * fp_btc_pk_hex is the hex str of Bitcoin secp256k1 PK of the finality provider that
   * this BTC delegation delegates to
   * the PK follows encoding in BIP-340 spec
   */
  fpBtcPkHex: string;
  /** height is used for querying the given finality provider's voting power at this height */
  height: bigint;
}
export interface QueryFinalityProviderPowerAtHeightRequestProtoMsg {
  typeUrl: '/babylon.btcstaking.v1.QueryFinalityProviderPowerAtHeightRequest';
  value: Uint8Array;
}
/**
 * QueryFinalityProviderPowerAtHeightRequest is the request type for the
 * Query/FinalityProviderPowerAtHeight RPC method.
 */
export interface QueryFinalityProviderPowerAtHeightRequestAmino {
  /**
   * fp_btc_pk_hex is the hex str of Bitcoin secp256k1 PK of the finality provider that
   * this BTC delegation delegates to
   * the PK follows encoding in BIP-340 spec
   */
  fp_btc_pk_hex?: string;
  /** height is used for querying the given finality provider's voting power at this height */
  height?: string;
}
export interface QueryFinalityProviderPowerAtHeightRequestAminoMsg {
  type: '/babylon.btcstaking.v1.QueryFinalityProviderPowerAtHeightRequest';
  value: QueryFinalityProviderPowerAtHeightRequestAmino;
}
/**
 * QueryFinalityProviderPowerAtHeightRequest is the request type for the
 * Query/FinalityProviderPowerAtHeight RPC method.
 */
export interface QueryFinalityProviderPowerAtHeightRequestSDKType {
  fp_btc_pk_hex: string;
  height: bigint;
}
/**
 * QueryFinalityProviderPowerAtHeightResponse is the response type for the
 * Query/FinalityProviderPowerAtHeight RPC method.
 */
export interface QueryFinalityProviderPowerAtHeightResponse {
  /** voting_power is the voting power of the finality provider */
  votingPower: bigint;
}
export interface QueryFinalityProviderPowerAtHeightResponseProtoMsg {
  typeUrl: '/babylon.btcstaking.v1.QueryFinalityProviderPowerAtHeightResponse';
  value: Uint8Array;
}
/**
 * QueryFinalityProviderPowerAtHeightResponse is the response type for the
 * Query/FinalityProviderPowerAtHeight RPC method.
 */
export interface QueryFinalityProviderPowerAtHeightResponseAmino {
  /** voting_power is the voting power of the finality provider */
  voting_power?: string;
}
export interface QueryFinalityProviderPowerAtHeightResponseAminoMsg {
  type: '/babylon.btcstaking.v1.QueryFinalityProviderPowerAtHeightResponse';
  value: QueryFinalityProviderPowerAtHeightResponseAmino;
}
/**
 * QueryFinalityProviderPowerAtHeightResponse is the response type for the
 * Query/FinalityProviderPowerAtHeight RPC method.
 */
export interface QueryFinalityProviderPowerAtHeightResponseSDKType {
  voting_power: bigint;
}
/**
 * QueryFinalityProviderCurrentPowerRequest is the request type for the
 * Query/FinalityProviderCurrentPower RPC method.
 */
export interface QueryFinalityProviderCurrentPowerRequest {
  /**
   * fp_btc_pk_hex is the hex str of Bitcoin secp256k1 PK of the finality provider that
   * this BTC delegation delegates to
   * the PK follows encoding in BIP-340 spec
   */
  fpBtcPkHex: string;
}
export interface QueryFinalityProviderCurrentPowerRequestProtoMsg {
  typeUrl: '/babylon.btcstaking.v1.QueryFinalityProviderCurrentPowerRequest';
  value: Uint8Array;
}
/**
 * QueryFinalityProviderCurrentPowerRequest is the request type for the
 * Query/FinalityProviderCurrentPower RPC method.
 */
export interface QueryFinalityProviderCurrentPowerRequestAmino {
  /**
   * fp_btc_pk_hex is the hex str of Bitcoin secp256k1 PK of the finality provider that
   * this BTC delegation delegates to
   * the PK follows encoding in BIP-340 spec
   */
  fp_btc_pk_hex?: string;
}
export interface QueryFinalityProviderCurrentPowerRequestAminoMsg {
  type: '/babylon.btcstaking.v1.QueryFinalityProviderCurrentPowerRequest';
  value: QueryFinalityProviderCurrentPowerRequestAmino;
}
/**
 * QueryFinalityProviderCurrentPowerRequest is the request type for the
 * Query/FinalityProviderCurrentPower RPC method.
 */
export interface QueryFinalityProviderCurrentPowerRequestSDKType {
  fp_btc_pk_hex: string;
}
/**
 * QueryFinalityProviderCurrentPowerResponse is the response type for the
 * Query/FinalityProviderCurrentPower RPC method.
 */
export interface QueryFinalityProviderCurrentPowerResponse {
  /** height is the current height */
  height: bigint;
  /** voting_power is the voting power of the finality provider */
  votingPower: bigint;
}
export interface QueryFinalityProviderCurrentPowerResponseProtoMsg {
  typeUrl: '/babylon.btcstaking.v1.QueryFinalityProviderCurrentPowerResponse';
  value: Uint8Array;
}
/**
 * QueryFinalityProviderCurrentPowerResponse is the response type for the
 * Query/FinalityProviderCurrentPower RPC method.
 */
export interface QueryFinalityProviderCurrentPowerResponseAmino {
  /** height is the current height */
  height?: string;
  /** voting_power is the voting power of the finality provider */
  voting_power?: string;
}
export interface QueryFinalityProviderCurrentPowerResponseAminoMsg {
  type: '/babylon.btcstaking.v1.QueryFinalityProviderCurrentPowerResponse';
  value: QueryFinalityProviderCurrentPowerResponseAmino;
}
/**
 * QueryFinalityProviderCurrentPowerResponse is the response type for the
 * Query/FinalityProviderCurrentPower RPC method.
 */
export interface QueryFinalityProviderCurrentPowerResponseSDKType {
  height: bigint;
  voting_power: bigint;
}
/**
 * QueryActiveFinalityProvidersAtHeightRequest is the request type for the
 * Query/ActiveFinalityProvidersAtHeight RPC method.
 */
export interface QueryActiveFinalityProvidersAtHeightRequest {
  /** height defines at which Babylon height to query the finality providers info. */
  height: bigint;
  /** pagination defines an optional pagination for the request. */
  pagination?: PageRequest;
}
export interface QueryActiveFinalityProvidersAtHeightRequestProtoMsg {
  typeUrl: '/babylon.btcstaking.v1.QueryActiveFinalityProvidersAtHeightRequest';
  value: Uint8Array;
}
/**
 * QueryActiveFinalityProvidersAtHeightRequest is the request type for the
 * Query/ActiveFinalityProvidersAtHeight RPC method.
 */
export interface QueryActiveFinalityProvidersAtHeightRequestAmino {
  /** height defines at which Babylon height to query the finality providers info. */
  height?: string;
  /** pagination defines an optional pagination for the request. */
  pagination?: PageRequestAmino;
}
export interface QueryActiveFinalityProvidersAtHeightRequestAminoMsg {
  type: '/babylon.btcstaking.v1.QueryActiveFinalityProvidersAtHeightRequest';
  value: QueryActiveFinalityProvidersAtHeightRequestAmino;
}
/**
 * QueryActiveFinalityProvidersAtHeightRequest is the request type for the
 * Query/ActiveFinalityProvidersAtHeight RPC method.
 */
export interface QueryActiveFinalityProvidersAtHeightRequestSDKType {
  height: bigint;
  pagination?: PageRequestSDKType;
}
/**
 * QueryActiveFinalityProvidersAtHeightResponse is the response type for the
 * Query/ActiveFinalityProvidersAtHeight RPC method.
 */
export interface QueryActiveFinalityProvidersAtHeightResponse {
  /** finality_providers contains all the queried finality providersn. */
  finalityProviders: FinalityProviderWithMeta[];
  /** pagination defines the pagination in the response. */
  pagination?: PageResponse;
}
export interface QueryActiveFinalityProvidersAtHeightResponseProtoMsg {
  typeUrl: '/babylon.btcstaking.v1.QueryActiveFinalityProvidersAtHeightResponse';
  value: Uint8Array;
}
/**
 * QueryActiveFinalityProvidersAtHeightResponse is the response type for the
 * Query/ActiveFinalityProvidersAtHeight RPC method.
 */
export interface QueryActiveFinalityProvidersAtHeightResponseAmino {
  /** finality_providers contains all the queried finality providersn. */
  finality_providers?: FinalityProviderWithMetaAmino[];
  /** pagination defines the pagination in the response. */
  pagination?: PageResponseAmino;
}
export interface QueryActiveFinalityProvidersAtHeightResponseAminoMsg {
  type: '/babylon.btcstaking.v1.QueryActiveFinalityProvidersAtHeightResponse';
  value: QueryActiveFinalityProvidersAtHeightResponseAmino;
}
/**
 * QueryActiveFinalityProvidersAtHeightResponse is the response type for the
 * Query/ActiveFinalityProvidersAtHeight RPC method.
 */
export interface QueryActiveFinalityProvidersAtHeightResponseSDKType {
  finality_providers: FinalityProviderWithMetaSDKType[];
  pagination?: PageResponseSDKType;
}
/** QueryActivatedHeightRequest is the request type for the Query/ActivatedHeight RPC method. */
export interface QueryActivatedHeightRequest {}
export interface QueryActivatedHeightRequestProtoMsg {
  typeUrl: '/babylon.btcstaking.v1.QueryActivatedHeightRequest';
  value: Uint8Array;
}
/** QueryActivatedHeightRequest is the request type for the Query/ActivatedHeight RPC method. */
export interface QueryActivatedHeightRequestAmino {}
export interface QueryActivatedHeightRequestAminoMsg {
  type: '/babylon.btcstaking.v1.QueryActivatedHeightRequest';
  value: QueryActivatedHeightRequestAmino;
}
/** QueryActivatedHeightRequest is the request type for the Query/ActivatedHeight RPC method. */
export interface QueryActivatedHeightRequestSDKType {}
/** QueryActivatedHeightResponse is the response type for the Query/ActivatedHeight RPC method. */
export interface QueryActivatedHeightResponse {
  height: bigint;
}
export interface QueryActivatedHeightResponseProtoMsg {
  typeUrl: '/babylon.btcstaking.v1.QueryActivatedHeightResponse';
  value: Uint8Array;
}
/** QueryActivatedHeightResponse is the response type for the Query/ActivatedHeight RPC method. */
export interface QueryActivatedHeightResponseAmino {
  height?: string;
}
export interface QueryActivatedHeightResponseAminoMsg {
  type: '/babylon.btcstaking.v1.QueryActivatedHeightResponse';
  value: QueryActivatedHeightResponseAmino;
}
/** QueryActivatedHeightResponse is the response type for the Query/ActivatedHeight RPC method. */
export interface QueryActivatedHeightResponseSDKType {
  height: bigint;
}
/**
 * QueryFinalityProviderDelegationsRequest is the request type for the
 * Query/FinalityProviderDelegations RPC method.
 */
export interface QueryFinalityProviderDelegationsRequest {
  /**
   * fp_btc_pk_hex is the hex str of Bitcoin secp256k1 PK of the finality providerthat
   * this BTC delegation delegates to
   * the PK follows encoding in BIP-340 spec
   */
  fpBtcPkHex: string;
  /** pagination defines an optional pagination for the request. */
  pagination?: PageRequest;
}
export interface QueryFinalityProviderDelegationsRequestProtoMsg {
  typeUrl: '/babylon.btcstaking.v1.QueryFinalityProviderDelegationsRequest';
  value: Uint8Array;
}
/**
 * QueryFinalityProviderDelegationsRequest is the request type for the
 * Query/FinalityProviderDelegations RPC method.
 */
export interface QueryFinalityProviderDelegationsRequestAmino {
  /**
   * fp_btc_pk_hex is the hex str of Bitcoin secp256k1 PK of the finality providerthat
   * this BTC delegation delegates to
   * the PK follows encoding in BIP-340 spec
   */
  fp_btc_pk_hex?: string;
  /** pagination defines an optional pagination for the request. */
  pagination?: PageRequestAmino;
}
export interface QueryFinalityProviderDelegationsRequestAminoMsg {
  type: '/babylon.btcstaking.v1.QueryFinalityProviderDelegationsRequest';
  value: QueryFinalityProviderDelegationsRequestAmino;
}
/**
 * QueryFinalityProviderDelegationsRequest is the request type for the
 * Query/FinalityProviderDelegations RPC method.
 */
export interface QueryFinalityProviderDelegationsRequestSDKType {
  fp_btc_pk_hex: string;
  pagination?: PageRequestSDKType;
}
/**
 * QueryFinalityProviderDelegationsResponse is the response type for the
 * Query/FinalityProviderDelegations RPC method.
 */
export interface QueryFinalityProviderDelegationsResponse {
  /** btc_delegator_delegations contains all the queried BTC delegations. */
  btcDelegatorDelegations: BTCDelegatorDelegationsResponse[];
  /** pagination defines the pagination in the response. */
  pagination?: PageResponse;
}
export interface QueryFinalityProviderDelegationsResponseProtoMsg {
  typeUrl: '/babylon.btcstaking.v1.QueryFinalityProviderDelegationsResponse';
  value: Uint8Array;
}
/**
 * QueryFinalityProviderDelegationsResponse is the response type for the
 * Query/FinalityProviderDelegations RPC method.
 */
export interface QueryFinalityProviderDelegationsResponseAmino {
  /** btc_delegator_delegations contains all the queried BTC delegations. */
  btc_delegator_delegations?: BTCDelegatorDelegationsResponseAmino[];
  /** pagination defines the pagination in the response. */
  pagination?: PageResponseAmino;
}
export interface QueryFinalityProviderDelegationsResponseAminoMsg {
  type: '/babylon.btcstaking.v1.QueryFinalityProviderDelegationsResponse';
  value: QueryFinalityProviderDelegationsResponseAmino;
}
/**
 * QueryFinalityProviderDelegationsResponse is the response type for the
 * Query/FinalityProviderDelegations RPC method.
 */
export interface QueryFinalityProviderDelegationsResponseSDKType {
  btc_delegator_delegations: BTCDelegatorDelegationsResponseSDKType[];
  pagination?: PageResponseSDKType;
}
/**
 * QueryBTCDelegationRequest is the request type to retrieve a BTC delegation by
 * staking tx hash
 */
export interface QueryBTCDelegationRequest {
  /** Hash of staking transaction in btc format */
  stakingTxHashHex: string;
}
export interface QueryBTCDelegationRequestProtoMsg {
  typeUrl: '/babylon.btcstaking.v1.QueryBTCDelegationRequest';
  value: Uint8Array;
}
/**
 * QueryBTCDelegationRequest is the request type to retrieve a BTC delegation by
 * staking tx hash
 */
export interface QueryBTCDelegationRequestAmino {
  /** Hash of staking transaction in btc format */
  staking_tx_hash_hex?: string;
}
export interface QueryBTCDelegationRequestAminoMsg {
  type: '/babylon.btcstaking.v1.QueryBTCDelegationRequest';
  value: QueryBTCDelegationRequestAmino;
}
/**
 * QueryBTCDelegationRequest is the request type to retrieve a BTC delegation by
 * staking tx hash
 */
export interface QueryBTCDelegationRequestSDKType {
  staking_tx_hash_hex: string;
}
/**
 * QueryBTCDelegationResponse is response type matching QueryBTCDelegationRequest
 * and containing BTC delegation information
 */
export interface QueryBTCDelegationResponse {
  /** BTCDelegation represents the client needed information of an BTCDelegation. */
  btcDelegation?: BTCDelegationResponse;
}
export interface QueryBTCDelegationResponseProtoMsg {
  typeUrl: '/babylon.btcstaking.v1.QueryBTCDelegationResponse';
  value: Uint8Array;
}
/**
 * QueryBTCDelegationResponse is response type matching QueryBTCDelegationRequest
 * and containing BTC delegation information
 */
export interface QueryBTCDelegationResponseAmino {
  /** BTCDelegation represents the client needed information of an BTCDelegation. */
  btc_delegation?: BTCDelegationResponseAmino;
}
export interface QueryBTCDelegationResponseAminoMsg {
  type: '/babylon.btcstaking.v1.QueryBTCDelegationResponse';
  value: QueryBTCDelegationResponseAmino;
}
/**
 * QueryBTCDelegationResponse is response type matching QueryBTCDelegationRequest
 * and containing BTC delegation information
 */
export interface QueryBTCDelegationResponseSDKType {
  btc_delegation?: BTCDelegationResponseSDKType;
}
/** BTCDelegationResponse is the client needed information from a BTCDelegation with the current status based on parameters. */
export interface BTCDelegationResponse {
  /** staker_addr is the address to receive rewards from BTC delegation. */
  stakerAddr: string;
  /**
   * btc_pk is the Bitcoin secp256k1 PK of this BTC delegation
   * the PK follows encoding in BIP-340 spec
   */
  btcPk: Uint8Array;
  /**
   * fp_btc_pk_list is the list of BIP-340 PKs of the finality providers that
   * this BTC delegation delegates to
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
  /** staking_tx_hex is the hex string of staking tx */
  stakingTxHex: string;
  /** slashing_tx_hex is the hex string of slashing tx */
  slashingTxHex: string;
  /**
   * delegator_slash_sig_hex is the signature on the slashing tx
   * by the delegator (i.e., SK corresponding to btc_pk) as string hex.
   * It will be a part of the witness for the staking tx output.
   */
  delegatorSlashSigHex: string;
  /**
   * covenant_sigs is a list of adaptor signatures on the slashing tx
   * by each covenant member
   * It will be a part of the witness for the staking tx output.
   */
  covenantSigs: CovenantAdaptorSignatures[];
  /** staking_output_idx is the index of the staking output in the staking tx */
  stakingOutputIdx: number;
  /** whether this delegation is active */
  active: boolean;
  /** descriptive status of current delegation. */
  statusDesc: string;
  /**
   * unbonding_time used in unbonding output timelock path and in slashing transactions
   * change outputs
   */
  unbondingTime: number;
  /** undelegation_response is the undelegation info of this delegation. */
  undelegationResponse?: BTCUndelegationResponse;
  /** params version used to validate delegation */
  paramsVersion: number;
}
export interface BTCDelegationResponseProtoMsg {
  typeUrl: '/babylon.btcstaking.v1.BTCDelegationResponse';
  value: Uint8Array;
}
/** BTCDelegationResponse is the client needed information from a BTCDelegation with the current status based on parameters. */
export interface BTCDelegationResponseAmino {
  /** staker_addr is the address to receive rewards from BTC delegation. */
  staker_addr?: string;
  /**
   * btc_pk is the Bitcoin secp256k1 PK of this BTC delegation
   * the PK follows encoding in BIP-340 spec
   */
  btc_pk?: string;
  /**
   * fp_btc_pk_list is the list of BIP-340 PKs of the finality providers that
   * this BTC delegation delegates to
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
  /** staking_tx_hex is the hex string of staking tx */
  staking_tx_hex?: string;
  /** slashing_tx_hex is the hex string of slashing tx */
  slashing_tx_hex?: string;
  /**
   * delegator_slash_sig_hex is the signature on the slashing tx
   * by the delegator (i.e., SK corresponding to btc_pk) as string hex.
   * It will be a part of the witness for the staking tx output.
   */
  delegator_slash_sig_hex?: string;
  /**
   * covenant_sigs is a list of adaptor signatures on the slashing tx
   * by each covenant member
   * It will be a part of the witness for the staking tx output.
   */
  covenant_sigs?: CovenantAdaptorSignaturesAmino[];
  /** staking_output_idx is the index of the staking output in the staking tx */
  staking_output_idx?: number;
  /** whether this delegation is active */
  active?: boolean;
  /** descriptive status of current delegation. */
  status_desc?: string;
  /**
   * unbonding_time used in unbonding output timelock path and in slashing transactions
   * change outputs
   */
  unbonding_time?: number;
  /** undelegation_response is the undelegation info of this delegation. */
  undelegation_response?: BTCUndelegationResponseAmino;
  /** params version used to validate delegation */
  params_version?: number;
}
export interface BTCDelegationResponseAminoMsg {
  type: '/babylon.btcstaking.v1.BTCDelegationResponse';
  value: BTCDelegationResponseAmino;
}
/** BTCDelegationResponse is the client needed information from a BTCDelegation with the current status based on parameters. */
export interface BTCDelegationResponseSDKType {
  staker_addr: string;
  btc_pk: Uint8Array;
  fp_btc_pk_list: Uint8Array[];
  start_height: bigint;
  end_height: bigint;
  total_sat: bigint;
  staking_tx_hex: string;
  slashing_tx_hex: string;
  delegator_slash_sig_hex: string;
  covenant_sigs: CovenantAdaptorSignaturesSDKType[];
  staking_output_idx: number;
  active: boolean;
  status_desc: string;
  unbonding_time: number;
  undelegation_response?: BTCUndelegationResponseSDKType;
  params_version: number;
}
/** BTCUndelegationResponse provides all necessary info about the undeleagation */
export interface BTCUndelegationResponse {
  /**
   * unbonding_tx is the transaction which will transfer the funds from staking
   * output to unbonding output. Unbonding output will usually have lower timelock
   * than staking output. The unbonding tx as string hex.
   */
  unbondingTxHex: string;
  /**
   * delegator_unbonding_sig is the signature on the unbonding tx
   * by the delegator (i.e., SK corresponding to btc_pk).
   * It effectively proves that the delegator wants to unbond and thus
   * Babylon will consider this BTC delegation unbonded. Delegator's BTC
   * on Bitcoin will be unbonded after timelock. The unbonding delegator sig as string hex.
   */
  delegatorUnbondingSigHex: string;
  /**
   * covenant_unbonding_sig_list is the list of signatures on the unbonding tx
   * by covenant members
   */
  covenantUnbondingSigList: SignatureInfo[];
  /** slashingTxHex is the hex string of slashing tx */
  slashingTxHex: string;
  /**
   * delegator_slashing_sig is the signature on the slashing tx
   * by the delegator (i.e., SK corresponding to btc_pk).
   * It will be a part of the witness for the unbonding tx output.
   * The delegator slashing sig as string hex.
   */
  delegatorSlashingSigHex: string;
  /**
   * covenant_slashing_sigs is a list of adaptor signatures on the
   * unbonding slashing tx by each covenant member
   * It will be a part of the witness for the staking tx output.
   */
  covenantSlashingSigs: CovenantAdaptorSignatures[];
}
export interface BTCUndelegationResponseProtoMsg {
  typeUrl: '/babylon.btcstaking.v1.BTCUndelegationResponse';
  value: Uint8Array;
}
/** BTCUndelegationResponse provides all necessary info about the undeleagation */
export interface BTCUndelegationResponseAmino {
  /**
   * unbonding_tx is the transaction which will transfer the funds from staking
   * output to unbonding output. Unbonding output will usually have lower timelock
   * than staking output. The unbonding tx as string hex.
   */
  unbonding_tx_hex?: string;
  /**
   * delegator_unbonding_sig is the signature on the unbonding tx
   * by the delegator (i.e., SK corresponding to btc_pk).
   * It effectively proves that the delegator wants to unbond and thus
   * Babylon will consider this BTC delegation unbonded. Delegator's BTC
   * on Bitcoin will be unbonded after timelock. The unbonding delegator sig as string hex.
   */
  delegator_unbonding_sig_hex?: string;
  /**
   * covenant_unbonding_sig_list is the list of signatures on the unbonding tx
   * by covenant members
   */
  covenant_unbonding_sig_list?: SignatureInfoAmino[];
  /** slashingTxHex is the hex string of slashing tx */
  slashing_tx_hex?: string;
  /**
   * delegator_slashing_sig is the signature on the slashing tx
   * by the delegator (i.e., SK corresponding to btc_pk).
   * It will be a part of the witness for the unbonding tx output.
   * The delegator slashing sig as string hex.
   */
  delegator_slashing_sig_hex?: string;
  /**
   * covenant_slashing_sigs is a list of adaptor signatures on the
   * unbonding slashing tx by each covenant member
   * It will be a part of the witness for the staking tx output.
   */
  covenant_slashing_sigs?: CovenantAdaptorSignaturesAmino[];
}
export interface BTCUndelegationResponseAminoMsg {
  type: '/babylon.btcstaking.v1.BTCUndelegationResponse';
  value: BTCUndelegationResponseAmino;
}
/** BTCUndelegationResponse provides all necessary info about the undeleagation */
export interface BTCUndelegationResponseSDKType {
  unbonding_tx_hex: string;
  delegator_unbonding_sig_hex: string;
  covenant_unbonding_sig_list: SignatureInfoSDKType[];
  slashing_tx_hex: string;
  delegator_slashing_sig_hex: string;
  covenant_slashing_sigs: CovenantAdaptorSignaturesSDKType[];
}
/** BTCDelegatorDelegationsResponse is a collection of BTC delegations responses from the same delegator. */
export interface BTCDelegatorDelegationsResponse {
  dels: BTCDelegationResponse[];
}
export interface BTCDelegatorDelegationsResponseProtoMsg {
  typeUrl: '/babylon.btcstaking.v1.BTCDelegatorDelegationsResponse';
  value: Uint8Array;
}
/** BTCDelegatorDelegationsResponse is a collection of BTC delegations responses from the same delegator. */
export interface BTCDelegatorDelegationsResponseAmino {
  dels?: BTCDelegationResponseAmino[];
}
export interface BTCDelegatorDelegationsResponseAminoMsg {
  type: '/babylon.btcstaking.v1.BTCDelegatorDelegationsResponse';
  value: BTCDelegatorDelegationsResponseAmino;
}
/** BTCDelegatorDelegationsResponse is a collection of BTC delegations responses from the same delegator. */
export interface BTCDelegatorDelegationsResponseSDKType {
  dels: BTCDelegationResponseSDKType[];
}
/** FinalityProviderResponse defines a finality provider with voting power information. */
export interface FinalityProviderResponse {
  /** description defines the description terms for the finality provider. */
  description?: Description;
  /** commission defines the commission rate of the finality provider. */
  commission: string;
  /** addr is the address to receive commission from delegations. */
  addr: string;
  /**
   * btc_pk is the Bitcoin secp256k1 PK of this finality provider
   * the PK follows encoding in BIP-340 spec
   */
  btcPk: Uint8Array;
  /**
   * pop is the proof of possession of the BTC_PK by the fp addr.
   * Essentially is the signature where the BTC SK sigs the fp addr.
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
  /** height is the queried Babylon height */
  height: bigint;
  /** voting_power is the voting power of this finality provider at the given height */
  votingPower: bigint;
  /** sluggish defines whether the finality provider is detected sluggish */
  sluggish: boolean;
}
export interface FinalityProviderResponseProtoMsg {
  typeUrl: '/babylon.btcstaking.v1.FinalityProviderResponse';
  value: Uint8Array;
}
/** FinalityProviderResponse defines a finality provider with voting power information. */
export interface FinalityProviderResponseAmino {
  /** description defines the description terms for the finality provider. */
  description?: DescriptionAmino;
  /** commission defines the commission rate of the finality provider. */
  commission?: string;
  /** addr is the address to receive commission from delegations. */
  addr?: string;
  /**
   * btc_pk is the Bitcoin secp256k1 PK of this finality provider
   * the PK follows encoding in BIP-340 spec
   */
  btc_pk?: string;
  /**
   * pop is the proof of possession of the BTC_PK by the fp addr.
   * Essentially is the signature where the BTC SK sigs the fp addr.
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
  /** height is the queried Babylon height */
  height?: string;
  /** voting_power is the voting power of this finality provider at the given height */
  voting_power?: string;
  /** sluggish defines whether the finality provider is detected sluggish */
  sluggish?: boolean;
}
export interface FinalityProviderResponseAminoMsg {
  type: '/babylon.btcstaking.v1.FinalityProviderResponse';
  value: FinalityProviderResponseAmino;
}
/** FinalityProviderResponse defines a finality provider with voting power information. */
export interface FinalityProviderResponseSDKType {
  description?: DescriptionSDKType;
  commission: string;
  addr: string;
  btc_pk: Uint8Array;
  pop?: ProofOfPossessionBTCSDKType;
  slashed_babylon_height: bigint;
  slashed_btc_height: bigint;
  height: bigint;
  voting_power: bigint;
  sluggish: boolean;
}
function createBaseQueryParamsRequest(): QueryParamsRequest {
  return {};
}
export const QueryParamsRequest = {
  typeUrl: '/babylon.btcstaking.v1.QueryParamsRequest',
  encode(_: QueryParamsRequest, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): QueryParamsRequest {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryParamsRequest();
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
  fromPartial(_: Partial<QueryParamsRequest>): QueryParamsRequest {
    const message = createBaseQueryParamsRequest();
    return message;
  },
  fromAmino(_: QueryParamsRequestAmino): QueryParamsRequest {
    const message = createBaseQueryParamsRequest();
    return message;
  },
  toAmino(_: QueryParamsRequest): QueryParamsRequestAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: QueryParamsRequestAminoMsg): QueryParamsRequest {
    return QueryParamsRequest.fromAmino(object.value);
  },
  fromProtoMsg(message: QueryParamsRequestProtoMsg): QueryParamsRequest {
    return QueryParamsRequest.decode(message.value);
  },
  toProto(message: QueryParamsRequest): Uint8Array {
    return QueryParamsRequest.encode(message).finish();
  },
  toProtoMsg(message: QueryParamsRequest): QueryParamsRequestProtoMsg {
    return {
      typeUrl: '/babylon.btcstaking.v1.QueryParamsRequest',
      value: QueryParamsRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryParamsResponse(): QueryParamsResponse {
  return {
    params: Params.fromPartial({}),
  };
}
export const QueryParamsResponse = {
  typeUrl: '/babylon.btcstaking.v1.QueryParamsResponse',
  encode(message: QueryParamsResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.params !== undefined) {
      Params.encode(message.params, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): QueryParamsResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryParamsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.params = Params.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<QueryParamsResponse>): QueryParamsResponse {
    const message = createBaseQueryParamsResponse();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    message.params =
      object.params !== undefined && object.params !== null ? Params.fromPartial(object.params) : undefined;
    return message;
  },
  fromAmino(object: QueryParamsResponseAmino): QueryParamsResponse {
    const message = createBaseQueryParamsResponse();
    if (object.params !== undefined && object.params !== null) {
      message.params = Params.fromAmino(object.params);
    }
    return message;
  },
  toAmino(message: QueryParamsResponse): QueryParamsResponseAmino {
    const obj: any = {};
    obj.params = message.params ? Params.toAmino(message.params) : undefined;
    return obj;
  },
  fromAminoMsg(object: QueryParamsResponseAminoMsg): QueryParamsResponse {
    return QueryParamsResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: QueryParamsResponseProtoMsg): QueryParamsResponse {
    return QueryParamsResponse.decode(message.value);
  },
  toProto(message: QueryParamsResponse): Uint8Array {
    return QueryParamsResponse.encode(message).finish();
  },
  toProtoMsg(message: QueryParamsResponse): QueryParamsResponseProtoMsg {
    return {
      typeUrl: '/babylon.btcstaking.v1.QueryParamsResponse',
      value: QueryParamsResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryParamsByVersionRequest(): QueryParamsByVersionRequest {
  return {
    version: 0,
  };
}
export const QueryParamsByVersionRequest = {
  typeUrl: '/babylon.btcstaking.v1.QueryParamsByVersionRequest',
  encode(message: QueryParamsByVersionRequest, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.version !== 0) {
      writer.uint32(8).uint32(message.version);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): QueryParamsByVersionRequest {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryParamsByVersionRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.version = reader.uint32();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<QueryParamsByVersionRequest>): QueryParamsByVersionRequest {
    const message = createBaseQueryParamsByVersionRequest();
    message.version = object.version ?? 0;
    return message;
  },
  fromAmino(object: QueryParamsByVersionRequestAmino): QueryParamsByVersionRequest {
    const message = createBaseQueryParamsByVersionRequest();
    if (object.version !== undefined && object.version !== null) {
      message.version = object.version;
    }
    return message;
  },
  toAmino(message: QueryParamsByVersionRequest): QueryParamsByVersionRequestAmino {
    const obj: any = {};
    obj.version = message.version === 0 ? undefined : message.version;
    return obj;
  },
  fromAminoMsg(object: QueryParamsByVersionRequestAminoMsg): QueryParamsByVersionRequest {
    return QueryParamsByVersionRequest.fromAmino(object.value);
  },
  fromProtoMsg(message: QueryParamsByVersionRequestProtoMsg): QueryParamsByVersionRequest {
    return QueryParamsByVersionRequest.decode(message.value);
  },
  toProto(message: QueryParamsByVersionRequest): Uint8Array {
    return QueryParamsByVersionRequest.encode(message).finish();
  },
  toProtoMsg(message: QueryParamsByVersionRequest): QueryParamsByVersionRequestProtoMsg {
    return {
      typeUrl: '/babylon.btcstaking.v1.QueryParamsByVersionRequest',
      value: QueryParamsByVersionRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryParamsByVersionResponse(): QueryParamsByVersionResponse {
  return {
    params: Params.fromPartial({}),
  };
}
export const QueryParamsByVersionResponse = {
  typeUrl: '/babylon.btcstaking.v1.QueryParamsByVersionResponse',
  encode(message: QueryParamsByVersionResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.params !== undefined) {
      Params.encode(message.params, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): QueryParamsByVersionResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryParamsByVersionResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.params = Params.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<QueryParamsByVersionResponse>): QueryParamsByVersionResponse {
    const message = createBaseQueryParamsByVersionResponse();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    message.params =
      object.params !== undefined && object.params !== null ? Params.fromPartial(object.params) : undefined;
    return message;
  },
  fromAmino(object: QueryParamsByVersionResponseAmino): QueryParamsByVersionResponse {
    const message = createBaseQueryParamsByVersionResponse();
    if (object.params !== undefined && object.params !== null) {
      message.params = Params.fromAmino(object.params);
    }
    return message;
  },
  toAmino(message: QueryParamsByVersionResponse): QueryParamsByVersionResponseAmino {
    const obj: any = {};
    obj.params = message.params ? Params.toAmino(message.params) : undefined;
    return obj;
  },
  fromAminoMsg(object: QueryParamsByVersionResponseAminoMsg): QueryParamsByVersionResponse {
    return QueryParamsByVersionResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: QueryParamsByVersionResponseProtoMsg): QueryParamsByVersionResponse {
    return QueryParamsByVersionResponse.decode(message.value);
  },
  toProto(message: QueryParamsByVersionResponse): Uint8Array {
    return QueryParamsByVersionResponse.encode(message).finish();
  },
  toProtoMsg(message: QueryParamsByVersionResponse): QueryParamsByVersionResponseProtoMsg {
    return {
      typeUrl: '/babylon.btcstaking.v1.QueryParamsByVersionResponse',
      value: QueryParamsByVersionResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryFinalityProvidersRequest(): QueryFinalityProvidersRequest {
  return {
    pagination: undefined,
  };
}
export const QueryFinalityProvidersRequest = {
  typeUrl: '/babylon.btcstaking.v1.QueryFinalityProvidersRequest',
  encode(message: QueryFinalityProvidersRequest, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.pagination !== undefined) {
      PageRequest.encode(message.pagination, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): QueryFinalityProvidersRequest {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryFinalityProvidersRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.pagination = PageRequest.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<QueryFinalityProvidersRequest>): QueryFinalityProvidersRequest {
    const message = createBaseQueryFinalityProvidersRequest();
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageRequest.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromAmino(object: QueryFinalityProvidersRequestAmino): QueryFinalityProvidersRequest {
    const message = createBaseQueryFinalityProvidersRequest();
    if (object.pagination !== undefined && object.pagination !== null) {
      message.pagination = PageRequest.fromAmino(object.pagination);
    }
    return message;
  },
  toAmino(message: QueryFinalityProvidersRequest): QueryFinalityProvidersRequestAmino {
    const obj: any = {};
    obj.pagination = message.pagination ? PageRequest.toAmino(message.pagination) : undefined;
    return obj;
  },
  fromAminoMsg(object: QueryFinalityProvidersRequestAminoMsg): QueryFinalityProvidersRequest {
    return QueryFinalityProvidersRequest.fromAmino(object.value);
  },
  fromProtoMsg(message: QueryFinalityProvidersRequestProtoMsg): QueryFinalityProvidersRequest {
    return QueryFinalityProvidersRequest.decode(message.value);
  },
  toProto(message: QueryFinalityProvidersRequest): Uint8Array {
    return QueryFinalityProvidersRequest.encode(message).finish();
  },
  toProtoMsg(message: QueryFinalityProvidersRequest): QueryFinalityProvidersRequestProtoMsg {
    return {
      typeUrl: '/babylon.btcstaking.v1.QueryFinalityProvidersRequest',
      value: QueryFinalityProvidersRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryFinalityProvidersResponse(): QueryFinalityProvidersResponse {
  return {
    finalityProviders: [],
    pagination: undefined,
  };
}
export const QueryFinalityProvidersResponse = {
  typeUrl: '/babylon.btcstaking.v1.QueryFinalityProvidersResponse',
  encode(message: QueryFinalityProvidersResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    for (const v of message.finalityProviders) {
      FinalityProviderResponse.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    if (message.pagination !== undefined) {
      PageResponse.encode(message.pagination, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): QueryFinalityProvidersResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryFinalityProvidersResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.finalityProviders.push(FinalityProviderResponse.decode(reader, reader.uint32()));
          break;
        case 2:
          message.pagination = PageResponse.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<QueryFinalityProvidersResponse>): QueryFinalityProvidersResponse {
    const message = createBaseQueryFinalityProvidersResponse();
    message.finalityProviders = object.finalityProviders?.map((e) => FinalityProviderResponse.fromPartial(e)) || [];
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageResponse.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromAmino(object: QueryFinalityProvidersResponseAmino): QueryFinalityProvidersResponse {
    const message = createBaseQueryFinalityProvidersResponse();
    message.finalityProviders = object.finality_providers?.map((e) => FinalityProviderResponse.fromAmino(e)) || [];
    if (object.pagination !== undefined && object.pagination !== null) {
      message.pagination = PageResponse.fromAmino(object.pagination);
    }
    return message;
  },
  toAmino(message: QueryFinalityProvidersResponse): QueryFinalityProvidersResponseAmino {
    const obj: any = {};
    if (message.finalityProviders) {
      obj.finality_providers = message.finalityProviders.map((e) =>
        e ? FinalityProviderResponse.toAmino(e) : undefined,
      );
    } else {
      obj.finality_providers = message.finalityProviders;
    }
    obj.pagination = message.pagination ? PageResponse.toAmino(message.pagination) : undefined;
    return obj;
  },
  fromAminoMsg(object: QueryFinalityProvidersResponseAminoMsg): QueryFinalityProvidersResponse {
    return QueryFinalityProvidersResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: QueryFinalityProvidersResponseProtoMsg): QueryFinalityProvidersResponse {
    return QueryFinalityProvidersResponse.decode(message.value);
  },
  toProto(message: QueryFinalityProvidersResponse): Uint8Array {
    return QueryFinalityProvidersResponse.encode(message).finish();
  },
  toProtoMsg(message: QueryFinalityProvidersResponse): QueryFinalityProvidersResponseProtoMsg {
    return {
      typeUrl: '/babylon.btcstaking.v1.QueryFinalityProvidersResponse',
      value: QueryFinalityProvidersResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryFinalityProviderRequest(): QueryFinalityProviderRequest {
  return {
    fpBtcPkHex: '',
  };
}
export const QueryFinalityProviderRequest = {
  typeUrl: '/babylon.btcstaking.v1.QueryFinalityProviderRequest',
  encode(message: QueryFinalityProviderRequest, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.fpBtcPkHex !== '') {
      writer.uint32(10).string(message.fpBtcPkHex);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): QueryFinalityProviderRequest {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryFinalityProviderRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.fpBtcPkHex = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<QueryFinalityProviderRequest>): QueryFinalityProviderRequest {
    const message = createBaseQueryFinalityProviderRequest();
    message.fpBtcPkHex = object.fpBtcPkHex ?? '';
    return message;
  },
  fromAmino(object: QueryFinalityProviderRequestAmino): QueryFinalityProviderRequest {
    const message = createBaseQueryFinalityProviderRequest();
    if (object.fp_btc_pk_hex !== undefined && object.fp_btc_pk_hex !== null) {
      message.fpBtcPkHex = object.fp_btc_pk_hex;
    }
    return message;
  },
  toAmino(message: QueryFinalityProviderRequest): QueryFinalityProviderRequestAmino {
    const obj: any = {};
    obj.fp_btc_pk_hex = message.fpBtcPkHex === '' ? undefined : message.fpBtcPkHex;
    return obj;
  },
  fromAminoMsg(object: QueryFinalityProviderRequestAminoMsg): QueryFinalityProviderRequest {
    return QueryFinalityProviderRequest.fromAmino(object.value);
  },
  fromProtoMsg(message: QueryFinalityProviderRequestProtoMsg): QueryFinalityProviderRequest {
    return QueryFinalityProviderRequest.decode(message.value);
  },
  toProto(message: QueryFinalityProviderRequest): Uint8Array {
    return QueryFinalityProviderRequest.encode(message).finish();
  },
  toProtoMsg(message: QueryFinalityProviderRequest): QueryFinalityProviderRequestProtoMsg {
    return {
      typeUrl: '/babylon.btcstaking.v1.QueryFinalityProviderRequest',
      value: QueryFinalityProviderRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryFinalityProviderResponse(): QueryFinalityProviderResponse {
  return {
    finalityProvider: undefined,
  };
}
export const QueryFinalityProviderResponse = {
  typeUrl: '/babylon.btcstaking.v1.QueryFinalityProviderResponse',
  encode(message: QueryFinalityProviderResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.finalityProvider !== undefined) {
      FinalityProviderResponse.encode(message.finalityProvider, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): QueryFinalityProviderResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryFinalityProviderResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.finalityProvider = FinalityProviderResponse.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<QueryFinalityProviderResponse>): QueryFinalityProviderResponse {
    const message = createBaseQueryFinalityProviderResponse();
    message.finalityProvider =
      object.finalityProvider !== undefined && object.finalityProvider !== null
        ? FinalityProviderResponse.fromPartial(object.finalityProvider)
        : undefined;
    return message;
  },
  fromAmino(object: QueryFinalityProviderResponseAmino): QueryFinalityProviderResponse {
    const message = createBaseQueryFinalityProviderResponse();
    if (object.finality_provider !== undefined && object.finality_provider !== null) {
      message.finalityProvider = FinalityProviderResponse.fromAmino(object.finality_provider);
    }
    return message;
  },
  toAmino(message: QueryFinalityProviderResponse): QueryFinalityProviderResponseAmino {
    const obj: any = {};
    obj.finality_provider = message.finalityProvider
      ? FinalityProviderResponse.toAmino(message.finalityProvider)
      : undefined;
    return obj;
  },
  fromAminoMsg(object: QueryFinalityProviderResponseAminoMsg): QueryFinalityProviderResponse {
    return QueryFinalityProviderResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: QueryFinalityProviderResponseProtoMsg): QueryFinalityProviderResponse {
    return QueryFinalityProviderResponse.decode(message.value);
  },
  toProto(message: QueryFinalityProviderResponse): Uint8Array {
    return QueryFinalityProviderResponse.encode(message).finish();
  },
  toProtoMsg(message: QueryFinalityProviderResponse): QueryFinalityProviderResponseProtoMsg {
    return {
      typeUrl: '/babylon.btcstaking.v1.QueryFinalityProviderResponse',
      value: QueryFinalityProviderResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryBTCDelegationsRequest(): QueryBTCDelegationsRequest {
  return {
    status: 0,
    pagination: undefined,
  };
}
export const QueryBTCDelegationsRequest = {
  typeUrl: '/babylon.btcstaking.v1.QueryBTCDelegationsRequest',
  encode(message: QueryBTCDelegationsRequest, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.status !== 0) {
      writer.uint32(8).int32(message.status);
    }
    if (message.pagination !== undefined) {
      PageRequest.encode(message.pagination, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): QueryBTCDelegationsRequest {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryBTCDelegationsRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.status = reader.int32() as any;
          break;
        case 2:
          message.pagination = PageRequest.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<QueryBTCDelegationsRequest>): QueryBTCDelegationsRequest {
    const message = createBaseQueryBTCDelegationsRequest();
    message.status = object.status ?? 0;
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageRequest.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromAmino(object: QueryBTCDelegationsRequestAmino): QueryBTCDelegationsRequest {
    const message = createBaseQueryBTCDelegationsRequest();
    if (object.status !== undefined && object.status !== null) {
      message.status = object.status;
    }
    if (object.pagination !== undefined && object.pagination !== null) {
      message.pagination = PageRequest.fromAmino(object.pagination);
    }
    return message;
  },
  toAmino(message: QueryBTCDelegationsRequest): QueryBTCDelegationsRequestAmino {
    const obj: any = {};
    obj.status = message.status === 0 ? undefined : message.status;
    obj.pagination = message.pagination ? PageRequest.toAmino(message.pagination) : undefined;
    return obj;
  },
  fromAminoMsg(object: QueryBTCDelegationsRequestAminoMsg): QueryBTCDelegationsRequest {
    return QueryBTCDelegationsRequest.fromAmino(object.value);
  },
  fromProtoMsg(message: QueryBTCDelegationsRequestProtoMsg): QueryBTCDelegationsRequest {
    return QueryBTCDelegationsRequest.decode(message.value);
  },
  toProto(message: QueryBTCDelegationsRequest): Uint8Array {
    return QueryBTCDelegationsRequest.encode(message).finish();
  },
  toProtoMsg(message: QueryBTCDelegationsRequest): QueryBTCDelegationsRequestProtoMsg {
    return {
      typeUrl: '/babylon.btcstaking.v1.QueryBTCDelegationsRequest',
      value: QueryBTCDelegationsRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryBTCDelegationsResponse(): QueryBTCDelegationsResponse {
  return {
    btcDelegations: [],
    pagination: undefined,
  };
}
export const QueryBTCDelegationsResponse = {
  typeUrl: '/babylon.btcstaking.v1.QueryBTCDelegationsResponse',
  encode(message: QueryBTCDelegationsResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    for (const v of message.btcDelegations) {
      BTCDelegationResponse.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    if (message.pagination !== undefined) {
      PageResponse.encode(message.pagination, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): QueryBTCDelegationsResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryBTCDelegationsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.btcDelegations.push(BTCDelegationResponse.decode(reader, reader.uint32()));
          break;
        case 2:
          message.pagination = PageResponse.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<QueryBTCDelegationsResponse>): QueryBTCDelegationsResponse {
    const message = createBaseQueryBTCDelegationsResponse();
    message.btcDelegations = object.btcDelegations?.map((e) => BTCDelegationResponse.fromPartial(e)) || [];
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageResponse.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromAmino(object: QueryBTCDelegationsResponseAmino): QueryBTCDelegationsResponse {
    const message = createBaseQueryBTCDelegationsResponse();
    message.btcDelegations = object.btc_delegations?.map((e) => BTCDelegationResponse.fromAmino(e)) || [];
    if (object.pagination !== undefined && object.pagination !== null) {
      message.pagination = PageResponse.fromAmino(object.pagination);
    }
    return message;
  },
  toAmino(message: QueryBTCDelegationsResponse): QueryBTCDelegationsResponseAmino {
    const obj: any = {};
    if (message.btcDelegations) {
      obj.btc_delegations = message.btcDelegations.map((e) => (e ? BTCDelegationResponse.toAmino(e) : undefined));
    } else {
      obj.btc_delegations = message.btcDelegations;
    }
    obj.pagination = message.pagination ? PageResponse.toAmino(message.pagination) : undefined;
    return obj;
  },
  fromAminoMsg(object: QueryBTCDelegationsResponseAminoMsg): QueryBTCDelegationsResponse {
    return QueryBTCDelegationsResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: QueryBTCDelegationsResponseProtoMsg): QueryBTCDelegationsResponse {
    return QueryBTCDelegationsResponse.decode(message.value);
  },
  toProto(message: QueryBTCDelegationsResponse): Uint8Array {
    return QueryBTCDelegationsResponse.encode(message).finish();
  },
  toProtoMsg(message: QueryBTCDelegationsResponse): QueryBTCDelegationsResponseProtoMsg {
    return {
      typeUrl: '/babylon.btcstaking.v1.QueryBTCDelegationsResponse',
      value: QueryBTCDelegationsResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryFinalityProviderPowerAtHeightRequest(): QueryFinalityProviderPowerAtHeightRequest {
  return {
    fpBtcPkHex: '',
    height: BigInt(0),
  };
}
export const QueryFinalityProviderPowerAtHeightRequest = {
  typeUrl: '/babylon.btcstaking.v1.QueryFinalityProviderPowerAtHeightRequest',
  encode(
    message: QueryFinalityProviderPowerAtHeightRequest,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.fpBtcPkHex !== '') {
      writer.uint32(10).string(message.fpBtcPkHex);
    }
    if (message.height !== BigInt(0)) {
      writer.uint32(16).uint64(message.height);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): QueryFinalityProviderPowerAtHeightRequest {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryFinalityProviderPowerAtHeightRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.fpBtcPkHex = reader.string();
          break;
        case 2:
          message.height = reader.uint64();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<QueryFinalityProviderPowerAtHeightRequest>): QueryFinalityProviderPowerAtHeightRequest {
    const message = createBaseQueryFinalityProviderPowerAtHeightRequest();
    message.fpBtcPkHex = object.fpBtcPkHex ?? '';
    message.height =
      object.height !== undefined && object.height !== null ? BigInt(object.height.toString()) : BigInt(0);
    return message;
  },
  fromAmino(object: QueryFinalityProviderPowerAtHeightRequestAmino): QueryFinalityProviderPowerAtHeightRequest {
    const message = createBaseQueryFinalityProviderPowerAtHeightRequest();
    if (object.fp_btc_pk_hex !== undefined && object.fp_btc_pk_hex !== null) {
      message.fpBtcPkHex = object.fp_btc_pk_hex;
    }
    if (object.height !== undefined && object.height !== null) {
      message.height = BigInt(object.height);
    }
    return message;
  },
  toAmino(message: QueryFinalityProviderPowerAtHeightRequest): QueryFinalityProviderPowerAtHeightRequestAmino {
    const obj: any = {};
    obj.fp_btc_pk_hex = message.fpBtcPkHex === '' ? undefined : message.fpBtcPkHex;
    obj.height = message.height !== BigInt(0) ? message.height?.toString() : undefined;
    return obj;
  },
  fromAminoMsg(object: QueryFinalityProviderPowerAtHeightRequestAminoMsg): QueryFinalityProviderPowerAtHeightRequest {
    return QueryFinalityProviderPowerAtHeightRequest.fromAmino(object.value);
  },
  fromProtoMsg(message: QueryFinalityProviderPowerAtHeightRequestProtoMsg): QueryFinalityProviderPowerAtHeightRequest {
    return QueryFinalityProviderPowerAtHeightRequest.decode(message.value);
  },
  toProto(message: QueryFinalityProviderPowerAtHeightRequest): Uint8Array {
    return QueryFinalityProviderPowerAtHeightRequest.encode(message).finish();
  },
  toProtoMsg(message: QueryFinalityProviderPowerAtHeightRequest): QueryFinalityProviderPowerAtHeightRequestProtoMsg {
    return {
      typeUrl: '/babylon.btcstaking.v1.QueryFinalityProviderPowerAtHeightRequest',
      value: QueryFinalityProviderPowerAtHeightRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryFinalityProviderPowerAtHeightResponse(): QueryFinalityProviderPowerAtHeightResponse {
  return {
    votingPower: BigInt(0),
  };
}
export const QueryFinalityProviderPowerAtHeightResponse = {
  typeUrl: '/babylon.btcstaking.v1.QueryFinalityProviderPowerAtHeightResponse',
  encode(
    message: QueryFinalityProviderPowerAtHeightResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.votingPower !== BigInt(0)) {
      writer.uint32(8).uint64(message.votingPower);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): QueryFinalityProviderPowerAtHeightResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryFinalityProviderPowerAtHeightResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.votingPower = reader.uint64();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<QueryFinalityProviderPowerAtHeightResponse>): QueryFinalityProviderPowerAtHeightResponse {
    const message = createBaseQueryFinalityProviderPowerAtHeightResponse();
    message.votingPower =
      object.votingPower !== undefined && object.votingPower !== null
        ? BigInt(object.votingPower.toString())
        : BigInt(0);
    return message;
  },
  fromAmino(object: QueryFinalityProviderPowerAtHeightResponseAmino): QueryFinalityProviderPowerAtHeightResponse {
    const message = createBaseQueryFinalityProviderPowerAtHeightResponse();
    if (object.voting_power !== undefined && object.voting_power !== null) {
      message.votingPower = BigInt(object.voting_power);
    }
    return message;
  },
  toAmino(message: QueryFinalityProviderPowerAtHeightResponse): QueryFinalityProviderPowerAtHeightResponseAmino {
    const obj: any = {};
    obj.voting_power = message.votingPower !== BigInt(0) ? message.votingPower?.toString() : undefined;
    return obj;
  },
  fromAminoMsg(object: QueryFinalityProviderPowerAtHeightResponseAminoMsg): QueryFinalityProviderPowerAtHeightResponse {
    return QueryFinalityProviderPowerAtHeightResponse.fromAmino(object.value);
  },
  fromProtoMsg(
    message: QueryFinalityProviderPowerAtHeightResponseProtoMsg,
  ): QueryFinalityProviderPowerAtHeightResponse {
    return QueryFinalityProviderPowerAtHeightResponse.decode(message.value);
  },
  toProto(message: QueryFinalityProviderPowerAtHeightResponse): Uint8Array {
    return QueryFinalityProviderPowerAtHeightResponse.encode(message).finish();
  },
  toProtoMsg(message: QueryFinalityProviderPowerAtHeightResponse): QueryFinalityProviderPowerAtHeightResponseProtoMsg {
    return {
      typeUrl: '/babylon.btcstaking.v1.QueryFinalityProviderPowerAtHeightResponse',
      value: QueryFinalityProviderPowerAtHeightResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryFinalityProviderCurrentPowerRequest(): QueryFinalityProviderCurrentPowerRequest {
  return {
    fpBtcPkHex: '',
  };
}
export const QueryFinalityProviderCurrentPowerRequest = {
  typeUrl: '/babylon.btcstaking.v1.QueryFinalityProviderCurrentPowerRequest',
  encode(
    message: QueryFinalityProviderCurrentPowerRequest,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.fpBtcPkHex !== '') {
      writer.uint32(10).string(message.fpBtcPkHex);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): QueryFinalityProviderCurrentPowerRequest {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryFinalityProviderCurrentPowerRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.fpBtcPkHex = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<QueryFinalityProviderCurrentPowerRequest>): QueryFinalityProviderCurrentPowerRequest {
    const message = createBaseQueryFinalityProviderCurrentPowerRequest();
    message.fpBtcPkHex = object.fpBtcPkHex ?? '';
    return message;
  },
  fromAmino(object: QueryFinalityProviderCurrentPowerRequestAmino): QueryFinalityProviderCurrentPowerRequest {
    const message = createBaseQueryFinalityProviderCurrentPowerRequest();
    if (object.fp_btc_pk_hex !== undefined && object.fp_btc_pk_hex !== null) {
      message.fpBtcPkHex = object.fp_btc_pk_hex;
    }
    return message;
  },
  toAmino(message: QueryFinalityProviderCurrentPowerRequest): QueryFinalityProviderCurrentPowerRequestAmino {
    const obj: any = {};
    obj.fp_btc_pk_hex = message.fpBtcPkHex === '' ? undefined : message.fpBtcPkHex;
    return obj;
  },
  fromAminoMsg(object: QueryFinalityProviderCurrentPowerRequestAminoMsg): QueryFinalityProviderCurrentPowerRequest {
    return QueryFinalityProviderCurrentPowerRequest.fromAmino(object.value);
  },
  fromProtoMsg(message: QueryFinalityProviderCurrentPowerRequestProtoMsg): QueryFinalityProviderCurrentPowerRequest {
    return QueryFinalityProviderCurrentPowerRequest.decode(message.value);
  },
  toProto(message: QueryFinalityProviderCurrentPowerRequest): Uint8Array {
    return QueryFinalityProviderCurrentPowerRequest.encode(message).finish();
  },
  toProtoMsg(message: QueryFinalityProviderCurrentPowerRequest): QueryFinalityProviderCurrentPowerRequestProtoMsg {
    return {
      typeUrl: '/babylon.btcstaking.v1.QueryFinalityProviderCurrentPowerRequest',
      value: QueryFinalityProviderCurrentPowerRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryFinalityProviderCurrentPowerResponse(): QueryFinalityProviderCurrentPowerResponse {
  return {
    height: BigInt(0),
    votingPower: BigInt(0),
  };
}
export const QueryFinalityProviderCurrentPowerResponse = {
  typeUrl: '/babylon.btcstaking.v1.QueryFinalityProviderCurrentPowerResponse',
  encode(
    message: QueryFinalityProviderCurrentPowerResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.height !== BigInt(0)) {
      writer.uint32(8).uint64(message.height);
    }
    if (message.votingPower !== BigInt(0)) {
      writer.uint32(16).uint64(message.votingPower);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): QueryFinalityProviderCurrentPowerResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryFinalityProviderCurrentPowerResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.height = reader.uint64();
          break;
        case 2:
          message.votingPower = reader.uint64();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<QueryFinalityProviderCurrentPowerResponse>): QueryFinalityProviderCurrentPowerResponse {
    const message = createBaseQueryFinalityProviderCurrentPowerResponse();
    message.height =
      object.height !== undefined && object.height !== null ? BigInt(object.height.toString()) : BigInt(0);
    message.votingPower =
      object.votingPower !== undefined && object.votingPower !== null
        ? BigInt(object.votingPower.toString())
        : BigInt(0);
    return message;
  },
  fromAmino(object: QueryFinalityProviderCurrentPowerResponseAmino): QueryFinalityProviderCurrentPowerResponse {
    const message = createBaseQueryFinalityProviderCurrentPowerResponse();
    if (object.height !== undefined && object.height !== null) {
      message.height = BigInt(object.height);
    }
    if (object.voting_power !== undefined && object.voting_power !== null) {
      message.votingPower = BigInt(object.voting_power);
    }
    return message;
  },
  toAmino(message: QueryFinalityProviderCurrentPowerResponse): QueryFinalityProviderCurrentPowerResponseAmino {
    const obj: any = {};
    obj.height = message.height !== BigInt(0) ? message.height?.toString() : undefined;
    obj.voting_power = message.votingPower !== BigInt(0) ? message.votingPower?.toString() : undefined;
    return obj;
  },
  fromAminoMsg(object: QueryFinalityProviderCurrentPowerResponseAminoMsg): QueryFinalityProviderCurrentPowerResponse {
    return QueryFinalityProviderCurrentPowerResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: QueryFinalityProviderCurrentPowerResponseProtoMsg): QueryFinalityProviderCurrentPowerResponse {
    return QueryFinalityProviderCurrentPowerResponse.decode(message.value);
  },
  toProto(message: QueryFinalityProviderCurrentPowerResponse): Uint8Array {
    return QueryFinalityProviderCurrentPowerResponse.encode(message).finish();
  },
  toProtoMsg(message: QueryFinalityProviderCurrentPowerResponse): QueryFinalityProviderCurrentPowerResponseProtoMsg {
    return {
      typeUrl: '/babylon.btcstaking.v1.QueryFinalityProviderCurrentPowerResponse',
      value: QueryFinalityProviderCurrentPowerResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryActiveFinalityProvidersAtHeightRequest(): QueryActiveFinalityProvidersAtHeightRequest {
  return {
    height: BigInt(0),
    pagination: undefined,
  };
}
export const QueryActiveFinalityProvidersAtHeightRequest = {
  typeUrl: '/babylon.btcstaking.v1.QueryActiveFinalityProvidersAtHeightRequest',
  encode(
    message: QueryActiveFinalityProvidersAtHeightRequest,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.height !== BigInt(0)) {
      writer.uint32(8).uint64(message.height);
    }
    if (message.pagination !== undefined) {
      PageRequest.encode(message.pagination, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): QueryActiveFinalityProvidersAtHeightRequest {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryActiveFinalityProvidersAtHeightRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.height = reader.uint64();
          break;
        case 2:
          message.pagination = PageRequest.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<QueryActiveFinalityProvidersAtHeightRequest>,
  ): QueryActiveFinalityProvidersAtHeightRequest {
    const message = createBaseQueryActiveFinalityProvidersAtHeightRequest();
    message.height =
      object.height !== undefined && object.height !== null ? BigInt(object.height.toString()) : BigInt(0);
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageRequest.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromAmino(object: QueryActiveFinalityProvidersAtHeightRequestAmino): QueryActiveFinalityProvidersAtHeightRequest {
    const message = createBaseQueryActiveFinalityProvidersAtHeightRequest();
    if (object.height !== undefined && object.height !== null) {
      message.height = BigInt(object.height);
    }
    if (object.pagination !== undefined && object.pagination !== null) {
      message.pagination = PageRequest.fromAmino(object.pagination);
    }
    return message;
  },
  toAmino(message: QueryActiveFinalityProvidersAtHeightRequest): QueryActiveFinalityProvidersAtHeightRequestAmino {
    const obj: any = {};
    obj.height = message.height !== BigInt(0) ? message.height?.toString() : undefined;
    obj.pagination = message.pagination ? PageRequest.toAmino(message.pagination) : undefined;
    return obj;
  },
  fromAminoMsg(
    object: QueryActiveFinalityProvidersAtHeightRequestAminoMsg,
  ): QueryActiveFinalityProvidersAtHeightRequest {
    return QueryActiveFinalityProvidersAtHeightRequest.fromAmino(object.value);
  },
  fromProtoMsg(
    message: QueryActiveFinalityProvidersAtHeightRequestProtoMsg,
  ): QueryActiveFinalityProvidersAtHeightRequest {
    return QueryActiveFinalityProvidersAtHeightRequest.decode(message.value);
  },
  toProto(message: QueryActiveFinalityProvidersAtHeightRequest): Uint8Array {
    return QueryActiveFinalityProvidersAtHeightRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryActiveFinalityProvidersAtHeightRequest,
  ): QueryActiveFinalityProvidersAtHeightRequestProtoMsg {
    return {
      typeUrl: '/babylon.btcstaking.v1.QueryActiveFinalityProvidersAtHeightRequest',
      value: QueryActiveFinalityProvidersAtHeightRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryActiveFinalityProvidersAtHeightResponse(): QueryActiveFinalityProvidersAtHeightResponse {
  return {
    finalityProviders: [],
    pagination: undefined,
  };
}
export const QueryActiveFinalityProvidersAtHeightResponse = {
  typeUrl: '/babylon.btcstaking.v1.QueryActiveFinalityProvidersAtHeightResponse',
  encode(
    message: QueryActiveFinalityProvidersAtHeightResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    for (const v of message.finalityProviders) {
      FinalityProviderWithMeta.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    if (message.pagination !== undefined) {
      PageResponse.encode(message.pagination, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): QueryActiveFinalityProvidersAtHeightResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryActiveFinalityProvidersAtHeightResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.finalityProviders.push(FinalityProviderWithMeta.decode(reader, reader.uint32()));
          break;
        case 2:
          message.pagination = PageResponse.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<QueryActiveFinalityProvidersAtHeightResponse>,
  ): QueryActiveFinalityProvidersAtHeightResponse {
    const message = createBaseQueryActiveFinalityProvidersAtHeightResponse();
    message.finalityProviders = object.finalityProviders?.map((e) => FinalityProviderWithMeta.fromPartial(e)) || [];
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageResponse.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromAmino(object: QueryActiveFinalityProvidersAtHeightResponseAmino): QueryActiveFinalityProvidersAtHeightResponse {
    const message = createBaseQueryActiveFinalityProvidersAtHeightResponse();
    message.finalityProviders = object.finality_providers?.map((e) => FinalityProviderWithMeta.fromAmino(e)) || [];
    if (object.pagination !== undefined && object.pagination !== null) {
      message.pagination = PageResponse.fromAmino(object.pagination);
    }
    return message;
  },
  toAmino(message: QueryActiveFinalityProvidersAtHeightResponse): QueryActiveFinalityProvidersAtHeightResponseAmino {
    const obj: any = {};
    if (message.finalityProviders) {
      obj.finality_providers = message.finalityProviders.map((e) =>
        e ? FinalityProviderWithMeta.toAmino(e) : undefined,
      );
    } else {
      obj.finality_providers = message.finalityProviders;
    }
    obj.pagination = message.pagination ? PageResponse.toAmino(message.pagination) : undefined;
    return obj;
  },
  fromAminoMsg(
    object: QueryActiveFinalityProvidersAtHeightResponseAminoMsg,
  ): QueryActiveFinalityProvidersAtHeightResponse {
    return QueryActiveFinalityProvidersAtHeightResponse.fromAmino(object.value);
  },
  fromProtoMsg(
    message: QueryActiveFinalityProvidersAtHeightResponseProtoMsg,
  ): QueryActiveFinalityProvidersAtHeightResponse {
    return QueryActiveFinalityProvidersAtHeightResponse.decode(message.value);
  },
  toProto(message: QueryActiveFinalityProvidersAtHeightResponse): Uint8Array {
    return QueryActiveFinalityProvidersAtHeightResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryActiveFinalityProvidersAtHeightResponse,
  ): QueryActiveFinalityProvidersAtHeightResponseProtoMsg {
    return {
      typeUrl: '/babylon.btcstaking.v1.QueryActiveFinalityProvidersAtHeightResponse',
      value: QueryActiveFinalityProvidersAtHeightResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryActivatedHeightRequest(): QueryActivatedHeightRequest {
  return {};
}
export const QueryActivatedHeightRequest = {
  typeUrl: '/babylon.btcstaking.v1.QueryActivatedHeightRequest',
  encode(_: QueryActivatedHeightRequest, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): QueryActivatedHeightRequest {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryActivatedHeightRequest();
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
  fromPartial(_: Partial<QueryActivatedHeightRequest>): QueryActivatedHeightRequest {
    const message = createBaseQueryActivatedHeightRequest();
    return message;
  },
  fromAmino(_: QueryActivatedHeightRequestAmino): QueryActivatedHeightRequest {
    const message = createBaseQueryActivatedHeightRequest();
    return message;
  },
  toAmino(_: QueryActivatedHeightRequest): QueryActivatedHeightRequestAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: QueryActivatedHeightRequestAminoMsg): QueryActivatedHeightRequest {
    return QueryActivatedHeightRequest.fromAmino(object.value);
  },
  fromProtoMsg(message: QueryActivatedHeightRequestProtoMsg): QueryActivatedHeightRequest {
    return QueryActivatedHeightRequest.decode(message.value);
  },
  toProto(message: QueryActivatedHeightRequest): Uint8Array {
    return QueryActivatedHeightRequest.encode(message).finish();
  },
  toProtoMsg(message: QueryActivatedHeightRequest): QueryActivatedHeightRequestProtoMsg {
    return {
      typeUrl: '/babylon.btcstaking.v1.QueryActivatedHeightRequest',
      value: QueryActivatedHeightRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryActivatedHeightResponse(): QueryActivatedHeightResponse {
  return {
    height: BigInt(0),
  };
}
export const QueryActivatedHeightResponse = {
  typeUrl: '/babylon.btcstaking.v1.QueryActivatedHeightResponse',
  encode(message: QueryActivatedHeightResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.height !== BigInt(0)) {
      writer.uint32(8).uint64(message.height);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): QueryActivatedHeightResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryActivatedHeightResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.height = reader.uint64();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<QueryActivatedHeightResponse>): QueryActivatedHeightResponse {
    const message = createBaseQueryActivatedHeightResponse();
    message.height =
      object.height !== undefined && object.height !== null ? BigInt(object.height.toString()) : BigInt(0);
    return message;
  },
  fromAmino(object: QueryActivatedHeightResponseAmino): QueryActivatedHeightResponse {
    const message = createBaseQueryActivatedHeightResponse();
    if (object.height !== undefined && object.height !== null) {
      message.height = BigInt(object.height);
    }
    return message;
  },
  toAmino(message: QueryActivatedHeightResponse): QueryActivatedHeightResponseAmino {
    const obj: any = {};
    obj.height = message.height !== BigInt(0) ? message.height?.toString() : undefined;
    return obj;
  },
  fromAminoMsg(object: QueryActivatedHeightResponseAminoMsg): QueryActivatedHeightResponse {
    return QueryActivatedHeightResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: QueryActivatedHeightResponseProtoMsg): QueryActivatedHeightResponse {
    return QueryActivatedHeightResponse.decode(message.value);
  },
  toProto(message: QueryActivatedHeightResponse): Uint8Array {
    return QueryActivatedHeightResponse.encode(message).finish();
  },
  toProtoMsg(message: QueryActivatedHeightResponse): QueryActivatedHeightResponseProtoMsg {
    return {
      typeUrl: '/babylon.btcstaking.v1.QueryActivatedHeightResponse',
      value: QueryActivatedHeightResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryFinalityProviderDelegationsRequest(): QueryFinalityProviderDelegationsRequest {
  return {
    fpBtcPkHex: '',
    pagination: undefined,
  };
}
export const QueryFinalityProviderDelegationsRequest = {
  typeUrl: '/babylon.btcstaking.v1.QueryFinalityProviderDelegationsRequest',
  encode(message: QueryFinalityProviderDelegationsRequest, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.fpBtcPkHex !== '') {
      writer.uint32(10).string(message.fpBtcPkHex);
    }
    if (message.pagination !== undefined) {
      PageRequest.encode(message.pagination, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): QueryFinalityProviderDelegationsRequest {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryFinalityProviderDelegationsRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.fpBtcPkHex = reader.string();
          break;
        case 2:
          message.pagination = PageRequest.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<QueryFinalityProviderDelegationsRequest>): QueryFinalityProviderDelegationsRequest {
    const message = createBaseQueryFinalityProviderDelegationsRequest();
    message.fpBtcPkHex = object.fpBtcPkHex ?? '';
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageRequest.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromAmino(object: QueryFinalityProviderDelegationsRequestAmino): QueryFinalityProviderDelegationsRequest {
    const message = createBaseQueryFinalityProviderDelegationsRequest();
    if (object.fp_btc_pk_hex !== undefined && object.fp_btc_pk_hex !== null) {
      message.fpBtcPkHex = object.fp_btc_pk_hex;
    }
    if (object.pagination !== undefined && object.pagination !== null) {
      message.pagination = PageRequest.fromAmino(object.pagination);
    }
    return message;
  },
  toAmino(message: QueryFinalityProviderDelegationsRequest): QueryFinalityProviderDelegationsRequestAmino {
    const obj: any = {};
    obj.fp_btc_pk_hex = message.fpBtcPkHex === '' ? undefined : message.fpBtcPkHex;
    obj.pagination = message.pagination ? PageRequest.toAmino(message.pagination) : undefined;
    return obj;
  },
  fromAminoMsg(object: QueryFinalityProviderDelegationsRequestAminoMsg): QueryFinalityProviderDelegationsRequest {
    return QueryFinalityProviderDelegationsRequest.fromAmino(object.value);
  },
  fromProtoMsg(message: QueryFinalityProviderDelegationsRequestProtoMsg): QueryFinalityProviderDelegationsRequest {
    return QueryFinalityProviderDelegationsRequest.decode(message.value);
  },
  toProto(message: QueryFinalityProviderDelegationsRequest): Uint8Array {
    return QueryFinalityProviderDelegationsRequest.encode(message).finish();
  },
  toProtoMsg(message: QueryFinalityProviderDelegationsRequest): QueryFinalityProviderDelegationsRequestProtoMsg {
    return {
      typeUrl: '/babylon.btcstaking.v1.QueryFinalityProviderDelegationsRequest',
      value: QueryFinalityProviderDelegationsRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryFinalityProviderDelegationsResponse(): QueryFinalityProviderDelegationsResponse {
  return {
    btcDelegatorDelegations: [],
    pagination: undefined,
  };
}
export const QueryFinalityProviderDelegationsResponse = {
  typeUrl: '/babylon.btcstaking.v1.QueryFinalityProviderDelegationsResponse',
  encode(
    message: QueryFinalityProviderDelegationsResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    for (const v of message.btcDelegatorDelegations) {
      BTCDelegatorDelegationsResponse.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    if (message.pagination !== undefined) {
      PageResponse.encode(message.pagination, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): QueryFinalityProviderDelegationsResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryFinalityProviderDelegationsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.btcDelegatorDelegations.push(BTCDelegatorDelegationsResponse.decode(reader, reader.uint32()));
          break;
        case 2:
          message.pagination = PageResponse.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<QueryFinalityProviderDelegationsResponse>): QueryFinalityProviderDelegationsResponse {
    const message = createBaseQueryFinalityProviderDelegationsResponse();
    message.btcDelegatorDelegations =
      object.btcDelegatorDelegations?.map((e) => BTCDelegatorDelegationsResponse.fromPartial(e)) || [];
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageResponse.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromAmino(object: QueryFinalityProviderDelegationsResponseAmino): QueryFinalityProviderDelegationsResponse {
    const message = createBaseQueryFinalityProviderDelegationsResponse();
    message.btcDelegatorDelegations =
      object.btc_delegator_delegations?.map((e) => BTCDelegatorDelegationsResponse.fromAmino(e)) || [];
    if (object.pagination !== undefined && object.pagination !== null) {
      message.pagination = PageResponse.fromAmino(object.pagination);
    }
    return message;
  },
  toAmino(message: QueryFinalityProviderDelegationsResponse): QueryFinalityProviderDelegationsResponseAmino {
    const obj: any = {};
    if (message.btcDelegatorDelegations) {
      obj.btc_delegator_delegations = message.btcDelegatorDelegations.map((e) =>
        e ? BTCDelegatorDelegationsResponse.toAmino(e) : undefined,
      );
    } else {
      obj.btc_delegator_delegations = message.btcDelegatorDelegations;
    }
    obj.pagination = message.pagination ? PageResponse.toAmino(message.pagination) : undefined;
    return obj;
  },
  fromAminoMsg(object: QueryFinalityProviderDelegationsResponseAminoMsg): QueryFinalityProviderDelegationsResponse {
    return QueryFinalityProviderDelegationsResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: QueryFinalityProviderDelegationsResponseProtoMsg): QueryFinalityProviderDelegationsResponse {
    return QueryFinalityProviderDelegationsResponse.decode(message.value);
  },
  toProto(message: QueryFinalityProviderDelegationsResponse): Uint8Array {
    return QueryFinalityProviderDelegationsResponse.encode(message).finish();
  },
  toProtoMsg(message: QueryFinalityProviderDelegationsResponse): QueryFinalityProviderDelegationsResponseProtoMsg {
    return {
      typeUrl: '/babylon.btcstaking.v1.QueryFinalityProviderDelegationsResponse',
      value: QueryFinalityProviderDelegationsResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryBTCDelegationRequest(): QueryBTCDelegationRequest {
  return {
    stakingTxHashHex: '',
  };
}
export const QueryBTCDelegationRequest = {
  typeUrl: '/babylon.btcstaking.v1.QueryBTCDelegationRequest',
  encode(message: QueryBTCDelegationRequest, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.stakingTxHashHex !== '') {
      writer.uint32(10).string(message.stakingTxHashHex);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): QueryBTCDelegationRequest {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryBTCDelegationRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.stakingTxHashHex = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<QueryBTCDelegationRequest>): QueryBTCDelegationRequest {
    const message = createBaseQueryBTCDelegationRequest();
    message.stakingTxHashHex = object.stakingTxHashHex ?? '';
    return message;
  },
  fromAmino(object: QueryBTCDelegationRequestAmino): QueryBTCDelegationRequest {
    const message = createBaseQueryBTCDelegationRequest();
    if (object.staking_tx_hash_hex !== undefined && object.staking_tx_hash_hex !== null) {
      message.stakingTxHashHex = object.staking_tx_hash_hex;
    }
    return message;
  },
  toAmino(message: QueryBTCDelegationRequest): QueryBTCDelegationRequestAmino {
    const obj: any = {};
    obj.staking_tx_hash_hex = message.stakingTxHashHex === '' ? undefined : message.stakingTxHashHex;
    return obj;
  },
  fromAminoMsg(object: QueryBTCDelegationRequestAminoMsg): QueryBTCDelegationRequest {
    return QueryBTCDelegationRequest.fromAmino(object.value);
  },
  fromProtoMsg(message: QueryBTCDelegationRequestProtoMsg): QueryBTCDelegationRequest {
    return QueryBTCDelegationRequest.decode(message.value);
  },
  toProto(message: QueryBTCDelegationRequest): Uint8Array {
    return QueryBTCDelegationRequest.encode(message).finish();
  },
  toProtoMsg(message: QueryBTCDelegationRequest): QueryBTCDelegationRequestProtoMsg {
    return {
      typeUrl: '/babylon.btcstaking.v1.QueryBTCDelegationRequest',
      value: QueryBTCDelegationRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryBTCDelegationResponse(): QueryBTCDelegationResponse {
  return {
    btcDelegation: undefined,
  };
}
export const QueryBTCDelegationResponse = {
  typeUrl: '/babylon.btcstaking.v1.QueryBTCDelegationResponse',
  encode(message: QueryBTCDelegationResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.btcDelegation !== undefined) {
      BTCDelegationResponse.encode(message.btcDelegation, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): QueryBTCDelegationResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryBTCDelegationResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.btcDelegation = BTCDelegationResponse.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<QueryBTCDelegationResponse>): QueryBTCDelegationResponse {
    const message = createBaseQueryBTCDelegationResponse();
    message.btcDelegation =
      object.btcDelegation !== undefined && object.btcDelegation !== null
        ? BTCDelegationResponse.fromPartial(object.btcDelegation)
        : undefined;
    return message;
  },
  fromAmino(object: QueryBTCDelegationResponseAmino): QueryBTCDelegationResponse {
    const message = createBaseQueryBTCDelegationResponse();
    if (object.btc_delegation !== undefined && object.btc_delegation !== null) {
      message.btcDelegation = BTCDelegationResponse.fromAmino(object.btc_delegation);
    }
    return message;
  },
  toAmino(message: QueryBTCDelegationResponse): QueryBTCDelegationResponseAmino {
    const obj: any = {};
    obj.btc_delegation = message.btcDelegation ? BTCDelegationResponse.toAmino(message.btcDelegation) : undefined;
    return obj;
  },
  fromAminoMsg(object: QueryBTCDelegationResponseAminoMsg): QueryBTCDelegationResponse {
    return QueryBTCDelegationResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: QueryBTCDelegationResponseProtoMsg): QueryBTCDelegationResponse {
    return QueryBTCDelegationResponse.decode(message.value);
  },
  toProto(message: QueryBTCDelegationResponse): Uint8Array {
    return QueryBTCDelegationResponse.encode(message).finish();
  },
  toProtoMsg(message: QueryBTCDelegationResponse): QueryBTCDelegationResponseProtoMsg {
    return {
      typeUrl: '/babylon.btcstaking.v1.QueryBTCDelegationResponse',
      value: QueryBTCDelegationResponse.encode(message).finish(),
    };
  },
};
function createBaseBTCDelegationResponse(): BTCDelegationResponse {
  return {
    stakerAddr: '',
    btcPk: new Uint8Array(),
    fpBtcPkList: [],
    startHeight: BigInt(0),
    endHeight: BigInt(0),
    totalSat: BigInt(0),
    stakingTxHex: '',
    slashingTxHex: '',
    delegatorSlashSigHex: '',
    covenantSigs: [],
    stakingOutputIdx: 0,
    active: false,
    statusDesc: '',
    unbondingTime: 0,
    undelegationResponse: undefined,
    paramsVersion: 0,
  };
}
export const BTCDelegationResponse = {
  typeUrl: '/babylon.btcstaking.v1.BTCDelegationResponse',
  encode(message: BTCDelegationResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.stakerAddr !== '') {
      writer.uint32(10).string(message.stakerAddr);
    }
    if (message.btcPk.length !== 0) {
      writer.uint32(18).bytes(message.btcPk);
    }
    for (const v of message.fpBtcPkList) {
      writer.uint32(26).bytes(v!);
    }
    if (message.startHeight !== BigInt(0)) {
      writer.uint32(32).uint64(message.startHeight);
    }
    if (message.endHeight !== BigInt(0)) {
      writer.uint32(40).uint64(message.endHeight);
    }
    if (message.totalSat !== BigInt(0)) {
      writer.uint32(48).uint64(message.totalSat);
    }
    if (message.stakingTxHex !== '') {
      writer.uint32(58).string(message.stakingTxHex);
    }
    if (message.slashingTxHex !== '') {
      writer.uint32(66).string(message.slashingTxHex);
    }
    if (message.delegatorSlashSigHex !== '') {
      writer.uint32(74).string(message.delegatorSlashSigHex);
    }
    for (const v of message.covenantSigs) {
      CovenantAdaptorSignatures.encode(v!, writer.uint32(82).fork()).ldelim();
    }
    if (message.stakingOutputIdx !== 0) {
      writer.uint32(88).uint32(message.stakingOutputIdx);
    }
    if (message.active === true) {
      writer.uint32(96).bool(message.active);
    }
    if (message.statusDesc !== '') {
      writer.uint32(106).string(message.statusDesc);
    }
    if (message.unbondingTime !== 0) {
      writer.uint32(112).uint32(message.unbondingTime);
    }
    if (message.undelegationResponse !== undefined) {
      BTCUndelegationResponse.encode(message.undelegationResponse, writer.uint32(122).fork()).ldelim();
    }
    if (message.paramsVersion !== 0) {
      writer.uint32(128).uint32(message.paramsVersion);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): BTCDelegationResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBTCDelegationResponse();
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
          message.fpBtcPkList.push(reader.bytes());
          break;
        case 4:
          message.startHeight = reader.uint64();
          break;
        case 5:
          message.endHeight = reader.uint64();
          break;
        case 6:
          message.totalSat = reader.uint64();
          break;
        case 7:
          message.stakingTxHex = reader.string();
          break;
        case 8:
          message.slashingTxHex = reader.string();
          break;
        case 9:
          message.delegatorSlashSigHex = reader.string();
          break;
        case 10:
          message.covenantSigs.push(CovenantAdaptorSignatures.decode(reader, reader.uint32()));
          break;
        case 11:
          message.stakingOutputIdx = reader.uint32();
          break;
        case 12:
          message.active = reader.bool();
          break;
        case 13:
          message.statusDesc = reader.string();
          break;
        case 14:
          message.unbondingTime = reader.uint32();
          break;
        case 15:
          message.undelegationResponse = BTCUndelegationResponse.decode(reader, reader.uint32());
          break;
        case 16:
          message.paramsVersion = reader.uint32();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<BTCDelegationResponse>): BTCDelegationResponse {
    const message = createBaseBTCDelegationResponse();
    message.stakerAddr = object.stakerAddr ?? '';
    message.btcPk = object.btcPk ?? new Uint8Array();
    message.fpBtcPkList = object.fpBtcPkList?.map((e) => e) || [];
    message.startHeight =
      object.startHeight !== undefined && object.startHeight !== null
        ? BigInt(object.startHeight.toString())
        : BigInt(0);
    message.endHeight =
      object.endHeight !== undefined && object.endHeight !== null ? BigInt(object.endHeight.toString()) : BigInt(0);
    message.totalSat =
      object.totalSat !== undefined && object.totalSat !== null ? BigInt(object.totalSat.toString()) : BigInt(0);
    message.stakingTxHex = object.stakingTxHex ?? '';
    message.slashingTxHex = object.slashingTxHex ?? '';
    message.delegatorSlashSigHex = object.delegatorSlashSigHex ?? '';
    message.covenantSigs = object.covenantSigs?.map((e) => CovenantAdaptorSignatures.fromPartial(e)) || [];
    message.stakingOutputIdx = object.stakingOutputIdx ?? 0;
    message.active = object.active ?? false;
    message.statusDesc = object.statusDesc ?? '';
    message.unbondingTime = object.unbondingTime ?? 0;
    message.undelegationResponse =
      object.undelegationResponse !== undefined && object.undelegationResponse !== null
        ? BTCUndelegationResponse.fromPartial(object.undelegationResponse)
        : undefined;
    message.paramsVersion = object.paramsVersion ?? 0;
    return message;
  },
  fromAmino(object: BTCDelegationResponseAmino): BTCDelegationResponse {
    const message = createBaseBTCDelegationResponse();
    if (object.staker_addr !== undefined && object.staker_addr !== null) {
      message.stakerAddr = object.staker_addr;
    }
    if (object.btc_pk !== undefined && object.btc_pk !== null) {
      message.btcPk = bytesFromBase64(object.btc_pk);
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
    if (object.staking_tx_hex !== undefined && object.staking_tx_hex !== null) {
      message.stakingTxHex = object.staking_tx_hex;
    }
    if (object.slashing_tx_hex !== undefined && object.slashing_tx_hex !== null) {
      message.slashingTxHex = object.slashing_tx_hex;
    }
    if (object.delegator_slash_sig_hex !== undefined && object.delegator_slash_sig_hex !== null) {
      message.delegatorSlashSigHex = object.delegator_slash_sig_hex;
    }
    message.covenantSigs = object.covenant_sigs?.map((e) => CovenantAdaptorSignatures.fromAmino(e)) || [];
    if (object.staking_output_idx !== undefined && object.staking_output_idx !== null) {
      message.stakingOutputIdx = object.staking_output_idx;
    }
    if (object.active !== undefined && object.active !== null) {
      message.active = object.active;
    }
    if (object.status_desc !== undefined && object.status_desc !== null) {
      message.statusDesc = object.status_desc;
    }
    if (object.unbonding_time !== undefined && object.unbonding_time !== null) {
      message.unbondingTime = object.unbonding_time;
    }
    if (object.undelegation_response !== undefined && object.undelegation_response !== null) {
      message.undelegationResponse = BTCUndelegationResponse.fromAmino(object.undelegation_response);
    }
    if (object.params_version !== undefined && object.params_version !== null) {
      message.paramsVersion = object.params_version;
    }
    return message;
  },
  toAmino(message: BTCDelegationResponse): BTCDelegationResponseAmino {
    const obj: any = {};
    obj.staker_addr = message.stakerAddr === '' ? undefined : message.stakerAddr;
    obj.btc_pk = message.btcPk ? base64FromBytes(message.btcPk) : undefined;
    if (message.fpBtcPkList) {
      obj.fp_btc_pk_list = message.fpBtcPkList.map((e) => base64FromBytes(e));
    } else {
      obj.fp_btc_pk_list = message.fpBtcPkList;
    }
    obj.start_height = message.startHeight !== BigInt(0) ? message.startHeight?.toString() : undefined;
    obj.end_height = message.endHeight !== BigInt(0) ? message.endHeight?.toString() : undefined;
    obj.total_sat = message.totalSat !== BigInt(0) ? message.totalSat?.toString() : undefined;
    obj.staking_tx_hex = message.stakingTxHex === '' ? undefined : message.stakingTxHex;
    obj.slashing_tx_hex = message.slashingTxHex === '' ? undefined : message.slashingTxHex;
    obj.delegator_slash_sig_hex = message.delegatorSlashSigHex === '' ? undefined : message.delegatorSlashSigHex;
    if (message.covenantSigs) {
      obj.covenant_sigs = message.covenantSigs.map((e) => (e ? CovenantAdaptorSignatures.toAmino(e) : undefined));
    } else {
      obj.covenant_sigs = message.covenantSigs;
    }
    obj.staking_output_idx = message.stakingOutputIdx === 0 ? undefined : message.stakingOutputIdx;
    obj.active = message.active === false ? undefined : message.active;
    obj.status_desc = message.statusDesc === '' ? undefined : message.statusDesc;
    obj.unbonding_time = message.unbondingTime === 0 ? undefined : message.unbondingTime;
    obj.undelegation_response = message.undelegationResponse
      ? BTCUndelegationResponse.toAmino(message.undelegationResponse)
      : undefined;
    obj.params_version = message.paramsVersion === 0 ? undefined : message.paramsVersion;
    return obj;
  },
  fromAminoMsg(object: BTCDelegationResponseAminoMsg): BTCDelegationResponse {
    return BTCDelegationResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: BTCDelegationResponseProtoMsg): BTCDelegationResponse {
    return BTCDelegationResponse.decode(message.value);
  },
  toProto(message: BTCDelegationResponse): Uint8Array {
    return BTCDelegationResponse.encode(message).finish();
  },
  toProtoMsg(message: BTCDelegationResponse): BTCDelegationResponseProtoMsg {
    return {
      typeUrl: '/babylon.btcstaking.v1.BTCDelegationResponse',
      value: BTCDelegationResponse.encode(message).finish(),
    };
  },
};
function createBaseBTCUndelegationResponse(): BTCUndelegationResponse {
  return {
    unbondingTxHex: '',
    delegatorUnbondingSigHex: '',
    covenantUnbondingSigList: [],
    slashingTxHex: '',
    delegatorSlashingSigHex: '',
    covenantSlashingSigs: [],
  };
}
export const BTCUndelegationResponse = {
  typeUrl: '/babylon.btcstaking.v1.BTCUndelegationResponse',
  encode(message: BTCUndelegationResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.unbondingTxHex !== '') {
      writer.uint32(10).string(message.unbondingTxHex);
    }
    if (message.delegatorUnbondingSigHex !== '') {
      writer.uint32(18).string(message.delegatorUnbondingSigHex);
    }
    for (const v of message.covenantUnbondingSigList) {
      SignatureInfo.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    if (message.slashingTxHex !== '') {
      writer.uint32(34).string(message.slashingTxHex);
    }
    if (message.delegatorSlashingSigHex !== '') {
      writer.uint32(42).string(message.delegatorSlashingSigHex);
    }
    for (const v of message.covenantSlashingSigs) {
      CovenantAdaptorSignatures.encode(v!, writer.uint32(50).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): BTCUndelegationResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBTCUndelegationResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.unbondingTxHex = reader.string();
          break;
        case 2:
          message.delegatorUnbondingSigHex = reader.string();
          break;
        case 3:
          message.covenantUnbondingSigList.push(SignatureInfo.decode(reader, reader.uint32()));
          break;
        case 4:
          message.slashingTxHex = reader.string();
          break;
        case 5:
          message.delegatorSlashingSigHex = reader.string();
          break;
        case 6:
          message.covenantSlashingSigs.push(CovenantAdaptorSignatures.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<BTCUndelegationResponse>): BTCUndelegationResponse {
    const message = createBaseBTCUndelegationResponse();
    message.unbondingTxHex = object.unbondingTxHex ?? '';
    message.delegatorUnbondingSigHex = object.delegatorUnbondingSigHex ?? '';
    message.covenantUnbondingSigList = object.covenantUnbondingSigList?.map((e) => SignatureInfo.fromPartial(e)) || [];
    message.slashingTxHex = object.slashingTxHex ?? '';
    message.delegatorSlashingSigHex = object.delegatorSlashingSigHex ?? '';
    message.covenantSlashingSigs =
      object.covenantSlashingSigs?.map((e) => CovenantAdaptorSignatures.fromPartial(e)) || [];
    return message;
  },
  fromAmino(object: BTCUndelegationResponseAmino): BTCUndelegationResponse {
    const message = createBaseBTCUndelegationResponse();
    if (object.unbonding_tx_hex !== undefined && object.unbonding_tx_hex !== null) {
      message.unbondingTxHex = object.unbonding_tx_hex;
    }
    if (object.delegator_unbonding_sig_hex !== undefined && object.delegator_unbonding_sig_hex !== null) {
      message.delegatorUnbondingSigHex = object.delegator_unbonding_sig_hex;
    }
    message.covenantUnbondingSigList = object.covenant_unbonding_sig_list?.map((e) => SignatureInfo.fromAmino(e)) || [];
    if (object.slashing_tx_hex !== undefined && object.slashing_tx_hex !== null) {
      message.slashingTxHex = object.slashing_tx_hex;
    }
    if (object.delegator_slashing_sig_hex !== undefined && object.delegator_slashing_sig_hex !== null) {
      message.delegatorSlashingSigHex = object.delegator_slashing_sig_hex;
    }
    message.covenantSlashingSigs =
      object.covenant_slashing_sigs?.map((e) => CovenantAdaptorSignatures.fromAmino(e)) || [];
    return message;
  },
  toAmino(message: BTCUndelegationResponse): BTCUndelegationResponseAmino {
    const obj: any = {};
    obj.unbonding_tx_hex = message.unbondingTxHex === '' ? undefined : message.unbondingTxHex;
    obj.delegator_unbonding_sig_hex =
      message.delegatorUnbondingSigHex === '' ? undefined : message.delegatorUnbondingSigHex;
    if (message.covenantUnbondingSigList) {
      obj.covenant_unbonding_sig_list = message.covenantUnbondingSigList.map((e) =>
        e ? SignatureInfo.toAmino(e) : undefined,
      );
    } else {
      obj.covenant_unbonding_sig_list = message.covenantUnbondingSigList;
    }
    obj.slashing_tx_hex = message.slashingTxHex === '' ? undefined : message.slashingTxHex;
    obj.delegator_slashing_sig_hex =
      message.delegatorSlashingSigHex === '' ? undefined : message.delegatorSlashingSigHex;
    if (message.covenantSlashingSigs) {
      obj.covenant_slashing_sigs = message.covenantSlashingSigs.map((e) =>
        e ? CovenantAdaptorSignatures.toAmino(e) : undefined,
      );
    } else {
      obj.covenant_slashing_sigs = message.covenantSlashingSigs;
    }
    return obj;
  },
  fromAminoMsg(object: BTCUndelegationResponseAminoMsg): BTCUndelegationResponse {
    return BTCUndelegationResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: BTCUndelegationResponseProtoMsg): BTCUndelegationResponse {
    return BTCUndelegationResponse.decode(message.value);
  },
  toProto(message: BTCUndelegationResponse): Uint8Array {
    return BTCUndelegationResponse.encode(message).finish();
  },
  toProtoMsg(message: BTCUndelegationResponse): BTCUndelegationResponseProtoMsg {
    return {
      typeUrl: '/babylon.btcstaking.v1.BTCUndelegationResponse',
      value: BTCUndelegationResponse.encode(message).finish(),
    };
  },
};
function createBaseBTCDelegatorDelegationsResponse(): BTCDelegatorDelegationsResponse {
  return {
    dels: [],
  };
}
export const BTCDelegatorDelegationsResponse = {
  typeUrl: '/babylon.btcstaking.v1.BTCDelegatorDelegationsResponse',
  encode(message: BTCDelegatorDelegationsResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    for (const v of message.dels) {
      BTCDelegationResponse.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): BTCDelegatorDelegationsResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBTCDelegatorDelegationsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.dels.push(BTCDelegationResponse.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<BTCDelegatorDelegationsResponse>): BTCDelegatorDelegationsResponse {
    const message = createBaseBTCDelegatorDelegationsResponse();
    message.dels = object.dels?.map((e) => BTCDelegationResponse.fromPartial(e)) || [];
    return message;
  },
  fromAmino(object: BTCDelegatorDelegationsResponseAmino): BTCDelegatorDelegationsResponse {
    const message = createBaseBTCDelegatorDelegationsResponse();
    message.dels = object.dels?.map((e) => BTCDelegationResponse.fromAmino(e)) || [];
    return message;
  },
  toAmino(message: BTCDelegatorDelegationsResponse): BTCDelegatorDelegationsResponseAmino {
    const obj: any = {};
    if (message.dels) {
      obj.dels = message.dels.map((e) => (e ? BTCDelegationResponse.toAmino(e) : undefined));
    } else {
      obj.dels = message.dels;
    }
    return obj;
  },
  fromAminoMsg(object: BTCDelegatorDelegationsResponseAminoMsg): BTCDelegatorDelegationsResponse {
    return BTCDelegatorDelegationsResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: BTCDelegatorDelegationsResponseProtoMsg): BTCDelegatorDelegationsResponse {
    return BTCDelegatorDelegationsResponse.decode(message.value);
  },
  toProto(message: BTCDelegatorDelegationsResponse): Uint8Array {
    return BTCDelegatorDelegationsResponse.encode(message).finish();
  },
  toProtoMsg(message: BTCDelegatorDelegationsResponse): BTCDelegatorDelegationsResponseProtoMsg {
    return {
      typeUrl: '/babylon.btcstaking.v1.BTCDelegatorDelegationsResponse',
      value: BTCDelegatorDelegationsResponse.encode(message).finish(),
    };
  },
};
function createBaseFinalityProviderResponse(): FinalityProviderResponse {
  return {
    description: undefined,
    commission: '',
    addr: '',
    btcPk: new Uint8Array(),
    pop: undefined,
    slashedBabylonHeight: BigInt(0),
    slashedBtcHeight: BigInt(0),
    height: BigInt(0),
    votingPower: BigInt(0),
    sluggish: false,
  };
}
export const FinalityProviderResponse = {
  typeUrl: '/babylon.btcstaking.v1.FinalityProviderResponse',
  encode(message: FinalityProviderResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.description !== undefined) {
      Description.encode(message.description, writer.uint32(10).fork()).ldelim();
    }
    if (message.commission !== '') {
      writer.uint32(18).string(Decimal.fromUserInput(message.commission, 18).atomics);
    }
    if (message.addr !== '') {
      writer.uint32(26).string(message.addr);
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
    if (message.height !== BigInt(0)) {
      writer.uint32(64).uint64(message.height);
    }
    if (message.votingPower !== BigInt(0)) {
      writer.uint32(72).uint64(message.votingPower);
    }
    if (message.sluggish === true) {
      writer.uint32(80).bool(message.sluggish);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): FinalityProviderResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseFinalityProviderResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.description = Description.decode(reader, reader.uint32());
          break;
        case 2:
          message.commission = Decimal.fromAtomics(reader.string(), 18).toString();
          break;
        case 3:
          message.addr = reader.string();
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
          message.height = reader.uint64();
          break;
        case 9:
          message.votingPower = reader.uint64();
          break;
        case 10:
          message.sluggish = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<FinalityProviderResponse>): FinalityProviderResponse {
    const message = createBaseFinalityProviderResponse();
    message.description =
      object.description !== undefined && object.description !== null
        ? Description.fromPartial(object.description)
        : undefined;
    message.commission = object.commission ?? '';
    message.addr = object.addr ?? '';
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
    message.height =
      object.height !== undefined && object.height !== null ? BigInt(object.height.toString()) : BigInt(0);
    message.votingPower =
      object.votingPower !== undefined && object.votingPower !== null
        ? BigInt(object.votingPower.toString())
        : BigInt(0);
    message.sluggish = object.sluggish ?? false;
    return message;
  },
  fromAmino(object: FinalityProviderResponseAmino): FinalityProviderResponse {
    const message = createBaseFinalityProviderResponse();
    if (object.description !== undefined && object.description !== null) {
      message.description = Description.fromAmino(object.description);
    }
    if (object.commission !== undefined && object.commission !== null) {
      message.commission = object.commission;
    }
    if (object.addr !== undefined && object.addr !== null) {
      message.addr = object.addr;
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
    if (object.height !== undefined && object.height !== null) {
      message.height = BigInt(object.height);
    }
    if (object.voting_power !== undefined && object.voting_power !== null) {
      message.votingPower = BigInt(object.voting_power);
    }
    if (object.sluggish !== undefined && object.sluggish !== null) {
      message.sluggish = object.sluggish;
    }
    return message;
  },
  toAmino(message: FinalityProviderResponse): FinalityProviderResponseAmino {
    const obj: any = {};
    obj.description = message.description ? Description.toAmino(message.description) : undefined;
    obj.commission = message.commission === '' ? undefined : message.commission;
    obj.addr = message.addr === '' ? undefined : message.addr;
    obj.btc_pk = message.btcPk ? base64FromBytes(message.btcPk) : undefined;
    obj.pop = message.pop ? ProofOfPossessionBTC.toAmino(message.pop) : undefined;
    obj.slashed_babylon_height =
      message.slashedBabylonHeight !== BigInt(0) ? message.slashedBabylonHeight?.toString() : undefined;
    obj.slashed_btc_height = message.slashedBtcHeight !== BigInt(0) ? message.slashedBtcHeight?.toString() : undefined;
    obj.height = message.height !== BigInt(0) ? message.height?.toString() : undefined;
    obj.voting_power = message.votingPower !== BigInt(0) ? message.votingPower?.toString() : undefined;
    obj.sluggish = message.sluggish === false ? undefined : message.sluggish;
    return obj;
  },
  fromAminoMsg(object: FinalityProviderResponseAminoMsg): FinalityProviderResponse {
    return FinalityProviderResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: FinalityProviderResponseProtoMsg): FinalityProviderResponse {
    return FinalityProviderResponse.decode(message.value);
  },
  toProto(message: FinalityProviderResponse): Uint8Array {
    return FinalityProviderResponse.encode(message).finish();
  },
  toProtoMsg(message: FinalityProviderResponse): FinalityProviderResponseProtoMsg {
    return {
      typeUrl: '/babylon.btcstaking.v1.FinalityProviderResponse',
      value: FinalityProviderResponse.encode(message).finish(),
    };
  },
};
