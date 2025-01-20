import { BinaryReader, BinaryWriter } from '../../../binary';
import { Timestamp } from '../../../google/protobuf/timestamp';
import { base64FromBytes, bytesFromBase64, fromTimestamp, toTimestamp } from '../../../helpers';
import {
  PageRequest,
  PageRequestAmino,
  PageRequestSDKType,
  PageResponse,
  PageResponseAmino,
  PageResponseSDKType,
} from '../../core-proto-ts/cosmos/base/query/v1beta1/pagination';
import { ValidatorWithBlsKey, ValidatorWithBlsKeyAmino, ValidatorWithBlsKeySDKType } from './bls_key';
import { CheckpointStatus } from './checkpoint';
/**
 * QueryRawCheckpointListRequest is the request type for the
 * Query/RawCheckpoints RPC method.
 */
export interface QueryRawCheckpointListRequest {
  /** status defines the status of the raw checkpoints of the query */
  status: CheckpointStatus;
  /** pagination defines an optional pagination for the request. */
  pagination?: PageRequest;
}
export interface QueryRawCheckpointListRequestProtoMsg {
  typeUrl: '/babylon.checkpointing.v1.QueryRawCheckpointListRequest';
  value: Uint8Array;
}
/**
 * QueryRawCheckpointListRequest is the request type for the
 * Query/RawCheckpoints RPC method.
 */
export interface QueryRawCheckpointListRequestAmino {
  /** status defines the status of the raw checkpoints of the query */
  status?: CheckpointStatus;
  /** pagination defines an optional pagination for the request. */
  pagination?: PageRequestAmino;
}
export interface QueryRawCheckpointListRequestAminoMsg {
  type: '/babylon.checkpointing.v1.QueryRawCheckpointListRequest';
  value: QueryRawCheckpointListRequestAmino;
}
/**
 * QueryRawCheckpointListRequest is the request type for the
 * Query/RawCheckpoints RPC method.
 */
export interface QueryRawCheckpointListRequestSDKType {
  status: CheckpointStatus;
  pagination?: PageRequestSDKType;
}
/**
 * QueryRawCheckpointListResponse is the response type for the
 * Query/RawCheckpoints RPC method.
 */
export interface QueryRawCheckpointListResponse {
  /** the order is going from the newest to oldest based on the epoch number */
  rawCheckpoints: RawCheckpointWithMetaResponse[];
  /** pagination defines the pagination in the response. */
  pagination?: PageResponse;
}
export interface QueryRawCheckpointListResponseProtoMsg {
  typeUrl: '/babylon.checkpointing.v1.QueryRawCheckpointListResponse';
  value: Uint8Array;
}
/**
 * QueryRawCheckpointListResponse is the response type for the
 * Query/RawCheckpoints RPC method.
 */
export interface QueryRawCheckpointListResponseAmino {
  /** the order is going from the newest to oldest based on the epoch number */
  raw_checkpoints?: RawCheckpointWithMetaResponseAmino[];
  /** pagination defines the pagination in the response. */
  pagination?: PageResponseAmino;
}
export interface QueryRawCheckpointListResponseAminoMsg {
  type: '/babylon.checkpointing.v1.QueryRawCheckpointListResponse';
  value: QueryRawCheckpointListResponseAmino;
}
/**
 * QueryRawCheckpointListResponse is the response type for the
 * Query/RawCheckpoints RPC method.
 */
export interface QueryRawCheckpointListResponseSDKType {
  raw_checkpoints: RawCheckpointWithMetaResponseSDKType[];
  pagination?: PageResponseSDKType;
}
/**
 * QueryRawCheckpointRequest is the request type for the Query/RawCheckpoint
 * RPC method.
 */
export interface QueryRawCheckpointRequest {
  /** epoch_num defines the epoch for the queried checkpoint */
  epochNum: bigint;
}
export interface QueryRawCheckpointRequestProtoMsg {
  typeUrl: '/babylon.checkpointing.v1.QueryRawCheckpointRequest';
  value: Uint8Array;
}
/**
 * QueryRawCheckpointRequest is the request type for the Query/RawCheckpoint
 * RPC method.
 */
export interface QueryRawCheckpointRequestAmino {
  /** epoch_num defines the epoch for the queried checkpoint */
  epoch_num?: string;
}
export interface QueryRawCheckpointRequestAminoMsg {
  type: '/babylon.checkpointing.v1.QueryRawCheckpointRequest';
  value: QueryRawCheckpointRequestAmino;
}
/**
 * QueryRawCheckpointRequest is the request type for the Query/RawCheckpoint
 * RPC method.
 */
export interface QueryRawCheckpointRequestSDKType {
  epoch_num: bigint;
}
/**
 * QueryRawCheckpointResponse is the response type for the Query/RawCheckpoint
 * RPC method.
 */
export interface QueryRawCheckpointResponse {
  rawCheckpoint?: RawCheckpointWithMetaResponse;
}
export interface QueryRawCheckpointResponseProtoMsg {
  typeUrl: '/babylon.checkpointing.v1.QueryRawCheckpointResponse';
  value: Uint8Array;
}
/**
 * QueryRawCheckpointResponse is the response type for the Query/RawCheckpoint
 * RPC method.
 */
export interface QueryRawCheckpointResponseAmino {
  raw_checkpoint?: RawCheckpointWithMetaResponseAmino;
}
export interface QueryRawCheckpointResponseAminoMsg {
  type: '/babylon.checkpointing.v1.QueryRawCheckpointResponse';
  value: QueryRawCheckpointResponseAmino;
}
/**
 * QueryRawCheckpointResponse is the response type for the Query/RawCheckpoint
 * RPC method.
 */
export interface QueryRawCheckpointResponseSDKType {
  raw_checkpoint?: RawCheckpointWithMetaResponseSDKType;
}
/**
 * QueryRawCheckpointsRequest is the request type for the Query/RawCheckpoints
 * RPC method.
 */
export interface QueryRawCheckpointsRequest {
  /** pagination defines whether to have the pagination in the request */
  pagination?: PageRequest;
}
export interface QueryRawCheckpointsRequestProtoMsg {
  typeUrl: '/babylon.checkpointing.v1.QueryRawCheckpointsRequest';
  value: Uint8Array;
}
/**
 * QueryRawCheckpointsRequest is the request type for the Query/RawCheckpoints
 * RPC method.
 */
export interface QueryRawCheckpointsRequestAmino {
  /** pagination defines whether to have the pagination in the request */
  pagination?: PageRequestAmino;
}
export interface QueryRawCheckpointsRequestAminoMsg {
  type: '/babylon.checkpointing.v1.QueryRawCheckpointsRequest';
  value: QueryRawCheckpointsRequestAmino;
}
/**
 * QueryRawCheckpointsRequest is the request type for the Query/RawCheckpoints
 * RPC method.
 */
export interface QueryRawCheckpointsRequestSDKType {
  pagination?: PageRequestSDKType;
}
/**
 * QueryRawCheckpointsResponse is the response type for the Query/RawCheckpoints
 * RPC method.
 */
export interface QueryRawCheckpointsResponse {
  /** the order is going from the newest to oldest based on the epoch number */
  rawCheckpoints: RawCheckpointWithMetaResponse[];
  /** pagination defines the pagination in the response. */
  pagination?: PageResponse;
}
export interface QueryRawCheckpointsResponseProtoMsg {
  typeUrl: '/babylon.checkpointing.v1.QueryRawCheckpointsResponse';
  value: Uint8Array;
}
/**
 * QueryRawCheckpointsResponse is the response type for the Query/RawCheckpoints
 * RPC method.
 */
export interface QueryRawCheckpointsResponseAmino {
  /** the order is going from the newest to oldest based on the epoch number */
  raw_checkpoints?: RawCheckpointWithMetaResponseAmino[];
  /** pagination defines the pagination in the response. */
  pagination?: PageResponseAmino;
}
export interface QueryRawCheckpointsResponseAminoMsg {
  type: '/babylon.checkpointing.v1.QueryRawCheckpointsResponse';
  value: QueryRawCheckpointsResponseAmino;
}
/**
 * QueryRawCheckpointsResponse is the response type for the Query/RawCheckpoints
 * RPC method.
 */
export interface QueryRawCheckpointsResponseSDKType {
  raw_checkpoints: RawCheckpointWithMetaResponseSDKType[];
  pagination?: PageResponseSDKType;
}
/**
 * QueryBlsPublicKeyListRequest is the request type for the Query/BlsPublicKeys
 * RPC method.
 */
export interface QueryBlsPublicKeyListRequest {
  /** epoch_num defines the epoch for the queried bls public keys */
  epochNum: bigint;
  /** pagination defines an optional pagination for the request. */
  pagination?: PageRequest;
}
export interface QueryBlsPublicKeyListRequestProtoMsg {
  typeUrl: '/babylon.checkpointing.v1.QueryBlsPublicKeyListRequest';
  value: Uint8Array;
}
/**
 * QueryBlsPublicKeyListRequest is the request type for the Query/BlsPublicKeys
 * RPC method.
 */
