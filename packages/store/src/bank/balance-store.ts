import { denoms as ConstantDenoms, DenomsRecord, isAptosChain, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import axios from 'axios';
import BigNumber from 'bignumber.js';
import { computed, makeAutoObservable, runInAction } from 'mobx';
import { computedFn } from 'mobx-utils';
import { AggregatedSupportedChainType, SelectedNetworkType } from 'types';

import { AggregatedChainsStore, ChainInfosStore, getIbcTraceData, NmsStore, RootDenomsStore } from '../assets';
import { StakeEpochStore } from '../stake/epoch-store';
import { getNativeDenom, isBitcoinChain } from '../utils';
import { fromSmall } from '../utils/balance-converter';
import { chainIdToChainName } from '../utils/chain-id-chain-name-map';
import { getKeyToUseForDenoms } from '../utils/get-denom-key';
import { generateRandomString } from '../utils/random-string-generator';
import { ActiveChainStore } from '../wallet';
import { AddressStore } from '../wallet/address-store';
import { SelectedNetworkStore } from '../wallet/selected-network-store';
import { AptosBalanceStore } from './aptos-balance-store';
import { BabylonBalanceStore } from './babylon-balance-store';
import { sortTokenBalances } from './balance-calculator';
import { BalanceLoadingStatus, Token } from './balance-types';
import { BitcoinBalanceStore } from './bitcoin-balance-store';
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

  chainWiseBalances: Record<string, Array<Token>> = {};
  chainWiseSpendableBalances: Record<string, Array<Token>> = {};
  chainWiseStates: Record<string, BalanceLoadingStatus> = {};

  rawBalances: any = {};
  rawBalanceStores: Record<string, RawBalanceStore | BitcoinBalanceStore | AptosBalanceStore | BabylonBalanceStore> =
    {};
  rawSpendableBalanceStores: Record<
    string,
    RawBalanceStore | BitcoinBalanceStore | AptosBalanceStore | BabylonBalanceStore
  > = {};

  displayedAssets: Array<Token> = [];
  aggregateBalanceVisible: boolean = false;
  chainsWithoutSpendableBalance: Array<SupportedChain> = ['thorchain', 'bitcoin'];

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
    return this.chainWiseStates?.[balanceKey] === 'loading';
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
  ) {
    const network = _network || this.selectedNetworkStore.selectedNetwork;
    const chainId =
      network === 'testnet'
        ? this.chainInfosStore.chainInfos[chain].testnetChainId
        : this.chainInfosStore.chainInfos[chain].chainId;

    if (!chainId) return;

    const restTestKey = isBitcoinChain(chain) ? 'rpcTestBlockbook' : 'restTest';
    const restKey = isBitcoinChain(chain) ? 'rpcBlockbook' : 'rest';

    const nodeUrlKey = network === 'testnet' ? restTestKey : restKey;
    const hasEntryInNms = this.nmsStore.restEndpoints[chainId] && this.nmsStore.restEndpoints[chainId].length > 0;
    const address = _address ?? this.addressStore.addresses[chain];

    const balanceKey = this.getBalanceKey(chain, network, _address);
    if (!address || this.chainInfosStore.chainInfos[chain]?.evmOnlyChain) {
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
      const restUrl = hasEntryInNms
        ? this.nmsStore.restEndpoints[chainId][0].nodeUrl
        : this.chainInfosStore.chainInfos[chain].apis[nodeUrlKey];

      if (!restUrl) {
        if (isBitcoinChain(chain)) {
          throw new Error('No rpc url found');
        }

        throw new Error('No rest url found');
      }

      if (!['bitcoin', 'aptos', 'babylon'].includes(chain) && !this.rawBalanceStores[balanceKey]) {
        const rawBalanceStore = new RawBalanceStore(restUrl, address, chain, 'balances');
        this.rawBalanceStores[balanceKey] = rawBalanceStore;
      }

      if (!['bitcoin', 'aptos', 'babylon'].includes(chain) && !this.rawSpendableBalanceStores[balanceKey]) {
        const rawSpendableBalanceStore = new RawBalanceStore(restUrl, address, chain, 'spendable_balances');
        this.rawSpendableBalanceStores[balanceKey] = rawSpendableBalanceStore;
      }

      if (chain === 'babylon') {
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

      if (isAptosChain(chain)) {
        const aptosBalanceStore = new AptosBalanceStore(restUrl, address, chain);
        this.rawBalanceStores[balanceKey] = aptosBalanceStore;
        this.rawSpendableBalanceStores[balanceKey] = aptosBalanceStore;
      }

      if (isBitcoinChain(chain)) {
        const bitcoinBalanceStore = new BitcoinBalanceStore(restUrl, address, chain);
        this.rawBalanceStores[balanceKey] = bitcoinBalanceStore;
        this.rawSpendableBalanceStores[balanceKey] = bitcoinBalanceStore;
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

  async loadBalances(
    _chain?: AggregatedSupportedChainType,
    network?: SelectedNetworkType,
    address?: string,
    refetch = false,
  ) {
    const _network = network ?? this.selectedNetworkStore.selectedNetwork;
    const chain = _chain || this.activeChainStore.activeChain;

    if (chain === 'aggregated') {
      this.aggregateBalanceVisible = false;
      this.fetchAggregatedBalances(_network, refetch);
    } else {
      this.fetchChainBalance(chain as SupportedChain, network, address, refetch);
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

    this.aggregatedChainsStore.aggregatedChainsData
      ?.filter(
        (chain) =>
          network === 'testnet' ||
          this.chainInfosStore.chainInfos[chain as SupportedChain]?.chainId !==
            this.chainInfosStore.chainInfos[chain as SupportedChain]?.testnetChainId,
      )
      .forEach((chain) => {
        const balanceKey = this.getBalanceKey(chain as SupportedChain, network);
        runInAction(() => {
          this.chainWiseStates[balanceKey] = 'loading';
        });

        this.fetchChainBalance(chain as SupportedChain, network, undefined, forceRefetch)
          .catch(() => {
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

  private async getAptosDenomDetails(lcdUrl: string, denom: string, chain: SupportedChain) {
    try {
      const res = await axios.get(
        `${lcdUrl}/accounts/${denom.split('::')?.[0]}/resource/0x1::coin::CoinInfo<${denom}>`,
      );
      const fetchedDenom = res.data?.data;
      if (fetchedDenom && fetchedDenom.symbol && fetchedDenom.decimals) {
        return {
          name: fetchedDenom.name ?? '',
          coinDenom: fetchedDenom.symbol,
          coinMinimalDenom: denom,
          coinDecimals: fetchedDenom.decimals,
          icon: '',
          chain,
          coinGeckoId: '',
        };
      }

      return null;
    } catch (e) {
      console.error(`Error fetching aptos denom info for ${denom}`, e);
    }
  }

  private async formatBalance(
    lcdUrl: string,
    balances: Array<{ amount: string; denom: string }>,
    chain: SupportedChain,
    network: SelectedNetworkType,
    tokensToAddInDenoms: DenomsRecord,
  ) {
    const chainInfos = this.chainInfosStore.chainInfos;
    const coingeckoPrices = this.priceStore.data;

    const rootDenoms = this.rootDenomsStore.allDenoms;
    const allDenoms: DenomsRecord = { ...ConstantDenoms, ...rootDenoms };

    if (!!process.env.APP?.includes('compass') && balances.length === 0) {
      const nativeDenom = getNativeDenom(chainInfos, chain, network);
      const denomInfo = allDenoms[nativeDenom?.coinMinimalDenom ?? ''] ?? nativeDenom;

      let tokenPrice: number | undefined;
      if (coingeckoPrices) {
        const coinGeckoId = denomInfo.coinGeckoId;

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
          coinGeckoId: denomInfo?.coinGeckoId ?? '',
          tokenBalanceOnChain: chain,
          id: generateRandomString(10),
        },
      ];
    }

    const formattedBalances = await Promise.all(
      balances.map(async (balance) => {
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

        let denomInfo = allDenoms[_denom];

        if (!denomInfo && chainInfo.beta) {
          if (Object.values(chainInfo.nativeDenoms)[0].coinMinimalDenom === _denom) {
            denomInfo = Object.values(chainInfo.nativeDenoms)[0];
          }
        }

        if (!denomInfo && isAptosChain(chain)) {
          const fetchedDenom = await this.getAptosDenomDetails(lcdUrl, _denom, chain);
          if (fetchedDenom) {
            denomInfo = fetchedDenom;
            tokensToAddInDenoms[_denom] = denomInfo;
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
              tokenPrice =
                coingeckoPrices[alternateCoingeckoKey] ?? coingeckoPrices[alternateCoingeckoKey?.toLowerCase()];
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
}
