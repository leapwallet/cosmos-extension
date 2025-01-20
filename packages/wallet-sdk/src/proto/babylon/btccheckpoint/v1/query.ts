import { BinaryReader, BinaryWriter } from '../../../binary';
import {
  PageRequest,
  PageRequestAmino,
  PageRequestSDKType,
  PageResponse,
  PageResponseAmino,
  PageResponseSDKType,
} from '../../core-proto-ts/cosmos/base/query/v1beta1/pagination';
import { Params, ParamsAmino, ParamsSDKType } from './params';
/** QueryParamsRequest is request type for the Query/Params RPC method. */
export interface QueryParamsRequest {}
export interface QueryParamsRequestProtoMsg {
  typeUrl: '/babylon.btccheckpoint.v1.QueryParamsRequest';
  value: Uint8Array;
}
/** QueryParamsRequest is request type for the Query/Params RPC method. */
export interface QueryParamsRequestAmino {}
export interface QueryParamsRequestAminoMsg {
  type: '/babylon.btccheckpoint.v1.QueryParamsRequest';
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
  typeUrl: '/babylon.btccheckpoint.v1.QueryParamsResponse';
  value: Uint8Array;
}
/** QueryParamsResponse is response type for the Query/Params RPC method. */
export interface QueryParamsResponseAmino {
  /** params holds all the parameters of this module. */
  params?: ParamsAmino;
}
export interface QueryParamsResponseAminoMsg {
  type: '/babylon.btccheckpoint.v1.QueryParamsResponse';
  value: QueryParamsResponseAmino;
}
/** QueryParamsResponse is response type for the Query/Params RPC method. */
export interface QueryParamsResponseSDKType {
  params: ParamsSDKType;
}
/**
 * QueryBtcCheckpointInfoRequest defines the query to get the best checkpoint
 * for a given epoch
 */
export interface QueryBtcCheckpointInfoRequest {
  /**
   * Number of epoch for which the earliest checkpointing btc height is
   * requested
   */
  epochNum: bigint;
}
export interface QueryBtcCheckpointInfoRequestProtoMsg {
  typeUrl: '/babylon.btccheckpoint.v1.QueryBtcCheckpointInfoRequest';
  value: Uint8Array;
}
/**
 * QueryBtcCheckpointInfoRequest defines the query to get the best checkpoint
 * for a given epoch
 */
export interface QueryBtcCheckpointInfoRequestAmino {
  /**
   * Number of epoch for which the earliest checkpointing btc height is
   * requested
   */
  epoch_num?: string;
}
export interface QueryBtcCheckpointInfoRequestAminoMsg {
  type: '/babylon.btccheckpoint.v1.QueryBtcCheckpointInfoRequest';
  value: QueryBtcCheckpointInfoRequestAmino;
}
/**
 * QueryBtcCheckpointInfoRequest defines the query to get the best checkpoint
 * for a given epoch
 */
export interface QueryBtcCheckpointInfoRequestSDKType {
  epoch_num: bigint;
}
/**
 * QueryBtcCheckpointInfoResponse is response type for the
 * Query/BtcCheckpointInfo RPC method
 */
export interface QueryBtcCheckpointInfoResponse {
  info?: BTCCheckpointInfoResponse;
}
export interface QueryBtcCheckpointInfoResponseProtoMsg {
  typeUrl: '/babylon.btccheckpoint.v1.QueryBtcCheckpointInfoResponse';
  value: Uint8Array;
}
/**
 * QueryBtcCheckpointInfoResponse is response type for the
 * Query/BtcCheckpointInfo RPC method
 */
export interface QueryBtcCheckpointInfoResponseAmino {
  info?: BTCCheckpointInfoResponseAmino;
}
export interface QueryBtcCheckpointInfoResponseAminoMsg {
  type: '/babylon.btccheckpoint.v1.QueryBtcCheckpointInfoResponse';
  value: QueryBtcCheckpointInfoResponseAmino;
}
/**
 * QueryBtcCheckpointInfoResponse is response type for the
 * Query/BtcCheckpointInfo RPC method
 */
export interface QueryBtcCheckpointInfoResponseSDKType {
  info?: BTCCheckpointInfoResponseSDKType;
}
/**
 * QueryBtcCheckpointsInfoRequest is request type for the
 * Query/BtcCheckpointsInfo RPC method
 */
export interface QueryBtcCheckpointsInfoRequest {
  /** pagination defines whether to have the pagination in the request */
  pagination?: PageRequest;
}
export interface QueryBtcCheckpointsInfoRequestProtoMsg {
  typeUrl: '/babylon.btccheckpoint.v1.QueryBtcCheckpointsInfoRequest';
  value: Uint8Array;
}
/**
 * QueryBtcCheckpointsInfoRequest is request type for the
 * Query/BtcCheckpointsInfo RPC method
 */
export interface QueryBtcCheckpointsInfoRequestAmino {
  /** pagination defines whether to have the pagination in the request */
  pagination?: PageRequestAmino;
}
export interface QueryBtcCheckpointsInfoRequestAminoMsg {
  type: '/babylon.btccheckpoint.v1.QueryBtcCheckpointsInfoRequest';
  value: QueryBtcCheckpointsInfoRequestAmino;
}
/**
 * QueryBtcCheckpointsInfoRequest is request type for the
 * Query/BtcCheckpointsInfo RPC method
 */
export interface QueryBtcCheckpointsInfoRequestSDKType {
  pagination?: PageRequestSDKType;
}
/**
 * QueryBtcCheckpointsInfoResponse is response type for the
 * Query/BtcCheckpointsInfo RPC method
 */
export interface QueryBtcCheckpointsInfoResponse {
  infoList: BTCCheckpointInfoResponse[];
  /** pagination defines the pagination in the response */
  pagination?: PageResponse;
}
export interface QueryBtcCheckpointsInfoResponseProtoMsg {
  typeUrl: '/babylon.btccheckpoint.v1.QueryBtcCheckpointsInfoResponse';
  value: Uint8Array;
}
/**
 * QueryBtcCheckpointsInfoResponse is response type for the
 * Query/BtcCheckpointsInfo RPC method
 */
