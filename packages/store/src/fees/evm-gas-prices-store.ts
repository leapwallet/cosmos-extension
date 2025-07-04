import {
  baseEthereumGasPrices,
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
import { makeObservable, runInAction } from 'mobx';

import { ChainInfosStore } from '../assets';
import { BaseObservableQueryStore } from '../base/base-observable-data-store';
import { ChainApisStore } from '../chains';
import { cachedRemoteDataWithLastModified } from '../utils/cached-remote-data';

export type EvmGasPrices = {
  gasPrice: Record<EvmFeeType, number>;
  maxFeePerGas?: Record<EvmFeeType, string>;
  maxPriorityFeePerGas?: Record<EvmFeeType, string>;
};

type EvmGasConfig = {
  refetchInterval: Record<string, number>;
  multiplier: Record<string, Record<EvmFeeType, number>>;
};

type EvmGasPricesData = EvmGasPrices;

/**
 * Use enableRefetch() to start polling for latest gas prices data
 *
 * Use disableRefetch() to stop polling for latest gas prices data
 */
export class EvmGasPricesQueryStore extends BaseObservableQueryStore<EvmGasPricesData> {
  private activeChain: SupportedChain;
  private activeNetwork: NetworkType;
  private chainInfosStore: ChainInfosStore;
  private chainApisStore: ChainApisStore;
  private refetchInterval: ReturnType<typeof setInterval> | null = null;
  private gasConfig: EvmGasConfig | null = null;
  private evmGasPrices: Record<string, EvmGasPrices['gasPrice']> | undefined;

  data: EvmGasPricesData;

  constructor(
    activeChain: SupportedChain,
    activeNetwork: NetworkType,
    chainInfosStore: ChainInfosStore,
    chainApisStore: ChainApisStore,
    evmGasPrices: Record<string, EvmGasPrices['gasPrice']> | undefined,
    gasConfig: EvmGasConfig | null,
  ) {
    super();

    this.activeChain = activeChain;
    this.activeNetwork = activeNetwork;
    this.chainInfosStore = chainInfosStore;
    this.chainApisStore = chainApisStore;
    this.evmGasPrices = evmGasPrices;
    this.gasConfig = gasConfig;
    this.data = this.getDefaultData();

    makeObservable(this);
  }

  private get chainId() {
    return getChainId(
      this.chainInfosStore.chainInfos[this.activeChain],
      this.activeNetwork,
      this.activeChain === 'xrpl',
    );
  }

  private checkIsSeiEvmChain() {
    return getIsCompass() && (this.activeChain === 'seiDevnet' || this.activeChain === 'seiTestnet2');
  }

  private getDefaultData() {
    const chainId = this.chainId;

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

    const activeChainInfo = this.chainInfosStore?.chainInfos?.[this.activeChain];

    if (!this.checkIsSeiEvmChain() && !activeChainInfo?.evmOnlyChain) {
      return this.getDefaultData();
    }

    const activeChainId = this.chainId;

    const fallbackGasPrices: { low: number; medium: number; high: number } = {
      low: activeChainInfo?.gasPriceStep?.low ?? baseEthereumGasPrices.low,
      medium: activeChainInfo?.gasPriceStep?.average ?? baseEthereumGasPrices.medium,
      high: activeChainInfo?.gasPriceStep?.high ?? baseEthereumGasPrices.high,
    };
    const activeChainGasPrices: { low: number; medium: number; high: number } | undefined =
      this.evmGasPrices?.[activeChainId ?? ''] ?? EVM_GAS_PRICES[activeChainId ?? ''] ?? fallbackGasPrices;

    const { evmJsonRpc } = await this.chainApisStore.getChainApis(this.activeChain, this.activeNetwork);
    const { maxFeePerGas, gasPrice, maxPriorityFeePerGas } = await SeiEvmTx.GasPrices(
      evmJsonRpc,
      this.gasConfig?.multiplier?.[activeChainId ?? ''],
    );

    const low = Math.ceil(Number(maxFeePerGas?.low || gasPrice?.low || activeChainGasPrices?.low));
    const medium = Math.ceil(Number(maxFeePerGas?.medium || gasPrice?.medium || activeChainGasPrices?.medium));
    const high = Math.ceil(Number(maxFeePerGas?.high || gasPrice?.high || activeChainGasPrices?.high));

    return {
      maxFeePerGas,
      maxPriorityFeePerGas,
      gasPrice: {
        low,
        medium,
        high,
      },
    };
  }

  enableRefetch() {
    if (this.refetchInterval) {
      clearInterval(this.refetchInterval);
    }

    const interval = this.gasConfig?.refetchInterval?.[this.chainId ?? ''] ?? 5_000;
    this.refetchInterval = setInterval(() => {
      this.refetchData();
    }, interval);
  }

  disableRefetch() {
    this.refetchInterval && clearInterval(this.refetchInterval);
  }
}

// replaces useGetEvmGasPrices
export class EvmGasPricesStore {
  private chainInfosStore: ChainInfosStore;
  private chainApisStore: ChainApisStore;
  private storage: StorageLayer;
  private store = {} as Partial<Record<`${SupportedChain}-${NetworkType}`, EvmGasPricesQueryStore>>;
  private evmGasPrices: Record<string, EvmGasPrices['gasPrice']> | undefined;
  private gasConfig: EvmGasConfig | null = null;
  private initializingEvmPrices: 'pending' | 'done' | 'error' = 'pending';
  private initializingGasConfig: 'pending' | 'done' | 'error' = 'pending';

  constructor(chainInfosStore: ChainInfosStore, chainApisStore: ChainApisStore, storage: StorageLayer) {
    this.chainInfosStore = chainInfosStore;
    this.chainApisStore = chainApisStore;
    this.storage = storage;

    Promise.allSettled([this.fetchEvmGasPricesFromS3(), this.initGasConfig()]);
  }

  private async fetchEvmGasPricesFromS3() {
    try {
      const _evmGasPrices = await cachedRemoteDataWithLastModified<Record<string, EvmGasPrices['gasPrice']>>({
        remoteUrl: 'https://assets.leapwallet.io/cosmos-registry/v1/gas/evm-gas-prices.json',
        storageKey: 'evm-gas-prices',
        storage: this.storage,
      });
      runInAction(() => {
        this.evmGasPrices = _evmGasPrices;
        this.initializingEvmPrices = 'done';
      });
    } catch (error) {
      console.error('Error fetching EVM gas prices', error);
      runInAction(() => {
        this.initializingEvmPrices = 'error';
      });
    }
  }

  private async initGasConfig() {
    try {
      const gasConfig = await cachedRemoteDataWithLastModified<EvmGasConfig>({
        remoteUrl: 'https://assets.leapwallet.io/cosmos-registry/v1/config/evm-gas-config.json',
        storageKey: 'evm-gas-config',
        storage: this.storage,
      });
      runInAction(() => {
        this.gasConfig = gasConfig ?? {
          refetchInterval: {},
          multiplier: {},
        };
        this.initializingGasConfig = 'done';
      });
    } catch (error) {
      console.error('Error fetching EVM gas config', error);
      runInAction(() => {
        this.gasConfig = {
          refetchInterval: {},
          multiplier: {},
        };
        this.initializingGasConfig = 'error';
      });
    }
  }

  getStore(chain: SupportedChain, network: NetworkType) {
    if (this.initializingEvmPrices === 'pending' || this.initializingGasConfig === 'pending') {
      return null;
    }

    const key = `${chain}-${network}` as const;

    if (!this.store[key]) {
      this.store[key] = new EvmGasPricesQueryStore(
        chain,
        network,
        this.chainInfosStore,
        this.chainApisStore,
        this.evmGasPrices,
        this.gasConfig,
      );
    }

    return this.store[key];
  }
}
