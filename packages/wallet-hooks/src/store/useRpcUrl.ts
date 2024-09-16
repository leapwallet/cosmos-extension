import { getTopNode, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
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
  _activeChain: SupportedChain,
  _selectedNetwork: 'mainnet' | 'testnet',
  chains: ReturnType<typeof useGetChains>,
) {
  return useCallback(
    (isTestnetRpcAvailable: boolean, forceChain?: SupportedChain, forceNetwork?: 'mainnet' | 'testnet') => {
      const activeChain = forceChain || _activeChain;
      if (!activeChain || !chains[activeChain]) return { rpcUrl: '', lcdUrl: '' };

      const selectedNetwork = forceNetwork || _selectedNetwork;
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

      const fallbackRpcURL =
        selectedNetwork === 'testnet' && chains[activeChain].apis.rpcTest
          ? removeTrailingSlash(testnetRpcUrl)
          : removeTrailingSlash(mainnetRpcUrl);
      const fallbackRestURL =
        selectedNetwork === 'testnet' && chains[activeChain].apis.restTest
          ? removeTrailingSlash(testnetLcdUrl)
          : removeTrailingSlash(mainnetLcdUrl);

      const activeChainId =
        (selectedNetwork === 'testnet' ? chains[activeChain].testnetChainId : chains[activeChain].chainId) ?? '';
      const restNode = getTopNode('rest', activeChainId);
      const { nodeUrl: rest } = restNode ?? {};

      const rpcNode = getTopNode('rpc', activeChainId);
      const { nodeUrl: rpc } = rpcNode ?? {};

      const evmJsonRpc =
        selectedNetwork === 'testnet'
          ? chains[activeChain].apis.evmJsonRpcTest ?? chains[activeChain].apis.evmJsonRpc
          : chains[activeChain].apis.evmJsonRpc;

      return {
        rpcUrl: rpc && rpc.length ? rpc : fallbackRpcURL,
        lcdUrl: rest && rest.length ? rest : fallbackRestURL,
        grpcUrl:
          selectedNetwork === 'testnet' && chains[activeChain].apis.grpcTest
            ? removeTrailingSlash(chains[activeChain].apis.grpcTest)
            : removeTrailingSlash(chains[activeChain].apis.grpc),
        txUrl: chains[activeChain].txExplorer?.[selectedNetwork]?.txUrl,
        evmJsonRpc,
      };
    },
    [_activeChain, _selectedNetwork, chains],
  );
}

export function useChainApis(forceChain?: SupportedChain, forceNetwork?: 'mainnet' | 'testnet') {
  const chains = useGetChains();

  const _selectedNetwork = useSelectedNetwork();
  const selectedNetwork = forceNetwork ?? _selectedNetwork;

  const _activeChain = useActiveChain();
  const activeChain = forceChain ?? _activeChain;
  const isTestnetRpcAvailable = useApiAvailability(
    selectedNetwork === 'testnet' ? chains[activeChain]?.apis?.rpcTest ?? '' : '',
  );

  const getChainApis = useGetChainApis(activeChain, selectedNetwork, chains);

  return useMemo(
    () => getChainApis(isTestnetRpcAvailable),
    [activeChain, selectedNetwork, chains, isTestnetRpcAvailable],
  );
}
