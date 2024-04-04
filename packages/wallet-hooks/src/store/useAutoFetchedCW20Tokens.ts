import { DenomsRecord, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import create from 'zustand';

import { useActiveChain } from './useActiveChain';

type AutoFetchedCW20Tokens = {
  autoFetchedCW20Tokens: Record<string, DenomsRecord> | null;
  setAutoFetchedCW20Tokens: (cw20Tokens: DenomsRecord | null, chain: SupportedChain) => void;
};

export const useAutoFetchedCW20TokensStore = create<AutoFetchedCW20Tokens>((set) => ({
  autoFetchedCW20Tokens: null,
  setAutoFetchedCW20Tokens: (autoFetchedCW20Tokens, chain) =>
    set((_prev) => {
      if (!autoFetchedCW20Tokens) return _prev;
      return {
        autoFetchedCW20Tokens: {
          ...(_prev?.autoFetchedCW20Tokens ?? {}),
          [chain]: autoFetchedCW20Tokens,
        },
      };
    }),
}));

export const useAutoFetchedCW20Tokens = (forceChain?: SupportedChain) => {
  const _activeChain = useActiveChain();
  const activeChain = forceChain || _activeChain;
  const { autoFetchedCW20Tokens } = useAutoFetchedCW20TokensStore();
  return (autoFetchedCW20Tokens?.[activeChain] ?? {}) as DenomsRecord;
};
