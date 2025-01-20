import { BinaryReader, BinaryWriter } from '../../../binary';
import { Timestamp } from '../../../google/protobuf/timestamp';
import { fromTimestamp, toTimestamp } from '../../../helpers';
import {
  PageRequest,
  PageRequestAmino,
  PageRequestSDKType,
  PageResponse,
  PageResponseAmino,
  PageResponseSDKType,
} from '../../core-proto-ts/cosmos/base/query/v1beta1/pagination';
import {
  DelegationLifecycle,
  DelegationLifecycleAmino,
  DelegationLifecycleSDKType,
  Validator,
  ValidatorAmino,
  ValidatorSDKType,
} from './epoching';
import { Params, ParamsAmino, ParamsSDKType } from './params';
/** QueryParamsRequest is the request type for the Query/Params RPC method. */
export interface QueryParamsRequest {}
export interface QueryParamsRequestProtoMsg {
  typeUrl: '/babylon.epoching.v1.QueryParamsRequest';
  value: Uint8Array;
}
/** QueryParamsRequest is the request type for the Query/Params RPC method. */
export interface QueryParamsRequestAmino {}
export interface QueryParamsRequestAminoMsg {
  type: '/babylon.epoching.v1.QueryParamsRequest';
  value: QueryParamsRequestAmino;
}
/** QueryParamsRequest is the request type for the Query/Params RPC method. */
export interface QueryParamsRequestSDKType {}
/** QueryParamsResponse is the response type for the Query/Params RPC method. */
export interface QueryParamsResponse {
  /** params holds all the parameters of this module. */
  params: Params;
}
export interface QueryParamsResponseProtoMsg {
  typeUrl: '/babylon.epoching.v1.QueryParamsResponse';
  value: Uint8Array;
}
/** QueryParamsResponse is the response type for the Query/Params RPC method. */
export interface QueryParamsResponseAmino {
  /** params holds all the parameters of this module. */
  params?: ParamsAmino;
}
export interface QueryParamsResponseAminoMsg {
  type: '/babylon.epoching.v1.QueryParamsResponse';
  value: QueryParamsResponseAmino;
}
/** QueryParamsResponse is the response type for the Query/Params RPC method. */
export interface QueryParamsResponseSDKType {
  params: ParamsSDKType;
}
/** QueryEpochInfoRequest is the request type for the Query/EpochInfo method */
export interface QueryEpochInfoRequest {
  epochNum: bigint;
}
export interface QueryEpochInfoRequestProtoMsg {
  typeUrl: '/babylon.epoching.v1.QueryEpochInfoRequest';
  value: Uint8Array;
}
/** QueryEpochInfoRequest is the request type for the Query/EpochInfo method */
export interface QueryEpochInfoRequestAmino {
  epoch_num?: string;
}
export interface QueryEpochInfoRequestAminoMsg {
  type: '/babylon.epoching.v1.QueryEpochInfoRequest';
  value: QueryEpochInfoRequestAmino;
}
/** QueryEpochInfoRequest is the request type for the Query/EpochInfo method */
export interface QueryEpochInfoRequestSDKType {
  epoch_num: bigint;
}
/** QueryEpochInfoRequest is the response type for the Query/EpochInfo method */
export interface QueryEpochInfoResponse {
  epoch?: EpochResponse;
}
export interface QueryEpochInfoResponseProtoMsg {
  typeUrl: '/babylon.epoching.v1.QueryEpochInfoResponse';
  value: Uint8Array;
}
/** QueryEpochInfoRequest is the response type for the Query/EpochInfo method */
export interface QueryEpochInfoResponseAmino {
  epoch?: EpochResponseAmino;
}
export interface QueryEpochInfoResponseAminoMsg {
  type: '/babylon.epoching.v1.QueryEpochInfoResponse';
  value: QueryEpochInfoResponseAmino;
}
/** QueryEpochInfoRequest is the response type for the Query/EpochInfo method */
export interface QueryEpochInfoResponseSDKType {
  epoch?: EpochResponseSDKType;
}
/** QueryEpochInfosRequest is the request type for the Query/EpochInfos method */
export interface QueryEpochsInfoRequest {
  /** pagination defines whether to have the pagination in the request */
  pagination?: PageRequest;
}
export interface QueryEpochsInfoRequestProtoMsg {
  typeUrl: '/babylon.epoching.v1.QueryEpochsInfoRequest';
  value: Uint8Array;
}
/** QueryEpochInfosRequest is the request type for the Query/EpochInfos method */
export interface QueryEpochsInfoRequestAmino {
  /** pagination defines whether to have the pagination in the request */
  pagination?: PageRequestAmino;
}
export interface QueryEpochsInfoRequestAminoMsg {
  type: '/babylon.epoching.v1.QueryEpochsInfoRequest';
  value: QueryEpochsInfoRequestAmino;
}
/** QueryEpochInfosRequest is the request type for the Query/EpochInfos method */
export interface QueryEpochsInfoRequestSDKType {
  pagination?: PageRequestSDKType;
}
/** QueryEpochsInfoResponse is the response type for the Query/EpochInfos method */
export interface QueryEpochsInfoResponse {
  epochs: EpochResponse[];
  /** pagination defines the pagination in the response */
  pagination?: PageResponse;
}
export interface QueryEpochsInfoResponseProtoMsg {
  typeUrl: '/babylon.epoching.v1.QueryEpochsInfoResponse';
  value: Uint8Array;
}
/** QueryEpochsInfoResponse is the response type for the Query/EpochInfos method */
export interface QueryEpochsInfoResponseAmino {
  epochs?: EpochResponseAmino[];
  /** pagination defines the pagination in the response */
  pagination?: PageResponseAmino;
}
export interface QueryEpochsInfoResponseAminoMsg {
  type: '/babylon.epoching.v1.QueryEpochsInfoResponse';
  value: QueryEpochsInfoResponseAmino;
}
/** QueryEpochsInfoResponse is the response type for the Query/EpochInfos method */
export interface QueryEpochsInfoResponseSDKType {
  epochs: EpochResponseSDKType[];
  pagination?: PageResponseSDKType;
}
/**
 * QueryCurrentEpochRequest is the request type for the Query/CurrentEpoch RPC
 * method
 */
export interface QueryCurrentEpochRequest {}
export interface QueryCurrentEpochRequestProtoMsg {
  typeUrl: '/babylon.epoching.v1.QueryCurrentEpochRequest';
  value: Uint8Array;
}
/**
 * QueryCurrentEpochRequest is the request type for the Query/CurrentEpoch RPC
 * method
 */
export interface QueryCurrentEpochRequestAmino {}
export interface QueryCurrentEpochRequestAminoMsg {
  type: '/babylon.epoching.v1.QueryCurrentEpochRequest';
  value: QueryCurrentEpochRequestAmino;
}
/**
 * QueryCurrentEpochRequest is the request type for the Query/CurrentEpoch RPC
 * method
 */
export interface QueryCurrentEpochRequestSDKType {}
/**
 * QueryCurrentEpochResponse is the response type for the Query/CurrentEpoch RPC
 * method
 */
export interface QueryCurrentEpochResponse {
  /** current_epoch is the current epoch number */
  currentEpoch: bigint;
  /** epoch_boundary is the height of this epoch's last block */
  epochBoundary: bigint;
}
export interface QueryCurrentEpochResponseProtoMsg {
  typeUrl: '/babylon.epoching.v1.QueryCurrentEpochResponse';
  value: Uint8Array;
}
/**
 * QueryCurrentEpochResponse is the response type for the Query/CurrentEpoch RPC
 * method
 */
export interface QueryCurrentEpochResponseAmino {
  /** current_epoch is the current epoch number */
  current_epoch?: string;
  /** epoch_boundary is the height of this epoch's last block */
  epoch_boundary?: string;
}
export interface QueryCurrentEpochResponseAminoMsg {
  type: '/babylon.epoching.v1.QueryCurrentEpochResponse';
  value: QueryCurrentEpochResponseAmino;
}
/**
 * QueryCurrentEpochResponse is the response type for the Query/CurrentEpoch RPC
 * method
 */
export interface QueryCurrentEpochResponseSDKType {
  current_epoch: bigint;
  epoch_boundary: bigint;
}
/** QueryEpochMsgsRequest is the request type for the Query/EpochMsgs RPC method */
export interface QueryEpochMsgsRequest {
  /** epoch_num is the number of epoch of the requested msg queue */
  epochNum: bigint;
  /** pagination defines whether to have the pagination in the request */
  pagination?: PageRequest;
}
export interface QueryEpochMsgsRequestProtoMsg {
  typeUrl: '/babylon.epoching.v1.QueryEpochMsgsRequest';
  value: Uint8Array;
}
/** QueryEpochMsgsRequest is the request type for the Query/EpochMsgs RPC method */
export interface QueryEpochMsgsRequestAmino {
  /** epoch_num is the number of epoch of the requested msg queue */
  epoch_num?: string;
  /** pagination defines whether to have the pagination in the request */
  pagination?: PageRequestAmino;
}
export interface QueryEpochMsgsRequestAminoMsg {
  type: '/babylon.epoching.v1.QueryEpochMsgsRequest';
  value: QueryEpochMsgsRequestAmino;
}
/** QueryEpochMsgsRequest is the request type for the Query/EpochMsgs RPC method */
export interface QueryEpochMsgsRequestSDKType {
  epoch_num: bigint;
  pagination?: PageRequestSDKType;
}
/**
 * QueryEpochMsgsResponse is the response type for the Query/EpochMsgs RPC
 * method
 */
