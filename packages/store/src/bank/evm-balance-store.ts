import {
  denoms as DefaultDenoms,
  fetchSeiEvmBalances,
  pubKeyToEvmAddressToShow,
  SupportedChain,
  SupportedDenoms,
} from '@leapwallet/cosmos-wallet-sdk';
import BigNumber from 'bignumber.js';
import { computed, makeAutoObservable, runInAction } from 'mobx';

import { AggregatedChainsStore, ChainInfosStore, CompassSeiEvmConfigStore, RootDenomsStore } from '../assets';
import { AggregatedSupportedChainType, LoadingStatusType, SelectedNetworkType, StorageAdapter } from '../types';
import { balanceCalculator } from '../utils';
import { ActiveChainStore, AddressStore, SelectedNetworkStore } from '../wallet';
import { sortTokenBalances } from './balance-calculator';
import { Token } from './balance-types';
import { PriceStore } from './price-store';

export class EvmBalanceStore {
  activeChainStore: ActiveChainStore;
  selectedNetworkStore: SelectedNetworkStore;
  addressStore: AddressStore;
  chainInfosStore: ChainInfosStore;
  compassSeiEvmConfigStore: CompassSeiEvmConfigStore;
  rootDenomsStore: RootDenomsStore;
  storageAdapter: StorageAdapter;
  priceStore: PriceStore;
  aggregatedChainsStore: AggregatedChainsStore;

  aggregatedLoadingStatus: boolean = false;

  chainWiseEvmBalance: { [key: string]: { evmBalance: Token[]; currencyInFiatValue: BigNumber } } = {};
  chainWiseEvmStatus: { [key: string]: LoadingStatusType } = {};

  constructor(
    activeChainStore: ActiveChainStore,
    selectedNetworkStore: SelectedNetworkStore,
    addressStore: AddressStore,
    chainInfosStore: ChainInfosStore,
    compassSeiEvmConfigStore: CompassSeiEvmConfigStore,
    rootDenomsStore: RootDenomsStore,
    storageAdapter: StorageAdapter,
    priceStore: PriceStore,
    aggregatedChainsStore: AggregatedChainsStore,
  ) {
    makeAutoObservable(this, {
      evmBalance: computed,
    });
    this.activeChainStore = activeChainStore;
    this.selectedNetworkStore = selectedNetworkStore;
    this.addressStore = addressStore;
    this.chainInfosStore = chainInfosStore;
    this.compassSeiEvmConfigStore = compassSeiEvmConfigStore;
    this.rootDenomsStore = rootDenomsStore;
    this.storageAdapter = storageAdapter;
    this.priceStore = priceStore;
    this.aggregatedChainsStore = aggregatedChainsStore;
  }

  get evmBalance() {
    return this.evmBalanceForChain(this.activeChainStore.activeChain, this.selectedNetworkStore.selectedNetwork);
  }

  evmBalanceForChain(chain: AggregatedSupportedChainType, network?: SelectedNetworkType) {
    if (chain === 'aggregated') {
      let allTokens: Token[] = [];
      const chains = Object.keys(this.chainInfosStore?.chainInfos);
      let currencyInFiatValue = new BigNumber(0);

      chains.forEach((chain) => {
        const balanceKey = this.getBalanceKey(chain as SupportedChain, network);
        const evmTokens = this.chainWiseEvmBalance[balanceKey]?.evmBalance ?? [];
        allTokens = allTokens.concat(evmTokens);
        currencyInFiatValue = currencyInFiatValue.plus(
          this.chainWiseEvmBalance[balanceKey]?.currencyInFiatValue ?? new BigNumber(0),
        );
      });

      return {
        evmBalance: sortTokenBalances(allTokens),
        currencyInFiatValue,
        status: 'success',
      };
    }

    const balanceKey = this.getBalanceKey(chain, network);
    return {
      evmBalance: this.chainWiseEvmBalance[balanceKey]?.evmBalance ?? [],
      currencyInFiatValue: this.chainWiseEvmBalance[balanceKey]?.currencyInFiatValue ?? new BigNumber(0),
      status: this.chainWiseEvmStatus[balanceKey] ?? 'success',
    };
  }

