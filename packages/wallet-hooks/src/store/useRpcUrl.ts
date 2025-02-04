import { ChainInfo, getChainApis, isAptosChain, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useGetChains, useSelectedNetwork } from '../store';
import { useActiveChain } from './useActiveChain';

export const checkApiAvailability = async (url: string) => {
  try {
    const res = await fetch(`${url}/status`);
    return res.status === 200;
  } catch {
    return false;
  }
};

/**
 * Please use `ApiAvailabilityStore` from `@leapwallet/cosmos-wallet-store` instead of this hook
 */
function useApiAvailability(url: string) {
  const [isUrlAvailable, setIsUrlAvailable] = useState(true);
  useEffect(() => {
    if (!url) return;

    checkApiAvailability(url).then(setIsUrlAvailable);
  }, [url]);

  return isUrlAvailable;
}

/**
 * Please use `ChainApisStore` from `@leapwallet/cosmos-wallet-store` instead of this hook
 */
export function useGetChainApis(
  _activeChain: SupportedChain,
  _selectedNetwork: 'mainnet' | 'testnet',
  chains: Record<SupportedChain, ChainInfo>,
) {
  return useCallback(
    (isTestnetRpcAvailable: boolean, forceChain?: SupportedChain, forceNetwork?: 'mainnet' | 'testnet') =>
      getChainApis(forceChain ?? _activeChain, forceNetwork ?? _selectedNetwork, chains, isTestnetRpcAvailable),
    [_activeChain, _selectedNetwork, chains],
  );
}

/**
 * Please use `ChainApisStore` from `@leapwallet/cosmos-wallet-store` instead of this hook
 */
export function useChainApis(forceChain?: SupportedChain, forceNetwork?: 'mainnet' | 'testnet') {
  const chains = useGetChains();

  const _selectedNetwork = useSelectedNetwork();
  const selectedNetwork = forceNetwork ?? _selectedNetwork;

  const _activeChain = useActiveChain();
  const activeChain = forceChain ?? _activeChain;
  const isAptos = isAptosChain(activeChain);
  const isTestnetRpcAvailable = useApiAvailability(
    selectedNetwork === 'testnet' && !isAptos ? chains[activeChain]?.apis?.rpcTest ?? '' : '',
  );

  const getChainApis = useGetChainApis(activeChain, selectedNetwork, chains);

  return useMemo(
    () => getChainApis(isTestnetRpcAvailable),
    [activeChain, selectedNetwork, chains, isTestnetRpcAvailable],
  );
}
