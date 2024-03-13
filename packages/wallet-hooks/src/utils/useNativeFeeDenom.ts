import { feeDenoms as fallbackFeeDenoms, NativeDenom, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { useMemo } from 'react';

import { useActiveChain, useChainsStore, useDenoms, useFeeDenoms, useSelectedNetwork } from '../store';

export const useNativeFeeDenom = (forceChain?: string, forceNetwork?: 'mainnet' | 'testnet'): NativeDenom => {
  const { chains } = useChainsStore();
  const _activeChain = useActiveChain();
  const feeDenoms = useFeeDenoms();
  const denoms = useDenoms();
  const _selectedNetwork = useSelectedNetwork();

  const activeChain = (forceChain ?? _activeChain) as SupportedChain;
  const selectedNetwork = forceNetwork ?? _selectedNetwork;

  const nativeFeeDenom = useMemo(() => {
    if (chains[activeChain].beta && chains[activeChain].nativeDenoms) {
      const nativeDenom = Object.values(chains[activeChain].nativeDenoms)[0];
      return denoms[nativeDenom.coinMinimalDenom] ?? nativeDenom;
    }

    return feeDenoms[selectedNetwork][activeChain]
      ? denoms[feeDenoms[selectedNetwork][activeChain]]
      : fallbackFeeDenoms[selectedNetwork][activeChain];
  }, [activeChain, chains, selectedNetwork]);

  return nativeFeeDenom;
};
