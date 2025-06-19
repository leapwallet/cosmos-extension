import { makeAutoObservable, runInAction } from 'mobx';

import { NftChain } from '../types';

const NFT_CHAINS_URL = 'https://assets.leapwallet.io/cosmos-registry/v1/nft-chains/chains.json';

export class NftChainsStore {
  nftChains: NftChain[] = [];
  readyPromise: Promise<void>;

  constructor() {
    makeAutoObservable(this);
    this.readyPromise = this.loadNftChains();
  }

  // Add caching for nft chains
  async loadNftChains() {
    const response = await fetch(NFT_CHAINS_URL);
    const data = await response.json();
    data.push({
      forceChain: 'sui',
      forceContractsListChain: 'sui',
      forceNetwork: 'mainnet',
    });
    data.push({
      forceChain: 'sui',
      forceContractsListChain: 'sui',
      forceNetwork: 'testnet',
    });
    runInAction(() => {
      this.nftChains = data;
    });
  }
}
