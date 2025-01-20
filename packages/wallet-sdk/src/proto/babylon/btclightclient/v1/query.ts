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
import { Params, ParamsAmino, ParamsSDKType } from './params';
/** QueryParamsRequest is the request type for the Query/Params RPC method. */
export interface QueryParamsRequest {}
export interface QueryParamsRequestProtoMsg {
  typeUrl: '/babylon.btclightclient.v1.QueryParamsRequest';
  value: Uint8Array;
}
/** QueryParamsRequest is the request type for the Query/Params RPC method. */
export interface QueryParamsRequestAmino {}
export interface QueryParamsRequestAminoMsg {
  type: '/babylon.btclightclient.v1.QueryParamsRequest';
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
  typeUrl: '/babylon.btclightclient.v1.QueryParamsResponse';
  value: Uint8Array;
}
/** QueryParamsResponse is the response type for the Query/Params RPC method. */
export interface QueryParamsResponseAmino {
  /** params holds all the parameters of this module. */
  params?: ParamsAmino;
}
export interface QueryParamsResponseAminoMsg {
  type: '/babylon.btclightclient.v1.QueryParamsResponse';
  value: QueryParamsResponseAmino;
}
/** QueryParamsResponse is the response type for the Query/Params RPC method. */
export interface QueryParamsResponseSDKType {
  params: ParamsSDKType;
}
/**
 * QueryHashesRequest is request type for the Query/Hashes RPC method.
 * It involves retrieving all hashes that are maintained by the module.
 */
export interface QueryHashesRequest {
  pagination?: PageRequest;
}
export interface QueryHashesRequestProtoMsg {
  typeUrl: '/babylon.btclightclient.v1.QueryHashesRequest';
  value: Uint8Array;
}
/**
 * QueryHashesRequest is request type for the Query/Hashes RPC method.
 * It involves retrieving all hashes that are maintained by the module.
 */
export interface QueryHashesRequestAmino {
  pagination?: PageRequestAmino;
}
export interface QueryHashesRequestAminoMsg {
  type: '/babylon.btclightclient.v1.QueryHashesRequest';
  value: QueryHashesRequestAmino;
}
/**
 * QueryHashesRequest is request type for the Query/Hashes RPC method.
 * It involves retrieving all hashes that are maintained by the module.
 */
export interface QueryHashesRequestSDKType {
  pagination?: PageRequestSDKType;
}
/** QueryHashesResponse is response type for the Query/Hashes RPC method. */
export interface QueryHashesResponse {
  hashes: Uint8Array[];
  pagination?: PageResponse;
}
export interface QueryHashesResponseProtoMsg {
  typeUrl: '/babylon.btclightclient.v1.QueryHashesResponse';
  value: Uint8Array;
}
/** QueryHashesResponse is response type for the Query/Hashes RPC method. */
export interface QueryHashesResponseAmino {
  hashes?: string[];
  pagination?: PageResponseAmino;
}
export interface QueryHashesResponseAminoMsg {
  type: '/babylon.btclightclient.v1.QueryHashesResponse';
  value: QueryHashesResponseAmino;
}
/** QueryHashesResponse is response type for the Query/Hashes RPC method. */
export interface QueryHashesResponseSDKType {
  hashes: Uint8Array[];
  pagination?: PageResponseSDKType;
}
/**
 * QueryContainsRequest is request type for the Query/Contains RPC method.
 * It involves checking whether a hash is maintained by the module.
 */
export interface QueryContainsRequest {
  hash: Uint8Array;
}
export interface QueryContainsRequestProtoMsg {
  typeUrl: '/babylon.btclightclient.v1.QueryContainsRequest';
  value: Uint8Array;
}
/**
 * QueryContainsRequest is request type for the Query/Contains RPC method.
 * It involves checking whether a hash is maintained by the module.
 */
export interface QueryContainsRequestAmino {
  hash?: string;
}
export interface QueryContainsRequestAminoMsg {
  type: '/babylon.btclightclient.v1.QueryContainsRequest';
  value: QueryContainsRequestAmino;
}
/**
 * QueryContainsRequest is request type for the Query/Contains RPC method.
 * It involves checking whether a hash is maintained by the module.
 */
export interface QueryContainsRequestSDKType {
  hash: Uint8Array;
}
/** QueryContainsResponse is response type for the Query/Contains RPC method. */
export interface QueryContainsResponse {
  contains: boolean;
}
export interface QueryContainsResponseProtoMsg {
  typeUrl: '/babylon.btclightclient.v1.QueryContainsResponse';
  value: Uint8Array;
}
/** QueryContainsResponse is response type for the Query/Contains RPC method. */
export interface QueryContainsResponseAmino {
  contains?: boolean;
}
export interface QueryContainsResponseAminoMsg {
  type: '/babylon.btclightclient.v1.QueryContainsResponse';
  value: QueryContainsResponseAmino;
}
/** QueryContainsResponse is response type for the Query/Contains RPC method. */
export interface QueryContainsResponseSDKType {
  contains: boolean;
}
/**
 * QueryContainsRequest is request type for the temporary Query/ContainsBytes
 * RPC method. It involves checking whether a hash is maintained by the module.
 */
export interface QueryContainsBytesRequest {
  hash: Uint8Array;
}
export interface QueryContainsBytesRequestProtoMsg {
  typeUrl: '/babylon.btclightclient.v1.QueryContainsBytesRequest';
  value: Uint8Array;
}
/**
 * QueryContainsRequest is request type for the temporary Query/ContainsBytes
 * RPC method. It involves checking whether a hash is maintained by the module.
 */
