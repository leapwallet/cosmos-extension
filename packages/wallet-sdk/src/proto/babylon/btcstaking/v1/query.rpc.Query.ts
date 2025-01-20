import { createProtobufRpcClient, QueryClient } from '@cosmjs/stargate';

import { BinaryReader } from '../../../binary';
import { Rpc } from '../../../helpers';
import {
  QueryActivatedHeightRequest,
  QueryActivatedHeightResponse,
  QueryActiveFinalityProvidersAtHeightRequest,
  QueryActiveFinalityProvidersAtHeightResponse,
  QueryBTCDelegationRequest,
  QueryBTCDelegationResponse,
  QueryBTCDelegationsRequest,
  QueryBTCDelegationsResponse,
  QueryFinalityProviderCurrentPowerRequest,
  QueryFinalityProviderCurrentPowerResponse,
  QueryFinalityProviderDelegationsRequest,
  QueryFinalityProviderDelegationsResponse,
  QueryFinalityProviderPowerAtHeightRequest,
  QueryFinalityProviderPowerAtHeightResponse,
  QueryFinalityProviderRequest,
  QueryFinalityProviderResponse,
  QueryFinalityProvidersRequest,
  QueryFinalityProvidersResponse,
  QueryParamsByVersionRequest,
  QueryParamsByVersionResponse,
  QueryParamsRequest,
  QueryParamsResponse,
} from './query';
/** Query defines the gRPC querier service. */
export interface Query {
  /** Parameters queries the parameters of the module. */
  params(request?: QueryParamsRequest): Promise<QueryParamsResponse>;
  /** ParamsByVersion queries the parameters of the module for a specific version of past params. */
  paramsByVersion(request: QueryParamsByVersionRequest): Promise<QueryParamsByVersionResponse>;
  /** FinalityProviders queries all finality providers */
  finalityProviders(request?: QueryFinalityProvidersRequest): Promise<QueryFinalityProvidersResponse>;
  /** FinalityProvider info about one finality provider */
  finalityProvider(request: QueryFinalityProviderRequest): Promise<QueryFinalityProviderResponse>;
  /** BTCDelegations queries all BTC delegations under a given status */
  bTCDelegations(request: QueryBTCDelegationsRequest): Promise<QueryBTCDelegationsResponse>;
  /** ActiveFinalityProvidersAtHeight queries finality providers with non zero voting power at given height. */
  activeFinalityProvidersAtHeight(
    request: QueryActiveFinalityProvidersAtHeightRequest,
  ): Promise<QueryActiveFinalityProvidersAtHeightResponse>;
  /** FinalityProviderPowerAtHeight queries the voting power of a finality provider at a given height */
  finalityProviderPowerAtHeight(
    request: QueryFinalityProviderPowerAtHeightRequest,
  ): Promise<QueryFinalityProviderPowerAtHeightResponse>;
  /** FinalityProviderCurrentPower queries the voting power of a finality provider at the current height */
  finalityProviderCurrentPower(
    request: QueryFinalityProviderCurrentPowerRequest,
  ): Promise<QueryFinalityProviderCurrentPowerResponse>;
  /**
   * ActivatedHeight queries the height when BTC staking protocol is activated, i.e., the first height when
   * there exists 1 finality provider with voting power
   */
  activatedHeight(request?: QueryActivatedHeightRequest): Promise<QueryActivatedHeightResponse>;
  /** FinalityProviderDelegations queries all BTC delegations of the given finality provider */
  finalityProviderDelegations(
    request: QueryFinalityProviderDelegationsRequest,
  ): Promise<QueryFinalityProviderDelegationsResponse>;
  /** BTCDelegation retrieves delegation by corresponding staking tx hash */
  bTCDelegation(request: QueryBTCDelegationRequest): Promise<QueryBTCDelegationResponse>;
}
export class QueryClientImpl implements Query {
  private readonly rpc: Rpc;
  constructor(rpc: Rpc) {
    this.rpc = rpc;
    this.params = this.params.bind(this);
    this.paramsByVersion = this.paramsByVersion.bind(this);
    this.finalityProviders = this.finalityProviders.bind(this);
    this.finalityProvider = this.finalityProvider.bind(this);
    this.bTCDelegations = this.bTCDelegations.bind(this);
    this.activeFinalityProvidersAtHeight = this.activeFinalityProvidersAtHeight.bind(this);
    this.finalityProviderPowerAtHeight = this.finalityProviderPowerAtHeight.bind(this);
    this.finalityProviderCurrentPower = this.finalityProviderCurrentPower.bind(this);
    this.activatedHeight = this.activatedHeight.bind(this);
    this.finalityProviderDelegations = this.finalityProviderDelegations.bind(this);
    this.bTCDelegation = this.bTCDelegation.bind(this);
  }
  params(request: QueryParamsRequest = {}): Promise<QueryParamsResponse> {
    const data = QueryParamsRequest.encode(request).finish();
    const promise = this.rpc.request('babylon.btcstaking.v1.Query', 'Params', data);
    return promise.then((data) => QueryParamsResponse.decode(new BinaryReader(data)));
  }
  paramsByVersion(request: QueryParamsByVersionRequest): Promise<QueryParamsByVersionResponse> {
    const data = QueryParamsByVersionRequest.encode(request).finish();
    const promise = this.rpc.request('babylon.btcstaking.v1.Query', 'ParamsByVersion', data);
    return promise.then((data) => QueryParamsByVersionResponse.decode(new BinaryReader(data)));
  }
  finalityProviders(
    request: QueryFinalityProvidersRequest = {
      pagination: undefined,
    },
  ): Promise<QueryFinalityProvidersResponse> {
    const data = QueryFinalityProvidersRequest.encode(request).finish();
    const promise = this.rpc.request('babylon.btcstaking.v1.Query', 'FinalityProviders', data);
    return promise.then((data) => QueryFinalityProvidersResponse.decode(new BinaryReader(data)));
  }
  finalityProvider(request: QueryFinalityProviderRequest): Promise<QueryFinalityProviderResponse> {
    const data = QueryFinalityProviderRequest.encode(request).finish();
    const promise = this.rpc.request('babylon.btcstaking.v1.Query', 'FinalityProvider', data);
    return promise.then((data) => QueryFinalityProviderResponse.decode(new BinaryReader(data)));
  }
  bTCDelegations(request: QueryBTCDelegationsRequest): Promise<QueryBTCDelegationsResponse> {
    const data = QueryBTCDelegationsRequest.encode(request).finish();
    const promise = this.rpc.request('babylon.btcstaking.v1.Query', 'BTCDelegations', data);
    return promise.then((data) => QueryBTCDelegationsResponse.decode(new BinaryReader(data)));
  }
  activeFinalityProvidersAtHeight(
    request: QueryActiveFinalityProvidersAtHeightRequest,
  ): Promise<QueryActiveFinalityProvidersAtHeightResponse> {
    const data = QueryActiveFinalityProvidersAtHeightRequest.encode(request).finish();
    const promise = this.rpc.request('babylon.btcstaking.v1.Query', 'ActiveFinalityProvidersAtHeight', data);
    return promise.then((data) => QueryActiveFinalityProvidersAtHeightResponse.decode(new BinaryReader(data)));
  }
  finalityProviderPowerAtHeight(
    request: QueryFinalityProviderPowerAtHeightRequest,
  ): Promise<QueryFinalityProviderPowerAtHeightResponse> {
    const data = QueryFinalityProviderPowerAtHeightRequest.encode(request).finish();
    const promise = this.rpc.request('babylon.btcstaking.v1.Query', 'FinalityProviderPowerAtHeight', data);
    return promise.then((data) => QueryFinalityProviderPowerAtHeightResponse.decode(new BinaryReader(data)));
  }
  finalityProviderCurrentPower(
    request: QueryFinalityProviderCurrentPowerRequest,
  ): Promise<QueryFinalityProviderCurrentPowerResponse> {
    const data = QueryFinalityProviderCurrentPowerRequest.encode(request).finish();
    const promise = this.rpc.request('babylon.btcstaking.v1.Query', 'FinalityProviderCurrentPower', data);
    return promise.then((data) => QueryFinalityProviderCurrentPowerResponse.decode(new BinaryReader(data)));
  }
  activatedHeight(request: QueryActivatedHeightRequest = {}): Promise<QueryActivatedHeightResponse> {
    const data = QueryActivatedHeightRequest.encode(request).finish();
    const promise = this.rpc.request('babylon.btcstaking.v1.Query', 'ActivatedHeight', data);
    return promise.then((data) => QueryActivatedHeightResponse.decode(new BinaryReader(data)));
  }
  finalityProviderDelegations(
    request: QueryFinalityProviderDelegationsRequest,
  ): Promise<QueryFinalityProviderDelegationsResponse> {
    const data = QueryFinalityProviderDelegationsRequest.encode(request).finish();
    const promise = this.rpc.request('babylon.btcstaking.v1.Query', 'FinalityProviderDelegations', data);
    return promise.then((data) => QueryFinalityProviderDelegationsResponse.decode(new BinaryReader(data)));
  }
  bTCDelegation(request: QueryBTCDelegationRequest): Promise<QueryBTCDelegationResponse> {
    const data = QueryBTCDelegationRequest.encode(request).finish();
    const promise = this.rpc.request('babylon.btcstaking.v1.Query', 'BTCDelegation', data);
    return promise.then((data) => QueryBTCDelegationResponse.decode(new BinaryReader(data)));
  }
}
export const createRpcQueryExtension = (base: QueryClient) => {
  const rpc = createProtobufRpcClient(base);
  const queryService = new QueryClientImpl(rpc);
  return {
    params(request?: QueryParamsRequest): Promise<QueryParamsResponse> {
      return queryService.params(request);
    },
    paramsByVersion(request: QueryParamsByVersionRequest): Promise<QueryParamsByVersionResponse> {
      return queryService.paramsByVersion(request);
    },
    finalityProviders(request?: QueryFinalityProvidersRequest): Promise<QueryFinalityProvidersResponse> {
      return queryService.finalityProviders(request);
    },
    finalityProvider(request: QueryFinalityProviderRequest): Promise<QueryFinalityProviderResponse> {
      return queryService.finalityProvider(request);
    },
    bTCDelegations(request: QueryBTCDelegationsRequest): Promise<QueryBTCDelegationsResponse> {
      return queryService.bTCDelegations(request);
    },
    activeFinalityProvidersAtHeight(
      request: QueryActiveFinalityProvidersAtHeightRequest,
    ): Promise<QueryActiveFinalityProvidersAtHeightResponse> {
      return queryService.activeFinalityProvidersAtHeight(request);
    },
    finalityProviderPowerAtHeight(
      request: QueryFinalityProviderPowerAtHeightRequest,
    ): Promise<QueryFinalityProviderPowerAtHeightResponse> {
      return queryService.finalityProviderPowerAtHeight(request);
    },
    finalityProviderCurrentPower(
      request: QueryFinalityProviderCurrentPowerRequest,
    ): Promise<QueryFinalityProviderCurrentPowerResponse> {
      return queryService.finalityProviderCurrentPower(request);
    },
    activatedHeight(request?: QueryActivatedHeightRequest): Promise<QueryActivatedHeightResponse> {
      return queryService.activatedHeight(request);
    },
    finalityProviderDelegations(
      request: QueryFinalityProviderDelegationsRequest,
    ): Promise<QueryFinalityProviderDelegationsResponse> {
      return queryService.finalityProviderDelegations(request);
    },
    bTCDelegation(request: QueryBTCDelegationRequest): Promise<QueryBTCDelegationResponse> {
      return queryService.bTCDelegation(request);
    },
  };
};
