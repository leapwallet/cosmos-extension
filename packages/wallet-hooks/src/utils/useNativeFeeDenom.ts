import { feeDenoms, NativeDenom, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { useMemo } from 'react';

import { useActiveChain, useChainsStore, useSelectedNetwork } from '../store';

export const useNativeFeeDenom = (forceChain?: string, forceNetwork?: 'mainnet' | 'testnet'): NativeDenom => {
  const { chains } = useChainsStore();
  const _activeChain = useActiveChain();
  const _selectedNetwork = useSelectedNetwork();

  const activeChain = (forceChain ?? _activeChain) as SupportedChain;
  const selectedNetwork = forceNetwork ?? _selectedNetwork;

  const nativeFeeDenom = useMemo(() => {
    if (chains[activeChain].beta && chains[activeChain].nativeDenoms) {
      return Object.values(chains[activeChain].nativeDenoms)[0];
    }
    return feeDenoms[selectedNetwork][activeChain];
  }, [activeChain, chains, selectedNetwork]);

  return nativeFeeDenom;
};
