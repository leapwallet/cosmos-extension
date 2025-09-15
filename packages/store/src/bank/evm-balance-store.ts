import {
  denoms as DefaultDenoms,
  fetchSeiEvmBalances,
  NativeDenom,
  pubKeyToEvmAddressToShow,
  SupportedChain,
  SupportedDenoms,
} from '@leapwallet/cosmos-wallet-sdk';
import BigNumber from 'bignumber.js';
import { computed, makeAutoObservable, runInAction, toJS } from 'mobx';
import { computedFn } from 'mobx-utils';

import {
  AggregatedChainsStore,
  ChainInfosStore,
  CoingeckoIdsStore,
  CompassSeiEvmConfigStore,
  NmsStore,
  RootDenomsStore,
} from '../assets';
import {
  AggregatedSupportedChainType,
  Currency,
  LoadingStatusType,
  SelectedNetworkType,
  StorageAdapter,
} from '../types';
import { balanceCalculator } from '../utils';
import { calculateTokenPriceAndValue } from '../utils/bank/price-calculator';
import { ActiveChainStore, AddressStore, CurrencyStore, SelectedNetworkStore } from '../wallet';
import { sortTokenBalances } from './balance-calculator';
import { Token } from './balance-types';
import { EVMBalanceAPIStore } from './evm-balance-api-store';
import { PriceStore } from './price-store';

export const CACHED_EVM_BALANCES_KEY = 'cached-evm-balances';

export class EvmBalanceStore {
  activeChainStore: ActiveChainStore;
  selectedNetworkStore: SelectedNetworkStore;
  addressStore: AddressStore;
  chainInfosStore: ChainInfosStore;
  compassSeiEvmConfigStore: CompassSeiEvmConfigStore;
  rootDenomsStore: RootDenomsStore;
  storageAdapter: StorageAdapter;
  priceStore: PriceStore;
  nmsStore: NmsStore;
  aggregatedChainsStore: AggregatedChainsStore;
  evmBalanceApiStore: EVMBalanceAPIStore;
  currencyStore: CurrencyStore;
  coingeckoIdsStore: CoingeckoIdsStore;
  saveCachedBalancesDebounce: NodeJS.Timeout | null = null;
  aggregatedLoadingStatus: boolean = false;

  chainWiseEvmBalance: { [key: string]: Token[] } = {};
  chainWiseEvmStatus: { [key: string]: LoadingStatusType } = {};

  constructor(
    activeChainStore: ActiveChainStore,
    selectedNetworkStore: SelectedNetworkStore,
    addressStore: AddressStore,
    chainInfosStore: ChainInfosStore,
    compassSeiEvmConfigStore: CompassSeiEvmConfigStore,
    rootDenomsStore: RootDenomsStore,
    storageAdapter: StorageAdapter,
    priceStore: PriceStore,
    aggregatedChainsStore: AggregatedChainsStore,
    nmsStore: NmsStore,
    evmBalanceApiStore: EVMBalanceAPIStore,
    currencyStore: CurrencyStore,
    coingeckoIdsStore: CoingeckoIdsStore,
  ) {
    makeAutoObservable(this, {
      evmBalance: computed,
      totalFiatValue: computed,
      loading: computed,
    });
    this.activeChainStore = activeChainStore;
    this.selectedNetworkStore = selectedNetworkStore;
    this.addressStore = addressStore;
    this.chainInfosStore = chainInfosStore;
    this.compassSeiEvmConfigStore = compassSeiEvmConfigStore;
    this.rootDenomsStore = rootDenomsStore;
    this.storageAdapter = storageAdapter;
    this.priceStore = priceStore;
    this.aggregatedChainsStore = aggregatedChainsStore;
    this.nmsStore = nmsStore;
    this.evmBalanceApiStore = evmBalanceApiStore;
    this.currencyStore = currencyStore;
    this.coingeckoIdsStore = coingeckoIdsStore;

    this.initCachedBalances();
  }