  async fetchEvmBalance(chain: SupportedChain, network: SelectedNetworkType, refetch = false) {
    const isSeiEvmChain = this.activeChainStore.isSeiEvm(chain);
    const chainInfo = this.chainInfosStore.chainInfos[chain as SupportedChain];
    const isEvmChain = isSeiEvmChain || chainInfo?.evmOnlyChain;

    const evmBalance: Token[] = [];
    let currencyInFiatValue = new BigNumber(0);

    const balanceKey = this.getBalanceKey(chain, network);

    if (!refetch && this.chainWiseEvmBalance[balanceKey]) {
      return;
    }

    runInAction(() => {
      this.chainWiseEvmStatus[balanceKey] = 'loading';
    });

    try {
      if (isEvmChain) {
        const denoms = this.rootDenomsStore.allDenoms;
        const _nativeTokenKey = Object.keys(chainInfo?.nativeDenoms ?? {})?.[0];
        const nativeToken =
          denoms[_nativeTokenKey] ??
          DefaultDenoms[_nativeTokenKey as SupportedDenoms] ??
          chainInfo?.nativeDenoms?.[_nativeTokenKey];

        const pubKey = this.addressStore.pubKeys?.[chain];
        const evmJsonRpcUrl =
          network === 'testnet'
            ? chainInfo.apis.evmJsonRpcTest ?? chainInfo.apis.evmJsonRpc
            : chainInfo.apis.evmJsonRpc;

        const fetchEvmBalance = async () => {
          const ethWalletAddress = pubKeyToEvmAddressToShow(pubKey);

          if (ethWalletAddress.startsWith('0x') && evmJsonRpcUrl) {
            const balance = await fetchSeiEvmBalances(evmJsonRpcUrl, ethWalletAddress);
            const coingeckoPrices = this.priceStore.data;

            let usdValue;
            if (parseFloat(balance.amount) > 0) {
              if (coingeckoPrices) {
                let tokenPrice;
                const coinGeckoId = nativeToken?.coinGeckoId;
                const alternateCoingeckoKey = `${
                  (this.chainInfosStore.chainInfos?.[nativeToken?.chain as SupportedChain] ?? chainInfo).chainId
                }-${nativeToken?.coinMinimalDenom}`;

                if (coinGeckoId) {
                  tokenPrice = coingeckoPrices[coinGeckoId];
                }

                if (!tokenPrice) {
                  tokenPrice = coingeckoPrices[alternateCoingeckoKey];
                }

                if (tokenPrice) {
                  usdValue = new BigNumber(balance.amount).times(tokenPrice).toString();
                }
              }
            }

            const usdPrice =
              parseFloat(balance.amount) > 0 && usdValue
                ? (parseFloat(usdValue) / parseFloat(balance.amount)).toString()
                : '0';

            evmBalance.push({
              chain: nativeToken?.chain ?? '',
              name: nativeToken?.name,
              amount: balance.amount,
              symbol: nativeToken?.coinDenom,
              usdValue: usdValue ?? '',
              coinMinimalDenom: nativeToken?.coinMinimalDenom,
              img: nativeToken?.icon,
              ibcDenom: '',
              usdPrice,
              coinDecimals: nativeToken?.coinDecimals,
              coinGeckoId: nativeToken?.coinGeckoId,
              tokenBalanceOnChain: chain,
              isEvm: true,
            });
          }
        };

        const storedLinkedAddressState = await this.storageAdapter.get('sei-evm-linked-address-state');
        if (isSeiEvmChain && storedLinkedAddressState) {
          const linkedAddressState = JSON.parse(storedLinkedAddressState);
          const address = this.addressStore.addresses?.[chain];

          if (linkedAddressState[address]?.[chain]?.[network] !== 'done') {
            await fetchEvmBalance();
          }
        } else {
          await fetchEvmBalance();
        }
      }

      currencyInFiatValue = balanceCalculator(evmBalance);
      runInAction(() => {
        this.chainWiseEvmBalance[balanceKey] = { evmBalance, currencyInFiatValue };
        this.chainWiseEvmStatus[balanceKey] = 'success';
      });
    } catch (_) {
      runInAction(() => {
        this.chainWiseEvmBalance[balanceKey] = { evmBalance, currencyInFiatValue };
        this.chainWiseEvmStatus[balanceKey] = 'error';
      });
    }
  }

  async fetchAggregatedBalances(network: SelectedNetworkType, refetch = false) {
    runInAction(() => {
      this.aggregatedLoadingStatus = true;
    });

    await Promise.allSettled(
      this.aggregatedChainsStore.aggregatedChainsData.map((chain) =>
        this.fetchEvmBalance(chain as SupportedChain, network, refetch),
      ),
    );
    runInAction(() => {
      this.aggregatedLoadingStatus = false;
    });
    return;
  }

  async loadEvmBalance(_chain?: AggregatedSupportedChainType, _network?: SelectedNetworkType, refetch = false) {
    const chain = _chain || this.activeChainStore.activeChain;
    const network = _network || this.selectedNetworkStore.selectedNetwork;
    if (chain === 'aggregated') {
      await this.fetchAggregatedBalances(network, refetch);
    } else {
      await this.fetchEvmBalance(chain, network, refetch);
    }
  }

  getErrorStatusForChain(chain: SupportedChain, network: SelectedNetworkType) {
    const balanceKey = this.getBalanceKey(chain, network);
    return this.chainWiseEvmStatus[balanceKey] === 'error';
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
}
