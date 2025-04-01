import { Aptos, APTOS_COIN, APTOS_FA, AptosConfig } from '@aptos-labs/ts-sdk';
import {
  aptosChainNativeFATokenMapping,
  aptosChainNativeTokenMapping,
  axiosWrapper,
  ChainInfos,
  denoms as DefaultDenoms,
  DenomsRecord,
  fromSmallBN,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk';
import { BigNumber } from '@leapwallet/cosmos-wallet-sdk/dist/browser/proto/injective/utils/classes';
import { AxiosError } from 'axios';
import { computed, makeObservable, observable, runInAction } from 'mobx';
import { SelectedNetworkType } from 'types';

import { DenomsStore } from '../assets/denoms-store';
import { BaseQueryStore } from '../base/base-data-store';
import { ActiveChainStore, AddressStore, SelectedNetworkStore } from '../wallet';
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
  ) {
    super();
  }

  async fetchData() {
    await this.waitForPriceStore();

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
    const tokensData = tokens
      .filter((token) => token.metadata && token?.metadata.decimals && parseInt(token.amount) !== 0)
      .map((token) => {
        const amount = fromSmallBN(token.amount, token.metadata?.decimals);
        const coingeckoPrices = this.priceStore.data;
        let img = token.metadata?.icon_uri ?? '';
        let usdValue = undefined;
        let usdPrice = undefined;
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
          usdPrice = coingeckoPrices?.[denomInfo.coinGeckoId];
          usdValue = amount.multipliedBy(usdPrice ?? 0);
        }
        if (!denomInfo) {
          denomsToAdd[coinMinimalDenom] = {
            name,
            coinDenom,
            icon: img,
            coinGeckoId: '',
            coinDecimals: token.metadata?.decimals || 8,
            coinMinimalDenom,
            chain: this.chain,
          };
        }

        return {
          name: token.metadata?.name ?? '',
          symbol: token.metadata?.symbol ?? '',
          coinMinimalDenom,
          amount: amount.toString(),
          usdValue: usdValue?.toString(),
          percentChange: undefined,
          img: denomInfo?.icon ?? img,
          ibcDenom: undefined,
          ibcChainInfo: undefined,
          usdPrice: usdPrice?.toString(),
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
  private async waitForPriceStore() {
    try {
      await this.priceStore.readyPromise;
    } catch (e) {
      //
    }
  }
}

export class AptosCoinDataStore {
  public balanceRecord: Record<string, AptosCoinDataQueryStore> = {};
  static DEFAULT_CHAIN: SupportedChain = 'movement';
  constructor(
    private activeChainStore: ActiveChainStore,
    private selectedNetworkStore: SelectedNetworkStore,
    private addressStore: AddressStore,
    private priceStore: PriceStore,
    private denomsStore: DenomsStore,
  ) {
    makeObservable(this, {
      balanceRecord: observable,
      totalFiatValue: computed,
      balances: computed.struct,
      loading: computed,
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
    const chain = this.activeChainStore.activeChain as SupportedChain;
    const balanceKey = this.getBalanceKey(chain);
    if (this.balanceRecord[balanceKey]) {
      return this.balanceRecord[balanceKey].isLoading;
    }
    return true;
  }

  get balances() {
    const { chain } = this.getChain();

    const balanceKey = this.getBalanceKey(chain);
    return this.balanceRecord[balanceKey] ? sortTokenBalances(this.balanceRecord[balanceKey].data ?? []) : [];
  }

  async getData() {
    const network = this.selectedNetworkStore.selectedNetwork;
    const { chain, chainInfo } = this.getChain();
    const address = this.addressStore.addresses[chain];
    if (!address) {
      return;
    }
    const selectedNetwork = this.selectedNetworkStore.selectedNetwork;
    const restUrl = selectedNetwork === 'testnet' ? chainInfo.apis.restTest : chainInfo.apis.rest;
    const indexerApi = selectedNetwork === 'testnet' ? chainInfo.apis.indexerTest : chainInfo.apis.indexer;
    if (!restUrl || !indexerApi) {
      return;
    }
    const balanceKey = this.getBalanceKey(chain as SupportedChain, network, address);
    const aptosCoinDataStore = new AptosCoinDataQueryStore(
      restUrl,
      indexerApi,
      address,
      chain,
      this.priceStore,
      this.denomsStore,
    );
    await aptosCoinDataStore.getData();
    runInAction(() => {
      this.balanceRecord[balanceKey] = aptosCoinDataStore ?? [];
    });
  }

  private getChain() {
    let chain = this.activeChainStore.activeChain as SupportedChain;
    let chainInfo = ChainInfos[chain];
    const isAptosChain = chainInfo?.chainId.startsWith('aptos');
    if (!isAptosChain) {
      chainInfo = ChainInfos[AptosCoinDataStore.DEFAULT_CHAIN];
      chain = AptosCoinDataStore.DEFAULT_CHAIN;
    }
    return { chainInfo, chain };
  }

  private getBalanceKey(chain: SupportedChain, _network?: SelectedNetworkType, _address?: string): string {
    const network = _network ?? this.selectedNetworkStore.selectedNetwork;
    const chainKey = this.getChainKey(chain as SupportedChain, network);
    const address = _address ?? this.addressStore.addresses[chain as SupportedChain];
    return `${chainKey}-${address}`;
  }

  private getChainKey(chain: SupportedChain, network: SelectedNetworkType): string {
    const chainId = network === 'testnet' ? ChainInfos[chain].testnetChainId : ChainInfos[chain].chainId;
    return `${chain}-${chainId}`;
  }
}
