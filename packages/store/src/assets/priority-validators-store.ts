import { makeObservable, observable, runInAction } from 'mobx';

import { PriorityValidatorsType } from '../types';

const PRIORITY_VALIDATORS_S3_URL = 'https://assets.leapwallet.io/cosmos-registry/v1/nudges/leap-validator-chains.json';

export class PriorityValidatorsStore {
  priorityValidators: PriorityValidatorsType = {};
  readyPromise: Promise<void>;

  constructor() {
    makeObservable({
      priorityValidators: observable.shallow,
    });
    this.readyPromise = this.loadPriorityValidators();
  }

  // Add caching for priority validators
  async loadPriorityValidators() {
    const response = await fetch(PRIORITY_VALIDATORS_S3_URL);
    const data = await response.json();

    runInAction(() => {
      this.priorityValidators = data;
    });
  }
}
