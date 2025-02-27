import { makeAutoObservable, runInAction } from 'mobx';

const ANKR_CHAIN_MAP_S3_URL = 'https://assets.leapwallet.io/cosmos-registry/v1/config/ankr-chain-map.json';
const ANKR_CONTRACTS_TO_BLOCK_S3_URL =
  'https://assets.leapwallet.io/cosmos-registry/v1/config/ankr-contract-to-block.json';

export class AnkrChainMapStore {
  ankrChainMap: Record<string, string> = {};
  ankrContractsToBlock: Array<string> = [];
  readyPromise: Promise<Array<PromiseSettledResult<void>>>;

  constructor() {
    makeAutoObservable(this);
    this.readyPromise = Promise.allSettled([this.loadAnkrChainMap(), this.loadAnkrContractsToBlock()]);
  }

  async loadAnkrChainMap() {
    const response = await fetch(ANKR_CHAIN_MAP_S3_URL);
    const data = await response.json();

    runInAction(() => {
      this.ankrChainMap = data;
    });
  }

  async loadAnkrContractsToBlock() {
    let data: Record<string, Array<string>> = {};
    try {
      const response = await fetch(ANKR_CONTRACTS_TO_BLOCK_S3_URL);
      data = await response.json();
    } catch (error) {
      console.error('Error loading ankr contracts to block', error);
    }

    runInAction(() => {
      this.ankrContractsToBlock = data?.contractsToBlock || [];
    });
  }
}
