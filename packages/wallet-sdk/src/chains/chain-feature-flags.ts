import semver from 'semver';

import { ChainInfo, SupportedChain } from '../constants';

export type ChainFeatureFlags = {
  aggregated_chains?: { extVersion: string; appVersion: string };
  updates?: Partial<{ enabled: boolean; name: string }>;
  minimum_version?: {
    extVersion: string;
    appVersion: string;
  };
  chainType?: 'minitia';
  balanceQueryPaginationParam?: number;
};

export type ZeroStateTokenPlaceholder = {
  coinMinimalDenom: string;
  amount: string;
  tokenBalanceOnChain: string;
  isEvm?: boolean;
  isSolana?: boolean;
  isAptos?: boolean;
  aptosTokenType?: 'v1' | 'v2';
  enabledOn: {
    extVersion?: string;
    appVersion?: string;
  };
};

export type ZeroStateTokenPlaceholders = {
  aggregated_chains?: Array<ZeroStateTokenPlaceholder>;
};

export type ChainWiseFeatureFlags = Record<string, ChainFeatureFlags>;

export type PopularChains = Array<{ chain: string; extVersion?: string; appVersion?: string }>;

export function modifyChains(
  originalChainInfos: Record<SupportedChain, ChainInfo>,
  chainFeatureFlags: ChainWiseFeatureFlags,
  appType: 'extension' | 'mobile',
  appVersion: string,
) {
  if (!chainFeatureFlags) {
    return { anyChainModified: false, modifiedChains: {} };
  }

  let anyChainModified = false;
  const modifiedChains: Record<string, ChainInfo> = {};
  const allNativeChainKeys = Object.keys(originalChainInfos) as SupportedChain[];

  Object.keys(chainFeatureFlags).forEach((chain) => {
    if (!chainFeatureFlags[chain].updates) {
      return;
    }

    let minimumVersion: string | undefined;

    if (appType === 'extension') {
      minimumVersion = chainFeatureFlags[chain].minimum_version?.extVersion;
    } else if (chainFeatureFlags[chain].minimum_version?.appVersion) {
      minimumVersion = chainFeatureFlags[chain].minimum_version?.appVersion;
    }

    if (!minimumVersion || !semver.gte(appVersion, minimumVersion)) {
      return;
    }

    let chainKey: SupportedChain | undefined = chain as SupportedChain;

    if (!allNativeChainKeys.includes(chainKey as SupportedChain)) {
      chainKey = allNativeChainKeys?.find(
        (key) => originalChainInfos[key]?.chainId === chain || originalChainInfos[key]?.testnetChainId === chain,
      );
    }

    if (!chainKey) {
      return;
    }

    const isEnabled = !!chainFeatureFlags[chain].updates?.enabled;

    if (isEnabled && !originalChainInfos[chainKey].enabled) {
      modifiedChains[chainKey] = {
        ...originalChainInfos[chainKey],
        enabled: true,
      };
      anyChainModified = true;
    }

    const chainName = chainFeatureFlags[chain].updates?.name;

    if (chainName) {
      modifiedChains[chainKey] = {
        ...originalChainInfos[chainKey],
        chainName,
      };
      anyChainModified = true;
    }
  });

  return { anyChainModified, modifiedChains };
}
