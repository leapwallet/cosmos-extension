import create from 'zustand';

import { Proposal } from '../types';

type Status = 'loading' | 'success' | 'error' | 'fetching-more';

type GovProposalsStore = {
  data: Proposal[];
  status: Status;
  fetchMore: () => Promise<void>;

  setGovernanceData: (data: Proposal[], fetchMore: () => Promise<void>) => void;
  setGovernanceStatus: (status: Status) => void;
};

export const useGovProposalsStore = create<GovProposalsStore>((set) => ({
  data: [],
  status: 'loading',
  fetchMore: async function () {
    await Promise.resolve();
  },

  setGovernanceData: (data, fetchMore) => set(() => ({ data, fetchMore })),
  setGovernanceStatus: (status) => set(() => ({ status })),
}));

export const useGovProposals = () => {
  const { data, status, fetchMore } = useGovProposalsStore();
  return { data, status, fetchMore };
};
