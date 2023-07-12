import create from 'zustand';

type KeyObject = {
  [key: string]: number[];
};

type SpamProposals = {
  spamProposals: KeyObject | null;
  setSpamProposals: (spamProposals: KeyObject | null) => void;
};

export const useSpamProposalsStore = create<SpamProposals>((set) => ({
  spamProposals: null,
  setSpamProposals: (spamProposals) =>
    set(() => {
      return { spamProposals };
    }),
}));

export const useSpamProposals = () => {
  const { spamProposals } = useSpamProposalsStore();
  return spamProposals ?? {};
};