export interface QueryContainsBytesRequestAmino {
  hash?: string;
}
export interface QueryContainsBytesRequestAminoMsg {
  type: '/babylon.btclightclient.v1.QueryContainsBytesRequest';
  value: QueryContainsBytesRequestAmino;
}
/**
 * QueryContainsRequest is request type for the temporary Query/ContainsBytes
 * RPC method. It involves checking whether a hash is maintained by the module.
 */
export interface QueryContainsBytesRequestSDKType {
  hash: Uint8Array;
}
/**
 * QueryContainsResponse is response type for the temporary Query/ContainsBytes
 * RPC method.
 */
export interface QueryContainsBytesResponse {
  contains: boolean;
}
export interface QueryContainsBytesResponseProtoMsg {
  typeUrl: '/babylon.btclightclient.v1.QueryContainsBytesResponse';
  value: Uint8Array;
}
/**
 * QueryContainsResponse is response type for the temporary Query/ContainsBytes
 * RPC method.
 */
export interface QueryContainsBytesResponseAmino {
  contains?: boolean;
}
export interface QueryContainsBytesResponseAminoMsg {
  type: '/babylon.btclightclient.v1.QueryContainsBytesResponse';
  value: QueryContainsBytesResponseAmino;
}
/**
 * QueryContainsResponse is response type for the temporary Query/ContainsBytes
 * RPC method.
 */
export interface QueryContainsBytesResponseSDKType {
  contains: boolean;
}
/**
 * QueryMainChainRequest is request type for the Query/MainChain RPC method.
 * It involves retrieving the canonical chain maintained by the module.
 */
export interface QueryMainChainRequest {
  pagination?: PageRequest;
}
export interface QueryMainChainRequestProtoMsg {
  typeUrl: '/babylon.btclightclient.v1.QueryMainChainRequest';
  value: Uint8Array;
}
/**
 * QueryMainChainRequest is request type for the Query/MainChain RPC method.
 * It involves retrieving the canonical chain maintained by the module.
 */
export interface QueryMainChainRequestAmino {
  pagination?: PageRequestAmino;
}
export interface QueryMainChainRequestAminoMsg {
  type: '/babylon.btclightclient.v1.QueryMainChainRequest';
  value: QueryMainChainRequestAmino;
}
/**
 * QueryMainChainRequest is request type for the Query/MainChain RPC method.
 * It involves retrieving the canonical chain maintained by the module.
 */
export interface QueryMainChainRequestSDKType {
  pagination?: PageRequestSDKType;
}
/** QueryMainChainResponse is response type for the Query/MainChain RPC method. */
export interface QueryMainChainResponse {
  headers: BTCHeaderInfoResponse[];
  pagination?: PageResponse;
}
export interface QueryMainChainResponseProtoMsg {
  typeUrl: '/babylon.btclightclient.v1.QueryMainChainResponse';
  value: Uint8Array;
}
/** QueryMainChainResponse is response type for the Query/MainChain RPC method. */
export interface QueryMainChainResponseAmino {
  headers?: BTCHeaderInfoResponseAmino[];
  pagination?: PageResponseAmino;
}
export interface QueryMainChainResponseAminoMsg {
  type: '/babylon.btclightclient.v1.QueryMainChainResponse';
  value: QueryMainChainResponseAmino;
}
/** QueryMainChainResponse is response type for the Query/MainChain RPC method. */
export interface QueryMainChainResponseSDKType {
  headers: BTCHeaderInfoResponseSDKType[];
  pagination?: PageResponseSDKType;
}
/** QueryTipRequest is the request type for the Query/Tip RPC method. */
export interface QueryTipRequest {}
export interface QueryTipRequestProtoMsg {
  typeUrl: '/babylon.btclightclient.v1.QueryTipRequest';
  value: Uint8Array;
}
/** QueryTipRequest is the request type for the Query/Tip RPC method. */
export interface QueryTipRequestAmino {}
export interface QueryTipRequestAminoMsg {
  type: '/babylon.btclightclient.v1.QueryTipRequest';
  value: QueryTipRequestAmino;
}
/** QueryTipRequest is the request type for the Query/Tip RPC method. */
export interface QueryTipRequestSDKType {}
/** QueryTipResponse is the response type for the Query/Tip RPC method. */
export interface QueryTipResponse {
  header?: BTCHeaderInfoResponse;
}
export interface QueryTipResponseProtoMsg {
  typeUrl: '/babylon.btclightclient.v1.QueryTipResponse';
  value: Uint8Array;
}
/** QueryTipResponse is the response type for the Query/Tip RPC method. */
export interface QueryTipResponseAmino {
  header?: BTCHeaderInfoResponseAmino;
}
export interface QueryTipResponseAminoMsg {
  type: '/babylon.btclightclient.v1.QueryTipResponse';
  value: QueryTipResponseAmino;
}
/** QueryTipResponse is the response type for the Query/Tip RPC method. */
export interface QueryTipResponseSDKType {
  header?: BTCHeaderInfoResponseSDKType;
}
/**
 * QueryBaseHeaderRequest is the request type for the Query/BaseHeader RPC
 * method.
 */
export interface QueryBaseHeaderRequest {}
export interface QueryBaseHeaderRequestProtoMsg {
  typeUrl: '/babylon.btclightclient.v1.QueryBaseHeaderRequest';
  value: Uint8Array;
}
/**
 * QueryBaseHeaderRequest is the request type for the Query/BaseHeader RPC
 * method.
 */
export interface QueryBaseHeaderRequestAmino {}
export interface QueryBaseHeaderRequestAminoMsg {
  type: '/babylon.btclightclient.v1.QueryBaseHeaderRequest';
  value: QueryBaseHeaderRequestAmino;
}
/**
 * QueryBaseHeaderRequest is the request type for the Query/BaseHeader RPC
 * method.
 */
