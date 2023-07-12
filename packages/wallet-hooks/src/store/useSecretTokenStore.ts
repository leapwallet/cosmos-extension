import create from 'zustand';

import { SecretToken } from '../types';

type SecretTokenStore = {
  secretTokens: Record<string, SecretToken>;
  selectedTokens: Record<string, SecretToken>;
  setSecretTokens: (tokens: Record<string, SecretToken>) => void;
  setSelectedTokens: (tokens: Record<string, SecretToken>) => void;
};

export const useSecretTokenStore = create<SecretTokenStore>((set) => {
  return {
    secretTokens: {},
    selectedTokens: {},
    setSecretTokens: (tokens) => set(() => ({ secretTokens: tokens })),
    setSelectedTokens: (tokens) => set(() => ({ selectedTokens: tokens })),
  };
});
