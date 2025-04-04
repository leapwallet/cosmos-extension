// denom store for all tokens data

import { denoms as ConstantDenoms } from '@leapwallet/cosmos-wallet-sdk';
import { DenomsRecord } from '@leapwallet/cosmos-wallet-sdk';
import { computed, makeObservable } from 'mobx';

import { BetaNativeDenomsStore } from './beta-native-denoms-store';
import { ChainInfosStore } from './chain-infos-store';
import { RootCW20DenomsStore } from './cw20-denoms';
import { DenomsStore } from './denoms-store';
import { RootERC20DenomsStore } from './erc20-denoms';

export class RootDenomsStore {
  rootERC20DenomStore: RootERC20DenomsStore;
  rootCW20DenomStore: RootCW20DenomsStore;
  baseDenomsStore: DenomsStore;
  betaNativeDenomsStore: BetaNativeDenomsStore;
  chainInfosStore: ChainInfosStore;

  constructor(
    baseDenomsStore: DenomsStore,
    rootCW20DenomStore: RootCW20DenomsStore,
    rootERC20DenomStore: RootERC20DenomsStore,
    betaNativeDenomsStore: BetaNativeDenomsStore,
    chainInfosStore: ChainInfosStore,
  ) {
    this.baseDenomsStore = baseDenomsStore;
    this.rootCW20DenomStore = rootCW20DenomStore;
    this.rootERC20DenomStore = rootERC20DenomStore;
    this.betaNativeDenomsStore = betaNativeDenomsStore;
    this.chainInfosStore = chainInfosStore;

    makeObservable(this, {
      allDenoms: computed.struct,
      nativeSuggestedDenoms: computed.struct,
      readyPromise: computed,
    });
  }

  get nativeSuggestedDenoms() {
    const nativeSuggestedDenoms = {};
    Object.values(this.chainInfosStore?.chainInfos ?? {}).forEach((chainInfo) => {
      Object.assign(nativeSuggestedDenoms, chainInfo.nativeDenoms);
    });
    return nativeSuggestedDenoms;
  }

  get allDenoms(): DenomsRecord {
    return Object.assign(
      {},
      ConstantDenoms,
      this.nativeSuggestedDenoms,
      this.betaNativeDenomsStore.betaNativeDenoms,
      this.baseDenomsStore.denoms,
      this.rootCW20DenomStore.allCW20Denoms,
      this.rootERC20DenomStore.allERC20Denoms,
    );
  }

  get readyPromise() {
    return Promise.all([
      this.baseDenomsStore.readyPromise,
      this.rootCW20DenomStore.readyPromise,
      this.rootERC20DenomStore.readyPromise,
    ]);
  }
}
