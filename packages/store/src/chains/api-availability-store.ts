import { makeObservable } from 'mobx';

import { BaseQueryStore } from '../base/base-data-store';

type ApiAvailabilityQueryStoreData = boolean;

export class ApiAvailabilityQueryStore extends BaseQueryStore<ApiAvailabilityQueryStoreData> {
  data: ApiAvailabilityQueryStoreData | null = null;
  url: string;

  constructor(url: string) {
    super();
    makeObservable(this);
    this.url = url;
  }

  async fetchData() {
    try {
      const res = await fetch(`${this.url}/status`);
      return res.status === 200;
    } catch {
      return false;
    }
  }
}

// replaces useGetChainApis from useRpcUrl
export class ApiAvailabilityStore {
  store: Record<string, ApiAvailabilityQueryStore> = {};

  async getStatus(url: string) {
    if (!this.store[url] || this.store[url].data === null) {
      this.store[url] = new ApiAvailabilityQueryStore(url);
      return this.store[url].getData();
    }

    return this.store[url].data;
  }
}
