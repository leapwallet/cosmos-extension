import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { useCallback, useMemo } from 'react';

import { useChainFeatureFlags, useGetChains } from '../store';
import { SelectedNetworkType } from '../utils';
import { useChainInfo } from './use-chain-info';

export function useIsMinitia(chain: SupportedChain, selectedNetwork: SelectedNetworkType) {
  const chainFeatureFlags = useChainFeatureFlags();
  const chainInfo = useChainInfo(chain);

  const minitiaChains = useMemo(
    () => Object.keys(chainFeatureFlags).filter((key) => chainFeatureFlags[key].chainType === 'minitia'),
    [chainFeatureFlags],
  );

  const isMinitiaEvmChain = useMemo(() => {
    if (!chainInfo) return false;
    if (minitiaChains.includes(chain)) {
      return true;
    }
    if (selectedNetwork === 'mainnet') {
      return minitiaChains.includes(chainInfo.chainId);
    }
    return !!chainInfo.testnetChainId && minitiaChains.includes(chainInfo.testnetChainId);
  }, [chain, minitiaChains, selectedNetwork, chainInfo?.evmChainId]);

  return isMinitiaEvmChain;
}

export function useGetIsMinitiaEvmChain() {
  const chainFeatureFlags = useChainFeatureFlags();
  const chains = useGetChains();

  const minitiaChains = useMemo(
    () => Object.keys(chainFeatureFlags).filter((key) => chainFeatureFlags[key].chainType === 'minitia'),
    [chainFeatureFlags],
  );

  return useCallback(
    (selectedNetwork: SelectedNetworkType, chainKey?: SupportedChain, _chainId?: string) => {
      if (!chainKey && !_chainId) {
        return false;
      }
      let chainId = _chainId;
      if (chainKey && !_chainId) {
        chainId = selectedNetwork === 'mainnet' ? chains?.[chainKey]?.chainId : chains?.[chainKey]?.testnetChainId;
      }

      if (chainKey && minitiaChains.includes(chainKey)) {
        return true;
      }

      if (chainId && minitiaChains.includes(chainId)) {
        return true;
      }

      return false;
    },
    [minitiaChains],
  );
}