export interface QueryBlsPublicKeyListRequestAmino {
  /** epoch_num defines the epoch for the queried bls public keys */
  epoch_num?: string;
  /** pagination defines an optional pagination for the request. */
  pagination?: PageRequestAmino;
}
export interface QueryBlsPublicKeyListRequestAminoMsg {
  type: '/babylon.checkpointing.v1.QueryBlsPublicKeyListRequest';
  value: QueryBlsPublicKeyListRequestAmino;
}
/**
 * QueryBlsPublicKeyListRequest is the request type for the Query/BlsPublicKeys
 * RPC method.
 */
export interface QueryBlsPublicKeyListRequestSDKType {
  epoch_num: bigint;
  pagination?: PageRequestSDKType;
}
/**
 * QueryBlsPublicKeyListResponse is the response type for the
 * Query/BlsPublicKeys RPC method.
 */
export interface QueryBlsPublicKeyListResponse {
  validatorWithBlsKeys: ValidatorWithBlsKey[];
  /** pagination defines the pagination in the response. */
  pagination?: PageResponse;
}
export interface QueryBlsPublicKeyListResponseProtoMsg {
  typeUrl: '/babylon.checkpointing.v1.QueryBlsPublicKeyListResponse';
  value: Uint8Array;
}
/**
 * QueryBlsPublicKeyListResponse is the response type for the
 * Query/BlsPublicKeys RPC method.
 */
export interface QueryBlsPublicKeyListResponseAmino {
  validator_with_bls_keys?: ValidatorWithBlsKeyAmino[];
  /** pagination defines the pagination in the response. */
  pagination?: PageResponseAmino;
}
export interface QueryBlsPublicKeyListResponseAminoMsg {
  type: '/babylon.checkpointing.v1.QueryBlsPublicKeyListResponse';
  value: QueryBlsPublicKeyListResponseAmino;
}
/**
 * QueryBlsPublicKeyListResponse is the response type for the
 * Query/BlsPublicKeys RPC method.
 */
export interface QueryBlsPublicKeyListResponseSDKType {
  validator_with_bls_keys: ValidatorWithBlsKeySDKType[];
  pagination?: PageResponseSDKType;
}
/**
 * QueryEpochStatusRequest is the request type for the Query/EpochStatus
 * RPC method.
 */
export interface QueryEpochStatusRequest {
  epochNum: bigint;
}
export interface QueryEpochStatusRequestProtoMsg {
  typeUrl: '/babylon.checkpointing.v1.QueryEpochStatusRequest';
  value: Uint8Array;
}
/**
 * QueryEpochStatusRequest is the request type for the Query/EpochStatus
 * RPC method.
 */
export interface QueryEpochStatusRequestAmino {
  epoch_num?: string;
}
export interface QueryEpochStatusRequestAminoMsg {
  type: '/babylon.checkpointing.v1.QueryEpochStatusRequest';
  value: QueryEpochStatusRequestAmino;
}
/**
 * QueryEpochStatusRequest is the request type for the Query/EpochStatus
 * RPC method.
 */
export interface QueryEpochStatusRequestSDKType {
  epoch_num: bigint;
}
/**
 * QueryEpochStatusResponse is the response type for the Query/EpochStatus
 * RPC method.
 */
export interface QueryEpochStatusResponse {
  status: CheckpointStatus;
}
export interface QueryEpochStatusResponseProtoMsg {
  typeUrl: '/babylon.checkpointing.v1.QueryEpochStatusResponse';
  value: Uint8Array;
}
/**
 * QueryEpochStatusResponse is the response type for the Query/EpochStatus
 * RPC method.
 */
export interface QueryEpochStatusResponseAmino {
  status?: CheckpointStatus;
}
export interface QueryEpochStatusResponseAminoMsg {
  type: '/babylon.checkpointing.v1.QueryEpochStatusResponse';
  value: QueryEpochStatusResponseAmino;
}
/**
 * QueryEpochStatusResponse is the response type for the Query/EpochStatus
 * RPC method.
 */
export interface QueryEpochStatusResponseSDKType {
  status: CheckpointStatus;
}
/**
 * QueryRecentEpochStatusCountRequest is the request type for the
 * Query/EpochStatusCount RPC method.
 */
export interface QueryRecentEpochStatusCountRequest {
  /**
   * epoch_count is the number of the most recent epochs to include in the
   * aggregation
   */
  epochCount: bigint;
}
export interface QueryRecentEpochStatusCountRequestProtoMsg {
  typeUrl: '/babylon.checkpointing.v1.QueryRecentEpochStatusCountRequest';
  value: Uint8Array;
}
/**
 * QueryRecentEpochStatusCountRequest is the request type for the
 * Query/EpochStatusCount RPC method.
 */
export interface QueryRecentEpochStatusCountRequestAmino {
  /**
   * epoch_count is the number of the most recent epochs to include in the
   * aggregation
   */
  epoch_count?: string;
}
export interface QueryRecentEpochStatusCountRequestAminoMsg {
  type: '/babylon.checkpointing.v1.QueryRecentEpochStatusCountRequest';
  value: QueryRecentEpochStatusCountRequestAmino;
}
/**
 * QueryRecentEpochStatusCountRequest is the request type for the
 * Query/EpochStatusCount RPC method.
 */
export interface QueryRecentEpochStatusCountRequestSDKType {
  epoch_count: bigint;
}
export interface QueryRecentEpochStatusCountResponse_StatusCountEntry {
  key: string;
  value: bigint;
}
export interface QueryRecentEpochStatusCountResponse_StatusCountEntryProtoMsg {
  typeUrl: string;
  value: Uint8Array;
}
export interface QueryRecentEpochStatusCountResponse_StatusCountEntryAmino {
  key?: string;
  value?: string;
}
export interface QueryRecentEpochStatusCountResponse_StatusCountEntryAminoMsg {
  type: string;
  value: QueryRecentEpochStatusCountResponse_StatusCountEntryAmino;
}
export interface QueryRecentEpochStatusCountResponse_StatusCountEntrySDKType {
  key: string;
  value: bigint;
}
/**
 * QueryRecentEpochStatusCountResponse is the response type for the
 * Query/EpochStatusCount RPC method.
 */
export interface QueryRecentEpochStatusCountResponse {
  tipEpoch: bigint;
  epochCount: bigint;
  statusCount: {
    [key: string]: bigint;
  };
}
export interface QueryRecentEpochStatusCountResponseProtoMsg {
  typeUrl: '/babylon.checkpointing.v1.QueryRecentEpochStatusCountResponse';
  value: Uint8Array;
}
/**
 * QueryRecentEpochStatusCountResponse is the response type for the
 * Query/EpochStatusCount RPC method.
 */
export interface QueryRecentEpochStatusCountResponseAmino {
  tip_epoch?: string;
  epoch_count?: string;
  status_count?: {
    [key: string]: string;
  };
}
export interface QueryRecentEpochStatusCountResponseAminoMsg {
  type: '/babylon.checkpointing.v1.QueryRecentEpochStatusCountResponse';
  value: QueryRecentEpochStatusCountResponseAmino;
}
/**
 * QueryRecentEpochStatusCountResponse is the response type for the
 * Query/EpochStatusCount RPC method.
 */
export interface QueryRecentEpochStatusCountResponseSDKType {
  tip_epoch: bigint;
  epoch_count: bigint;
  status_count: {
    [key: string]: bigint;
  };
}
/**
 * QueryLastCheckpointWithStatusRequest is the request type for the
 * Query/LastCheckpointWithStatus RPC method.
 */
export interface QueryLastCheckpointWithStatusRequest {
  status: CheckpointStatus;
}
export interface QueryLastCheckpointWithStatusRequestProtoMsg {
  typeUrl: '/babylon.checkpointing.v1.QueryLastCheckpointWithStatusRequest';
  value: Uint8Array;
}
/**
 * QueryLastCheckpointWithStatusRequest is the request type for the
 * Query/LastCheckpointWithStatus RPC method.
 */
export interface QueryLastCheckpointWithStatusRequestAmino {
  status?: CheckpointStatus;
}
export interface QueryLastCheckpointWithStatusRequestAminoMsg {
  type: '/babylon.checkpointing.v1.QueryLastCheckpointWithStatusRequest';
  value: QueryLastCheckpointWithStatusRequestAmino;
}
/**
 * QueryLastCheckpointWithStatusRequest is the request type for the
 * Query/LastCheckpointWithStatus RPC method.
 */
export interface QueryLastCheckpointWithStatusRequestSDKType {
  status: CheckpointStatus;
}
/**
 * QueryLastCheckpointWithStatusResponse is the response type for the
 * Query/LastCheckpointWithStatus RPC method.
 */
export interface QueryLastCheckpointWithStatusResponse {
  rawCheckpoint?: RawCheckpointResponse;
}
export interface QueryLastCheckpointWithStatusResponseProtoMsg {
  typeUrl: '/babylon.checkpointing.v1.QueryLastCheckpointWithStatusResponse';
  value: Uint8Array;
}
/**
 * QueryLastCheckpointWithStatusResponse is the response type for the
 * Query/LastCheckpointWithStatus RPC method.
 */
export interface QueryLastCheckpointWithStatusResponseAmino {
  raw_checkpoint?: RawCheckpointResponseAmino;
}
export interface QueryLastCheckpointWithStatusResponseAminoMsg {
  type: '/babylon.checkpointing.v1.QueryLastCheckpointWithStatusResponse';
  value: QueryLastCheckpointWithStatusResponseAmino;
}
/**
 * QueryLastCheckpointWithStatusResponse is the response type for the
 * Query/LastCheckpointWithStatus RPC method.
 */
