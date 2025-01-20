import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { SelectedNetworkType } from '@leapwallet/cosmos-wallet-store';
import { useMemo } from 'react';

import { useActiveChain, useChainCosmosSDKStore, useSelectedNetwork } from '../store';
import { useChainId } from './use-chain-id';

export function useHasToCalculateDynamicFee(forceChain?: SupportedChain, forceNetwork?: SelectedNetworkType) {
  const { chainCosmosSDK } = useChainCosmosSDKStore();
  const _activeChain = useActiveChain();
  const _activeNetwork = useSelectedNetwork();

  const activeChain = useMemo(() => forceChain || _activeChain, [_activeChain, forceChain]);
  const activeNetwork = useMemo(() => forceNetwork || _activeNetwork, [_activeNetwork, forceNetwork]);
  const activeChainId = useChainId(activeChain, activeNetwork);

  return useMemo(() => {
    if (activeChainId) {
      return chainCosmosSDK?.[activeChainId]?.dynamic_fee_market ?? false;
    }

    return false;
  }, [activeChainId, chainCosmosSDK]);
}
