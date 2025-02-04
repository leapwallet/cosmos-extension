import {
  defaultGasPriceStep,
  EVM_GAS_PRICES,
  EvmFeeType,
  getChainId,
  getIsCompass,
  NetworkType,
  SeiEvmTx,
  StorageLayer,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk';
import { makeObservable } from 'mobx';

import { ChainInfosStore } from '../assets';
import { BaseQueryStore } from '../base/base-data-store';
import { ChainApisStore } from '../chains';
import { cachedRemoteDataWithLastModified } from '../utils/cached-remote-data';

export type EvmGasPrices = {
  gasPrice: Record<EvmFeeType, number>;
  maxFeePerGas?: Record<EvmFeeType, string>;
  maxPriorityFeePerGas?: Record<EvmFeeType, string>;
};

type EvmGasPricesData = EvmGasPrices;

export class EvmGasPricesQueryStore extends BaseQueryStore<EvmGasPricesData> {
  private activeChain: SupportedChain;
  private activeNetwork: NetworkType;
  private chainInfosStore: ChainInfosStore;
  private chainApisStore: ChainApisStore;
  private storage: StorageLayer;

  data: EvmGasPricesData;

  constructor(
    activeChain: SupportedChain,
    activeNetwork: NetworkType,
    chainInfosStore: ChainInfosStore,
    chainApisStore: ChainApisStore,
    storage: StorageLayer,
  ) {
    super();

    this.activeChain = activeChain;
    this.activeNetwork = activeNetwork;
    this.chainInfosStore = chainInfosStore;
    this.chainApisStore = chainApisStore;
    this.storage = storage;
    this.data = this.getDefaultData();

    makeObservable(this);
  }

  private getChainId() {
    return getChainId(this.chainInfosStore.chainInfos[this.activeChain], this.activeNetwork);
  }

  private checkIsSeiEvmChain() {
    return getIsCompass() && (this.activeChain === 'seiDevnet' || this.activeChain === 'seiTestnet2');
  }

  private getDefaultData() {
    const chainId = this.getChainId();

    return {
      gasPrice: {
        low: EVM_GAS_PRICES[chainId ?? '']?.low ?? defaultGasPriceStep.low,
        medium: EVM_GAS_PRICES[chainId ?? '']?.medium ?? defaultGasPriceStep.average,
        high: EVM_GAS_PRICES[chainId ?? '']?.high ?? defaultGasPriceStep.high,
      },
    };
  }

  async fetchData(): Promise<EvmGasPricesData> {
    if (this.activeChain === 'lightlink') {
      return {
        gasPrice: {
          low: 100_000_000,
          medium: 120_000_000,
          high: 150_000_000,
        },
      };
    }

    if (!this.checkIsSeiEvmChain() && !this.chainInfosStore.chainInfos[this.activeChain]?.evmOnlyChain) {
      return this.getDefaultData();
    }

    let evmGasPrices: Record<string, { low: number; medium: number; high: number }> = {};
    try {
      evmGasPrices = await cachedRemoteDataWithLastModified({
        remoteUrl: 'https://assets.leapwallet.io/cosmos-registry/v1/gas/evm-gas-prices.json',
        storageKey: 'evm-gas-prices',
        storage: this.storage,
      });
    } catch (error) {
      console.error('Error fetching EVM gas prices', error);
    }

    const activeChainId = this.getChainId();
    const activeChainGasPrices = evmGasPrices?.[activeChainId ?? ''] ?? EVM_GAS_PRICES[activeChainId ?? ''];

    const { evmJsonRpc } = await this.chainApisStore.getChainApis(this.activeChain, this.activeNetwork);
    const { maxFeePerGas, gasPrice, maxPriorityFeePerGas } = await SeiEvmTx.GasPrices(evmJsonRpc);

    const low = Number(maxFeePerGas?.low ?? gasPrice?.low);
    const medium = Number(maxFeePerGas?.medium ?? gasPrice?.medium);
    const high = Number(maxFeePerGas?.high ?? gasPrice?.high);

    return {
      maxFeePerGas,
      maxPriorityFeePerGas,
      gasPrice: {
        low: low || activeChainGasPrices?.low,
        medium: medium || activeChainGasPrices?.medium,
        high: high || activeChainGasPrices?.high,
      },
    };
  }
}

// replaces useGetEvmGasPrices
export class EvmGasPricesStore {
  private chainInfosStore: ChainInfosStore;
  private chainApisStore: ChainApisStore;
  private storage: StorageLayer;
  private store = {} as Partial<Record<`${SupportedChain}-${NetworkType}`, EvmGasPricesQueryStore>>;

  constructor(chainInfosStore: ChainInfosStore, chainApisStore: ChainApisStore, storage: StorageLayer) {
    this.chainInfosStore = chainInfosStore;
    this.chainApisStore = chainApisStore;
    this.storage = storage;
  }

  getStore(chain: SupportedChain, network: NetworkType) {
    const key = `${chain}-${network}` as const;
    if (!this.store[key]) {
      this.store[key] = new EvmGasPricesQueryStore(
        chain,
        network,
        this.chainInfosStore,
        this.chainApisStore,
        this.storage,
      );
    }

    return this.store[key];
  }
}
