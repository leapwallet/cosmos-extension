import { LCDClient } from '@cosmology/lcd';

import { setPaginationParams } from '../../../helpers';
import {
  QueryBlsPublicKeyListRequest,
  QueryBlsPublicKeyListResponseSDKType,
  QueryEpochStatusRequest,
  QueryEpochStatusResponseSDKType,
  QueryLastCheckpointWithStatusRequest,
  QueryLastCheckpointWithStatusResponseSDKType,
  QueryRawCheckpointListRequest,
  QueryRawCheckpointListResponseSDKType,
  QueryRawCheckpointRequest,
  QueryRawCheckpointResponseSDKType,
  QueryRawCheckpointsRequest,
  QueryRawCheckpointsResponseSDKType,
  QueryRecentEpochStatusCountRequest,
  QueryRecentEpochStatusCountResponseSDKType,
} from './query';
export class LCDQueryClient {
  req: LCDClient;
  constructor({ requestClient }: { requestClient: LCDClient }) {
    this.req = requestClient;
    this.rawCheckpointList = this.rawCheckpointList.bind(this);
    this.rawCheckpoint = this.rawCheckpoint.bind(this);
    this.rawCheckpoints = this.rawCheckpoints.bind(this);
    this.blsPublicKeyList = this.blsPublicKeyList.bind(this);
    this.epochStatus = this.epochStatus.bind(this);
    this.recentEpochStatusCount = this.recentEpochStatusCount.bind(this);
    this.lastCheckpointWithStatus = this.lastCheckpointWithStatus.bind(this);
  }
  /* RawCheckpointList queries all checkpoints that match the given status. */
  async rawCheckpointList(params: QueryRawCheckpointListRequest): Promise<QueryRawCheckpointListResponseSDKType> {
    const options: any = {
      params: {},
    };
    if (typeof params?.pagination !== 'undefined') {
      setPaginationParams(options, params.pagination);
    }
    const endpoint = `babylon/checkpointing/v1/raw_checkpoints/${params.status}`;
    return await this.req.get<QueryRawCheckpointListResponseSDKType>(endpoint, options);
  }
  /* RawCheckpoint queries a checkpoints at a given epoch number. */
  async rawCheckpoint(params: QueryRawCheckpointRequest): Promise<QueryRawCheckpointResponseSDKType> {
    const endpoint = `babylon/checkpointing/v1/raw_checkpoint/${params.epochNum}`;
    return await this.req.get<QueryRawCheckpointResponseSDKType>(endpoint);
  }
  /* RawCheckpoints queries checkpoints for a epoch range specified in pagination params. */
  async rawCheckpoints(
    params: QueryRawCheckpointsRequest = {
      pagination: undefined,
    },
  ): Promise<QueryRawCheckpointsResponseSDKType> {
    const options: any = {
      params: {},
    };
    if (typeof params?.pagination !== 'undefined') {
      setPaginationParams(options, params.pagination);
    }
    const endpoint = `babylon/checkpointing/v1/raw_checkpoints`;
    return await this.req.get<QueryRawCheckpointsResponseSDKType>(endpoint, options);
  }
  /* BlsPublicKeyList queries a list of bls public keys of the validators at a
   given epoch number. */
  async blsPublicKeyList(params: QueryBlsPublicKeyListRequest): Promise<QueryBlsPublicKeyListResponseSDKType> {
    const options: any = {
      params: {},
    };
    if (typeof params?.pagination !== 'undefined') {
      setPaginationParams(options, params.pagination);
    }
    const endpoint = `babylon/checkpointing/v1/bls_public_keys/${params.epochNum}`;
    return await this.req.get<QueryBlsPublicKeyListResponseSDKType>(endpoint, options);
  }
  /* EpochStatus queries the status of the checkpoint at a given epoch */
  async epochStatus(params: QueryEpochStatusRequest): Promise<QueryEpochStatusResponseSDKType> {
    const endpoint = `babylon/checkpointing/v1/epochs/${params.epochNum}/status`;
    return await this.req.get<QueryEpochStatusResponseSDKType>(endpoint);
  }
  /* RecentEpochStatusCount queries the number of epochs with each status in
   recent epochs */
  async recentEpochStatusCount(
    params: QueryRecentEpochStatusCountRequest,
  ): Promise<QueryRecentEpochStatusCountResponseSDKType> {
    const options: any = {
      params: {},
    };
    if (typeof params?.epochCount !== 'undefined') {
      options.params.epoch_count = params.epochCount;
    }
    const endpoint = `babylon/checkpointing/v1/epochs:status_count`;
    return await this.req.get<QueryRecentEpochStatusCountResponseSDKType>(endpoint, options);
  }
  /* LastCheckpointWithStatus queries the last checkpoint with a given status or
   a more matured status */
  async lastCheckpointWithStatus(
    params: QueryLastCheckpointWithStatusRequest,
  ): Promise<QueryLastCheckpointWithStatusResponseSDKType> {
    const endpoint = `babylon/checkpointing/v1/last_raw_checkpoint/${params.status}`;
    return await this.req.get<QueryLastCheckpointWithStatusResponseSDKType>(endpoint);
  }
}
