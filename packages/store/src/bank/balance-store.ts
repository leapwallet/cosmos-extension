import {
  denoms as ConstantDenoms,
  DenomsRecord,
  isBabylon,
  isSuiChain,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk';
import { getIsCompass } from '@leapwallet/cosmos-wallet-sdk';
import BigNumber from 'bignumber.js';
import { computed, makeAutoObservable, runInAction } from 'mobx';
import { computedFn } from 'mobx-utils';
import { AggregatedSupportedChainType, SelectedNetworkType, StorageAdapter } from 'types';

import {
  AggregatedChainsStore,
  ChainFeatureFlagsStore,
  ChainInfosStore,
  CoingeckoIdsStore,
  getIbcTrace,
  getIbcTraceData,
  NmsStore,
  RootDenomsStore,
} from '../assets';
import { getAppType } from '../globals/config';
import { StakeEpochStore } from '../stake/epoch-store';
import { getNativeDenom, isBitcoinChain } from '../utils';
import { fromSmall } from '../utils/balance-converter';
import { getKeyToUseForDenoms } from '../utils/get-denom-key';
import { generateRandomString } from '../utils/random-string-generator';
import { ActiveChainStore, CurrencyStore } from '../wallet';
import { AddressStore } from '../wallet/address-store';
import { SelectedNetworkStore } from '../wallet/selected-network-store';
import { BabylonBalanceStore } from './babylon-balance-store';
import { BalanceAPIStore } from './balance-api-store';
import { sortTokenBalances } from './balance-calculator';
import { BalanceLoadingStatus, Token } from './balance-types';
import { PriceStore } from './price-store';
import { RawBalanceStore } from './raw-balance-store';

export class BalanceStore {
  priceStore: PriceStore;
  nmsStore: NmsStore;
  addressStore: AddressStore;
  rootDenomsStore: RootDenomsStore;
  chainInfosStore: ChainInfosStore;
  aggregatedChainsStore: AggregatedChainsStore;
  activeChainStore: ActiveChainStore;
  loading: boolean = true;
  selectedNetworkStore: SelectedNetworkStore;
  chainFeatureFlagsStore: ChainFeatureFlagsStore;
  balanceAPIStore: BalanceAPIStore;
  currencyStore: CurrencyStore;
  coingeckoIdsStore: CoingeckoIdsStore;

  chainWiseBalances: Record<string, Array<Token>> = {};
  chainWiseSpendableBalances: Record<string, Array<Token>> = {};
  chainWiseStates: Record<string, BalanceLoadingStatus> = {};

  rawBalances: any = {};
  rawBalanceStores: Record<string, RawBalanceStore | BabylonBalanceStore> = {};
  rawSpendableBalanceStores: Record<string, RawBalanceStore | BabylonBalanceStore> = {};
  useCelestiaBalanceStore: boolean = false;

  displayedAssets: Array<Token> = [];
  aggregateBalanceVisible: boolean = false;
  chainsWithoutSpendableBalance: Array<SupportedChain> = ['thorchain'];
  storageAdapter: StorageAdapter;
  chainCustomBalanceStore?: Record<
    SupportedChain,
    {
      BalanceStoreClass: (
        restUrl: string,
        address: string,
        chain: SupportedChain,
        type: 'balances' | 'spendable_balances',
        paginationLimit: number,
        pubkey: string,
      ) => RawBalanceStore;
    }
  >;

  epochStore: StakeEpochStore;

  constructor(
    addressStore: AddressStore,
    priceStore: PriceStore,
    nmsStore: NmsStore,
    rootDenomsStore: RootDenomsStore,
    chainInfoStore: ChainInfosStore,
    aggregatedChainsStore: AggregatedChainsStore,
    activeChainStore: ActiveChainStore,
    selectedNetworkStore: SelectedNetworkStore,
    stakeEpochStore: StakeEpochStore,
    chainFeatureFlagsStore: ChainFeatureFlagsStore,
    balanceAPIStore: BalanceAPIStore,
    currencyStore: CurrencyStore,
    coingeckoIdsStore: CoingeckoIdsStore,
    storageAdapter: StorageAdapter,
    chainCustomBalanceStore?: Record<
      string,
      {
        BalanceStoreClass: (
          restUrl: string,
          address: string,
          chain: SupportedChain,
          type: 'balances' | 'spendable_balances',
          paginationLimit: number,
          pubkey: string,
        ) => RawBalanceStore;
      }
    >,
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
    this.epochStore = stakeEpochStore;
    this.chainFeatureFlagsStore = chainFeatureFlagsStore;
    this.balanceAPIStore = balanceAPIStore;
    this.currencyStore = currencyStore;
    this.coingeckoIdsStore = coingeckoIdsStore;
    this.storageAdapter = storageAdapter;
    this.chainCustomBalanceStore = chainCustomBalanceStore;

    this.initCelestiaBalanceStore();
  }

  getBalancesForChain = computedFn((chain: SupportedChain, network: SelectedNetworkType) => {
    const balanceKey = this.getBalanceKey(chain, network);
    return this.chainWiseBalances?.[balanceKey] ?? [];
  });

  getSpendableBalancesForChain = (chain: SupportedChain, network: SelectedNetworkType) => {
    const balanceKey = this.getBalanceKey(chain, network);
    const balanceSource = this.getDefaultBalanceSource('chainWiseSpendableBalances', chain);
    return this[balanceSource]?.[balanceKey] ?? [];
  };

  getLoadingStatusForChain = (chain: SupportedChain, network: SelectedNetworkType) => {
    const balanceKey = this.getBalanceKey(chain, network);
    return this.chainWiseStates?.[balanceKey] === 'loading';
  };

  getErrorStatusForChain = (chain: SupportedChain, network: SelectedNetworkType) => {
    const balanceKey = this.getBalanceKey(chain, network);
    return this.chainWiseStates?.[balanceKey] === 'error';
  };

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
    return this.chainWiseStates?.[balanceKey] !== null && this.chainWiseStates?.[balanceKey] !== 'error';
  }

  async initCelestiaBalanceStore() {
    const useCelestiaBalanceStore = await this.storageAdapter.get('useCelestiaBalanceStore');
    await this.setUseCelestiaBalanceStore(useCelestiaBalanceStore === 'true', true);
  }

  async setUseCelestiaBalanceStore(v: boolean, skipFetch = false) {
    runInAction(() => {
      this.useCelestiaBalanceStore = v;
      this.storageAdapter.set('useCelestiaBalanceStore', this.useCelestiaBalanceStore ? 'true' : 'false');
      if (!skipFetch) {
        this.fetchChainBalance(
          'celestia',
          this.selectedNetworkStore.selectedNetwork,
          this.addressStore.addresses['celestia'],
          false,
          v ? true : false,
        );
      }
    });
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
      this.coingeckoIdsStore.readyPromise,
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

  async refetchChainBalance(chain: SupportedChain, address?: string, network?: SelectedNetworkType) {
    const balanceKey = this.getBalanceKey(chain, network);
    runInAction(() => {
      this.chainWiseStates[balanceKey] = 'loading';
    });
    await this.fetchChainBalance(chain, network, address, true);
  }

  async fetchChainBalance(
    chain: SupportedChain,
    _network?: SelectedNetworkType,
    _address?: string,
    forceRefetch = false,
    forceUseFallback = false,
  ) {
    const network = _network || this.selectedNetworkStore.selectedNetwork;
    const chainId =
      network === 'testnet'
        ? this.chainInfosStore.chainInfos?.[chain]?.testnetChainId
        : this.chainInfosStore.chainInfos?.[chain]?.chainId;

    if (!chainId) return;

    const restTestKey = 'restTest';
    const restKey = 'rest';

    const nodeUrlKey = network === 'testnet' ? restTestKey : restKey;
    const hasEntryInNms = this.nmsStore.restEndpoints[chainId] && this.nmsStore.restEndpoints[chainId].length > 0;
    const address = _address ?? this.addressStore.addresses[chain];
    const isSeiEvm = this.activeChainStore.isSeiEvm(chain);

    if (isSeiEvm && address?.startsWith('0x')) {
      return;
    }

    const balanceKey = this.getBalanceKey(chain, network, _address);
    const evmOnlyChain = this.chainInfosStore.chainInfos[chain]?.evmOnlyChain;
    const aptosChain = this.chainInfosStore.chainInfos[chain]?.chainId.startsWith('aptos');
    const solanaChain = this.chainInfosStore.chainInfos[chain]?.bip44.coinType === '501';
    const bitcoinChain = isBitcoinChain(chain as SupportedChain);
    const suiChain = this.chainInfosStore.chainInfos[chain]?.chainId.startsWith('sui');
    if (!address || evmOnlyChain || aptosChain || solanaChain || bitcoinChain || suiChain) {
      runInAction(() => {
        this.chainWiseStates[balanceKey] = null;
      });
      return;
    }

    // Only refetch balance if it has already been fetched once before
    if (this.chainWiseBalances[balanceKey] && this.chainWiseSpendableBalances[balanceKey] && !forceRefetch) {
      runInAction(() => {
        this.chainWiseStates[balanceKey] = null;
      });
      return;
    }

    runInAction(() => {
      this.chainWiseStates[balanceKey] = 'loading';
    });

    try {
      if (!forceUseFallback) {
        const { balances: formattedBalancesFromAPI, useFallback } = await this.balanceAPIStore.fetchChainBalanceFromAPI(
          chain,
          network,
          address,
          false,
          forceRefetch,
        );

        if (!useFallback) {
          runInAction(() => {
            this.chainWiseSpendableBalances[balanceKey] = formattedBalancesFromAPI;
            this.chainWiseBalances[balanceKey] = formattedBalancesFromAPI;
            this.chainWiseStates[balanceKey] = null;
            this.aggregateBalanceVisible = true;
          });
          return;
        }
      }

      const restUrl = hasEntryInNms
        ? this.nmsStore.restEndpoints[chainId][0].nodeUrl
        : this.chainInfosStore.chainInfos[chain].apis[nodeUrlKey];

      if (!restUrl) {
        throw new Error('No rest url found');
      }

      const cosmosChain = !['aptos'].includes(chain) && !isBabylon(chain);

      if (
        cosmosChain &&
        this.useCelestiaBalanceStore &&
        this.chainCustomBalanceStore?.[chain] &&
        !this.rawBalanceStores[balanceKey]
      ) {
        const balanceStoreClass = this.chainCustomBalanceStore[chain].BalanceStoreClass;
        const pubkey = this.addressStore.pubKeys[chain];

        const grpcUrl =
          getAppType() !== 'mobile' ? this.nmsStore.grpcWebEndpoints[chainId] : this.nmsStore.grpcEndpoints[chainId];
        this.rawBalanceStores[balanceKey] = balanceStoreClass(
          grpcUrl[0].nodeUrl,
          address,
          chain,
          'balances',
          100,
          pubkey,
        );
      }

      if (
        cosmosChain &&
        this.useCelestiaBalanceStore &&
        this.chainCustomBalanceStore?.[chain] &&
        !this.rawSpendableBalanceStores[balanceKey]
      ) {
        const balanceStoreClass = this.chainCustomBalanceStore[chain].BalanceStoreClass;
        const pubkey = this.addressStore.pubKeys[chain];
        const grpcUrl =
          getAppType() !== 'mobile' ? this.nmsStore.grpcWebEndpoints[chainId] : this.nmsStore.grpcEndpoints[chainId];
        this.rawSpendableBalanceStores[balanceKey] = balanceStoreClass(
          grpcUrl[0].nodeUrl,
          address,
          chain,
          'spendable_balances',
          100,
          pubkey,
        );
      }

      const skipCelestia = this.useCelestiaBalanceStore && chain === 'celestia';

      if (cosmosChain && !skipCelestia && !this.rawBalanceStores[balanceKey]) {
        await this.chainFeatureFlagsStore.readyPromise;
        const rawBalanceStore = new RawBalanceStore(
          restUrl,
          address,
          chain,
          'balances',
          this.chainFeatureFlagsStore.chainFeatureFlagsData[chain]?.balanceQueryPaginationParam,
        );
        this.rawBalanceStores[balanceKey] = rawBalanceStore;
      }

      if (cosmosChain && !skipCelestia && !this.rawSpendableBalanceStores[balanceKey]) {
        await this.chainFeatureFlagsStore.readyPromise;
        const rawSpendableBalanceStore = new RawBalanceStore(
          restUrl,
          address,
          chain,
          'spendable_balances',
          this.chainFeatureFlagsStore.chainFeatureFlagsData[chain]?.balanceQueryPaginationParam,
        );
        this.rawSpendableBalanceStores[balanceKey] = rawSpendableBalanceStore;
      }

      if (isBabylon(chain)) {
        if (!this.rawBalanceStores[balanceKey]) {
          const babylonBalanceStore = new BabylonBalanceStore(restUrl, address, 'balances', this.epochStore);
          this.rawBalanceStores[balanceKey] = babylonBalanceStore;
        }

        if (!this.rawSpendableBalanceStores[balanceKey]) {
          const babylonSpendableBalanceStore = new BabylonBalanceStore(
            restUrl,
            address,
            'spendable_balances',
            this.epochStore,
          );
          this.rawSpendableBalanceStores[balanceKey] = babylonSpendableBalanceStore;
        }
      }

      const rawBalanceStore = this.rawBalanceStores[balanceKey];
      const rawSpendableBalanceStore = this.rawSpendableBalanceStores[balanceKey];

      let formattedBalances: Array<Token> = [];
      let formattedSpendableBalances: Array<Token> = [];
      const tokensToAddInDenoms: DenomsRecord = {};

      const rawBalance = forceRefetch ? await rawBalanceStore.refetchData() : await rawBalanceStore.getData();
      formattedBalances = await this.formatBalance(restUrl, rawBalance.balances, chain, network, tokensToAddInDenoms);

      if (!this.chainsWithoutSpendableBalance.includes(chain)) {
        const rawSpendableBalance = forceRefetch
          ? await rawSpendableBalanceStore.refetchData()
          : await rawSpendableBalanceStore.getData();

        formattedSpendableBalances = await this.formatBalance(
          restUrl,
          rawSpendableBalance.balances,
          chain,
          network,
          tokensToAddInDenoms,
        );
      }

      if (Object.keys(tokensToAddInDenoms).length > 0) {
        this.rootDenomsStore.baseDenomsStore.setDenoms({ ...this.rootDenomsStore.allDenoms, ...tokensToAddInDenoms });
      }

      runInAction(() => {
        this.chainWiseSpendableBalances[balanceKey] = formattedSpendableBalances;
        this.chainWiseBalances[balanceKey] = formattedBalances;

        this.chainWiseStates[balanceKey] =
          rawBalanceStore.isLoading || rawSpendableBalanceStore.isLoading ? 'loading' : null;
        this.aggregateBalanceVisible = true;
      });
    } catch (e) {
      runInAction(() => {
        this.chainWiseStates[balanceKey] = 'error';
      });

      console.error('unable to load balances', e, balanceKey);
    }
  }

  loadBalances(
    _chain?: AggregatedSupportedChainType,
    network?: SelectedNetworkType,
    address?: string,
    refetch = false,
  ) {
    const _network = network ?? this.selectedNetworkStore.selectedNetwork;
    const chain = _chain || this.activeChainStore.activeChain;

    if (chain === 'aggregated') {
      this.aggregateBalanceVisible = false;
      return this.fetchAggregatedBalances(_network, refetch);
    }
    const forceUseFallback = chain === 'celestia' ? this.useCelestiaBalanceStore : false;
    return this.fetchChainBalance(chain as SupportedChain, network, address, refetch, forceUseFallback);
  }

  async fetchAggregatedBalances(network: SelectedNetworkType, forceRefetch = false) {
    this.loading = true;

    const chainWiseAddresses: Partial<Record<SupportedChain, string>> = {};
    const chainsToUseFallbackFor = new Set<SupportedChain>();
    if (this.useCelestiaBalanceStore) {
      chainsToUseFallbackFor.add('celestia');
    }
    await this.aggregatedChainsStore.readyPromise;
    const aggregatedChains = this.aggregatedChainsStore.aggregatedChainsData;
    aggregatedChains.forEach((chain) => {
      if (this.useCelestiaBalanceStore && chain === 'celestia') {
        return;
      }
      const evmOnlyChain = this.chainInfosStore.chainInfos[chain as SupportedChain]?.evmOnlyChain;
      const aptosChain = this.chainInfosStore.chainInfos[chain as SupportedChain]?.chainId?.startsWith('aptos');
      const bitcoinChain = isBitcoinChain(chain as SupportedChain);
      const solanaChain = this.chainInfosStore.chainInfos[chain as SupportedChain]?.bip44?.coinType === '501';
      const suiChain = isSuiChain(chain as SupportedChain);
      if (evmOnlyChain || aptosChain || bitcoinChain || solanaChain || suiChain) {
        return;
      }

      const balanceKey = this.getBalanceKey(chain as SupportedChain, network);

      if (this.chainWiseBalances[balanceKey] && this.chainWiseSpendableBalances[balanceKey] && !forceRefetch) {
        runInAction(() => {
          this.chainWiseStates[balanceKey] = null;
        });
        return;
      }

      const address = this.addressStore.addresses[chain as SupportedChain];
      if (address) {
        chainWiseAddresses[chain as SupportedChain] = address;
      }
    });

    if (Object.keys(chainWiseAddresses).length > 0) {
      const results = await Promise.all([
        this.balanceAPIStore.fetchAggregatedBalanceFromAPI(chainWiseAddresses, network, false, forceRefetch),
        this.balanceAPIStore.fetchAggregatedBalanceFromAPI(chainWiseAddresses, network, true, forceRefetch),
      ]);

      const [balancesResult, spendableBalancesResult] = results;

      Object.entries(balancesResult).forEach(([chain, { balances, useFallback }]) => {
        if (useFallback) {
          chainsToUseFallbackFor.add(chain as SupportedChain);
          return;
        }

        const balanceKey = this.getBalanceKey(chain as SupportedChain, network);

        runInAction(() => {
          this.chainWiseBalances[balanceKey] = balances;
          this.chainWiseSpendableBalances[balanceKey] =
            spendableBalancesResult[chain as SupportedChain]?.balances ?? [];
          this.chainWiseStates[balanceKey] = null;
          this.aggregateBalanceVisible = true;
        });
      });
    }

    if (chainsToUseFallbackFor.size === 0) {
      runInAction(() => {
        this.loading = false;
        this.aggregateBalanceVisible = true;
      });
      return;
    }

    let completedRequests = 0;

    aggregatedChains
      ?.filter(
        (chain) =>
          (network === 'testnet' ||
            this.chainInfosStore.chainInfos[chain as SupportedChain]?.chainId !==
              this.chainInfosStore.chainInfos[chain as SupportedChain]?.testnetChainId) &&
          chainsToUseFallbackFor.has(chain as SupportedChain),
      )
      .forEach((chain) => {
        const balanceKey = this.getBalanceKey(chain as SupportedChain, network);
        runInAction(() => {
          this.chainWiseStates[balanceKey] = 'loading';
        });

        this.fetchChainBalance(chain as SupportedChain, network, undefined, forceRefetch, true)
          .catch(() => {
            completedRequests += 1;
          })
          .finally(() => {
            completedRequests += 1;

            runInAction(() => {
              if (completedRequests === chainsToUseFallbackFor.size) {
                this.loading = false;
              }
            });
          });
      });
  }

  private async formatBalance(
    lcdUrl: string,
    balances: Array<{ amount: string; denom: string }>,
    chain: SupportedChain,
    network: SelectedNetworkType,
    tokensToAddInDenoms: DenomsRecord,
  ) {
    const chainInfos = this.chainInfosStore.chainInfos;
    await Promise.all([this.waitForPriceStore(), this.waitForCoingeckoIdsStore()]);
    const coingeckoPrices = this.priceStore.data;
    const coingeckoIds = this.coingeckoIdsStore.coingeckoIdsFromS3;

    const rootDenoms = this.rootDenomsStore.allDenoms;
    const allDenoms: DenomsRecord = { ...ConstantDenoms, ...rootDenoms };

    const IS_COMPASS = getIsCompass();
    if (!!IS_COMPASS && balances.length === 0) {
      const nativeDenom = getNativeDenom(chainInfos, chain, network);
      const denomInfo = allDenoms[nativeDenom?.coinMinimalDenom ?? ''] ?? nativeDenom;

      let tokenPrice: number | undefined;
      const coinGeckoId =
        denomInfo.coinGeckoId ||
        coingeckoIds[denomInfo?.coinMinimalDenom] ||
        coingeckoIds[denomInfo?.coinMinimalDenom?.toLowerCase()] ||
        '';

      if (coingeckoPrices) {
        const alternateCoingeckoKey = `${chainInfos?.[chain]?.chainId}-${denomInfo.coinMinimalDenom}`;

        if (coinGeckoId) {
          tokenPrice = coingeckoPrices[coinGeckoId];
        }

        if (!tokenPrice) {
          tokenPrice = coingeckoPrices[alternateCoingeckoKey] ?? coingeckoPrices[alternateCoingeckoKey?.toLowerCase()];
        }
      }

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
          usdPrice: tokenPrice ? String(tokenPrice) : '0',
          coinDecimals: denomInfo?.coinDecimals ?? 6,
          coinGeckoId,
          tokenBalanceOnChain: chain,
          id: generateRandomString(10),
        },
      ];
    }

    const formattedBalances = await Promise.all(
      balances.map(async (balance) => {
        const chainInfo = chainInfos[chain];
        const chainId = network === 'testnet' ? chainInfo.testnetChainId : chainInfo.chainId;
        let _denom = getKeyToUseForDenoms(balance.denom, chain);

        let isIbcDenom = false;
        let ibcChainInfo;

        if (_denom.startsWith('ibc/')) {
          isIbcDenom = true;
          const ibcTraceData = getIbcTraceData();
          let trace = ibcTraceData[_denom];

          if (!trace) {
            try {
              const ibcTraceData = await getIbcTrace(_denom, lcdUrl, chainId ?? '');
              trace = ibcTraceData;
            } catch (e) {
              console.error(`Error fetching ibc trace for ${_denom}`, e);
            }
            if (!trace) {
              return null as unknown as Token;
            }
          }

          _denom = getKeyToUseForDenoms(trace.baseDenom, String(trace.sourceChainId || trace.originChainId || ''));
          ibcChainInfo = {
            pretty_name: String(trace.sourceChainId || trace.originChainId || ''),
            icon: '',
            name: String(trace.sourceChainId || trace.originChainId || ''),
            channelId: trace.channelId,
          };
        }

        let denomInfo = allDenoms[_denom];

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
        const coinGeckoId =
          denomInfo.coinGeckoId ||
          coingeckoIds[_denom] ||
          coingeckoIds[_denom?.toLowerCase()] ||
          coingeckoIds[denomInfo?.coinMinimalDenom] ||
          coingeckoIds[denomInfo?.coinMinimalDenom?.toLowerCase()] ||
          '';

        if (coinGeckoId && !denomInfo.coinGeckoId) {
          if (allDenoms[_denom]) {
            tokensToAddInDenoms[_denom] = {
              ...allDenoms[_denom],
              coinGeckoId,
            };
          } else {
            tokensToAddInDenoms[denomInfo.coinMinimalDenom] = {
              ...denomInfo,
              coinGeckoId,
            };
          }
        }

        if (parseFloat(amount) > 0) {
          if (coingeckoPrices) {
            let tokenPrice;

            const alternateCoingeckoKey = `${(chainInfos?.[denomInfo?.chain as SupportedChain] ?? chainInfo).chainId}-${
              denomInfo.coinMinimalDenom
            }`;

            if (coinGeckoId) {
              tokenPrice = coingeckoPrices[coinGeckoId];
            }

            if (!tokenPrice) {
              tokenPrice =
                coingeckoPrices[alternateCoingeckoKey] ?? coingeckoPrices[alternateCoingeckoKey?.toLowerCase()];
            }

            if (tokenPrice) {
              usdValue = new BigNumber(amount).times(tokenPrice).toString();
            }
          }
        }

        const usdPrice = parseFloat(amount) > 0 && usdValue ? (Number(usdValue) / Number(amount)).toString() : '0';

        let name = denomInfo?.name;
        let symbol = denomInfo?.coinDenom;
        if (IS_COMPASS && _denom === 'usdc') {
          symbol = 'USDC.n';
          name = 'USDC via Noble';
        }

        return {
          chain: denomInfo?.chain ?? '',
          name,
          amount,
          symbol,
          usdValue: usdValue ?? '',
          coinMinimalDenom: denomInfo?.coinMinimalDenom,
          img: denomInfo?.icon,
          ibcDenom: isIbcDenom ? balance.denom : undefined,
          ibcChainInfo,
          usdPrice,
          coinDecimals: denomInfo?.coinDecimals,
          coinGeckoId,
          tokenBalanceOnChain: chain,
          id: generateRandomString(10),
        };
      }),
    );

    return formattedBalances.filter((balance) => balance !== null);
  }

  private getBalanceKey(
    chain: AggregatedSupportedChainType,
    forceNetwork?: SelectedNetworkType,
    _address?: string,
  ): string {
    const chainKey = this.getChainKey(chain as SupportedChain, forceNetwork);
    const address = _address ?? this.addressStore.addresses[chain as SupportedChain];
    const userPreferredCurrency = this.currencyStore?.preferredCurrency;
    if (chainKey === 'celestia-celestia' && this.useCelestiaBalanceStore) {
      return `${chainKey}-${address}-${userPreferredCurrency}-celestia-grpc`;
    }

    return `${chainKey}-${address}-${userPreferredCurrency}`;
  }

  private getChainKey(chain: AggregatedSupportedChainType, forceNetwork?: SelectedNetworkType): string {
    const network = forceNetwork ?? this.selectedNetworkStore.selectedNetwork;
    if (chain === 'aggregated') return `aggregated-${network}`;

    const chainId =
      network === 'testnet'
        ? this.chainInfosStore.chainInfos[chain]?.testnetChainId
        : this.chainInfosStore.chainInfos[chain]?.chainId;

    return `${chain}-${chainId}`;
  }

  private getAggregatedTokens(
    _balanceSource: 'chainWiseBalances' | 'chainWiseSpendableBalances',
    forceNetwork?: SelectedNetworkType,
  ) {
    const tokens: Token[] = [];
    const network = forceNetwork ?? this.selectedNetworkStore.selectedNetwork;
    const allChains = Object.keys(this.chainInfosStore.chainInfos).filter(
      (chain) =>
        network === 'testnet' ||
        this.chainInfosStore.chainInfos[chain as SupportedChain]?.chainId !==
          this.chainInfosStore.chainInfos[chain as SupportedChain]?.testnetChainId,
    );

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
