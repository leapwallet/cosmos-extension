import { makeAutoObservable, runInAction } from 'mobx';

import { StorageAdapter } from '../types/storage-adapter.type';

export class AddressStore {
  addresses: Record<string, string> = {};
  storageLayer: StorageAdapter;
  readyPromise: Promise<void>;
  pubKeys: Record<string, string> = {};

  constructor(storageLayer: any) {
    makeAutoObservable(this);
    this.storageLayer = storageLayer;
    this.readyPromise = this.loadAddresses();
  }

  async loadAddresses() {
    let activeWallet = await this.storageLayer.get<any>('active-wallet');
    if (typeof activeWallet === 'string') {
      activeWallet = JSON.parse(activeWallet);
    }
    if (activeWallet) {
      runInAction(() => {
        this.addresses = activeWallet.addresses;
        this.pubKeys = activeWallet.pubKeys;
      });
    }
  }
}
