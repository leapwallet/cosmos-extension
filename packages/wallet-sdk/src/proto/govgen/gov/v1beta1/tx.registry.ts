/* eslint-disable */
import { Registry } from '@cosmjs/proto-signing';

import { MsgDeposit, MsgVote, MsgVoteWeighted } from './tx';
import { TelescopeGeneratedType } from './types';

export const registry: ReadonlyArray<[string, TelescopeGeneratedType<any, any, any>]> = [
  ['/govgen.gov.v1beta1.MsgVote', MsgVote],
  ['/govgen.gov.v1beta1.MsgVoteWeighted', MsgVoteWeighted],
  ['/govgen.gov.v1beta1.MsgDeposit', MsgDeposit],
];
export const load = (protoRegistry: Registry) => {
  registry.forEach(([typeUrl, mod]) => {
    protoRegistry.register(typeUrl, mod);
  });
};
export const MessageComposer = {
  encoded: {
    vote(value: MsgVote) {
      return {
        typeUrl: '/govgen.gov.v1beta1.MsgVote',
        value: MsgVote.encode(value).finish(),
      };
    },
    voteWeighted(value: MsgVoteWeighted) {
      return {
        typeUrl: '/govgen.gov.v1beta1.MsgVoteWeighted',
        value: MsgVoteWeighted.encode(value).finish(),
      };
    },
    deposit(value: MsgDeposit) {
      return {
        typeUrl: '/govgen.gov.v1beta1.MsgDeposit',
        value: MsgDeposit.encode(value).finish(),
      };
    },
  },
  withTypeUrl: {
    vote(value: MsgVote) {
      return {
        typeUrl: '/govgen.gov.v1beta1.MsgVote',
        value,
      };
    },
    voteWeighted(value: MsgVoteWeighted) {
      return {
        typeUrl: '/govgen.gov.v1beta1.MsgVoteWeighted',
        value,
      };
    },
    deposit(value: MsgDeposit) {
      return {
        typeUrl: '/govgen.gov.v1beta1.MsgDeposit',
        value,
      };
    },
  },
  toJSON: {
    vote(value: MsgVote) {
      return {
        typeUrl: '/govgen.gov.v1beta1.MsgVote',
        value: MsgVote.toJSON(value),
      };
    },
    voteWeighted(value: MsgVoteWeighted) {
      return {
        typeUrl: '/govgen.gov.v1beta1.MsgVoteWeighted',
        value: MsgVoteWeighted.toJSON(value),
      };
    },
    deposit(value: MsgDeposit) {
      return {
        typeUrl: '/govgen.gov.v1beta1.MsgDeposit',
        value: MsgDeposit.toJSON(value),
      };
    },
  },
  fromJSON: {
    vote(value: any) {
      return {
        typeUrl: '/govgen.gov.v1beta1.MsgVote',
        value: MsgVote.fromJSON(value),
      };
    },
    voteWeighted(value: any) {
      return {
        typeUrl: '/govgen.gov.v1beta1.MsgVoteWeighted',
        value: MsgVoteWeighted.fromJSON(value),
      };
    },
    deposit(value: any) {
      return {
        typeUrl: '/govgen.gov.v1beta1.MsgDeposit',
        value: MsgDeposit.fromJSON(value),
      };
    },
  },
  fromPartial: {
    vote(value: MsgVote) {
      return {
        typeUrl: '/govgen.gov.v1beta1.MsgVote',
        value: MsgVote.fromPartial(value),
      };
    },
    voteWeighted(value: MsgVoteWeighted) {
      return {
        typeUrl: '/govgen.gov.v1beta1.MsgVoteWeighted',
        value: MsgVoteWeighted.fromPartial(value),
      };
    },
    deposit(value: MsgDeposit) {
      return {
        typeUrl: '/govgen.gov.v1beta1.MsgDeposit',
        value: MsgDeposit.fromPartial(value),
      };
    },
  },
};
