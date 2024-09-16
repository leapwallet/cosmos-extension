import { ChainInfo, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { makeAutoObservable, runInAction } from 'mobx';

export class ChainInfosStore {
  chainInfos: Record<SupportedChain, ChainInfo>;

  constructor(nativeChainInfo: Record<SupportedChain, ChainInfo>) {
    makeAutoObservable(this);
    this.chainInfos = nativeChainInfo;
  }

  setChainInfos(chainInfos: Record<SupportedChain, ChainInfo>) {
    runInAction(() => {
      this.chainInfos = chainInfos;
    });
  }

  loadChainInfos(chainInfo: any) {
    this.chainInfos = chainInfo;
  }
}
