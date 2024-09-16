import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { DisableObject } from '@leapwallet/cosmos-wallet-store';
import { useEffect, useMemo } from 'react';
import create from 'zustand';

import { useActiveChain } from './useActiveChain';
import { useAddress } from './useAddress';
import { useAutoFetchedCW20TokensStore } from './useAutoFetchedCW20Tokens';
import { useDenomsStore } from './useDenoms';

type EnabledCW20Tokens = {
  enabledCW20Tokens: DisableObject | null;
  setEnabledCW20Tokens: (enabledCW20Tokens: DisableObject | null) => void;
};

export const useEnabledCW20TokensStore = create<EnabledCW20Tokens>((set) => ({
  enabledCW20Tokens: null,
  setEnabledCW20Tokens: (enabledCW20Tokens) => set(() => ({ enabledCW20Tokens })),
}));

export const useEnabledCW20Tokens = (forceChain?: SupportedChain) => {
  const _activeChain = useActiveChain();
  const activeChain = forceChain || _activeChain;
  const { setDenoms, denoms } = useDenomsStore();
  const { autoFetchedCW20Tokens } = useAutoFetchedCW20TokensStore();

  const address = useAddress(activeChain);
  const { enabledCW20Tokens } = useEnabledCW20TokensStore();
  const enabledCW20TokensForChain = useMemo(() => enabledCW20Tokens?.[address] ?? [], [address, enabledCW20Tokens]);

  useEffect(() => {
    if (denoms && enabledCW20TokensForChain.length && autoFetchedCW20Tokens) {
      let newEnabledTokens = {};

      for (const coinMinimalDenom of enabledCW20TokensForChain) {
        if (!denoms[coinMinimalDenom]) {
          newEnabledTokens = {
            ...newEnabledTokens,
            [coinMinimalDenom]: {
              ...autoFetchedCW20Tokens[coinMinimalDenom],
            },
          };
        }
      }

      if (Object.keys(newEnabledTokens).length) {
        setDenoms({ ...denoms, ...newEnabledTokens });
      }
    }
  }, [enabledCW20TokensForChain, autoFetchedCW20Tokens]);

  return enabledCW20TokensForChain;
};
