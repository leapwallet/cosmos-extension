import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { useMemo } from 'react';

import { useActiveChain } from '../store/useActiveChain';
import { useSelectedNetwork } from '../store/useSelectedNetwork';
import { getChainId } from '../utils';
import { useChainInfo } from './use-chain-info';

export function useChainId(forceChain?: SupportedChain, forceNetwork?: 'mainnet' | 'testnet') {
  const _activeChain = useActiveChain();
  const activeChain = useMemo(() => forceChain ?? _activeChain, [forceChain, _activeChain]);

  const _selectedNetwork = useSelectedNetwork();
  const selectedNetwork = useMemo(() => forceNetwork ?? _selectedNetwork, [forceNetwork, _selectedNetwork]);

  const chainInfo = useChainInfo(activeChain);
  return useMemo(() => {
    return getChainId(chainInfo, selectedNetwork);
  }, [selectedNetwork, chainInfo]);
}
