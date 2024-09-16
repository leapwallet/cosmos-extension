import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { makeObservable, observable, runInAction } from 'mobx';
import { computedFn } from 'mobx-utils';

import { AggregatedSupportedChainType, DisableObject, StorageAdapter } from '../../types';
import { ActiveChainStore, AddressStore } from '../../wallet';
import { ENABLED_CW20_TOKENS } from '../keys';

export class EnabledCW20DenomsStore {
  denoms: DisableObject = {};
  readyPromise: Promise<void>;
  storageAdapter: StorageAdapter;
  activeChainStore: ActiveChainStore;
  addressStore: AddressStore;

  constructor(activeChainStore: ActiveChainStore, addressStore: AddressStore, storageAdapter: StorageAdapter) {
    makeObservable(this, {
      denoms: observable.shallow,
    });
    this.activeChainStore = activeChainStore;
    this.addressStore = addressStore;
    this.storageAdapter = storageAdapter;
    this.readyPromise = this.initialize();
  }

  async initialize() {
    await Promise.all([this.activeChainStore.readyPromise, this.addressStore.readyPromise]);
    await this.loadEnabledCW20Denoms();
  }

  async loadEnabledCW20Denoms() {
    const allEnabledCW20DenomsJson = await this.storageAdapter.get(ENABLED_CW20_TOKENS);
    if (allEnabledCW20DenomsJson) {
      runInAction(() => {
        this.denoms = JSON.parse(allEnabledCW20DenomsJson);
      });
    }
  }

  get enabledCW20Denoms() {
    const activeChain = this.activeChainStore.activeChain;
    const address = this.addressStore.addresses[activeChain];
    return this.denoms?.[address] ?? [];
  }

  getEnabledCW20DenomsForChain = computedFn((chain: SupportedChain) => {
    const address = this.addressStore.addresses[chain];
    return this.denoms?.[address] ?? [];
  });

  async setEnabledCW20Denoms(value: string[], forceChain?: AggregatedSupportedChainType) {
    const activeChain = forceChain || this.activeChainStore.activeChain;
    const address = this.addressStore.addresses[activeChain];
    runInAction(() => {
      this.denoms = { ...this.denoms, [address]: value };
    });
    await this.storageAdapter.set(ENABLED_CW20_TOKENS, JSON.stringify(this.denoms));
  }
}
