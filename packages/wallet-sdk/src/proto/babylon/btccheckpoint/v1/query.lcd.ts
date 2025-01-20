import { LCDClient } from '@cosmology/lcd';

import { setPaginationParams } from '../../../helpers';
import {
  QueryBtcCheckpointInfoRequest,
  QueryBtcCheckpointInfoResponseSDKType,
  QueryBtcCheckpointsInfoRequest,
  QueryBtcCheckpointsInfoResponseSDKType,
  QueryEpochSubmissionsRequest,
  QueryEpochSubmissionsResponseSDKType,
  QueryParamsRequest,
  QueryParamsResponseSDKType,
} from './query';
export class LCDQueryClient {
  req: LCDClient;
  constructor({ requestClient }: { requestClient: LCDClient }) {
    this.req = requestClient;
    this.params = this.params.bind(this);
    this.btcCheckpointInfo = this.btcCheckpointInfo.bind(this);
    this.btcCheckpointsInfo = this.btcCheckpointsInfo.bind(this);
    this.epochSubmissions = this.epochSubmissions.bind(this);
  }
  /* Parameters queries the parameters of the module. */
  async params(_params: QueryParamsRequest = {}): Promise<QueryParamsResponseSDKType> {
    const endpoint = `babylon/btccheckpoint/v1/params`;
    return await this.req.get<QueryParamsResponseSDKType>(endpoint);
  }
  /* BtcCheckpointInfo returns checkpoint info for a given epoch */
  async btcCheckpointInfo(params: QueryBtcCheckpointInfoRequest): Promise<QueryBtcCheckpointInfoResponseSDKType> {
    const endpoint = `babylon/btccheckpoint/v1/${params.epochNum}`;
    return await this.req.get<QueryBtcCheckpointInfoResponseSDKType>(endpoint);
  }
  /* BtcCheckpointsInfo returns checkpoint info for a range of epochs */
  async btcCheckpointsInfo(
    params: QueryBtcCheckpointsInfoRequest = {
      pagination: undefined,
    },
  ): Promise<QueryBtcCheckpointsInfoResponseSDKType> {
    const options: any = {
      params: {},
    };
    if (typeof params?.pagination !== 'undefined') {
      setPaginationParams(options, params.pagination);
    }
    const endpoint = `babylon/btccheckpoint/v1`;
    return await this.req.get<QueryBtcCheckpointsInfoResponseSDKType>(endpoint, options);
  }
  /* EpochSubmissions returns all submissions for a given epoch */
  async epochSubmissions(params: QueryEpochSubmissionsRequest): Promise<QueryEpochSubmissionsResponseSDKType> {
    const endpoint = `babylon/btccheckpoint/v1/${params.epochNum}/submissions`;
    return await this.req.get<QueryEpochSubmissionsResponseSDKType>(endpoint);
  }
}
