import { createProtobufRpcClient, QueryClient } from '@cosmjs/stargate';

import { BinaryReader } from '../../../binary';
import { Rpc } from '../../../helpers';
import {
  QueryBlsPublicKeyListRequest,
  QueryBlsPublicKeyListResponse,
  QueryEpochStatusRequest,
  QueryEpochStatusResponse,
  QueryLastCheckpointWithStatusRequest,
  QueryLastCheckpointWithStatusResponse,
  QueryRawCheckpointListRequest,
  QueryRawCheckpointListResponse,
  QueryRawCheckpointRequest,
  QueryRawCheckpointResponse,
  QueryRawCheckpointsRequest,
  QueryRawCheckpointsResponse,
  QueryRecentEpochStatusCountRequest,
  QueryRecentEpochStatusCountResponse,
} from './query';
/** Query defines the gRPC querier service. */
export interface Query {
  /** RawCheckpointList queries all checkpoints that match the given status. */
  rawCheckpointList(request: QueryRawCheckpointListRequest): Promise<QueryRawCheckpointListResponse>;
  /** RawCheckpoint queries a checkpoints at a given epoch number. */
  rawCheckpoint(request: QueryRawCheckpointRequest): Promise<QueryRawCheckpointResponse>;
  /** RawCheckpoints queries checkpoints for a epoch range specified in pagination params. */
  rawCheckpoints(request?: QueryRawCheckpointsRequest): Promise<QueryRawCheckpointsResponse>;
  /**
   * BlsPublicKeyList queries a list of bls public keys of the validators at a
   * given epoch number.
   */
  blsPublicKeyList(request: QueryBlsPublicKeyListRequest): Promise<QueryBlsPublicKeyListResponse>;
  /** EpochStatus queries the status of the checkpoint at a given epoch */
  epochStatus(request: QueryEpochStatusRequest): Promise<QueryEpochStatusResponse>;
  /**
   * RecentEpochStatusCount queries the number of epochs with each status in
   * recent epochs
   */
  recentEpochStatusCount(request: QueryRecentEpochStatusCountRequest): Promise<QueryRecentEpochStatusCountResponse>;
  /**
   * LastCheckpointWithStatus queries the last checkpoint with a given status or
   * a more matured status
   */
  lastCheckpointWithStatus(
    request: QueryLastCheckpointWithStatusRequest,
  ): Promise<QueryLastCheckpointWithStatusResponse>;
}
export class QueryClientImpl implements Query {
  private readonly rpc: Rpc;
  constructor(rpc: Rpc) {
    this.rpc = rpc;
    this.rawCheckpointList = this.rawCheckpointList.bind(this);
    this.rawCheckpoint = this.rawCheckpoint.bind(this);
    this.rawCheckpoints = this.rawCheckpoints.bind(this);
    this.blsPublicKeyList = this.blsPublicKeyList.bind(this);
    this.epochStatus = this.epochStatus.bind(this);
    this.recentEpochStatusCount = this.recentEpochStatusCount.bind(this);
    this.lastCheckpointWithStatus = this.lastCheckpointWithStatus.bind(this);
  }
  rawCheckpointList(request: QueryRawCheckpointListRequest): Promise<QueryRawCheckpointListResponse> {
    const data = QueryRawCheckpointListRequest.encode(request).finish();
    const promise = this.rpc.request('babylon.checkpointing.v1.Query', 'RawCheckpointList', data);
    return promise.then((data) => QueryRawCheckpointListResponse.decode(new BinaryReader(data)));
  }
  rawCheckpoint(request: QueryRawCheckpointRequest): Promise<QueryRawCheckpointResponse> {
    const data = QueryRawCheckpointRequest.encode(request).finish();
    const promise = this.rpc.request('babylon.checkpointing.v1.Query', 'RawCheckpoint', data);
    return promise.then((data) => QueryRawCheckpointResponse.decode(new BinaryReader(data)));
  }
  rawCheckpoints(
    request: QueryRawCheckpointsRequest = {
      pagination: undefined,
    },
  ): Promise<QueryRawCheckpointsResponse> {
    const data = QueryRawCheckpointsRequest.encode(request).finish();
    const promise = this.rpc.request('babylon.checkpointing.v1.Query', 'RawCheckpoints', data);
    return promise.then((data) => QueryRawCheckpointsResponse.decode(new BinaryReader(data)));
  }
  blsPublicKeyList(request: QueryBlsPublicKeyListRequest): Promise<QueryBlsPublicKeyListResponse> {
    const data = QueryBlsPublicKeyListRequest.encode(request).finish();
    const promise = this.rpc.request('babylon.checkpointing.v1.Query', 'BlsPublicKeyList', data);
    return promise.then((data) => QueryBlsPublicKeyListResponse.decode(new BinaryReader(data)));
  }
  epochStatus(request: QueryEpochStatusRequest): Promise<QueryEpochStatusResponse> {
    const data = QueryEpochStatusRequest.encode(request).finish();
    const promise = this.rpc.request('babylon.checkpointing.v1.Query', 'EpochStatus', data);
    return promise.then((data) => QueryEpochStatusResponse.decode(new BinaryReader(data)));
  }
  recentEpochStatusCount(request: QueryRecentEpochStatusCountRequest): Promise<QueryRecentEpochStatusCountResponse> {
    const data = QueryRecentEpochStatusCountRequest.encode(request).finish();
    const promise = this.rpc.request('babylon.checkpointing.v1.Query', 'RecentEpochStatusCount', data);
    return promise.then((data) => QueryRecentEpochStatusCountResponse.decode(new BinaryReader(data)));
  }
  lastCheckpointWithStatus(
    request: QueryLastCheckpointWithStatusRequest,
  ): Promise<QueryLastCheckpointWithStatusResponse> {
    const data = QueryLastCheckpointWithStatusRequest.encode(request).finish();
    const promise = this.rpc.request('babylon.checkpointing.v1.Query', 'LastCheckpointWithStatus', data);
    return promise.then((data) => QueryLastCheckpointWithStatusResponse.decode(new BinaryReader(data)));
  }
}
export const createRpcQueryExtension = (base: QueryClient) => {
  const rpc = createProtobufRpcClient(base);
  const queryService = new QueryClientImpl(rpc);
  return {
    rawCheckpointList(request: QueryRawCheckpointListRequest): Promise<QueryRawCheckpointListResponse> {
      return queryService.rawCheckpointList(request);
    },
    rawCheckpoint(request: QueryRawCheckpointRequest): Promise<QueryRawCheckpointResponse> {
      return queryService.rawCheckpoint(request);
    },
    rawCheckpoints(request?: QueryRawCheckpointsRequest): Promise<QueryRawCheckpointsResponse> {
      return queryService.rawCheckpoints(request);
    },
    blsPublicKeyList(request: QueryBlsPublicKeyListRequest): Promise<QueryBlsPublicKeyListResponse> {
      return queryService.blsPublicKeyList(request);
    },
    epochStatus(request: QueryEpochStatusRequest): Promise<QueryEpochStatusResponse> {
      return queryService.epochStatus(request);
    },
    recentEpochStatusCount(request: QueryRecentEpochStatusCountRequest): Promise<QueryRecentEpochStatusCountResponse> {
      return queryService.recentEpochStatusCount(request);
    },
    lastCheckpointWithStatus(
      request: QueryLastCheckpointWithStatusRequest,
    ): Promise<QueryLastCheckpointWithStatusResponse> {
      return queryService.lastCheckpointWithStatus(request);
    },
  };
};
