import { LCDClient } from '@cosmology/lcd';

import { setPaginationParams } from '../../../helpers';
import {
  QueryBaseHeaderRequest,
  QueryBaseHeaderResponseSDKType,
  QueryContainsBytesRequest,
  QueryContainsBytesResponseSDKType,
  QueryContainsRequest,
  QueryContainsResponseSDKType,
  QueryHashesRequest,
  QueryHashesResponseSDKType,
  QueryHeaderDepthRequest,
  QueryHeaderDepthResponseSDKType,
  QueryMainChainRequest,
  QueryMainChainResponseSDKType,
  QueryParamsRequest,
  QueryParamsResponseSDKType,
  QueryTipRequest,
  QueryTipResponseSDKType,
} from './query';
export class LCDQueryClient {
  req: LCDClient;
  constructor({ requestClient }: { requestClient: LCDClient }) {
    this.req = requestClient;
    this.params = this.params.bind(this);
    this.hashes = this.hashes.bind(this);
    this.contains = this.contains.bind(this);
    this.containsBytes = this.containsBytes.bind(this);
    this.mainChain = this.mainChain.bind(this);
    this.tip = this.tip.bind(this);
    this.baseHeader = this.baseHeader.bind(this);
    this.headerDepth = this.headerDepth.bind(this);
  }
  /* Params queries the parameters of the module. */
  async params(_params: QueryParamsRequest = {}): Promise<QueryParamsResponseSDKType> {
    const endpoint = `babylon/btclightclient/v1/params`;
    return await this.req.get<QueryParamsResponseSDKType>(endpoint);
  }
  /* Hashes retrieves the hashes maintained by the module. */
  async hashes(
    params: QueryHashesRequest = {
      pagination: undefined,
    },
  ): Promise<QueryHashesResponseSDKType> {
    const options: any = {
      params: {},
    };
    if (typeof params?.pagination !== 'undefined') {
      setPaginationParams(options, params.pagination);
    }
    const endpoint = `babylon/btclightclient/v1/hashes`;
    return await this.req.get<QueryHashesResponseSDKType>(endpoint, options);
  }
  /* Contains checks whether a hash is maintained by the module. */
  async contains(params: QueryContainsRequest): Promise<QueryContainsResponseSDKType> {
    const options: any = {
      params: {},
    };
    if (typeof params?.hash !== 'undefined') {
      options.params.hash = params.hash;
    }
    const endpoint = `babylon/btclightclient/v1/contains`;
    return await this.req.get<QueryContainsResponseSDKType>(endpoint, options);
  }
  /* ContainsBytes is a temporary method that
   checks whether a hash is maintained by the module.
   See discussion at https://github.com/babylonchain/babylon/pull/132
   for more details. */
  async containsBytes(params: QueryContainsBytesRequest): Promise<QueryContainsBytesResponseSDKType> {
    const options: any = {
      params: {},
    };
    if (typeof params?.hash !== 'undefined') {
      options.params.hash = params.hash;
    }
    const endpoint = `babylon/btclightclient/v1/containsBytes`;
    return await this.req.get<QueryContainsBytesResponseSDKType>(endpoint, options);
  }
  /* MainChain returns the canonical chain */
  async mainChain(
    params: QueryMainChainRequest = {
      pagination: undefined,
    },
  ): Promise<QueryMainChainResponseSDKType> {
    const options: any = {
      params: {},
    };
    if (typeof params?.pagination !== 'undefined') {
      setPaginationParams(options, params.pagination);
    }
    const endpoint = `babylon/btclightclient/v1/mainchain`;
    return await this.req.get<QueryMainChainResponseSDKType>(endpoint, options);
  }
  /* Tip return best header on canonical chain */
  async tip(_params: QueryTipRequest = {}): Promise<QueryTipResponseSDKType> {
    const endpoint = `babylon/btclightclient/v1/tip`;
    return await this.req.get<QueryTipResponseSDKType>(endpoint);
  }
  /* BaseHeader returns the base BTC header of the chain. This header is defined
   on genesis. */
  async baseHeader(_params: QueryBaseHeaderRequest = {}): Promise<QueryBaseHeaderResponseSDKType> {
    const endpoint = `babylon/btclightclient/v1/baseheader`;
    return await this.req.get<QueryBaseHeaderResponseSDKType>(endpoint);
  }
  /* HeaderDepth returns the depth of the header in main chain or error if the
   block is not found or it exists on fork */
  async headerDepth(params: QueryHeaderDepthRequest): Promise<QueryHeaderDepthResponseSDKType> {
    const endpoint = `babylon/btclightclient/v1/depth/${params.hash}`;
    return await this.req.get<QueryHeaderDepthResponseSDKType>(endpoint);
  }
}