export interface QueryBtcCheckpointsInfoResponseAmino {
  info_list?: BTCCheckpointInfoResponseAmino[];
  /** pagination defines the pagination in the response */
  pagination?: PageResponseAmino;
}
export interface QueryBtcCheckpointsInfoResponseAminoMsg {
  type: '/babylon.btccheckpoint.v1.QueryBtcCheckpointsInfoResponse';
  value: QueryBtcCheckpointsInfoResponseAmino;
}
/**
 * QueryBtcCheckpointsInfoResponse is response type for the
 * Query/BtcCheckpointsInfo RPC method
 */
export interface QueryBtcCheckpointsInfoResponseSDKType {
  info_list: BTCCheckpointInfoResponseSDKType[];
  pagination?: PageResponseSDKType;
}
/**
 * QueryEpochSubmissionsRequest defines a request to get all submissions in
 * given epoch
 */
export interface QueryEpochSubmissionsRequest {
  /** Number of epoch for which submissions are requested */
  epochNum: bigint;
}
export interface QueryEpochSubmissionsRequestProtoMsg {
  typeUrl: '/babylon.btccheckpoint.v1.QueryEpochSubmissionsRequest';
  value: Uint8Array;
}
/**
 * QueryEpochSubmissionsRequest defines a request to get all submissions in
 * given epoch
 */
export interface QueryEpochSubmissionsRequestAmino {
  /** Number of epoch for which submissions are requested */
  epoch_num?: string;
}
export interface QueryEpochSubmissionsRequestAminoMsg {
  type: '/babylon.btccheckpoint.v1.QueryEpochSubmissionsRequest';
  value: QueryEpochSubmissionsRequestAmino;
}
/**
 * QueryEpochSubmissionsRequest defines a request to get all submissions in
 * given epoch
 */
export interface QueryEpochSubmissionsRequestSDKType {
  epoch_num: bigint;
}
/**
 * QueryEpochSubmissionsResponse defines a response to get all submissions in
 * given epoch (QueryEpochSubmissionsRequest)
 */
export interface QueryEpochSubmissionsResponse {
  /** Keys All submissions transactions key saved during an epoch. */
  keys: SubmissionKeyResponse[];
}
export interface QueryEpochSubmissionsResponseProtoMsg {
  typeUrl: '/babylon.btccheckpoint.v1.QueryEpochSubmissionsResponse';
  value: Uint8Array;
}
/**
 * QueryEpochSubmissionsResponse defines a response to get all submissions in
 * given epoch (QueryEpochSubmissionsRequest)
 */
export interface QueryEpochSubmissionsResponseAmino {
  /** Keys All submissions transactions key saved during an epoch. */
  keys?: SubmissionKeyResponseAmino[];
}
export interface QueryEpochSubmissionsResponseAminoMsg {
  type: '/babylon.btccheckpoint.v1.QueryEpochSubmissionsResponse';
  value: QueryEpochSubmissionsResponseAmino;
}
/**
 * QueryEpochSubmissionsResponse defines a response to get all submissions in
 * given epoch (QueryEpochSubmissionsRequest)
 */
export interface QueryEpochSubmissionsResponseSDKType {
  keys: SubmissionKeyResponseSDKType[];
}
/**
 * BTCCheckpointInfoResponse contains all data about best submission of checkpoint for
 * given epoch. Best submission is the submission which is deeper in btc ledger.
 */
export interface BTCCheckpointInfoResponse {
  /** EpochNumber of this checkpoint. */
  epochNumber: bigint;
  /** btc height of the best submission of the epoch */
  bestSubmissionBtcBlockHeight: bigint;
  /**
   * hash of the btc block which determines checkpoint btc block height i.e.
   * youngest block of best submission Hexadecimal
   */
  bestSubmissionBtcBlockHash: string;
  /** the BTC checkpoint transactions of the best submission */
  bestSubmissionTransactions: TransactionInfoResponse[];
  /** list of vigilantes' addresses of the best submission */
  bestSubmissionVigilanteAddressList: CheckpointAddressesResponse[];
}
export interface BTCCheckpointInfoResponseProtoMsg {
  typeUrl: '/babylon.btccheckpoint.v1.BTCCheckpointInfoResponse';
  value: Uint8Array;
}
/**
 * BTCCheckpointInfoResponse contains all data about best submission of checkpoint for
 * given epoch. Best submission is the submission which is deeper in btc ledger.
 */
export interface BTCCheckpointInfoResponseAmino {
  /** EpochNumber of this checkpoint. */
  epoch_number?: string;
  /** btc height of the best submission of the epoch */
  best_submission_btc_block_height?: string;
  /**
   * hash of the btc block which determines checkpoint btc block height i.e.
   * youngest block of best submission Hexadecimal
   */
  best_submission_btc_block_hash?: string;
  /** the BTC checkpoint transactions of the best submission */
  best_submission_transactions?: TransactionInfoResponseAmino[];
  /** list of vigilantes' addresses of the best submission */
  best_submission_vigilante_address_list?: CheckpointAddressesResponseAmino[];
}
export interface BTCCheckpointInfoResponseAminoMsg {
  type: '/babylon.btccheckpoint.v1.BTCCheckpointInfoResponse';
  value: BTCCheckpointInfoResponseAmino;
}
/**
 * BTCCheckpointInfoResponse contains all data about best submission of checkpoint for
 * given epoch. Best submission is the submission which is deeper in btc ledger.
 */
export interface BTCCheckpointInfoResponseSDKType {
  epoch_number: bigint;
  best_submission_btc_block_height: bigint;
  best_submission_btc_block_hash: string;
  best_submission_transactions: TransactionInfoResponseSDKType[];
  best_submission_vigilante_address_list: CheckpointAddressesResponseSDKType[];
}
/**
 * TransactionInfoResponse is the info of a tx on Bitcoin,
 * including
 * - the position of the tx on BTC blockchain
 * - the full tx content
 * - the Merkle proof that this tx is on the above position
 */
