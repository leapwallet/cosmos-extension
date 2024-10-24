import { axiosWrapper, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import BigNumber from 'bignumber.js';
import { computed, makeAutoObservable, makeObservable, reaction, runInAction } from 'mobx';
import { computedFn } from 'mobx-utils';
import { AggregatedSupportedChainType, SelectedNetworkType } from 'types';
import { ActiveChainStore, CurrencyStore } from 'wallet';
import { SelectedNetworkStore } from 'wallet/selected-network-store';

import { AggregatedChainsStore, ChainInfosStore, getIbcTraceData, NmsStore, RootDenomsStore } from '../assets';
import { BaseQueryStore } from '../base/base-data-store';
import { getNativeDenom } from '../utils';
import { fromSmall } from '../utils/balance-converter';
import { chainIdToChainName } from '../utils/chain-id-chain-name-map';
import { getKeyToUseForDenoms } from '../utils/get-denom-key';
import { generateRandomString } from '../utils/random-string-generator';
import { AddressStore } from '../wallet/address-store';
import { sortTokenBalances } from './balance-calculator';
import { Token } from './balance-types';

export class PriceStore extends BaseQueryStore<Record<string, number>> {
  prices: Record<string, number> = {};
  readyPromise: Promise<void>;
  currencyStore: CurrencyStore;

  constructor(currencyStore: CurrencyStore) {
    super();
    makeObservable(this);
    this.currencyStore = currencyStore;
    this.readyPromise = this.initialize();

    reaction(
      () => this.currencyStore.preferredCurrency,
      () => {
        this.refetchData();
      },
    );
  }

  async initialize() {
    await this.currencyStore.readyPromise;
    this.getData();
  }

  async fetchData() {
    const preferredCurrency = this.currencyStore.preferredCurrency;
    const priceUrl = `https://api.leapwallet.io/market/prices/ecosystem?currency=${preferredCurrency}&ecosystem=cosmos-ecosystem`;
    const response = await fetch(priceUrl);
    const data = await response.json();
    return data;
  }
}

interface IRawBalanceResponse {
  balances: Array<{ amount: string; denom: string }>;
  pagination: { next_key: any; total: string };
}

export class RawBalanceStore extends BaseQueryStore<IRawBalanceResponse> {
  chain: SupportedChain;
  restUrl: string;
  type: 'balances' | 'spendable_balances';
  address: string;

  constructor(restUrl: string, address: string, chain: SupportedChain, type: 'balances' | 'spendable_balances') {
    super();
    makeObservable(this);
    this.restUrl = restUrl;
    this.address = address;
    this.type = type;
    this.chain = chain;
  }

  async fetchData() {
    const res = await axiosWrapper({
      baseURL: this.restUrl,
      method: 'get',
      url: `/cosmos/bank/v1beta1/${this.type}/${this.address}?pagination.limit=1000`,
    });
    const response = res.data;
    return response;
  }
}

export class BalanceStore {
  priceStore: PriceStore;
  nmsStore: NmsStore;
  addressStore: AddressStore;
  rootDenomsStore: RootDenomsStore;
  rawBalances: any = {};
  chainInfosStore: ChainInfosStore;
  aggregatedChainsStore: AggregatedChainsStore;
  activeChainStore: ActiveChainStore;
  loading: boolean = false;
  displayedAssets: Array<Token> = [];
  chainWiseBalances: Record<string, Array<Token>> = {};
  chainWiseSpendableBalances: Record<string, Array<Token>> = {};
  selectedNetworkStore: SelectedNetworkStore;
  chainWiseLoadingStates: Record<string, boolean> = {};
  rawBalanceStores: Record<string, RawBalanceStore> = {};
  rawSpendableBalanceStores: Record<string, RawBalanceStore> = {};

  aggregateBalanceVisible: boolean = false;
  chainsWithoutSpendableBalance: Array<SupportedChain> = ['thorchain'];

  constructor(
    addressStore: AddressStore,
    priceStore: PriceStore,
    nmsStore: NmsStore,
    rootDenomsStore: RootDenomsStore,
    chainInfoStore: ChainInfosStore,
    aggregatedChainsStore: AggregatedChainsStore,
    activeChainStore: ActiveChainStore,
    selectedNetworkStore: SelectedNetworkStore,
  ) {
    makeAutoObservable(this, {
      totalFiatValue: computed,
      balances: computed,
      spendableBalances: computed,
      loadingStatus: computed,
    });
    this.addressStore = addressStore;
    this.priceStore = priceStore;
    this.nmsStore = nmsStore;
    this.rootDenomsStore = rootDenomsStore;
    this.chainInfosStore = chainInfoStore;
    this.aggregatedChainsStore = aggregatedChainsStore;
    this.activeChainStore = activeChainStore;
    this.selectedNetworkStore = selectedNetworkStore;
  }

  getBalancesForChain = computedFn((chain: SupportedChain, network: SelectedNetworkType) => {
    const balanceKey = this.getBalanceKey(chain, network);
    return this.chainWiseBalances?.[balanceKey] ?? [];
  });

  getSpendableBalancesForChain = computedFn((chain: SupportedChain, network: SelectedNetworkType) => {
    const balanceKey = this.getBalanceKey(chain, network);
    const balanceSource = this.getDefaultBalanceSource('chainWiseSpendableBalances', chain);
    return this[balanceSource]?.[balanceKey] ?? [];
  });

  getLoadingStatusForChain = computedFn((chain: SupportedChain, network: SelectedNetworkType) => {
    const balanceKey = this.getBalanceKey(chain, network);
    return this.chainWiseLoadingStates?.[balanceKey] ?? true;
  });

  get balances() {
    return this.getTokens('chainWiseBalances');
  }

  get spendableBalances() {
    return this.getTokens('chainWiseSpendableBalances');
  }

  get aggregatedSpendableBalances() {
    return this.getTokens('chainWiseSpendableBalances', 'aggregated');
  }

  getAggregatedBalances = computedFn((network: SelectedNetworkType) => {
    return this.getTokens('chainWiseBalances', 'aggregated', network);
  });

  getAggregatedSpendableBalances = computedFn((network: SelectedNetworkType) => {
    return this.getTokens('chainWiseSpendableBalances', 'aggregated', network);
  });

  get loadingStatus() {
    const chain = this.activeChainStore?.activeChain;
    if (chain === 'aggregated') {
      return this.loading;
    }
    const balanceKey = this.getBalanceKey(chain as SupportedChain);
    return this.chainWiseLoadingStates?.[balanceKey] ?? true;
  }

  async initialize() {
    await Promise.all([
      this.addressStore.readyPromise,
      this.priceStore.readyPromise,
      this.nmsStore.readyPromise,
      this.rootDenomsStore.readyPromise,
      this.aggregatedChainsStore.readyPromise,
      this.activeChainStore.readyPromise,
      this.selectedNetworkStore.readyPromise,
    ]);

    if (this.addressStore.addresses) {
      this.loadBalances();
    }
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

  async refetchChainBalance(chain: SupportedChain, network?: SelectedNetworkType) {
    const balanceKey = this.getBalanceKey(chain, network);
    this.chainWiseLoadingStates[balanceKey] = true;
    await this.fetchChainBalance(chain, network, true);
  }

  async fetchChainBalance(chain: SupportedChain, _network?: SelectedNetworkType, forceRefetch = false) {
    const network = _network || this.selectedNetworkStore.selectedNetwork;
    const chainId =
      network === 'testnet'
        ? this.chainInfosStore.chainInfos[chain].testnetChainId
        : this.chainInfosStore.chainInfos[chain].chainId;

    if (!chainId || this.chainInfosStore.chainInfos[chain]?.evmOnlyChain) return;
    const nodeUrlKey = network === 'testnet' ? 'restTest' : 'rest';
    const hasEntryInNms = this.nmsStore.restEndpoints[chainId] && this.nmsStore.restEndpoints[chainId].length > 0;
    const address = this.addressStore.addresses[chain];

    const balanceKey = this.getBalanceKey(chain, network);
    if (!address) {
      runInAction(() => {
        this.chainWiseLoadingStates[balanceKey] = false;
      });
      return;
    }

    try {
      const restUrl = hasEntryInNms
        ? this.nmsStore.restEndpoints[chainId][0].nodeUrl
        : this.chainInfosStore.chainInfos[chain].apis[nodeUrlKey];

      if (!restUrl) {
        throw new Error('No rest url found');
      }

      if (!this.rawBalanceStores[balanceKey]) {
        const rawBalanceStore = new RawBalanceStore(restUrl, address, chain, 'balances');
        this.rawBalanceStores[balanceKey] = rawBalanceStore;
      }
      if (!this.rawSpendableBalanceStores[balanceKey]) {
        const rawSpendableBalanceStore = new RawBalanceStore(restUrl, address, chain, 'spendable_balances');
        this.rawSpendableBalanceStores[balanceKey] = rawSpendableBalanceStore;
      }
      const rawBalanceStore = this.rawBalanceStores[balanceKey];
      const rawSpendableBalanceStore = this.rawSpendableBalanceStores[balanceKey];

      let formattedBalances: Array<Token> = [];
      let formattedSpendableBalances: Array<Token> = [];

      try {
        const rawBalance = forceRefetch ? await rawBalanceStore.refetchData() : await rawBalanceStore.getData();
        formattedBalances = this.formatBalance(rawBalance.balances, chain, network);
      } catch (e) {
        console.error('unable to load balances', e, balanceKey);
      }
      if (!this.chainsWithoutSpendableBalance.includes(chain)) {
        try {
          const rawSpendableBalance = forceRefetch
            ? await rawSpendableBalanceStore.refetchData()
            : await rawSpendableBalanceStore.getData();
          formattedSpendableBalances = this.formatBalance(rawSpendableBalance.balances, chain, network);
        } catch (e) {
          console.error('unable to load spendable balances', e, balanceKey);
        }
      }

      runInAction(() => {
        this.chainWiseSpendableBalances[balanceKey] = formattedSpendableBalances;
        this.chainWiseBalances[balanceKey] = formattedBalances;
        this.chainWiseLoadingStates[balanceKey] = rawBalanceStore.isLoading || rawSpendableBalanceStore.isLoading;
        this.aggregateBalanceVisible = true;
      });
    } catch (e) {
      runInAction(() => {
        this.chainWiseLoadingStates[balanceKey] = false;
      });
      console.error('unable to load balances', e, balanceKey);
    }
  }

  async loadBalances(_chain?: AggregatedSupportedChainType, forceNetwork?: SelectedNetworkType, forceRefetch = false) {
    const network = forceNetwork ?? this.selectedNetworkStore.selectedNetwork;
    const chain = _chain || this.activeChainStore.activeChain;
    if (chain === 'aggregated') {
      this.aggregateBalanceVisible = false;
      this.fetchAggregatedBalances(network, forceRefetch);
    } else {
      this.fetchChainBalance(chain as SupportedChain, network, forceRefetch);
    }
  }

  async fetchAggregatedBalances(network: SelectedNetworkType, forceRefetch = false) {
    this.loading = true;
    const loadBalanceParams: Array<[string, string, SupportedChain]> = [];

    Object.entries(this.nmsStore.restEndpoints).forEach(([key, value]) => {
      const chainId = key;
      if (value && value.length > 0) {
        const restEndpoint = value[0].nodeUrl;
        const chainName = chainIdToChainName[chainId] as SupportedChain;
        const chainInfos = this.chainInfosStore.chainInfos;
        if (
          this.aggregatedChainsStore.aggregatedChainsData.includes(chainName) &&
          chainInfos[chainName].testnetChainId !== chainId
        ) {
          loadBalanceParams.push([restEndpoint, this.addressStore.addresses[chainName], chainName as SupportedChain]);
        }
      }
    });

    let completedRequests = 0;
    const totalRequests = loadBalanceParams.length;

    this.aggregatedChainsStore.aggregatedChainsData.forEach((chain) => {
      const balanceKey = this.getBalanceKey(chain as SupportedChain, network);
      runInAction(() => {
        this.chainWiseLoadingStates[balanceKey] = true;
      });

      this.fetchChainBalance(chain as SupportedChain, network, forceRefetch)
        .catch((e) => {
          completedRequests += 1;
        })
        .finally(() => {
          completedRequests += 1;
          runInAction(() => {
            if (completedRequests === totalRequests) {
              this.loading = false;
            }
          });
        });
    });
  }

  private formatBalance(
    balances: Array<{ amount: string; denom: string }>,
    chain: SupportedChain,
    network: SelectedNetworkType,
  ) {
    const chainInfos = this.chainInfosStore.chainInfos;
    const denoms = this.rootDenomsStore.allDenoms;
    const coingeckoPrices = this.priceStore.data;

    if (!!process.env.APP?.includes('compass') && balances.length === 0) {
      const nativeDenom = getNativeDenom(chainInfos, chain, network);
      const denomInfo = denoms[nativeDenom?.coinMinimalDenom ?? ''] ?? nativeDenom;

      return [
        {
          chain,
          name: denomInfo?.name ?? '',
          amount: '0',
          symbol: denomInfo?.coinDenom ?? '',
          usdValue: '0',
          coinMinimalDenom: denomInfo?.coinMinimalDenom ?? '',
          img: denomInfo?.icon ?? '',
          ibcDenom: undefined,
          usdPrice: '0',
          coinDecimals: denomInfo?.coinDecimals ?? 6,
          coinGeckoId: denomInfo?.coinGeckoId ?? '',
          tokenBalanceOnChain: chain,
          id: generateRandomString(10),
        },
      ];
    }

    const formattedBalances = balances.map((balance) => {
      const chainInfo = chainInfos[chain];
      let _denom = balance.denom;
      if (chain === 'noble' && _denom === 'uusdc') {
        _denom = 'usdc';
      }
      let isIbcDenom = false;
      let ibcChainInfo;

      if (_denom.startsWith('ibc/')) {
        isIbcDenom = true;
        const ibcTraceData = getIbcTraceData();
        const trace = ibcTraceData[_denom];
        if (!trace) {
          return null as unknown as Token;
        }
        _denom = getKeyToUseForDenoms(trace.baseDenom, trace.originChainId);
        ibcChainInfo = {
          pretty_name: trace?.originChainId,
          icon: '',
          name: trace?.originChainId,
          channelId: trace.channelId,
        };
      }
      let denomInfo = denoms[_denom];

      if (!denomInfo && chainInfo.beta) {
        if (Object.values(chainInfo.nativeDenoms)[0].coinMinimalDenom === _denom) {
          denomInfo = Object.values(chainInfo.nativeDenoms)[0];
        }
      }

      if (!denomInfo) {
        return null as unknown as Token;
      }

      const amount = fromSmall(new BigNumber(balance.amount).toString(), denomInfo?.coinDecimals);

      let usdValue;
      if (parseFloat(amount) > 0) {
        if (coingeckoPrices) {
          let tokenPrice;
          const coinGeckoId = denomInfo.coinGeckoId;
          const alternateCoingeckoKey = `${(chainInfos?.[denomInfo?.chain as SupportedChain] ?? chainInfo).chainId}-${
            denomInfo.coinMinimalDenom
          }`;

          if (coinGeckoId) {
            tokenPrice = coingeckoPrices[coinGeckoId];
          }
          if (!tokenPrice) {
            tokenPrice = coingeckoPrices[alternateCoingeckoKey];
          }
          if (tokenPrice) {
            usdValue = new BigNumber(amount).times(tokenPrice).toString();
          }
        }
      }

      const usdPrice = parseFloat(amount) > 0 && usdValue ? (Number(usdValue) / Number(amount)).toString() : '0';

      return {
        chain: denomInfo?.chain ?? '',
        name: denomInfo?.name,
        amount,
        symbol: denomInfo?.coinDenom,
        usdValue: usdValue ?? '',
        coinMinimalDenom: denomInfo?.coinMinimalDenom,
        img: denomInfo?.icon,
        ibcDenom: isIbcDenom ? balance.denom : undefined,
        ibcChainInfo,
        usdPrice,
        coinDecimals: denomInfo?.coinDecimals,
        coinGeckoId: denomInfo?.coinGeckoId,
        tokenBalanceOnChain: chain,
        id: generateRandomString(10),
      };
    });

    return formattedBalances.filter((balance) => balance !== null);
  }

  async fetchBalance(address: string, restUrl: string) {
    try {
      const balanceUrl = `${restUrl}/cosmos/bank/v1beta1/balances/${address}?pagination.limit=1000`;
      const res = await fetch(balanceUrl);
      const response = await res.json();
      return response;
    } catch {
      return null;
    }
  }

  async fetchSpendableBalance(address: string, restUrl: string) {
    try {
      const balanceUrl = `${restUrl}/cosmos/bank/v1beta1/spendable_balances/${address}?pagination.limit=1000`;
      const res = await fetch(balanceUrl);
      const response = await res.json();
      return response;
    } catch {
      return null;
    }
  }

  private getBalanceKey(chain: AggregatedSupportedChainType, forceNetwork?: SelectedNetworkType): string {
    const chainKey = this.getChainKey(chain as SupportedChain, forceNetwork);
    const address = this.addressStore.addresses[chain as SupportedChain];

    return `${chainKey}-${address}`;
  }

  private getChainKey(chain: AggregatedSupportedChainType, forceNetwork?: SelectedNetworkType): string {
    const network = forceNetwork ?? this.selectedNetworkStore.selectedNetwork;
    if (chain === 'aggregated') return `aggregated-${network}`;
    const chainId =
      network === 'testnet'
        ? this.chainInfosStore.chainInfos[chain].testnetChainId
        : this.chainInfosStore.chainInfos[chain].chainId;
    return `${chain}-${chainId}`;
  }

  private getAggregatedTokens(
    _balanceSource: 'chainWiseBalances' | 'chainWiseSpendableBalances',
    forceNetwork?: SelectedNetworkType,
  ) {
    const tokens: Token[] = [];
    const network = forceNetwork ?? this.selectedNetworkStore.selectedNetwork;
    const aggregatedChains = this.aggregatedChainsStore.aggregatedChainsData;
    const allChains = Object.keys(this.chainInfosStore.chainInfos);
    for (const chain of allChains) {
      const balanceSource = this.getDefaultBalanceSource(_balanceSource, chain as SupportedChain);
      const balanceKey = this.getBalanceKey(chain as SupportedChain, network);
      this[balanceSource][balanceKey] && tokens.push(...this[balanceSource][balanceKey]);
    }
    return sortTokenBalances(tokens);
  }

  private getChainTokens(
    chain: SupportedChain,
    network: SelectedNetworkType,
    _balanceSource: 'chainWiseBalances' | 'chainWiseSpendableBalances',
  ) {
    const balanceKey = this.getBalanceKey(chain, network);
    const balanceSource = this.getDefaultBalanceSource(_balanceSource, chain);
    return this[balanceSource][balanceKey] ? sortTokenBalances(this[balanceSource][balanceKey]) : [];
  }

  private getDefaultBalanceSource(
    _balanceSource: 'chainWiseBalances' | 'chainWiseSpendableBalances',
    chain: SupportedChain,
  ) {
    if (this.chainsWithoutSpendableBalance.includes(chain)) {
      return 'chainWiseBalances';
    }
    return _balanceSource;
  }

  private getTokens(
    balanceSource: 'chainWiseBalances' | 'chainWiseSpendableBalances',
    forceChain?: AggregatedSupportedChainType,
    forceNetwork?: SelectedNetworkType,
  ) {
    const network = forceNetwork ?? this.selectedNetworkStore.selectedNetwork;
    const chain = forceChain ?? this.activeChainStore.activeChain;
    if (chain === 'aggregated') {
      return this.getAggregatedTokens(balanceSource, network);
    } else {
      return this.getChainTokens(chain as SupportedChain, network, balanceSource);
    }
  }
}
