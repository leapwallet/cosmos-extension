import { getIsCompass, StorageLayer } from '@leapwallet/cosmos-wallet-sdk';
import { makeObservable } from 'mobx';

import { BaseQueryStore } from '../base/base-data-store';
import { cachedRemoteDataWithLastModified } from '../utils/cached-remote-data';

type FeatureFlagsStoreData = FeatureFlags;

// replaces useGetFeatureFlags
export class FeatureFlagStore extends BaseQueryStore<FeatureFlagsStoreData> {
  data: FeatureFlags | null = null;

  private storage: StorageLayer;
  private FEATURE_FLAG_STORAGE_KEY = 'feature-flag-v1';
  private LEAP_FEATURE_FLAG_URL = 'https://assets.leapwallet.io/cosmos-registry/v1/config/feature-flags-v1.json';
  private COMPASS_FEATURE_FLAG_URL =
    'https://assets.leapwallet.io/cosmos-registry/v1/config/feature-flags-compass-v1.json';

  constructor(storage: StorageLayer) {
    super();
    this.storage = storage;

    this.getData();

    makeObservable(this);
  }

  async fetchData(): Promise<FeatureFlags> {
    const isCompassWallet = getIsCompass();

    return cachedRemoteDataWithLastModified({
      remoteUrl: isCompassWallet ? this.COMPASS_FEATURE_FLAG_URL : this.LEAP_FEATURE_FLAG_URL,
      storageKey: `${isCompassWallet ? 'compass' : 'leap'}-${this.FEATURE_FLAG_STORAGE_KEY}`,
      storage: this.storage,
    });
  }
}

type FeatureFlagState = 'active' | 'redirect' | 'disabled';

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
  light_node: {
    extension: FeatureFlagState;
    default_block_time_in_seconds: number;
    tweetText: string;
    tweetImageUrl: string;
  };
};