export interface TransactionInfoResponse {
  /** Index Bitcoin Transaction index in block. */
  index: number;
  /** Hash BTC Header hash as hex. */
  hash: string;
  /** transaction is the full transaction data as str hex. */
  transaction: string;
  /** proof is the Merkle proof that this tx is included in the position in `key` */
  proof: string;
}
export interface TransactionInfoResponseProtoMsg {
  typeUrl: '/babylon.btccheckpoint.v1.TransactionInfoResponse';
  value: Uint8Array;
}
/**
 * TransactionInfoResponse is the info of a tx on Bitcoin,
 * including
 * - the position of the tx on BTC blockchain
 * - the full tx content
 * - the Merkle proof that this tx is on the above position
 */
export interface TransactionInfoResponseAmino {
  /** Index Bitcoin Transaction index in block. */
  index?: number;
  /** Hash BTC Header hash as hex. */
  hash?: string;
  /** transaction is the full transaction data as str hex. */
  transaction?: string;
  /** proof is the Merkle proof that this tx is included in the position in `key` */
  proof?: string;
}
export interface TransactionInfoResponseAminoMsg {
  type: '/babylon.btccheckpoint.v1.TransactionInfoResponse';
  value: TransactionInfoResponseAmino;
}
/**
 * TransactionInfoResponse is the info of a tx on Bitcoin,
 * including
 * - the position of the tx on BTC blockchain
 * - the full tx content
 * - the Merkle proof that this tx is on the above position
 */
export interface TransactionInfoResponseSDKType {
  index: number;
  hash: string;
  transaction: string;
  proof: string;
}
/**
 * CheckpointAddressesResponse contains the addresses of the submitter and reporter of a
 * given checkpoint
 */
export interface CheckpointAddressesResponse {
  /**
   * submitter is the address of the checkpoint submitter to BTC, extracted from
   * the checkpoint itself.
   */
  submitter: string;
  /**
   * reporter is the address of the reporter who reported the submissions,
   * calculated from submission message MsgInsertBTCSpvProof itself
   */
  reporter: string;
}
export interface CheckpointAddressesResponseProtoMsg {
  typeUrl: '/babylon.btccheckpoint.v1.CheckpointAddressesResponse';
  value: Uint8Array;
}
/**
 * CheckpointAddressesResponse contains the addresses of the submitter and reporter of a
 * given checkpoint
 */
export interface CheckpointAddressesResponseAmino {
  /**
   * submitter is the address of the checkpoint submitter to BTC, extracted from
   * the checkpoint itself.
   */
  submitter?: string;
  /**
   * reporter is the address of the reporter who reported the submissions,
   * calculated from submission message MsgInsertBTCSpvProof itself
   */
  reporter?: string;
}
export interface CheckpointAddressesResponseAminoMsg {
  type: '/babylon.btccheckpoint.v1.CheckpointAddressesResponse';
  value: CheckpointAddressesResponseAmino;
}
/**
 * CheckpointAddressesResponse contains the addresses of the submitter and reporter of a
 * given checkpoint
 */
export interface CheckpointAddressesResponseSDKType {
  submitter: string;
  reporter: string;
}
/**
 * SubmissionKeyResponse Checkpoint can be composed from multiple transactions,
 * so to identify whole submission we need list of transaction keys.
 * Each submission can generally be identified by this list of (txIdx,
 * blockHash) tuples. Note: this could possibly be optimized as if transactions
 * were in one block they would have the same block hash and different indexes,
 * but each blockhash is only 33 (1  byte for prefix encoding and 32 byte hash),
 * so there should be other strong arguments for this optimization
 */
export interface SubmissionKeyResponse {
  /** FirstTxBlockHash is the BTCHeaderHashBytes in hex. */
  firstTxBlockHash: string;
  firstTxIndex: number;
  /** SecondBlockHash is the BTCHeaderHashBytes in hex. */
  secondTxBlockHash: string;
  secondTxIndex: number;
}
export interface SubmissionKeyResponseProtoMsg {
  typeUrl: '/babylon.btccheckpoint.v1.SubmissionKeyResponse';
  value: Uint8Array;
}
/**
 * SubmissionKeyResponse Checkpoint can be composed from multiple transactions,
 * so to identify whole submission we need list of transaction keys.
 * Each submission can generally be identified by this list of (txIdx,
 * blockHash) tuples. Note: this could possibly be optimized as if transactions
 * were in one block they would have the same block hash and different indexes,
 * but each blockhash is only 33 (1  byte for prefix encoding and 32 byte hash),
 * so there should be other strong arguments for this optimization
 */
export interface SubmissionKeyResponseAmino {
  /** FirstTxBlockHash is the BTCHeaderHashBytes in hex. */
  first_tx_block_hash?: string;
  first_tx_index?: number;
  /** SecondBlockHash is the BTCHeaderHashBytes in hex. */
  second_tx_block_hash?: string;
  second_tx_index?: number;
}
export interface SubmissionKeyResponseAminoMsg {
  type: '/babylon.btccheckpoint.v1.SubmissionKeyResponse';
  value: SubmissionKeyResponseAmino;
}
/**
 * SubmissionKeyResponse Checkpoint can be composed from multiple transactions,
 * so to identify whole submission we need list of transaction keys.
 * Each submission can generally be identified by this list of (txIdx,
 * blockHash) tuples. Note: this could possibly be optimized as if transactions
 * were in one block they would have the same block hash and different indexes,
 * but each blockhash is only 33 (1  byte for prefix encoding and 32 byte hash),
 * so there should be other strong arguments for this optimization
 */