export interface QueryEpochMsgsResponse {
  /** msgs is the list of messages queued in the current epoch */
  msgs: QueuedMessageResponse[];
  /** pagination defines the pagination in the response */
  pagination?: PageResponse;
}
export interface QueryEpochMsgsResponseProtoMsg {
  typeUrl: '/babylon.epoching.v1.QueryEpochMsgsResponse';
  value: Uint8Array;
}
/**
 * QueryEpochMsgsResponse is the response type for the Query/EpochMsgs RPC
 * method
 */
export interface QueryEpochMsgsResponseAmino {
  /** msgs is the list of messages queued in the current epoch */
  msgs?: QueuedMessageResponseAmino[];
  /** pagination defines the pagination in the response */
  pagination?: PageResponseAmino;
}
export interface QueryEpochMsgsResponseAminoMsg {
  type: '/babylon.epoching.v1.QueryEpochMsgsResponse';
  value: QueryEpochMsgsResponseAmino;
}
/**
 * QueryEpochMsgsResponse is the response type for the Query/EpochMsgs RPC
 * method
 */
export interface QueryEpochMsgsResponseSDKType {
  msgs: QueuedMessageResponseSDKType[];
  pagination?: PageResponseSDKType;
}
/**
 * QueryLatestEpochMsgsRequest is the request type for the Query/LatestEpochMsgs
 * RPC method it returns epoch msgs within epoch [max(1,
 * end_epoch-epoch_count+1), end_epoch]
 */
export interface QueryLatestEpochMsgsRequest {
  /** end_epoch is the number of the last epoch to query */
  endEpoch: bigint;
  /** epoch_count is the number of epochs to query */
  epochCount: bigint;
  pagination?: PageRequest;
}
export interface QueryLatestEpochMsgsRequestProtoMsg {
  typeUrl: '/babylon.epoching.v1.QueryLatestEpochMsgsRequest';
  value: Uint8Array;
}
/**
 * QueryLatestEpochMsgsRequest is the request type for the Query/LatestEpochMsgs
 * RPC method it returns epoch msgs within epoch [max(1,
 * end_epoch-epoch_count+1), end_epoch]
 */
export interface QueryLatestEpochMsgsRequestAmino {
  /** end_epoch is the number of the last epoch to query */
  end_epoch?: string;
  /** epoch_count is the number of epochs to query */
  epoch_count?: string;
  pagination?: PageRequestAmino;
}
export interface QueryLatestEpochMsgsRequestAminoMsg {
  type: '/babylon.epoching.v1.QueryLatestEpochMsgsRequest';
  value: QueryLatestEpochMsgsRequestAmino;
}
/**
 * QueryLatestEpochMsgsRequest is the request type for the Query/LatestEpochMsgs
 * RPC method it returns epoch msgs within epoch [max(1,
 * end_epoch-epoch_count+1), end_epoch]
 */
export interface QueryLatestEpochMsgsRequestSDKType {
  end_epoch: bigint;
  epoch_count: bigint;
  pagination?: PageRequestSDKType;
}
/**
 * QueryLatestEpochMsgsResponse is the response type for the
 * Query/LatestEpochMsgs RPC method
 */
export interface QueryLatestEpochMsgsResponse {
  /**
   * latest_epoch_msgs is a list of QueuedMessageList
   * each QueuedMessageList has a field identifying the epoch number
   */
  latestEpochMsgs: QueuedMessageList[];
  pagination?: PageResponse;
}
export interface QueryLatestEpochMsgsResponseProtoMsg {
  typeUrl: '/babylon.epoching.v1.QueryLatestEpochMsgsResponse';
  value: Uint8Array;
}
/**
 * QueryLatestEpochMsgsResponse is the response type for the
 * Query/LatestEpochMsgs RPC method
 */
export interface QueryLatestEpochMsgsResponseAmino {
  /**
   * latest_epoch_msgs is a list of QueuedMessageList
   * each QueuedMessageList has a field identifying the epoch number
   */
  latest_epoch_msgs?: QueuedMessageListAmino[];
  pagination?: PageResponseAmino;
}
export interface QueryLatestEpochMsgsResponseAminoMsg {
  type: '/babylon.epoching.v1.QueryLatestEpochMsgsResponse';
  value: QueryLatestEpochMsgsResponseAmino;
}
/**
 * QueryLatestEpochMsgsResponse is the response type for the
 * Query/LatestEpochMsgs RPC method
 */
export interface QueryLatestEpochMsgsResponseSDKType {
  latest_epoch_msgs: QueuedMessageListSDKType[];
  pagination?: PageResponseSDKType;
}
/**
 * QueryValidatorLifecycleRequest is the request type for the
 * Query/ValidatorLifecycle RPC method
 */
export interface QueryValidatorLifecycleRequest {
  valAddr: string;
}
export interface QueryValidatorLifecycleRequestProtoMsg {
  typeUrl: '/babylon.epoching.v1.QueryValidatorLifecycleRequest';
  value: Uint8Array;
}
/**
 * QueryValidatorLifecycleRequest is the request type for the
 * Query/ValidatorLifecycle RPC method
 */
export interface QueryValidatorLifecycleRequestAmino {
  val_addr?: string;
}
export interface QueryValidatorLifecycleRequestAminoMsg {
  type: '/babylon.epoching.v1.QueryValidatorLifecycleRequest';
  value: QueryValidatorLifecycleRequestAmino;
}
/**
 * QueryValidatorLifecycleRequest is the request type for the
 * Query/ValidatorLifecycle RPC method
 */
export interface QueryValidatorLifecycleRequestSDKType {
  val_addr: string;
}
/**
 * QueryValidatorLifecycleResponse is the response type for the
 * Query/ValidatorLifecycle RPC method
 */
export interface QueryValidatorLifecycleResponse {
  valAddr: string;
  valLife: ValStateUpdateResponse[];
}
export interface QueryValidatorLifecycleResponseProtoMsg {
  typeUrl: '/babylon.epoching.v1.QueryValidatorLifecycleResponse';
  value: Uint8Array;
}
/**
 * QueryValidatorLifecycleResponse is the response type for the
 * Query/ValidatorLifecycle RPC method
 */
export interface QueryValidatorLifecycleResponseAmino {
  val_addr?: string;
  val_life?: ValStateUpdateResponseAmino[];
}
export interface QueryValidatorLifecycleResponseAminoMsg {
  type: '/babylon.epoching.v1.QueryValidatorLifecycleResponse';
  value: QueryValidatorLifecycleResponseAmino;
}
/**
 * QueryValidatorLifecycleResponse is the response type for the
 * Query/ValidatorLifecycle RPC method
 */
export interface QueryValidatorLifecycleResponseSDKType {
  val_addr: string;
  val_life: ValStateUpdateResponseSDKType[];
}
/**
 * QueryDelegationLifecycleRequest is the request type for the
 * Query/DelegationLifecycle RPC method
 */
export interface QueryDelegationLifecycleRequest {
  delAddr: string;
}
export interface QueryDelegationLifecycleRequestProtoMsg {
  typeUrl: '/babylon.epoching.v1.QueryDelegationLifecycleRequest';
  value: Uint8Array;
}
/**
 * QueryDelegationLifecycleRequest is the request type for the
 * Query/DelegationLifecycle RPC method
 */
export interface QueryDelegationLifecycleRequestAmino {
  del_addr?: string;
}
export interface QueryDelegationLifecycleRequestAminoMsg {
  type: '/babylon.epoching.v1.QueryDelegationLifecycleRequest';
  value: QueryDelegationLifecycleRequestAmino;
}
/**
 * QueryDelegationLifecycleRequest is the request type for the
 * Query/DelegationLifecycle RPC method
 */
export interface QueryDelegationLifecycleRequestSDKType {
  del_addr: string;
}
/**
 * QueryDelegationLifecycleRequest is the response type for the
 * Query/DelegationLifecycle RPC method
 */
export interface QueryDelegationLifecycleResponse {
  delLife?: DelegationLifecycle;
}
export interface QueryDelegationLifecycleResponseProtoMsg {
  typeUrl: '/babylon.epoching.v1.QueryDelegationLifecycleResponse';
  value: Uint8Array;
}
/**
 * QueryDelegationLifecycleRequest is the response type for the
 * Query/DelegationLifecycle RPC method
 */
export interface QueryDelegationLifecycleResponseAmino {
  del_life?: DelegationLifecycleAmino;
}
export interface QueryDelegationLifecycleResponseAminoMsg {
  type: '/babylon.epoching.v1.QueryDelegationLifecycleResponse';
  value: QueryDelegationLifecycleResponseAmino;
}
/**
 * QueryDelegationLifecycleRequest is the response type for the
 * Query/DelegationLifecycle RPC method
 */
export interface QueryDelegationLifecycleResponseSDKType {
  del_life?: DelegationLifecycleSDKType;
}
/**
 * QueryEpochValSetRequest is the request type for the Query/EpochValSet RPC
 * method
 */
export interface QueryEpochValSetRequest {
  epochNum: bigint;
  pagination?: PageRequest;
}
export interface QueryEpochValSetRequestProtoMsg {
  typeUrl: '/babylon.epoching.v1.QueryEpochValSetRequest';
  value: Uint8Array;
}
/**
 * QueryEpochValSetRequest is the request type for the Query/EpochValSet RPC
 * method
 */
export interface QueryEpochValSetRequestAmino {
  epoch_num?: string;
  pagination?: PageRequestAmino;
}
export interface QueryEpochValSetRequestAminoMsg {
  type: '/babylon.epoching.v1.QueryEpochValSetRequest';
  value: QueryEpochValSetRequestAmino;
}
/**
 * QueryEpochValSetRequest is the request type for the Query/EpochValSet RPC
 * method
 */
