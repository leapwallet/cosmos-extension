import {
  DenomsRecord,
  feeDenoms as fallbackFeeDenoms,
  NativeDenom,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk';
import { useMemo } from 'react';

import { useActiveChain, useChainsStore, useFeeDenoms, useSelectedNetwork } from '../store';
import { getKeyToUseForDenoms } from './getKeyToUseForDenoms';

/**
 * Please use `FeeDenomsStore` from `@leapwallet/cosmos-wallet-store` instead of this hook
 */
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
  const chainId = chains?.[activeChain]?.chainId;

  const nativeFeeDenom = useMemo(() => {
    const feeDenom = feeDenoms?.[selectedNetwork]?.[activeChain];

    if (feeDenom && denoms?.[feeDenom]) {
      let denomKey = feeDenom;
      if (activeChain === 'babylon' && denomKey === 'ubbn') {
        denomKey = 'tubbn';
      }

      return denoms?.[denomKey];
    }

    if (chains?.[activeChain]?.beta && chains?.[activeChain]?.nativeDenoms) {
      const nativeDenom = Object.values(chains?.[activeChain]?.nativeDenoms ?? {})[0];
      return denoms?.[nativeDenom?.coinMinimalDenom] ?? nativeDenom;
    }

    const fallbackFeeDenom = fallbackFeeDenoms?.[selectedNetwork]?.[activeChain];
    if (fallbackFeeDenom?.coinMinimalDenom) {
      let denomKey = getKeyToUseForDenoms(fallbackFeeDenom.coinMinimalDenom, chainId);
      if (activeChain === 'babylon' && denomKey === 'ubbn') {
        denomKey = 'tubbn';
      }

      return denoms[denomKey] ?? fallbackFeeDenom;
    }

    return fallbackFeeDenom;
  }, [activeChain, chains, selectedNetwork, feeDenoms, denoms]);

  return nativeFeeDenom;
};
