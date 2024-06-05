import { DenomsRecord, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { useMemo } from 'react';
import create from 'zustand';

import { useActiveChain } from './useActiveChain';

type BetaERC20Tokens = {
  betaERC20Tokens: Record<string, DenomsRecord> | null;
  setBetaERC20Tokens: (betaERC20Tokens: DenomsRecord | null, chain: SupportedChain) => void;
};

export const useBetaERC20TokensStore = create<BetaERC20Tokens>((set) => ({
  betaERC20Tokens: null,
  setBetaERC20Tokens: (betaERC20Tokens, chain) =>
    set((_prev) => {
      if (!betaERC20Tokens) return _prev;
      return {
        betaERC20Tokens: {
          ...(_prev?.betaERC20Tokens ?? {}),
          [chain]: betaERC20Tokens,
        },
      };
    }),
}));

export const useBetaERC20Tokens = (forceChain?: SupportedChain) => {
  const _activeChain = useActiveChain();
  const activeChain = forceChain || _activeChain;
  const { betaERC20Tokens } = useBetaERC20TokensStore();
  return useMemo(() => betaERC20Tokens?.[activeChain] ?? {}, [betaERC20Tokens, activeChain]);
};
