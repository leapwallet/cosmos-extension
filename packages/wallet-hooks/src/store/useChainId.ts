import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { useMemo } from 'react';

import { getChainId } from '../utils';
import { useActiveChain } from './useActiveChain';
import { useChainInfo } from './useChainInfo';
import { useSelectedNetwork } from './useSelectedNetwork';

export function useChainId(forceChain?: SupportedChain, forceNetwork?: 'mainnet' | 'testnet') {
  const _activeChain = useActiveChain();
  const activeChain = forceChain ?? _activeChain;

  const _selectedNetwork = useSelectedNetwork();
  const selectedNetwork = forceNetwork ?? _selectedNetwork;

  const chainInfo = useChainInfo(activeChain);

  return useMemo(() => {
    return getChainId(chainInfo, selectedNetwork);
  }, [selectedNetwork, chainInfo]);
}