export interface QueryEpochValSetRequestSDKType {
  epoch_num: bigint;
  pagination?: PageRequestSDKType;
}
/**
 * QueryEpochValSetRequest is the response type for the Query/EpochValSet RPC
 * method
 */
export interface QueryEpochValSetResponse {
  validators: Validator[];
  totalVotingPower: bigint;
  pagination?: PageResponse;
}
export interface QueryEpochValSetResponseProtoMsg {
  typeUrl: '/babylon.epoching.v1.QueryEpochValSetResponse';
  value: Uint8Array;
}
/**
 * QueryEpochValSetRequest is the response type for the Query/EpochValSet RPC
 * method
 */
export interface QueryEpochValSetResponseAmino {
  validators?: ValidatorAmino[];
  total_voting_power?: string;
  pagination?: PageResponseAmino;
}
export interface QueryEpochValSetResponseAminoMsg {
  type: '/babylon.epoching.v1.QueryEpochValSetResponse';
  value: QueryEpochValSetResponseAmino;
}
/**
 * QueryEpochValSetRequest is the response type for the Query/EpochValSet RPC
 * method
 */
export interface QueryEpochValSetResponseSDKType {
  validators: ValidatorSDKType[];
  total_voting_power: bigint;
  pagination?: PageResponseSDKType;
}
/** EpochResponse is a structure that contains the metadata of an epoch */
export interface EpochResponse {
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
   * of the next epoch as hex string.
   */
  sealerAppHashHex: string;
  /**
   * sealer_block_hash is the hash of the sealer
   * the validator set has generated a BLS multisig on the hash,
   * i.e., hash of the last block in the epoch as hex string.
   */
  sealerBlockHash: string;
}
export interface EpochResponseProtoMsg {
  typeUrl: '/babylon.epoching.v1.EpochResponse';
  value: Uint8Array;
}
/** EpochResponse is a structure that contains the metadata of an epoch */
export interface EpochResponseAmino {
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
   * of the next epoch as hex string.
   */
  sealer_app_hash_hex?: string;
  /**
   * sealer_block_hash is the hash of the sealer
   * the validator set has generated a BLS multisig on the hash,
   * i.e., hash of the last block in the epoch as hex string.
   */
  sealer_block_hash?: string;
}
export interface EpochResponseAminoMsg {
  type: '/babylon.epoching.v1.EpochResponse';
  value: EpochResponseAmino;
}
/** EpochResponse is a structure that contains the metadata of an epoch */
export interface EpochResponseSDKType {
  epoch_number: bigint;
  current_epoch_interval: bigint;
  first_block_height: bigint;
  last_block_time?: Date;
  sealer_app_hash_hex: string;
  sealer_block_hash: string;
}
/**
 * QueuedMessageResponse is a message that can change the validator set and is delayed
 * to the end of an epoch
 */
export interface QueuedMessageResponse {
  /** tx_id is the ID of the tx that contains the message as hex. */
  txId: string;
  /** msg_id is the original message ID, i.e., hash of the marshaled message as hex. */
  msgId: string;
  /** block_height is the height when this msg is submitted to Babylon */
  blockHeight: bigint;
  /** block_time is the timestamp when this msg is submitted to Babylon */
  blockTime?: Date;
  /**
   * msg is the actual message that is sent by a user and is queued by the
   * epoching module as string.
   */
  msg: string;
}
export interface QueuedMessageResponseProtoMsg {
  typeUrl: '/babylon.epoching.v1.QueuedMessageResponse';
  value: Uint8Array;
}
/**
 * QueuedMessageResponse is a message that can change the validator set and is delayed
 * to the end of an epoch
 */
export interface QueuedMessageResponseAmino {
  /** tx_id is the ID of the tx that contains the message as hex. */
  tx_id?: string;
  /** msg_id is the original message ID, i.e., hash of the marshaled message as hex. */
  msg_id?: string;
  /** block_height is the height when this msg is submitted to Babylon */
  block_height?: string;
  /** block_time is the timestamp when this msg is submitted to Babylon */
  block_time?: string;
  /**
   * msg is the actual message that is sent by a user and is queued by the
   * epoching module as string.
   */
  msg?: string;
}
export interface QueuedMessageResponseAminoMsg {
  type: '/babylon.epoching.v1.QueuedMessageResponse';
  value: QueuedMessageResponseAmino;
}
/**
 * QueuedMessageResponse is a message that can change the validator set and is delayed
 * to the end of an epoch
 */
export interface QueuedMessageResponseSDKType {
  tx_id: string;
  msg_id: string;
  block_height: bigint;
  block_time?: Date;
  msg: string;
}
/**
 * QueuedMessageList is a message that contains a list of staking-related
 * messages queued for an epoch
 */
export interface QueuedMessageList {
  epochNumber: bigint;
  msgs: QueuedMessageResponse[];
}
export interface QueuedMessageListProtoMsg {
  typeUrl: '/babylon.epoching.v1.QueuedMessageList';
  value: Uint8Array;
}
/**
 * QueuedMessageList is a message that contains a list of staking-related
 * messages queued for an epoch
 */
export interface QueuedMessageListAmino {
  epoch_number?: string;
  msgs?: QueuedMessageResponseAmino[];
}
export interface QueuedMessageListAminoMsg {
  type: '/babylon.epoching.v1.QueuedMessageList';
  value: QueuedMessageListAmino;
}
/**
 * QueuedMessageList is a message that contains a list of staking-related
 * messages queued for an epoch
 */
