import { ChainInfosConfigPossibleFeatureType, ChainInfosConfigType } from '../types';

export function isFeatureExistForChain(
  checkForExistenceType: 'comingSoon' | 'notSupported',
  feature: ChainInfosConfigPossibleFeatureType,
  platform: 'Extension' | 'Mobile' | 'Dashboard',
  activeChainId: string | undefined,
  chainInfosConfig: ChainInfosConfigType,
) {
  if (!activeChainId) return false;
  switch (checkForExistenceType) {
    case 'comingSoon': {
      if (chainInfosConfig.coming_soon_features?.[feature]) {
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
      if (chainInfosConfig.not_supported_features?.[feature]) {
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
}
