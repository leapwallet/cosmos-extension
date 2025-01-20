import { LCDClient } from '@cosmology/lcd';

import { setPaginationParams } from '../../../helpers';
import {
  QueryActivatedHeightRequest,
  QueryActivatedHeightResponseSDKType,
  QueryActiveFinalityProvidersAtHeightRequest,
  QueryActiveFinalityProvidersAtHeightResponseSDKType,
  QueryBTCDelegationRequest,
  QueryBTCDelegationResponseSDKType,
  QueryBTCDelegationsRequest,
  QueryBTCDelegationsResponseSDKType,
  QueryFinalityProviderCurrentPowerRequest,
  QueryFinalityProviderCurrentPowerResponseSDKType,
  QueryFinalityProviderDelegationsRequest,
  QueryFinalityProviderDelegationsResponseSDKType,
  QueryFinalityProviderPowerAtHeightRequest,
  QueryFinalityProviderPowerAtHeightResponseSDKType,
  QueryFinalityProviderRequest,
  QueryFinalityProviderResponseSDKType,
  QueryFinalityProvidersRequest,
  QueryFinalityProvidersResponseSDKType,
  QueryParamsByVersionRequest,
  QueryParamsByVersionResponseSDKType,
  QueryParamsRequest,
  QueryParamsResponseSDKType,
} from './query';
export class LCDQueryClient {
  req: LCDClient;
  constructor({ requestClient }: { requestClient: LCDClient }) {
    this.req = requestClient;
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
  /* Parameters queries the parameters of the module. */
  async params(_params: QueryParamsRequest = {}): Promise<QueryParamsResponseSDKType> {
    const endpoint = `babylon/btcstaking/v1/params`;
    return await this.req.get<QueryParamsResponseSDKType>(endpoint);
  }
  /* ParamsByVersion queries the parameters of the module for a specific version of past params. */
  async paramsByVersion(params: QueryParamsByVersionRequest): Promise<QueryParamsByVersionResponseSDKType> {
    const endpoint = `babylon/btcstaking/v1/params/${params.version}`;
    return await this.req.get<QueryParamsByVersionResponseSDKType>(endpoint);
  }
  /* FinalityProviders queries all finality providers */
  async finalityProviders(
    params: QueryFinalityProvidersRequest = {
      pagination: undefined,
    },
  ): Promise<QueryFinalityProvidersResponseSDKType> {
    const options: any = {
      params: {},
    };
    if (typeof params?.pagination !== 'undefined') {
      setPaginationParams(options, params.pagination);
    }
    const endpoint = `babylon/btcstaking/v1/finality_providers`;
    return await this.req.get<QueryFinalityProvidersResponseSDKType>(endpoint, options);
  }
  /* FinalityProvider info about one finality provider */
  async finalityProvider(params: QueryFinalityProviderRequest): Promise<QueryFinalityProviderResponseSDKType> {
    const endpoint = `babylon/btcstaking/v1/finality_providers/${params.fpBtcPkHex}/finality_provider`;
    return await this.req.get<QueryFinalityProviderResponseSDKType>(endpoint);
  }
  /* BTCDelegations queries all BTC delegations under a given status */
  async bTCDelegations(params: QueryBTCDelegationsRequest): Promise<QueryBTCDelegationsResponseSDKType> {
    const options: any = {
      params: {},
    };
    if (typeof params?.status !== 'undefined') {
      options.params.status = params.status;
    }
    if (typeof params?.pagination !== 'undefined') {
      setPaginationParams(options, params.pagination);
    }
    const endpoint = `babylon/btcstaking/v1/btc_delegations`;
    return await this.req.get<QueryBTCDelegationsResponseSDKType>(endpoint, options);
  }
  /* ActiveFinalityProvidersAtHeight queries finality providers with non zero voting power at given height. */
  async activeFinalityProvidersAtHeight(
    params: QueryActiveFinalityProvidersAtHeightRequest,
  ): Promise<QueryActiveFinalityProvidersAtHeightResponseSDKType> {
    const options: any = {
      params: {},
    };
    if (typeof params?.pagination !== 'undefined') {
      setPaginationParams(options, params.pagination);
    }
    const endpoint = `babylon/btcstaking/v1/finality_providers/${params.height}`;
    return await this.req.get<QueryActiveFinalityProvidersAtHeightResponseSDKType>(endpoint, options);
  }
  /* FinalityProviderPowerAtHeight queries the voting power of a finality provider at a given height */
  async finalityProviderPowerAtHeight(
    params: QueryFinalityProviderPowerAtHeightRequest,
  ): Promise<QueryFinalityProviderPowerAtHeightResponseSDKType> {
    const endpoint = `babylon/btcstaking/v1/finality_providers/${params.fpBtcPkHex}/power/${params.height}`;
    return await this.req.get<QueryFinalityProviderPowerAtHeightResponseSDKType>(endpoint);
  }
  /* FinalityProviderCurrentPower queries the voting power of a finality provider at the current height */
  async finalityProviderCurrentPower(
    params: QueryFinalityProviderCurrentPowerRequest,
  ): Promise<QueryFinalityProviderCurrentPowerResponseSDKType> {
    const endpoint = `babylon/btcstaking/v1/finality_providers/${params.fpBtcPkHex}/power`;
    return await this.req.get<QueryFinalityProviderCurrentPowerResponseSDKType>(endpoint);
  }
  /* ActivatedHeight queries the height when BTC staking protocol is activated, i.e., the first height when
   there exists 1 finality provider with voting power */
  async activatedHeight(_params: QueryActivatedHeightRequest = {}): Promise<QueryActivatedHeightResponseSDKType> {
    const endpoint = `babylon/btcstaking/v1/activated_height`;
    return await this.req.get<QueryActivatedHeightResponseSDKType>(endpoint);
  }
  /* FinalityProviderDelegations queries all BTC delegations of the given finality provider */
  async finalityProviderDelegations(
    params: QueryFinalityProviderDelegationsRequest,
  ): Promise<QueryFinalityProviderDelegationsResponseSDKType> {
    const options: any = {
      params: {},
    };
    if (typeof params?.pagination !== 'undefined') {
      setPaginationParams(options, params.pagination);
    }
    const endpoint = `babylon/btcstaking/v1/finality_providers/${params.fpBtcPkHex}/delegations`;
    return await this.req.get<QueryFinalityProviderDelegationsResponseSDKType>(endpoint, options);
  }
  /* BTCDelegation retrieves delegation by corresponding staking tx hash */
  async bTCDelegation(params: QueryBTCDelegationRequest): Promise<QueryBTCDelegationResponseSDKType> {
    const endpoint = `babylon/btcstaking/v1/btc_delegations/${params.stakingTxHashHex}`;
    return await this.req.get<QueryBTCDelegationResponseSDKType>(endpoint);
  }
}
