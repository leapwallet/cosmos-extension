import { StorageLayer } from '@leapwallet/cosmos-wallet-sdk';
import { makeObservable } from 'mobx';

import { BaseQueryStore } from '../base/base-data-store';
import { cachedRemoteDataWithLastModified } from '../utils/cached-remote-data';

export type TransactionConfigs = {
  allChains: {
    maxFeeValueUSD: number;
  };
};

type TransactionConfigsStoreData = TransactionConfigs;

// replaces useTransactionConfigs from transactionConfigs
export class TransactionConfigsStore extends BaseQueryStore<TransactionConfigsStoreData> {
  data: TransactionConfigsStoreData | null = null;
  private storage: StorageLayer;

  constructor(storage: StorageLayer) {
    super();

    this.storage = storage;

    this.getData();

    makeObservable(this);
  }

  async fetchData() {
    return cachedRemoteDataWithLastModified<TransactionConfigs>({
      remoteUrl: 'https://assets.leapwallet.io/cosmos-registry/v1/config/transaction-configs.json',
      storageKey: 'transaction-configs',
      storage: this.storage,
    });
  }
}
