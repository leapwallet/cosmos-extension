import {
  defaultGasEstimates,
  DefaultGasEstimatesRecord,
  initResourceFromS3,
  StorageLayer,
} from '@leapwallet/cosmos-wallet-sdk';
import { makeAutoObservable, runInAction } from 'mobx';

// replaces useDefaultGasEstimatesStore
export class DefaultGasEstimatesStore {
  estimate: DefaultGasEstimatesRecord | null = null;
  private storage: StorageLayer;

  private DEFAULT_GAS_ESTIMATES = 'default-gas-estimates';
  private DEFAULT_GAS_ESTIMATES_LAST_UPDATED_AT = 'default-gas-estimates-last-updated-at';

  private DEFAULT_GAS_ESTIMATES_URL = 'https://assets.leapwallet.io/cosmos-registry/v1/gas/gas-estimates.json';
  private DEFAULT_GAS_ESTIMATES_LAST_UPDATED_AT_URL =
    'https://assets.leapwallet.io/cosmos-registry/v1/gas/gas-estimates-last-updated-at.json';

  constructor(storage: StorageLayer, initialDefaultGasEstimates: DefaultGasEstimatesRecord | null) {
    this.storage = storage;
    this.estimate = initialDefaultGasEstimates;

    this.init();

    makeAutoObservable(this);
  }

  private init() {
    initResourceFromS3({
      storage: this.storage,
      setResource: (data) => this.setDefaultGasEstimates(data),
      resourceKey: this.DEFAULT_GAS_ESTIMATES,
      resourceURL: this.DEFAULT_GAS_ESTIMATES_URL,
      lastUpdatedAtKey: this.DEFAULT_GAS_ESTIMATES_LAST_UPDATED_AT,
      lastUpdatedAtURL: this.DEFAULT_GAS_ESTIMATES_LAST_UPDATED_AT_URL,
      defaultResourceData: defaultGasEstimates,
    });
  }

  setDefaultGasEstimates(estimate: DefaultGasEstimatesRecord | null) {
    if (!estimate) {
      this.estimate = null;
      return;
    }

    runInAction(() => {
      this.estimate = {
        ...estimate,
        movement: { DEFAULT_GAS_TRANSFER: 100, DEFAULT_GAS_STAKE: 100, DEFAULT_GAS_IBC: 100 },
        aptos: { DEFAULT_GAS_TRANSFER: 100, DEFAULT_GAS_STAKE: 100, DEFAULT_GAS_IBC: 100 },
      };
    });
  }
}
