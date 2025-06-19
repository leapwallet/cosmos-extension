import { makeAutoObservable, runInAction } from 'mobx';

const MISCELLANEOUS_DATA_S3_URL = 'https://assets.leapwallet.io/cosmos-registry/v1/config/miscellaneous.json';

export class MiscellaneousDataStore {
  data: Record<string, any> = {};
  readyPromise: Promise<void>;

  constructor() {
    makeAutoObservable(this);
    this.readyPromise = this.loadMiscellaneousData();
  }

  async loadMiscellaneousData() {
    const response = await fetch(MISCELLANEOUS_DATA_S3_URL);
    const data = await response.json();

    runInAction(() => {
      this.data = data;
    });
  }
}