export interface QueryBaseHeaderRequestSDKType {}
/**
 * QueryBaseHeaderResponse is the response type for the Query/BaseHeader RPC
 * method.
 */
export interface QueryBaseHeaderResponse {
  header?: BTCHeaderInfoResponse;
}
export interface QueryBaseHeaderResponseProtoMsg {
  typeUrl: '/babylon.btclightclient.v1.QueryBaseHeaderResponse';
  value: Uint8Array;
}
/**
 * QueryBaseHeaderResponse is the response type for the Query/BaseHeader RPC
 * method.
 */
export interface QueryBaseHeaderResponseAmino {
  header?: BTCHeaderInfoResponseAmino;
}
export interface QueryBaseHeaderResponseAminoMsg {
  type: '/babylon.btclightclient.v1.QueryBaseHeaderResponse';
  value: QueryBaseHeaderResponseAmino;
}
/**
 * QueryBaseHeaderResponse is the response type for the Query/BaseHeader RPC
 * method.
 */
export interface QueryBaseHeaderResponseSDKType {
  header?: BTCHeaderInfoResponseSDKType;
}
/**
 * QueryMainChainDepthRequest is the request type for the Query/MainChainDepth RPC
 * it contains hex encoded hash of btc block header as parameter
 */
export interface QueryHeaderDepthRequest {
  hash: string;
}
export interface QueryHeaderDepthRequestProtoMsg {
  typeUrl: '/babylon.btclightclient.v1.QueryHeaderDepthRequest';
  value: Uint8Array;
}
/**
 * QueryMainChainDepthRequest is the request type for the Query/MainChainDepth RPC
 * it contains hex encoded hash of btc block header as parameter
 */
export interface QueryHeaderDepthRequestAmino {
  hash?: string;
}
export interface QueryHeaderDepthRequestAminoMsg {
  type: '/babylon.btclightclient.v1.QueryHeaderDepthRequest';
  value: QueryHeaderDepthRequestAmino;
}
/**
 * QueryMainChainDepthRequest is the request type for the Query/MainChainDepth RPC
 * it contains hex encoded hash of btc block header as parameter
 */
export interface QueryHeaderDepthRequestSDKType {
  hash: string;
}
/**
 * QueryMainChainDepthResponse is the response type for the Query/MainChainDepth RPC
 * it contains depth of the block in main chain
 */
export interface QueryHeaderDepthResponse {
  depth: bigint;
}
export interface QueryHeaderDepthResponseProtoMsg {
  typeUrl: '/babylon.btclightclient.v1.QueryHeaderDepthResponse';
  value: Uint8Array;
}
/**
 * QueryMainChainDepthResponse is the response type for the Query/MainChainDepth RPC
 * it contains depth of the block in main chain
 */
export interface QueryHeaderDepthResponseAmino {
  depth?: string;
}
export interface QueryHeaderDepthResponseAminoMsg {
  type: '/babylon.btclightclient.v1.QueryHeaderDepthResponse';
  value: QueryHeaderDepthResponseAmino;
}
/**
 * QueryMainChainDepthResponse is the response type for the Query/MainChainDepth RPC
 * it contains depth of the block in main chain
 */
export interface QueryHeaderDepthResponseSDKType {
  depth: bigint;
}
/**
 * BTCHeaderInfoResponse is a structure that contains all relevant information about a
 * BTC header response
 *  - Full header as string hex.
 *  - Header hash for easy retrieval as string hex.
 *  - Height of the header in the BTC chain.
 *  - Total work spent on the header. This is the sum of the work corresponding
 *  to the header Bits field
 *    and the total work of the header.
 */
export interface BTCHeaderInfoResponse {
  headerHex: string;
  hashHex: string;
  height: bigint;
  /** Work is the sdkmath.Uint as string. */
  work: string;
}
export interface BTCHeaderInfoResponseProtoMsg {
  typeUrl: '/babylon.btclightclient.v1.BTCHeaderInfoResponse';
  value: Uint8Array;
}
/**
 * BTCHeaderInfoResponse is a structure that contains all relevant information about a
 * BTC header response
 *  - Full header as string hex.
 *  - Header hash for easy retrieval as string hex.
 *  - Height of the header in the BTC chain.
 *  - Total work spent on the header. This is the sum of the work corresponding
 *  to the header Bits field
 *    and the total work of the header.
 */
export interface BTCHeaderInfoResponseAmino {
  header_hex?: string;
  hash_hex?: string;
  height?: string;
  /** Work is the sdkmath.Uint as string. */
  work?: string;
}
export interface BTCHeaderInfoResponseAminoMsg {
  type: '/babylon.btclightclient.v1.BTCHeaderInfoResponse';
  value: BTCHeaderInfoResponseAmino;
}
/**
 * BTCHeaderInfoResponse is a structure that contains all relevant information about a
 * BTC header response
 *  - Full header as string hex.
 *  - Header hash for easy retrieval as string hex.
 *  - Height of the header in the BTC chain.
 *  - Total work spent on the header. This is the sum of the work corresponding
 *  to the header Bits field
 *    and the total work of the header.
 */
