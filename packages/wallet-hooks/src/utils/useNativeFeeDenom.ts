import {
  DenomsRecord,
  feeDenoms as fallbackFeeDenoms,
  NativeDenom,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk';
import { useMemo } from 'react';

import { useActiveChain, useChainsStore, useDenoms, useFeeDenoms, useSelectedNetwork } from '../store';

export const useNativeFeeDenom = (
  denoms: DenomsRecord,
  forceChain?: string,
  forceNetwork?: 'mainnet' | 'testnet',
): NativeDenom => {
  const { chains } = useChainsStore();
  const _activeChain = useActiveChain();
  const feeDenoms = useFeeDenoms();
  const _selectedNetwork = useSelectedNetwork();

  const activeChain = useMemo(() => (forceChain ?? _activeChain) as SupportedChain, [_activeChain, forceChain]);
  const selectedNetwork = useMemo(() => forceNetwork ?? _selectedNetwork, [forceNetwork, _selectedNetwork]);

  const nativeFeeDenom = useMemo(() => {
    const feeDenom = feeDenoms[selectedNetwork][activeChain];

    if (feeDenom && denoms[feeDenom]) {
      return denoms[feeDenom];
    }

    if (chains[activeChain].beta && chains[activeChain].nativeDenoms) {
      const nativeDenom = Object.values(chains[activeChain].nativeDenoms)[0];
      return denoms[nativeDenom.coinMinimalDenom] ?? nativeDenom;
    }

    const fallbackFeeDenom = fallbackFeeDenoms[selectedNetwork][activeChain];
    if (fallbackFeeDenom?.coinMinimalDenom) {
      return denoms[fallbackFeeDenom.coinMinimalDenom] ?? fallbackFeeDenom;
    }

    return fallbackFeeDenom;
  }, [activeChain, chains, selectedNetwork]);

  return nativeFeeDenom;
};
