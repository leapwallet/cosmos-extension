import { OfflineSigner, Registry } from '@cosmjs/proto-signing';
import {
  accountFromAny,
  AminoConverters,
  AminoTypes,
  createAuthzAminoConverters,
  createBankAminoConverters,
  createDistributionAminoConverters,
  createFeegrantAminoConverters,
  createGovAminoConverters,
  createIbcAminoConverters,
  createStakingAminoConverters,
  createVestingAminoConverters,
  defaultRegistryTypes,
  SigningStargateClient,
  SigningStargateClientOptions,
  StdFee,
} from '@cosmjs/stargate';
import { MsgGrant, MsgRevoke } from 'cosmjs-types/cosmos/authz/v1beta1/tx.js';
import { MsgCancelUnbondingDelegation } from 'cosmjs-types/cosmos/staking/v1beta1/tx.js';

import { govgenProtoRegistry } from '../proto/govgen/client';
import { VoteOption } from '../proto/govgen/gov/v1beta1/gov';
import { AminoConverter } from '../proto/govgen/gov/v1beta1/tx.amino';
import { getVoteMsg } from './msgs';
import { Tx } from './tx';

function createDefaultAminoConverters(prefix: string): AminoConverters {
  return {
    ...createAuthzAminoConverters(),
    ...createBankAminoConverters(),
    ...createDistributionAminoConverters(),
    ...createGovAminoConverters(),
    ...createStakingAminoConverters(prefix),
    ...createIbcAminoConverters(),
    ...createFeegrantAminoConverters(),
    ...createVestingAminoConverters(),
    ...AminoConverter,
  };
}

export class GovGenTx extends Tx {
  constructor(rpcEndPoint: string, wallet: OfflineSigner, options?: SigningStargateClientOptions) {
    super(rpcEndPoint, wallet, options);
    this.registry = new Registry([...defaultRegistryTypes, ...govgenProtoRegistry]);
  }

  async initClient() {
    this.client = await SigningStargateClient.connectWithSigner(this.rpcEndPoint, this.wallet, {
      broadcastPollIntervalMs: this.options?.broadcastPollIntervalMs ?? 5_000,
      accountParser: (input: any) => {
        return accountFromAny(input);
      },
      aminoTypes: new AminoTypes(createDefaultAminoConverters('cosmos')),
    });
    this.client.registry.register('/cosmos.authz.v1beta1.MsgGrant', MsgGrant);
    this.client.registry.register('/cosmos.authz.v1beta1.MsgRevoke', MsgRevoke);
    this.client.registry.register('/cosmos.staking.v1beta1.MsgCancelUnbondingDelegation', MsgCancelUnbondingDelegation);
  }

  async addGovGenRegistry() {
    govgenProtoRegistry.forEach((registryEntry) => this.client?.registry.register(registryEntry[0], registryEntry[1]));
  }

  async vote(
    fromAddress: string,
    proposalId: string,
    option: VoteOption,
    fees: number | StdFee | 'auto',
    memo?: string,
  ) {
    const voteMsg = getVoteMsg(option, proposalId, fromAddress, '/govgen.gov.v1beta1.MsgVote');
    return await this.signAndBroadcastTx(fromAddress, [voteMsg], fees, memo);
  }
}
