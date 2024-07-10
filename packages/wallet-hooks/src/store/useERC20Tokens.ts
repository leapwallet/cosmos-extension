import { DenomsRecord, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { useMemo } from 'react';
import create from 'zustand';

import { useActiveChain } from './useActiveChain';

type ERCTokens = {
  erc20Tokens: Record<string, DenomsRecord> | null;
  setERC20Tokens: (erc20Tokens: DenomsRecord | null, chain: SupportedChain) => void;
};

export const useERC20TokensStore = create<ERCTokens>((set) => ({
  erc20Tokens: null,
  setERC20Tokens: (erc20Tokens, chain) =>
    set((_prev) => {
      if (!erc20Tokens) return _prev;
      return { erc20Tokens: { ...(_prev?.erc20Tokens ?? {}), [chain]: erc20Tokens } };
    }),
}));

export const useERC20Tokens = (forceChain?: SupportedChain) => {
  const _activeChain = useActiveChain();
  const activeChain = forceChain || _activeChain;
  const { erc20Tokens } = useERC20TokensStore();

  return useMemo(() => erc20Tokens?.[activeChain] ?? {}, [activeChain, erc20Tokens]);
};