  get evmBalance() {
    return this.evmBalanceForChain(this.activeChainStore.activeChain, this.selectedNetworkStore.selectedNetwork);
  }

  get loading() {
    const balanceKey = this.getBalanceKey(this.activeChainStore.activeChain, this.selectedNetworkStore.selectedNetwork);
    return !['success', 'error'].includes(this.chainWiseEvmStatus[balanceKey] ?? 'success');
  }

  get status() {
    const balanceKey = this.getBalanceKey(this.activeChainStore.activeChain, this.selectedNetworkStore.selectedNetwork);
    return this.chainWiseEvmStatus[balanceKey] ?? 'success';
  }

  get totalFiatValue() {
    let totalFiatValue = new BigNumber(0);
    const balances = this.evmBalance;

    for (const asset of balances) {
      if (asset.usdValue) {
        totalFiatValue = totalFiatValue.plus(new BigNumber(asset.usdValue));
      }
    }
    return totalFiatValue;
  }

  evmBalanceForChain(
    chain: AggregatedSupportedChainType,
    network?: SelectedNetworkType,
    forceAddresses?: Record<string, string>,
  ) {
    if (chain === 'aggregated') {
      let allTokens: Token[] = [];
      const activeNetwork = network ?? this.selectedNetworkStore.selectedNetwork;
      const chains = Object.keys(this.chainInfosStore?.chainInfos)?.filter(
        (chain) =>
          activeNetwork === 'testnet' ||
          this.chainInfosStore.chainInfos[chain as SupportedChain]?.chainId !==
            this.chainInfosStore.chainInfos[chain as SupportedChain]?.testnetChainId,
      );

      chains.forEach((chain) => {
        if (forceAddresses && !forceAddresses[chain as SupportedChain]) {
          return [];
        }

        const balanceKey = this.getBalanceKey(chain as SupportedChain, network, forceAddresses?.[chain]);
        const evmTokens = this.chainWiseEvmBalance[balanceKey] ?? [];
        allTokens = allTokens.concat(evmTokens);
      });

      return sortTokenBalances(allTokens);
    }

    if (forceAddresses && !forceAddresses[chain as SupportedChain]) {
      return [];
    }

    const balanceKey = this.getBalanceKey(chain, network, forceAddresses?.[chain]);
    return this.chainWiseEvmBalance[balanceKey] ?? [];
  }

  loadingForChain = computedFn(
    (
      chain: AggregatedSupportedChainType,
      network: SelectedNetworkType | undefined,
      forceAddresses: Record<string, string> | undefined,
    ) => {
      const balanceKey = this.getBalanceKey(chain, network, forceAddresses?.[chain]);
      return !['success', 'error'].includes(this.chainWiseEvmStatus[balanceKey] ?? 'success');
    },
  );

  statusForChain = computedFn(
    (
      chain: AggregatedSupportedChainType,
      network: SelectedNetworkType | undefined,
      forceAddresses: Record<string, string> | undefined,
    ) => {
      const balanceKey = this.getBalanceKey(chain, network, forceAddresses?.[chain]);
      return this.chainWiseEvmStatus[balanceKey] ?? 'success';
    },
  );

  getTotalFiatValue = computedFn(
    (chain: AggregatedSupportedChainType, network: SelectedNetworkType, forceAddresses: Record<string, string>) => {
      const evmBalance = this.evmBalanceForChain(chain, network, forceAddresses);
      let totalFiatValue = new BigNumber(0);

      for (const asset of evmBalance) {
        if (asset.usdValue) {
          totalFiatValue = totalFiatValue.plus(new BigNumber(asset.usdValue));
        }
      }
      return totalFiatValue;
    },
  );

  updateCurrency(prevCurrency: Currency) {
    const network = this.selectedNetworkStore.selectedNetwork;
    const chain = this.activeChainStore.activeChain;

    if (chain === 'aggregated') {
      return this.updateAggregatedCurrency(network, prevCurrency);
    }
    return this.updateCurrencyForChain(chain as SupportedChain, network, prevCurrency);
  }

