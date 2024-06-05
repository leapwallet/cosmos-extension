import create from 'zustand';

type BetaEvmNftTokenIds = {
  [contractAddress: string]: {
    [walletAddress: string]: string[];
  };
};

type BetaEvmNftTokenIdsStore = {
  betaEvmNftTokenIds: BetaEvmNftTokenIds;
  setBetaEvmNftTokenIds: (betaEvmNftTokenIds: BetaEvmNftTokenIds) => void;
};

export const useBetaEvmNftTokenIdsStore = create<BetaEvmNftTokenIdsStore>((set) => ({
  betaEvmNftTokenIds: {},
  setBetaEvmNftTokenIds: (betaEvmNftTokenIds) => set(() => ({ betaEvmNftTokenIds })),
}));

export const useBetaEvmNftTokenIds = () => {
  const { betaEvmNftTokenIds } = useBetaEvmNftTokenIdsStore();
  return betaEvmNftTokenIds ?? {};
};
