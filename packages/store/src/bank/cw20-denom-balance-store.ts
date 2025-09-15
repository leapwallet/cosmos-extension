import { DenomsRecord, fetchCW20Balances, fromSmall, SupportedChain, toSmall } from '@leapwallet/cosmos-wallet-sdk';
import axios from 'axios';
import BigNumber from 'bignumber.js';
import { makeAutoObservable, runInAction, toJS } from 'mobx';
import { computedFn } from 'mobx-utils';

import {
  AggregatedChainsStore,
  AutoFetchedCW20DenomsStore,
  BetaCW20DenomsStore,
  ChainInfosStore,
  CoingeckoIdsStore,
  CompassTokenTagsStore,
  CW20DenomsStore,
  DenomsStore,
  DisabledCW20DenomsStore,
  EnabledCW20DenomsStore,
  NmsStore,
} from '../assets';
import { AggregatedSupportedChainType, Currency, SelectedNetworkType, StorageAdapter } from '../types';
import { calculateTokenPriceAndValue } from '../utils/bank/price-calculator';
import { ActiveChainStore, AddressStore, CurrencyStore, SelectedNetworkStore } from '../wallet';
import { sortTokenBalances } from './balance-calculator';
import { BalanceLoadingStatus, Token } from './balance-types';
import { PriceStore } from './price-store';

export const CACHED_CW20_BALANCES_KEY = 'cached-cw20-balances';

export class CW20DenomBalanceStore {
  chainWiseBalances: Record<string, Record<string, Token>> = {};
  rawBalances: Record<string, Record<string, any>> = {};
  aggregatedLoadingStatus: boolean = false;
  chainWiseLoadingStatus: Record<string, boolean> = {};
  chainWiseStatus: Record<string, BalanceLoadingStatus> = {};
  chainInfosStore: ChainInfosStore;
  nmsStore: NmsStore;
  addressStore: AddressStore;
  denomsStore: DenomsStore;
  cw20DenomsStore: CW20DenomsStore;
  betaCW20DenomsStore: BetaCW20DenomsStore;
  enabledCW20DenomsStore: EnabledCW20DenomsStore;
  disabledCW20DenomsStore: DisabledCW20DenomsStore;
  autoFetchedCW20DenomsStore: AutoFetchedCW20DenomsStore;
  selectedNetworkStore: SelectedNetworkStore;
  priceStore: PriceStore;
  activeChainStore: ActiveChainStore;
  aggregatedChainsStore: AggregatedChainsStore;
  compassTokenTagsStore: CompassTokenTagsStore;
  currencyStore: CurrencyStore;
  coingeckoIdsStore: CoingeckoIdsStore;
  storageAdapter: StorageAdapter;
  saveCachedBalancesDebounce: NodeJS.Timeout | null = null;

  constructor(
    chainInfosStore: ChainInfosStore,
    nmsStore: NmsStore,
    activeChainStore: ActiveChainStore,
    addressStore: AddressStore,
    selectedNetworkStore: SelectedNetworkStore,
    denomsStore: DenomsStore,
    cw20DenomsStore: CW20DenomsStore,
    autoFetchedCW20DenomsStore: AutoFetchedCW20DenomsStore,
    betaCW20DenomsStore: BetaCW20DenomsStore,
    enabledCW20DenomsStore: EnabledCW20DenomsStore,
    disabledCW20DenomsStore: DisabledCW20DenomsStore,
    priceStore: PriceStore,
    aggregatedChainsStore: AggregatedChainsStore,
    compassTokenTagsStore: CompassTokenTagsStore,
    currencyStore: CurrencyStore,
    coingeckoIdsStore: CoingeckoIdsStore,
    storageAdapter: StorageAdapter,
  ) {
    makeAutoObservable(this);

    this.chainInfosStore = chainInfosStore;
    this.addressStore = addressStore;
    this.activeChainStore = activeChainStore;
    this.nmsStore = nmsStore;
    this.denomsStore = denomsStore;
    this.cw20DenomsStore = cw20DenomsStore;
    this.autoFetchedCW20DenomsStore = autoFetchedCW20DenomsStore;
    this.betaCW20DenomsStore = betaCW20DenomsStore;
    this.enabledCW20DenomsStore = enabledCW20DenomsStore;
    this.disabledCW20DenomsStore = disabledCW20DenomsStore;
    this.selectedNetworkStore = selectedNetworkStore;
    this.priceStore = priceStore;
    this.aggregatedChainsStore = aggregatedChainsStore;
    this.compassTokenTagsStore = compassTokenTagsStore;
    this.currencyStore = currencyStore;
    this.coingeckoIdsStore = coingeckoIdsStore;
    this.storageAdapter = storageAdapter;

    this.initCachedBalances();
  }

