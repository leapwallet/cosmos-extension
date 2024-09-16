import { makeAutoObservable, runInAction } from 'mobx';

import { getIsCompass } from '../globals/config';
import { AggregatedSupportedChainType } from '../types';

export class ActiveChainStore {
  activeChain: AggregatedSupportedChainType = getIsCompass() ? 'seiTestnet2' : 'cosmos';
  storageAdapter: any;
  isCompassWallet: boolean;
  readyPromise: Promise<void>;

  constructor(storageAdapter: any, isCompassWallet: boolean) {
    makeAutoObservable(this);
    this.storageAdapter = storageAdapter;
    this.isCompassWallet = isCompassWallet;
    this.readyPromise = this.loadActiveChain();
  }

  async loadActiveChain() {
    const activeChain = await this.storageAdapter.get('active-chain');
    runInAction(() => {
      this.activeChain = activeChain || (getIsCompass() ? 'seiTestnet2' : 'cosmos');
    });
  }

  setActiveChain(chain: AggregatedSupportedChainType) {
    runInAction(() => {
      this.activeChain = chain;
    });
  }

  isSeiEvm(forceChain?: string) {
    const activeChain = forceChain ?? this.activeChain;
    return getIsCompass() && (activeChain === 'seiDevnet' || activeChain === 'seiTestnet2');
  }
}