export interface QueuedMessageListSDKType {
  epoch_number: bigint;
  msgs: QueuedMessageResponseSDKType[];
}
/** ValStateUpdateResponse is a message response that records a state update of a validator. */
export interface ValStateUpdateResponse {
  /** StateDesc defines the descriptive state. */
  stateDesc: string;
  blockHeight: bigint;
  blockTime?: Date;
}
export interface ValStateUpdateResponseProtoMsg {
  typeUrl: '/babylon.epoching.v1.ValStateUpdateResponse';
  value: Uint8Array;
}
/** ValStateUpdateResponse is a message response that records a state update of a validator. */
export interface ValStateUpdateResponseAmino {
  /** StateDesc defines the descriptive state. */
  state_desc?: string;
  block_height?: string;
  block_time?: string;
}
export interface ValStateUpdateResponseAminoMsg {
  type: '/babylon.epoching.v1.ValStateUpdateResponse';
  value: ValStateUpdateResponseAmino;
}
/** ValStateUpdateResponse is a message response that records a state update of a validator. */
export interface ValStateUpdateResponseSDKType {
  state_desc: string;
  block_height: bigint;
  block_time?: Date;
}
function createBaseQueryParamsRequest(): QueryParamsRequest {
  return {};
}
export const QueryParamsRequest = {
  typeUrl: '/babylon.epoching.v1.QueryParamsRequest',
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
      typeUrl: '/babylon.epoching.v1.QueryParamsRequest',
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
  typeUrl: '/babylon.epoching.v1.QueryParamsResponse',
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
      typeUrl: '/babylon.epoching.v1.QueryParamsResponse',
      value: QueryParamsResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryEpochInfoRequest(): QueryEpochInfoRequest {
  return {
    epochNum: BigInt(0),
  };
}
export const QueryEpochInfoRequest = {
  typeUrl: '/babylon.epoching.v1.QueryEpochInfoRequest',
  encode(message: QueryEpochInfoRequest, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.epochNum !== BigInt(0)) {
      writer.uint32(8).uint64(message.epochNum);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): QueryEpochInfoRequest {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryEpochInfoRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.epochNum = reader.uint64();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<QueryEpochInfoRequest>): QueryEpochInfoRequest {
    const message = createBaseQueryEpochInfoRequest();
    message.epochNum =
      object.epochNum !== undefined && object.epochNum !== null ? BigInt(object.epochNum.toString()) : BigInt(0);
    return message;
  },
  fromAmino(object: QueryEpochInfoRequestAmino): QueryEpochInfoRequest {
    const message = createBaseQueryEpochInfoRequest();
    if (object.epoch_num !== undefined && object.epoch_num !== null) {
      message.epochNum = BigInt(object.epoch_num);
    }
    return message;
  },
  toAmino(message: QueryEpochInfoRequest): QueryEpochInfoRequestAmino {
    const obj: any = {};
    obj.epoch_num = message.epochNum !== BigInt(0) ? message.epochNum?.toString() : undefined;
    return obj;
  },
  fromAminoMsg(object: QueryEpochInfoRequestAminoMsg): QueryEpochInfoRequest {
    return QueryEpochInfoRequest.fromAmino(object.value);
  },
  fromProtoMsg(message: QueryEpochInfoRequestProtoMsg): QueryEpochInfoRequest {
    return QueryEpochInfoRequest.decode(message.value);
  },
  toProto(message: QueryEpochInfoRequest): Uint8Array {
    return QueryEpochInfoRequest.encode(message).finish();
  },
  toProtoMsg(message: QueryEpochInfoRequest): QueryEpochInfoRequestProtoMsg {
    return {
      typeUrl: '/babylon.epoching.v1.QueryEpochInfoRequest',
      value: QueryEpochInfoRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryEpochInfoResponse(): QueryEpochInfoResponse {
  return {
    epoch: undefined,
  };
}
export const QueryEpochInfoResponse = {
  typeUrl: '/babylon.epoching.v1.QueryEpochInfoResponse',
  encode(message: QueryEpochInfoResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.epoch !== undefined) {
      EpochResponse.encode(message.epoch, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): QueryEpochInfoResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryEpochInfoResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.epoch = EpochResponse.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<QueryEpochInfoResponse>): QueryEpochInfoResponse {
    const message = createBaseQueryEpochInfoResponse();
    message.epoch =
      object.epoch !== undefined && object.epoch !== null ? EpochResponse.fromPartial(object.epoch) : undefined;
    return message;
  },
  fromAmino(object: QueryEpochInfoResponseAmino): QueryEpochInfoResponse {
    const message = createBaseQueryEpochInfoResponse();
    if (object.epoch !== undefined && object.epoch !== null) {
      message.epoch = EpochResponse.fromAmino(object.epoch);
    }
    return message;
  },
  toAmino(message: QueryEpochInfoResponse): QueryEpochInfoResponseAmino {
    const obj: any = {};
    obj.epoch = message.epoch ? EpochResponse.toAmino(message.epoch) : undefined;
    return obj;
  },
  fromAminoMsg(object: QueryEpochInfoResponseAminoMsg): QueryEpochInfoResponse {
    return QueryEpochInfoResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: QueryEpochInfoResponseProtoMsg): QueryEpochInfoResponse {
    return QueryEpochInfoResponse.decode(message.value);
  },
  toProto(message: QueryEpochInfoResponse): Uint8Array {
    return QueryEpochInfoResponse.encode(message).finish();
  },
  toProtoMsg(message: QueryEpochInfoResponse): QueryEpochInfoResponseProtoMsg {
    return {
      typeUrl: '/babylon.epoching.v1.QueryEpochInfoResponse',
      value: QueryEpochInfoResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryEpochsInfoRequest(): QueryEpochsInfoRequest {
  return {
    pagination: undefined,
  };
}
export const QueryEpochsInfoRequest = {
  typeUrl: '/babylon.epoching.v1.QueryEpochsInfoRequest',
  encode(message: QueryEpochsInfoRequest, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.pagination !== undefined) {
      PageRequest.encode(message.pagination, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): QueryEpochsInfoRequest {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryEpochsInfoRequest();
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
  fromPartial(object: Partial<QueryEpochsInfoRequest>): QueryEpochsInfoRequest {
    const message = createBaseQueryEpochsInfoRequest();
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageRequest.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromAmino(object: QueryEpochsInfoRequestAmino): QueryEpochsInfoRequest {
    const message = createBaseQueryEpochsInfoRequest();
    if (object.pagination !== undefined && object.pagination !== null) {
      message.pagination = PageRequest.fromAmino(object.pagination);
    }
    return message;
  },
  toAmino(message: QueryEpochsInfoRequest): QueryEpochsInfoRequestAmino {
    const obj: any = {};
    obj.pagination = message.pagination ? PageRequest.toAmino(message.pagination) : undefined;
    return obj;
  },
  fromAminoMsg(object: QueryEpochsInfoRequestAminoMsg): QueryEpochsInfoRequest {
    return QueryEpochsInfoRequest.fromAmino(object.value);
  },
  fromProtoMsg(message: QueryEpochsInfoRequestProtoMsg): QueryEpochsInfoRequest {
    return QueryEpochsInfoRequest.decode(message.value);
  },
  toProto(message: QueryEpochsInfoRequest): Uint8Array {
    return QueryEpochsInfoRequest.encode(message).finish();
  },
  toProtoMsg(message: QueryEpochsInfoRequest): QueryEpochsInfoRequestProtoMsg {
    return {
      typeUrl: '/babylon.epoching.v1.QueryEpochsInfoRequest',
      value: QueryEpochsInfoRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryEpochsInfoResponse(): QueryEpochsInfoResponse {
  return {
    epochs: [],
    pagination: undefined,
  };
}
export const QueryEpochsInfoResponse = {
  typeUrl: '/babylon.epoching.v1.QueryEpochsInfoResponse',
  encode(message: QueryEpochsInfoResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    for (const v of message.epochs) {
      EpochResponse.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    if (message.pagination !== undefined) {
      PageResponse.encode(message.pagination, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): QueryEpochsInfoResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryEpochsInfoResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.epochs.push(EpochResponse.decode(reader, reader.uint32()));
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
  fromPartial(object: Partial<QueryEpochsInfoResponse>): QueryEpochsInfoResponse {
    const message = createBaseQueryEpochsInfoResponse();
    message.epochs = object.epochs?.map((e) => EpochResponse.fromPartial(e)) || [];
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageResponse.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromAmino(object: QueryEpochsInfoResponseAmino): QueryEpochsInfoResponse {
    const message = createBaseQueryEpochsInfoResponse();
    message.epochs = object.epochs?.map((e) => EpochResponse.fromAmino(e)) || [];
    if (object.pagination !== undefined && object.pagination !== null) {
      message.pagination = PageResponse.fromAmino(object.pagination);
    }
    return message;
  },
  toAmino(message: QueryEpochsInfoResponse): QueryEpochsInfoResponseAmino {
    const obj: any = {};
    if (message.epochs) {
      obj.epochs = message.epochs.map((e) => (e ? EpochResponse.toAmino(e) : undefined));
    } else {
      obj.epochs = message.epochs;
    }
    obj.pagination = message.pagination ? PageResponse.toAmino(message.pagination) : undefined;
    return obj;
  },
  fromAminoMsg(object: QueryEpochsInfoResponseAminoMsg): QueryEpochsInfoResponse {
    return QueryEpochsInfoResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: QueryEpochsInfoResponseProtoMsg): QueryEpochsInfoResponse {
    return QueryEpochsInfoResponse.decode(message.value);
  },
  toProto(message: QueryEpochsInfoResponse): Uint8Array {
    return QueryEpochsInfoResponse.encode(message).finish();
  },
  toProtoMsg(message: QueryEpochsInfoResponse): QueryEpochsInfoResponseProtoMsg {
    return {
      typeUrl: '/babylon.epoching.v1.QueryEpochsInfoResponse',
      value: QueryEpochsInfoResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryCurrentEpochRequest(): QueryCurrentEpochRequest {
  return {};
}
export const QueryCurrentEpochRequest = {
  typeUrl: '/babylon.epoching.v1.QueryCurrentEpochRequest',
  encode(_: QueryCurrentEpochRequest, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): QueryCurrentEpochRequest {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryCurrentEpochRequest();
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
  fromPartial(_: Partial<QueryCurrentEpochRequest>): QueryCurrentEpochRequest {
    const message = createBaseQueryCurrentEpochRequest();
    return message;
  },
  fromAmino(_: QueryCurrentEpochRequestAmino): QueryCurrentEpochRequest {
    const message = createBaseQueryCurrentEpochRequest();
    return message;
  },
  toAmino(_: QueryCurrentEpochRequest): QueryCurrentEpochRequestAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: QueryCurrentEpochRequestAminoMsg): QueryCurrentEpochRequest {
    return QueryCurrentEpochRequest.fromAmino(object.value);
  },
  fromProtoMsg(message: QueryCurrentEpochRequestProtoMsg): QueryCurrentEpochRequest {
    return QueryCurrentEpochRequest.decode(message.value);
  },
  toProto(message: QueryCurrentEpochRequest): Uint8Array {
    return QueryCurrentEpochRequest.encode(message).finish();
  },
  toProtoMsg(message: QueryCurrentEpochRequest): QueryCurrentEpochRequestProtoMsg {
    return {
      typeUrl: '/babylon.epoching.v1.QueryCurrentEpochRequest',
      value: QueryCurrentEpochRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryCurrentEpochResponse(): QueryCurrentEpochResponse {
  return {
    currentEpoch: BigInt(0),
    epochBoundary: BigInt(0),
  };
}
export const QueryCurrentEpochResponse = {
  typeUrl: '/babylon.epoching.v1.QueryCurrentEpochResponse',
  encode(message: QueryCurrentEpochResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.currentEpoch !== BigInt(0)) {
      writer.uint32(8).uint64(message.currentEpoch);
    }
    if (message.epochBoundary !== BigInt(0)) {
      writer.uint32(16).uint64(message.epochBoundary);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): QueryCurrentEpochResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryCurrentEpochResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.currentEpoch = reader.uint64();
          break;
        case 2:
          message.epochBoundary = reader.uint64();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<QueryCurrentEpochResponse>): QueryCurrentEpochResponse {
    const message = createBaseQueryCurrentEpochResponse();
    message.currentEpoch =
      object.currentEpoch !== undefined && object.currentEpoch !== null
        ? BigInt(object.currentEpoch.toString())
        : BigInt(0);
    message.epochBoundary =
      object.epochBoundary !== undefined && object.epochBoundary !== null
        ? BigInt(object.epochBoundary.toString())
        : BigInt(0);
    return message;
  },
  fromAmino(object: QueryCurrentEpochResponseAmino): QueryCurrentEpochResponse {
    const message = createBaseQueryCurrentEpochResponse();
    if (object.current_epoch !== undefined && object.current_epoch !== null) {
      message.currentEpoch = BigInt(object.current_epoch);
    }
    if (object.epoch_boundary !== undefined && object.epoch_boundary !== null) {
      message.epochBoundary = BigInt(object.epoch_boundary);
    }
    return message;
  },
  toAmino(message: QueryCurrentEpochResponse): QueryCurrentEpochResponseAmino {
    const obj: any = {};
    obj.current_epoch = message.currentEpoch !== BigInt(0) ? message.currentEpoch?.toString() : undefined;
    obj.epoch_boundary = message.epochBoundary !== BigInt(0) ? message.epochBoundary?.toString() : undefined;
    return obj;
  },
  fromAminoMsg(object: QueryCurrentEpochResponseAminoMsg): QueryCurrentEpochResponse {
    return QueryCurrentEpochResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: QueryCurrentEpochResponseProtoMsg): QueryCurrentEpochResponse {
    return QueryCurrentEpochResponse.decode(message.value);
  },
  toProto(message: QueryCurrentEpochResponse): Uint8Array {
    return QueryCurrentEpochResponse.encode(message).finish();
  },
  toProtoMsg(message: QueryCurrentEpochResponse): QueryCurrentEpochResponseProtoMsg {
    return {
      typeUrl: '/babylon.epoching.v1.QueryCurrentEpochResponse',
      value: QueryCurrentEpochResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryEpochMsgsRequest(): QueryEpochMsgsRequest {
  return {
    epochNum: BigInt(0),
    pagination: undefined,
  };
}
export const QueryEpochMsgsRequest = {
  typeUrl: '/babylon.epoching.v1.QueryEpochMsgsRequest',
  encode(message: QueryEpochMsgsRequest, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.epochNum !== BigInt(0)) {
      writer.uint32(8).uint64(message.epochNum);
    }
    if (message.pagination !== undefined) {
      PageRequest.encode(message.pagination, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): QueryEpochMsgsRequest {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryEpochMsgsRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.epochNum = reader.uint64();
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
  fromPartial(object: Partial<QueryEpochMsgsRequest>): QueryEpochMsgsRequest {
    const message = createBaseQueryEpochMsgsRequest();
    message.epochNum =
      object.epochNum !== undefined && object.epochNum !== null ? BigInt(object.epochNum.toString()) : BigInt(0);
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageRequest.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromAmino(object: QueryEpochMsgsRequestAmino): QueryEpochMsgsRequest {
    const message = createBaseQueryEpochMsgsRequest();
    if (object.epoch_num !== undefined && object.epoch_num !== null) {
      message.epochNum = BigInt(object.epoch_num);
    }
    if (object.pagination !== undefined && object.pagination !== null) {
      message.pagination = PageRequest.fromAmino(object.pagination);
    }
    return message;
  },
  toAmino(message: QueryEpochMsgsRequest): QueryEpochMsgsRequestAmino {
    const obj: any = {};
    obj.epoch_num = message.epochNum !== BigInt(0) ? message.epochNum?.toString() : undefined;
    obj.pagination = message.pagination ? PageRequest.toAmino(message.pagination) : undefined;
    return obj;
  },
  fromAminoMsg(object: QueryEpochMsgsRequestAminoMsg): QueryEpochMsgsRequest {
    return QueryEpochMsgsRequest.fromAmino(object.value);
  },
  fromProtoMsg(message: QueryEpochMsgsRequestProtoMsg): QueryEpochMsgsRequest {
    return QueryEpochMsgsRequest.decode(message.value);
  },
  toProto(message: QueryEpochMsgsRequest): Uint8Array {
    return QueryEpochMsgsRequest.encode(message).finish();
  },
  toProtoMsg(message: QueryEpochMsgsRequest): QueryEpochMsgsRequestProtoMsg {
    return {
      typeUrl: '/babylon.epoching.v1.QueryEpochMsgsRequest',
      value: QueryEpochMsgsRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryEpochMsgsResponse(): QueryEpochMsgsResponse {
  return {
    msgs: [],
    pagination: undefined,
  };
}
export const QueryEpochMsgsResponse = {
  typeUrl: '/babylon.epoching.v1.QueryEpochMsgsResponse',
  encode(message: QueryEpochMsgsResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    for (const v of message.msgs) {
      QueuedMessageResponse.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    if (message.pagination !== undefined) {
      PageResponse.encode(message.pagination, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): QueryEpochMsgsResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryEpochMsgsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.msgs.push(QueuedMessageResponse.decode(reader, reader.uint32()));
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
  fromPartial(object: Partial<QueryEpochMsgsResponse>): QueryEpochMsgsResponse {
    const message = createBaseQueryEpochMsgsResponse();
    message.msgs = object.msgs?.map((e) => QueuedMessageResponse.fromPartial(e)) || [];
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageResponse.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromAmino(object: QueryEpochMsgsResponseAmino): QueryEpochMsgsResponse {
    const message = createBaseQueryEpochMsgsResponse();
    message.msgs = object.msgs?.map((e) => QueuedMessageResponse.fromAmino(e)) || [];
    if (object.pagination !== undefined && object.pagination !== null) {
      message.pagination = PageResponse.fromAmino(object.pagination);
    }
    return message;
  },
  toAmino(message: QueryEpochMsgsResponse): QueryEpochMsgsResponseAmino {
    const obj: any = {};
    if (message.msgs) {
      obj.msgs = message.msgs.map((e) => (e ? QueuedMessageResponse.toAmino(e) : undefined));
    } else {
      obj.msgs = message.msgs;
    }
    obj.pagination = message.pagination ? PageResponse.toAmino(message.pagination) : undefined;
    return obj;
  },
  fromAminoMsg(object: QueryEpochMsgsResponseAminoMsg): QueryEpochMsgsResponse {
    return QueryEpochMsgsResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: QueryEpochMsgsResponseProtoMsg): QueryEpochMsgsResponse {
    return QueryEpochMsgsResponse.decode(message.value);
  },
  toProto(message: QueryEpochMsgsResponse): Uint8Array {
    return QueryEpochMsgsResponse.encode(message).finish();
  },
  toProtoMsg(message: QueryEpochMsgsResponse): QueryEpochMsgsResponseProtoMsg {
    return {
      typeUrl: '/babylon.epoching.v1.QueryEpochMsgsResponse',
      value: QueryEpochMsgsResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryLatestEpochMsgsRequest(): QueryLatestEpochMsgsRequest {
  return {
    endEpoch: BigInt(0),
    epochCount: BigInt(0),
    pagination: undefined,
  };
}
export const QueryLatestEpochMsgsRequest = {
  typeUrl: '/babylon.epoching.v1.QueryLatestEpochMsgsRequest',
  encode(message: QueryLatestEpochMsgsRequest, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.endEpoch !== BigInt(0)) {
      writer.uint32(8).uint64(message.endEpoch);
    }
    if (message.epochCount !== BigInt(0)) {
      writer.uint32(16).uint64(message.epochCount);
    }
    if (message.pagination !== undefined) {
      PageRequest.encode(message.pagination, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): QueryLatestEpochMsgsRequest {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryLatestEpochMsgsRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.endEpoch = reader.uint64();
          break;
        case 2:
          message.epochCount = reader.uint64();
          break;
        case 3:
          message.pagination = PageRequest.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<QueryLatestEpochMsgsRequest>): QueryLatestEpochMsgsRequest {
    const message = createBaseQueryLatestEpochMsgsRequest();
    message.endEpoch =
      object.endEpoch !== undefined && object.endEpoch !== null ? BigInt(object.endEpoch.toString()) : BigInt(0);
    message.epochCount =
      object.epochCount !== undefined && object.epochCount !== null ? BigInt(object.epochCount.toString()) : BigInt(0);
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageRequest.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromAmino(object: QueryLatestEpochMsgsRequestAmino): QueryLatestEpochMsgsRequest {
    const message = createBaseQueryLatestEpochMsgsRequest();
    if (object.end_epoch !== undefined && object.end_epoch !== null) {
      message.endEpoch = BigInt(object.end_epoch);
    }
    if (object.epoch_count !== undefined && object.epoch_count !== null) {
      message.epochCount = BigInt(object.epoch_count);
    }
    if (object.pagination !== undefined && object.pagination !== null) {
      message.pagination = PageRequest.fromAmino(object.pagination);
    }
    return message;
  },
  toAmino(message: QueryLatestEpochMsgsRequest): QueryLatestEpochMsgsRequestAmino {
    const obj: any = {};
    obj.end_epoch = message.endEpoch !== BigInt(0) ? message.endEpoch?.toString() : undefined;
    obj.epoch_count = message.epochCount !== BigInt(0) ? message.epochCount?.toString() : undefined;
    obj.pagination = message.pagination ? PageRequest.toAmino(message.pagination) : undefined;
    return obj;
  },
  fromAminoMsg(object: QueryLatestEpochMsgsRequestAminoMsg): QueryLatestEpochMsgsRequest {
    return QueryLatestEpochMsgsRequest.fromAmino(object.value);
  },
  fromProtoMsg(message: QueryLatestEpochMsgsRequestProtoMsg): QueryLatestEpochMsgsRequest {
    return QueryLatestEpochMsgsRequest.decode(message.value);
  },
  toProto(message: QueryLatestEpochMsgsRequest): Uint8Array {
    return QueryLatestEpochMsgsRequest.encode(message).finish();
  },
  toProtoMsg(message: QueryLatestEpochMsgsRequest): QueryLatestEpochMsgsRequestProtoMsg {
    return {
      typeUrl: '/babylon.epoching.v1.QueryLatestEpochMsgsRequest',
      value: QueryLatestEpochMsgsRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryLatestEpochMsgsResponse(): QueryLatestEpochMsgsResponse {
  return {
    latestEpochMsgs: [],
    pagination: undefined,
  };
}
export const QueryLatestEpochMsgsResponse = {
  typeUrl: '/babylon.epoching.v1.QueryLatestEpochMsgsResponse',
  encode(message: QueryLatestEpochMsgsResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    for (const v of message.latestEpochMsgs) {
      QueuedMessageList.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    if (message.pagination !== undefined) {
      PageResponse.encode(message.pagination, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): QueryLatestEpochMsgsResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryLatestEpochMsgsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.latestEpochMsgs.push(QueuedMessageList.decode(reader, reader.uint32()));
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
  fromPartial(object: Partial<QueryLatestEpochMsgsResponse>): QueryLatestEpochMsgsResponse {
    const message = createBaseQueryLatestEpochMsgsResponse();
    message.latestEpochMsgs = object.latestEpochMsgs?.map((e) => QueuedMessageList.fromPartial(e)) || [];
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageResponse.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromAmino(object: QueryLatestEpochMsgsResponseAmino): QueryLatestEpochMsgsResponse {
    const message = createBaseQueryLatestEpochMsgsResponse();
    message.latestEpochMsgs = object.latest_epoch_msgs?.map((e) => QueuedMessageList.fromAmino(e)) || [];
    if (object.pagination !== undefined && object.pagination !== null) {
      message.pagination = PageResponse.fromAmino(object.pagination);
    }
    return message;
  },
  toAmino(message: QueryLatestEpochMsgsResponse): QueryLatestEpochMsgsResponseAmino {
    const obj: any = {};
    if (message.latestEpochMsgs) {
      obj.latest_epoch_msgs = message.latestEpochMsgs.map((e) => (e ? QueuedMessageList.toAmino(e) : undefined));
    } else {
      obj.latest_epoch_msgs = message.latestEpochMsgs;
    }
    obj.pagination = message.pagination ? PageResponse.toAmino(message.pagination) : undefined;
    return obj;
  },
  fromAminoMsg(object: QueryLatestEpochMsgsResponseAminoMsg): QueryLatestEpochMsgsResponse {
    return QueryLatestEpochMsgsResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: QueryLatestEpochMsgsResponseProtoMsg): QueryLatestEpochMsgsResponse {
    return QueryLatestEpochMsgsResponse.decode(message.value);
  },
  toProto(message: QueryLatestEpochMsgsResponse): Uint8Array {
    return QueryLatestEpochMsgsResponse.encode(message).finish();
  },
  toProtoMsg(message: QueryLatestEpochMsgsResponse): QueryLatestEpochMsgsResponseProtoMsg {
    return {
      typeUrl: '/babylon.epoching.v1.QueryLatestEpochMsgsResponse',
      value: QueryLatestEpochMsgsResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryValidatorLifecycleRequest(): QueryValidatorLifecycleRequest {
  return {
    valAddr: '',
  };
}
export const QueryValidatorLifecycleRequest = {
  typeUrl: '/babylon.epoching.v1.QueryValidatorLifecycleRequest',
  encode(message: QueryValidatorLifecycleRequest, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.valAddr !== '') {
      writer.uint32(10).string(message.valAddr);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): QueryValidatorLifecycleRequest {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryValidatorLifecycleRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.valAddr = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<QueryValidatorLifecycleRequest>): QueryValidatorLifecycleRequest {
    const message = createBaseQueryValidatorLifecycleRequest();
    message.valAddr = object.valAddr ?? '';
    return message;
  },
  fromAmino(object: QueryValidatorLifecycleRequestAmino): QueryValidatorLifecycleRequest {
    const message = createBaseQueryValidatorLifecycleRequest();
    if (object.val_addr !== undefined && object.val_addr !== null) {
      message.valAddr = object.val_addr;
    }
    return message;
  },
  toAmino(message: QueryValidatorLifecycleRequest): QueryValidatorLifecycleRequestAmino {
    const obj: any = {};
    obj.val_addr = message.valAddr === '' ? undefined : message.valAddr;
    return obj;
  },
  fromAminoMsg(object: QueryValidatorLifecycleRequestAminoMsg): QueryValidatorLifecycleRequest {
    return QueryValidatorLifecycleRequest.fromAmino(object.value);
  },
  fromProtoMsg(message: QueryValidatorLifecycleRequestProtoMsg): QueryValidatorLifecycleRequest {
    return QueryValidatorLifecycleRequest.decode(message.value);
  },
  toProto(message: QueryValidatorLifecycleRequest): Uint8Array {
    return QueryValidatorLifecycleRequest.encode(message).finish();
  },
  toProtoMsg(message: QueryValidatorLifecycleRequest): QueryValidatorLifecycleRequestProtoMsg {
    return {
      typeUrl: '/babylon.epoching.v1.QueryValidatorLifecycleRequest',
      value: QueryValidatorLifecycleRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryValidatorLifecycleResponse(): QueryValidatorLifecycleResponse {
  return {
    valAddr: '',
    valLife: [],
  };
}
export const QueryValidatorLifecycleResponse = {
  typeUrl: '/babylon.epoching.v1.QueryValidatorLifecycleResponse',
  encode(message: QueryValidatorLifecycleResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.valAddr !== '') {
      writer.uint32(10).string(message.valAddr);
    }
    for (const v of message.valLife) {
      ValStateUpdateResponse.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): QueryValidatorLifecycleResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryValidatorLifecycleResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.valAddr = reader.string();
          break;
        case 2:
          message.valLife.push(ValStateUpdateResponse.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<QueryValidatorLifecycleResponse>): QueryValidatorLifecycleResponse {
    const message = createBaseQueryValidatorLifecycleResponse();
    message.valAddr = object.valAddr ?? '';
    message.valLife = object.valLife?.map((e) => ValStateUpdateResponse.fromPartial(e)) || [];
    return message;
  },
  fromAmino(object: QueryValidatorLifecycleResponseAmino): QueryValidatorLifecycleResponse {
    const message = createBaseQueryValidatorLifecycleResponse();
    if (object.val_addr !== undefined && object.val_addr !== null) {
      message.valAddr = object.val_addr;
    }
    message.valLife = object.val_life?.map((e) => ValStateUpdateResponse.fromAmino(e)) || [];
    return message;
  },
  toAmino(message: QueryValidatorLifecycleResponse): QueryValidatorLifecycleResponseAmino {
    const obj: any = {};
    obj.val_addr = message.valAddr === '' ? undefined : message.valAddr;
    if (message.valLife) {
      obj.val_life = message.valLife.map((e) => (e ? ValStateUpdateResponse.toAmino(e) : undefined));
    } else {
      obj.val_life = message.valLife;
    }
    return obj;
  },
  fromAminoMsg(object: QueryValidatorLifecycleResponseAminoMsg): QueryValidatorLifecycleResponse {
    return QueryValidatorLifecycleResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: QueryValidatorLifecycleResponseProtoMsg): QueryValidatorLifecycleResponse {
    return QueryValidatorLifecycleResponse.decode(message.value);
  },
  toProto(message: QueryValidatorLifecycleResponse): Uint8Array {
    return QueryValidatorLifecycleResponse.encode(message).finish();
  },
  toProtoMsg(message: QueryValidatorLifecycleResponse): QueryValidatorLifecycleResponseProtoMsg {
    return {
      typeUrl: '/babylon.epoching.v1.QueryValidatorLifecycleResponse',
      value: QueryValidatorLifecycleResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryDelegationLifecycleRequest(): QueryDelegationLifecycleRequest {
  return {
    delAddr: '',
  };
}
export const QueryDelegationLifecycleRequest = {
  typeUrl: '/babylon.epoching.v1.QueryDelegationLifecycleRequest',
  encode(message: QueryDelegationLifecycleRequest, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.delAddr !== '') {
      writer.uint32(10).string(message.delAddr);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): QueryDelegationLifecycleRequest {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryDelegationLifecycleRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.delAddr = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<QueryDelegationLifecycleRequest>): QueryDelegationLifecycleRequest {
    const message = createBaseQueryDelegationLifecycleRequest();
    message.delAddr = object.delAddr ?? '';
    return message;
  },
  fromAmino(object: QueryDelegationLifecycleRequestAmino): QueryDelegationLifecycleRequest {
    const message = createBaseQueryDelegationLifecycleRequest();
    if (object.del_addr !== undefined && object.del_addr !== null) {
      message.delAddr = object.del_addr;
    }
    return message;
  },
  toAmino(message: QueryDelegationLifecycleRequest): QueryDelegationLifecycleRequestAmino {
    const obj: any = {};
    obj.del_addr = message.delAddr === '' ? undefined : message.delAddr;
    return obj;
  },
  fromAminoMsg(object: QueryDelegationLifecycleRequestAminoMsg): QueryDelegationLifecycleRequest {
    return QueryDelegationLifecycleRequest.fromAmino(object.value);
  },
  fromProtoMsg(message: QueryDelegationLifecycleRequestProtoMsg): QueryDelegationLifecycleRequest {
    return QueryDelegationLifecycleRequest.decode(message.value);
  },
  toProto(message: QueryDelegationLifecycleRequest): Uint8Array {
    return QueryDelegationLifecycleRequest.encode(message).finish();
  },
  toProtoMsg(message: QueryDelegationLifecycleRequest): QueryDelegationLifecycleRequestProtoMsg {
    return {
      typeUrl: '/babylon.epoching.v1.QueryDelegationLifecycleRequest',
      value: QueryDelegationLifecycleRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryDelegationLifecycleResponse(): QueryDelegationLifecycleResponse {
  return {
    delLife: undefined,
  };
}
export const QueryDelegationLifecycleResponse = {
  typeUrl: '/babylon.epoching.v1.QueryDelegationLifecycleResponse',
  encode(message: QueryDelegationLifecycleResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.delLife !== undefined) {
      DelegationLifecycle.encode(message.delLife, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): QueryDelegationLifecycleResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryDelegationLifecycleResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.delLife = DelegationLifecycle.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<QueryDelegationLifecycleResponse>): QueryDelegationLifecycleResponse {
    const message = createBaseQueryDelegationLifecycleResponse();
    message.delLife =
      object.delLife !== undefined && object.delLife !== null
        ? DelegationLifecycle.fromPartial(object.delLife)
        : undefined;
    return message;
  },
  fromAmino(object: QueryDelegationLifecycleResponseAmino): QueryDelegationLifecycleResponse {
    const message = createBaseQueryDelegationLifecycleResponse();
    if (object.del_life !== undefined && object.del_life !== null) {
      message.delLife = DelegationLifecycle.fromAmino(object.del_life);
    }
    return message;
  },
  toAmino(message: QueryDelegationLifecycleResponse): QueryDelegationLifecycleResponseAmino {
    const obj: any = {};
    obj.del_life = message.delLife ? DelegationLifecycle.toAmino(message.delLife) : undefined;
    return obj;
  },
  fromAminoMsg(object: QueryDelegationLifecycleResponseAminoMsg): QueryDelegationLifecycleResponse {
    return QueryDelegationLifecycleResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: QueryDelegationLifecycleResponseProtoMsg): QueryDelegationLifecycleResponse {
    return QueryDelegationLifecycleResponse.decode(message.value);
  },
  toProto(message: QueryDelegationLifecycleResponse): Uint8Array {
    return QueryDelegationLifecycleResponse.encode(message).finish();
  },
  toProtoMsg(message: QueryDelegationLifecycleResponse): QueryDelegationLifecycleResponseProtoMsg {
    return {
      typeUrl: '/babylon.epoching.v1.QueryDelegationLifecycleResponse',
      value: QueryDelegationLifecycleResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryEpochValSetRequest(): QueryEpochValSetRequest {
  return {
    epochNum: BigInt(0),
    pagination: undefined,
  };
}
export const QueryEpochValSetRequest = {
  typeUrl: '/babylon.epoching.v1.QueryEpochValSetRequest',
  encode(message: QueryEpochValSetRequest, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.epochNum !== BigInt(0)) {
      writer.uint32(8).uint64(message.epochNum);
    }
    if (message.pagination !== undefined) {
      PageRequest.encode(message.pagination, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): QueryEpochValSetRequest {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryEpochValSetRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.epochNum = reader.uint64();
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
  fromPartial(object: Partial<QueryEpochValSetRequest>): QueryEpochValSetRequest {
    const message = createBaseQueryEpochValSetRequest();
    message.epochNum =
      object.epochNum !== undefined && object.epochNum !== null ? BigInt(object.epochNum.toString()) : BigInt(0);
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageRequest.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromAmino(object: QueryEpochValSetRequestAmino): QueryEpochValSetRequest {
    const message = createBaseQueryEpochValSetRequest();
    if (object.epoch_num !== undefined && object.epoch_num !== null) {
      message.epochNum = BigInt(object.epoch_num);
    }
    if (object.pagination !== undefined && object.pagination !== null) {
      message.pagination = PageRequest.fromAmino(object.pagination);
    }
    return message;
  },
  toAmino(message: QueryEpochValSetRequest): QueryEpochValSetRequestAmino {
    const obj: any = {};
    obj.epoch_num = message.epochNum !== BigInt(0) ? message.epochNum?.toString() : undefined;
    obj.pagination = message.pagination ? PageRequest.toAmino(message.pagination) : undefined;
    return obj;
  },
  fromAminoMsg(object: QueryEpochValSetRequestAminoMsg): QueryEpochValSetRequest {
    return QueryEpochValSetRequest.fromAmino(object.value);
  },
  fromProtoMsg(message: QueryEpochValSetRequestProtoMsg): QueryEpochValSetRequest {
    return QueryEpochValSetRequest.decode(message.value);
  },
  toProto(message: QueryEpochValSetRequest): Uint8Array {
    return QueryEpochValSetRequest.encode(message).finish();
  },
  toProtoMsg(message: QueryEpochValSetRequest): QueryEpochValSetRequestProtoMsg {
    return {
      typeUrl: '/babylon.epoching.v1.QueryEpochValSetRequest',
      value: QueryEpochValSetRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryEpochValSetResponse(): QueryEpochValSetResponse {
  return {
    validators: [],
    totalVotingPower: BigInt(0),
    pagination: undefined,
  };
}
export const QueryEpochValSetResponse = {
  typeUrl: '/babylon.epoching.v1.QueryEpochValSetResponse',
  encode(message: QueryEpochValSetResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    for (const v of message.validators) {
      Validator.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    if (message.totalVotingPower !== BigInt(0)) {
      writer.uint32(16).int64(message.totalVotingPower);
    }
    if (message.pagination !== undefined) {
      PageResponse.encode(message.pagination, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): QueryEpochValSetResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryEpochValSetResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.validators.push(Validator.decode(reader, reader.uint32()));
          break;
        case 2:
          message.totalVotingPower = reader.int64();
          break;
        case 3:
          message.pagination = PageResponse.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<QueryEpochValSetResponse>): QueryEpochValSetResponse {
    const message = createBaseQueryEpochValSetResponse();
    message.validators = object.validators?.map((e) => Validator.fromPartial(e)) || [];
    message.totalVotingPower =
      object.totalVotingPower !== undefined && object.totalVotingPower !== null
        ? BigInt(object.totalVotingPower.toString())
        : BigInt(0);
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageResponse.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromAmino(object: QueryEpochValSetResponseAmino): QueryEpochValSetResponse {
    const message = createBaseQueryEpochValSetResponse();
    message.validators = object.validators?.map((e) => Validator.fromAmino(e)) || [];
    if (object.total_voting_power !== undefined && object.total_voting_power !== null) {
      message.totalVotingPower = BigInt(object.total_voting_power);
    }
    if (object.pagination !== undefined && object.pagination !== null) {
      message.pagination = PageResponse.fromAmino(object.pagination);
    }
    return message;
  },
  toAmino(message: QueryEpochValSetResponse): QueryEpochValSetResponseAmino {
    const obj: any = {};
    if (message.validators) {
      obj.validators = message.validators.map((e) => (e ? Validator.toAmino(e) : undefined));
    } else {
      obj.validators = message.validators;
    }
    obj.total_voting_power = message.totalVotingPower !== BigInt(0) ? message.totalVotingPower?.toString() : undefined;
    obj.pagination = message.pagination ? PageResponse.toAmino(message.pagination) : undefined;
    return obj;
  },
  fromAminoMsg(object: QueryEpochValSetResponseAminoMsg): QueryEpochValSetResponse {
    return QueryEpochValSetResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: QueryEpochValSetResponseProtoMsg): QueryEpochValSetResponse {
    return QueryEpochValSetResponse.decode(message.value);
  },
  toProto(message: QueryEpochValSetResponse): Uint8Array {
    return QueryEpochValSetResponse.encode(message).finish();
  },
  toProtoMsg(message: QueryEpochValSetResponse): QueryEpochValSetResponseProtoMsg {
    return {
      typeUrl: '/babylon.epoching.v1.QueryEpochValSetResponse',
      value: QueryEpochValSetResponse.encode(message).finish(),
    };
  },
};
function createBaseEpochResponse(): EpochResponse {
  return {
    epochNumber: BigInt(0),
    currentEpochInterval: BigInt(0),
    firstBlockHeight: BigInt(0),
    lastBlockTime: undefined,
    sealerAppHashHex: '',
    sealerBlockHash: '',
  };
}
export const EpochResponse = {
  typeUrl: '/babylon.epoching.v1.EpochResponse',
  encode(message: EpochResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
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
    if (message.sealerAppHashHex !== '') {
      writer.uint32(42).string(message.sealerAppHashHex);
    }
    if (message.sealerBlockHash !== '') {
      writer.uint32(50).string(message.sealerBlockHash);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): EpochResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEpochResponse();
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
          message.sealerAppHashHex = reader.string();
          break;
        case 6:
          message.sealerBlockHash = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<EpochResponse>): EpochResponse {
    const message = createBaseEpochResponse();
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
    message.sealerAppHashHex = object.sealerAppHashHex ?? '';
    message.sealerBlockHash = object.sealerBlockHash ?? '';
    return message;
  },
  fromAmino(object: EpochResponseAmino): EpochResponse {
    const message = createBaseEpochResponse();
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
    if (object.sealer_app_hash_hex !== undefined && object.sealer_app_hash_hex !== null) {
      message.sealerAppHashHex = object.sealer_app_hash_hex;
    }
    if (object.sealer_block_hash !== undefined && object.sealer_block_hash !== null) {
      message.sealerBlockHash = object.sealer_block_hash;
    }
    return message;
  },
  toAmino(message: EpochResponse): EpochResponseAmino {
    const obj: any = {};
    obj.epoch_number = message.epochNumber !== BigInt(0) ? message.epochNumber?.toString() : undefined;
    obj.current_epoch_interval =
      message.currentEpochInterval !== BigInt(0) ? message.currentEpochInterval?.toString() : undefined;
    obj.first_block_height = message.firstBlockHeight !== BigInt(0) ? message.firstBlockHeight?.toString() : undefined;
    obj.last_block_time = message.lastBlockTime ? Timestamp.toAmino(toTimestamp(message.lastBlockTime)) : undefined;
    obj.sealer_app_hash_hex = message.sealerAppHashHex === '' ? undefined : message.sealerAppHashHex;
    obj.sealer_block_hash = message.sealerBlockHash === '' ? undefined : message.sealerBlockHash;
    return obj;
  },
  fromAminoMsg(object: EpochResponseAminoMsg): EpochResponse {
    return EpochResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: EpochResponseProtoMsg): EpochResponse {
    return EpochResponse.decode(message.value);
  },
  toProto(message: EpochResponse): Uint8Array {
    return EpochResponse.encode(message).finish();
  },
  toProtoMsg(message: EpochResponse): EpochResponseProtoMsg {
    return {
      typeUrl: '/babylon.epoching.v1.EpochResponse',
      value: EpochResponse.encode(message).finish(),
    };
  },
};
function createBaseQueuedMessageResponse(): QueuedMessageResponse {
  return {
    txId: '',
    msgId: '',
    blockHeight: BigInt(0),
    blockTime: undefined,
    msg: '',
  };
}
export const QueuedMessageResponse = {
  typeUrl: '/babylon.epoching.v1.QueuedMessageResponse',
  encode(message: QueuedMessageResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.txId !== '') {
      writer.uint32(10).string(message.txId);
    }
    if (message.msgId !== '') {
      writer.uint32(18).string(message.msgId);
    }
    if (message.blockHeight !== BigInt(0)) {
      writer.uint32(24).uint64(message.blockHeight);
    }
    if (message.blockTime !== undefined) {
      Timestamp.encode(toTimestamp(message.blockTime), writer.uint32(34).fork()).ldelim();
    }
    if (message.msg !== '') {
      writer.uint32(42).string(message.msg);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): QueuedMessageResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueuedMessageResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.txId = reader.string();
          break;
        case 2:
          message.msgId = reader.string();
          break;
        case 3:
          message.blockHeight = reader.uint64();
          break;
        case 4:
          message.blockTime = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          break;
        case 5:
          message.msg = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<QueuedMessageResponse>): QueuedMessageResponse {
    const message = createBaseQueuedMessageResponse();
    message.txId = object.txId ?? '';
    message.msgId = object.msgId ?? '';
    message.blockHeight =
      object.blockHeight !== undefined && object.blockHeight !== null
        ? BigInt(object.blockHeight.toString())
        : BigInt(0);
    message.blockTime = object.blockTime ?? undefined;
    message.msg = object.msg ?? '';
    return message;
  },
  fromAmino(object: QueuedMessageResponseAmino): QueuedMessageResponse {
    const message = createBaseQueuedMessageResponse();
    if (object.tx_id !== undefined && object.tx_id !== null) {
      message.txId = object.tx_id;
    }
    if (object.msg_id !== undefined && object.msg_id !== null) {
      message.msgId = object.msg_id;
    }
    if (object.block_height !== undefined && object.block_height !== null) {
      message.blockHeight = BigInt(object.block_height);
    }
    if (object.block_time !== undefined && object.block_time !== null) {
      message.blockTime = fromTimestamp(Timestamp.fromAmino(object.block_time));
    }
    if (object.msg !== undefined && object.msg !== null) {
      message.msg = object.msg;
    }
    return message;
  },
  toAmino(message: QueuedMessageResponse): QueuedMessageResponseAmino {
    const obj: any = {};
    obj.tx_id = message.txId === '' ? undefined : message.txId;
    obj.msg_id = message.msgId === '' ? undefined : message.msgId;
    obj.block_height = message.blockHeight !== BigInt(0) ? message.blockHeight?.toString() : undefined;
    obj.block_time = message.blockTime ? Timestamp.toAmino(toTimestamp(message.blockTime)) : undefined;
    obj.msg = message.msg === '' ? undefined : message.msg;
    return obj;
  },
  fromAminoMsg(object: QueuedMessageResponseAminoMsg): QueuedMessageResponse {
    return QueuedMessageResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: QueuedMessageResponseProtoMsg): QueuedMessageResponse {
    return QueuedMessageResponse.decode(message.value);
  },
  toProto(message: QueuedMessageResponse): Uint8Array {
    return QueuedMessageResponse.encode(message).finish();
  },
  toProtoMsg(message: QueuedMessageResponse): QueuedMessageResponseProtoMsg {
    return {
      typeUrl: '/babylon.epoching.v1.QueuedMessageResponse',
      value: QueuedMessageResponse.encode(message).finish(),
    };
  },
};
function createBaseQueuedMessageList(): QueuedMessageList {
  return {
    epochNumber: BigInt(0),
    msgs: [],
  };
}
export const QueuedMessageList = {
  typeUrl: '/babylon.epoching.v1.QueuedMessageList',
  encode(message: QueuedMessageList, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.epochNumber !== BigInt(0)) {
      writer.uint32(8).uint64(message.epochNumber);
    }
    for (const v of message.msgs) {
      QueuedMessageResponse.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): QueuedMessageList {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueuedMessageList();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.epochNumber = reader.uint64();
          break;
        case 2:
          message.msgs.push(QueuedMessageResponse.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<QueuedMessageList>): QueuedMessageList {
    const message = createBaseQueuedMessageList();
    message.epochNumber =
      object.epochNumber !== undefined && object.epochNumber !== null
        ? BigInt(object.epochNumber.toString())
        : BigInt(0);
    message.msgs = object.msgs?.map((e) => QueuedMessageResponse.fromPartial(e)) || [];
    return message;
  },
  fromAmino(object: QueuedMessageListAmino): QueuedMessageList {
    const message = createBaseQueuedMessageList();
    if (object.epoch_number !== undefined && object.epoch_number !== null) {
      message.epochNumber = BigInt(object.epoch_number);
    }
    message.msgs = object.msgs?.map((e) => QueuedMessageResponse.fromAmino(e)) || [];
    return message;
  },
  toAmino(message: QueuedMessageList): QueuedMessageListAmino {
    const obj: any = {};
    obj.epoch_number = message.epochNumber !== BigInt(0) ? message.epochNumber?.toString() : undefined;
    if (message.msgs) {
      obj.msgs = message.msgs.map((e) => (e ? QueuedMessageResponse.toAmino(e) : undefined));
    } else {
      obj.msgs = message.msgs;
    }
    return obj;
  },
  fromAminoMsg(object: QueuedMessageListAminoMsg): QueuedMessageList {
    return QueuedMessageList.fromAmino(object.value);
  },
  fromProtoMsg(message: QueuedMessageListProtoMsg): QueuedMessageList {
    return QueuedMessageList.decode(message.value);
  },
  toProto(message: QueuedMessageList): Uint8Array {
    return QueuedMessageList.encode(message).finish();
  },
  toProtoMsg(message: QueuedMessageList): QueuedMessageListProtoMsg {
    return {
      typeUrl: '/babylon.epoching.v1.QueuedMessageList',
      value: QueuedMessageList.encode(message).finish(),
    };
  },
};
function createBaseValStateUpdateResponse(): ValStateUpdateResponse {
  return {
    stateDesc: '',
    blockHeight: BigInt(0),
    blockTime: undefined,
  };
}
export const ValStateUpdateResponse = {
  typeUrl: '/babylon.epoching.v1.ValStateUpdateResponse',
  encode(message: ValStateUpdateResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.stateDesc !== '') {
      writer.uint32(10).string(message.stateDesc);
    }
    if (message.blockHeight !== BigInt(0)) {
      writer.uint32(16).uint64(message.blockHeight);
    }
    if (message.blockTime !== undefined) {
      Timestamp.encode(toTimestamp(message.blockTime), writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): ValStateUpdateResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseValStateUpdateResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.stateDesc = reader.string();
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
  fromPartial(object: Partial<ValStateUpdateResponse>): ValStateUpdateResponse {
    const message = createBaseValStateUpdateResponse();
    message.stateDesc = object.stateDesc ?? '';
    message.blockHeight =
      object.blockHeight !== undefined && object.blockHeight !== null
        ? BigInt(object.blockHeight.toString())
        : BigInt(0);
    message.blockTime = object.blockTime ?? undefined;
    return message;
  },
  fromAmino(object: ValStateUpdateResponseAmino): ValStateUpdateResponse {
    const message = createBaseValStateUpdateResponse();
    if (object.state_desc !== undefined && object.state_desc !== null) {
      message.stateDesc = object.state_desc;
    }
    if (object.block_height !== undefined && object.block_height !== null) {
      message.blockHeight = BigInt(object.block_height);
    }
    if (object.block_time !== undefined && object.block_time !== null) {
      message.blockTime = fromTimestamp(Timestamp.fromAmino(object.block_time));
    }
    return message;
  },
  toAmino(message: ValStateUpdateResponse): ValStateUpdateResponseAmino {
    const obj: any = {};
    obj.state_desc = message.stateDesc === '' ? undefined : message.stateDesc;
    obj.block_height = message.blockHeight !== BigInt(0) ? message.blockHeight?.toString() : undefined;
    obj.block_time = message.blockTime ? Timestamp.toAmino(toTimestamp(message.blockTime)) : undefined;
    return obj;
  },
  fromAminoMsg(object: ValStateUpdateResponseAminoMsg): ValStateUpdateResponse {
    return ValStateUpdateResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: ValStateUpdateResponseProtoMsg): ValStateUpdateResponse {
    return ValStateUpdateResponse.decode(message.value);
  },
  toProto(message: ValStateUpdateResponse): Uint8Array {
    return ValStateUpdateResponse.encode(message).finish();
  },
  toProtoMsg(message: ValStateUpdateResponse): ValStateUpdateResponseProtoMsg {
    return {
      typeUrl: '/babylon.epoching.v1.ValStateUpdateResponse',
      value: ValStateUpdateResponse.encode(message).finish(),
    };
  },
};