export interface SubmissionKeyResponseSDKType {
  first_tx_block_hash: string;
  first_tx_index: number;
  second_tx_block_hash: string;
  second_tx_index: number;
}
function createBaseQueryParamsRequest(): QueryParamsRequest {
  return {};
}
export const QueryParamsRequest = {
  typeUrl: '/babylon.btccheckpoint.v1.QueryParamsRequest',
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
      typeUrl: '/babylon.btccheckpoint.v1.QueryParamsRequest',
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
  typeUrl: '/babylon.btccheckpoint.v1.QueryParamsResponse',
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
      typeUrl: '/babylon.btccheckpoint.v1.QueryParamsResponse',
      value: QueryParamsResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryBtcCheckpointInfoRequest(): QueryBtcCheckpointInfoRequest {
  return {
    epochNum: BigInt(0),
  };
}
export const QueryBtcCheckpointInfoRequest = {
  typeUrl: '/babylon.btccheckpoint.v1.QueryBtcCheckpointInfoRequest',
  encode(message: QueryBtcCheckpointInfoRequest, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.epochNum !== BigInt(0)) {
      writer.uint32(8).uint64(message.epochNum);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): QueryBtcCheckpointInfoRequest {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryBtcCheckpointInfoRequest();
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
  fromPartial(object: Partial<QueryBtcCheckpointInfoRequest>): QueryBtcCheckpointInfoRequest {
    const message = createBaseQueryBtcCheckpointInfoRequest();
    message.epochNum =
      object.epochNum !== undefined && object.epochNum !== null ? BigInt(object.epochNum.toString()) : BigInt(0);
    return message;
  },
  fromAmino(object: QueryBtcCheckpointInfoRequestAmino): QueryBtcCheckpointInfoRequest {
    const message = createBaseQueryBtcCheckpointInfoRequest();
    if (object.epoch_num !== undefined && object.epoch_num !== null) {
      message.epochNum = BigInt(object.epoch_num);
    }
    return message;
  },
  toAmino(message: QueryBtcCheckpointInfoRequest): QueryBtcCheckpointInfoRequestAmino {
    const obj: any = {};
    obj.epoch_num = message.epochNum !== BigInt(0) ? message.epochNum?.toString() : undefined;
    return obj;
  },
  fromAminoMsg(object: QueryBtcCheckpointInfoRequestAminoMsg): QueryBtcCheckpointInfoRequest {
    return QueryBtcCheckpointInfoRequest.fromAmino(object.value);
  },
  fromProtoMsg(message: QueryBtcCheckpointInfoRequestProtoMsg): QueryBtcCheckpointInfoRequest {
    return QueryBtcCheckpointInfoRequest.decode(message.value);
  },
  toProto(message: QueryBtcCheckpointInfoRequest): Uint8Array {
    return QueryBtcCheckpointInfoRequest.encode(message).finish();
  },
  toProtoMsg(message: QueryBtcCheckpointInfoRequest): QueryBtcCheckpointInfoRequestProtoMsg {
    return {
      typeUrl: '/babylon.btccheckpoint.v1.QueryBtcCheckpointInfoRequest',
      value: QueryBtcCheckpointInfoRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryBtcCheckpointInfoResponse(): QueryBtcCheckpointInfoResponse {
  return {
    info: undefined,
  };
}
export const QueryBtcCheckpointInfoResponse = {
  typeUrl: '/babylon.btccheckpoint.v1.QueryBtcCheckpointInfoResponse',
  encode(message: QueryBtcCheckpointInfoResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.info !== undefined) {
      BTCCheckpointInfoResponse.encode(message.info, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): QueryBtcCheckpointInfoResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryBtcCheckpointInfoResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.info = BTCCheckpointInfoResponse.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<QueryBtcCheckpointInfoResponse>): QueryBtcCheckpointInfoResponse {
    const message = createBaseQueryBtcCheckpointInfoResponse();
    message.info =
      object.info !== undefined && object.info !== null
        ? BTCCheckpointInfoResponse.fromPartial(object.info)
        : undefined;
    return message;
  },
  fromAmino(object: QueryBtcCheckpointInfoResponseAmino): QueryBtcCheckpointInfoResponse {
    const message = createBaseQueryBtcCheckpointInfoResponse();
    if (object.info !== undefined && object.info !== null) {
      message.info = BTCCheckpointInfoResponse.fromAmino(object.info);
    }
    return message;
  },
  toAmino(message: QueryBtcCheckpointInfoResponse): QueryBtcCheckpointInfoResponseAmino {
    const obj: any = {};
    obj.info = message.info ? BTCCheckpointInfoResponse.toAmino(message.info) : undefined;
    return obj;
  },
  fromAminoMsg(object: QueryBtcCheckpointInfoResponseAminoMsg): QueryBtcCheckpointInfoResponse {
    return QueryBtcCheckpointInfoResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: QueryBtcCheckpointInfoResponseProtoMsg): QueryBtcCheckpointInfoResponse {
    return QueryBtcCheckpointInfoResponse.decode(message.value);
  },
  toProto(message: QueryBtcCheckpointInfoResponse): Uint8Array {
    return QueryBtcCheckpointInfoResponse.encode(message).finish();
  },
  toProtoMsg(message: QueryBtcCheckpointInfoResponse): QueryBtcCheckpointInfoResponseProtoMsg {
    return {
      typeUrl: '/babylon.btccheckpoint.v1.QueryBtcCheckpointInfoResponse',
      value: QueryBtcCheckpointInfoResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryBtcCheckpointsInfoRequest(): QueryBtcCheckpointsInfoRequest {
  return {
    pagination: undefined,
  };
}
export const QueryBtcCheckpointsInfoRequest = {
  typeUrl: '/babylon.btccheckpoint.v1.QueryBtcCheckpointsInfoRequest',
  encode(message: QueryBtcCheckpointsInfoRequest, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.pagination !== undefined) {
      PageRequest.encode(message.pagination, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): QueryBtcCheckpointsInfoRequest {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryBtcCheckpointsInfoRequest();
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
  fromPartial(object: Partial<QueryBtcCheckpointsInfoRequest>): QueryBtcCheckpointsInfoRequest {
    const message = createBaseQueryBtcCheckpointsInfoRequest();
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageRequest.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromAmino(object: QueryBtcCheckpointsInfoRequestAmino): QueryBtcCheckpointsInfoRequest {
    const message = createBaseQueryBtcCheckpointsInfoRequest();
    if (object.pagination !== undefined && object.pagination !== null) {
      message.pagination = PageRequest.fromAmino(object.pagination);
    }
    return message;
  },
  toAmino(message: QueryBtcCheckpointsInfoRequest): QueryBtcCheckpointsInfoRequestAmino {
    const obj: any = {};
    obj.pagination = message.pagination ? PageRequest.toAmino(message.pagination) : undefined;
    return obj;
  },
  fromAminoMsg(object: QueryBtcCheckpointsInfoRequestAminoMsg): QueryBtcCheckpointsInfoRequest {
    return QueryBtcCheckpointsInfoRequest.fromAmino(object.value);
  },
  fromProtoMsg(message: QueryBtcCheckpointsInfoRequestProtoMsg): QueryBtcCheckpointsInfoRequest {
    return QueryBtcCheckpointsInfoRequest.decode(message.value);
  },
  toProto(message: QueryBtcCheckpointsInfoRequest): Uint8Array {
    return QueryBtcCheckpointsInfoRequest.encode(message).finish();
  },
  toProtoMsg(message: QueryBtcCheckpointsInfoRequest): QueryBtcCheckpointsInfoRequestProtoMsg {
    return {
      typeUrl: '/babylon.btccheckpoint.v1.QueryBtcCheckpointsInfoRequest',
      value: QueryBtcCheckpointsInfoRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryBtcCheckpointsInfoResponse(): QueryBtcCheckpointsInfoResponse {
  return {
    infoList: [],
    pagination: undefined,
  };
}
export const QueryBtcCheckpointsInfoResponse = {
  typeUrl: '/babylon.btccheckpoint.v1.QueryBtcCheckpointsInfoResponse',
  encode(message: QueryBtcCheckpointsInfoResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    for (const v of message.infoList) {
      BTCCheckpointInfoResponse.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    if (message.pagination !== undefined) {
      PageResponse.encode(message.pagination, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): QueryBtcCheckpointsInfoResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryBtcCheckpointsInfoResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.infoList.push(BTCCheckpointInfoResponse.decode(reader, reader.uint32()));
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
  fromPartial(object: Partial<QueryBtcCheckpointsInfoResponse>): QueryBtcCheckpointsInfoResponse {
    const message = createBaseQueryBtcCheckpointsInfoResponse();
    message.infoList = object.infoList?.map((e) => BTCCheckpointInfoResponse.fromPartial(e)) || [];
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageResponse.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromAmino(object: QueryBtcCheckpointsInfoResponseAmino): QueryBtcCheckpointsInfoResponse {
    const message = createBaseQueryBtcCheckpointsInfoResponse();
    message.infoList = object.info_list?.map((e) => BTCCheckpointInfoResponse.fromAmino(e)) || [];
    if (object.pagination !== undefined && object.pagination !== null) {
      message.pagination = PageResponse.fromAmino(object.pagination);
    }
    return message;
  },
  toAmino(message: QueryBtcCheckpointsInfoResponse): QueryBtcCheckpointsInfoResponseAmino {
    const obj: any = {};
    if (message.infoList) {
      obj.info_list = message.infoList.map((e) => (e ? BTCCheckpointInfoResponse.toAmino(e) : undefined));
    } else {
      obj.info_list = message.infoList;
    }
    obj.pagination = message.pagination ? PageResponse.toAmino(message.pagination) : undefined;
    return obj;
  },
  fromAminoMsg(object: QueryBtcCheckpointsInfoResponseAminoMsg): QueryBtcCheckpointsInfoResponse {
    return QueryBtcCheckpointsInfoResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: QueryBtcCheckpointsInfoResponseProtoMsg): QueryBtcCheckpointsInfoResponse {
    return QueryBtcCheckpointsInfoResponse.decode(message.value);
  },
  toProto(message: QueryBtcCheckpointsInfoResponse): Uint8Array {
    return QueryBtcCheckpointsInfoResponse.encode(message).finish();
  },
  toProtoMsg(message: QueryBtcCheckpointsInfoResponse): QueryBtcCheckpointsInfoResponseProtoMsg {
    return {
      typeUrl: '/babylon.btccheckpoint.v1.QueryBtcCheckpointsInfoResponse',
      value: QueryBtcCheckpointsInfoResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryEpochSubmissionsRequest(): QueryEpochSubmissionsRequest {
  return {
    epochNum: BigInt(0),
  };
}
export const QueryEpochSubmissionsRequest = {
  typeUrl: '/babylon.btccheckpoint.v1.QueryEpochSubmissionsRequest',
  encode(message: QueryEpochSubmissionsRequest, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.epochNum !== BigInt(0)) {
      writer.uint32(8).uint64(message.epochNum);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): QueryEpochSubmissionsRequest {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryEpochSubmissionsRequest();
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
  fromPartial(object: Partial<QueryEpochSubmissionsRequest>): QueryEpochSubmissionsRequest {
    const message = createBaseQueryEpochSubmissionsRequest();
    message.epochNum =
      object.epochNum !== undefined && object.epochNum !== null ? BigInt(object.epochNum.toString()) : BigInt(0);
    return message;
  },
  fromAmino(object: QueryEpochSubmissionsRequestAmino): QueryEpochSubmissionsRequest {
    const message = createBaseQueryEpochSubmissionsRequest();
    if (object.epoch_num !== undefined && object.epoch_num !== null) {
      message.epochNum = BigInt(object.epoch_num);
    }
    return message;
  },
  toAmino(message: QueryEpochSubmissionsRequest): QueryEpochSubmissionsRequestAmino {
    const obj: any = {};
    obj.epoch_num = message.epochNum !== BigInt(0) ? message.epochNum?.toString() : undefined;
    return obj;
  },
  fromAminoMsg(object: QueryEpochSubmissionsRequestAminoMsg): QueryEpochSubmissionsRequest {
    return QueryEpochSubmissionsRequest.fromAmino(object.value);
  },
  fromProtoMsg(message: QueryEpochSubmissionsRequestProtoMsg): QueryEpochSubmissionsRequest {
    return QueryEpochSubmissionsRequest.decode(message.value);
  },
  toProto(message: QueryEpochSubmissionsRequest): Uint8Array {
    return QueryEpochSubmissionsRequest.encode(message).finish();
  },
  toProtoMsg(message: QueryEpochSubmissionsRequest): QueryEpochSubmissionsRequestProtoMsg {
    return {
      typeUrl: '/babylon.btccheckpoint.v1.QueryEpochSubmissionsRequest',
      value: QueryEpochSubmissionsRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryEpochSubmissionsResponse(): QueryEpochSubmissionsResponse {
  return {
    keys: [],
  };
}
export const QueryEpochSubmissionsResponse = {
  typeUrl: '/babylon.btccheckpoint.v1.QueryEpochSubmissionsResponse',
  encode(message: QueryEpochSubmissionsResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    for (const v of message.keys) {
      SubmissionKeyResponse.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): QueryEpochSubmissionsResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryEpochSubmissionsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.keys.push(SubmissionKeyResponse.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<QueryEpochSubmissionsResponse>): QueryEpochSubmissionsResponse {
    const message = createBaseQueryEpochSubmissionsResponse();
    message.keys = object.keys?.map((e) => SubmissionKeyResponse.fromPartial(e)) || [];
    return message;
  },
  fromAmino(object: QueryEpochSubmissionsResponseAmino): QueryEpochSubmissionsResponse {
    const message = createBaseQueryEpochSubmissionsResponse();
    message.keys = object.keys?.map((e) => SubmissionKeyResponse.fromAmino(e)) || [];
    return message;
  },
  toAmino(message: QueryEpochSubmissionsResponse): QueryEpochSubmissionsResponseAmino {
    const obj: any = {};
    if (message.keys) {
      obj.keys = message.keys.map((e) => (e ? SubmissionKeyResponse.toAmino(e) : undefined));
    } else {
      obj.keys = message.keys;
    }
    return obj;
  },
  fromAminoMsg(object: QueryEpochSubmissionsResponseAminoMsg): QueryEpochSubmissionsResponse {
    return QueryEpochSubmissionsResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: QueryEpochSubmissionsResponseProtoMsg): QueryEpochSubmissionsResponse {
    return QueryEpochSubmissionsResponse.decode(message.value);
  },
  toProto(message: QueryEpochSubmissionsResponse): Uint8Array {
    return QueryEpochSubmissionsResponse.encode(message).finish();
  },
  toProtoMsg(message: QueryEpochSubmissionsResponse): QueryEpochSubmissionsResponseProtoMsg {
    return {
      typeUrl: '/babylon.btccheckpoint.v1.QueryEpochSubmissionsResponse',
      value: QueryEpochSubmissionsResponse.encode(message).finish(),
    };
  },
};
function createBaseBTCCheckpointInfoResponse(): BTCCheckpointInfoResponse {
  return {
    epochNumber: BigInt(0),
    bestSubmissionBtcBlockHeight: BigInt(0),
    bestSubmissionBtcBlockHash: '',
    bestSubmissionTransactions: [],
    bestSubmissionVigilanteAddressList: [],
  };
}
export const BTCCheckpointInfoResponse = {
  typeUrl: '/babylon.btccheckpoint.v1.BTCCheckpointInfoResponse',
  encode(message: BTCCheckpointInfoResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.epochNumber !== BigInt(0)) {
      writer.uint32(8).uint64(message.epochNumber);
    }
    if (message.bestSubmissionBtcBlockHeight !== BigInt(0)) {
      writer.uint32(16).uint64(message.bestSubmissionBtcBlockHeight);
    }
    if (message.bestSubmissionBtcBlockHash !== '') {
      writer.uint32(26).string(message.bestSubmissionBtcBlockHash);
    }
    for (const v of message.bestSubmissionTransactions) {
      TransactionInfoResponse.encode(v!, writer.uint32(34).fork()).ldelim();
    }
    for (const v of message.bestSubmissionVigilanteAddressList) {
      CheckpointAddressesResponse.encode(v!, writer.uint32(42).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): BTCCheckpointInfoResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBTCCheckpointInfoResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.epochNumber = reader.uint64();
          break;
        case 2:
          message.bestSubmissionBtcBlockHeight = reader.uint64();
          break;
        case 3:
          message.bestSubmissionBtcBlockHash = reader.string();
          break;
        case 4:
          message.bestSubmissionTransactions.push(TransactionInfoResponse.decode(reader, reader.uint32()));
          break;
        case 5:
          message.bestSubmissionVigilanteAddressList.push(CheckpointAddressesResponse.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<BTCCheckpointInfoResponse>): BTCCheckpointInfoResponse {
    const message = createBaseBTCCheckpointInfoResponse();
    message.epochNumber =
      object.epochNumber !== undefined && object.epochNumber !== null
        ? BigInt(object.epochNumber.toString())
        : BigInt(0);
    message.bestSubmissionBtcBlockHeight =
      object.bestSubmissionBtcBlockHeight !== undefined && object.bestSubmissionBtcBlockHeight !== null
        ? BigInt(object.bestSubmissionBtcBlockHeight.toString())
        : BigInt(0);
    message.bestSubmissionBtcBlockHash = object.bestSubmissionBtcBlockHash ?? '';
    message.bestSubmissionTransactions =
      object.bestSubmissionTransactions?.map((e) => TransactionInfoResponse.fromPartial(e)) || [];
    message.bestSubmissionVigilanteAddressList =
      object.bestSubmissionVigilanteAddressList?.map((e) => CheckpointAddressesResponse.fromPartial(e)) || [];
    return message;
  },
  fromAmino(object: BTCCheckpointInfoResponseAmino): BTCCheckpointInfoResponse {
    const message = createBaseBTCCheckpointInfoResponse();
    if (object.epoch_number !== undefined && object.epoch_number !== null) {
      message.epochNumber = BigInt(object.epoch_number);
    }
    if (object.best_submission_btc_block_height !== undefined && object.best_submission_btc_block_height !== null) {
      message.bestSubmissionBtcBlockHeight = BigInt(object.best_submission_btc_block_height);
    }
    if (object.best_submission_btc_block_hash !== undefined && object.best_submission_btc_block_hash !== null) {
      message.bestSubmissionBtcBlockHash = object.best_submission_btc_block_hash;
    }
    message.bestSubmissionTransactions =
      object.best_submission_transactions?.map((e) => TransactionInfoResponse.fromAmino(e)) || [];
    message.bestSubmissionVigilanteAddressList =
      object.best_submission_vigilante_address_list?.map((e) => CheckpointAddressesResponse.fromAmino(e)) || [];
    return message;
  },
  toAmino(message: BTCCheckpointInfoResponse): BTCCheckpointInfoResponseAmino {
    const obj: any = {};
    obj.epoch_number = message.epochNumber !== BigInt(0) ? message.epochNumber?.toString() : undefined;
    obj.best_submission_btc_block_height =
      message.bestSubmissionBtcBlockHeight !== BigInt(0) ? message.bestSubmissionBtcBlockHeight?.toString() : undefined;
    obj.best_submission_btc_block_hash =
      message.bestSubmissionBtcBlockHash === '' ? undefined : message.bestSubmissionBtcBlockHash;
    if (message.bestSubmissionTransactions) {
      obj.best_submission_transactions = message.bestSubmissionTransactions.map((e) =>
        e ? TransactionInfoResponse.toAmino(e) : undefined,
      );
    } else {
      obj.best_submission_transactions = message.bestSubmissionTransactions;
    }
    if (message.bestSubmissionVigilanteAddressList) {
      obj.best_submission_vigilante_address_list = message.bestSubmissionVigilanteAddressList.map((e) =>
        e ? CheckpointAddressesResponse.toAmino(e) : undefined,
      );
    } else {
      obj.best_submission_vigilante_address_list = message.bestSubmissionVigilanteAddressList;
    }
    return obj;
  },
  fromAminoMsg(object: BTCCheckpointInfoResponseAminoMsg): BTCCheckpointInfoResponse {
    return BTCCheckpointInfoResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: BTCCheckpointInfoResponseProtoMsg): BTCCheckpointInfoResponse {
    return BTCCheckpointInfoResponse.decode(message.value);
  },
  toProto(message: BTCCheckpointInfoResponse): Uint8Array {
    return BTCCheckpointInfoResponse.encode(message).finish();
  },
  toProtoMsg(message: BTCCheckpointInfoResponse): BTCCheckpointInfoResponseProtoMsg {
    return {
      typeUrl: '/babylon.btccheckpoint.v1.BTCCheckpointInfoResponse',
      value: BTCCheckpointInfoResponse.encode(message).finish(),
    };
  },
};
function createBaseTransactionInfoResponse(): TransactionInfoResponse {
  return {
    index: 0,
    hash: '',
    transaction: '',
    proof: '',
  };
}
export const TransactionInfoResponse = {
  typeUrl: '/babylon.btccheckpoint.v1.TransactionInfoResponse',
  encode(message: TransactionInfoResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.index !== 0) {
      writer.uint32(8).uint32(message.index);
    }
    if (message.hash !== '') {
      writer.uint32(18).string(message.hash);
    }
    if (message.transaction !== '') {
      writer.uint32(26).string(message.transaction);
    }
    if (message.proof !== '') {
      writer.uint32(34).string(message.proof);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): TransactionInfoResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTransactionInfoResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.index = reader.uint32();
          break;
        case 2:
          message.hash = reader.string();
          break;
        case 3:
          message.transaction = reader.string();
          break;
        case 4:
          message.proof = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<TransactionInfoResponse>): TransactionInfoResponse {
    const message = createBaseTransactionInfoResponse();
    message.index = object.index ?? 0;
    message.hash = object.hash ?? '';
    message.transaction = object.transaction ?? '';
    message.proof = object.proof ?? '';
    return message;
  },
  fromAmino(object: TransactionInfoResponseAmino): TransactionInfoResponse {
    const message = createBaseTransactionInfoResponse();
    if (object.index !== undefined && object.index !== null) {
      message.index = object.index;
    }
    if (object.hash !== undefined && object.hash !== null) {
      message.hash = object.hash;
    }
    if (object.transaction !== undefined && object.transaction !== null) {
      message.transaction = object.transaction;
    }
    if (object.proof !== undefined && object.proof !== null) {
      message.proof = object.proof;
    }
    return message;
  },
  toAmino(message: TransactionInfoResponse): TransactionInfoResponseAmino {
    const obj: any = {};
    obj.index = message.index === 0 ? undefined : message.index;
    obj.hash = message.hash === '' ? undefined : message.hash;
    obj.transaction = message.transaction === '' ? undefined : message.transaction;
    obj.proof = message.proof === '' ? undefined : message.proof;
    return obj;
  },
  fromAminoMsg(object: TransactionInfoResponseAminoMsg): TransactionInfoResponse {
    return TransactionInfoResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: TransactionInfoResponseProtoMsg): TransactionInfoResponse {
    return TransactionInfoResponse.decode(message.value);
  },
  toProto(message: TransactionInfoResponse): Uint8Array {
    return TransactionInfoResponse.encode(message).finish();
  },
  toProtoMsg(message: TransactionInfoResponse): TransactionInfoResponseProtoMsg {
    return {
      typeUrl: '/babylon.btccheckpoint.v1.TransactionInfoResponse',
      value: TransactionInfoResponse.encode(message).finish(),
    };
  },
};
function createBaseCheckpointAddressesResponse(): CheckpointAddressesResponse {
  return {
    submitter: '',
    reporter: '',
  };
}
export const CheckpointAddressesResponse = {
  typeUrl: '/babylon.btccheckpoint.v1.CheckpointAddressesResponse',
  encode(message: CheckpointAddressesResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.submitter !== '') {
      writer.uint32(10).string(message.submitter);
    }
    if (message.reporter !== '') {
      writer.uint32(18).string(message.reporter);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): CheckpointAddressesResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCheckpointAddressesResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.submitter = reader.string();
          break;
        case 2:
          message.reporter = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<CheckpointAddressesResponse>): CheckpointAddressesResponse {
    const message = createBaseCheckpointAddressesResponse();
    message.submitter = object.submitter ?? '';
    message.reporter = object.reporter ?? '';
    return message;
  },
  fromAmino(object: CheckpointAddressesResponseAmino): CheckpointAddressesResponse {
    const message = createBaseCheckpointAddressesResponse();
    if (object.submitter !== undefined && object.submitter !== null) {
      message.submitter = object.submitter;
    }
    if (object.reporter !== undefined && object.reporter !== null) {
      message.reporter = object.reporter;
    }
    return message;
  },
  toAmino(message: CheckpointAddressesResponse): CheckpointAddressesResponseAmino {
    const obj: any = {};
    obj.submitter = message.submitter === '' ? undefined : message.submitter;
    obj.reporter = message.reporter === '' ? undefined : message.reporter;
    return obj;
  },
  fromAminoMsg(object: CheckpointAddressesResponseAminoMsg): CheckpointAddressesResponse {
    return CheckpointAddressesResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: CheckpointAddressesResponseProtoMsg): CheckpointAddressesResponse {
    return CheckpointAddressesResponse.decode(message.value);
  },
  toProto(message: CheckpointAddressesResponse): Uint8Array {
    return CheckpointAddressesResponse.encode(message).finish();
  },
  toProtoMsg(message: CheckpointAddressesResponse): CheckpointAddressesResponseProtoMsg {
    return {
      typeUrl: '/babylon.btccheckpoint.v1.CheckpointAddressesResponse',
      value: CheckpointAddressesResponse.encode(message).finish(),
    };
  },
};
function createBaseSubmissionKeyResponse(): SubmissionKeyResponse {
  return {
    firstTxBlockHash: '',
    firstTxIndex: 0,
    secondTxBlockHash: '',
    secondTxIndex: 0,
  };
}
export const SubmissionKeyResponse = {
  typeUrl: '/babylon.btccheckpoint.v1.SubmissionKeyResponse',
  encode(message: SubmissionKeyResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.firstTxBlockHash !== '') {
      writer.uint32(10).string(message.firstTxBlockHash);
    }
    if (message.firstTxIndex !== 0) {
      writer.uint32(16).uint32(message.firstTxIndex);
    }
    if (message.secondTxBlockHash !== '') {
      writer.uint32(26).string(message.secondTxBlockHash);
    }
    if (message.secondTxIndex !== 0) {
      writer.uint32(32).uint32(message.secondTxIndex);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): SubmissionKeyResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSubmissionKeyResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.firstTxBlockHash = reader.string();
          break;
        case 2:
          message.firstTxIndex = reader.uint32();
          break;
        case 3:
          message.secondTxBlockHash = reader.string();
          break;
        case 4:
          message.secondTxIndex = reader.uint32();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<SubmissionKeyResponse>): SubmissionKeyResponse {
    const message = createBaseSubmissionKeyResponse();
    message.firstTxBlockHash = object.firstTxBlockHash ?? '';
    message.firstTxIndex = object.firstTxIndex ?? 0;
    message.secondTxBlockHash = object.secondTxBlockHash ?? '';
    message.secondTxIndex = object.secondTxIndex ?? 0;
    return message;
  },
  fromAmino(object: SubmissionKeyResponseAmino): SubmissionKeyResponse {
    const message = createBaseSubmissionKeyResponse();
    if (object.first_tx_block_hash !== undefined && object.first_tx_block_hash !== null) {
      message.firstTxBlockHash = object.first_tx_block_hash;
    }
    if (object.first_tx_index !== undefined && object.first_tx_index !== null) {
      message.firstTxIndex = object.first_tx_index;
    }
    if (object.second_tx_block_hash !== undefined && object.second_tx_block_hash !== null) {
      message.secondTxBlockHash = object.second_tx_block_hash;
    }
    if (object.second_tx_index !== undefined && object.second_tx_index !== null) {
      message.secondTxIndex = object.second_tx_index;
    }
    return message;
  },
  toAmino(message: SubmissionKeyResponse): SubmissionKeyResponseAmino {
    const obj: any = {};
    obj.first_tx_block_hash = message.firstTxBlockHash === '' ? undefined : message.firstTxBlockHash;
    obj.first_tx_index = message.firstTxIndex === 0 ? undefined : message.firstTxIndex;
    obj.second_tx_block_hash = message.secondTxBlockHash === '' ? undefined : message.secondTxBlockHash;
    obj.second_tx_index = message.secondTxIndex === 0 ? undefined : message.secondTxIndex;
    return obj;
  },
  fromAminoMsg(object: SubmissionKeyResponseAminoMsg): SubmissionKeyResponse {
    return SubmissionKeyResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: SubmissionKeyResponseProtoMsg): SubmissionKeyResponse {
    return SubmissionKeyResponse.decode(message.value);
  },
  toProto(message: SubmissionKeyResponse): Uint8Array {
    return SubmissionKeyResponse.encode(message).finish();
  },
  toProtoMsg(message: SubmissionKeyResponse): SubmissionKeyResponseProtoMsg {
    return {
      typeUrl: '/babylon.btccheckpoint.v1.SubmissionKeyResponse',
      value: SubmissionKeyResponse.encode(message).finish(),
    };
  },
};
