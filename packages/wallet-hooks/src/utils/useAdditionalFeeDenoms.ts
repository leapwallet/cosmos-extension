import { DenomWithGasPriceStep, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { useMemo } from 'react';

import { useActiveChain, useChainsStore, useDenoms, useFeeDenoms, useSelectedNetwork } from '../store';

/**
 * Please use `FeeDenomsStore` from `@leapwallet/cosmos-wallet-store` instead of this hook
 */
export const useAdditionalFeeDenoms = (
  forceChain?: string,
  forceNetwork?: 'mainnet' | 'testnet',
): DenomWithGasPriceStep[] => {
  const { chains } = useChainsStore();
  const _activeChain = useActiveChain();
  const feeDenoms = useFeeDenoms();
  const denoms = useDenoms();
  const _selectedNetwork = useSelectedNetwork();

  const activeChain = (forceChain ?? _activeChain) as SupportedChain;
  const selectedNetwork = forceNetwork ?? _selectedNetwork;

  const additionalFeeDenoms = useMemo(() => {
    return Object.values(chains[activeChain]?.feeCurrencies ?? {});
  }, [activeChain, chains, selectedNetwork, feeDenoms, denoms]);

  return additionalFeeDenoms;
};
