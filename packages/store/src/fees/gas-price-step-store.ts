import {
  GAS_PRICE_STEPS as defaultGasPriceSteps,
  GasPriceStepsRecord,
  initResourceFromS3,
  StorageLayer,
} from '@leapwallet/cosmos-wallet-sdk';
import { makeAutoObservable, runInAction } from 'mobx';

// replaces useGasPriceSteps, useInitGasPriceSteps
export class GasPriceStepStore {
  private storage: StorageLayer;
  private GAS_PRICE_STEPS = 'gas-price-steps';
  private GAS_PRICE_STEPS_LAST_UPDATED_AT = 'gas-price-steps-last-updated-at';
  private GAS_PRICE_STEPS_URL = 'https://assets.leapwallet.io/cosmos-registry/v1/gas/gas-prices.json';
  private GAS_PRICE_STEPS_LAST_UPDATED_AT_URL =
    'https://assets.leapwallet.io/cosmos-registry/v1/gas/gas-prices-last-updated-at.json';

  gasPriceSteps: GasPriceStepsRecord = defaultGasPriceSteps as unknown as GasPriceStepsRecord;

  constructor(storage: StorageLayer) {
    this.storage = storage;

    makeAutoObservable(this);

    this.init();
  }

  private async init() {
    initResourceFromS3({
      storage: this.storage,
      setResource: (gasPriceSteps) => this.setGasPriceSteps(gasPriceSteps),
      resourceKey: this.GAS_PRICE_STEPS,
      resourceURL: this.GAS_PRICE_STEPS_URL,
      lastUpdatedAtKey: this.GAS_PRICE_STEPS_LAST_UPDATED_AT,
      lastUpdatedAtURL: this.GAS_PRICE_STEPS_LAST_UPDATED_AT_URL,
      defaultResourceData: defaultGasPriceSteps,
    });
  }

  private setGasPriceSteps(gasPriceSteps: GasPriceStepsRecord) {
    runInAction(() => {
      this.gasPriceSteps = gasPriceSteps;
    });
  }
}
