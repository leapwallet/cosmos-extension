import { makeAutoObservable, runInAction } from 'mobx';
import { AggregatedSupportedChainType, DisableObject, StorageAdapter } from 'types';
import { ActiveChainStore, AddressStore } from 'wallet';

import { INTERACTED_TOKENS } from './keys';

export class InteractedDenomsStore {
  denoms: DisableObject = {};
  readyPromise: Promise<void>;
  storageAdapter: StorageAdapter;
  activeChainStore: ActiveChainStore;
  addressStore: AddressStore;

  constructor(activeChainStore: ActiveChainStore, addressStore: AddressStore, storageAdapter: StorageAdapter) {
    makeAutoObservable(this);
    this.activeChainStore = activeChainStore;
    this.addressStore = addressStore;
    this.storageAdapter = storageAdapter;
    this.readyPromise = this.initialize();
  }

  async initialize() {
    await Promise.all([this.activeChainStore.readyPromise, this.addressStore.readyPromise]);
    await this.loadInteractedDenoms();
  }

  async loadInteractedDenoms() {
    const allInteractedDenomsJson = await this.storageAdapter.get(INTERACTED_TOKENS);
    if (allInteractedDenomsJson) {
      runInAction(() => {
        this.denoms = JSON.parse(allInteractedDenomsJson);
      });
    }
  }

  get interactedDenoms() {
    const activeChain = this.activeChainStore.activeChain;
    const address = this.addressStore.addresses[activeChain];
    return this.denoms?.[address] ?? [];
  }

  async setInteractedDenoms(value: string[], forceChain?: AggregatedSupportedChainType) {
    const activeChain = forceChain || this.activeChainStore.activeChain;
    const address = this.addressStore.addresses[activeChain];
    runInAction(() => {
      this.denoms = { ...this.denoms, [address]: value };
    });
    await this.storageAdapter.set(INTERACTED_TOKENS, JSON.stringify(this.denoms));
  }
}
