import { DenomsRecord, fetchCW20Balances, fromSmall, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import axios from 'axios';
import BigNumber from 'bignumber.js';
import { makeAutoObservable, runInAction } from 'mobx';
import { computedFn } from 'mobx-utils';
import { AggregatedSupportedChainType, SelectedNetworkType } from 'types';

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
import { ActiveChainStore, AddressStore, CurrencyStore, SelectedNetworkStore } from '../wallet';
import { sortTokenBalances } from './balance-calculator';
import { BalanceLoadingStatus, Token } from './balance-types';
import { PriceStore } from './price-store';

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

  loadBalances(_chain?: AggregatedSupportedChainType, network?: SelectedNetworkType, refetch = false) {
    const _network = network ?? this.selectedNetworkStore.selectedNetwork;
    const chain = _chain || this.activeChainStore.activeChain;
    if (chain === 'aggregated') {
      return this.fetchAggregatedBalances(_network, refetch);
    }

    return this.fetchChainBalances(chain, _network, refetch);
  }

  async fetchAggregatedBalances(network: SelectedNetworkType, refetch = false) {
    runInAction(() => {
      this.aggregatedLoadingStatus = true;
    });

    await this.aggregatedChainsStore.readyPromise;
    await Promise.allSettled(
      this.aggregatedChainsStore.aggregatedChainsData.map(async (chain) => {
        return this.fetchChainBalances(chain as SupportedChain, network, refetch);
      }),
    );
    runInAction(() => {
      this.aggregatedLoadingStatus = false;
    });
    return;
  }

  async fetchChainBalances(chain: SupportedChain, network: SelectedNetworkType, refetch = false) {
    const balanceKey = this.getBalanceKey(chain, network);
    if (!refetch && this.chainWiseBalances[balanceKey]) {
      return;
    }

    try {
      const isSeiEvm = this.activeChainStore.isSeiEvm(chain);
      if (isSeiEvm && chain !== 'seiDevnet') {
        runInAction(() => {
          if (!this.chainWiseBalances[balanceKey]) {
            this.chainWiseStatus[balanceKey] = 'loading';
          }
        });

        const isApiDown = await this.fetchSeiCW20TokenBalances(chain, network);

        if (isApiDown) {
          return await this.fetchCW20TokenBalances(chain, network);
        } else {
          runInAction(() => {
            this.chainWiseStatus[balanceKey] = null;
          });
          return;
        }
      }

      await this.fetchCW20TokenBalances(chain, network);
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
  ): Promise<Token[] | undefined> {
    let cw20DenomAddresses: string[] | undefined = forceCW20Denoms;
    await this.cw20DenomsStore.readyPromise;
    if (!cw20DenomAddresses) {
      cw20DenomAddresses = this.getCW20DenomAddresses(activeChain);
    }

    const chainInfo = this.chainInfosStore.chainInfos[activeChain];
    if (!chainInfo) {
      return;
    }
    const chainId = network === 'testnet' ? chainInfo.testnetChainId : chainInfo.chainId;

    if (!chainId) return;
    const nodeUrlKey = network === 'testnet' ? 'rpcTest' : 'rpc';
    const hasEntryInNms = this.nmsStore.rpcEndPoints[chainId] && this.nmsStore.rpcEndPoints[chainId].length > 0;
    const rpcUrl = hasEntryInNms ? this.nmsStore.rpcEndPoints[chainId][0].nodeUrl : chainInfo.apis[nodeUrlKey];
    const address = this.addressStore.addresses[chainInfo.key];

    const balanceKey = this.getBalanceKey(activeChain, network);
    if (chainInfo?.evmOnlyChain || !rpcUrl || !address || !cw20DenomAddresses || cw20DenomAddresses.length === 0) {
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
      });
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

  async fetchSeiCW20TokenBalances(chain: SupportedChain, network: SelectedNetworkType) {
    const balanceKey = this.getBalanceKey(chain, network);
    const chainInfo = this.chainInfosStore.chainInfos[chain];
    const chainId = network === 'testnet' ? chainInfo.testnetChainId : chainInfo.chainId;

    const address = this.addressStore.addresses?.[chain];

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

      this.denomsStore.setDenoms({ ...denoms, ...tokensToAddInDenoms });
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

      return false;
    } catch (e) {
      console.error('Error while fetching sei evm erc20 balances', e);
      runInAction(() => {
        this.chainWiseStatus[balanceKey] = 'error';
      });
      return true;
    }
  }

  private getBalanceKey(chain: AggregatedSupportedChainType, forceNetwork?: SelectedNetworkType): string {
    const chainKey = this.getChainKey(chain, forceNetwork);
    const address = this.addressStore.addresses[chain];
    const userPreferredCurrency = this.currencyStore?.preferredCurrency;

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

    let usdValue;
    let tokenPrice;

    const coinGeckoId =
      denomInfo?.coinGeckoId ||
      coingeckoIds[denomInfo?.coinMinimalDenom] ||
      coingeckoIds[denomInfo?.coinMinimalDenom?.toLowerCase()] ||
      '';

    if (parseFloat(amount) > 0) {
      if (coingeckoPrices) {
        const alternateCoingeckoKey = `${chainInfo.chainId}-${denomInfo.coinMinimalDenom}`;

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

    const usdPrice = tokenPrice ? String(tokenPrice) : undefined;

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
    let usdValue = token.usdValue;
    let tokenPrice;

    if (!token.usdValue && coinGeckoPrices && parseFloat(amount) > 0) {
      const alternateCoingeckoKey = `${chainInfo.chainId}-${contract}`;

      if (coinGeckoId) {
        tokenPrice = coinGeckoPrices[coinGeckoId];
      }
      if (!tokenPrice) {
        tokenPrice = coinGeckoPrices[alternateCoingeckoKey] ?? coinGeckoPrices[alternateCoingeckoKey?.toLowerCase()];
      }
      if (tokenPrice) {
        usdValue = new BigNumber(amount).times(tokenPrice).toString();
      }
    }

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

  getAggregatedCW20Tokens = computedFn((network: SelectedNetworkType) => {
    let allTokens: Token[] = [];
    const chains = Object.keys(this.chainInfosStore?.chainInfos)?.filter(
      (chain) =>
        network === 'testnet' ||
        this.chainInfosStore.chainInfos[chain as SupportedChain]?.chainId !==
          this.chainInfosStore.chainInfos[chain as SupportedChain]?.testnetChainId,
    );

    chains.forEach((chain) => {
      const balanceKey = this.getBalanceKey(chain as SupportedChain, network);
      const cw20Tokens = this.filterDisplayCW20Tokens(
        Object.values(this.chainWiseBalances[balanceKey] ?? {}),
        chain as SupportedChain,
      );
      allTokens = allTokens.concat(cw20Tokens);
    });

    return sortTokenBalances(allTokens);
  });

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

  getCW20TokensForChain = computedFn((chain: SupportedChain, network: SelectedNetworkType) => {
    const balanceKey = this.getBalanceKey(chain, network);
    const cw20Tokens = this.filterDisplayCW20Tokens(Object.values(this.chainWiseBalances[balanceKey] ?? {}), chain);
    return sortTokenBalances(cw20Tokens ?? []);
  });

  getLoadingStatusForChain = (chain: SupportedChain, network: SelectedNetworkType) => {
    const balanceKey = this.getBalanceKey(chain, network);
    return this.chainWiseStatus[balanceKey] === 'loading';
  };

  getErrorStatusForChain = (chain: SupportedChain, network: SelectedNetworkType) => {
    const balanceKey = this.getBalanceKey(chain, network);
    return this.chainWiseStatus[balanceKey] === 'error';
  };

  get loading() {
    const activeChain = this.activeChainStore.activeChain;
    if (activeChain === 'aggregated') {
      return this.aggregatedLoadingStatus;
    }

    const balanceKey = this.getBalanceKey(activeChain);
    return this.chainWiseStatus[balanceKey] === 'loading';
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