export interface BTCHeaderInfoResponseSDKType {
  header_hex: string;
  hash_hex: string;
  height: bigint;
  work: string;
}
function createBaseQueryParamsRequest(): QueryParamsRequest {
  return {};
}
export const QueryParamsRequest = {
  typeUrl: '/babylon.btclightclient.v1.QueryParamsRequest',
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
      typeUrl: '/babylon.btclightclient.v1.QueryParamsRequest',
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
  typeUrl: '/babylon.btclightclient.v1.QueryParamsResponse',
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
      typeUrl: '/babylon.btclightclient.v1.QueryParamsResponse',
      value: QueryParamsResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryHashesRequest(): QueryHashesRequest {
  return {
    pagination: undefined,
  };
}
export const QueryHashesRequest = {
  typeUrl: '/babylon.btclightclient.v1.QueryHashesRequest',
  encode(message: QueryHashesRequest, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.pagination !== undefined) {
      PageRequest.encode(message.pagination, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): QueryHashesRequest {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryHashesRequest();
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
  fromPartial(object: Partial<QueryHashesRequest>): QueryHashesRequest {
    const message = createBaseQueryHashesRequest();
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageRequest.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromAmino(object: QueryHashesRequestAmino): QueryHashesRequest {
    const message = createBaseQueryHashesRequest();
    if (object.pagination !== undefined && object.pagination !== null) {
      message.pagination = PageRequest.fromAmino(object.pagination);
    }
    return message;
  },
  toAmino(message: QueryHashesRequest): QueryHashesRequestAmino {
    const obj: any = {};
    obj.pagination = message.pagination ? PageRequest.toAmino(message.pagination) : undefined;
    return obj;
  },
  fromAminoMsg(object: QueryHashesRequestAminoMsg): QueryHashesRequest {
    return QueryHashesRequest.fromAmino(object.value);
  },
  fromProtoMsg(message: QueryHashesRequestProtoMsg): QueryHashesRequest {
    return QueryHashesRequest.decode(message.value);
  },
  toProto(message: QueryHashesRequest): Uint8Array {
    return QueryHashesRequest.encode(message).finish();
  },
  toProtoMsg(message: QueryHashesRequest): QueryHashesRequestProtoMsg {
    return {
      typeUrl: '/babylon.btclightclient.v1.QueryHashesRequest',
      value: QueryHashesRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryHashesResponse(): QueryHashesResponse {
  return {
    hashes: [],
    pagination: undefined,
  };
}
export const QueryHashesResponse = {
  typeUrl: '/babylon.btclightclient.v1.QueryHashesResponse',
  encode(message: QueryHashesResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    for (const v of message.hashes) {
      writer.uint32(10).bytes(v!);
    }
    if (message.pagination !== undefined) {
      PageResponse.encode(message.pagination, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): QueryHashesResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryHashesResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.hashes.push(reader.bytes());
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
  fromPartial(object: Partial<QueryHashesResponse>): QueryHashesResponse {
    const message = createBaseQueryHashesResponse();
    message.hashes = object.hashes?.map((e) => e) || [];
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageResponse.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromAmino(object: QueryHashesResponseAmino): QueryHashesResponse {
    const message = createBaseQueryHashesResponse();
    message.hashes = object.hashes?.map((e) => bytesFromBase64(e)) || [];
    if (object.pagination !== undefined && object.pagination !== null) {
      message.pagination = PageResponse.fromAmino(object.pagination);
    }
    return message;
  },
  toAmino(message: QueryHashesResponse): QueryHashesResponseAmino {
    const obj: any = {};
    if (message.hashes) {
      obj.hashes = message.hashes.map((e) => base64FromBytes(e));
    } else {
      obj.hashes = message.hashes;
    }
    obj.pagination = message.pagination ? PageResponse.toAmino(message.pagination) : undefined;
    return obj;
  },
  fromAminoMsg(object: QueryHashesResponseAminoMsg): QueryHashesResponse {
    return QueryHashesResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: QueryHashesResponseProtoMsg): QueryHashesResponse {
    return QueryHashesResponse.decode(message.value);
  },
  toProto(message: QueryHashesResponse): Uint8Array {
    return QueryHashesResponse.encode(message).finish();
  },
  toProtoMsg(message: QueryHashesResponse): QueryHashesResponseProtoMsg {
    return {
      typeUrl: '/babylon.btclightclient.v1.QueryHashesResponse',
      value: QueryHashesResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryContainsRequest(): QueryContainsRequest {
  return {
    hash: new Uint8Array(),
  };
}
export const QueryContainsRequest = {
  typeUrl: '/babylon.btclightclient.v1.QueryContainsRequest',
  encode(message: QueryContainsRequest, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.hash.length !== 0) {
      writer.uint32(10).bytes(message.hash);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): QueryContainsRequest {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryContainsRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.hash = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<QueryContainsRequest>): QueryContainsRequest {
    const message = createBaseQueryContainsRequest();
    message.hash = object.hash ?? new Uint8Array();
    return message;
  },
  fromAmino(object: QueryContainsRequestAmino): QueryContainsRequest {
    const message = createBaseQueryContainsRequest();
    if (object.hash !== undefined && object.hash !== null) {
      message.hash = bytesFromBase64(object.hash);
    }
    return message;
  },
  toAmino(message: QueryContainsRequest): QueryContainsRequestAmino {
    const obj: any = {};
    obj.hash = message.hash ? base64FromBytes(message.hash) : undefined;
    return obj;
  },
  fromAminoMsg(object: QueryContainsRequestAminoMsg): QueryContainsRequest {
    return QueryContainsRequest.fromAmino(object.value);
  },
  fromProtoMsg(message: QueryContainsRequestProtoMsg): QueryContainsRequest {
    return QueryContainsRequest.decode(message.value);
  },
  toProto(message: QueryContainsRequest): Uint8Array {
    return QueryContainsRequest.encode(message).finish();
  },
  toProtoMsg(message: QueryContainsRequest): QueryContainsRequestProtoMsg {
    return {
      typeUrl: '/babylon.btclightclient.v1.QueryContainsRequest',
      value: QueryContainsRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryContainsResponse(): QueryContainsResponse {
  return {
    contains: false,
  };
}
export const QueryContainsResponse = {
  typeUrl: '/babylon.btclightclient.v1.QueryContainsResponse',
  encode(message: QueryContainsResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.contains === true) {
      writer.uint32(8).bool(message.contains);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): QueryContainsResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryContainsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.contains = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<QueryContainsResponse>): QueryContainsResponse {
    const message = createBaseQueryContainsResponse();
    message.contains = object.contains ?? false;
    return message;
  },
  fromAmino(object: QueryContainsResponseAmino): QueryContainsResponse {
    const message = createBaseQueryContainsResponse();
    if (object.contains !== undefined && object.contains !== null) {
      message.contains = object.contains;
    }
    return message;
  },
  toAmino(message: QueryContainsResponse): QueryContainsResponseAmino {
    const obj: any = {};
    obj.contains = message.contains === false ? undefined : message.contains;
    return obj;
  },
  fromAminoMsg(object: QueryContainsResponseAminoMsg): QueryContainsResponse {
    return QueryContainsResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: QueryContainsResponseProtoMsg): QueryContainsResponse {
    return QueryContainsResponse.decode(message.value);
  },
  toProto(message: QueryContainsResponse): Uint8Array {
    return QueryContainsResponse.encode(message).finish();
  },
  toProtoMsg(message: QueryContainsResponse): QueryContainsResponseProtoMsg {
    return {
      typeUrl: '/babylon.btclightclient.v1.QueryContainsResponse',
      value: QueryContainsResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryContainsBytesRequest(): QueryContainsBytesRequest {
  return {
    hash: new Uint8Array(),
  };
}
export const QueryContainsBytesRequest = {
  typeUrl: '/babylon.btclightclient.v1.QueryContainsBytesRequest',
  encode(message: QueryContainsBytesRequest, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.hash.length !== 0) {
      writer.uint32(10).bytes(message.hash);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): QueryContainsBytesRequest {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryContainsBytesRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.hash = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<QueryContainsBytesRequest>): QueryContainsBytesRequest {
    const message = createBaseQueryContainsBytesRequest();
    message.hash = object.hash ?? new Uint8Array();
    return message;
  },
  fromAmino(object: QueryContainsBytesRequestAmino): QueryContainsBytesRequest {
    const message = createBaseQueryContainsBytesRequest();
    if (object.hash !== undefined && object.hash !== null) {
      message.hash = bytesFromBase64(object.hash);
    }
    return message;
  },
  toAmino(message: QueryContainsBytesRequest): QueryContainsBytesRequestAmino {
    const obj: any = {};
    obj.hash = message.hash ? base64FromBytes(message.hash) : undefined;
    return obj;
  },
  fromAminoMsg(object: QueryContainsBytesRequestAminoMsg): QueryContainsBytesRequest {
    return QueryContainsBytesRequest.fromAmino(object.value);
  },
  fromProtoMsg(message: QueryContainsBytesRequestProtoMsg): QueryContainsBytesRequest {
    return QueryContainsBytesRequest.decode(message.value);
  },
  toProto(message: QueryContainsBytesRequest): Uint8Array {
    return QueryContainsBytesRequest.encode(message).finish();
  },
  toProtoMsg(message: QueryContainsBytesRequest): QueryContainsBytesRequestProtoMsg {
    return {
      typeUrl: '/babylon.btclightclient.v1.QueryContainsBytesRequest',
      value: QueryContainsBytesRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryContainsBytesResponse(): QueryContainsBytesResponse {
  return {
    contains: false,
  };
}
export const QueryContainsBytesResponse = {
  typeUrl: '/babylon.btclightclient.v1.QueryContainsBytesResponse',
  encode(message: QueryContainsBytesResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.contains === true) {
      writer.uint32(8).bool(message.contains);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): QueryContainsBytesResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryContainsBytesResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.contains = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<QueryContainsBytesResponse>): QueryContainsBytesResponse {
    const message = createBaseQueryContainsBytesResponse();
    message.contains = object.contains ?? false;
    return message;
  },
  fromAmino(object: QueryContainsBytesResponseAmino): QueryContainsBytesResponse {
    const message = createBaseQueryContainsBytesResponse();
    if (object.contains !== undefined && object.contains !== null) {
      message.contains = object.contains;
    }
    return message;
  },
  toAmino(message: QueryContainsBytesResponse): QueryContainsBytesResponseAmino {
    const obj: any = {};
    obj.contains = message.contains === false ? undefined : message.contains;
    return obj;
  },
  fromAminoMsg(object: QueryContainsBytesResponseAminoMsg): QueryContainsBytesResponse {
    return QueryContainsBytesResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: QueryContainsBytesResponseProtoMsg): QueryContainsBytesResponse {
    return QueryContainsBytesResponse.decode(message.value);
  },
  toProto(message: QueryContainsBytesResponse): Uint8Array {
    return QueryContainsBytesResponse.encode(message).finish();
  },
  toProtoMsg(message: QueryContainsBytesResponse): QueryContainsBytesResponseProtoMsg {
    return {
      typeUrl: '/babylon.btclightclient.v1.QueryContainsBytesResponse',
      value: QueryContainsBytesResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryMainChainRequest(): QueryMainChainRequest {
  return {
    pagination: undefined,
  };
}
export const QueryMainChainRequest = {
  typeUrl: '/babylon.btclightclient.v1.QueryMainChainRequest',
  encode(message: QueryMainChainRequest, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.pagination !== undefined) {
      PageRequest.encode(message.pagination, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): QueryMainChainRequest {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryMainChainRequest();
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
  fromPartial(object: Partial<QueryMainChainRequest>): QueryMainChainRequest {
    const message = createBaseQueryMainChainRequest();
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageRequest.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromAmino(object: QueryMainChainRequestAmino): QueryMainChainRequest {
    const message = createBaseQueryMainChainRequest();
    if (object.pagination !== undefined && object.pagination !== null) {
      message.pagination = PageRequest.fromAmino(object.pagination);
    }
    return message;
  },
  toAmino(message: QueryMainChainRequest): QueryMainChainRequestAmino {
    const obj: any = {};
    obj.pagination = message.pagination ? PageRequest.toAmino(message.pagination) : undefined;
    return obj;
  },
  fromAminoMsg(object: QueryMainChainRequestAminoMsg): QueryMainChainRequest {
    return QueryMainChainRequest.fromAmino(object.value);
  },
  fromProtoMsg(message: QueryMainChainRequestProtoMsg): QueryMainChainRequest {
    return QueryMainChainRequest.decode(message.value);
  },
  toProto(message: QueryMainChainRequest): Uint8Array {
    return QueryMainChainRequest.encode(message).finish();
  },
  toProtoMsg(message: QueryMainChainRequest): QueryMainChainRequestProtoMsg {
    return {
      typeUrl: '/babylon.btclightclient.v1.QueryMainChainRequest',
      value: QueryMainChainRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryMainChainResponse(): QueryMainChainResponse {
  return {
    headers: [],
    pagination: undefined,
  };
}
export const QueryMainChainResponse = {
  typeUrl: '/babylon.btclightclient.v1.QueryMainChainResponse',
  encode(message: QueryMainChainResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    for (const v of message.headers) {
      BTCHeaderInfoResponse.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    if (message.pagination !== undefined) {
      PageResponse.encode(message.pagination, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): QueryMainChainResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryMainChainResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.headers.push(BTCHeaderInfoResponse.decode(reader, reader.uint32()));
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
  fromPartial(object: Partial<QueryMainChainResponse>): QueryMainChainResponse {
    const message = createBaseQueryMainChainResponse();
    message.headers = object.headers?.map((e) => BTCHeaderInfoResponse.fromPartial(e)) || [];
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageResponse.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromAmino(object: QueryMainChainResponseAmino): QueryMainChainResponse {
    const message = createBaseQueryMainChainResponse();
    message.headers = object.headers?.map((e) => BTCHeaderInfoResponse.fromAmino(e)) || [];
    if (object.pagination !== undefined && object.pagination !== null) {
      message.pagination = PageResponse.fromAmino(object.pagination);
    }
    return message;
  },
  toAmino(message: QueryMainChainResponse): QueryMainChainResponseAmino {
    const obj: any = {};
    if (message.headers) {
      obj.headers = message.headers.map((e) => (e ? BTCHeaderInfoResponse.toAmino(e) : undefined));
    } else {
      obj.headers = message.headers;
    }
    obj.pagination = message.pagination ? PageResponse.toAmino(message.pagination) : undefined;
    return obj;
  },
  fromAminoMsg(object: QueryMainChainResponseAminoMsg): QueryMainChainResponse {
    return QueryMainChainResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: QueryMainChainResponseProtoMsg): QueryMainChainResponse {
    return QueryMainChainResponse.decode(message.value);
  },
  toProto(message: QueryMainChainResponse): Uint8Array {
    return QueryMainChainResponse.encode(message).finish();
  },
  toProtoMsg(message: QueryMainChainResponse): QueryMainChainResponseProtoMsg {
    return {
      typeUrl: '/babylon.btclightclient.v1.QueryMainChainResponse',
      value: QueryMainChainResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryTipRequest(): QueryTipRequest {
  return {};
}
export const QueryTipRequest = {
  typeUrl: '/babylon.btclightclient.v1.QueryTipRequest',
  encode(_: QueryTipRequest, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): QueryTipRequest {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryTipRequest();
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
  fromPartial(_: Partial<QueryTipRequest>): QueryTipRequest {
    const message = createBaseQueryTipRequest();
    return message;
  },
  fromAmino(_: QueryTipRequestAmino): QueryTipRequest {
    const message = createBaseQueryTipRequest();
    return message;
  },
  toAmino(_: QueryTipRequest): QueryTipRequestAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: QueryTipRequestAminoMsg): QueryTipRequest {
    return QueryTipRequest.fromAmino(object.value);
  },
  fromProtoMsg(message: QueryTipRequestProtoMsg): QueryTipRequest {
    return QueryTipRequest.decode(message.value);
  },
  toProto(message: QueryTipRequest): Uint8Array {
    return QueryTipRequest.encode(message).finish();
  },
  toProtoMsg(message: QueryTipRequest): QueryTipRequestProtoMsg {
    return {
      typeUrl: '/babylon.btclightclient.v1.QueryTipRequest',
      value: QueryTipRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryTipResponse(): QueryTipResponse {
  return {
    header: undefined,
  };
}
export const QueryTipResponse = {
  typeUrl: '/babylon.btclightclient.v1.QueryTipResponse',
  encode(message: QueryTipResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.header !== undefined) {
      BTCHeaderInfoResponse.encode(message.header, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): QueryTipResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryTipResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.header = BTCHeaderInfoResponse.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<QueryTipResponse>): QueryTipResponse {
    const message = createBaseQueryTipResponse();
    message.header =
      object.header !== undefined && object.header !== null
        ? BTCHeaderInfoResponse.fromPartial(object.header)
        : undefined;
    return message;
  },
  fromAmino(object: QueryTipResponseAmino): QueryTipResponse {
    const message = createBaseQueryTipResponse();
    if (object.header !== undefined && object.header !== null) {
      message.header = BTCHeaderInfoResponse.fromAmino(object.header);
    }
    return message;
  },
  toAmino(message: QueryTipResponse): QueryTipResponseAmino {
    const obj: any = {};
    obj.header = message.header ? BTCHeaderInfoResponse.toAmino(message.header) : undefined;
    return obj;
  },
  fromAminoMsg(object: QueryTipResponseAminoMsg): QueryTipResponse {
    return QueryTipResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: QueryTipResponseProtoMsg): QueryTipResponse {
    return QueryTipResponse.decode(message.value);
  },
  toProto(message: QueryTipResponse): Uint8Array {
    return QueryTipResponse.encode(message).finish();
  },
  toProtoMsg(message: QueryTipResponse): QueryTipResponseProtoMsg {
    return {
      typeUrl: '/babylon.btclightclient.v1.QueryTipResponse',
      value: QueryTipResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryBaseHeaderRequest(): QueryBaseHeaderRequest {
  return {};
}
export const QueryBaseHeaderRequest = {
  typeUrl: '/babylon.btclightclient.v1.QueryBaseHeaderRequest',
  encode(_: QueryBaseHeaderRequest, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): QueryBaseHeaderRequest {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryBaseHeaderRequest();
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
  fromPartial(_: Partial<QueryBaseHeaderRequest>): QueryBaseHeaderRequest {
    const message = createBaseQueryBaseHeaderRequest();
    return message;
  },
  fromAmino(_: QueryBaseHeaderRequestAmino): QueryBaseHeaderRequest {
    const message = createBaseQueryBaseHeaderRequest();
    return message;
  },
  toAmino(_: QueryBaseHeaderRequest): QueryBaseHeaderRequestAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: QueryBaseHeaderRequestAminoMsg): QueryBaseHeaderRequest {
    return QueryBaseHeaderRequest.fromAmino(object.value);
  },
  fromProtoMsg(message: QueryBaseHeaderRequestProtoMsg): QueryBaseHeaderRequest {
    return QueryBaseHeaderRequest.decode(message.value);
  },
  toProto(message: QueryBaseHeaderRequest): Uint8Array {
    return QueryBaseHeaderRequest.encode(message).finish();
  },
  toProtoMsg(message: QueryBaseHeaderRequest): QueryBaseHeaderRequestProtoMsg {
    return {
      typeUrl: '/babylon.btclightclient.v1.QueryBaseHeaderRequest',
      value: QueryBaseHeaderRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryBaseHeaderResponse(): QueryBaseHeaderResponse {
  return {
    header: undefined,
  };
}
export const QueryBaseHeaderResponse = {
  typeUrl: '/babylon.btclightclient.v1.QueryBaseHeaderResponse',
  encode(message: QueryBaseHeaderResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.header !== undefined) {
      BTCHeaderInfoResponse.encode(message.header, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): QueryBaseHeaderResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryBaseHeaderResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.header = BTCHeaderInfoResponse.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<QueryBaseHeaderResponse>): QueryBaseHeaderResponse {
    const message = createBaseQueryBaseHeaderResponse();
    message.header =
      object.header !== undefined && object.header !== null
        ? BTCHeaderInfoResponse.fromPartial(object.header)
        : undefined;
    return message;
  },
  fromAmino(object: QueryBaseHeaderResponseAmino): QueryBaseHeaderResponse {
    const message = createBaseQueryBaseHeaderResponse();
    if (object.header !== undefined && object.header !== null) {
      message.header = BTCHeaderInfoResponse.fromAmino(object.header);
    }
    return message;
  },
  toAmino(message: QueryBaseHeaderResponse): QueryBaseHeaderResponseAmino {
    const obj: any = {};
    obj.header = message.header ? BTCHeaderInfoResponse.toAmino(message.header) : undefined;
    return obj;
  },
  fromAminoMsg(object: QueryBaseHeaderResponseAminoMsg): QueryBaseHeaderResponse {
    return QueryBaseHeaderResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: QueryBaseHeaderResponseProtoMsg): QueryBaseHeaderResponse {
    return QueryBaseHeaderResponse.decode(message.value);
  },
  toProto(message: QueryBaseHeaderResponse): Uint8Array {
    return QueryBaseHeaderResponse.encode(message).finish();
  },
  toProtoMsg(message: QueryBaseHeaderResponse): QueryBaseHeaderResponseProtoMsg {
    return {
      typeUrl: '/babylon.btclightclient.v1.QueryBaseHeaderResponse',
      value: QueryBaseHeaderResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryHeaderDepthRequest(): QueryHeaderDepthRequest {
  return {
    hash: '',
  };
}
export const QueryHeaderDepthRequest = {
  typeUrl: '/babylon.btclightclient.v1.QueryHeaderDepthRequest',
  encode(message: QueryHeaderDepthRequest, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.hash !== '') {
      writer.uint32(10).string(message.hash);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): QueryHeaderDepthRequest {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryHeaderDepthRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.hash = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<QueryHeaderDepthRequest>): QueryHeaderDepthRequest {
    const message = createBaseQueryHeaderDepthRequest();
    message.hash = object.hash ?? '';
    return message;
  },
  fromAmino(object: QueryHeaderDepthRequestAmino): QueryHeaderDepthRequest {
    const message = createBaseQueryHeaderDepthRequest();
    if (object.hash !== undefined && object.hash !== null) {
      message.hash = object.hash;
    }
    return message;
  },
  toAmino(message: QueryHeaderDepthRequest): QueryHeaderDepthRequestAmino {
    const obj: any = {};
    obj.hash = message.hash === '' ? undefined : message.hash;
    return obj;
  },
  fromAminoMsg(object: QueryHeaderDepthRequestAminoMsg): QueryHeaderDepthRequest {
    return QueryHeaderDepthRequest.fromAmino(object.value);
  },
  fromProtoMsg(message: QueryHeaderDepthRequestProtoMsg): QueryHeaderDepthRequest {
    return QueryHeaderDepthRequest.decode(message.value);
  },
  toProto(message: QueryHeaderDepthRequest): Uint8Array {
    return QueryHeaderDepthRequest.encode(message).finish();
  },
  toProtoMsg(message: QueryHeaderDepthRequest): QueryHeaderDepthRequestProtoMsg {
    return {
      typeUrl: '/babylon.btclightclient.v1.QueryHeaderDepthRequest',
      value: QueryHeaderDepthRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryHeaderDepthResponse(): QueryHeaderDepthResponse {
  return {
    depth: BigInt(0),
  };
}
export const QueryHeaderDepthResponse = {
  typeUrl: '/babylon.btclightclient.v1.QueryHeaderDepthResponse',
  encode(message: QueryHeaderDepthResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.depth !== BigInt(0)) {
      writer.uint32(8).uint64(message.depth);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): QueryHeaderDepthResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryHeaderDepthResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.depth = reader.uint64();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<QueryHeaderDepthResponse>): QueryHeaderDepthResponse {
    const message = createBaseQueryHeaderDepthResponse();
    message.depth = object.depth !== undefined && object.depth !== null ? BigInt(object.depth.toString()) : BigInt(0);
    return message;
  },
  fromAmino(object: QueryHeaderDepthResponseAmino): QueryHeaderDepthResponse {
    const message = createBaseQueryHeaderDepthResponse();
    if (object.depth !== undefined && object.depth !== null) {
      message.depth = BigInt(object.depth);
    }
    return message;
  },
  toAmino(message: QueryHeaderDepthResponse): QueryHeaderDepthResponseAmino {
    const obj: any = {};
    obj.depth = message.depth !== BigInt(0) ? message.depth?.toString() : undefined;
    return obj;
  },
  fromAminoMsg(object: QueryHeaderDepthResponseAminoMsg): QueryHeaderDepthResponse {
    return QueryHeaderDepthResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: QueryHeaderDepthResponseProtoMsg): QueryHeaderDepthResponse {
    return QueryHeaderDepthResponse.decode(message.value);
  },
  toProto(message: QueryHeaderDepthResponse): Uint8Array {
    return QueryHeaderDepthResponse.encode(message).finish();
  },
  toProtoMsg(message: QueryHeaderDepthResponse): QueryHeaderDepthResponseProtoMsg {
    return {
      typeUrl: '/babylon.btclightclient.v1.QueryHeaderDepthResponse',
      value: QueryHeaderDepthResponse.encode(message).finish(),
    };
  },
};
function createBaseBTCHeaderInfoResponse(): BTCHeaderInfoResponse {
  return {
    headerHex: '',
    hashHex: '',
    height: BigInt(0),
    work: '',
  };
}
export const BTCHeaderInfoResponse = {
  typeUrl: '/babylon.btclightclient.v1.BTCHeaderInfoResponse',
  encode(message: BTCHeaderInfoResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.headerHex !== '') {
      writer.uint32(10).string(message.headerHex);
    }
    if (message.hashHex !== '') {
      writer.uint32(18).string(message.hashHex);
    }
    if (message.height !== BigInt(0)) {
      writer.uint32(24).uint64(message.height);
    }
    if (message.work !== '') {
      writer.uint32(34).string(message.work);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): BTCHeaderInfoResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBTCHeaderInfoResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.headerHex = reader.string();
          break;
        case 2:
          message.hashHex = reader.string();
          break;
        case 3:
          message.height = reader.uint64();
          break;
        case 4:
          message.work = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<BTCHeaderInfoResponse>): BTCHeaderInfoResponse {
    const message = createBaseBTCHeaderInfoResponse();
    message.headerHex = object.headerHex ?? '';
    message.hashHex = object.hashHex ?? '';
    message.height =
      object.height !== undefined && object.height !== null ? BigInt(object.height.toString()) : BigInt(0);
    message.work = object.work ?? '';
    return message;
  },
  fromAmino(object: BTCHeaderInfoResponseAmino): BTCHeaderInfoResponse {
    const message = createBaseBTCHeaderInfoResponse();
    if (object.header_hex !== undefined && object.header_hex !== null) {
      message.headerHex = object.header_hex;
    }
    if (object.hash_hex !== undefined && object.hash_hex !== null) {
      message.hashHex = object.hash_hex;
    }
    if (object.height !== undefined && object.height !== null) {
      message.height = BigInt(object.height);
    }
    if (object.work !== undefined && object.work !== null) {
      message.work = object.work;
    }
    return message;
  },
  toAmino(message: BTCHeaderInfoResponse): BTCHeaderInfoResponseAmino {
    const obj: any = {};
    obj.header_hex = message.headerHex === '' ? undefined : message.headerHex;
    obj.hash_hex = message.hashHex === '' ? undefined : message.hashHex;
    obj.height = message.height !== BigInt(0) ? message.height?.toString() : undefined;
    obj.work = message.work === '' ? undefined : message.work;
    return obj;
  },
  fromAminoMsg(object: BTCHeaderInfoResponseAminoMsg): BTCHeaderInfoResponse {
    return BTCHeaderInfoResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: BTCHeaderInfoResponseProtoMsg): BTCHeaderInfoResponse {
    return BTCHeaderInfoResponse.decode(message.value);
  },
  toProto(message: BTCHeaderInfoResponse): Uint8Array {
    return BTCHeaderInfoResponse.encode(message).finish();
  },
  toProtoMsg(message: BTCHeaderInfoResponse): BTCHeaderInfoResponseProtoMsg {
    return {
      typeUrl: '/babylon.btclightclient.v1.BTCHeaderInfoResponse',
      value: BTCHeaderInfoResponse.encode(message).finish(),
    };
  },
};
