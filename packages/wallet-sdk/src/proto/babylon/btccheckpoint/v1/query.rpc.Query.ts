import { createProtobufRpcClient, QueryClient } from '@cosmjs/stargate';

import { BinaryReader } from '../../../binary';
import { Rpc } from '../../../helpers';
import {
  QueryBtcCheckpointInfoRequest,
  QueryBtcCheckpointInfoResponse,
  QueryBtcCheckpointsInfoRequest,
  QueryBtcCheckpointsInfoResponse,
  QueryEpochSubmissionsRequest,
  QueryEpochSubmissionsResponse,
  QueryParamsRequest,
  QueryParamsResponse,
} from './query';
/** Query defines the gRPC querier service. */
export interface Query {
  /** Parameters queries the parameters of the module. */
  params(request?: QueryParamsRequest): Promise<QueryParamsResponse>;
  /** BtcCheckpointInfo returns checkpoint info for a given epoch */
  btcCheckpointInfo(request: QueryBtcCheckpointInfoRequest): Promise<QueryBtcCheckpointInfoResponse>;
  /** BtcCheckpointsInfo returns checkpoint info for a range of epochs */
  btcCheckpointsInfo(request?: QueryBtcCheckpointsInfoRequest): Promise<QueryBtcCheckpointsInfoResponse>;
  /** EpochSubmissions returns all submissions for a given epoch */
  epochSubmissions(request: QueryEpochSubmissionsRequest): Promise<QueryEpochSubmissionsResponse>;
}
export class QueryClientImpl implements Query {
  private readonly rpc: Rpc;
  constructor(rpc: Rpc) {
    this.rpc = rpc;
    this.params = this.params.bind(this);
    this.btcCheckpointInfo = this.btcCheckpointInfo.bind(this);
    this.btcCheckpointsInfo = this.btcCheckpointsInfo.bind(this);
    this.epochSubmissions = this.epochSubmissions.bind(this);
  }
  params(request: QueryParamsRequest = {}): Promise<QueryParamsResponse> {
    const data = QueryParamsRequest.encode(request).finish();
    const promise = this.rpc.request('babylon.btccheckpoint.v1.Query', 'Params', data);
    return promise.then((data) => QueryParamsResponse.decode(new BinaryReader(data)));
  }
  btcCheckpointInfo(request: QueryBtcCheckpointInfoRequest): Promise<QueryBtcCheckpointInfoResponse> {
    const data = QueryBtcCheckpointInfoRequest.encode(request).finish();
    const promise = this.rpc.request('babylon.btccheckpoint.v1.Query', 'BtcCheckpointInfo', data);
    return promise.then((data) => QueryBtcCheckpointInfoResponse.decode(new BinaryReader(data)));
  }
  btcCheckpointsInfo(
    request: QueryBtcCheckpointsInfoRequest = {
      pagination: undefined,
    },
  ): Promise<QueryBtcCheckpointsInfoResponse> {
    const data = QueryBtcCheckpointsInfoRequest.encode(request).finish();
    const promise = this.rpc.request('babylon.btccheckpoint.v1.Query', 'BtcCheckpointsInfo', data);
    return promise.then((data) => QueryBtcCheckpointsInfoResponse.decode(new BinaryReader(data)));
  }
  epochSubmissions(request: QueryEpochSubmissionsRequest): Promise<QueryEpochSubmissionsResponse> {
    const data = QueryEpochSubmissionsRequest.encode(request).finish();
    const promise = this.rpc.request('babylon.btccheckpoint.v1.Query', 'EpochSubmissions', data);
    return promise.then((data) => QueryEpochSubmissionsResponse.decode(new BinaryReader(data)));
  }
}
export const createRpcQueryExtension = (base: QueryClient) => {
  const rpc = createProtobufRpcClient(base);
  const queryService = new QueryClientImpl(rpc);
  return {
    params(request?: QueryParamsRequest): Promise<QueryParamsResponse> {
      return queryService.params(request);
    },
    btcCheckpointInfo(request: QueryBtcCheckpointInfoRequest): Promise<QueryBtcCheckpointInfoResponse> {
      return queryService.btcCheckpointInfo(request);
    },
    btcCheckpointsInfo(request?: QueryBtcCheckpointsInfoRequest): Promise<QueryBtcCheckpointsInfoResponse> {
      return queryService.btcCheckpointsInfo(request);
    },
    epochSubmissions(request: QueryEpochSubmissionsRequest): Promise<QueryEpochSubmissionsResponse> {
      return queryService.epochSubmissions(request);
    },
  };
};
