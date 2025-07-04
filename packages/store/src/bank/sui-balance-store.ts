import { DenomsRecord, getBaseURL, isSuiChain, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import axios from 'axios';
import { BigNumber } from 'bignumber.js';
import { computed, makeObservable, observable, runInAction } from 'mobx';
import { computedFn } from 'mobx-utils';
import { SelectedNetworkType } from 'types';

import { ChainInfosStore, CoingeckoIdsStore, RootDenomsStore } from '../assets';
import { BaseQueryStore } from '../base/base-data-store';
import { ActiveChainStore, AddressStore, CurrencyStore, SelectedNetworkStore } from '../wallet';
import { sortTokenBalances } from './balance-calculator';
import { Token } from './balance-types';
import { PriceStore } from './price-store';

export class SuiCoinDataQueryStore extends BaseQueryStore<Array<Token>> {
  constructor(
    private address: string,
    private chain: SupportedChain,
    private priceStore: PriceStore,
    private rootDenomsStore: RootDenomsStore,
    private selectedNetwork: string,
    private coingeckoIdsStore: CoingeckoIdsStore,
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
        url: `${getBaseURL()}/v1/balances/sui`,
        method: 'POST',
        data: {
          address: this.address,
          selectedNetwork: this.selectedNetwork,
        },
      });
      const tokens = Object.entries(allBalances).map(([tokenAddress, data]) => {
        const isNative = tokenAddress === '0x2::sui::SUI';
        const denomData = isNative ? denoms['mist'] : denoms[tokenAddress];
        const coinGeckoId =
          data?.coingeckoId ||
          denomData?.coinGeckoId ||
          coingeckoIds[tokenAddress] ||
          coingeckoIds[tokenAddress?.toLowerCase()] ||
          '';

        const amount = data.amount;

        let usdValue;
        let tokenPrice;

        if (parseFloat(amount) > 0) {
          if (coingeckoPrices) {
            const alternateCoingeckoKey = `${this.chain || ''}-${tokenAddress}`;

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
        if (!denomData) {
          denomsToAdd[tokenAddress] = {
            name: data.name,
            coinDenom: data.symbol,
            icon: data.image,
            coinGeckoId: '',
            coinDecimals: data.decimals,
            coinMinimalDenom: tokenAddress,
            chain: this.chain,
          };
        } else if (!denomData?.coinGeckoId && coinGeckoId) {
          denomsToAdd[tokenAddress] = {
            ...denomData,
            coinGeckoId,
          };
        }

        return {
          name: data.name,
          symbol: data.symbol,
          coinMinimalDenom: isNative ? 'mist' : tokenAddress,
          amount: data.amount,
          usdValue,
          percentChange: undefined,
          img: denomData ? denomData.icon : data.image,
          ibcDenom: undefined,
          ibcChainInfo: undefined,
          usdPrice: tokenPrice ? String(tokenPrice) : undefined,
          coinDecimals: data.decimals,
          invalidKey: false,
          chain: 'sui',
          coinGeckoId,
          isEvm: false,
          tokenBalanceOnChain: this.chain,
          isSolana: false,
          tokenAddress: tokenAddress,
          isSui: true,
        };
      });

      if (Object.keys(denomsToAdd).length > 0) {
        this.rootDenomsStore.baseDenomsStore.setTempBaseDenoms(denomsToAdd);
      }

      return tokens.filter((token) => new BigNumber(token.amount).gt(0));
    } catch (err) {
      console.error('Error fetching Sui balances:', err);
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

export class SuiCoinDataStore {
  public balanceRecord: Record<string, SuiCoinDataQueryStore> = {};
  static DEFAULT_CHAIN: SupportedChain = 'sui';
  private currentChain: SupportedChain = 'sui';
  public suiBalances: Record<string, Token[]> = {};

  constructor(
    private activeChainStore: ActiveChainStore,
    private selectedNetworkStore: SelectedNetworkStore,
    private addressStore: AddressStore,
    private priceStore: PriceStore,
    private rootDenomsStore: RootDenomsStore,
    private chainInfosStore: ChainInfosStore,
    private currencyStore: CurrencyStore,
    private coingeckoIdsStore: CoingeckoIdsStore,
  ) {
    makeObservable(this, {
      balanceRecord: observable,
      suiBalances: observable.deep,
      totalFiatValue: computed,
      balances: computed,
      loading: computed,
    });
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
      const allSuiChains = Object.keys(this.chainInfosStore.chainInfos).filter(
        (chain) =>
          (network === 'testnet' ||
            this.chainInfosStore.chainInfos[chain as SupportedChain]?.chainId !==
              this.chainInfosStore.chainInfos[chain as SupportedChain]?.testnetChainId) &&
          isSuiChain(chain),
      ) as SupportedChain[];
      for (const chain of allSuiChains) {
        const balanceKey = this.getBalanceKey(chain, this.addressStore.addresses[chain], network);
        if (this.suiBalances[balanceKey]) {
          const chainWiseLoadingStatus = this.suiBalances[balanceKey] ? false : true;
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
    if (this.suiBalances[balanceKey]) {
      return this.suiBalances[balanceKey] ? false : true;
    }
    return false;
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
          isSuiChain(chain),
      );
      for (const chain of allChains) {
        const balanceKey = this.getBalanceKey(
          chain as SupportedChain,
          this.addressStore.addresses[chain as SupportedChain],
          network,
        );
        if (!this.suiBalances[balanceKey]) {
          this.getData(chain as SupportedChain, network);
        }
        this.suiBalances[balanceKey] && tokens.push(...this.suiBalances[balanceKey]);
      }

      return sortTokenBalances(tokens);
    }
    const balanceKey = this.getBalanceKey(chain, this.addressStore.addresses[chain], network);
    return this.suiBalances[balanceKey] ? sortTokenBalances(this.suiBalances[balanceKey]) : [];
  }

  getAggregatedBalances(forceNetwork?: SelectedNetworkType) {
    const network = forceNetwork ?? this.selectedNetworkStore.selectedNetwork;
    const allChains = Object.keys(this.chainInfosStore.chainInfos).filter(
      (chain) =>
        (network === 'testnet' ||
          this.chainInfosStore.chainInfos[chain as SupportedChain]?.chainId !==
            this.chainInfosStore.chainInfos[chain as SupportedChain]?.testnetChainId) &&
        isSuiChain(chain),
    );
    const tokens: Token[] = [];
    for (const chain of allChains) {
      const balanceKey = this.getBalanceKey(
        chain as SupportedChain,
        this.addressStore.addresses?.[chain as SupportedChain],
        network,
      );
      if (!this.suiBalances[balanceKey]) {
        this.getData(chain as SupportedChain, network);
      }
      this.suiBalances[balanceKey] && tokens.push(...this.suiBalances[balanceKey]);
    }
    return sortTokenBalances(tokens);
  }

  getSuiBalances = computedFn((chain: SupportedChain, network: SelectedNetworkType) => {
    const balanceKey = this.getBalanceKey(chain, this.addressStore.addresses[chain], network);
    return this.suiBalances[balanceKey] ?? [];
  });

  async getData(chain?: SupportedChain, network?: SelectedNetworkType, forceRefetch = false) {
    const currentChain = chain ?? this.currentChain;
    const currentNetwork = network ?? this.selectedNetworkStore.selectedNetwork;
    const address = this.addressStore.addresses[currentChain];
    if (!address || !isSuiChain(currentChain)) {
      return;
    }

    const balanceKey = this.getBalanceKey(currentChain, address, currentNetwork);
    if (this.suiBalances[balanceKey] && !forceRefetch) {
      return;
    }

    const suiCoinDataStore = new SuiCoinDataQueryStore(
      address,
      currentChain,
      this.priceStore,
      this.rootDenomsStore,
      currentNetwork,
      this.coingeckoIdsStore,
    );
    const _suiBalances = await suiCoinDataStore.getData();
    runInAction(() => {
      this.suiBalances[balanceKey] = _suiBalances;
    });
  }

  private getBalanceKey(_chain: SupportedChain, _address?: string, _network?: SelectedNetworkType): string {
    const address = _address ?? this.addressStore.addresses[this.currentChain];
    const chainId =
      _network === 'testnet'
        ? this.chainInfosStore.chainInfos[_chain]?.testnetChainId
        : this.chainInfosStore.chainInfos[_chain]?.chainId;
    const userPreferredCurrency = this.currencyStore.preferredCurrency;
    return `${chainId}-${address}-${userPreferredCurrency}`;
  }
}
