import {
  axiosWrapper,
  ChainInfos,
  denoms as DefaultDenoms,
  fromSmallBN,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk';
import { BigNumber } from 'bignumber.js';
import { computed, makeObservable, observable, runInAction, toJS } from 'mobx';
import { computedFn } from 'mobx-utils';

import { AggregatedChainsStore } from '../assets/aggregated-chains-store';
import { ChainInfosStore } from '../assets/chain-infos-store';
import { DenomsStore } from '../assets/denoms-store';
import { BaseQueryStore } from '../base/base-data-store';
import { AggregatedSupportedChainType, Currency, SelectedNetworkType, StorageAdapter } from '../types';
import { isBitcoinChain } from '../utils';
import { generateRandomString } from '../utils/random-string-generator';
import { ActiveChainStore, AddressStore, CurrencyStore, SelectedNetworkStore } from '../wallet';
import { sortTokenBalances } from './balance-calculator';
import { Token } from './balance-types';
import { PriceStore } from './price-store';

export const CACHED_BITCOIN_BALANCES_KEY = 'cached-bitcoin-balances';

export interface IRawBalanceResponse {
  balances: Array<{ amount: string; denom: string }>;
  pagination: { next_key: any; total: string };
}

/**
 * @deprecated
 */
export class BitcoinBalanceStore extends BaseQueryStore<IRawBalanceResponse> {
  rpcUrl: string;
  address: string;
  chain: string;

  constructor(rpcUrl: string, address: string, chain: string) {
    super();
    makeObservable(this);

    this.rpcUrl = rpcUrl;
    this.address = address;
    this.chain = chain;
  }

  async fetchData() {
    const { data } = await axiosWrapper({
      baseURL: this.rpcUrl,
      method: 'get',
      url: `/address/${this.address}/utxo`,
    });

    let totalAmount = 0;
    data.forEach((utxo: any) => {
      totalAmount += utxo.value;
    });

    return {
      balances: [
        {
          amount: totalAmount.toString(),
          denom: this.chain === 'bitcoin' ? 'bitcoin-native' : 'bitcoin-signet-native',
        },
      ],
      pagination: { next_key: null, total: '1' },
    };
  }
}

export class BitcoinDataQueryStore extends BaseQueryStore<Array<Token>> {
  constructor(
    private restUrl: string,
    private address: string,
    private chain: SupportedChain,
    private network: SelectedNetworkType,
    private priceStore: PriceStore,
    private denomsStore: DenomsStore,
    private chainInfosStore: ChainInfosStore,
  ) {
    super();
  }

  async fetchData() {
    try {
      await this.waitForPriceStore();
      const address = this.address;
      if (!isBitcoinChain(this.chain) && !address) {
        return [];
      }

      const { data } = await axiosWrapper({
        baseURL: this.restUrl,
        method: 'get',
        url: `/address/${this.address}/utxo`,
      });

      let totalAmount = 0;
      data.forEach((utxo: any) => {
        totalAmount += utxo.value;
      });

      await this.denomsStore.readyPromise;
      const denoms = Object.assign({}, this.denomsStore.denoms, DefaultDenoms);
      const denom = this.chain === 'bitcoin' ? 'bitcoin-native' : 'bitcoin-signet-native';
      const denomInfo = denoms[denom];
      if (!denomInfo) {
        return [];
      }
      const formattedAmount = fromSmallBN(totalAmount.toString(), denomInfo.coinDecimals);
      const coingeckoPrices = this.priceStore.data;
      let usdPrice = coingeckoPrices?.[denomInfo.coinGeckoId];
      if (!usdPrice) {
        const chainId =
          this.network === 'testnet'
            ? this.chainInfosStore.chainInfos[this.chain].testnetChainId
            : this.chainInfosStore.chainInfos[this.chain].chainId;
        const alternateKey = `${chainId}-${denomInfo.coinMinimalDenom}`;
        usdPrice = this.priceStore.prices[alternateKey];
      }
      const usdValue = usdPrice ? formattedAmount.multipliedBy(usdPrice).toString() : undefined;
      const tokensData = [
        {
          amount: formattedAmount.toString(),
          coinMinimalDenom: denom,
          symbol: denomInfo.coinDenom,
          img: denomInfo.icon,
          name: denomInfo.name,
          usdValue,
          usdPrice: String(usdPrice),
          chain: denomInfo?.chain ?? '',
          coinDecimals: denomInfo?.coinDecimals,
          coinGeckoId: denomInfo?.coinGeckoId,
          tokenBalanceOnChain: this.chain,
          id: generateRandomString(10),
        },
      ];
      return tokensData;
    } catch (e) {
      console.error(`Error fetching bitcoin balance for ${this.chain}`, e);
      this.setError(e as Error);
      return [];
    }
  }

  private async waitForPriceStore() {
    try {
      await this.priceStore.readyPromise;
    } catch (e) {
      //
    }
  }
}

export class BitcoinDataStore {
  public chainWiseBalances: Record<string, Token[]> = {};
  public chainWiseLoadingStatus: Record<string, boolean> = {};
  public chainWiseErrorStatus: Record<string, boolean> = {};

  constructor(
    private activeChainStore: ActiveChainStore,
    private selectedNetworkStore: SelectedNetworkStore,
    private addressStore: AddressStore,
    private priceStore: PriceStore,
    private denomsStore: DenomsStore,
    private chainInfosStore: ChainInfosStore,
    private aggregatedChainsStore: AggregatedChainsStore,
    private currencyStore: CurrencyStore,
    private storageAdapter: StorageAdapter,
    private saveCachedBalancesDebounce: NodeJS.Timeout | null = null,
  ) {
    makeObservable(this, {
      chainWiseBalances: observable,
      chainWiseLoadingStatus: observable,
      chainWiseErrorStatus: observable,
      totalFiatValue: computed,
      balances: computed.struct,
      loading: computed,
    });

    this.initCachedBalances();
  }

  get totalFiatValue() {
    let totalFiatValue = new BigNumber(0);
    const balances = this.balances;

    for (const asset of balances) {
      if (asset.usdValue) {
        totalFiatValue = totalFiatValue.plus(new BigNumber(asset.usdValue));
      }
    }
    return totalFiatValue;
  }

  get loading() {
    const chain = this.activeChainStore.activeChain;
    const network = this.selectedNetworkStore.selectedNetwork;

    if (chain === 'aggregated') {
      if (!this.aggregatedChainsStore.aggregatedChainsData.includes('bitcoin')) {
        return false;
      }
      const balanceKey = this.getBalanceKey('bitcoin', network);
      return this.chainWiseLoadingStatus[balanceKey];
    }

    if (!isBitcoinChain(chain)) {
      return false;
    }

    const balanceKey = this.getBalanceKey(chain);
    return this.chainWiseLoadingStatus[balanceKey] !== false;
  }

  getErrorStatusForChain(chain: SupportedChain, network: SelectedNetworkType) {
    const balanceKey = this.getBalanceKey(chain, network);
    return this.chainWiseErrorStatus[balanceKey] ?? false;
  }

  get balances() {
    const chain = this.activeChainStore.activeChain;
    const network = this.selectedNetworkStore.selectedNetwork;
    if (chain === 'aggregated') {
      const tokens: Token[] = [];
      if (!this.aggregatedChainsStore.aggregatedChainsData.includes('bitcoin')) {
        return tokens;
      }
      const balanceKey = this.getBalanceKey('bitcoin', network);
      return sortTokenBalances(this.chainWiseBalances[balanceKey] ?? []);
    }

    const balanceKey = this.getBalanceKey(chain);
    return this.chainWiseBalances[balanceKey] ? sortTokenBalances(this.chainWiseBalances[balanceKey] ?? []) : [];
  }

  getBitcoinBalances = computedFn(
    (chain: SupportedChain, network: SelectedNetworkType, forceAddress: string | undefined) => {
      const balanceKey = this.getBalanceKey(chain, network, forceAddress);
      return this.chainWiseBalances[balanceKey] ? sortTokenBalances(this.chainWiseBalances[balanceKey] ?? []) : [];
    },
  );

  getAggregatedBalances(network: SelectedNetworkType, forceAddresses: Record<string, string> | undefined) {
    const tokens: Token[] = [];
    if (!this.aggregatedChainsStore.aggregatedChainsData.includes('bitcoin')) {
      return tokens;
    }
    if (forceAddresses && !forceAddresses['bitcoin']) {
      return tokens;
    }

    const balanceKey = this.getBalanceKey('bitcoin', network, forceAddresses?.['bitcoin']);
    return sortTokenBalances(this.chainWiseBalances[balanceKey] ?? []);
  }

  async getChainData(chain: SupportedChain, network: SelectedNetworkType, forceRefetch = false, forceAddress?: string) {
    const address = forceAddress || this.addressStore.addresses[chain];
    const balanceKey = this.getBalanceKey(chain as SupportedChain, network, address);
    if (!address || !isBitcoinChain(chain)) {
      runInAction(() => {
        this.chainWiseLoadingStatus[balanceKey] = false;
      });
      return;
    }
    const chainInfo = this.chainInfosStore.chainInfos[chain];

    runInAction(() => {
      this.chainWiseLoadingStatus[balanceKey] = true;
    });

    const selectedNetwork = this.selectedNetworkStore.selectedNetwork;
    const restUrl = selectedNetwork === 'testnet' ? chainInfo.apis.rpcTestBlockbook : chainInfo.apis.rpcBlockbook;
    if (!restUrl) {
      runInAction(() => {
        this.chainWiseLoadingStatus[balanceKey] = false;
      });
      return;
    }

    if (this.chainWiseBalances[balanceKey] && !forceRefetch && this.chainWiseLoadingStatus[balanceKey] === false) {
      runInAction(() => {
        this.chainWiseLoadingStatus[balanceKey] = false;
      });
      return;
    }

    const bitcoinDataStore = new BitcoinDataQueryStore(
      restUrl,
      address,
      chain,
      network,
      this.priceStore,
      this.denomsStore,
      this.chainInfosStore,
    );
    try {
      const data = await bitcoinDataStore.getData();
      runInAction(() => {
        this.chainWiseBalances[balanceKey] = data ?? [];
        this.chainWiseLoadingStatus[balanceKey] = bitcoinDataStore.isLoading;
        this.chainWiseErrorStatus[balanceKey] = bitcoinDataStore.error ? true : false;
      });
    } catch (e) {
      runInAction(() => {
        this.chainWiseBalances[balanceKey] = [];
        this.chainWiseErrorStatus[balanceKey] = true;
      });
    }
    await this.saveCachedBalances();
  }

  async getData(
    forceChain?: AggregatedSupportedChainType,
    forceNetwork?: SelectedNetworkType,
    forceRefetch = false,
    forceAddresses?: Record<string, string>,
  ) {
    const network = forceNetwork ?? this.selectedNetworkStore.selectedNetwork;
    const _chain = forceChain ?? this.activeChainStore.activeChain;

    if (_chain === 'aggregated') {
      await this.aggregatedChainsStore.readyPromise;
      if (!this.aggregatedChainsStore.aggregatedChainsData.includes('bitcoin')) {
        return;
      }
      await this.getChainData('bitcoin', network, forceRefetch, forceAddresses?.['bitcoin']);
      return;
    }

    await this.getChainData(_chain, network, forceRefetch, forceAddresses?.[_chain]);
    return;
  }

  private getBalanceKey(
    chain: SupportedChain,
    _network?: SelectedNetworkType,
    _address?: string,
    forceCurrency?: Currency,
  ): string {
    const network = _network ?? this.selectedNetworkStore?.selectedNetwork;
    const chainKey = this.getChainKey(chain as SupportedChain, network);
    const address = _address ?? this.addressStore?.addresses?.[chain as SupportedChain];
    const userPreferredCurrency = forceCurrency ?? this.currencyStore?.preferredCurrency;
    return `${chainKey}-${address}-${userPreferredCurrency}`;
  }

  private getChainKey(chain: SupportedChain, network: SelectedNetworkType): string {
    const chainId = network === 'testnet' ? ChainInfos?.[chain]?.testnetChainId : ChainInfos?.[chain]?.chainId;
    return `${chain}-${chainId}`;
  }

  async updateCurrency(prevCurrency: Currency) {
    const network = this.selectedNetworkStore.selectedNetwork;
    const chain = this.activeChainStore.activeChain;

    if (chain === 'aggregated') {
      if (!this.aggregatedChainsStore.aggregatedChainsData.includes('bitcoin')) {
        return;
      }
      return this.updateCurrencyForChain('bitcoin', network, prevCurrency);
    }
    return this.updateCurrencyForChain(chain, network, prevCurrency);
  }

  async updateCurrencyForChain(chain: SupportedChain, network: SelectedNetworkType, prevCurrency: Currency) {
    const oldBalanceKey = this.getBalanceKey(chain, network, undefined, prevCurrency);
    const balanceKey = this.getBalanceKey(chain, network);
    const existingBalances = this.chainWiseBalances[oldBalanceKey];

    if (!existingBalances || existingBalances.length === 0) {
      return;
    }

    try {
      runInAction(() => {
        this.chainWiseLoadingStatus[balanceKey] = true;
      });

      await this.denomsStore.readyPromise;
      const denoms = Object.assign({}, this.denomsStore.denoms, DefaultDenoms);
      const denom = chain === 'bitcoin' ? 'bitcoin-native' : 'bitcoin-signet-native';
      const coingeckoPrices = this.priceStore.data;
      const chainId =
        network === 'testnet'
          ? this.chainInfosStore.chainInfos[chain].testnetChainId
          : this.chainInfosStore.chainInfos[chain].chainId;

      const updatedBalances = existingBalances.map((token) => {
        const denomInfo = denoms[denom];
        const coinGeckoId = token.coinGeckoId || denomInfo?.coinGeckoId || `${chainId}-${token.coinMinimalDenom}`;
        const usdPrice = coingeckoPrices?.[coinGeckoId];
        const formattedAmount = new BigNumber(token.amount);
        const usdValue = usdPrice ? formattedAmount.multipliedBy(usdPrice).toString() : undefined;

        return {
          ...token,
          usdValue,
          usdPrice: usdPrice ? String(usdPrice) : undefined,
        };
      });

      runInAction(() => {
        this.chainWiseBalances[balanceKey] = updatedBalances;
        this.chainWiseLoadingStatus[balanceKey] = false;
      });
      if (oldBalanceKey !== balanceKey) {
        /**
         * Clean up balances for the old currency.
         */
        this.clearCachedBalancesForChain(chain, undefined, prevCurrency);
      }
      /**
       * Save the balances for the new currency.
       */
      this.saveCachedBalances();
    } catch (error) {
      console.error(`Error updating currency for bitcoin chain ${chain}`, error);
      runInAction(() => {
        this.chainWiseLoadingStatus[balanceKey] = false;
        this.chainWiseErrorStatus[balanceKey] = true;
      });
    }
  }

  /**
   * Debounce the save of cached balances to storage by 1 second.
   * To avoid multiple calls to the storage adapter.
   */
  private async saveCachedBalances() {
    if (this.saveCachedBalancesDebounce) {
      clearTimeout(this.saveCachedBalancesDebounce);
    }

    this.saveCachedBalancesDebounce = setTimeout(() => {
      this.saveCachedBalancesToStorage();
      this.saveCachedBalancesDebounce = null;
    }, 1000);
  }

  private async saveCachedBalancesToStorage() {
    try {
      await this.storageAdapter.set(CACHED_BITCOIN_BALANCES_KEY, toJS(this.chainWiseBalances), 'idb');
    } catch (e) {
      //
    }
  }

  private async initCachedBalances() {
    try {
      const cachedBalances = await this.storageAdapter.get<Record<string, Token[]>>(CACHED_BITCOIN_BALANCES_KEY, 'idb');
      if (!cachedBalances) {
        return;
      }

      runInAction(() => {
        this.chainWiseBalances = cachedBalances;
      });
    } catch (e) {
      //
    }
  }

  clearCachedBalancesForChain(chain: SupportedChain, address?: string, forceCurrency?: Currency) {
    try {
      const balanceKey = this.getBalanceKey(chain, 'mainnet', address, forceCurrency);
      if (this.chainWiseBalances?.[balanceKey]) {
        runInAction(() => {
          delete this.chainWiseBalances[balanceKey];
        });
      }
    } catch (e) {
      //
    }
    try {
      const balanceKey = this.getBalanceKey(chain, 'testnet', address, forceCurrency);
      if (this.chainWiseBalances?.[balanceKey]) {
        runInAction(() => {
          delete this.chainWiseBalances[balanceKey];
        });
      }
    } catch (e) {
      //
    }
  }

  /**
   * Clear the cached balances for the given addresses.
   * It will use `forceAddresses` and `chainInfosStore` to calculate the balance keys.
   * It will clear the balances for the mainnet and testnet,
   * If balances are present for corresponding networks.
   *
   * @param forceAddresses - The addresses to clear the balances for.
   */
  clearCachedBalances(forceAddresses: Record<string, string>) {
    try {
      Object.keys(this.chainInfosStore.chainInfos).forEach((chain) => {
        if (!forceAddresses?.[chain as SupportedChain]) {
          return;
        }

        this.clearCachedBalancesForChain(chain as SupportedChain, forceAddresses?.[chain as SupportedChain]);
      });
      this.saveCachedBalances();
    } catch (e) {
      //
    }
  }
}
