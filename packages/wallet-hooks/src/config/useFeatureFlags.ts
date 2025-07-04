import { useQuery } from '@tanstack/react-query';

import { APP_NAME, getAppName, storage, useGetStorageLayer } from '../utils';
import { cachedRemoteDataWithLastModified } from '../utils/cached-remote-data';

type FeatureFlagState = 'active' | 'redirect' | 'disabled';

const LEAP_FEATURE_FLAG_URL = 'https://assets.leapwallet.io/cosmos-registry/v1/config/feature-flags-v1.json';
const COMPASS_FEATURE_FLAG_URL = 'https://assets.leapwallet.io/cosmos-registry/v1/config/feature-flags-compass-v1.json';

export type FeatureFlags = {
  all_chains: {
    swap: FeatureFlagState;
  };
  give_all_chains_option_in_wallet: {
    mobile: FeatureFlagState;
    extension: FeatureFlagState;
    mobile_v2: string;
    extension_v2: string;
  };
  gov: {
    mobile: FeatureFlagState;
    extension: FeatureFlagState;
  };
  swaps: {
    mobile: FeatureFlagState;
    extension: FeatureFlagState;
    fees: FeatureFlagState;
    chain_abstraction: FeatureFlagState;
    evm?: {
      disabled_on_versions?: string[];
    };
    default_token_denoms?: string[];
    providers?: {
      skip?: {
        disabled_on_versions?: string[];
      };
      lifi?: {
        disabled_on_versions?: string[];
        gas_price_multiplier?: {
          extension?: Record<string, Record<string, number>>;
          mobile?: Record<string, Record<string, number>>;
        };
        gas_limit_multiplier?: {
          extension?: Record<string, Record<string, number>>;
          mobile?: Record<string, Record<string, number>>;
        };
      };
    };
  };
  nfts: {
    mobile: FeatureFlagState;
    extension: FeatureFlagState;
  };
  link_evm_address: {
    extension: 'redirect' | 'no-funds' | 'with-funds' | 'disabled';
    mobile: 'redirect' | 'no-funds' | 'with-funds' | 'disabled';
  };
  ibc: {
    mobile: FeatureFlagState;
    extension: FeatureFlagState;
  };
  airdrops: {
    mobile: FeatureFlagState;
    extension: FeatureFlagState;
  };
  restaking: {
    extension: FeatureFlagState;
  };
  lightNodeNFT: {
    extension: FeatureFlagState;
    mobile: FeatureFlagState;
    extension_v2: string;
    mobile_v2: string;
    tweetText: string;
    tweetImageUrl: string;
  };
  light_node: {
    extension: FeatureFlagState;
    default_block_time_in_seconds: number;
    tweetText: string;
    tweetImageUrl: string;
  };
};

export const FEATURE_FLAG_STORAGE_KEY = 'feature-flag-v1';

export function getFeatureFlags(storage: storage, isCompassWallet: boolean): Promise<FeatureFlags> {
  return cachedRemoteDataWithLastModified({
    remoteUrl: isCompassWallet ? COMPASS_FEATURE_FLAG_URL : LEAP_FEATURE_FLAG_URL,
    storageKey: `${isCompassWallet ? 'compass' : 'leap'}-${FEATURE_FLAG_STORAGE_KEY}`,
    storage,
  });
}

/**
 * @description Please use `FeatureFlagStore` from `@leapwallet/cosmos-wallet-store` instead of this hook
 */
export function useFeatureFlags() {
  /**
   * We are using `getAppName()` here to determine if we are in the Compass Wallet, instead of using the `useIsCompassWallet` hook.
   * This is because the `useIsCompassWallet` hook is initialized at the same time as `useFeatureFlags`,
   * which causes an initial network request to get the Leap Cosmos's feature flags.
   * However, this is not necessary for the Compass Wallet.
   * On the other hand, `getAppName()` is initialized before `useFeatureFlags` is called for the first time,
   * ensuring that the correct feature-flag files are fetched.
   */
  const isCompassWallet = getAppName() === APP_NAME.Compass;
  const storage = useGetStorageLayer();

  return useQuery<FeatureFlags>(
    [`query-${isCompassWallet ? 'compass' : 'leap'}-feature-flag-v1`],
    () => getFeatureFlags(storage, isCompassWallet),
    {
      retry: 2,
      cacheTime: 1000 * 10, // 10 seconds
      staleTime: 0,
    },
  );
}
