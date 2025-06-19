import {
  axiosWrapper,
  ChainInfos,
  denoms as DefaultDenoms,
  fromSmallBN,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk';
import { BigNumber } from 'bignumber.js';
import { computed, makeObservable, observable, runInAction } from 'mobx';

import { AggregatedChainsStore } from '../assets/aggregated-chains-store';
import { ChainInfosStore } from '../assets/chain-infos-store';
import { DenomsStore } from '../assets/denoms-store';
import { BaseQueryStore } from '../base/base-data-store';
import { AggregatedSupportedChainType, SelectedNetworkType } from '../types';
import { isBitcoinChain } from '../utils';
import { generateRandomString } from '../utils/random-string-generator';
import { ActiveChainStore, AddressStore, CurrencyStore, SelectedNetworkStore } from '../wallet';
import { sortTokenBalances } from './balance-calculator';
import { Token } from './balance-types';
import { PriceStore } from './price-store';

export interface IRawBalanceResponse {
  balances: Array<{ amount: string; denom: string }>;
  pagination: { next_key: any; total: string };
}

/**
 * @deprecated
 */
export class BitcoinBalanceStore extends BaseQueryStore<IRawBalanceResponse> {
  rpcUrl: string;
  address: string;
  chain: string;

  constructor(rpcUrl: string, address: string, chain: string) {
    super();
    makeObservable(this);

    this.rpcUrl = rpcUrl;
    this.address = address;
    this.chain = chain;
  }

  async fetchData() {
    const { data } = await axiosWrapper({
      baseURL: this.rpcUrl,
      method: 'get',
      url: `/address/${this.address}/utxo`,
    });

    let totalAmount = 0;
    data.forEach((utxo: any) => {
      totalAmount += utxo.value;
    });

    return {
      balances: [
        {
          amount: totalAmount.toString(),
          denom: this.chain === 'bitcoin' ? 'bitcoin-native' : 'bitcoin-signet-native',
        },
      ],
      pagination: { next_key: null, total: '1' },
    };
  }
}

export class BitcoinDataQueryStore extends BaseQueryStore<Array<Token>> {
  constructor(
    private restUrl: string,
    private address: string,
    private chain: SupportedChain,
    private network: SelectedNetworkType,
    private priceStore: PriceStore,
    private denomsStore: DenomsStore,
    private chainInfosStore: ChainInfosStore,
  ) {
    super();
  }

  async fetchData() {
    try {
      await this.waitForPriceStore();
      const address = this.address;
      if (!isBitcoinChain(this.chain) && !address) {
        return [];
      }

      const { data } = await axiosWrapper({
        baseURL: this.restUrl,
        method: 'get',
        url: `/address/${this.address}/utxo`,
      });

      let totalAmount = 0;
      data.forEach((utxo: any) => {
        totalAmount += utxo.value;
      });

      await this.denomsStore.readyPromise;
      const denoms = Object.assign({}, this.denomsStore.denoms, DefaultDenoms);
      const denom = this.chain === 'bitcoin' ? 'bitcoin-native' : 'bitcoin-signet-native';
      const denomInfo = denoms[denom];
      if (!denomInfo) {
        return [];
      }
      const formattedAmount = fromSmallBN(totalAmount.toString(), denomInfo.coinDecimals);
      const coingeckoPrices = this.priceStore.data;
      let usdPrice = coingeckoPrices?.[denomInfo.coinGeckoId];
      if (!usdPrice) {
        const chainId =
          this.network === 'testnet'
            ? this.chainInfosStore.chainInfos[this.chain].testnetChainId
            : this.chainInfosStore.chainInfos[this.chain].chainId;
        const alternateKey = `${chainId}-${denomInfo.coinMinimalDenom}`;
        usdPrice = this.priceStore.prices[alternateKey];
      }
      const usdValue = usdPrice ? formattedAmount.multipliedBy(usdPrice).toString() : undefined;
      const tokensData = [
        {
          amount: formattedAmount.toString(),
          coinMinimalDenom: denom,
          symbol: denomInfo.coinDenom,
          img: denomInfo.icon,
          name: denomInfo.name,
          usdValue,
          usdPrice: String(usdPrice),
          chain: denomInfo?.chain ?? '',
          coinDecimals: denomInfo?.coinDecimals,
          coinGeckoId: denomInfo?.coinGeckoId,
          tokenBalanceOnChain: this.chain,
          id: generateRandomString(10),
        },
      ];
      return tokensData;
    } catch (e) {
      console.error(`Error fetching bitcoin balance for ${this.chain}`, e);
      this.setError(e as Error);
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
}

export class BitcoinDataStore {
  public chainWiseBalances: Record<string, Token[]> = {};
  public chainWiseLoadingStatus: Record<string, boolean> = {};
  public chainWiseErrorStatus: Record<string, boolean> = {};

  constructor(
    private activeChainStore: ActiveChainStore,
    private selectedNetworkStore: SelectedNetworkStore,
    private addressStore: AddressStore,
    private priceStore: PriceStore,
    private denomsStore: DenomsStore,
    private chainInfosStore: ChainInfosStore,
    private aggregatedChainsStore: AggregatedChainsStore,
    private currencyStore: CurrencyStore,
  ) {
    makeObservable(this, {
      chainWiseBalances: observable,
      chainWiseLoadingStatus: observable,
      chainWiseErrorStatus: observable,
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
    const chain = this.activeChainStore.activeChain;
    const network = this.selectedNetworkStore.selectedNetwork;

    if (chain === 'aggregated') {
      if (!this.aggregatedChainsStore.aggregatedChainsData.includes('bitcoin')) {
        return false;
      }
      const balanceKey = this.getBalanceKey('bitcoin', network);
      return this.chainWiseLoadingStatus[balanceKey];
    }

    if (!isBitcoinChain(chain)) {
      return false;
    }

    const balanceKey = this.getBalanceKey(chain);
    return this.chainWiseLoadingStatus[balanceKey] !== false;
  }

  getErrorStatusForChain(chain: SupportedChain, network: SelectedNetworkType) {
    const balanceKey = this.getBalanceKey(chain, network);
    return this.chainWiseErrorStatus[balanceKey] ?? false;
  }

  get balances() {
    const chain = this.activeChainStore.activeChain;
    const network = this.selectedNetworkStore.selectedNetwork;
    if (chain === 'aggregated') {
      const tokens: Token[] = [];
      if (!this.aggregatedChainsStore.aggregatedChainsData.includes('bitcoin')) {
        return tokens;
      }
      const balanceKey = this.getBalanceKey('bitcoin', network);
      return sortTokenBalances(this.chainWiseBalances[balanceKey] ?? []);
    }

    const balanceKey = this.getBalanceKey(chain);
    return this.chainWiseBalances[balanceKey] ? sortTokenBalances(this.chainWiseBalances[balanceKey] ?? []) : [];
  }

  getAggregatedBalances(forceNetwork?: SelectedNetworkType) {
    const network = forceNetwork ?? this.selectedNetworkStore.selectedNetwork;
    const tokens: Token[] = [];
    if (!this.aggregatedChainsStore.aggregatedChainsData.includes('bitcoin')) {
      return tokens;
    }
    const balanceKey = this.getBalanceKey('bitcoin', network);
    return sortTokenBalances(this.chainWiseBalances[balanceKey] ?? []);
  }

  async getChainData(chain: SupportedChain, network: SelectedNetworkType, forceRefetch = false) {
    const address = this.addressStore.addresses[chain];
    const balanceKey = this.getBalanceKey(chain as SupportedChain, network, address);
    if (!address || !isBitcoinChain(chain)) {
      runInAction(() => {
        this.chainWiseLoadingStatus[balanceKey] = false;
      });
      return;
    }
    const chainInfo = this.chainInfosStore.chainInfos[chain];

    runInAction(() => {
      this.chainWiseLoadingStatus[balanceKey] = true;
    });

    const selectedNetwork = this.selectedNetworkStore.selectedNetwork;
    const restUrl = selectedNetwork === 'testnet' ? chainInfo.apis.rpcTestBlockbook : chainInfo.apis.rpcBlockbook;
    if (!restUrl) {
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

    const bitcoinDataStore = new BitcoinDataQueryStore(
      restUrl,
      address,
      chain,
      network,
      this.priceStore,
      this.denomsStore,
      this.chainInfosStore,
    );
    try {
      const data = await bitcoinDataStore.getData();
      runInAction(() => {
        this.chainWiseBalances[balanceKey] = data ?? [];
        this.chainWiseLoadingStatus[balanceKey] = bitcoinDataStore.isLoading;
        this.chainWiseErrorStatus[balanceKey] = bitcoinDataStore.error ? true : false;
      });
    } catch (e) {
      runInAction(() => {
        this.chainWiseBalances[balanceKey] = [];
        this.chainWiseErrorStatus[balanceKey] = true;
      });
    }
  }

  async getData(forceChain?: AggregatedSupportedChainType, forceNetwork?: SelectedNetworkType, forceRefetch = false) {
    const network = forceNetwork ?? this.selectedNetworkStore.selectedNetwork;
    const _chain = forceChain ?? this.activeChainStore.activeChain;

    if (_chain === 'aggregated') {
      await this.aggregatedChainsStore.readyPromise;
      if (!this.aggregatedChainsStore.aggregatedChainsData.includes('bitcoin')) {
        return;
      }
      await this.getChainData('bitcoin', network, forceRefetch);
      return;
    }

    await this.getChainData(_chain, network, forceRefetch);
    return;
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
