import { LCDClient } from '@cosmology/lcd';

import { setPaginationParams } from '../../../helpers';
import {
  QueryCurrentEpochRequest,
  QueryCurrentEpochResponseSDKType,
  QueryDelegationLifecycleRequest,
  QueryDelegationLifecycleResponseSDKType,
  QueryEpochInfoRequest,
  QueryEpochInfoResponseSDKType,
  QueryEpochMsgsRequest,
  QueryEpochMsgsResponseSDKType,
  QueryEpochsInfoRequest,
  QueryEpochsInfoResponseSDKType,
  QueryEpochValSetRequest,
  QueryEpochValSetResponseSDKType,
  QueryLatestEpochMsgsRequest,
  QueryLatestEpochMsgsResponseSDKType,
  QueryParamsRequest,
  QueryParamsResponseSDKType,
  QueryValidatorLifecycleRequest,
  QueryValidatorLifecycleResponseSDKType,
} from './query';
export class LCDQueryClient {
  req: LCDClient;
  constructor({ requestClient }: { requestClient: LCDClient }) {
    this.req = requestClient;
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
  /* Params queries the parameters of the module. */
  async params(_params: QueryParamsRequest = {}): Promise<QueryParamsResponseSDKType> {
    const endpoint = `babylon/epoching/v1/params`;
    return await this.req.get<QueryParamsResponseSDKType>(endpoint);
  }
  /* EpochInfo queries the information of a given epoch */
  async epochInfo(params: QueryEpochInfoRequest): Promise<QueryEpochInfoResponseSDKType> {
    const options: any = {
      params: {},
    };
    if (typeof params?.epochNum !== 'undefined') {
      options.params.epoch_num = params.epochNum;
    }
    const endpoint = `babylon/epoching/v1/epochs/${params.epochNum}`;
    return await this.req.get<QueryEpochInfoResponseSDKType>(endpoint, options);
  }
  /* EpochsInfo queries the metadata of epochs in a given range, depending on
   the parameters in the pagination request. Th main use case will be querying
   the latest epochs in time order. */
  async epochsInfo(
    params: QueryEpochsInfoRequest = {
      pagination: undefined,
    },
  ): Promise<QueryEpochsInfoResponseSDKType> {
    const options: any = {
      params: {},
    };
    if (typeof params?.pagination !== 'undefined') {
      setPaginationParams(options, params.pagination);
    }
    const endpoint = `babylon/epoching/v1/epochs`;
    return await this.req.get<QueryEpochsInfoResponseSDKType>(endpoint, options);
  }
  /* CurrentEpoch queries the current epoch */
  async currentEpoch(_params: QueryCurrentEpochRequest = {}): Promise<QueryCurrentEpochResponseSDKType> {
    const endpoint = `babylon/epoching/v1/current_epoch`;
    return await this.req.get<QueryCurrentEpochResponseSDKType>(endpoint);
  }
  /* EpochMsgs queries the messages of a given epoch */
  async epochMsgs(params: QueryEpochMsgsRequest): Promise<QueryEpochMsgsResponseSDKType> {
    const options: any = {
      params: {},
    };
    if (typeof params?.epochNum !== 'undefined') {
      options.params.epoch_num = params.epochNum;
    }
    if (typeof params?.pagination !== 'undefined') {
      setPaginationParams(options, params.pagination);
    }
    const endpoint = `babylon/epoching/v1/epochs/${params.epochNum}/messages`;
    return await this.req.get<QueryEpochMsgsResponseSDKType>(endpoint, options);
  }
  /* LatestEpochMsgs queries the messages within a given number of most recent
   epochs */
  async latestEpochMsgs(params: QueryLatestEpochMsgsRequest): Promise<QueryLatestEpochMsgsResponseSDKType> {
    const options: any = {
      params: {},
    };
    if (typeof params?.endEpoch !== 'undefined') {
      options.params.end_epoch = params.endEpoch;
    }
    if (typeof params?.epochCount !== 'undefined') {
      options.params.epoch_count = params.epochCount;
    }
    if (typeof params?.pagination !== 'undefined') {
      setPaginationParams(options, params.pagination);
    }
    const endpoint = `babylon/epoching/v1/epochs:latest/messages`;
    return await this.req.get<QueryLatestEpochMsgsResponseSDKType>(endpoint, options);
  }
  /* ValidatorLifecycle queries the lifecycle of a given validator */
  async validatorLifecycle(params: QueryValidatorLifecycleRequest): Promise<QueryValidatorLifecycleResponseSDKType> {
    const endpoint = `babylon/epoching/v1/validator_lifecycle/${params.valAddr}`;
    return await this.req.get<QueryValidatorLifecycleResponseSDKType>(endpoint);
  }
  /* DelegationLifecycle queries the lifecycle of a given delegation */
  async delegationLifecycle(params: QueryDelegationLifecycleRequest): Promise<QueryDelegationLifecycleResponseSDKType> {
    const endpoint = `babylon/epoching/v1/delegation_lifecycle/${params.delAddr}`;
    return await this.req.get<QueryDelegationLifecycleResponseSDKType>(endpoint);
  }
  /* EpochValSet queries the validator set of a given epoch */
  async epochValSet(params: QueryEpochValSetRequest): Promise<QueryEpochValSetResponseSDKType> {
    const options: any = {
      params: {},
    };
    if (typeof params?.epochNum !== 'undefined') {
      options.params.epoch_num = params.epochNum;
    }
    if (typeof params?.pagination !== 'undefined') {
      setPaginationParams(options, params.pagination);
    }
    const endpoint = `babylon/epoching/v1/epochs/${params.epochNum}/validator_set`;
    return await this.req.get<QueryEpochValSetResponseSDKType>(endpoint, options);
  }
}
