import create from 'zustand';

import { Proposal, ProposalApi } from '../types';

type Status = 'loading' | 'success' | 'error' | 'fetching-more';

type GovProposalsStore = {
  data: Proposal[] | ProposalApi[];
  status: Status;
  shouldUseFallback: boolean;
  fetchMore: () => Promise<void>;

  setShouldUseFallback: (shouldUseFallback: boolean) => void;
  setGovernanceData: (data: Proposal[]) => void;
  setGovernanceFetchMore: (fetchMore: () => Promise<void>) => void;
  setGovernanceStatus: (status: Status) => void;
};

export const useGovProposalsStore = create<GovProposalsStore>((set) => ({
  data: [],
  status: 'loading',
  fetchMore: async function () {
    await Promise.resolve();
  },
  shouldUseFallback: false,

  setGovernanceData: (data) => set(() => ({ data })),
  setGovernanceFetchMore: (fetchMore) => set(() => ({ fetchMore })),
  setGovernanceStatus: (status) => set(() => ({ status })),
  setShouldUseFallback: (shouldUseFallback) => set(() => ({ shouldUseFallback })),
}));

export const useGovProposals = () => {
  const { data, status, fetchMore, shouldUseFallback } = useGovProposalsStore();
  return { data, status, fetchMore, shouldUseFallback };
};
