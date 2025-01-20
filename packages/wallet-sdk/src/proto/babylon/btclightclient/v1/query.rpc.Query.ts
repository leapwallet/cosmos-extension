import { createProtobufRpcClient, QueryClient } from '@cosmjs/stargate';

import { BinaryReader } from '../../../binary';
import { Rpc } from '../../../helpers';
import {
  QueryBaseHeaderRequest,
  QueryBaseHeaderResponse,
  QueryContainsBytesRequest,
  QueryContainsBytesResponse,
  QueryContainsRequest,
  QueryContainsResponse,
  QueryHashesRequest,
  QueryHashesResponse,
  QueryHeaderDepthRequest,
  QueryHeaderDepthResponse,
  QueryMainChainRequest,
  QueryMainChainResponse,
  QueryParamsRequest,
  QueryParamsResponse,
  QueryTipRequest,
  QueryTipResponse,
} from './query';
/** Query defines the gRPC querier service. */
export interface Query {
  /** Params queries the parameters of the module. */
  params(request?: QueryParamsRequest): Promise<QueryParamsResponse>;
  /** Hashes retrieves the hashes maintained by the module. */
  hashes(request?: QueryHashesRequest): Promise<QueryHashesResponse>;
  /** Contains checks whether a hash is maintained by the module. */
  contains(request: QueryContainsRequest): Promise<QueryContainsResponse>;
  /**
   * ContainsBytes is a temporary method that
   * checks whether a hash is maintained by the module.
   * See discussion at https://github.com/babylonchain/babylon/pull/132
   * for more details.
   */
  containsBytes(request: QueryContainsBytesRequest): Promise<QueryContainsBytesResponse>;
  /** MainChain returns the canonical chain */
  mainChain(request?: QueryMainChainRequest): Promise<QueryMainChainResponse>;
  /** Tip return best header on canonical chain */
  tip(request?: QueryTipRequest): Promise<QueryTipResponse>;
  /**
   * BaseHeader returns the base BTC header of the chain. This header is defined
   * on genesis.
   */
  baseHeader(request?: QueryBaseHeaderRequest): Promise<QueryBaseHeaderResponse>;
  /**
   * HeaderDepth returns the depth of the header in main chain or error if the
   * block is not found or it exists on fork
   */
  headerDepth(request: QueryHeaderDepthRequest): Promise<QueryHeaderDepthResponse>;
}
export class QueryClientImpl implements Query {
  private readonly rpc: Rpc;
  constructor(rpc: Rpc) {
    this.rpc = rpc;
    this.params = this.params.bind(this);
    this.hashes = this.hashes.bind(this);
    this.contains = this.contains.bind(this);
    this.containsBytes = this.containsBytes.bind(this);
    this.mainChain = this.mainChain.bind(this);
    this.tip = this.tip.bind(this);
    this.baseHeader = this.baseHeader.bind(this);
    this.headerDepth = this.headerDepth.bind(this);
  }
  params(request: QueryParamsRequest = {}): Promise<QueryParamsResponse> {
    const data = QueryParamsRequest.encode(request).finish();
    const promise = this.rpc.request('babylon.btclightclient.v1.Query', 'Params', data);
    return promise.then((data) => QueryParamsResponse.decode(new BinaryReader(data)));
  }
  hashes(
    request: QueryHashesRequest = {
      pagination: undefined,
    },
  ): Promise<QueryHashesResponse> {
    const data = QueryHashesRequest.encode(request).finish();
    const promise = this.rpc.request('babylon.btclightclient.v1.Query', 'Hashes', data);
    return promise.then((data) => QueryHashesResponse.decode(new BinaryReader(data)));
  }
  contains(request: QueryContainsRequest): Promise<QueryContainsResponse> {
    const data = QueryContainsRequest.encode(request).finish();
    const promise = this.rpc.request('babylon.btclightclient.v1.Query', 'Contains', data);
    return promise.then((data) => QueryContainsResponse.decode(new BinaryReader(data)));
  }
  containsBytes(request: QueryContainsBytesRequest): Promise<QueryContainsBytesResponse> {
    const data = QueryContainsBytesRequest.encode(request).finish();
    const promise = this.rpc.request('babylon.btclightclient.v1.Query', 'ContainsBytes', data);
    return promise.then((data) => QueryContainsBytesResponse.decode(new BinaryReader(data)));
  }
  mainChain(
    request: QueryMainChainRequest = {
      pagination: undefined,
    },
  ): Promise<QueryMainChainResponse> {
    const data = QueryMainChainRequest.encode(request).finish();
    const promise = this.rpc.request('babylon.btclightclient.v1.Query', 'MainChain', data);
    return promise.then((data) => QueryMainChainResponse.decode(new BinaryReader(data)));
  }
  tip(request: QueryTipRequest = {}): Promise<QueryTipResponse> {
    const data = QueryTipRequest.encode(request).finish();
    const promise = this.rpc.request('babylon.btclightclient.v1.Query', 'Tip', data);
    return promise.then((data) => QueryTipResponse.decode(new BinaryReader(data)));
  }
  baseHeader(request: QueryBaseHeaderRequest = {}): Promise<QueryBaseHeaderResponse> {
    const data = QueryBaseHeaderRequest.encode(request).finish();
    const promise = this.rpc.request('babylon.btclightclient.v1.Query', 'BaseHeader', data);
    return promise.then((data) => QueryBaseHeaderResponse.decode(new BinaryReader(data)));
  }
  headerDepth(request: QueryHeaderDepthRequest): Promise<QueryHeaderDepthResponse> {
    const data = QueryHeaderDepthRequest.encode(request).finish();
    const promise = this.rpc.request('babylon.btclightclient.v1.Query', 'HeaderDepth', data);
    return promise.then((data) => QueryHeaderDepthResponse.decode(new BinaryReader(data)));
  }
}
export const createRpcQueryExtension = (base: QueryClient) => {
  const rpc = createProtobufRpcClient(base);
  const queryService = new QueryClientImpl(rpc);
  return {
    params(request?: QueryParamsRequest): Promise<QueryParamsResponse> {
      return queryService.params(request);
    },
    hashes(request?: QueryHashesRequest): Promise<QueryHashesResponse> {
      return queryService.hashes(request);
    },
    contains(request: QueryContainsRequest): Promise<QueryContainsResponse> {
      return queryService.contains(request);
    },
    containsBytes(request: QueryContainsBytesRequest): Promise<QueryContainsBytesResponse> {
      return queryService.containsBytes(request);
    },
    mainChain(request?: QueryMainChainRequest): Promise<QueryMainChainResponse> {
      return queryService.mainChain(request);
    },
    tip(request?: QueryTipRequest): Promise<QueryTipResponse> {
      return queryService.tip(request);
    },
    baseHeader(request?: QueryBaseHeaderRequest): Promise<QueryBaseHeaderResponse> {
      return queryService.baseHeader(request);
    },
    headerDepth(request: QueryHeaderDepthRequest): Promise<QueryHeaderDepthResponse> {
      return queryService.headerDepth(request);
    },
  };
};
