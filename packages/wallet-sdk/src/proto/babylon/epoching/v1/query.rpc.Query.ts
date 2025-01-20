import { createProtobufRpcClient, QueryClient } from '@cosmjs/stargate';

import { BinaryReader } from '../../../binary';
import { Rpc } from '../../../helpers';
import {
  QueryCurrentEpochRequest,
  QueryCurrentEpochResponse,
  QueryDelegationLifecycleRequest,
  QueryDelegationLifecycleResponse,
  QueryEpochInfoRequest,
  QueryEpochInfoResponse,
  QueryEpochMsgsRequest,
  QueryEpochMsgsResponse,
  QueryEpochsInfoRequest,
  QueryEpochsInfoResponse,
  QueryEpochValSetRequest,
  QueryEpochValSetResponse,
  QueryLatestEpochMsgsRequest,
  QueryLatestEpochMsgsResponse,
  QueryParamsRequest,
  QueryParamsResponse,
  QueryValidatorLifecycleRequest,
  QueryValidatorLifecycleResponse,
} from './query';
/** Query defines the gRPC querier service. */
export interface Query {
  /** Params queries the parameters of the module. */
  params(request?: QueryParamsRequest): Promise<QueryParamsResponse>;
  /** EpochInfo queries the information of a given epoch */
  epochInfo(request: QueryEpochInfoRequest): Promise<QueryEpochInfoResponse>;
  /**
   * EpochsInfo queries the metadata of epochs in a given range, depending on
   * the parameters in the pagination request. Th main use case will be querying
   * the latest epochs in time order.
   */
  epochsInfo(request?: QueryEpochsInfoRequest): Promise<QueryEpochsInfoResponse>;
  /** CurrentEpoch queries the current epoch */
  currentEpoch(request?: QueryCurrentEpochRequest): Promise<QueryCurrentEpochResponse>;
  /** EpochMsgs queries the messages of a given epoch */
  epochMsgs(request: QueryEpochMsgsRequest): Promise<QueryEpochMsgsResponse>;
  /**
   * LatestEpochMsgs queries the messages within a given number of most recent
   * epochs
   */
  latestEpochMsgs(request: QueryLatestEpochMsgsRequest): Promise<QueryLatestEpochMsgsResponse>;
  /** ValidatorLifecycle queries the lifecycle of a given validator */
  validatorLifecycle(request: QueryValidatorLifecycleRequest): Promise<QueryValidatorLifecycleResponse>;
  /** DelegationLifecycle queries the lifecycle of a given delegation */
  delegationLifecycle(request: QueryDelegationLifecycleRequest): Promise<QueryDelegationLifecycleResponse>;
  /** EpochValSet queries the validator set of a given epoch */
  epochValSet(request: QueryEpochValSetRequest): Promise<QueryEpochValSetResponse>;
}
export class QueryClientImpl implements Query {
  private readonly rpc: Rpc;
  constructor(rpc: Rpc) {
    this.rpc = rpc;
    this.params = this.params.bind(this);
    this.epochInfo = this.epochInfo.bind(this);
    this.epochsInfo = this.epochsInfo.bind(this);
    this.currentEpoch = this.currentEpoch.bind(this);
    this.epochMsgs = this.epochMsgs.bind(this);
    this.latestEpochMsgs = this.latestEpochMsgs.bind(this);
    this.validatorLifecycle = this.validatorLifecycle.bind(this);
    this.delegationLifecycle = this.delegationLifecycle.bind(this);
    this.epochValSet = this.epochValSet.bind(this);
  }
  params(request: QueryParamsRequest = {}): Promise<QueryParamsResponse> {
    const data = QueryParamsRequest.encode(request).finish();
    const promise = this.rpc.request('babylon.epoching.v1.Query', 'Params', data);
    return promise.then((data) => QueryParamsResponse.decode(new BinaryReader(data)));
  }
  epochInfo(request: QueryEpochInfoRequest): Promise<QueryEpochInfoResponse> {
    const data = QueryEpochInfoRequest.encode(request).finish();
    const promise = this.rpc.request('babylon.epoching.v1.Query', 'EpochInfo', data);
    return promise.then((data) => QueryEpochInfoResponse.decode(new BinaryReader(data)));
  }
  epochsInfo(
    request: QueryEpochsInfoRequest = {
      pagination: undefined,
    },
  ): Promise<QueryEpochsInfoResponse> {
    const data = QueryEpochsInfoRequest.encode(request).finish();
    const promise = this.rpc.request('babylon.epoching.v1.Query', 'EpochsInfo', data);
    return promise.then((data) => QueryEpochsInfoResponse.decode(new BinaryReader(data)));
  }
  currentEpoch(request: QueryCurrentEpochRequest = {}): Promise<QueryCurrentEpochResponse> {
    const data = QueryCurrentEpochRequest.encode(request).finish();
    const promise = this.rpc.request('babylon.epoching.v1.Query', 'CurrentEpoch', data);
    return promise.then((data) => QueryCurrentEpochResponse.decode(new BinaryReader(data)));
  }
  epochMsgs(request: QueryEpochMsgsRequest): Promise<QueryEpochMsgsResponse> {
    const data = QueryEpochMsgsRequest.encode(request).finish();
    const promise = this.rpc.request('babylon.epoching.v1.Query', 'EpochMsgs', data);
    return promise.then((data) => QueryEpochMsgsResponse.decode(new BinaryReader(data)));
  }
  latestEpochMsgs(request: QueryLatestEpochMsgsRequest): Promise<QueryLatestEpochMsgsResponse> {
    const data = QueryLatestEpochMsgsRequest.encode(request).finish();
    const promise = this.rpc.request('babylon.epoching.v1.Query', 'LatestEpochMsgs', data);
    return promise.then((data) => QueryLatestEpochMsgsResponse.decode(new BinaryReader(data)));
  }
  validatorLifecycle(request: QueryValidatorLifecycleRequest): Promise<QueryValidatorLifecycleResponse> {
    const data = QueryValidatorLifecycleRequest.encode(request).finish();
    const promise = this.rpc.request('babylon.epoching.v1.Query', 'ValidatorLifecycle', data);
    return promise.then((data) => QueryValidatorLifecycleResponse.decode(new BinaryReader(data)));
  }
  delegationLifecycle(request: QueryDelegationLifecycleRequest): Promise<QueryDelegationLifecycleResponse> {
    const data = QueryDelegationLifecycleRequest.encode(request).finish();
    const promise = this.rpc.request('babylon.epoching.v1.Query', 'DelegationLifecycle', data);
    return promise.then((data) => QueryDelegationLifecycleResponse.decode(new BinaryReader(data)));
  }
  epochValSet(request: QueryEpochValSetRequest): Promise<QueryEpochValSetResponse> {
    const data = QueryEpochValSetRequest.encode(request).finish();
    const promise = this.rpc.request('babylon.epoching.v1.Query', 'EpochValSet', data);
    return promise.then((data) => QueryEpochValSetResponse.decode(new BinaryReader(data)));
  }
}
export const createRpcQueryExtension = (base: QueryClient) => {
  const rpc = createProtobufRpcClient(base);
  const queryService = new QueryClientImpl(rpc);
  return {
    params(request?: QueryParamsRequest): Promise<QueryParamsResponse> {
      return queryService.params(request);
    },
    epochInfo(request: QueryEpochInfoRequest): Promise<QueryEpochInfoResponse> {
      return queryService.epochInfo(request);
    },
    epochsInfo(request?: QueryEpochsInfoRequest): Promise<QueryEpochsInfoResponse> {
      return queryService.epochsInfo(request);
    },
    currentEpoch(request?: QueryCurrentEpochRequest): Promise<QueryCurrentEpochResponse> {
      return queryService.currentEpoch(request);
    },
    epochMsgs(request: QueryEpochMsgsRequest): Promise<QueryEpochMsgsResponse> {
      return queryService.epochMsgs(request);
    },
    latestEpochMsgs(request: QueryLatestEpochMsgsRequest): Promise<QueryLatestEpochMsgsResponse> {
      return queryService.latestEpochMsgs(request);
    },
    validatorLifecycle(request: QueryValidatorLifecycleRequest): Promise<QueryValidatorLifecycleResponse> {
      return queryService.validatorLifecycle(request);
    },
    delegationLifecycle(request: QueryDelegationLifecycleRequest): Promise<QueryDelegationLifecycleResponse> {
      return queryService.delegationLifecycle(request);
    },
    epochValSet(request: QueryEpochValSetRequest): Promise<QueryEpochValSetResponse> {
      return queryService.epochValSet(request);
    },
  };
};
