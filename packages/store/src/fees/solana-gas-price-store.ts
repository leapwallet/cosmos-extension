import {
  defaultGasPriceStep,
  EvmFeeType,
  getChainId,
  isSolanaChain,
  NetworkType,
  SOLANA_GAS_PRICES,
  SolanaTx,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk';
import { makeObservable } from 'mobx';

import { ChainInfosStore } from '../assets';
import { BaseQueryStore } from '../base/base-data-store';
import { ChainApisStore } from '../chains';
export type SolanaGasPrices = {
  gasPrice: Record<EvmFeeType, number>;
  prioritizedGasPrice?: Record<EvmFeeType, number>;
  deprioritizedGasPrice?: Record<EvmFeeType, number>;
};

type SolanaGasPricesData = SolanaGasPrices;

class SolanaGasPricesQueryStore extends BaseQueryStore<SolanaGasPricesData> {
  private activeChain: SupportedChain;
  private activeNetwork: NetworkType;
  private chainInfosStore: ChainInfosStore;
  private chainApisStore: ChainApisStore;

  data: SolanaGasPricesData;

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
        low: SOLANA_GAS_PRICES[chainId ?? '']?.low ?? defaultGasPriceStep.low,
        medium: SOLANA_GAS_PRICES[chainId ?? '']?.medium ?? defaultGasPriceStep.average,
        high: SOLANA_GAS_PRICES[chainId ?? '']?.high ?? defaultGasPriceStep.high,
      },
    };
  }

  async fetchData(): Promise<SolanaGasPricesData> {
    if (!isSolanaChain(this.activeChain)) {
      return this.getDefaultData();
    }

    const chainId = this.getChainId();
    const { rpcUrl } = await this.chainApisStore.getChainApis(this.activeChain, this.activeNetwork);

    const activeChainGasPrices = SOLANA_GAS_PRICES[chainId ?? ''];
    const solana = await SolanaTx.getSolanaClient(rpcUrl ?? '', undefined, this.activeNetwork, this.activeChain);
    const { gasPrice } = await solana.getGasPrice();

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

export class SolanaGasPricesStore {
  private chainInfosStore: ChainInfosStore;
  private chainApisStore: ChainApisStore;
  private store = {} as Record<`${SupportedChain}-${NetworkType}`, SolanaGasPricesQueryStore>;

  constructor(chainInfosStore: ChainInfosStore, chainApisStore: ChainApisStore) {
    this.chainInfosStore = chainInfosStore;
    this.chainApisStore = chainApisStore;
  }

  getStore(chain: SupportedChain, network: NetworkType) {
    const key = `${chain}-${network}` as const;
    if (!this.store[key]) {
      this.store[key] = new SolanaGasPricesQueryStore(chain, network, this.chainInfosStore, this.chainApisStore);
    }

    return this.store[key];
  }
}
