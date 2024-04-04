import { DenomsRecord, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import create from 'zustand';

import { useActiveChain } from './useActiveChain';

type CW20Tokens = {
  cw20Tokens: Record<string, DenomsRecord> | null;
  setCW20Tokens: (cw20Tokens: DenomsRecord | null, chain: SupportedChain) => void;
};

export const useCW20TokensStore = create<CW20Tokens>((set) => ({
  cw20Tokens: null,
  setCW20Tokens: (cw20Tokens, chain) =>
    set((_prev) => {
      if (!cw20Tokens) return _prev;
      return { cw20Tokens: { ...(_prev?.cw20Tokens ?? {}), [chain]: cw20Tokens } };
    }),
}));

export const useCW20Tokens = (forceChain?: SupportedChain) => {
  const _activeChain = useActiveChain();
  const activeChain = forceChain || _activeChain;
  const { cw20Tokens } = useCW20TokensStore();
  return (cw20Tokens?.[activeChain] ?? {}) as DenomsRecord;
};
