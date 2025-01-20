import { makeAutoObservable, runInAction } from 'mobx';

const ANKR_CHAIN_MAP_S3_URL = 'https://assets.leapwallet.io/cosmos-registry/v1/config/ankr-chain-map.json';

export class AnkrChainMapStore {
  ankrChainMap: Record<string, string> = {};
  readyPromise: Promise<void>;

  constructor() {
    makeAutoObservable(this);
    this.readyPromise = this.loadAnkrChainMap();
  }

  async loadAnkrChainMap() {
    const response = await fetch(ANKR_CHAIN_MAP_S3_URL);
    const data = await response.json();

    runInAction(() => {
      this.ankrChainMap = data;
    });
  }
}
