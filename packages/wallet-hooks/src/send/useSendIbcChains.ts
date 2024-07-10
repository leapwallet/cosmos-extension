import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { useMemo } from 'react';

import { useGetIBCSupport } from '../ibc';
import { useActiveChain, useActiveWallet, useGetChains } from '../store';

export function useSendIbcChains(forceChain?: SupportedChain) {
  const _activeChain = useActiveChain();
  const activeChain = useMemo(() => forceChain || _activeChain, [forceChain, _activeChain]);
  const { data: ibcSupportData, isLoading: isIbcSupportDataLoading } = useGetIBCSupport(activeChain);
  const activeWallet = useActiveWallet();
  const chains = useGetChains();

  return useMemo(() => {
    if (activeWallet?.addresses && !isIbcSupportDataLoading && ibcSupportData) {
      return Object.entries(activeWallet.addresses).filter(([chain]) => {
        const chainInfo = chains[chain as SupportedChain];
        const chainRegistryPath = chainInfo?.chainRegistryPath;

        return ibcSupportData[chainRegistryPath] && chainInfo?.enabled;
      });
    }

    return [];
  }, [activeWallet, ibcSupportData, isIbcSupportDataLoading]);
}
