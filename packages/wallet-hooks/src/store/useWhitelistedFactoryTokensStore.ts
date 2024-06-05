import create from 'zustand';

type WhitelistedFactoryTokensState = {
  whitelistedFactoryTokens: Record<string, boolean>;
  setWhitelistedFactoryTokens: (whitelistedFactoryTokens: Record<string, boolean>) => void;
};

export const useWhitelistedFactoryTokensStore = create<WhitelistedFactoryTokensState>((set) => ({
  whitelistedFactoryTokens: {},
  setWhitelistedFactoryTokens: (whitelistedFactoryTokens) =>
    set(() => {
      return { whitelistedFactoryTokens };
    }),
}));

export const useWhitelistedFactoryTokens = (): Record<string, boolean> => {
  return useWhitelistedFactoryTokensStore((state) => state.whitelistedFactoryTokens);
};
