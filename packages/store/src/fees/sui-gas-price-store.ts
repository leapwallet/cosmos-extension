import {
  defaultGasPriceStep,
  EvmFeeType,
  getChainId,
  isSuiChain,
  NetworkType,
  SUI_GAS_PRICES,
  SuiTx,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk';
import { makeObservable } from 'mobx';

import { ChainInfosStore } from '../assets';
import { BaseQueryStore } from '../base/base-data-store';
import { ChainApisStore } from '../chains';
export type SuiGasPrices = {
  gasPrice: Record<EvmFeeType, number>;
  prioritizedGasPrice?: Record<EvmFeeType, number>;
  deprioritizedGasPrice?: Record<EvmFeeType, number>;
};

type SuiGasPricesData = SuiGasPrices;

class SuiGasPricesQueryStore extends BaseQueryStore<SuiGasPricesData> {
  private activeChain: SupportedChain;
  private activeNetwork: NetworkType;
  private chainInfosStore: ChainInfosStore;
  private chainApisStore: ChainApisStore;

  data: SuiGasPricesData;

  constructor(
    activeChain: SupportedChain,
    activeNetwork: NetworkType,
    chainInfosStore: ChainInfosStore,
    chainApisStore: ChainApisStore,
  ) {
    super();

    this.activeChain = activeChain;
    this.activeNetwork = activeNetwork;
    this.chainInfosStore = chainInfosStore;
    this.chainApisStore = chainApisStore;
    this.data = this.getDefaultData();

    makeObservable(this);
  }

  private getChainId() {
    return getChainId(this.chainInfosStore.chainInfos[this.activeChain], this.activeNetwork);
  }

  private getDefaultData() {
    const chainId = this.getChainId();

    return {
      gasPrice: {
        low: SUI_GAS_PRICES[chainId ?? '']?.low ?? defaultGasPriceStep.low,
        medium: SUI_GAS_PRICES[chainId ?? '']?.medium ?? defaultGasPriceStep.average,
        high: SUI_GAS_PRICES[chainId ?? '']?.high ?? defaultGasPriceStep.high,
      },
    };
  }

  async fetchData(): Promise<SuiGasPricesData> {
    if (!isSuiChain(this.activeChain)) {
      return this.getDefaultData();
    }

    const chainId = this.getChainId();

    const activeChainGasPrices = SUI_GAS_PRICES[chainId ?? ''];
    const sui = await SuiTx.getSuiClient(undefined, this.activeNetwork);
    const { gasPrice } = await sui.getGasPrice();

    const low = Number(gasPrice.low);
    const medium = Number(gasPrice.medium);
    const high = Number(gasPrice.high);

    return {
      gasPrice: {
        low: low || activeChainGasPrices?.low,
        medium: medium || activeChainGasPrices?.medium,
        high: high || activeChainGasPrices?.high,
      },
    };
  }
}

export class SuiGasPricesStore {
  private chainInfosStore: ChainInfosStore;
  private chainApisStore: ChainApisStore;
  private store = {} as Record<`${SupportedChain}-${NetworkType}`, SuiGasPricesQueryStore>;

  constructor(chainInfosStore: ChainInfosStore, chainApisStore: ChainApisStore) {
    this.chainInfosStore = chainInfosStore;
    this.chainApisStore = chainApisStore;
  }

  getStore(chain: SupportedChain, network: NetworkType) {
    const key = `${chain}-${network}` as const;
    if (!this.store[key]) {
      this.store[key] = new SuiGasPricesQueryStore(chain, network, this.chainInfosStore, this.chainApisStore);
    }

    return this.store[key];
  }
}