  async initialize() {
    await Promise.all([
      this.nmsStore.readyPromise,
      this.denomsStore.readyPromise,
      this.activeChainStore.readyPromise,
      this.cw20DenomsStore.readyPromise,
      this.autoFetchedCW20DenomsStore.readyPromise,
      this.betaCW20DenomsStore.readyPromise,
      this.enabledCW20DenomsStore.readyPromise,
      this.selectedNetworkStore.readyPromise,
      this.disabledCW20DenomsStore.readyPromise,
      this.priceStore.readyPromise,
      this.aggregatedChainsStore.readyPromise,
      this.compassTokenTagsStore.readyPromise,
    ]);
  }

  loadBalances(
    _chain?: AggregatedSupportedChainType,
    network?: SelectedNetworkType,
    refetch = false,
    forceAddresses?: Record<string, string>,
  ) {
    const _network = network ?? this.selectedNetworkStore.selectedNetwork;
    const chain = _chain || this.activeChainStore.activeChain;
    if (chain === 'aggregated') {
      return this.fetchAggregatedBalances(_network, refetch, forceAddresses);
    }

    return this.fetchChainBalances(chain, _network, refetch, forceAddresses?.[chain]);
  }

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
        this.chainWiseStatus[balanceKey] = 'loading';
      });

      const formattedBalances: Token[] = [];
      Object.values(this.chainWiseBalances[oldBalanceKey] ?? {}).map((denom) => {
        const newVal = this.formatBalance(
          { amount: new BigNumber(toSmall(denom.amount, denom.coinDecimals)), denom: denom.coinMinimalDenom },
          chain,
        );
        if (newVal) {
          formattedBalances.push(newVal);
        }
      });

      runInAction(() => {
        if (!this.chainWiseBalances[balanceKey]) {
          this.chainWiseBalances[balanceKey] = {};
        }
        formattedBalances.map((balance) => {
          this.chainWiseBalances[balanceKey][balance.coinMinimalDenom] = balance;
        });
        this.chainWiseStatus[balanceKey] = null;
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
        this.chainWiseStatus[balanceKey] = 'error';
      });
    }
  }

  async updateAggregatedCurrency(network: SelectedNetworkType, prevCurrency: Currency) {
    runInAction(() => {
      this.aggregatedLoadingStatus = true;
    });

    await this.aggregatedChainsStore.readyPromise;
    await Promise.allSettled(
      this.aggregatedChainsStore.aggregatedChainsData.map(async (chain) => {
        return this.updateCurrencyForChain(chain as SupportedChain, network, prevCurrency);
      }),
    );
    runInAction(() => {
      this.aggregatedLoadingStatus = false;
    });
    return;
  }

  async fetchAggregatedBalances(
    network: SelectedNetworkType,
    refetch = false,
    forceAddresses?: Record<string, string>,
  ) {
    runInAction(() => {
      this.aggregatedLoadingStatus = true;
    });

    await this.aggregatedChainsStore.readyPromise;
    await Promise.allSettled(
      this.aggregatedChainsStore.aggregatedChainsData.map(async (chain) => {
        return this.fetchChainBalances(chain as SupportedChain, network, refetch, forceAddresses?.[chain]);
      }),
    );
    runInAction(() => {
      this.aggregatedLoadingStatus = false;
    });
    return;
  }

  async fetchChainBalances(
    chain: SupportedChain,
    network: SelectedNetworkType,
    refetch = false,
    forceAddress?: string,
  ) {
    const balanceKey = this.getBalanceKey(chain, network, forceAddress);
    if (!refetch && this.chainWiseBalances[balanceKey] && this.chainWiseStatus[balanceKey] === null) {
      return;
    }

    try {
      const isSeiEvm = this.activeChainStore.isSeiEvm(chain);
      if (isSeiEvm && chain !== 'seiDevnet' && network === 'mainnet') {
        runInAction(() => {
          if (!this.chainWiseBalances[balanceKey]) {
            this.chainWiseStatus[balanceKey] = 'loading';
          }
        });

        const isApiDown = await this.fetchSeiCW20TokenBalances(chain, network);

        if (isApiDown) {
          return await this.fetchCW20TokenBalances(chain, network);
        }
        return;
      }

      await this.fetchCW20TokenBalances(chain, network, undefined, undefined, forceAddress);
    } catch (e) {
      console.error('Error while fetching cw20 balances', e);
      runInAction(() => {
        this.chainWiseStatus[balanceKey] = 'error';
      });
    }
  }

  async fetchCW20TokenBalances(
    activeChain: SupportedChain,
    network: SelectedNetworkType,
    forceCW20Denoms?: string[],
    skipStateUpdate = false,
    forceAddress?: string,
  ): Promise<Token[] | undefined> {
    let cw20DenomAddresses: string[] | undefined = forceCW20Denoms;
    await this.cw20DenomsStore.readyPromise;
    if (!cw20DenomAddresses) {
      cw20DenomAddresses = this.getCW20DenomAddresses(activeChain);
    }

    const chainInfo = this.chainInfosStore.chainInfos?.[activeChain];
    if (!chainInfo || !!chainInfo?.evmOnlyChain) {
      return;
    }
    const chainId = network === 'testnet' ? chainInfo.testnetChainId : chainInfo.chainId;

    if (!chainId) return;
    const nodeUrlKey = network === 'testnet' ? 'rpcTest' : 'rpc';
    const hasEntryInNms = this.nmsStore?.rpcEndPoints?.[chainId] && this.nmsStore.rpcEndPoints[chainId].length > 0;
    const rpcUrl = hasEntryInNms ? this.nmsStore.rpcEndPoints[chainId][0].nodeUrl : chainInfo.apis[nodeUrlKey];
    const address = forceAddress || this.addressStore.addresses[chainInfo.key];

    const balanceKey = this.getBalanceKey(activeChain, network, forceAddress);
    if (!rpcUrl || !address || !cw20DenomAddresses || cw20DenomAddresses.length === 0) {
      runInAction(() => {
        if (!this.chainWiseBalances[balanceKey]) {
          this.chainWiseBalances[balanceKey] = {};
        }
        this.chainWiseStatus[balanceKey] = null;
      });
      return;
    }

    if (!skipStateUpdate) {
      runInAction(() => {
        if (!this.chainWiseBalances[balanceKey]) {
          this.chainWiseStatus[balanceKey] = 'loading';
        }
      });
    }

    const formattedBalances: Token[] = [];
    let rawBalances: {
      denom: string;
      amount: BigNumber;
    }[] = [];

    try {
      rawBalances = await fetchCW20Balances(`${rpcUrl}/`, address, cw20DenomAddresses);
      if (rawBalances && rawBalances.length > 0) {
        await Promise.all([this.waitForPriceStore(), this.waitForCoingeckoIdsStore()]);
        await Promise.allSettled(
          rawBalances.map(async (balance) => {
            try {
              const formattedToken = this.formatBalance(balance, activeChain);
              if (formattedToken) {
                formattedBalances.push(formattedToken);
              }
            } catch (e) {
              console.error('Error while formatting balance', e);
            }
          }),
        );
      }
    } catch (e) {
      console.error('Error while fetching cw20 balances', e);
      runInAction(() => {
        this.chainWiseStatus[balanceKey] = 'error';
        this.chainWiseBalances[balanceKey] = {};
      });
      return [];
    }

    if (!skipStateUpdate) {
      runInAction(() => {
        rawBalances.forEach((balance) => {
          if (!this.rawBalances[balanceKey]) {
            this.rawBalances[balanceKey] = {};
          }
          this.rawBalances[balanceKey][balance.denom] = balance;
        });
        formattedBalances.forEach((balance) => {
          if (!this.chainWiseBalances[balanceKey]) {
            this.chainWiseBalances[balanceKey] = {};
          }
          this.chainWiseBalances[balanceKey][balance.coinMinimalDenom] = balance;
        });
        if (!this.chainWiseBalances[balanceKey]) {
          this.chainWiseBalances[balanceKey] = {};
        }
        this.chainWiseStatus[balanceKey] = null;
      });
    }

    this.saveCachedBalances();

    return formattedBalances;
  }

  async fetchSeiTraceCW20TokensPage(chainId: string, address: string, limit: number, offset: number) {
    const url = `https://api.leapwallet.io/proxy/sei-trace/cw20/balances?limit=${limit}&offset=${offset}&chain_id=${chainId}&address=${address}`;

    const { data } = await axios.get(url);
    return data;
  }

  async fetchAllSeiTraceCW20Tokens(chainId: string, address: string) {
    let offset = 0;
    const limit = 50;
    let allTokens: any[] = [];

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const data = await this.fetchSeiTraceCW20TokensPage(chainId, address, limit, offset);
      if (data.items.length === 0) {
        break;
      }

      allTokens = allTokens.concat(data.items);
      offset += limit;

      if (!data.next_page?.params) {
        break;
      }
    }

    return allTokens.filter((token) => !!token.token_symbol);
  }

  async fetchSeiCW20TokenBalances(chain: SupportedChain, network: SelectedNetworkType, forceAddress?: string) {
    const balanceKey = this.getBalanceKey(chain, network, forceAddress);
    const chainInfo = this.chainInfosStore.chainInfos[chain];
    const chainId = network === 'testnet' ? chainInfo.testnetChainId : chainInfo.chainId;

    const address = forceAddress || this.addressStore.addresses?.[chain];

    if (!chainId || !address) {
      runInAction(() => {
        this.chainWiseBalances[balanceKey] = {};
        this.chainWiseStatus[balanceKey] = 'error';
      });
      return;
    }

    try {
      const tokensToAddInDenoms: Record<string, any> = {};
      const _denoms = this.denomsStore.denoms;
      const _compassDenoms = this.compassTokenTagsStore.compassTokenDenomInfo;

      const denoms = Object.assign({}, _denoms, _compassDenoms);
      const allTokens = await this.fetchAllSeiTraceCW20Tokens(chainId, address);
      if (!allTokens || allTokens?.length === 0) {
        throw new Error('No tokens found from sei-trace');
      }

      await Promise.all([this.waitForPriceStore(), this.waitForCoingeckoIdsStore()]);

      const formattedBalances = allTokens.map((item: any) => {
        const token = {
          address: item.token_contract,
          decimals: item.token_decimals,
          name: item.token_name || '',
          symbol: item.token_symbol,
          icon_url: item.token_logo || '',
          value: item.raw_amount,
        };

        const alternateContract = item?.token_association?.evm_hash;
        return this.formatApiBalance(token, tokensToAddInDenoms, denoms, chain, alternateContract);
      });

      this.denomsStore.setTempBaseDenoms(tokensToAddInDenoms);
      this.betaCW20DenomsStore.setTempBetaCW20Denoms(tokensToAddInDenoms, chain);

      runInAction(() => {
        formattedBalances.forEach((balance: any) => {
          if (!this.chainWiseBalances[balanceKey]) {
            this.chainWiseBalances[balanceKey] = {};
          }

          this.chainWiseBalances[balanceKey][balance.coinMinimalDenom] = balance;
        });

        if (!this.chainWiseBalances[balanceKey]) {
          this.chainWiseBalances[balanceKey] = {};
        }

        this.chainWiseStatus[balanceKey] = null;
      });

      this.saveCachedBalances();

      return false;
    } catch (e) {
      console.error('Error while fetching sei evm erc20 balances', e);
      runInAction(() => {
        this.chainWiseStatus[balanceKey] = 'error';
      });
      return true;
    }
  }

  private getBalanceKey(
    chain: SupportedChain,
    forceNetwork?: SelectedNetworkType,
    forceAddress?: string,
    forceCurrency?: Currency,
  ): string {
    const chainKey = this.getChainKey(chain, forceNetwork);
    const address = forceAddress || this.addressStore?.addresses?.[chain];
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

  getCW20DenomAddresses(chain: string): string[] {
    const cw20Denoms = this.cw20DenomsStore.denoms;
    const betaCW20Denoms = Object.keys(this.betaCW20DenomsStore.denoms?.[chain] ?? {});
    const enabledCW20Denoms = this.enabledCW20DenomsStore.enabledCW20Denoms;
    const disabledCW20Denoms = this.disabledCW20DenomsStore.disabledCW20Denoms;
    const autoFetchedCW20Denoms = this.autoFetchedCW20DenomsStore.chainWiseDenoms;

    const nonDisabledCW20Denoms = Object.keys(cw20Denoms?.[chain] ?? {}).filter(
      (token) => !disabledCW20Denoms.includes(token),
    );
    const enabledAutoFetchedCW20Denoms = Object.keys(autoFetchedCW20Denoms?.[chain] ?? {}).filter((token) =>
      enabledCW20Denoms.includes(token),
    );

    return [...nonDisabledCW20Denoms, ...enabledAutoFetchedCW20Denoms, ...betaCW20Denoms];
  }

  get combinedDenoms() {
    const denoms = this.denomsStore.denoms ?? {};
    const allAutoFetchedCW20Denoms = this.autoFetchedCW20DenomsStore.allAutoFetchedCW20Denoms ?? {};
    return { ...denoms, ...allAutoFetchedCW20Denoms };
  }

  formatBalance(balance: { amount: BigNumber; denom: string }, chain: SupportedChain) {
    const chainInfos = this.chainInfosStore.chainInfos;
    const coingeckoPrices = this.priceStore.data;
    const coingeckoIds = this.coingeckoIdsStore.coingeckoIdsFromS3;

    const chainInfo = chainInfos[chain];
    let _denom = balance.denom;
    if (chain === 'noble' && _denom === 'uusdc') {
      _denom = 'usdc';
    }

    const betaCW20Denoms = this.betaCW20DenomsStore.getBetaCW20DenomsForChain(chain) ?? {};
    const allDenoms: Record<string, any> = { ...betaCW20Denoms, ...this.combinedDenoms };
    const denomInfo = allDenoms[_denom];

    if (!denomInfo) {
      return null;
    }

    const amount = fromSmall(new BigNumber(balance.amount).toString(), denomInfo?.coinDecimals);

    const coinGeckoId =
      denomInfo?.coinGeckoId ||
      coingeckoIds[denomInfo?.coinMinimalDenom] ||
      coingeckoIds[denomInfo?.coinMinimalDenom?.toLowerCase()] ||
      '';

    const { usdPrice, usdValue } = calculateTokenPriceAndValue({
      coingeckoPrices,
      coinMinimalDenom: denomInfo?.coinMinimalDenom,
      chainId: chainInfo.chainId,
      coinGeckoId,
      amount,
    });

    const formattedBalance: Token = {
      chain: denomInfo?.chain ?? '',
      name: denomInfo?.name,
      amount,
      symbol: denomInfo?.coinDenom,
      usdValue,
      coinMinimalDenom: denomInfo?.coinMinimalDenom ?? balance.denom,
      img: denomInfo?.icon,
      ibcDenom: '',
      usdPrice,
      coinDecimals: denomInfo?.coinDecimals,
      coinGeckoId,
      tokenBalanceOnChain: chain as SupportedChain,
    };

    return formattedBalance;
  }

  formatApiBalance(
    token: any,
    tokensToAddInDenoms: Record<string, any>,
    denoms: DenomsRecord,
    chain: SupportedChain,
    alternateContract?: string,
  ) {
    const contract = token.address;
    let decimals = token.decimals;
    let name = token.name;
    let symbol = token.symbol;
    let coinMinimalDenom = contract;
    let icon = token.icon_url || '';
    const isSeiEvm = this.activeChainStore.isSeiEvm(chain);

    const [, _denomInfo] =
      Object.entries(denoms).find(([key, value]) => {
        if (key.toLowerCase() === contract.toLowerCase()) {
          return value;
        }
      }) ?? [];

    const [, alternativeDenomInfo] = isSeiEvm
      ? Object.entries(denoms).find(([key, value]) => {
          if (key.toLowerCase() === alternateContract?.toLowerCase()) {
            return value;
          }
        }) ?? []
      : [];

    const denomInfo =
      _denomInfo || alternativeDenomInfo
        ? {
            chain: _denomInfo?.chain ?? alternativeDenomInfo?.chain,
            name: _denomInfo?.name ?? alternativeDenomInfo?.name,
            coinDenom: _denomInfo?.coinDenom ?? alternativeDenomInfo?.coinDenom,
            coinDecimals: _denomInfo?.coinDecimals ?? alternativeDenomInfo?.coinDecimals,
            icon: _denomInfo?.icon ?? alternativeDenomInfo?.icon,
            coinGeckoId: _denomInfo?.coinGeckoId ?? alternativeDenomInfo?.coinGeckoId,
            coinMinimalDenom: _denomInfo?.coinMinimalDenom ?? contract,
          }
        : undefined;

    const coinGeckoPrices = this.priceStore.data;
    const coingeckoIds = this.coingeckoIdsStore.coingeckoIdsFromS3;

    const coinGeckoId =
      denomInfo?.coinGeckoId ||
      coingeckoIds[denomInfo?.coinMinimalDenom] ||
      coingeckoIds[denomInfo?.coinMinimalDenom?.toLowerCase()] ||
      coingeckoIds[contract] ||
      coingeckoIds[contract?.toLowerCase()] ||
      '';

    if (!denomInfo) {
      tokensToAddInDenoms[contract] = {
        name,
        coinDenom: symbol,
        coinMinimalDenom,
        coinDecimals: decimals,
        coinGeckoId,
        icon,
        chain,
      };
    } else {
      name = denomInfo.name;
      symbol = denomInfo.coinDenom;
      icon = denomInfo.icon;
      decimals = denomInfo.coinDecimals;
      coinMinimalDenom = denomInfo.coinMinimalDenom;
      if (!denomInfo?.coinGeckoId && coinGeckoId) {
        tokensToAddInDenoms[contract] = {
          ...denomInfo,
          coinGeckoId,
        };
      }
    }

    const chainInfo = this.chainInfosStore.chainInfos[chain];
    const amount = fromSmall(token.value, decimals);

    const { usdPrice: tokenPrice, usdValue } = calculateTokenPriceAndValue({
      coingeckoPrices: coinGeckoPrices,
      coinMinimalDenom: denomInfo?.coinMinimalDenom,
      chainId: chainInfo.chainId,
      coinGeckoId,
      amount,
    });

    const usdPrice = token.usdPrice ? token.usdPrice : tokenPrice ? String(tokenPrice) : undefined;
    return {
      chain,
      name,
      amount,
      symbol,
      usdValue: usdValue ?? '',
      coinMinimalDenom,
      img: icon,
      ibcDenom: '',
      usdPrice,
      coinDecimals: decimals,
      coinGeckoId,
      tokenBalanceOnChain: chain,
    };
  }

  private filterDisplayCW20Tokens(tokens: Token[], chain: SupportedChain) {
    const cw20DenomAddresses = this.getCW20DenomAddresses(chain);
    const disabledCW20Tokens = this.disabledCW20DenomsStore.getDisabledCW20DenomsForChain(chain);
    const enabledCW20Tokens = this.enabledCW20DenomsStore.getEnabledCW20DenomsForChain(chain);
    return tokens.filter((token) =>
      cw20DenomAddresses.includes(token.coinMinimalDenom) && String(token.amount) === '0'
        ? enabledCW20Tokens.includes(token.coinMinimalDenom)
        : !disabledCW20Tokens.includes(token.coinMinimalDenom),
    );
  }

  get cw20Tokens() {
    const activeChain = this.activeChainStore.activeChain;
    if (activeChain === 'aggregated') {
      return this.allCW20Tokens;
    }

    const balanceKey = this.getBalanceKey(activeChain);
    const cw20Tokens = this.filterDisplayCW20Tokens(
      Object.values(this.chainWiseBalances[balanceKey] ?? {}),
      activeChain,
    );
    return sortTokenBalances(cw20Tokens);
  }

  getAggregatedCW20Tokens = computedFn(
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
        const cw20Tokens = this.filterDisplayCW20Tokens(
          Object.values(this.chainWiseBalances[balanceKey] ?? {}),
          chain as SupportedChain,
        );
        allTokens = allTokens.concat(cw20Tokens);
      });

      return sortTokenBalances(allTokens);
    },
  );

  get allCW20Tokens() {
    let allTokens: Token[] = [];
    const network = this.selectedNetworkStore.selectedNetwork;
    const chains = Object.keys(this.chainInfosStore?.chainInfos)?.filter(
      (chain) =>
        network === 'testnet' ||
        this.chainInfosStore.chainInfos[chain as SupportedChain]?.chainId !==
          this.chainInfosStore.chainInfos[chain as SupportedChain]?.testnetChainId,
    );

    chains.forEach((chain) => {
      const balanceKey = this.getBalanceKey(chain as SupportedChain);
      const cw20Tokens = this.filterDisplayCW20Tokens(
        Object.values(this.chainWiseBalances[balanceKey] ?? {}),
        chain as SupportedChain,
      );
      allTokens = allTokens.concat(cw20Tokens);
    });

    return sortTokenBalances(allTokens);
  }

  getCW20TokensForChain = computedFn(
    (chain: SupportedChain, network: SelectedNetworkType, forceAddress: string | undefined) => {
      const balanceKey = this.getBalanceKey(chain, network, forceAddress);
      const cw20Tokens = this.filterDisplayCW20Tokens(Object.values(this.chainWiseBalances[balanceKey] ?? {}), chain);
      return sortTokenBalances(cw20Tokens ?? []);
    },
  );

  getLoadingStatusForChain = (
    chain: SupportedChain,
    network: SelectedNetworkType,
    forceAddress: string | undefined,
  ) => {
    const balanceKey = this.getBalanceKey(chain, network, forceAddress);
    return this.chainWiseStatus[balanceKey] === undefined || this.chainWiseStatus[balanceKey] === 'loading';
  };

  getErrorStatusForChain = (chain: SupportedChain, network: SelectedNetworkType, forceAddress?: string) => {
    const balanceKey = this.getBalanceKey(chain, network, forceAddress);
    return this.chainWiseStatus[balanceKey] === 'error';
  };

  get loading() {
    const activeChain = this.activeChainStore.activeChain;
    if (activeChain === 'aggregated') {
      return this.aggregatedLoadingStatus;
    }

    const balanceKey = this.getBalanceKey(activeChain);
    return this.chainWiseStatus[balanceKey] === undefined || this.chainWiseStatus[balanceKey] === 'loading';
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
    try {
      if (this.saveCachedBalancesDebounce) {
        clearTimeout(this.saveCachedBalancesDebounce);
      }

      this.saveCachedBalancesDebounce = setTimeout(() => {
        this.saveCachedBalancesToStorage();
        this.saveCachedBalancesDebounce = null;
      }, 1000);
    } catch (e) {
      //
    }
  }

  private async saveCachedBalancesToStorage() {
    try {
      await this.storageAdapter.set(CACHED_CW20_BALANCES_KEY, toJS(this.chainWiseBalances), 'idb');
    } catch (e) {
      //
    }
  }

  private async initCachedBalances() {
    try {
      const cachedBalances = await this.storageAdapter.get<Record<string, Record<string, Token>>>(
        CACHED_CW20_BALANCES_KEY,
        'idb',
      );
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
