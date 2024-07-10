import create from 'zustand';

import { Proposal, ProposalApi, ProposalStatus } from '../types';

export type AggregatedGovernance = {
  perChainGovernance: {
    [key: string]: Proposal[] | ProposalApi[];
  };
  perChainShouldUseFallback: {
    [key: string]: boolean;
  };
  votingProposals: (Proposal | ProposalApi)[];
  nonVotingProposals: (Proposal | ProposalApi)[];
};

type AggregatedGovernanceStore = {
  aggregatedGovernance: AggregatedGovernance;
  setAggregatedGovernance: (aggregatedGovernance: AggregatedGovernance) => void;
};

export const useAggregatedGovernanceStore = create<AggregatedGovernanceStore>((set) => ({
  aggregatedGovernance: {
    perChainGovernance: {},
    perChainShouldUseFallback: {},
    votingProposals: [],
    nonVotingProposals: [],
  },
  setAggregatedGovernance: (aggregatedGovernance) => {
    set((prevValue) => {
      const { perChainGovernance: newPerChainGovernance, perChainShouldUseFallback: newPerChainShouldUseFallback } =
        aggregatedGovernance;
      const { perChainGovernance: prevPerChainGovernance, perChainShouldUseFallback: oldPerChainShouldUseFallback } =
        prevValue.aggregatedGovernance;

      const chain = Object.keys(newPerChainGovernance)[0];
      const allUniqueProposalsForGivenChain = [
        ...(prevPerChainGovernance[chain] ?? []),
        ...newPerChainGovernance[chain],
      ].reduce((acc, proposal) => {
        if (acc.find((p) => p.proposal_id === proposal.proposal_id)) {
          return acc;
        }

        return [...acc, { ...proposal, chain }] as Proposal[] | ProposalApi[];
      }, [] as Proposal[] | ProposalApi[]);

      const perChainGovernance = {
        ...prevPerChainGovernance,
        [chain]: allUniqueProposalsForGivenChain,
      };
      const allProposals = Object.values(perChainGovernance).reduce(
        (acc, proposals) => [...acc, ...proposals] as Proposal[] | ProposalApi[],
        [],
      );

      const votingProposals = allProposals.filter(
        (proposal) => proposal.status === ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD,
      );
      const nonVotingProposals = allProposals.filter(
        (proposal) => proposal.status !== ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD,
      );

      const perChainShouldUseFallback = {
        ...oldPerChainShouldUseFallback,
        ...newPerChainShouldUseFallback,
      };

      return {
        aggregatedGovernance: {
          perChainGovernance,
          votingProposals,
          nonVotingProposals,
          perChainShouldUseFallback,
        },
      };
    });
  },
}));

export const useAggregatedGovernance = () => {
  const { aggregatedGovernance } = useAggregatedGovernanceStore();
  return aggregatedGovernance;
};
