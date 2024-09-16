import { grpc } from '@improbable-eng/grpc-web';
import { BrowserHeaders } from 'browser-headers';

import { DeepPartial } from '../helpers';
import { UnaryMethodDefinitionish } from './grpc-web';
import {
  QueryDelegatorProvidersRequest,
  QueryDelegatorProvidersResponse,
  QueryDelegatorRewardsRequest,
  QueryDelegatorRewardsResponse,
  QueryParamsRequest,
  QueryParamsResponse,
  QueryProviderDelegatorsRequest,
  QueryProviderDelegatorsResponse,
} from './query';
/** Query defines the gRPC querier service. */
export interface Query {
  /** Parameters queries the parameters of the module. */
  params(request?: DeepPartial<QueryParamsRequest>, metadata?: grpc.Metadata): Promise<QueryParamsResponse>;
  /** Queries a delegator for all its providers. */
  delegatorProviders(
    request: DeepPartial<QueryDelegatorProvidersRequest>,
    metadata?: grpc.Metadata,
  ): Promise<QueryDelegatorProvidersResponse>;
  /** Queries a provider for all its delegators. */
  providerDelegators(
    request: DeepPartial<QueryProviderDelegatorsRequest>,
    metadata?: grpc.Metadata,
  ): Promise<QueryProviderDelegatorsResponse>;
  /** Queries a the unclaimed rewards of a delegator. */
  delegatorRewards(
    request: DeepPartial<QueryDelegatorRewardsRequest>,
    metadata?: grpc.Metadata,
  ): Promise<QueryDelegatorRewardsResponse>;
  /** Queries a the unclaimed rewards of a delegator. */
  delegatorRewardsList(
    request: DeepPartial<QueryDelegatorRewardsRequest>,
    metadata?: grpc.Metadata,
  ): Promise<QueryDelegatorRewardsResponse>;
}
export class QueryClientImpl implements Query {
  private readonly rpc: Rpc;
  constructor(rpc: Rpc) {
    this.rpc = rpc;
    this.params = this.params.bind(this);
    this.delegatorProviders = this.delegatorProviders.bind(this);
    this.providerDelegators = this.providerDelegators.bind(this);
    this.delegatorRewards = this.delegatorRewards.bind(this);
    this.delegatorRewardsList = this.delegatorRewardsList.bind(this);
  }
  params(request: DeepPartial<QueryParamsRequest> = {}, metadata?: grpc.Metadata): Promise<QueryParamsResponse> {
    return this.rpc.unary(QueryParamsDesc, QueryParamsRequest.fromPartial(request), metadata);
  }
  delegatorProviders(
    request: DeepPartial<QueryDelegatorProvidersRequest>,
    metadata?: grpc.Metadata,
  ): Promise<QueryDelegatorProvidersResponse> {
    return this.rpc.unary(QueryDelegatorProvidersDesc, QueryDelegatorProvidersRequest.fromPartial(request), metadata);
  }
  providerDelegators(
    request: DeepPartial<QueryProviderDelegatorsRequest>,
    metadata?: grpc.Metadata,
  ): Promise<QueryProviderDelegatorsResponse> {
    return this.rpc.unary(QueryProviderDelegatorsDesc, QueryProviderDelegatorsRequest.fromPartial(request), metadata);
  }
  delegatorRewards(
    request: DeepPartial<QueryDelegatorRewardsRequest>,
    metadata?: grpc.Metadata,
  ): Promise<QueryDelegatorRewardsResponse> {
    return this.rpc.unary(QueryDelegatorRewardsDesc, QueryDelegatorRewardsRequest.fromPartial(request), metadata);
  }
  delegatorRewardsList(
    request: DeepPartial<QueryDelegatorRewardsRequest>,
    metadata?: grpc.Metadata,
  ): Promise<QueryDelegatorRewardsResponse> {
    return this.rpc.unary(QueryDelegatorRewardsListDesc, QueryDelegatorRewardsRequest.fromPartial(request), metadata);
  }
}
export const QueryDesc = {
  serviceName: 'lavanet.lava.dualstaking.Query',
};
export const QueryParamsDesc: UnaryMethodDefinitionish = {
  methodName: 'Params',
  service: QueryDesc,
  requestStream: false,
  responseStream: false,
  requestType: {
    serializeBinary() {
      return QueryParamsRequest.encode(this).finish();
    },
  } as any,
  responseType: {
    deserializeBinary(data: Uint8Array) {
      return {
        ...QueryParamsResponse.decode(data),
        toObject() {
          return this;
        },
      };
    },
  } as any,
};
export const QueryDelegatorProvidersDesc: UnaryMethodDefinitionish = {
  methodName: 'DelegatorProviders',
  service: QueryDesc,
  requestStream: false,
  responseStream: false,
  requestType: {
    serializeBinary() {
      return QueryDelegatorProvidersRequest.encode(this).finish();
    },
  } as any,
  responseType: {
    deserializeBinary(data: Uint8Array) {
      return {
        ...QueryDelegatorProvidersResponse.decode(data),
        toObject() {
          return this;
        },
      };
    },
  } as any,
};
export const QueryProviderDelegatorsDesc: UnaryMethodDefinitionish = {
  methodName: 'ProviderDelegators',
  service: QueryDesc,
  requestStream: false,
  responseStream: false,
  requestType: {
    serializeBinary() {
      return QueryProviderDelegatorsRequest.encode(this).finish();
    },
  } as any,
  responseType: {
    deserializeBinary(data: Uint8Array) {
      return {
        ...QueryProviderDelegatorsResponse.decode(data),
        toObject() {
          return this;
        },
      };
    },
  } as any,
};
export const QueryDelegatorRewardsDesc: UnaryMethodDefinitionish = {
  methodName: 'DelegatorRewards',
  service: QueryDesc,
  requestStream: false,
  responseStream: false,
  requestType: {
    serializeBinary() {
      return QueryDelegatorRewardsRequest.encode(this).finish();
    },
  } as any,
  responseType: {
    deserializeBinary(data: Uint8Array) {
      return {
        ...QueryDelegatorRewardsResponse.decode(data),
        toObject() {
          return this;
        },
      };
    },
  } as any,
};
export const QueryDelegatorRewardsListDesc: UnaryMethodDefinitionish = {
  methodName: 'DelegatorRewardsList',
  service: QueryDesc,
  requestStream: false,
  responseStream: false,
  requestType: {
    serializeBinary() {
      return QueryDelegatorRewardsRequest.encode(this).finish();
    },
  } as any,
  responseType: {
    deserializeBinary(data: Uint8Array) {
      return {
        ...QueryDelegatorRewardsResponse.decode(data),
        toObject() {
          return this;
        },
      };
    },
  } as any,
};
export interface Rpc {
  unary<T extends UnaryMethodDefinitionish>(
    methodDesc: T,
    request: any,
    metadata: grpc.Metadata | undefined,
  ): Promise<any>;
}
export class GrpcWebImpl {
  host: string;
  options: {
    transport?: grpc.TransportFactory;
    debug?: boolean;
    metadata?: grpc.Metadata;
  };
  constructor(
    host: string,
    options: {
      transport?: grpc.TransportFactory;
      debug?: boolean;
      metadata?: grpc.Metadata;
    },
  ) {
    this.host = host;
    this.options = options;
  }
  unary<T extends UnaryMethodDefinitionish>(methodDesc: T, _request: any, metadata: grpc.Metadata | undefined) {
    const request = {
      ..._request,
      ...methodDesc.requestType,
    };
    const maybeCombinedMetadata =
      metadata && this.options.metadata
        ? new BrowserHeaders({
            ...this.options?.metadata.headersMap,
            ...metadata?.headersMap,
          })
        : metadata || this.options.metadata;
    return new Promise((resolve, reject) => {
      grpc.unary(methodDesc, {
        request,
        host: this.host,
        metadata: maybeCombinedMetadata,
        transport: this.options.transport,
        debug: this.options.debug,
        onEnd: function (response) {
          if (response.status === grpc.Code.OK) {
            resolve(response.message);
          } else {
            const err = new Error(response.statusMessage) as any;
            err.code = response.status;
            err.metadata = response.trailers;
            reject(err);
          }
        },
      });
    });
  }
}
