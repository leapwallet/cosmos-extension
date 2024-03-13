import create from 'zustand';

import { useAddress } from './useAddress';

export type InteractedToken = {
  [key: string]: string[];
};

type InteractedTokens = {
  interactedTokens: InteractedToken | null;
  setInteractedTokens: (interactedTokens: InteractedToken | null) => void;
};

export const useInteractedTokensStore = create<InteractedTokens>((set) => ({
  interactedTokens: null,
  setInteractedTokens: (interactedTokens) => set(() => ({ interactedTokens })),
}));

export const useInteractedTokens = () => {
  const address = useAddress();
  return useInteractedTokensStore((state) => (state.interactedTokens ? state.interactedTokens[address] ?? [] : []));
};
