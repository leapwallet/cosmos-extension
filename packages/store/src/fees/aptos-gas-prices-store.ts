import {
  APTOS_GAS_PRICES,
  AptosTx,
  defaultGasPriceStep,
  EvmFeeType,
  getChainId,
  isAptosChain,
  NetworkType,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk';
import { makeObservable } from 'mobx';

import { ChainInfosStore } from '../assets';
import { BaseQueryStore } from '../base/base-data-store';
import { ChainApisStore } from '../chains';

export type AptosGasPrices = {
  gasPrice: Record<EvmFeeType, number>;
  prioritizedGasPrice?: Record<EvmFeeType, number>;
  deprioritizedGasPrice?: Record<EvmFeeType, number>;
};

type AptosGasPricesData = AptosGasPrices;

class AptosGasPricesQueryStore extends BaseQueryStore<AptosGasPricesData> {
  private activeChain: SupportedChain;
  private activeNetwork: NetworkType;
  private chainInfosStore: ChainInfosStore;
  private chainApisStore: ChainApisStore;

  data: AptosGasPricesData;

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
        low: APTOS_GAS_PRICES[chainId ?? '']?.low ?? defaultGasPriceStep.low,
        medium: APTOS_GAS_PRICES[chainId ?? '']?.medium ?? defaultGasPriceStep.average,
        high: APTOS_GAS_PRICES[chainId ?? '']?.high ?? defaultGasPriceStep.high,
      },
    };
  }

  async fetchData(): Promise<AptosGasPricesData> {
    if (!isAptosChain(this.activeChain)) {
      return this.getDefaultData();
    }

    const chainId = this.getChainId();
    const { lcdUrl } = await this.chainApisStore.getChainApis(this.activeChain, this.activeNetwork);

    const activeChainGasPrices = APTOS_GAS_PRICES[chainId ?? ''];
    const aptos = await AptosTx.getAptosClient(lcdUrl ?? '');
    const { gasPrice, prioritizedGasPrice, deprioritizedGasPrice } = await aptos.getGasPrice();

    const low = Number(gasPrice?.low);
    const medium = Number(gasPrice?.medium);
    const high = Number(gasPrice?.high);

    return {
      deprioritizedGasPrice,
      prioritizedGasPrice,
      gasPrice: {
        low: low || activeChainGasPrices?.low,
        medium: medium || activeChainGasPrices?.medium,
        high: high || activeChainGasPrices?.high,
      },
    };
  }
}

// replaces useGetAptosGasPrices
export class AptosGasPricesStore {
  private chainInfosStore: ChainInfosStore;
  private chainApisStore: ChainApisStore;
  private store = {} as Record<`${SupportedChain}-${NetworkType}`, AptosGasPricesQueryStore>;

  constructor(chainInfosStore: ChainInfosStore, chainApisStore: ChainApisStore) {
    this.chainInfosStore = chainInfosStore;
    this.chainApisStore = chainApisStore;
  }

  getStore(chain: SupportedChain, network: NetworkType) {
    const key = `${chain}-${network}` as const;
    if (!this.store[key]) {
      this.store[key] = new AptosGasPricesQueryStore(chain, network, this.chainInfosStore, this.chainApisStore);
    }

    return this.store[key];
  }
}
