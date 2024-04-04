import { DenomsRecord, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import create from 'zustand';

import { useActiveChain } from './useActiveChain';

type BetaCW20Tokens = {
  betaCW20Tokens: Record<string, DenomsRecord> | null;
  setBetaCW20Tokens: (betaCW20Tokens: DenomsRecord | null, chain: SupportedChain) => void;
};

export const useBetaCW20TokensStore = create<BetaCW20Tokens>((set) => ({
  betaCW20Tokens: null,
  setBetaCW20Tokens: (betaCW20Tokens, chain) =>
    set((_prev) => {
      if (!betaCW20Tokens) return _prev;
      return {
        betaCW20Tokens: {
          ...(_prev?.betaCW20Tokens ?? {}),
          [chain]: betaCW20Tokens,
        },
      };
    }),
}));

export const useBetaCW20Tokens = (forceChain?: SupportedChain) => {
  const _activeChain = useActiveChain();
  const activeChain = forceChain || _activeChain;
  const { betaCW20Tokens } = useBetaCW20TokensStore();
  return betaCW20Tokens?.[activeChain] ?? {};
};
