/* eslint-disable */
import { AminoMsg } from '@cosmjs/amino';
import { voteOptionFromJSON } from './gov';
import { MsgDeposit, MsgVote, MsgVoteWeighted } from './tx';
export interface MsgSubmitProposalAminoType extends AminoMsg {
  type: 'cosmos-sdk/MsgSubmitProposal';
  value: {
    content: {
      type_url: string;
      value: Uint8Array;
    };
    initial_deposit: {
      denom: string;
      amount: string;
    }[];
    proposer: string;
  };
}
export interface MsgVoteAminoType extends AminoMsg {
  type: 'cosmos-sdk/MsgVote';
  value: {
    proposal_id: string;
    voter: string;
    option: number;
  };
}
export interface MsgVoteWeightedAminoType extends AminoMsg {
  type: 'cosmos-sdk/MsgVoteWeighted';
  value: {
    proposal_id: string;
    voter: string;
    options: {
      option: number;
      weight: string;
    }[];
  };
}
export interface MsgDepositAminoType extends AminoMsg {
  type: 'cosmos-sdk/MsgDeposit';
  value: {
    proposal_id: string;
    depositor: string;
    amount: {
      denom: string;
      amount: string;
    }[];
  };
}
export const AminoConverter = {
  '/govgen.gov.v1beta1.MsgVote': {
    aminoType: 'cosmos-sdk/MsgVote',
    toAmino: ({ proposalId, voter, option }: MsgVote): MsgVoteAminoType['value'] => {
      return {
        proposal_id: proposalId.toString(),
        voter,
        option,
      };
    },
    fromAmino: ({ proposal_id, voter, option }: MsgVoteAminoType['value']): MsgVote => {
      return {
        proposalId: BigInt(proposal_id),
        voter,
        option: voteOptionFromJSON(option),
      };
    },
  },
  '/govgen.gov.v1beta1.MsgVoteWeighted': {
    aminoType: 'cosmos-sdk/MsgVoteWeighted',
    toAmino: ({ proposalId, voter, options }: MsgVoteWeighted): MsgVoteWeightedAminoType['value'] => {
      return {
        proposal_id: proposalId.toString(),
        voter,
        options: options.map((el0) => ({
          option: el0.option,
          weight: el0.weight,
        })),
      };
    },
    fromAmino: ({ proposal_id, voter, options }: MsgVoteWeightedAminoType['value']): MsgVoteWeighted => {
      return {
        proposalId: BigInt(proposal_id),
        voter,
        options: options.map((el0) => ({
          option: voteOptionFromJSON(el0.option),
          weight: el0.weight,
        })),
      };
    },
  },
  '/govgen.gov.v1beta1.MsgDeposit': {
    aminoType: 'cosmos-sdk/MsgDeposit',
    toAmino: ({ proposalId, depositor, amount }: MsgDeposit): MsgDepositAminoType['value'] => {
      return {
        proposal_id: proposalId.toString(),
        depositor,
        amount: amount.map((el0) => ({
          denom: el0.denom,
          amount: el0.amount,
        })),
      };
    },
    fromAmino: ({ proposal_id, depositor, amount }: MsgDepositAminoType['value']): MsgDeposit => {
      return {
        proposalId: BigInt(proposal_id),
        depositor,
        amount: amount.map((el0) => ({
          denom: el0.denom,
          amount: el0.amount,
        })),
      };
    },
  },
};
