import { makeAutoObservable, reaction, runInAction } from 'mobx';

import { SelectedNetworkType } from '../types';
import { StorageAdapter } from '../types/storage-adapter.type';
import { ActiveChainStore } from './active-chain-store';

export class SelectedNetworkStore {
  selectedNetwork: SelectedNetworkType = 'mainnet';
  activeChainStore: ActiveChainStore;
  networkMap: Record<string, SelectedNetworkType> = {};
  storageAdapter: StorageAdapter;
  readyPromise: Promise<void>;

  constructor(activeChainStore: ActiveChainStore, storageAdapter: StorageAdapter) {
    makeAutoObservable(this);
    this.activeChainStore = activeChainStore;
    this.storageAdapter = storageAdapter;
    this.readyPromise = this.initializeStore();

    reaction(
      () => this.activeChainStore.activeChain,
      () => {
        this.selectedNetwork = this.networkMap[this.activeChainStore.activeChain] || 'mainnet';
      },
    );
  }

  setSelectedNetwork(network: SelectedNetworkType) {
    runInAction(() => {
      this.selectedNetwork = network;
      this.networkMap[this.activeChainStore.activeChain] = network;
    });
  }

  async initializeStore() {
    const selectedNetwork = await this.storageAdapter.get('selected-network');
    const networkMapJson = await this.storageAdapter.get('networkMap');
    runInAction(() => {
      this.networkMap = networkMapJson ? JSON.parse(networkMapJson) : {};
      this.selectedNetwork = selectedNetwork || 'mainnet';
    });
  }
}
