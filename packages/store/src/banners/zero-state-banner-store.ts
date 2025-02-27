import { makeAutoObservable } from 'mobx';
import semver from 'semver';

import { StorageAdapter } from '../types';
import { cachedRemoteDataWithLastModified } from '../utils/cached-remote-data';

export type ZeroStateBanner = {
  bgUrl: string;
  redirectUrl: string;
  chainIds: string[];
  enabledVersions: {
    extension: string[];
    mobile: string[];
  };
};

export class ZeroStateBannerStore {
  storageAdapter: StorageAdapter;
  banners: ZeroStateBanner[] = [];
  app: 'extension' | 'mobile' = 'extension';
  version: string = '0.0.0';

  constructor(app: 'extension' | 'mobile', version: string, storageAdapter: StorageAdapter) {
    this.app = app;
    this.version = version;
    this.storageAdapter = storageAdapter;
    makeAutoObservable(this);
    this.fetchBanners();
  }

  private async fetchBanners() {
    const data = await cachedRemoteDataWithLastModified<ZeroStateBanner[]>({
      remoteUrl: 'https://assets.leapwallet.io/cosmos-registry/v1/banners/zero-state-banners.json',
      storage: this.storageAdapter,
      storageKey: 'zero-state-banners',
    });
    const filteredBanners =
      data?.filter((banner) => {
        return banner.enabledVersions[this.app].some((version) => semver.satisfies(this.version, version));
      }) ?? [];

    this.banners = filteredBanners;
  }

  getBannerForChain(chain?: string) {
    if (!chain) {
      return;
    }
    return this.banners.find((banner) => banner.chainIds.includes(chain));
  }
}
