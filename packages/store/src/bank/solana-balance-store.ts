import { DenomsRecord, getBaseURL, isSolanaChain, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import axios from 'axios';
import { BigNumber } from 'bignumber.js';
import { computed, makeObservable, observable, runInAction, toJS } from 'mobx';
import { computedFn } from 'mobx-utils';

import { AggregatedChainsStore, ChainInfosStore, CoingeckoIdsStore, RootDenomsStore } from '../assets';
import { BaseQueryStore } from '../base/base-data-store';
import { AggregatedSupportedChainType, Currency, SelectedNetworkType, StorageAdapter } from '../types';
import { calculateTokenPriceAndValue } from '../utils/bank/price-calculator';
import { ActiveChainStore, AddressStore, CurrencyStore, SelectedNetworkStore } from '../wallet';
import { sortTokenBalances } from './balance-calculator';
import { Token } from './balance-types';
import { PriceStore } from './price-store';

const NATIVE_DENOM = {
  solana: 'lamports',
  fogo: 'fogo-native',
};

const WRAPPED_DENOM = {
  solana: 'So11111111111111111111111111111111111111112',
  fogo: 'wrapped-fogo',
};

export const CACHED_SOLANA_BALANCES_KEY = 'cached-solana-balances';

export class SolanaCoinDataQueryStore extends BaseQueryStore<Array<Token>> {
  constructor(
    private address: string,
    private chain: SupportedChain,
    private priceStore: PriceStore,
    private rootDenomsStore: RootDenomsStore,
    private selectedNetwork: string,
    private coingeckoIdsStore: CoingeckoIdsStore,
    private chainInfosStore: ChainInfosStore,
    private forceRefetch: boolean = false,
  ) {
    super();
  }

  async fetchData() {
    if (!this.address) {
      return [];
    }

    const denoms = this.rootDenomsStore.allDenoms;

    await Promise.all([this.waitForPriceStore(), this.waitForCoingeckoIdsStore()]);

    const coingeckoPrices = this.priceStore.data;
    const coingeckoIds = this.coingeckoIdsStore.coingeckoIdsFromS3;

    const denomsToAdd: DenomsRecord = {};

    try {
      const { data: allBalances }: { data: Record<string, any> } = await axios({
        url: `${getBaseURL()}/v1/balances/solana`,
        method: 'POST',
        data: {
          address: this.address,
          selectedNetwork: this.selectedNetwork,
          chain: this.chain,
          forceRefetch: this.forceRefetch,
        },
      });
      const tokens = Object.entries(allBalances).map(([mintAddress, data]) => {
        const isNative = mintAddress === '11111111111111111111111111111111';
        const isWrapped = mintAddress === 'So11111111111111111111111111111111111111112';
        const nativeDenom = NATIVE_DENOM[this.chain as keyof typeof NATIVE_DENOM];
        const wrappedDenom = denoms[WRAPPED_DENOM[this.chain as keyof typeof WRAPPED_DENOM]];
        const denomData = isNative ? denoms[nativeDenom] : isWrapped ? wrappedDenom : denoms[mintAddress];
        const coinGeckoId =
          data?.coingeckoId ||
          denomData?.coinGeckoId ||
          coingeckoIds[mintAddress] ||
          coingeckoIds[mintAddress?.toLowerCase()] ||
          '';

        const amount = data.amount;
        const chainId = this.chainInfosStore.chainInfos[this.chain]?.chainId;

        const { usdValue, usdPrice } = calculateTokenPriceAndValue({
          amount,
          coingeckoPrices,
          coinMinimalDenom: mintAddress,
          chainId,
          coinGeckoId,
        });

        if (!denomData) {
          denomsToAdd[mintAddress] = {
            name: data.name,
            coinDenom: data.symbol,
            icon: data.image,
            coinGeckoId,
            coinDecimals: data.decimals,
            coinMinimalDenom: mintAddress,
            chain: this.chain,
          };
        } else if (!denomData?.coinGeckoId && coinGeckoId) {
          denomsToAdd[mintAddress] = {
            ...denomData,
            coinGeckoId,
          };
        }
        return {
          name: denomData?.name || data.name,
          symbol: denomData?.coinDenom || data.symbol,
          coinMinimalDenom: isNative
            ? nativeDenom
            : isWrapped
            ? WRAPPED_DENOM[this.chain as keyof typeof WRAPPED_DENOM]
            : data.mintAddress,
          amount: data.amount,
          usdValue,
          percentChange: undefined,
          img: denomData?.icon || data.image,
          ibcDenom: undefined,
          ibcChainInfo: undefined,
          usdPrice,
          coinDecimals: data.decimals,
          invalidKey: false,
          chain: this.chain,
          coinGeckoId,
          isEvm: false,
          tokenBalanceOnChain: this.chain,
          isSolana: true,
          tokenAddress: data.mintAddress,
          isSui: false,
        };
      });

      if (Object.keys(denomsToAdd).length > 0) {
        this.rootDenomsStore.baseDenomsStore.setTempBaseDenoms(denomsToAdd);
      }

      return tokens.filter((token) => new BigNumber(token.amount).gt(0));
    } catch (err) {
      console.error('Error fetching Solana balances:', err);
      this.setError(err as Error);
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

  private async waitForCoingeckoIdsStore() {
    try {
      await this.coingeckoIdsStore.readyPromise;
    } catch (e) {
      //
    }
  }
}

export class SolanaCoinDataStore {
  public balanceRecord: Record<string, SolanaCoinDataQueryStore> = {};
  public solanaBalances: Record<string, Token[]> = {};
  public chainWiseErrorStatus: Record<string, boolean> = {};
  private saveCachedBalancesDebounce: NodeJS.Timeout | null = null;

  constructor(
    private activeChainStore: ActiveChainStore,
    private selectedNetworkStore: SelectedNetworkStore,
    private addressStore: AddressStore,
    private priceStore: PriceStore,
    private rootDenomsStore: RootDenomsStore,
    private chainInfosStore: ChainInfosStore,
    private currencyStore: CurrencyStore,
    private coingeckoIdsStore: CoingeckoIdsStore,
    private storageAdapter: StorageAdapter,
    private aggregatedChainsStore: AggregatedChainsStore,
  ) {
    makeObservable(this, {
      balanceRecord: observable,
      solanaBalances: observable.deep,
      totalFiatValue: computed,
      balances: computed,
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
    if (chain === 'aggregated') {
      let isLoading = false;
      const allSolanaChains = Object.keys(this.chainInfosStore.chainInfos).filter(
        (chain) =>
          (network === 'testnet' ||
            this.chainInfosStore.chainInfos[chain as SupportedChain]?.chainId !==
              this.chainInfosStore.chainInfos[chain as SupportedChain]?.testnetChainId) &&
          isSolanaChain(chain),
      ) as SupportedChain[];
      for (const chain of allSolanaChains) {
        const balanceKey = this.getBalanceKey(chain, this.addressStore.addresses[chain], network);
        if (this.solanaBalances[balanceKey]) {
          const chainWiseLoadingStatus = this.solanaBalances[balanceKey] ? false : true;
          isLoading = isLoading || chainWiseLoadingStatus;
        }
      }
      return isLoading;
    }
    const balanceKey = this.getBalanceKey(
      chain,
      this.addressStore.addresses[chain],
      this.selectedNetworkStore.selectedNetwork,
    );
    if (this.solanaBalances[balanceKey]) {
      return this.solanaBalances[balanceKey] ? false : true;
    }
    return false;
  }

  getErrorStatusForChain(chain: SupportedChain, network: SelectedNetworkType, forceAddress?: string) {
    try {
      const balanceKey = this.getBalanceKey(chain, forceAddress || this.addressStore.addresses?.[chain], network);
      return this.chainWiseErrorStatus[balanceKey] ?? false;
    } catch (e) {
      return false;
    }
  }

  get balances() {
    const chain = this.activeChainStore.activeChain;
    const network = this.selectedNetworkStore.selectedNetwork;
    if (chain === 'aggregated') {
      const tokens: Token[] = [];
      const allChains = Object.keys(this.chainInfosStore.chainInfos).filter(
        (chain) =>
          (network === 'testnet' ||
            this.chainInfosStore.chainInfos[chain as SupportedChain]?.chainId !==
              this.chainInfosStore.chainInfos[chain as SupportedChain]?.testnetChainId) &&
          isSolanaChain(chain),
      );
      for (const chain of allChains) {
        const balanceKey = this.getBalanceKey(
          chain as SupportedChain,
          this.addressStore.addresses[chain as SupportedChain],
          network,
        );
        this.solanaBalances[balanceKey] && tokens.push(...this.solanaBalances[balanceKey]);
      }

      return sortTokenBalances(tokens);
    }
    const balanceKey = this.getBalanceKey(chain, this.addressStore.addresses[chain], network);
    return this.solanaBalances[balanceKey] ? sortTokenBalances(this.solanaBalances[balanceKey]) : [];
  }

  getAggregatedBalances(network: SelectedNetworkType, forceAddresses: Record<string, string> | undefined) {
    const allChains = Object.keys(this.chainInfosStore.chainInfos).filter(
      (chain) =>
        (network === 'testnet' ||
          this.chainInfosStore.chainInfos[chain as SupportedChain]?.chainId !==
            this.chainInfosStore.chainInfos[chain as SupportedChain]?.testnetChainId) &&
        isSolanaChain(chain),
    );
    const tokens: Token[] = [];
    for (const chain of allChains) {
      if (forceAddresses && !forceAddresses[chain as SupportedChain]) {
        continue;
      }

      const balanceKey = this.getBalanceKey(
        chain as SupportedChain,
        forceAddresses?.[chain as SupportedChain] || this.addressStore.addresses[chain as SupportedChain],
        network,
      );
      this.solanaBalances[balanceKey] && tokens.push(...this.solanaBalances[balanceKey]);
    }
    return sortTokenBalances(tokens);
  }

  getSolanaBalances = computedFn(
    (chain: SupportedChain, network: SelectedNetworkType, forceAddress: string | undefined) => {
      const balanceKey = this.getBalanceKey(chain, forceAddress || this.addressStore.addresses[chain], network);
      return this.solanaBalances[balanceKey] ?? [];
    },
  );

  async getChainData(chain: SupportedChain, network: SelectedNetworkType, forceRefetch = false, forceAddress?: string) {
    const address = forceAddress || this.addressStore.addresses[chain];
    if (!address || !isSolanaChain(chain)) {
      return;
    }

    const balanceKey = this.getBalanceKey(chain, address, network);

    if (this.solanaBalances[balanceKey] && !forceRefetch && this.chainWiseErrorStatus[balanceKey] === false) {
      return;
    }

    const solanaCoinDataStore = new SolanaCoinDataQueryStore(
      address,
      chain,
      this.priceStore,
      this.rootDenomsStore,
      network,
      this.coingeckoIdsStore,
      this.chainInfosStore,
      forceRefetch,
    );
    try {
      const _solanaBalances = await solanaCoinDataStore.getData();
      runInAction(() => {
        this.solanaBalances[balanceKey] = _solanaBalances;
        this.chainWiseErrorStatus[balanceKey] = solanaCoinDataStore.error ? true : false;
      });
    } catch (e) {
      console.log('here', e);
      runInAction(() => {
        this.solanaBalances[balanceKey] = [];
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
    if (!this.aggregatedChainsStore) return;

    if (_chain === 'aggregated') {
      const allSolanaChains = this.aggregatedChainsStore?.aggregatedChainsData?.filter(
        (chain) =>
          (network === 'testnet' ||
            this.chainInfosStore?.chainInfos?.[chain as SupportedChain]?.chainId !==
              this.chainInfosStore?.chainInfos?.[chain as SupportedChain]?.testnetChainId) &&
          isSolanaChain(chain),
      ) as SupportedChain[];

      await Promise.allSettled(
        allSolanaChains.map((chain) =>
          this.getChainData(chain, network, forceRefetch, forceAddresses?.[chain as SupportedChain]),
        ),
      );
      return;
    }

    await this.getChainData(_chain, network, forceRefetch, forceAddresses?.[_chain as SupportedChain]);
    return;
  }

  private getBalanceKey(
    _chain: SupportedChain,
    _address?: string,
    _network?: SelectedNetworkType,
    forceCurrency?: Currency,
  ): string {
    const address = _address ?? this.addressStore?.addresses?.[_chain];
    const chainId =
      _network === 'testnet'
        ? this.chainInfosStore.chainInfos?.[_chain]?.testnetChainId
        : this.chainInfosStore.chainInfos?.[_chain]?.chainId;
    const userPreferredCurrency = forceCurrency ?? this.currencyStore?.preferredCurrency;
    return `${chainId}-${address}-${userPreferredCurrency}`;
  }

  async updateCurrency(prevCurrency: Currency) {
    const network = this.selectedNetworkStore.selectedNetwork;
    const chain = this.activeChainStore.activeChain;

    if (chain === 'aggregated') {
      return this.updateAggregatedCurrency(network, prevCurrency);
    }
    return this.updateCurrencyForChain(chain, network, prevCurrency);
  }

  async updateCurrencyForChain(chain: SupportedChain, network: SelectedNetworkType, prevCurrency?: Currency) {
    const address = this.addressStore.addresses[chain];
    if (!address || !isSolanaChain(chain)) {
      return;
    }

    const oldBalanceKey = this.getBalanceKey(chain, address, network, prevCurrency);
    const balanceKey = this.getBalanceKey(chain, address, network);
    const existingBalances = this.solanaBalances[oldBalanceKey];

    if (!existingBalances || existingBalances.length === 0) {
      return;
    }

    try {
      const denoms = this.rootDenomsStore.allDenoms;
      const coingeckoPrices = this.priceStore.data;
      const coingeckoIds = this.coingeckoIdsStore.coingeckoIdsFromS3;

      const updatedBalances = existingBalances.map((token) => {
        const denomData = denoms[token.coinMinimalDenom];

        const coinGeckoId =
          token.coinGeckoId ||
          denomData?.coinGeckoId ||
          coingeckoIds[token.coinMinimalDenom] ||
          coingeckoIds[token.coinMinimalDenom?.toLowerCase()] ||
          '';

        const amount = token.amount;
        const chainId = this.chainInfosStore.chainInfos[chain]?.chainId;

        const { usdValue, usdPrice } = calculateTokenPriceAndValue({
          amount,
          coingeckoPrices,
          coinMinimalDenom: token.coinMinimalDenom,
          chainId,
          coinGeckoId,
        });

        return {
          ...token,
          usdValue,
          usdPrice,
        };
      });

      runInAction(() => {
        this.solanaBalances[balanceKey] = updatedBalances;
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
      console.error(`Error updating currency for solana chain ${chain}`, error);
      runInAction(() => {
        this.chainWiseErrorStatus[balanceKey] = true;
      });
    }
  }

  async updateAggregatedCurrency(network: SelectedNetworkType, prevCurrency: Currency) {
    const allSolanaChains = Object.keys(this.chainInfosStore.chainInfos).filter(
      (chain) =>
        (network === 'testnet' ||
          this.chainInfosStore.chainInfos[chain as SupportedChain]?.chainId !==
            this.chainInfosStore.chainInfos[chain as SupportedChain]?.testnetChainId) &&
        isSolanaChain(chain),
    ) as SupportedChain[];

    await Promise.allSettled(allSolanaChains.map((chain) => this.updateCurrencyForChain(chain, network, prevCurrency)));
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
      await this.storageAdapter.set(CACHED_SOLANA_BALANCES_KEY, toJS(this.solanaBalances), 'idb');
    } catch (e) {
      //
    }
  }

  private async initCachedBalances() {
    try {
      const cachedBalances = await this.storageAdapter.get<Record<string, Token[]>>(CACHED_SOLANA_BALANCES_KEY, 'idb');
      if (!cachedBalances) {
        return;
      }

      runInAction(() => {
        this.solanaBalances = cachedBalances;
      });
    } catch (e) {
      //
    }
  }

  clearCachedBalancesForChain(chain: SupportedChain, address?: string, forceCurrency?: Currency) {
    try {
      const balanceKey = this.getBalanceKey(chain, address, 'mainnet', forceCurrency);
      if (this.solanaBalances?.[balanceKey]) {
        runInAction(() => {
          delete this.solanaBalances[balanceKey];
        });
      }
    } catch (e) {
      //
    }
    try {
      const balanceKey = this.getBalanceKey(chain, address, 'testnet', forceCurrency);
      if (this.solanaBalances?.[balanceKey]) {
        runInAction(() => {
          delete this.solanaBalances[balanceKey];
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
