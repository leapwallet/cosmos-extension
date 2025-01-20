import { makeObservable, observable, runInAction } from 'mobx';
import { StorageAdapter } from 'types';

import { cachedRemoteDataWithLastModified } from '../../utils/cached-remote-data';

const erc20DenomsChainsUrl = 'https://assets.leapwallet.io/cosmos-registry/v1/denoms/erc20-chains.json';

export class ERC20DenomsChainsStore {
  chains: Array<string> = [];
  readyPromise: Promise<void>;
  isCompassWallet: boolean;
  storageAdapter: StorageAdapter;

  constructor(isCompassWallet: boolean, storageAdapter: StorageAdapter) {
    makeObservable({
      chains: observable.shallow,
    });
    this.isCompassWallet = isCompassWallet;
    this.storageAdapter = storageAdapter;
    this.readyPromise = this.loadERC20DenomsChains();
  }

  async loadERC20DenomsChains() {
    try {
      const data = await cachedRemoteDataWithLastModified<{ compassChains: string[]; chains: string[] } | undefined>({
        remoteUrl: erc20DenomsChainsUrl,
        storage: this.storageAdapter,
        storageKey: 'erc20-tokens-supported-chains',
      });
      if (!data) {
        throw Error('Error fetching sei erc20 token chains');
      }
      runInAction(() => {
        this.chains = this.isCompassWallet ? data.compassChains : data.chains;
      });
    } catch (error) {
      console.log(error);
    }
  }
}
