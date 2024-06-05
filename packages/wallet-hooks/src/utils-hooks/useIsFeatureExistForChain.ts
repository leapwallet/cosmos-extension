import { ChainInfosConfigPossibleFeatureType, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { useMemo } from 'react';

import { useActiveChain, useChainInfosConfig, useGetChains, useSelectedNetwork } from '../store';

export type useIsFeatureExistForChainParams = {
  checkForExistenceType: 'comingSoon' | 'notSupported';
  feature: ChainInfosConfigPossibleFeatureType;
  platform: 'Extension' | 'Mobile' | 'Dashboard';
  forceChain?: SupportedChain;
  forceNetwork?: 'mainnet' | 'testnet';
};

export function useIsFeatureExistForChain({
  checkForExistenceType,
  feature,
  platform,
  forceChain,
  forceNetwork,
}: useIsFeatureExistForChainParams) {
  const _activeChain = useActiveChain();
  const _selectedNetwork = useSelectedNetwork();
  const chains = useGetChains();
  const activeChain = forceChain ?? _activeChain;
  const selectedNetwork = forceNetwork ?? _selectedNetwork;

  const chainInfosConfig = useChainInfosConfig();
  const activeChainId = useMemo(() => {
    if (selectedNetwork === 'testnet') {
      return chains[activeChain]?.testnetChainId ?? '';
    }

    return chains[activeChain]?.chainId ?? '';
  }, [chains, activeChain, selectedNetwork]);

  return useMemo(() => {
    switch (checkForExistenceType) {
      case 'comingSoon': {
        if (chainInfosConfig.coming_soon_features[feature]) {
          const { platforms, chains } = chainInfosConfig.coming_soon_features[feature];

          if (platforms.includes('All') || platforms.includes(platform)) {
            return chains[activeChainId];
          }
        }

        break;
      }

      case 'notSupported': {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (chainInfosConfig.not_supported_features[feature]) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          const { platforms, chains } = chainInfosConfig.not_supported_features[feature];

          if (platforms.includes('All') || platforms.includes(platform)) {
            return chains[activeChainId];
          }
        }

        break;
      }

      default:
        return false;
    }

    return false;
  }, [checkForExistenceType, feature, platform, activeChainId, chainInfosConfig]);
}
