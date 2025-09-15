import {
  DenomsRecord,
  FeeDenoms,
  feeDenoms as fallbackFeeDenoms,
  initResourceFromS3,
  nativeFeeDenoms,
  NetworkType,
  StorageLayer,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk';
import { makeAutoObservable, runInAction } from 'mobx';

import { ChainInfosStore } from '../assets';

// replaces useFeeDenomsStore, useNativeFeeDenom, useAdditionalFeeDenoms and useInitFeeDenoms
export class FeeDenomsStore {
  feeDenoms: FeeDenoms | null = null;
  private chainInfosStore: ChainInfosStore;
  private storage: StorageLayer;

  private FEE_DENOMS = 'fee-denoms';
  private FEE_DENOMS_LAST_UPDATED_AT = 'fee-denoms-last-updated-at';

  private FEE_DENOMS_URL = 'https://assets.leapwallet.io/cosmos-registry/v1/native-fee-denoms/fee-denoms.json';
  private FEE_DENOMS_LAST_UPDATED_AT_URL =
    'https://assets.leapwallet.io/cosmos-registry/v1/native-fee-denoms/fee-denoms-last-updated-at.json';

  constructor(chainInfosStore: ChainInfosStore, storage: StorageLayer) {
    this.chainInfosStore = chainInfosStore;
    this.storage = storage;

    this.init();

    makeAutoObservable(this);
  }

  private init() {
    return initResourceFromS3({
      storage: this.storage,
      setResource: (data) => this.setFeeDenoms(data),
      resourceKey: this.FEE_DENOMS,
      resourceURL: this.FEE_DENOMS_URL,
      lastUpdatedAtKey: this.FEE_DENOMS_LAST_UPDATED_AT,
      lastUpdatedAtURL: this.FEE_DENOMS_LAST_UPDATED_AT_URL,
      defaultResourceData: nativeFeeDenoms,
    });
  }

  getNativeFeeDenom(denoms: DenomsRecord, activeChain: SupportedChain, selectedNetwork: NetworkType) {
    const feeDenom = this.feeDenoms?.[selectedNetwork][activeChain];
    if (feeDenom && denoms[feeDenom]) {
      // TODO: Remove this check and merge https://github.com/leapwallet/cosmos-chain-registry/pull/1283 after few months
      if (activeChain === 'babylon' && feeDenom === 'ubbn') {
        return denoms.tubbn;
      }

      return denoms[feeDenom];
    }

    if (
      this.chainInfosStore.chainInfos?.[activeChain]?.beta &&
      this.chainInfosStore.chainInfos?.[activeChain]?.nativeDenoms
    ) {
      const nativeDenom = Object.values(this.chainInfosStore.chainInfos?.[activeChain]?.nativeDenoms ?? {})[0];
      return denoms[nativeDenom.coinMinimalDenom] ?? nativeDenom;
    }

    const fallbackFeeDenom = fallbackFeeDenoms?.[selectedNetwork]?.[activeChain];
    if (fallbackFeeDenom?.coinMinimalDenom) {
      let denomKey = fallbackFeeDenom.coinMinimalDenom;
      if (activeChain === 'babylon' && denomKey === 'ubbn') {
        denomKey = 'tubbn';
      }

      return denoms[denomKey] ?? fallbackFeeDenom;
    }

    return fallbackFeeDenom;
  }

  getAdditionalFeeDenoms(activeChain: SupportedChain) {
    return Object.values(this.chainInfosStore.chainInfos[activeChain]?.feeCurrencies ?? {});
  }

  setFeeDenoms(feeDenoms: FeeDenoms) {
    if (!feeDenoms) {
      runInAction(() => {
        this.feeDenoms = feeDenoms;
      });
      return;
    }

    runInAction(() => {
      this.feeDenoms = {
        mainnet: {
          ...feeDenoms.mainnet,
          forma: 'forma-native',
        },
        testnet: {
          ...feeDenoms.testnet,
          forma: 'forma-native',
        },
      };
    });
  }
}