  async updateCurrencyForChain(chain: SupportedChain, network: SelectedNetworkType, prevCurrency: Currency) {
    const oldBalanceKey = this.getBalanceKey(chain, network, undefined, prevCurrency);
    const balanceKey = this.getBalanceKey(chain, network);
    try {
      runInAction(() => {
        this.chainWiseEvmStatus[balanceKey] = 'loading';
      });
      const chainInfo = this.chainInfosStore.chainInfos[chain as SupportedChain];
      const denoms = this.rootDenomsStore.allDenoms;
      const _nativeTokenKey = Object.keys(chainInfo?.nativeDenoms ?? {})?.[0];
      const nativeToken =
        denoms[_nativeTokenKey] ??
        DefaultDenoms[_nativeTokenKey as SupportedDenoms] ??
        chainInfo?.nativeDenoms?.[_nativeTokenKey];

      const formattedBalances: Token[] = [];
      Object.values(this.chainWiseEvmBalance[oldBalanceKey] ?? {}).map((token) => {
        const newVal = this.formatBalance({ amount: token.amount, denom: token.coinMinimalDenom }, chain, nativeToken);
        if (newVal) {
          formattedBalances.push(newVal);
        }
      });

      runInAction(() => {
        this.chainWiseEvmBalance[balanceKey] = formattedBalances;
        this.chainWiseEvmStatus[balanceKey] = 'success';
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
      console.log(error);

      runInAction(() => {
        this.chainWiseEvmStatus[balanceKey] = 'error';
      });
    }
  }

  async updateAggregatedCurrency(network: SelectedNetworkType, prevCurrency: Currency) {
    await this.aggregatedChainsStore.readyPromise;
    const filteredChains = this.aggregatedChainsStore.aggregatedChainsData?.filter(
      (chain) =>
        (network === 'testnet' ||
          this.chainInfosStore.chainInfos[chain as SupportedChain]?.chainId !==
            this.chainInfosStore.chainInfos[chain as SupportedChain]?.testnetChainId) &&
        (this.chainInfosStore.chainInfos[chain as SupportedChain].evmOnlyChain ||
          this.activeChainStore.isSeiEvm(chain)),
    );
    if (filteredChains && filteredChains.length > 0) {
      await Promise.all(
        filteredChains.map((chain) => {
          this.updateCurrencyForChain(chain as SupportedChain, network, prevCurrency);
        }),
      );
    }
  }

  async fetchEvmBalance(
    chain: SupportedChain,
    network: SelectedNetworkType,
    refetch = false,
    forceFallback = false,
    forceAddress?: string,
  ) {
    const isSeiEvmChain = this.activeChainStore.isSeiEvm(chain);
    const chainInfo = this.chainInfosStore?.chainInfos?.[chain as SupportedChain];
    const isEvmChain = isSeiEvmChain || chainInfo?.evmOnlyChain;

    const evmBalance: Token[] = [];

    const balanceKey = this.getBalanceKey(chain, network, forceAddress);

    if (!refetch && this.chainWiseEvmBalance[balanceKey] && this.chainWiseEvmStatus[balanceKey] === 'success') {
      return;
    }

    runInAction(() => {
      this.chainWiseEvmStatus[balanceKey] = 'loading';
    });

    try {
      if (isEvmChain) {
        const denoms = this.rootDenomsStore.allDenoms;
        const _nativeTokenKey = Object.keys(chainInfo?.nativeDenoms ?? {})?.[0];
        const nativeToken =
          denoms[_nativeTokenKey] ??
          DefaultDenoms[_nativeTokenKey as SupportedDenoms] ??
          chainInfo?.nativeDenoms?.[_nativeTokenKey];

        const pubKey = this.addressStore.pubKeys?.[chain];
        const chainId =
          (network === 'testnet'
            ? this.chainInfosStore.chainInfos?.[chain]?.evmChainIdTestnet
            : this.chainInfosStore.chainInfos?.[chain]?.evmChainId) ?? '';

        if (!forceFallback) {
          const ethWalletAddress =
            forceAddress || pubKeyToEvmAddressToShow(pubKey, true) || this.addressStore.addresses?.[chain];
          const { nativeBalances, useFallbackNative } = await this.evmBalanceApiStore.fetchChainBalanceFromAPI(
            chain,
            network,
            ethWalletAddress,
            refetch,
          );

          if (!useFallbackNative) {
            runInAction(() => {
              this.chainWiseEvmBalance[balanceKey] = nativeBalances;
              this.chainWiseEvmStatus[balanceKey] = 'success';
            });
            await this.saveCachedBalances();
            return;
          }
        }

        await this.nmsStore.readyPromise;

        const hasEntryInNms = this.nmsStore?.rpcEndPoints?.[chainId] && this.nmsStore.rpcEndPoints[chainId].length > 0;

        let evmJsonRpcUrl: string | undefined;
        if (hasEntryInNms) {
          evmJsonRpcUrl = this.nmsStore.rpcEndPoints[chainId][0].nodeUrl;
        }
        if (!evmJsonRpcUrl) {
          evmJsonRpcUrl =
            network === 'testnet'
              ? chainInfo.apis.evmJsonRpcTest ?? chainInfo.apis.evmJsonRpc
              : chainInfo.apis.evmJsonRpc;
        }

        const fetchEvmBalance = async () => {
          const ethWalletAddress = pubKeyToEvmAddressToShow(pubKey, true) || this.addressStore.addresses?.[chain];

          if (ethWalletAddress.startsWith('0x') && evmJsonRpcUrl) {
            const balance = await fetchSeiEvmBalances(evmJsonRpcUrl, ethWalletAddress);
            await Promise.all([this.waitForPriceStore(), this.waitForCoingeckoIdsStore()]);
            const formattedBalance = this.formatBalance(balance, chain, nativeToken);
            evmBalance.push(formattedBalance);
          }
        };

        const storedLinkedAddressState = await this.storageAdapter.get('sei-evm-linked-address-state');
        if (isSeiEvmChain && storedLinkedAddressState) {
          const linkedAddressState = JSON.parse(storedLinkedAddressState);
          const address = this.addressStore.addresses?.[chain];

          if (linkedAddressState[address]?.[chain]?.[network] !== 'done') {
            await fetchEvmBalance();
          }
        } else {
          await fetchEvmBalance();
        }
      }

      runInAction(() => {
        this.chainWiseEvmBalance[balanceKey] = evmBalance;
        this.chainWiseEvmStatus[balanceKey] = 'success';
      });
    } catch (_) {
      runInAction(() => {
        this.chainWiseEvmBalance[balanceKey] = evmBalance;
        this.chainWiseEvmStatus[balanceKey] = 'error';
      });
    }
    await this.saveCachedBalances();
  }

  async fetchAggregatedBalances(
    network: SelectedNetworkType,
    refetch = false,
    forceAddresses?: Record<string, string>,
  ) {
    runInAction(() => {
      this.aggregatedLoadingStatus = true;
    });

    const allEvmChains: SupportedChain[] = [];
    const supportedChainWiseAddresses: Partial<Record<SupportedChain, string>> = {};
    await this.aggregatedChainsStore.readyPromise;
    this.aggregatedChainsStore.aggregatedChainsData
      .filter(
        (chain) =>
          (network === 'testnet' ||
            this.chainInfosStore.chainInfos[chain as SupportedChain]?.chainId !==
              this.chainInfosStore.chainInfos[chain as SupportedChain]?.testnetChainId) &&
          this.chainInfosStore.chainInfos[chain as SupportedChain]?.evmOnlyChain,
      )
      .forEach((chain) => {
        const balanceKey = this.getBalanceKey(chain as SupportedChain, network, forceAddresses?.[chain]);
        if (this.chainWiseEvmBalance[balanceKey] && !refetch && this.chainWiseEvmStatus[balanceKey] === 'success') {
          runInAction(() => {
            this.chainWiseEvmStatus[balanceKey] = this.chainWiseEvmStatus[balanceKey] ?? 'success';
          });
          return;
        }
        const pubKey = this.addressStore.pubKeys?.[chain];
        const ethWalletAddress =
          forceAddresses?.[chain] || pubKeyToEvmAddressToShow(pubKey, true) || this.addressStore.addresses?.[chain];
        if (!ethWalletAddress) {
          return;
        }
        allEvmChains.push(chain as SupportedChain);
        supportedChainWiseAddresses[chain as SupportedChain] = ethWalletAddress;
      });

    if (Object.keys(supportedChainWiseAddresses).length === 0) {
      runInAction(() => {
        this.aggregatedLoadingStatus = false;
      });
      return;
    }

    const balances = await this.evmBalanceApiStore.fetchAggregatedBalanceFromAPI(
      supportedChainWiseAddresses,
      network,
      refetch,
    );
    const chainsToUseFallbackFor: SupportedChain[] = [];

    allEvmChains.forEach((chain) => {
      const balanceKey = this.getBalanceKey(chain, network, forceAddresses?.[chain]);
      if (balances[chain as SupportedChain]?.useFallbackNative) {
        chainsToUseFallbackFor.push(chain);
        return;
      }
      runInAction(() => {
        this.chainWiseEvmBalance[balanceKey] = balances[chain as SupportedChain]?.nativeBalances ?? [];
        this.chainWiseEvmStatus[balanceKey] = 'success';
      });
    });
    await this.saveCachedBalances();

    if (chainsToUseFallbackFor.length > 0) {
      await Promise.allSettled(
        this.aggregatedChainsStore.aggregatedChainsData.map((chain) =>
          this.fetchEvmBalance(chain as SupportedChain, network, refetch, true, forceAddresses?.[chain]),
        ),
      );
    }

    runInAction(() => {
      this.aggregatedLoadingStatus = false;
    });
    return;
  }

  loadEvmBalance(
    _chain?: AggregatedSupportedChainType,
    _network?: SelectedNetworkType,
    refetch = false,
    forceFallback = false,
    forceAddresses?: Record<string, string>,
  ) {
    const chain = _chain || this.activeChainStore.activeChain;
    const network = _network || this.selectedNetworkStore.selectedNetwork;
    if (chain === 'aggregated') {
      return this.fetchAggregatedBalances(network, refetch, forceAddresses);
    }

    return this.fetchEvmBalance(chain, network, refetch, forceFallback, forceAddresses?.[chain]);
  }

  getErrorStatusForChain(chain: SupportedChain, network: SelectedNetworkType, forceAddresses?: Record<string, string>) {
    const balanceKey = this.getBalanceKey(chain, network, forceAddresses?.[chain]);
    return this.chainWiseEvmStatus[balanceKey] === 'error';
  }

  getAggregatedEvmTokens = computedFn(
    (network: SelectedNetworkType, forceAddresses: Record<string, string> | undefined) => {
      let allTokens: Token[] = [];
      const chains = Object.keys(this.chainInfosStore?.chainInfos)?.filter(
        (chain) =>
          network === 'testnet' ||
          this.chainInfosStore.chainInfos[chain as SupportedChain]?.chainId !==
            this.chainInfosStore.chainInfos[chain as SupportedChain]?.testnetChainId,
      );

      chains.forEach((chain) => {
        if (forceAddresses && !forceAddresses[chain as SupportedChain]) {
          return;
        }

        const balanceKey = this.getBalanceKey(chain as SupportedChain, network, forceAddresses?.[chain]);
        const evmTokens = this.chainWiseEvmBalance[balanceKey] ?? [];
        allTokens = allTokens.concat(evmTokens);
      });

      return sortTokenBalances(allTokens);
    },
  );

  formatBalance(balance: { amount: string; denom: string }, chain: SupportedChain, nativeToken: NativeDenom) {
    const chainInfos = this.chainInfosStore.chainInfos;
    const chainInfo = chainInfos[chain];

    const coingeckoPrices = this.priceStore.data;
    const coingeckoIds = this.coingeckoIdsStore.coingeckoIdsFromS3;
    const coinGeckoId =
      nativeToken?.coinGeckoId ||
      coingeckoIds[nativeToken?.coinMinimalDenom] ||
      coingeckoIds[nativeToken?.coinMinimalDenom?.toLowerCase()] ||
      '';

    const { usdValue } = calculateTokenPriceAndValue({
      amount: balance.amount,
      coingeckoPrices,
      coinMinimalDenom: nativeToken?.coinMinimalDenom,
      chainId: (this.chainInfosStore.chainInfos?.[nativeToken?.chain as SupportedChain] ?? chainInfo).chainId,
      coinGeckoId,
    });

    const usdPrice =
      parseFloat(balance.amount) > 0 && usdValue ? (parseFloat(usdValue) / parseFloat(balance.amount)).toString() : '0';

    return {
      chain: nativeToken?.chain ?? '',
      name: nativeToken?.name,
      amount: balance.amount,
      symbol: nativeToken?.coinDenom,
      usdValue: usdValue ?? '',
      coinMinimalDenom: nativeToken?.coinMinimalDenom,
      img: nativeToken?.icon,
      ibcDenom: '',
      usdPrice,
      coinDecimals: nativeToken?.coinDecimals,
      coinGeckoId,
      tokenBalanceOnChain: chain,
      isEvm: true,
    };
  }

  private getBalanceKey(
    chain: AggregatedSupportedChainType,
    forceNetwork?: SelectedNetworkType,
    forceAddress?: string,
    forceCurrency?: Currency,
  ): string {
    const chainKey = this.getChainKey(chain as SupportedChain, forceNetwork);
    const address =
      forceAddress ||
      pubKeyToEvmAddressToShow(this.addressStore?.pubKeys?.[chain], true) ||
      this.addressStore?.addresses?.[chain as SupportedChain];
    const userPreferredCurrency = forceCurrency ?? this.currencyStore?.preferredCurrency;

    return `${chainKey}-${address}-${userPreferredCurrency}`;
  }

  private getChainKey(chain: AggregatedSupportedChainType, forceNetwork?: SelectedNetworkType): string {
    const network = forceNetwork ?? this.selectedNetworkStore?.selectedNetwork;
    if (chain === 'aggregated') return `aggregated-${network}`;

    const chainId =
      network === 'testnet'
        ? this.chainInfosStore.chainInfos?.[chain]?.testnetChainId
        : this.chainInfosStore.chainInfos?.[chain]?.chainId;
    return `${chain}-${chainId}`;
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
      await this.storageAdapter.set(CACHED_EVM_BALANCES_KEY, toJS(this.chainWiseEvmBalance), 'idb');
    } catch (e) {
      //
    }
  }

  private async initCachedBalances() {
    try {
      const cachedBalances = await this.storageAdapter.get<Record<string, Token[]>>(CACHED_EVM_BALANCES_KEY, 'idb');
      if (!cachedBalances) {
        return;
      }

      runInAction(() => {
        this.chainWiseEvmBalance = cachedBalances;
      });
    } catch (e) {
      //
    }
  }

  clearCachedBalancesForChain(chain: SupportedChain, address?: string, forceCurrency?: Currency) {
    try {
      const balanceKey = this.getBalanceKey(chain, 'mainnet', address, forceCurrency);
      if (this.chainWiseEvmBalance?.[balanceKey]) {
        runInAction(() => {
          delete this.chainWiseEvmBalance[balanceKey];
        });
      }
    } catch (e) {
      //
    }
    try {
      const balanceKey = this.getBalanceKey(chain, 'testnet', address, forceCurrency);
      if (this.chainWiseEvmBalance?.[balanceKey]) {
        runInAction(() => {
          delete this.chainWiseEvmBalance[balanceKey];
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
