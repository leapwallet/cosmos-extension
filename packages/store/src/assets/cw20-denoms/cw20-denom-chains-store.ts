import { makeAutoObservable, observable, runInAction } from 'mobx';
import { StorageAdapter } from 'types';

import { cachedRemoteDataWithLastModified } from '../../utils/cached-remote-data';

const cw20DenomsChainsUrl = 'https://assets.leapwallet.io/cosmos-registry/v1/denoms/cw20-chains.json';

export class CW20DenomChainsStore {
  cw20DenomChains: Array<string> = [];
  readyPromise: Promise<void>;
  isCompassWallet: boolean;
  storageAdapter: StorageAdapter;

  constructor(isCompassWallet: boolean, storageAdapter: StorageAdapter) {
    makeAutoObservable(this, {
      cw20DenomChains: observable.shallow,
    });
    this.isCompassWallet = isCompassWallet;
    this.storageAdapter = storageAdapter;
    this.readyPromise = this.loadCW20DenomChains();
  }

  async loadCW20DenomChains() {
    try {
      const data = await cachedRemoteDataWithLastModified<{ compassChains: string[]; chains: string[] } | undefined>({
        remoteUrl: cw20DenomsChainsUrl,
        storage: this.storageAdapter,
        storageKey: 'cw20-tokens-supported-chains',
      });
      if (!data) {
        throw Error('Error fetching sei cw20 token chains');
      }
      runInAction(() => {
        this.cw20DenomChains = this.isCompassWallet ? data.compassChains : data.chains;
      });
    } catch (error) {
      console.log(error);
    }
  }
}
