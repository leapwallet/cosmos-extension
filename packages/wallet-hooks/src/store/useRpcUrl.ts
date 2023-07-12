import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useGetChains, useSelectedNetwork } from '../store';
import { removeTrailingSlash } from '../utils';
import { useActiveChain } from './useActiveChain';

export function useApiAvailability(url: string) {
  const [isUrlAvailable, setIsUrlAvailable] = useState(true);
  useEffect(() => {
    if (!url) return;
    fetch(`${url}/status`)
      .then((res) => {
        if (res.status === 200) {
          setIsUrlAvailable(true);
        } else {
          setIsUrlAvailable(false);
        }
      })
      .catch(() => {
        setIsUrlAvailable(false);
      });
  }, [url]);

  return isUrlAvailable;
}

export function useGetChainApis(
  activeChain: SupportedChain,
  selectedNetwork: 'mainnet' | 'testnet',
  chains: ReturnType<typeof useGetChains>,
) {
  return useCallback(
    (isTestnetRpcAvailable: boolean) => {
      if (!activeChain || !chains[activeChain]) return { rpcUrl: '', lcdUrl: '' };

      const mainnetLcdUrl = chains[activeChain].apis.rest;
      const mainnetRpcUrl = chains[activeChain].apis.rpc;

      const testnetLcdUrl =
        !isTestnetRpcAvailable && chains[activeChain].apis.alternateRestTest
          ? chains[activeChain].apis.alternateRestTest
          : chains[activeChain].apis.restTest;
      const testnetRpcUrl =
        !isTestnetRpcAvailable && chains[activeChain].apis.alternateRpcTest
          ? chains[activeChain].apis.alternateRpcTest
          : chains[activeChain].apis.rpcTest;

      return {
        rpcUrl:
          selectedNetwork === 'testnet' && chains[activeChain].apis.rpcTest
            ? removeTrailingSlash(testnetRpcUrl)
            : removeTrailingSlash(mainnetRpcUrl),
        lcdUrl:
          selectedNetwork === 'testnet' && chains[activeChain].apis.restTest
            ? removeTrailingSlash(testnetLcdUrl)
            : removeTrailingSlash(mainnetLcdUrl),
        grpcUrl:
          selectedNetwork === 'testnet' && chains[activeChain].apis.grpcTest
            ? removeTrailingSlash(chains[activeChain].apis.grpcTest)
            : removeTrailingSlash(chains[activeChain].apis.grpc),
        txUrl: chains[activeChain].txExplorer?.[selectedNetwork]?.txUrl,
        evmJsonRpc: chains[activeChain].apis.evmJsonRpc,
      };
    },
    [activeChain, selectedNetwork, chains],
  );
}

export function useChainApis(forceChain?: SupportedChain, forceNetwork?: 'mainnet' | 'testnet') {
  const chains = useGetChains();

  const _selectedNetwork = useSelectedNetwork();
  const selectedNetwork = forceNetwork ?? _selectedNetwork;

  const _activeChain = useActiveChain();
  const activeChain = forceChain ?? _activeChain;
  const isTestnetRpcAvailable = useApiAvailability(
    selectedNetwork === 'testnet' ? chains[activeChain].apis.rpcTest ?? '' : '',
  );

  const getChainApis = useGetChainApis(activeChain, selectedNetwork, chains);

  return useMemo(
    () => getChainApis(isTestnetRpcAvailable),
    [activeChain, selectedNetwork, chains, isTestnetRpcAvailable],
  );
}
