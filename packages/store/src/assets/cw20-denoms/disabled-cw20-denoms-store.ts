import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { makeObservable, observable, runInAction } from 'mobx';
import { computedFn } from 'mobx-utils';

import { AggregatedSupportedChainType, DisableObject, StorageAdapter } from '../../types';
import { ActiveChainStore, AddressStore } from '../../wallet';
import { DISABLED_CW20_TOKENS } from '../keys';

export class DisabledCW20DenomsStore {
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
    await this.loadDisabledCW20Denoms();
  }

  async loadDisabledCW20Denoms() {
    const allDisabledCW20DenomsJson = await this.storageAdapter.get(DISABLED_CW20_TOKENS);
    if (allDisabledCW20DenomsJson) {
      runInAction(() => {
        this.denoms = JSON.parse(allDisabledCW20DenomsJson);
      });
    }
  }

  get disabledCW20Denoms() {
    const activeChain = this.activeChainStore.activeChain;
    const address = this.addressStore.addresses[activeChain];
    return this.denoms?.[address] ?? [];
  }

  getDisabledCW20DenomsForChain = computedFn((chain: SupportedChain) => {
    const address = this.addressStore.addresses[chain];
    return this.denoms?.[address] ?? [];
  });

  async setDisabledCW20Denoms(value: string[], forceChain?: AggregatedSupportedChainType) {
    const activeChain = forceChain || this.activeChainStore.activeChain;
    const address = this.addressStore.addresses[activeChain];
    runInAction(() => {
      this.denoms = { ...this.denoms, [address]: value };
    });
    await this.storageAdapter.set(DISABLED_CW20_TOKENS, JSON.stringify(this.denoms));
  }
}
