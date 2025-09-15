import { Aptos, APTOS_COIN, APTOS_FA, AptosConfig } from '@aptos-labs/ts-sdk';
import {
  aptosChainNativeFATokenMapping,
  aptosChainNativeTokenMapping,
  ChainInfos,
  denoms as DefaultDenoms,
  DenomsRecord,
  fromSmallBN,
  isAptosChain,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk';
import { BigNumber } from '@leapwallet/cosmos-wallet-sdk/dist/browser/proto/injective/utils/classes';
import { computed, makeObservable, observable, runInAction, toJS } from 'mobx';

import { AggregatedChainsStore, ChainInfosStore, CoingeckoIdsStore } from '../assets';
import { DenomsStore } from '../assets/denoms-store';
import { BaseQueryStore } from '../base/base-data-store';
import { AggregatedSupportedChainType, Currency, SelectedNetworkType, StorageAdapter } from '../types';
import { ActiveChainStore, AddressStore, CurrencyStore, SelectedNetworkStore } from '../wallet';
import { AptosBalanceApiStore } from './aptos-balance-api-store';
import { sortTokenBalances } from './balance-calculator';
import { Token } from './balance-types';
import { PriceStore } from './price-store';

export const CACHED_APTOS_BALANCES_KEY = 'cached-aptos-balances';

export class AptosCoinDataQueryStore extends BaseQueryStore<Array<Token>> {
  constructor(
    private restUrl: string,
    private indexerApi: string,
    private address: string,
    private chain: SupportedChain,
    private priceStore: PriceStore,
    private denomsStore: DenomsStore,
    private coingeckoIdsStore: CoingeckoIdsStore,
  ) {
    super();
  }

  async fetchData() {
    await Promise.all([this.waitForPriceStore(), this.waitForCoingeckoIdsStore()]);

    const chainInfo = ChainInfos[this.chain];
    const address = this.address;
    if (!chainInfo.chainId.startsWith('aptos') && !address) {
      return [];
    }

    const restUrl = this.restUrl;
    const indexerApi = this.indexerApi;

    const aptosConfig = new AptosConfig({ fullnode: restUrl, indexer: indexerApi });
    const aptos = new Aptos(aptosConfig);

    const tokens = await aptos.getAccountCoinsData({ accountAddress: address });
    await this.denomsStore.readyPromise;
    const denoms = Object.assign({}, this.denomsStore.denoms, DefaultDenoms);
    const denomsToAdd: DenomsRecord = {};
    const coingeckoPrices = this.priceStore.data;
    const coingeckoIds = this.coingeckoIdsStore.coingeckoIdsFromS3;

    const tokensData = tokens
      .filter((token) => token.metadata && token?.metadata.decimals && parseInt(token.amount) !== 0)
      .map((token) => {
        const amount = fromSmallBN(token.amount, token.metadata?.decimals);

        let img = token.metadata?.icon_uri ?? '';

        let coinMinimalDenom = token.asset_type ?? '';
        const name = token.metadata?.name ?? '';
        const coinDenom = token.metadata?.symbol ?? '';
        let denomInfo = this.denomsStore.denoms[coinMinimalDenom];
        if ([APTOS_COIN, APTOS_FA].includes(coinMinimalDenom)) {
          const nativeToken =
            coinMinimalDenom === APTOS_COIN
              ? aptosChainNativeTokenMapping[this.chain]
              : aptosChainNativeFATokenMapping[this.chain];
          denomInfo = denoms[nativeToken];
          img = denomInfo.icon;
          coinMinimalDenom = nativeToken;
        }

        const coinGeckoId =
          denomInfo?.coinGeckoId ||
          coingeckoIds[coinMinimalDenom] ||
          coingeckoIds[coinMinimalDenom?.toLowerCase()] ||
          '';

        const usdPrice = coingeckoPrices?.[coinGeckoId];
        const usdValue = usdPrice ? amount.multipliedBy(usdPrice).toString() : undefined;

        if (!denomInfo) {
          denomsToAdd[coinMinimalDenom] = {
            name,
            coinDenom,
            icon: img,
            coinGeckoId,
            coinDecimals: token.metadata?.decimals || 8,
            coinMinimalDenom,
            chain: this.chain,
          };
        } else if (!denomInfo?.coinGeckoId && coinGeckoId) {
          denomsToAdd[coinMinimalDenom] = {
            ...denomInfo,
            coinGeckoId,
          };
        }

        return {
          name: token.metadata?.name ?? '',
          symbol: token.metadata?.symbol ?? '',
          coinMinimalDenom,
          amount: amount.toString(),
          usdValue,
          percentChange: undefined,
          img: denomInfo?.icon ?? img,
          ibcDenom: undefined,
          ibcChainInfo: undefined,
          usdPrice: usdPrice ? String(usdPrice) : undefined,
          coinDecimals: denomInfo?.coinDecimals ?? token.metadata?.decimals,
          invalidKey: false,
          chain: this.chain,
          coinGeckoId: denomInfo?.coinGeckoId,
          isEvm: false,
          tokenBalanceOnChain: this.chain,
          isAptos: true,
          aptosTokenType: token.token_standard as 'v1' | 'v2',
        };
      });
    if (Object.keys(denomsToAdd).length > 0) {
      this.denomsStore.setTempBaseDenoms(denomsToAdd);
    }
    return tokensData;
  }

  private async waitForCoingeckoIdsStore() {
    try {
      await this.coingeckoIdsStore.readyPromise;
    } catch (e) {
      //
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

export class AptosCoinDataStore {
  public chainWiseBalances: Record<string, Token[]> = {};
  public chainWiseLoadingStatus: Record<string, boolean> = {};
  public chainWiseErrorStatus: Record<string, boolean> = {};
  static DEFAULT_CHAIN: SupportedChain = 'movement';
  private saveCachedBalancesDebounce: NodeJS.Timeout | null = null;

  constructor(
    private activeChainStore: ActiveChainStore,
    private selectedNetworkStore: SelectedNetworkStore,
    private addressStore: AddressStore,
    private priceStore: PriceStore,
    private denomsStore: DenomsStore,
    private chainInfosStore: ChainInfosStore,
    private aptosBalanceApiStore: AptosBalanceApiStore,
    private currencyStore: CurrencyStore,
    private coingeckoIdsStore: CoingeckoIdsStore,
    private storageAdapter: StorageAdapter,
    private aggregatedChainsStore: AggregatedChainsStore,
  ) {
    makeObservable(this, {
      chainWiseBalances: observable,
      chainWiseLoadingStatus: observable,
      totalFiatValue: computed,
      balances: computed.struct,
      loading: computed,
      chainWiseErrorStatus: observable,
    });

    this.initCachedBalances();
  }

  get totalFiatValue() {
    let totalFiatValue = new BigNumber(0);
    const balances = this.balances;
    let hasAnyBalance = false;

    for (const asset of balances) {
      if (asset.usdValue) {
        totalFiatValue = totalFiatValue.plus(new BigNumber(asset.usdValue));
      }
      if (asset.amount && !new BigNumber(asset.amount).isNaN() && new BigNumber(asset.amount).gt(0)) {
        hasAnyBalance = true;
      }
    }

    if (totalFiatValue.gt(0)) {
      return totalFiatValue;
    }

    if (hasAnyBalance) {
      return new BigNumber(NaN);
    }

    return totalFiatValue;
  }

  get loading() {
    const chain = this.activeChainStore.activeChain;
    const network = this.selectedNetworkStore.selectedNetwork;
    if (!this.chainInfosStore) return false;

    if (chain === 'aggregated') {
      let loadingStatus: boolean = false;
      const allMoveChains = Object.keys(this.chainInfosStore?.chainInfos).filter(
        (chain) =>
          (network === 'testnet' ||
            this.chainInfosStore?.chainInfos[chain as SupportedChain]?.chainId !==
              this.chainInfosStore?.chainInfos[chain as SupportedChain]?.testnetChainId) &&
          this.chainInfosStore?.chainInfos[chain as SupportedChain]?.chainId?.startsWith('aptos'),
      ) as SupportedChain[];
      for (const chain of allMoveChains) {
        const balanceKey = this.getBalanceKey(chain, network);
        if (this.chainWiseLoadingStatus[balanceKey]) {
          loadingStatus = loadingStatus || this.chainWiseLoadingStatus[balanceKey];
        }
      }
      return loadingStatus;
    }

    if (!isAptosChain(chain)) {
      return false;
    }

    const balanceKey = this.getBalanceKey(chain);
    return this.chainWiseLoadingStatus[balanceKey] !== false;
  }

  getErrorStatusForChain(chain: SupportedChain, network: SelectedNetworkType, forceAddresses?: Record<string, string>) {
    const balanceKey = this.getBalanceKey(chain, network, forceAddresses?.[chain as SupportedChain]);
    return this.chainWiseErrorStatus[balanceKey] === true;
  }

  get balances() {
    const chain = this.activeChainStore.activeChain;
    const network = this.selectedNetworkStore.selectedNetwork;
    if (!this.chainInfosStore) return [];
    if (chain === 'aggregated') {
      const tokens: Token[] = [];
      const allMoveChains = Object.keys(this.chainInfosStore?.chainInfos).filter(
        (chain) =>
          (network === 'testnet' ||
            this.chainInfosStore?.chainInfos[chain as SupportedChain]?.chainId !==
              this.chainInfosStore?.chainInfos[chain as SupportedChain]?.testnetChainId) &&
          this.chainInfosStore?.chainInfos[chain as SupportedChain]?.chainId?.startsWith('aptos'),
      ) as SupportedChain[];
      for (const chain of allMoveChains) {
        const balanceKey = this.getBalanceKey(chain, network);
        if (this.chainWiseBalances[balanceKey]) {
          tokens.push(...(this.chainWiseBalances[balanceKey] ?? []));
        }
      }
      return sortTokenBalances(tokens);
    }

    const chainInfo = this.chainInfosStore.chainInfos?.[chain];

    if (!chainInfo?.chainId?.startsWith('aptos')) {
      return [];
    }

    const balanceKey = this.getBalanceKey(chain);
    return this.chainWiseBalances[balanceKey] ? sortTokenBalances(this.chainWiseBalances[balanceKey] ?? []) : [];
  }

  getAggregatedBalances(network: SelectedNetworkType, forceAddresses: Record<string, string> | undefined) {
    const tokens: Token[] = [];
    if (!this.chainInfosStore) return tokens;
    const allMoveChains = Object.keys(this.chainInfosStore?.chainInfos).filter(
      (chain) =>
        (network === 'testnet' ||
          this.chainInfosStore?.chainInfos[chain as SupportedChain]?.chainId !==
            this.chainInfosStore?.chainInfos[chain as SupportedChain]?.testnetChainId) &&
        isAptosChain(chain),
    ) as SupportedChain[];
    for (const chain of allMoveChains) {
      if (forceAddresses && !forceAddresses[chain as SupportedChain]) {
        continue;
      }

      const balanceKey = this.getBalanceKey(chain, network, forceAddresses?.[chain as SupportedChain]);
      if (this.chainWiseBalances[balanceKey]) {
        tokens.push(...(this.chainWiseBalances[balanceKey] ?? []));
      }
    }
    return sortTokenBalances(tokens);
  }

  getAptosBalances(chain: SupportedChain, network: SelectedNetworkType, forceAddress?: string) {
    const balanceKey = this.getBalanceKey(chain, network, forceAddress);
    return this.chainWiseBalances[balanceKey] ?? [];
  }

  async getChainData(
    chain: SupportedChain,
    network: SelectedNetworkType,
    forceRefetch = false,
    forceUseFallback = false,
    forceAddress?: string,
  ) {
    const { chain: _chain, chainInfo } = this.getChain(chain);
    const address = forceAddress || this.addressStore.addresses[_chain];
    const balanceKey = this.getBalanceKey(chain as SupportedChain, network, address);
    if (!address || !isAptosChain(chain)) {
      runInAction(() => {
        this.chainWiseLoadingStatus[balanceKey] = false;
        this.chainWiseErrorStatus[balanceKey] = false;
      });
      return;
    }

    runInAction(() => {
      this.chainWiseLoadingStatus[balanceKey] = true;
    });

    const selectedNetwork = this.selectedNetworkStore.selectedNetwork;
    const restUrl = selectedNetwork === 'testnet' ? chainInfo.apis.restTest : chainInfo.apis.rest;
    const indexerApi = selectedNetwork === 'testnet' ? chainInfo.apis.indexerTest : chainInfo.apis.indexer;
    if (!restUrl || !indexerApi) {
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

    if (!forceUseFallback) {
      const { balances, useFallback } = await this.aptosBalanceApiStore.fetchChainBalanceFromAPI(
        chain,
        selectedNetwork,
        address,
        forceRefetch,
      );

      if (!useFallback) {
        runInAction(() => {
          this.chainWiseBalances[balanceKey] = balances ?? [];
          this.chainWiseLoadingStatus[balanceKey] = false;
        });
        await this.saveCachedBalances();
        return;
      }
    }

    const aptosCoinDataStore = new AptosCoinDataQueryStore(
      restUrl,
      indexerApi,
      address,
      _chain,
      this.priceStore,
      this.denomsStore,
      this.coingeckoIdsStore,
    );
    try {
      const data = await aptosCoinDataStore.getData();
      runInAction(() => {
        this.chainWiseBalances[balanceKey] = data ?? [];
        this.chainWiseLoadingStatus[balanceKey] = aptosCoinDataStore.isLoading;
        this.chainWiseErrorStatus[balanceKey] = false;
      });
    } catch (e) {
      runInAction(() => {
        this.chainWiseBalances[balanceKey] = [];
        this.chainWiseLoadingStatus[balanceKey] = false;
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
    if (!this.chainInfosStore) return;

    if (_chain === 'aggregated') {
      const allMoveChains: SupportedChain[] = [];
      const supportedChainWiseAddresses: Partial<Record<SupportedChain, string>> = {};
      this.aggregatedChainsStore?.aggregatedChainsData
        ?.filter(
          (chain) =>
            (network === 'testnet' ||
              this.chainInfosStore?.chainInfos[chain as SupportedChain]?.chainId !==
                this.chainInfosStore?.chainInfos[chain as SupportedChain]?.testnetChainId) &&
            this.chainInfosStore?.chainInfos[chain as SupportedChain]?.chainId?.startsWith('aptos'),
        )
        .forEach((chain) => {
          const balanceKey = this.getBalanceKey(
            chain as SupportedChain,
            network,
            forceAddresses?.[chain as SupportedChain],
          );
          if (
            this.chainWiseBalances[balanceKey] &&
            !forceRefetch &&
            this.chainWiseLoadingStatus[balanceKey] === false
          ) {
            runInAction(() => {
              this.chainWiseLoadingStatus[balanceKey] = false;
            });
            return;
          }
          allMoveChains.push(chain as SupportedChain);
          supportedChainWiseAddresses[chain as SupportedChain] =
            forceAddresses?.[chain as SupportedChain] || this.addressStore.addresses[chain as SupportedChain];
        });

      if (Object.keys(supportedChainWiseAddresses).length === 0) {
        return;
      }

      const balances = await this.aptosBalanceApiStore.fetchAggregatedBalanceFromAPI(
        supportedChainWiseAddresses,
        network,
        forceRefetch,
      );
      const chainsToUseFallbackFor: SupportedChain[] = [];

      allMoveChains.forEach((chain) => {
        const balanceKey = this.getBalanceKey(chain, network, forceAddresses?.[chain as SupportedChain]);
        if (balances[chain as SupportedChain]?.useFallback) {
          chainsToUseFallbackFor.push(chain);
          return;
        }
        runInAction(() => {
          this.chainWiseBalances[balanceKey] = balances[chain as SupportedChain]?.balances ?? [];
          this.chainWiseLoadingStatus[balanceKey] = false;
        });
      });

      if (chainsToUseFallbackFor.length > 0) {
        await Promise.allSettled(
          chainsToUseFallbackFor.map((chain) =>
            this.getChainData(chain, network, forceRefetch, true, forceAddresses?.[chain as SupportedChain]),
          ),
        );
      }
      await this.saveCachedBalances();
      return;
    }

    await this.getChainData(_chain, network, forceRefetch, undefined, forceAddresses?.[_chain as SupportedChain]);
    return;
  }

  private getChain(forceChain?: SupportedChain) {
    let chain = forceChain ?? (this.activeChainStore.activeChain as SupportedChain);
    let chainInfo = ChainInfos[chain];
    if (!isAptosChain(chain)) {
      chainInfo = ChainInfos[AptosCoinDataStore.DEFAULT_CHAIN];
      chain = AptosCoinDataStore.DEFAULT_CHAIN;
    }
    return { chainInfo, chain };
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
      return this.updateAggregatedCurrency(network, prevCurrency);
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

      const denoms = Object.assign({}, this.denomsStore.denoms, DefaultDenoms);
      const coingeckoPrices = this.priceStore.data;
      const coingeckoIds = this.coingeckoIdsStore.coingeckoIdsFromS3;

      const updatedBalances = existingBalances.map((token) => {
        let denomInfo = denoms[token.coinMinimalDenom];

        // Handle native Aptos tokens
        if ([APTOS_COIN, APTOS_FA].includes(token.coinMinimalDenom)) {
          const nativeToken =
            token.coinMinimalDenom === APTOS_COIN
              ? aptosChainNativeTokenMapping[chain]
              : aptosChainNativeFATokenMapping[chain];
          denomInfo = denoms[nativeToken];
        }

        const coinGeckoId =
          token.coinGeckoId ||
          denomInfo?.coinGeckoId ||
          coingeckoIds[token.coinMinimalDenom] ||
          coingeckoIds[token.coinMinimalDenom?.toLowerCase()] ||
          '';

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
      console.error(`Error updating currency for aptos chain ${chain}`, error);
      runInAction(() => {
        this.chainWiseLoadingStatus[balanceKey] = false;
        this.chainWiseErrorStatus[balanceKey] = true;
      });
    }
  }

  async updateAggregatedCurrency(network: SelectedNetworkType, prevCurrency: Currency) {
    if (!this.chainInfosStore) return;

    const allMoveChains = Object.keys(this.chainInfosStore?.chainInfos).filter(
      (chain) =>
        (network === 'testnet' ||
          this.chainInfosStore?.chainInfos[chain as SupportedChain]?.chainId !==
            this.chainInfosStore?.chainInfos[chain as SupportedChain]?.testnetChainId) &&
        this.chainInfosStore?.chainInfos[chain as SupportedChain]?.chainId?.startsWith('aptos'),
    ) as SupportedChain[];

    await Promise.allSettled(allMoveChains.map((chain) => this.updateCurrencyForChain(chain, network, prevCurrency)));
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
      await this.storageAdapter.set(CACHED_APTOS_BALANCES_KEY, toJS(this.chainWiseBalances), 'idb');
    } catch (e) {
      //
    }
  }

  private async initCachedBalances() {
    try {
      const cachedBalances = await this.storageAdapter.get<Record<string, Token[]>>(CACHED_APTOS_BALANCES_KEY, 'idb');
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
      Object.keys(this.chainInfosStore?.chainInfos ?? {}).forEach((chain) => {
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
