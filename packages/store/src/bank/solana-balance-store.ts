import { DenomsRecord, getBaseURL, isSolanaChain, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
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

const NATIVE_DENOM = {
  solana: 'lamports',
  fogo: 'fogo-native',
};

export class SolanaCoinDataQueryStore extends BaseQueryStore<Array<Token>> {
  constructor(
    private address: string,
    private chain: SupportedChain,
    private priceStore: PriceStore,
    private rootDenomsStore: RootDenomsStore,
    private selectedNetwork: string,
    private coingeckoIdsStore: CoingeckoIdsStore,
    private chainInfosStore: ChainInfosStore,
    private forceRefetch: boolean = false,
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
        url: `${getBaseURL()}/v1/balances/solana`,
        method: 'POST',
        data: {
          address: this.address,
          selectedNetwork: this.selectedNetwork,
          chain: this.chain,
          forceRefetch: this.forceRefetch,
        },
      });
      const tokens = Object.entries(allBalances).map(([mintAddress, data]) => {
        const isNative = mintAddress === '11111111111111111111111111111111';
        const nativeDenom = NATIVE_DENOM[this.chain as keyof typeof NATIVE_DENOM];
        const denomData = isNative ? denoms[nativeDenom] : denoms[mintAddress];
        const coinGeckoId =
          data?.coingeckoId ||
          denomData?.coinGeckoId ||
          coingeckoIds[mintAddress] ||
          coingeckoIds[mintAddress?.toLowerCase()] ||
          '';

        const amount = data.amount;
        const chainId = this.chainInfosStore.chainInfos[this.chain]?.chainId;

        let usdValue;
        let tokenPrice;

        if (parseFloat(amount) > 0) {
          if (coingeckoPrices) {
            const alternateCoingeckoKey = `${chainId || ''}-${mintAddress}`;

            if (coinGeckoId) {
              tokenPrice = coingeckoPrices[coinGeckoId];
            }

            // TODO: add data.usdPrice in future with exchange rates to use prices from external APIs
            if (!tokenPrice) {
              tokenPrice =
                coingeckoPrices[alternateCoingeckoKey] ?? coingeckoPrices[alternateCoingeckoKey?.toLowerCase()];
            }

            if (tokenPrice) {
              // TODO: add data.usdAmount in future with exchange rates to use prices from external APIs
              usdValue = new BigNumber(amount).times(tokenPrice).toString();
            }
          }
        }

        if (!denomData) {
          denomsToAdd[mintAddress] = {
            name: data.name,
            coinDenom: data.symbol,
            icon: data.image,
            coinGeckoId,
            coinDecimals: data.decimals,
            coinMinimalDenom: mintAddress,
            chain: this.chain,
          };
        } else if (!denomData?.coinGeckoId && coinGeckoId) {
          denomsToAdd[mintAddress] = {
            ...denomData,
            coinGeckoId,
          };
        }
        return {
          name: denomData?.name || data.name,
          symbol: denomData?.coinDenom || data.symbol,
          coinMinimalDenom: isNative ? nativeDenom : data.mintAddress,
          amount: data.amount,
          usdValue,
          percentChange: undefined,
          img: denomData?.icon || data.image,
          ibcDenom: undefined,
          ibcChainInfo: undefined,
          usdPrice: tokenPrice ? String(tokenPrice) : undefined,
          coinDecimals: data.decimals,
          invalidKey: false,
          chain: this.chain,
          coinGeckoId,
          isEvm: false,
          tokenBalanceOnChain: this.chain,
          isSolana: true,
          tokenAddress: data.mintAddress,
          isSui: false,
        };
      });

      if (Object.keys(denomsToAdd).length > 0) {
        this.rootDenomsStore.baseDenomsStore.setTempBaseDenoms(denomsToAdd);
      }

      return tokens.filter((token) => new BigNumber(token.amount).gt(0));
    } catch (err) {
      console.error('Error fetching Solana balances:', err);
      this.setError(err as Error);
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

export class SolanaCoinDataStore {
  public balanceRecord: Record<string, SolanaCoinDataQueryStore> = {};
  static DEFAULT_CHAIN: SupportedChain = 'solana';
  private currentChain: SupportedChain = 'solana';
  public solanaBalances: Record<string, Token[]> = {};
  public chainWiseErrorStatus: Record<string, boolean> = {};

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
      solanaBalances: observable.deep,
      totalFiatValue: computed,
      balances: computed,
      loading: computed,
      chainWiseErrorStatus: observable,
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
      const allSolanaChains = Object.keys(this.chainInfosStore.chainInfos).filter(
        (chain) =>
          (network === 'testnet' ||
            this.chainInfosStore.chainInfos[chain as SupportedChain]?.chainId !==
              this.chainInfosStore.chainInfos[chain as SupportedChain]?.testnetChainId) &&
          isSolanaChain(chain),
      ) as SupportedChain[];
      for (const chain of allSolanaChains) {
        const balanceKey = this.getBalanceKey(chain, this.addressStore.addresses[chain], network);
        if (this.solanaBalances[balanceKey]) {
          const chainWiseLoadingStatus = this.solanaBalances[balanceKey] ? false : true;
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
    if (this.solanaBalances[balanceKey]) {
      return this.solanaBalances[balanceKey] ? false : true;
    }
    return false;
  }

  getErrorStatusForChain(chain: SupportedChain, network: SelectedNetworkType) {
    try {
      const balanceKey = this.getBalanceKey(chain, this.addressStore.addresses?.[chain], network);
      return this.chainWiseErrorStatus[balanceKey] ?? false;
    } catch (e) {
      return false;
    }
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
          isSolanaChain(chain),
      );
      for (const chain of allChains) {
        const balanceKey = this.getBalanceKey(
          chain as SupportedChain,
          this.addressStore.addresses[chain as SupportedChain],
          network,
        );
        if (!this.solanaBalances[balanceKey]) {
          this.getData(chain as SupportedChain, network);
        }
        this.solanaBalances[balanceKey] && tokens.push(...this.solanaBalances[balanceKey]);
      }

      return sortTokenBalances(tokens);
    }
    const balanceKey = this.getBalanceKey(chain, this.addressStore.addresses[chain], network);
    return this.solanaBalances[balanceKey] ? sortTokenBalances(this.solanaBalances[balanceKey]) : [];
  }

  getAggregatedBalances(forceNetwork?: SelectedNetworkType) {
    const network = forceNetwork ?? this.selectedNetworkStore.selectedNetwork;
    const allChains = Object.keys(this.chainInfosStore.chainInfos).filter(
      (chain) =>
        (network === 'testnet' ||
          this.chainInfosStore.chainInfos[chain as SupportedChain]?.chainId !==
            this.chainInfosStore.chainInfos[chain as SupportedChain]?.testnetChainId) &&
        isSolanaChain(chain),
    );
    const tokens: Token[] = [];
    for (const chain of allChains) {
      const balanceKey = this.getBalanceKey(
        chain as SupportedChain,
        this.addressStore.addresses[chain as SupportedChain],
        network,
      );
      if (!this.solanaBalances[balanceKey]) {
        this.getData(chain as SupportedChain, network);
      }
      this.solanaBalances[balanceKey] && tokens.push(...this.solanaBalances[balanceKey]);
    }
    return sortTokenBalances(tokens);
  }

  getSolanaBalances = computedFn((chain: SupportedChain, network: SelectedNetworkType) => {
    const balanceKey = this.getBalanceKey(chain, this.addressStore.addresses[chain], network);
    return this.solanaBalances[balanceKey] ?? [];
  });

  async getData(chain?: SupportedChain, network?: SelectedNetworkType, forceRefetch = false) {
    const currentChain = chain ?? (this.activeChainStore.activeChain as SupportedChain);
    const currentNetwork = network ?? this.selectedNetworkStore.selectedNetwork;
    const address = this.addressStore.addresses[currentChain];
    if (!address || !isSolanaChain(currentChain)) {
      return;
    }

    const balanceKey = this.getBalanceKey(currentChain, address, currentNetwork);

    if (this.solanaBalances[balanceKey] && !forceRefetch) {
      return;
    }

    const solanaCoinDataStore = new SolanaCoinDataQueryStore(
      address,
      currentChain,
      this.priceStore,
      this.rootDenomsStore,
      currentNetwork,
      this.coingeckoIdsStore,
      this.chainInfosStore,
      forceRefetch,
    );
    try {
      const _solanaBalances = await solanaCoinDataStore.getData();
      runInAction(() => {
        this.solanaBalances[balanceKey] = _solanaBalances;
        this.chainWiseErrorStatus[balanceKey] = solanaCoinDataStore.error ? true : false;
      });
    } catch (e) {
      console.log('here', e);
      runInAction(() => {
        this.solanaBalances[balanceKey] = [];
        this.chainWiseErrorStatus[balanceKey] = true;
      });
    }
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
