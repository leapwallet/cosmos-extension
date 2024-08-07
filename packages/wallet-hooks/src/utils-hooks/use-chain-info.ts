import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { useMemo } from 'react';

import { useActiveChain } from '../store/useActiveChain';
import { useGetChains } from '../store/useChainsStore';

export function useChainInfo(forceChain?: SupportedChain) {
  const activeChain = useActiveChain();
  const chain = forceChain ?? activeChain;
  const chainInfos = useGetChains();

  return useMemo(() => {
    return chainInfos[chain];
  }, [chainInfos, chain]);
}
