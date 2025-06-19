import { Aptos, APTOS_COIN, APTOS_FA, AptosConfig } from '@aptos-labs/ts-sdk';
import {
  aptosChainNativeFATokenMapping,
  aptosChainNativeTokenMapping,
  axiosWrapper,
  ChainInfos,
  denoms as DefaultDenoms,
  DenomsRecord,
  fromSmallBN,
  isAptosChain,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk';
import { BigNumber } from '@leapwallet/cosmos-wallet-sdk/dist/browser/proto/injective/utils/classes';
import { AxiosError } from 'axios';
import { computed, makeObservable, observable, runInAction } from 'mobx';

import { ChainInfosStore, CoingeckoIdsStore } from '../assets';
import { DenomsStore } from '../assets/denoms-store';
import { BaseQueryStore } from '../base/base-data-store';
import { AggregatedSupportedChainType, SelectedNetworkType } from '../types';
import { ActiveChainStore, AddressStore, CurrencyStore, SelectedNetworkStore } from '../wallet';
import { AptosBalanceApiStore } from './aptos-balance-api-store';
import { sortTokenBalances } from './balance-calculator';
import { Token } from './balance-types';
import { IRawBalanceResponse } from './bitcoin-balance-store';
import { PriceStore } from './price-store';

/**
 * @deprecated
 */
export class AptosBalanceStore extends BaseQueryStore<IRawBalanceResponse> {
  restUrl: string;
  address: string;
  chain: string;

  constructor(restUrl: string, address: string, chain: string) {
    super();
    makeObservable(this);

    this.restUrl = restUrl;
    this.address = address;
    this.chain = chain;
  }

  async getNativeTokenBalance() {
    try {
      const config = new AptosConfig({
        fullnode: this.restUrl,
      });
      const aptos = new Aptos(config);
      const balance = await aptos.getAccountCoinAmount({
        accountAddress: this.address,
        coinType: APTOS_COIN,
      });
      if (balance > 0) {
        return {
          denom: aptosChainNativeTokenMapping[this.chain],
          amount: BigInt(balance).toString(),
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching Native balance', error);
      return null;
    }
  }

  async fetchData() {
    try {
      const { data } = await axiosWrapper({
        baseURL: this.restUrl,
        method: 'get',
        url: `/accounts/${this.address}/resources?limit=999`,
      });
      // Filter for CoinStore resources
      const coinStores = data.filter((r: any) => r.type.includes('0x1::coin::CoinStore'));

      let foundNativeToken = false;
      // Extract balances
      const balances: IRawBalanceResponse['balances'] =
        coinStores?.map((store: any) => {
          const type = store.type.replace('0x1::coin::CoinStore<', '').replace('>', '');
          if (type === APTOS_COIN) {
            if (store.data.coin.value > 0) {
              foundNativeToken = true;
            }
            return {
              denom: aptosChainNativeTokenMapping[this.chain],
              amount: BigInt(store.data.coin.value).toString(),
            };
          }

          return {
            denom: type,
            amount: BigInt(store.data.coin.value).toString(),
          };
        }) ?? [];

      if (!foundNativeToken) {
        const nativeBalance = await this.getNativeTokenBalance();
        if (nativeBalance) {
          balances.unshift(nativeBalance);
        }
      }
      return {
        balances,
        pagination: { next_key: null, total: balances?.length?.toString() || '0' },
      };
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data?.error_code === 'account_not_found') {
        const balances: IRawBalanceResponse['balances'] = [];
        const nativeBalance = await this.getNativeTokenBalance();
        if (nativeBalance) {
          balances.unshift(nativeBalance);
        }
        return {
          balances,
          pagination: { next_key: null, total: '0' },
        };
      }
      throw error;
    }
  }
}

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
  ) {
    makeObservable(this, {
      chainWiseBalances: observable,
      chainWiseLoadingStatus: observable,
      totalFiatValue: computed,
      balances: computed.struct,
      loading: computed,
      chainWiseErrorStatus: observable,
    });
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
      let loadingStatus: boolean = false;
      const allMoveChains = Object.keys(this.chainInfosStore.chainInfos).filter(
        (chain) =>
          (network === 'testnet' ||
            this.chainInfosStore.chainInfos[chain as SupportedChain]?.chainId !==
              this.chainInfosStore.chainInfos[chain as SupportedChain]?.testnetChainId) &&
          this.chainInfosStore.chainInfos[chain as SupportedChain]?.chainId?.startsWith('aptos'),
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

  getErrorStatusForChain(chain: SupportedChain, network: SelectedNetworkType) {
    const balanceKey = this.getBalanceKey(chain, network);
    return this.chainWiseErrorStatus[balanceKey] === true;
  }

  get balances() {
    const chain = this.activeChainStore.activeChain;
    const network = this.selectedNetworkStore.selectedNetwork;
    if (chain === 'aggregated') {
      const tokens: Token[] = [];
      const allMoveChains = Object.keys(this.chainInfosStore.chainInfos).filter(
        (chain) =>
          (network === 'testnet' ||
            this.chainInfosStore.chainInfos[chain as SupportedChain]?.chainId !==
              this.chainInfosStore.chainInfos[chain as SupportedChain]?.testnetChainId) &&
          this.chainInfosStore.chainInfos[chain as SupportedChain]?.chainId?.startsWith('aptos'),
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

  getAggregatedBalances(forceNetwork?: SelectedNetworkType) {
    const network = forceNetwork ?? this.selectedNetworkStore.selectedNetwork;
    const tokens: Token[] = [];
    const allMoveChains = Object.keys(this.chainInfosStore.chainInfos).filter(
      (chain) =>
        (network === 'testnet' ||
          this.chainInfosStore.chainInfos[chain as SupportedChain]?.chainId !==
            this.chainInfosStore.chainInfos[chain as SupportedChain]?.testnetChainId) &&
        isAptosChain(chain),
    ) as SupportedChain[];
    for (const chain of allMoveChains) {
      const balanceKey = this.getBalanceKey(chain, network);
      if (this.chainWiseBalances[balanceKey]) {
        tokens.push(...(this.chainWiseBalances[balanceKey] ?? []));
      }
    }
    return sortTokenBalances(tokens);
  }

  async getChainData(
    chain: SupportedChain,
    network: SelectedNetworkType,
    forceRefetch = false,
    forceUseFallback = false,
  ) {
    const { chain: _chain, chainInfo } = this.getChain(chain);
    const address = this.addressStore.addresses[_chain];
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

    if (this.chainWiseBalances[balanceKey] && !forceRefetch) {
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
  }

  async getData(forceChain?: AggregatedSupportedChainType, forceNetwork?: SelectedNetworkType, forceRefetch = false) {
    const network = forceNetwork ?? this.selectedNetworkStore.selectedNetwork;
    const _chain = forceChain ?? this.activeChainStore.activeChain;

    if (_chain === 'aggregated') {
      const allMoveChains: SupportedChain[] = [];
      const supportedChainWiseAddresses: Partial<Record<SupportedChain, string>> = {};
      Object.keys(this.chainInfosStore.chainInfos)
        .filter(
          (chain) =>
            (network === 'testnet' ||
              this.chainInfosStore.chainInfos[chain as SupportedChain]?.chainId !==
                this.chainInfosStore.chainInfos[chain as SupportedChain]?.testnetChainId) &&
            this.chainInfosStore.chainInfos[chain as SupportedChain]?.chainId?.startsWith('aptos'),
        )
        .forEach((chain) => {
          const balanceKey = this.getBalanceKey(chain as SupportedChain, network);
          if (this.chainWiseBalances[balanceKey] && !forceRefetch) {
            runInAction(() => {
              this.chainWiseLoadingStatus[balanceKey] = false;
            });
            return;
          }
          allMoveChains.push(chain as SupportedChain);
          supportedChainWiseAddresses[chain as SupportedChain] = this.addressStore.addresses[chain as SupportedChain];
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
        const balanceKey = this.getBalanceKey(chain, network);
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
          chainsToUseFallbackFor.map((chain) => this.getChainData(chain, network, forceRefetch, true)),
        );
      }
      return;
    }

    await this.getChainData(_chain, network, forceRefetch);
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

  private getBalanceKey(chain: SupportedChain, _network?: SelectedNetworkType, _address?: string): string {
    const network = _network ?? this.selectedNetworkStore.selectedNetwork;
    const chainKey = this.getChainKey(chain as SupportedChain, network);
    const address = _address ?? this.addressStore.addresses[chain as SupportedChain];
    const userPreferredCurrency = this.currencyStore.preferredCurrency;
    return `${chainKey}-${address}-${userPreferredCurrency}`;
  }

  private getChainKey(chain: SupportedChain, network: SelectedNetworkType): string {
    const chainId = network === 'testnet' ? ChainInfos[chain]?.testnetChainId : ChainInfos[chain]?.chainId;
    return `${chain}-${chainId}`;
  }
}