export interface QueryLastCheckpointWithStatusResponseSDKType {
  raw_checkpoint?: RawCheckpointResponseSDKType;
}
/** RawCheckpointResponse wraps the BLS multi sig with metadata */
export interface RawCheckpointResponse {
  /** epoch_num defines the epoch number the raw checkpoint is for */
  epochNum: bigint;
  /**
   * block_hash_hex defines the 'BlockID.Hash', which is the hash of
   * the block that individual BLS sigs are signed on as hex string
   */
  blockHashHex: string;
  /** bitmap defines the bitmap that indicates the signers of the BLS multi sig */
  bitmap: Uint8Array;
  /**
   * bls_multi_sig defines the multi sig that is aggregated from individual BLS
   * sigs
   */
  blsMultiSig: Uint8Array;
}
export interface RawCheckpointResponseProtoMsg {
  typeUrl: '/babylon.checkpointing.v1.RawCheckpointResponse';
  value: Uint8Array;
}
/** RawCheckpointResponse wraps the BLS multi sig with metadata */
export interface RawCheckpointResponseAmino {
  /** epoch_num defines the epoch number the raw checkpoint is for */
  epoch_num?: string;
  /**
   * block_hash_hex defines the 'BlockID.Hash', which is the hash of
   * the block that individual BLS sigs are signed on as hex string
   */
  block_hash_hex?: string;
  /** bitmap defines the bitmap that indicates the signers of the BLS multi sig */
  bitmap?: string;
  /**
   * bls_multi_sig defines the multi sig that is aggregated from individual BLS
   * sigs
   */
  bls_multi_sig?: string;
}
export interface RawCheckpointResponseAminoMsg {
  type: '/babylon.checkpointing.v1.RawCheckpointResponse';
  value: RawCheckpointResponseAmino;
}
/** RawCheckpointResponse wraps the BLS multi sig with metadata */
export interface RawCheckpointResponseSDKType {
  epoch_num: bigint;
  block_hash_hex: string;
  bitmap: Uint8Array;
  bls_multi_sig: Uint8Array;
}
/** CheckpointStateUpdateResponse defines a state transition on the checkpoint. */
export interface CheckpointStateUpdateResponse {
  /** state defines the event of a state transition towards this state */
  state: CheckpointStatus;
  /** status_desc respresents the description of status enum. */
  statusDesc: string;
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
export interface CheckpointStateUpdateResponseProtoMsg {
  typeUrl: '/babylon.checkpointing.v1.CheckpointStateUpdateResponse';
  value: Uint8Array;
}
/** CheckpointStateUpdateResponse defines a state transition on the checkpoint. */
export interface CheckpointStateUpdateResponseAmino {
  /** state defines the event of a state transition towards this state */
  state?: CheckpointStatus;
  /** status_desc respresents the description of status enum. */
  status_desc?: string;
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
export interface CheckpointStateUpdateResponseAminoMsg {
  type: '/babylon.checkpointing.v1.CheckpointStateUpdateResponse';
  value: CheckpointStateUpdateResponseAmino;
}
/** CheckpointStateUpdateResponse defines a state transition on the checkpoint. */
export interface CheckpointStateUpdateResponseSDKType {
  state: CheckpointStatus;
  status_desc: string;
  block_height: bigint;
  block_time?: Date;
}
/** RawCheckpointWithMetaResponse wraps the raw checkpoint with metadata. */
export interface RawCheckpointWithMetaResponse {
  ckpt?: RawCheckpointResponse;
  /** status defines the status of the checkpoint */
  status: CheckpointStatus;
  /** status_desc respresents the description of status enum. */
  statusDesc: string;
  /** bls_aggr_pk defines the aggregated BLS public key */
  blsAggrPk: Uint8Array;
  /** power_sum defines the accumulated voting power for the checkpoint */
  powerSum: bigint;
  /**
   * lifecycle defines the lifecycle of this checkpoint, i.e., each state
   * transition and the time (in both timestamp and block height) of this
   * transition.
   */
  lifecycle: CheckpointStateUpdateResponse[];
}
export interface RawCheckpointWithMetaResponseProtoMsg {
  typeUrl: '/babylon.checkpointing.v1.RawCheckpointWithMetaResponse';
  value: Uint8Array;
}
/** RawCheckpointWithMetaResponse wraps the raw checkpoint with metadata. */
export interface RawCheckpointWithMetaResponseAmino {
  ckpt?: RawCheckpointResponseAmino;
  /** status defines the status of the checkpoint */
  status?: CheckpointStatus;
  /** status_desc respresents the description of status enum. */
  status_desc?: string;
  /** bls_aggr_pk defines the aggregated BLS public key */
  bls_aggr_pk?: string;
  /** power_sum defines the accumulated voting power for the checkpoint */
  power_sum?: string;
  /**
   * lifecycle defines the lifecycle of this checkpoint, i.e., each state
   * transition and the time (in both timestamp and block height) of this
   * transition.
   */
  lifecycle?: CheckpointStateUpdateResponseAmino[];
}
export interface RawCheckpointWithMetaResponseAminoMsg {
  type: '/babylon.checkpointing.v1.RawCheckpointWithMetaResponse';
  value: RawCheckpointWithMetaResponseAmino;
}
/** RawCheckpointWithMetaResponse wraps the raw checkpoint with metadata. */
export interface RawCheckpointWithMetaResponseSDKType {
  ckpt?: RawCheckpointResponseSDKType;
  status: CheckpointStatus;
  status_desc: string;
  bls_aggr_pk: Uint8Array;
  power_sum: bigint;
  lifecycle: CheckpointStateUpdateResponseSDKType[];
}
function createBaseQueryRawCheckpointListRequest(): QueryRawCheckpointListRequest {
  return {
    status: 0,
    pagination: undefined,
  };
}
export const QueryRawCheckpointListRequest = {
  typeUrl: '/babylon.checkpointing.v1.QueryRawCheckpointListRequest',
  encode(message: QueryRawCheckpointListRequest, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.status !== 0) {
      writer.uint32(8).int32(message.status);
    }
    if (message.pagination !== undefined) {
      PageRequest.encode(message.pagination, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): QueryRawCheckpointListRequest {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryRawCheckpointListRequest();
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
  fromPartial(object: Partial<QueryRawCheckpointListRequest>): QueryRawCheckpointListRequest {
    const message = createBaseQueryRawCheckpointListRequest();
    message.status = object.status ?? 0;
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageRequest.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromAmino(object: QueryRawCheckpointListRequestAmino): QueryRawCheckpointListRequest {
    const message = createBaseQueryRawCheckpointListRequest();
    if (object.status !== undefined && object.status !== null) {
      message.status = object.status;
    }
    if (object.pagination !== undefined && object.pagination !== null) {
      message.pagination = PageRequest.fromAmino(object.pagination);
    }
    return message;
  },
  toAmino(message: QueryRawCheckpointListRequest): QueryRawCheckpointListRequestAmino {
    const obj: any = {};
    obj.status = message.status === 0 ? undefined : message.status;
    obj.pagination = message.pagination ? PageRequest.toAmino(message.pagination) : undefined;
    return obj;
  },
  fromAminoMsg(object: QueryRawCheckpointListRequestAminoMsg): QueryRawCheckpointListRequest {
    return QueryRawCheckpointListRequest.fromAmino(object.value);
  },
  fromProtoMsg(message: QueryRawCheckpointListRequestProtoMsg): QueryRawCheckpointListRequest {
    return QueryRawCheckpointListRequest.decode(message.value);
  },
  toProto(message: QueryRawCheckpointListRequest): Uint8Array {
    return QueryRawCheckpointListRequest.encode(message).finish();
  },
  toProtoMsg(message: QueryRawCheckpointListRequest): QueryRawCheckpointListRequestProtoMsg {
    return {
      typeUrl: '/babylon.checkpointing.v1.QueryRawCheckpointListRequest',
      value: QueryRawCheckpointListRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryRawCheckpointListResponse(): QueryRawCheckpointListResponse {
  return {
    rawCheckpoints: [],
    pagination: undefined,
  };
}
export const QueryRawCheckpointListResponse = {
  typeUrl: '/babylon.checkpointing.v1.QueryRawCheckpointListResponse',
  encode(message: QueryRawCheckpointListResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    for (const v of message.rawCheckpoints) {
      RawCheckpointWithMetaResponse.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    if (message.pagination !== undefined) {
      PageResponse.encode(message.pagination, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): QueryRawCheckpointListResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryRawCheckpointListResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.rawCheckpoints.push(RawCheckpointWithMetaResponse.decode(reader, reader.uint32()));
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
  fromPartial(object: Partial<QueryRawCheckpointListResponse>): QueryRawCheckpointListResponse {
    const message = createBaseQueryRawCheckpointListResponse();
    message.rawCheckpoints = object.rawCheckpoints?.map((e) => RawCheckpointWithMetaResponse.fromPartial(e)) || [];
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageResponse.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromAmino(object: QueryRawCheckpointListResponseAmino): QueryRawCheckpointListResponse {
    const message = createBaseQueryRawCheckpointListResponse();
    message.rawCheckpoints = object.raw_checkpoints?.map((e) => RawCheckpointWithMetaResponse.fromAmino(e)) || [];
    if (object.pagination !== undefined && object.pagination !== null) {
      message.pagination = PageResponse.fromAmino(object.pagination);
    }
    return message;
  },
  toAmino(message: QueryRawCheckpointListResponse): QueryRawCheckpointListResponseAmino {
    const obj: any = {};
    if (message.rawCheckpoints) {
      obj.raw_checkpoints = message.rawCheckpoints.map((e) =>
        e ? RawCheckpointWithMetaResponse.toAmino(e) : undefined,
      );
    } else {
      obj.raw_checkpoints = message.rawCheckpoints;
    }
    obj.pagination = message.pagination ? PageResponse.toAmino(message.pagination) : undefined;
    return obj;
  },
  fromAminoMsg(object: QueryRawCheckpointListResponseAminoMsg): QueryRawCheckpointListResponse {
    return QueryRawCheckpointListResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: QueryRawCheckpointListResponseProtoMsg): QueryRawCheckpointListResponse {
    return QueryRawCheckpointListResponse.decode(message.value);
  },
  toProto(message: QueryRawCheckpointListResponse): Uint8Array {
    return QueryRawCheckpointListResponse.encode(message).finish();
  },
  toProtoMsg(message: QueryRawCheckpointListResponse): QueryRawCheckpointListResponseProtoMsg {
    return {
      typeUrl: '/babylon.checkpointing.v1.QueryRawCheckpointListResponse',
      value: QueryRawCheckpointListResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryRawCheckpointRequest(): QueryRawCheckpointRequest {
  return {
    epochNum: BigInt(0),
  };
}
export const QueryRawCheckpointRequest = {
  typeUrl: '/babylon.checkpointing.v1.QueryRawCheckpointRequest',
  encode(message: QueryRawCheckpointRequest, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.epochNum !== BigInt(0)) {
      writer.uint32(8).uint64(message.epochNum);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): QueryRawCheckpointRequest {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryRawCheckpointRequest();
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
  fromPartial(object: Partial<QueryRawCheckpointRequest>): QueryRawCheckpointRequest {
    const message = createBaseQueryRawCheckpointRequest();
    message.epochNum =
      object.epochNum !== undefined && object.epochNum !== null ? BigInt(object.epochNum.toString()) : BigInt(0);
    return message;
  },
  fromAmino(object: QueryRawCheckpointRequestAmino): QueryRawCheckpointRequest {
    const message = createBaseQueryRawCheckpointRequest();
    if (object.epoch_num !== undefined && object.epoch_num !== null) {
      message.epochNum = BigInt(object.epoch_num);
    }
    return message;
  },
  toAmino(message: QueryRawCheckpointRequest): QueryRawCheckpointRequestAmino {
    const obj: any = {};
    obj.epoch_num = message.epochNum !== BigInt(0) ? message.epochNum?.toString() : undefined;
    return obj;
  },
  fromAminoMsg(object: QueryRawCheckpointRequestAminoMsg): QueryRawCheckpointRequest {
    return QueryRawCheckpointRequest.fromAmino(object.value);
  },
  fromProtoMsg(message: QueryRawCheckpointRequestProtoMsg): QueryRawCheckpointRequest {
    return QueryRawCheckpointRequest.decode(message.value);
  },
  toProto(message: QueryRawCheckpointRequest): Uint8Array {
    return QueryRawCheckpointRequest.encode(message).finish();
  },
  toProtoMsg(message: QueryRawCheckpointRequest): QueryRawCheckpointRequestProtoMsg {
    return {
      typeUrl: '/babylon.checkpointing.v1.QueryRawCheckpointRequest',
      value: QueryRawCheckpointRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryRawCheckpointResponse(): QueryRawCheckpointResponse {
  return {
    rawCheckpoint: undefined,
  };
}
export const QueryRawCheckpointResponse = {
  typeUrl: '/babylon.checkpointing.v1.QueryRawCheckpointResponse',
  encode(message: QueryRawCheckpointResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.rawCheckpoint !== undefined) {
      RawCheckpointWithMetaResponse.encode(message.rawCheckpoint, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): QueryRawCheckpointResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryRawCheckpointResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.rawCheckpoint = RawCheckpointWithMetaResponse.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<QueryRawCheckpointResponse>): QueryRawCheckpointResponse {
    const message = createBaseQueryRawCheckpointResponse();
    message.rawCheckpoint =
      object.rawCheckpoint !== undefined && object.rawCheckpoint !== null
        ? RawCheckpointWithMetaResponse.fromPartial(object.rawCheckpoint)
        : undefined;
    return message;
  },
  fromAmino(object: QueryRawCheckpointResponseAmino): QueryRawCheckpointResponse {
    const message = createBaseQueryRawCheckpointResponse();
    if (object.raw_checkpoint !== undefined && object.raw_checkpoint !== null) {
      message.rawCheckpoint = RawCheckpointWithMetaResponse.fromAmino(object.raw_checkpoint);
    }
    return message;
  },
  toAmino(message: QueryRawCheckpointResponse): QueryRawCheckpointResponseAmino {
    const obj: any = {};
    obj.raw_checkpoint = message.rawCheckpoint
      ? RawCheckpointWithMetaResponse.toAmino(message.rawCheckpoint)
      : undefined;
    return obj;
  },
  fromAminoMsg(object: QueryRawCheckpointResponseAminoMsg): QueryRawCheckpointResponse {
    return QueryRawCheckpointResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: QueryRawCheckpointResponseProtoMsg): QueryRawCheckpointResponse {
    return QueryRawCheckpointResponse.decode(message.value);
  },
  toProto(message: QueryRawCheckpointResponse): Uint8Array {
    return QueryRawCheckpointResponse.encode(message).finish();
  },
  toProtoMsg(message: QueryRawCheckpointResponse): QueryRawCheckpointResponseProtoMsg {
    return {
      typeUrl: '/babylon.checkpointing.v1.QueryRawCheckpointResponse',
      value: QueryRawCheckpointResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryRawCheckpointsRequest(): QueryRawCheckpointsRequest {
  return {
    pagination: undefined,
  };
}
export const QueryRawCheckpointsRequest = {
  typeUrl: '/babylon.checkpointing.v1.QueryRawCheckpointsRequest',
  encode(message: QueryRawCheckpointsRequest, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.pagination !== undefined) {
      PageRequest.encode(message.pagination, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): QueryRawCheckpointsRequest {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryRawCheckpointsRequest();
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
  fromPartial(object: Partial<QueryRawCheckpointsRequest>): QueryRawCheckpointsRequest {
    const message = createBaseQueryRawCheckpointsRequest();
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageRequest.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromAmino(object: QueryRawCheckpointsRequestAmino): QueryRawCheckpointsRequest {
    const message = createBaseQueryRawCheckpointsRequest();
    if (object.pagination !== undefined && object.pagination !== null) {
      message.pagination = PageRequest.fromAmino(object.pagination);
    }
    return message;
  },
  toAmino(message: QueryRawCheckpointsRequest): QueryRawCheckpointsRequestAmino {
    const obj: any = {};
    obj.pagination = message.pagination ? PageRequest.toAmino(message.pagination) : undefined;
    return obj;
  },
  fromAminoMsg(object: QueryRawCheckpointsRequestAminoMsg): QueryRawCheckpointsRequest {
    return QueryRawCheckpointsRequest.fromAmino(object.value);
  },
  fromProtoMsg(message: QueryRawCheckpointsRequestProtoMsg): QueryRawCheckpointsRequest {
    return QueryRawCheckpointsRequest.decode(message.value);
  },
  toProto(message: QueryRawCheckpointsRequest): Uint8Array {
    return QueryRawCheckpointsRequest.encode(message).finish();
  },
  toProtoMsg(message: QueryRawCheckpointsRequest): QueryRawCheckpointsRequestProtoMsg {
    return {
      typeUrl: '/babylon.checkpointing.v1.QueryRawCheckpointsRequest',
      value: QueryRawCheckpointsRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryRawCheckpointsResponse(): QueryRawCheckpointsResponse {
  return {
    rawCheckpoints: [],
    pagination: undefined,
  };
}
export const QueryRawCheckpointsResponse = {
  typeUrl: '/babylon.checkpointing.v1.QueryRawCheckpointsResponse',
  encode(message: QueryRawCheckpointsResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    for (const v of message.rawCheckpoints) {
      RawCheckpointWithMetaResponse.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    if (message.pagination !== undefined) {
      PageResponse.encode(message.pagination, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): QueryRawCheckpointsResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryRawCheckpointsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.rawCheckpoints.push(RawCheckpointWithMetaResponse.decode(reader, reader.uint32()));
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
  fromPartial(object: Partial<QueryRawCheckpointsResponse>): QueryRawCheckpointsResponse {
    const message = createBaseQueryRawCheckpointsResponse();
    message.rawCheckpoints = object.rawCheckpoints?.map((e) => RawCheckpointWithMetaResponse.fromPartial(e)) || [];
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageResponse.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromAmino(object: QueryRawCheckpointsResponseAmino): QueryRawCheckpointsResponse {
    const message = createBaseQueryRawCheckpointsResponse();
    message.rawCheckpoints = object.raw_checkpoints?.map((e) => RawCheckpointWithMetaResponse.fromAmino(e)) || [];
    if (object.pagination !== undefined && object.pagination !== null) {
      message.pagination = PageResponse.fromAmino(object.pagination);
    }
    return message;
  },
  toAmino(message: QueryRawCheckpointsResponse): QueryRawCheckpointsResponseAmino {
    const obj: any = {};
    if (message.rawCheckpoints) {
      obj.raw_checkpoints = message.rawCheckpoints.map((e) =>
        e ? RawCheckpointWithMetaResponse.toAmino(e) : undefined,
      );
    } else {
      obj.raw_checkpoints = message.rawCheckpoints;
    }
    obj.pagination = message.pagination ? PageResponse.toAmino(message.pagination) : undefined;
    return obj;
  },
  fromAminoMsg(object: QueryRawCheckpointsResponseAminoMsg): QueryRawCheckpointsResponse {
    return QueryRawCheckpointsResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: QueryRawCheckpointsResponseProtoMsg): QueryRawCheckpointsResponse {
    return QueryRawCheckpointsResponse.decode(message.value);
  },
  toProto(message: QueryRawCheckpointsResponse): Uint8Array {
    return QueryRawCheckpointsResponse.encode(message).finish();
  },
  toProtoMsg(message: QueryRawCheckpointsResponse): QueryRawCheckpointsResponseProtoMsg {
    return {
      typeUrl: '/babylon.checkpointing.v1.QueryRawCheckpointsResponse',
      value: QueryRawCheckpointsResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryBlsPublicKeyListRequest(): QueryBlsPublicKeyListRequest {
  return {
    epochNum: BigInt(0),
    pagination: undefined,
  };
}
export const QueryBlsPublicKeyListRequest = {
  typeUrl: '/babylon.checkpointing.v1.QueryBlsPublicKeyListRequest',
  encode(message: QueryBlsPublicKeyListRequest, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.epochNum !== BigInt(0)) {
      writer.uint32(8).uint64(message.epochNum);
    }
    if (message.pagination !== undefined) {
      PageRequest.encode(message.pagination, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): QueryBlsPublicKeyListRequest {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryBlsPublicKeyListRequest();
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
  fromPartial(object: Partial<QueryBlsPublicKeyListRequest>): QueryBlsPublicKeyListRequest {
    const message = createBaseQueryBlsPublicKeyListRequest();
    message.epochNum =
      object.epochNum !== undefined && object.epochNum !== null ? BigInt(object.epochNum.toString()) : BigInt(0);
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageRequest.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromAmino(object: QueryBlsPublicKeyListRequestAmino): QueryBlsPublicKeyListRequest {
    const message = createBaseQueryBlsPublicKeyListRequest();
    if (object.epoch_num !== undefined && object.epoch_num !== null) {
      message.epochNum = BigInt(object.epoch_num);
    }
    if (object.pagination !== undefined && object.pagination !== null) {
      message.pagination = PageRequest.fromAmino(object.pagination);
    }
    return message;
  },
  toAmino(message: QueryBlsPublicKeyListRequest): QueryBlsPublicKeyListRequestAmino {
    const obj: any = {};
    obj.epoch_num = message.epochNum !== BigInt(0) ? message.epochNum?.toString() : undefined;
    obj.pagination = message.pagination ? PageRequest.toAmino(message.pagination) : undefined;
    return obj;
  },
  fromAminoMsg(object: QueryBlsPublicKeyListRequestAminoMsg): QueryBlsPublicKeyListRequest {
    return QueryBlsPublicKeyListRequest.fromAmino(object.value);
  },
  fromProtoMsg(message: QueryBlsPublicKeyListRequestProtoMsg): QueryBlsPublicKeyListRequest {
    return QueryBlsPublicKeyListRequest.decode(message.value);
  },
  toProto(message: QueryBlsPublicKeyListRequest): Uint8Array {
    return QueryBlsPublicKeyListRequest.encode(message).finish();
  },
  toProtoMsg(message: QueryBlsPublicKeyListRequest): QueryBlsPublicKeyListRequestProtoMsg {
    return {
      typeUrl: '/babylon.checkpointing.v1.QueryBlsPublicKeyListRequest',
      value: QueryBlsPublicKeyListRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryBlsPublicKeyListResponse(): QueryBlsPublicKeyListResponse {
  return {
    validatorWithBlsKeys: [],
    pagination: undefined,
  };
}
export const QueryBlsPublicKeyListResponse = {
  typeUrl: '/babylon.checkpointing.v1.QueryBlsPublicKeyListResponse',
  encode(message: QueryBlsPublicKeyListResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    for (const v of message.validatorWithBlsKeys) {
      ValidatorWithBlsKey.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    if (message.pagination !== undefined) {
      PageResponse.encode(message.pagination, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): QueryBlsPublicKeyListResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryBlsPublicKeyListResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.validatorWithBlsKeys.push(ValidatorWithBlsKey.decode(reader, reader.uint32()));
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
  fromPartial(object: Partial<QueryBlsPublicKeyListResponse>): QueryBlsPublicKeyListResponse {
    const message = createBaseQueryBlsPublicKeyListResponse();
    message.validatorWithBlsKeys = object.validatorWithBlsKeys?.map((e) => ValidatorWithBlsKey.fromPartial(e)) || [];
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageResponse.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromAmino(object: QueryBlsPublicKeyListResponseAmino): QueryBlsPublicKeyListResponse {
    const message = createBaseQueryBlsPublicKeyListResponse();
    message.validatorWithBlsKeys = object.validator_with_bls_keys?.map((e) => ValidatorWithBlsKey.fromAmino(e)) || [];
    if (object.pagination !== undefined && object.pagination !== null) {
      message.pagination = PageResponse.fromAmino(object.pagination);
    }
    return message;
  },
  toAmino(message: QueryBlsPublicKeyListResponse): QueryBlsPublicKeyListResponseAmino {
    const obj: any = {};
    if (message.validatorWithBlsKeys) {
      obj.validator_with_bls_keys = message.validatorWithBlsKeys.map((e) =>
        e ? ValidatorWithBlsKey.toAmino(e) : undefined,
      );
    } else {
      obj.validator_with_bls_keys = message.validatorWithBlsKeys;
    }
    obj.pagination = message.pagination ? PageResponse.toAmino(message.pagination) : undefined;
    return obj;
  },
  fromAminoMsg(object: QueryBlsPublicKeyListResponseAminoMsg): QueryBlsPublicKeyListResponse {
    return QueryBlsPublicKeyListResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: QueryBlsPublicKeyListResponseProtoMsg): QueryBlsPublicKeyListResponse {
    return QueryBlsPublicKeyListResponse.decode(message.value);
  },
  toProto(message: QueryBlsPublicKeyListResponse): Uint8Array {
    return QueryBlsPublicKeyListResponse.encode(message).finish();
  },
  toProtoMsg(message: QueryBlsPublicKeyListResponse): QueryBlsPublicKeyListResponseProtoMsg {
    return {
      typeUrl: '/babylon.checkpointing.v1.QueryBlsPublicKeyListResponse',
      value: QueryBlsPublicKeyListResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryEpochStatusRequest(): QueryEpochStatusRequest {
  return {
    epochNum: BigInt(0),
  };
}
export const QueryEpochStatusRequest = {
  typeUrl: '/babylon.checkpointing.v1.QueryEpochStatusRequest',
  encode(message: QueryEpochStatusRequest, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.epochNum !== BigInt(0)) {
      writer.uint32(8).uint64(message.epochNum);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): QueryEpochStatusRequest {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryEpochStatusRequest();
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
  fromPartial(object: Partial<QueryEpochStatusRequest>): QueryEpochStatusRequest {
    const message = createBaseQueryEpochStatusRequest();
    message.epochNum =
      object.epochNum !== undefined && object.epochNum !== null ? BigInt(object.epochNum.toString()) : BigInt(0);
    return message;
  },
  fromAmino(object: QueryEpochStatusRequestAmino): QueryEpochStatusRequest {
    const message = createBaseQueryEpochStatusRequest();
    if (object.epoch_num !== undefined && object.epoch_num !== null) {
      message.epochNum = BigInt(object.epoch_num);
    }
    return message;
  },
  toAmino(message: QueryEpochStatusRequest): QueryEpochStatusRequestAmino {
    const obj: any = {};
    obj.epoch_num = message.epochNum !== BigInt(0) ? message.epochNum?.toString() : undefined;
    return obj;
  },
  fromAminoMsg(object: QueryEpochStatusRequestAminoMsg): QueryEpochStatusRequest {
    return QueryEpochStatusRequest.fromAmino(object.value);
  },
  fromProtoMsg(message: QueryEpochStatusRequestProtoMsg): QueryEpochStatusRequest {
    return QueryEpochStatusRequest.decode(message.value);
  },
  toProto(message: QueryEpochStatusRequest): Uint8Array {
    return QueryEpochStatusRequest.encode(message).finish();
  },
  toProtoMsg(message: QueryEpochStatusRequest): QueryEpochStatusRequestProtoMsg {
    return {
      typeUrl: '/babylon.checkpointing.v1.QueryEpochStatusRequest',
      value: QueryEpochStatusRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryEpochStatusResponse(): QueryEpochStatusResponse {
  return {
    status: 0,
  };
}
export const QueryEpochStatusResponse = {
  typeUrl: '/babylon.checkpointing.v1.QueryEpochStatusResponse',
  encode(message: QueryEpochStatusResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.status !== 0) {
      writer.uint32(8).int32(message.status);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): QueryEpochStatusResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryEpochStatusResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.status = reader.int32() as any;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<QueryEpochStatusResponse>): QueryEpochStatusResponse {
    const message = createBaseQueryEpochStatusResponse();
    message.status = object.status ?? 0;
    return message;
  },
  fromAmino(object: QueryEpochStatusResponseAmino): QueryEpochStatusResponse {
    const message = createBaseQueryEpochStatusResponse();
    if (object.status !== undefined && object.status !== null) {
      message.status = object.status;
    }
    return message;
  },
  toAmino(message: QueryEpochStatusResponse): QueryEpochStatusResponseAmino {
    const obj: any = {};
    obj.status = message.status === 0 ? undefined : message.status;
    return obj;
  },
  fromAminoMsg(object: QueryEpochStatusResponseAminoMsg): QueryEpochStatusResponse {
    return QueryEpochStatusResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: QueryEpochStatusResponseProtoMsg): QueryEpochStatusResponse {
    return QueryEpochStatusResponse.decode(message.value);
  },
  toProto(message: QueryEpochStatusResponse): Uint8Array {
    return QueryEpochStatusResponse.encode(message).finish();
  },
  toProtoMsg(message: QueryEpochStatusResponse): QueryEpochStatusResponseProtoMsg {
    return {
      typeUrl: '/babylon.checkpointing.v1.QueryEpochStatusResponse',
      value: QueryEpochStatusResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryRecentEpochStatusCountRequest(): QueryRecentEpochStatusCountRequest {
  return {
    epochCount: BigInt(0),
  };
}
export const QueryRecentEpochStatusCountRequest = {
  typeUrl: '/babylon.checkpointing.v1.QueryRecentEpochStatusCountRequest',
  encode(message: QueryRecentEpochStatusCountRequest, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.epochCount !== BigInt(0)) {
      writer.uint32(8).uint64(message.epochCount);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): QueryRecentEpochStatusCountRequest {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryRecentEpochStatusCountRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.epochCount = reader.uint64();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<QueryRecentEpochStatusCountRequest>): QueryRecentEpochStatusCountRequest {
    const message = createBaseQueryRecentEpochStatusCountRequest();
    message.epochCount =
      object.epochCount !== undefined && object.epochCount !== null ? BigInt(object.epochCount.toString()) : BigInt(0);
    return message;
  },
  fromAmino(object: QueryRecentEpochStatusCountRequestAmino): QueryRecentEpochStatusCountRequest {
    const message = createBaseQueryRecentEpochStatusCountRequest();
    if (object.epoch_count !== undefined && object.epoch_count !== null) {
      message.epochCount = BigInt(object.epoch_count);
    }
    return message;
  },
  toAmino(message: QueryRecentEpochStatusCountRequest): QueryRecentEpochStatusCountRequestAmino {
    const obj: any = {};
    obj.epoch_count = message.epochCount !== BigInt(0) ? message.epochCount?.toString() : undefined;
    return obj;
  },
  fromAminoMsg(object: QueryRecentEpochStatusCountRequestAminoMsg): QueryRecentEpochStatusCountRequest {
    return QueryRecentEpochStatusCountRequest.fromAmino(object.value);
  },
  fromProtoMsg(message: QueryRecentEpochStatusCountRequestProtoMsg): QueryRecentEpochStatusCountRequest {
    return QueryRecentEpochStatusCountRequest.decode(message.value);
  },
  toProto(message: QueryRecentEpochStatusCountRequest): Uint8Array {
    return QueryRecentEpochStatusCountRequest.encode(message).finish();
  },
  toProtoMsg(message: QueryRecentEpochStatusCountRequest): QueryRecentEpochStatusCountRequestProtoMsg {
    return {
      typeUrl: '/babylon.checkpointing.v1.QueryRecentEpochStatusCountRequest',
      value: QueryRecentEpochStatusCountRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryRecentEpochStatusCountResponse_StatusCountEntry(): QueryRecentEpochStatusCountResponse_StatusCountEntry {
  return {
    key: '',
    value: BigInt(0),
  };
}
export const QueryRecentEpochStatusCountResponse_StatusCountEntry = {
  encode(
    message: QueryRecentEpochStatusCountResponse_StatusCountEntry,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.key !== '') {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== BigInt(0)) {
      writer.uint32(16).uint64(message.value);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): QueryRecentEpochStatusCountResponse_StatusCountEntry {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryRecentEpochStatusCountResponse_StatusCountEntry();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.key = reader.string();
          break;
        case 2:
          message.value = reader.uint64();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<QueryRecentEpochStatusCountResponse_StatusCountEntry>,
  ): QueryRecentEpochStatusCountResponse_StatusCountEntry {
    const message = createBaseQueryRecentEpochStatusCountResponse_StatusCountEntry();
    message.key = object.key ?? '';
    message.value = object.value !== undefined && object.value !== null ? BigInt(object.value.toString()) : BigInt(0);
    return message;
  },
  fromAmino(
    object: QueryRecentEpochStatusCountResponse_StatusCountEntryAmino,
  ): QueryRecentEpochStatusCountResponse_StatusCountEntry {
    const message = createBaseQueryRecentEpochStatusCountResponse_StatusCountEntry();
    if (object.key !== undefined && object.key !== null) {
      message.key = object.key;
    }
    if (object.value !== undefined && object.value !== null) {
      message.value = BigInt(object.value);
    }
    return message;
  },
  toAmino(
    message: QueryRecentEpochStatusCountResponse_StatusCountEntry,
  ): QueryRecentEpochStatusCountResponse_StatusCountEntryAmino {
    const obj: any = {};
    obj.key = message.key === '' ? undefined : message.key;
    obj.value = message.value !== BigInt(0) ? message.value?.toString() : undefined;
    return obj;
  },
  fromAminoMsg(
    object: QueryRecentEpochStatusCountResponse_StatusCountEntryAminoMsg,
  ): QueryRecentEpochStatusCountResponse_StatusCountEntry {
    return QueryRecentEpochStatusCountResponse_StatusCountEntry.fromAmino(object.value);
  },
  fromProtoMsg(
    message: QueryRecentEpochStatusCountResponse_StatusCountEntryProtoMsg,
  ): QueryRecentEpochStatusCountResponse_StatusCountEntry {
    return QueryRecentEpochStatusCountResponse_StatusCountEntry.decode(message.value);
  },
  toProto(message: QueryRecentEpochStatusCountResponse_StatusCountEntry): Uint8Array {
    return QueryRecentEpochStatusCountResponse_StatusCountEntry.encode(message).finish();
  },
};
function createBaseQueryRecentEpochStatusCountResponse(): QueryRecentEpochStatusCountResponse {
  return {
    tipEpoch: BigInt(0),
    epochCount: BigInt(0),
    statusCount: {},
  };
}
export const QueryRecentEpochStatusCountResponse = {
  typeUrl: '/babylon.checkpointing.v1.QueryRecentEpochStatusCountResponse',
  encode(message: QueryRecentEpochStatusCountResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.tipEpoch !== BigInt(0)) {
      writer.uint32(8).uint64(message.tipEpoch);
    }
    if (message.epochCount !== BigInt(0)) {
      writer.uint32(16).uint64(message.epochCount);
    }
    Object.entries(message.statusCount).forEach(([key, value]) => {
      QueryRecentEpochStatusCountResponse_StatusCountEntry.encode(
        {
          key: key as any,
          value,
        },
        writer.uint32(24).fork(),
      ).ldelim();
    });
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): QueryRecentEpochStatusCountResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryRecentEpochStatusCountResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.tipEpoch = reader.uint64();
          break;
        case 2:
          message.epochCount = reader.uint64();
          break;
        case 3: {
          const entry3 = QueryRecentEpochStatusCountResponse_StatusCountEntry.decode(reader, reader.uint32());
          if (entry3.value !== undefined) {
            message.statusCount[entry3.key] = entry3.value;
          }
          break;
        }
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<QueryRecentEpochStatusCountResponse>): QueryRecentEpochStatusCountResponse {
    const message = createBaseQueryRecentEpochStatusCountResponse();
    message.tipEpoch =
      object.tipEpoch !== undefined && object.tipEpoch !== null ? BigInt(object.tipEpoch.toString()) : BigInt(0);
    message.epochCount =
      object.epochCount !== undefined && object.epochCount !== null ? BigInt(object.epochCount.toString()) : BigInt(0);
    message.statusCount = Object.entries(object.statusCount ?? {}).reduce<{
      [key: string]: bigint;
    }>((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = BigInt(value.toString());
      }
      return acc;
    }, {});
    return message;
  },
  fromAmino(object: QueryRecentEpochStatusCountResponseAmino): QueryRecentEpochStatusCountResponse {
    const message = createBaseQueryRecentEpochStatusCountResponse();
    if (object.tip_epoch !== undefined && object.tip_epoch !== null) {
      message.tipEpoch = BigInt(object.tip_epoch);
    }
    if (object.epoch_count !== undefined && object.epoch_count !== null) {
      message.epochCount = BigInt(object.epoch_count);
    }
    message.statusCount = Object.entries(object.status_count ?? {}).reduce<{
      [key: string]: bigint;
    }>((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = BigInt(value.toString());
      }
      return acc;
    }, {});
    return message;
  },
  toAmino(message: QueryRecentEpochStatusCountResponse): QueryRecentEpochStatusCountResponseAmino {
    const obj: any = {};
    obj.tip_epoch = message.tipEpoch !== BigInt(0) ? message.tipEpoch?.toString() : undefined;
    obj.epoch_count = message.epochCount !== BigInt(0) ? message.epochCount?.toString() : undefined;
    obj.status_count = {};
    if (message.statusCount) {
      Object.entries(message.statusCount).forEach(([k, v]) => {
        obj.status_count[k] = v.toString();
      });
    }
    return obj;
  },
  fromAminoMsg(object: QueryRecentEpochStatusCountResponseAminoMsg): QueryRecentEpochStatusCountResponse {
    return QueryRecentEpochStatusCountResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: QueryRecentEpochStatusCountResponseProtoMsg): QueryRecentEpochStatusCountResponse {
    return QueryRecentEpochStatusCountResponse.decode(message.value);
  },
  toProto(message: QueryRecentEpochStatusCountResponse): Uint8Array {
    return QueryRecentEpochStatusCountResponse.encode(message).finish();
  },
  toProtoMsg(message: QueryRecentEpochStatusCountResponse): QueryRecentEpochStatusCountResponseProtoMsg {
    return {
      typeUrl: '/babylon.checkpointing.v1.QueryRecentEpochStatusCountResponse',
      value: QueryRecentEpochStatusCountResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryLastCheckpointWithStatusRequest(): QueryLastCheckpointWithStatusRequest {
  return {
    status: 0,
  };
}
export const QueryLastCheckpointWithStatusRequest = {
  typeUrl: '/babylon.checkpointing.v1.QueryLastCheckpointWithStatusRequest',
  encode(message: QueryLastCheckpointWithStatusRequest, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.status !== 0) {
      writer.uint32(8).int32(message.status);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): QueryLastCheckpointWithStatusRequest {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryLastCheckpointWithStatusRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.status = reader.int32() as any;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<QueryLastCheckpointWithStatusRequest>): QueryLastCheckpointWithStatusRequest {
    const message = createBaseQueryLastCheckpointWithStatusRequest();
    message.status = object.status ?? 0;
    return message;
  },
  fromAmino(object: QueryLastCheckpointWithStatusRequestAmino): QueryLastCheckpointWithStatusRequest {
    const message = createBaseQueryLastCheckpointWithStatusRequest();
    if (object.status !== undefined && object.status !== null) {
      message.status = object.status;
    }
    return message;
  },
  toAmino(message: QueryLastCheckpointWithStatusRequest): QueryLastCheckpointWithStatusRequestAmino {
    const obj: any = {};
    obj.status = message.status === 0 ? undefined : message.status;
    return obj;
  },
  fromAminoMsg(object: QueryLastCheckpointWithStatusRequestAminoMsg): QueryLastCheckpointWithStatusRequest {
    return QueryLastCheckpointWithStatusRequest.fromAmino(object.value);
  },
  fromProtoMsg(message: QueryLastCheckpointWithStatusRequestProtoMsg): QueryLastCheckpointWithStatusRequest {
    return QueryLastCheckpointWithStatusRequest.decode(message.value);
  },
  toProto(message: QueryLastCheckpointWithStatusRequest): Uint8Array {
    return QueryLastCheckpointWithStatusRequest.encode(message).finish();
  },
  toProtoMsg(message: QueryLastCheckpointWithStatusRequest): QueryLastCheckpointWithStatusRequestProtoMsg {
    return {
      typeUrl: '/babylon.checkpointing.v1.QueryLastCheckpointWithStatusRequest',
      value: QueryLastCheckpointWithStatusRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryLastCheckpointWithStatusResponse(): QueryLastCheckpointWithStatusResponse {
  return {
    rawCheckpoint: undefined,
  };
}
export const QueryLastCheckpointWithStatusResponse = {
  typeUrl: '/babylon.checkpointing.v1.QueryLastCheckpointWithStatusResponse',
  encode(message: QueryLastCheckpointWithStatusResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.rawCheckpoint !== undefined) {
      RawCheckpointResponse.encode(message.rawCheckpoint, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): QueryLastCheckpointWithStatusResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryLastCheckpointWithStatusResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.rawCheckpoint = RawCheckpointResponse.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<QueryLastCheckpointWithStatusResponse>): QueryLastCheckpointWithStatusResponse {
    const message = createBaseQueryLastCheckpointWithStatusResponse();
    message.rawCheckpoint =
      object.rawCheckpoint !== undefined && object.rawCheckpoint !== null
        ? RawCheckpointResponse.fromPartial(object.rawCheckpoint)
        : undefined;
    return message;
  },
  fromAmino(object: QueryLastCheckpointWithStatusResponseAmino): QueryLastCheckpointWithStatusResponse {
    const message = createBaseQueryLastCheckpointWithStatusResponse();
    if (object.raw_checkpoint !== undefined && object.raw_checkpoint !== null) {
      message.rawCheckpoint = RawCheckpointResponse.fromAmino(object.raw_checkpoint);
    }
    return message;
  },
  toAmino(message: QueryLastCheckpointWithStatusResponse): QueryLastCheckpointWithStatusResponseAmino {
    const obj: any = {};
    obj.raw_checkpoint = message.rawCheckpoint ? RawCheckpointResponse.toAmino(message.rawCheckpoint) : undefined;
    return obj;
  },
  fromAminoMsg(object: QueryLastCheckpointWithStatusResponseAminoMsg): QueryLastCheckpointWithStatusResponse {
    return QueryLastCheckpointWithStatusResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: QueryLastCheckpointWithStatusResponseProtoMsg): QueryLastCheckpointWithStatusResponse {
    return QueryLastCheckpointWithStatusResponse.decode(message.value);
  },
  toProto(message: QueryLastCheckpointWithStatusResponse): Uint8Array {
    return QueryLastCheckpointWithStatusResponse.encode(message).finish();
  },
  toProtoMsg(message: QueryLastCheckpointWithStatusResponse): QueryLastCheckpointWithStatusResponseProtoMsg {
    return {
      typeUrl: '/babylon.checkpointing.v1.QueryLastCheckpointWithStatusResponse',
      value: QueryLastCheckpointWithStatusResponse.encode(message).finish(),
    };
  },
};
function createBaseRawCheckpointResponse(): RawCheckpointResponse {
  return {
    epochNum: BigInt(0),
    blockHashHex: '',
    bitmap: new Uint8Array(),
    blsMultiSig: new Uint8Array(),
  };
}
export const RawCheckpointResponse = {
  typeUrl: '/babylon.checkpointing.v1.RawCheckpointResponse',
  encode(message: RawCheckpointResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.epochNum !== BigInt(0)) {
      writer.uint32(8).uint64(message.epochNum);
    }
    if (message.blockHashHex !== '') {
      writer.uint32(18).string(message.blockHashHex);
    }
    if (message.bitmap.length !== 0) {
      writer.uint32(26).bytes(message.bitmap);
    }
    if (message.blsMultiSig.length !== 0) {
      writer.uint32(34).bytes(message.blsMultiSig);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): RawCheckpointResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRawCheckpointResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.epochNum = reader.uint64();
          break;
        case 2:
          message.blockHashHex = reader.string();
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
  fromPartial(object: Partial<RawCheckpointResponse>): RawCheckpointResponse {
    const message = createBaseRawCheckpointResponse();
    message.epochNum =
      object.epochNum !== undefined && object.epochNum !== null ? BigInt(object.epochNum.toString()) : BigInt(0);
    message.blockHashHex = object.blockHashHex ?? '';
    message.bitmap = object.bitmap ?? new Uint8Array();
    message.blsMultiSig = object.blsMultiSig ?? new Uint8Array();
    return message;
  },
  fromAmino(object: RawCheckpointResponseAmino): RawCheckpointResponse {
    const message = createBaseRawCheckpointResponse();
    if (object.epoch_num !== undefined && object.epoch_num !== null) {
      message.epochNum = BigInt(object.epoch_num);
    }
    if (object.block_hash_hex !== undefined && object.block_hash_hex !== null) {
      message.blockHashHex = object.block_hash_hex;
    }
    if (object.bitmap !== undefined && object.bitmap !== null) {
      message.bitmap = bytesFromBase64(object.bitmap);
    }
    if (object.bls_multi_sig !== undefined && object.bls_multi_sig !== null) {
      message.blsMultiSig = bytesFromBase64(object.bls_multi_sig);
    }
    return message;
  },
  toAmino(message: RawCheckpointResponse): RawCheckpointResponseAmino {
    const obj: any = {};
    obj.epoch_num = message.epochNum !== BigInt(0) ? message.epochNum?.toString() : undefined;
    obj.block_hash_hex = message.blockHashHex === '' ? undefined : message.blockHashHex;
    obj.bitmap = message.bitmap ? base64FromBytes(message.bitmap) : undefined;
    obj.bls_multi_sig = message.blsMultiSig ? base64FromBytes(message.blsMultiSig) : undefined;
    return obj;
  },
  fromAminoMsg(object: RawCheckpointResponseAminoMsg): RawCheckpointResponse {
    return RawCheckpointResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: RawCheckpointResponseProtoMsg): RawCheckpointResponse {
    return RawCheckpointResponse.decode(message.value);
  },
  toProto(message: RawCheckpointResponse): Uint8Array {
    return RawCheckpointResponse.encode(message).finish();
  },
  toProtoMsg(message: RawCheckpointResponse): RawCheckpointResponseProtoMsg {
    return {
      typeUrl: '/babylon.checkpointing.v1.RawCheckpointResponse',
      value: RawCheckpointResponse.encode(message).finish(),
    };
  },
};
function createBaseCheckpointStateUpdateResponse(): CheckpointStateUpdateResponse {
  return {
    state: 0,
    statusDesc: '',
    blockHeight: BigInt(0),
    blockTime: undefined,
  };
}
export const CheckpointStateUpdateResponse = {
  typeUrl: '/babylon.checkpointing.v1.CheckpointStateUpdateResponse',
  encode(message: CheckpointStateUpdateResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.state !== 0) {
      writer.uint32(8).int32(message.state);
    }
    if (message.statusDesc !== '') {
      writer.uint32(18).string(message.statusDesc);
    }
    if (message.blockHeight !== BigInt(0)) {
      writer.uint32(24).uint64(message.blockHeight);
    }
    if (message.blockTime !== undefined) {
      Timestamp.encode(toTimestamp(message.blockTime), writer.uint32(34).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): CheckpointStateUpdateResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCheckpointStateUpdateResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.state = reader.int32() as any;
          break;
        case 2:
          message.statusDesc = reader.string();
          break;
        case 3:
          message.blockHeight = reader.uint64();
          break;
        case 4:
          message.blockTime = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<CheckpointStateUpdateResponse>): CheckpointStateUpdateResponse {
    const message = createBaseCheckpointStateUpdateResponse();
    message.state = object.state ?? 0;
    message.statusDesc = object.statusDesc ?? '';
    message.blockHeight =
      object.blockHeight !== undefined && object.blockHeight !== null
        ? BigInt(object.blockHeight.toString())
        : BigInt(0);
    message.blockTime = object.blockTime ?? undefined;
    return message;
  },
  fromAmino(object: CheckpointStateUpdateResponseAmino): CheckpointStateUpdateResponse {
    const message = createBaseCheckpointStateUpdateResponse();
    if (object.state !== undefined && object.state !== null) {
      message.state = object.state;
    }
    if (object.status_desc !== undefined && object.status_desc !== null) {
      message.statusDesc = object.status_desc;
    }
    if (object.block_height !== undefined && object.block_height !== null) {
      message.blockHeight = BigInt(object.block_height);
    }
    if (object.block_time !== undefined && object.block_time !== null) {
      message.blockTime = fromTimestamp(Timestamp.fromAmino(object.block_time));
    }
    return message;
  },
  toAmino(message: CheckpointStateUpdateResponse): CheckpointStateUpdateResponseAmino {
    const obj: any = {};
    obj.state = message.state === 0 ? undefined : message.state;
    obj.status_desc = message.statusDesc === '' ? undefined : message.statusDesc;
    obj.block_height = message.blockHeight !== BigInt(0) ? message.blockHeight?.toString() : undefined;
    obj.block_time = message.blockTime ? Timestamp.toAmino(toTimestamp(message.blockTime)) : undefined;
    return obj;
  },
  fromAminoMsg(object: CheckpointStateUpdateResponseAminoMsg): CheckpointStateUpdateResponse {
    return CheckpointStateUpdateResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: CheckpointStateUpdateResponseProtoMsg): CheckpointStateUpdateResponse {
    return CheckpointStateUpdateResponse.decode(message.value);
  },
  toProto(message: CheckpointStateUpdateResponse): Uint8Array {
    return CheckpointStateUpdateResponse.encode(message).finish();
  },
  toProtoMsg(message: CheckpointStateUpdateResponse): CheckpointStateUpdateResponseProtoMsg {
    return {
      typeUrl: '/babylon.checkpointing.v1.CheckpointStateUpdateResponse',
      value: CheckpointStateUpdateResponse.encode(message).finish(),
    };
  },
};
function createBaseRawCheckpointWithMetaResponse(): RawCheckpointWithMetaResponse {
  return {
    ckpt: undefined,
    status: 0,
    statusDesc: '',
    blsAggrPk: new Uint8Array(),
    powerSum: BigInt(0),
    lifecycle: [],
  };
}
export const RawCheckpointWithMetaResponse = {
  typeUrl: '/babylon.checkpointing.v1.RawCheckpointWithMetaResponse',
  encode(message: RawCheckpointWithMetaResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.ckpt !== undefined) {
      RawCheckpointResponse.encode(message.ckpt, writer.uint32(10).fork()).ldelim();
    }
    if (message.status !== 0) {
      writer.uint32(16).int32(message.status);
    }
    if (message.statusDesc !== '') {
      writer.uint32(26).string(message.statusDesc);
    }
    if (message.blsAggrPk.length !== 0) {
      writer.uint32(34).bytes(message.blsAggrPk);
    }
    if (message.powerSum !== BigInt(0)) {
      writer.uint32(40).uint64(message.powerSum);
    }
    for (const v of message.lifecycle) {
      CheckpointStateUpdateResponse.encode(v!, writer.uint32(50).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): RawCheckpointWithMetaResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRawCheckpointWithMetaResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.ckpt = RawCheckpointResponse.decode(reader, reader.uint32());
          break;
        case 2:
          message.status = reader.int32() as any;
          break;
        case 3:
          message.statusDesc = reader.string();
          break;
        case 4:
          message.blsAggrPk = reader.bytes();
          break;
        case 5:
          message.powerSum = reader.uint64();
          break;
        case 6:
          message.lifecycle.push(CheckpointStateUpdateResponse.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<RawCheckpointWithMetaResponse>): RawCheckpointWithMetaResponse {
    const message = createBaseRawCheckpointWithMetaResponse();
    message.ckpt =
      object.ckpt !== undefined && object.ckpt !== null ? RawCheckpointResponse.fromPartial(object.ckpt) : undefined;
    message.status = object.status ?? 0;
    message.statusDesc = object.statusDesc ?? '';
    message.blsAggrPk = object.blsAggrPk ?? new Uint8Array();
    message.powerSum =
      object.powerSum !== undefined && object.powerSum !== null ? BigInt(object.powerSum.toString()) : BigInt(0);
    message.lifecycle = object.lifecycle?.map((e) => CheckpointStateUpdateResponse.fromPartial(e)) || [];
    return message;
  },
  fromAmino(object: RawCheckpointWithMetaResponseAmino): RawCheckpointWithMetaResponse {
    const message = createBaseRawCheckpointWithMetaResponse();
    if (object.ckpt !== undefined && object.ckpt !== null) {
      message.ckpt = RawCheckpointResponse.fromAmino(object.ckpt);
    }
    if (object.status !== undefined && object.status !== null) {
      message.status = object.status;
    }
    if (object.status_desc !== undefined && object.status_desc !== null) {
      message.statusDesc = object.status_desc;
    }
    if (object.bls_aggr_pk !== undefined && object.bls_aggr_pk !== null) {
      message.blsAggrPk = bytesFromBase64(object.bls_aggr_pk);
    }
    if (object.power_sum !== undefined && object.power_sum !== null) {
      message.powerSum = BigInt(object.power_sum);
    }
    message.lifecycle = object.lifecycle?.map((e) => CheckpointStateUpdateResponse.fromAmino(e)) || [];
    return message;
  },
  toAmino(message: RawCheckpointWithMetaResponse): RawCheckpointWithMetaResponseAmino {
    const obj: any = {};
    obj.ckpt = message.ckpt ? RawCheckpointResponse.toAmino(message.ckpt) : undefined;
    obj.status = message.status === 0 ? undefined : message.status;
    obj.status_desc = message.statusDesc === '' ? undefined : message.statusDesc;
    obj.bls_aggr_pk = message.blsAggrPk ? base64FromBytes(message.blsAggrPk) : undefined;
    obj.power_sum = message.powerSum !== BigInt(0) ? message.powerSum?.toString() : undefined;
    if (message.lifecycle) {
      obj.lifecycle = message.lifecycle.map((e) => (e ? CheckpointStateUpdateResponse.toAmino(e) : undefined));
    } else {
      obj.lifecycle = message.lifecycle;
    }
    return obj;
  },
  fromAminoMsg(object: RawCheckpointWithMetaResponseAminoMsg): RawCheckpointWithMetaResponse {
    return RawCheckpointWithMetaResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: RawCheckpointWithMetaResponseProtoMsg): RawCheckpointWithMetaResponse {
    return RawCheckpointWithMetaResponse.decode(message.value);
  },
  toProto(message: RawCheckpointWithMetaResponse): Uint8Array {
    return RawCheckpointWithMetaResponse.encode(message).finish();
  },
  toProtoMsg(message: RawCheckpointWithMetaResponse): RawCheckpointWithMetaResponseProtoMsg {
    return {
      typeUrl: '/babylon.checkpointing.v1.RawCheckpointWithMetaResponse',
      value: RawCheckpointWithMetaResponse.encode(message).finish(),
    };
  },
};
