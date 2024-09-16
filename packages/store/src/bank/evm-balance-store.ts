import {
  denoms as DefaultDenoms,
  fetchSeiEvmBalances,
  pubKeyToEvmAddressToShow,
  SupportedChain,
  SupportedDenoms,
} from '@leapwallet/cosmos-wallet-sdk';
import BigNumber from 'bignumber.js';
import { computed, makeAutoObservable } from 'mobx';

import { ChainInfosStore, CompassSeiEvmConfigStore, RootDenomsStore } from '../assets';
import { AggregatedSupportedChainType, LoadingStatusType, SelectedNetworkType, StorageAdapter } from '../types';
import { balanceCalculator } from '../utils';
import { ActiveChainStore, AddressStore, SelectedNetworkStore } from '../wallet';
import { PriceStore } from './balance-store';
import { Token } from './balance-types';

export class EvmBalanceStore {
  activeChainStore: ActiveChainStore;
  selectedNetworkStore: SelectedNetworkStore;
  addressStore: AddressStore;
  chainInfosStore: ChainInfosStore;
  compassSeiEvmConfigStore: CompassSeiEvmConfigStore;
  rootDenomsStore: RootDenomsStore;
  storageAdapter: StorageAdapter;
  priceStore: PriceStore;

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
  }

  get evmBalance() {
    return this.evmBalanceForChain(this.activeChainStore.activeChain);
  }

  evmBalanceForChain(chain: AggregatedSupportedChainType) {
    if (chain === 'aggregated') {
      return {
        evmBalance: [],
        currencyInFiatValue: new BigNumber(0),
        status: 'success',
      };
    }

    const balanceKey = this.getBalanceKey(chain);
    return {
      evmBalance: this.chainWiseEvmBalance[balanceKey]?.evmBalance ?? [],
      currencyInFiatValue: this.chainWiseEvmBalance[balanceKey]?.currencyInFiatValue ?? new BigNumber(0),
      status: this.chainWiseEvmStatus[balanceKey] ?? 'success',
    };
  }

  async loadEvmBalance(_chain?: SupportedChain, _network?: SelectedNetworkType) {
    const chain = _chain || this.activeChainStore.activeChain;
    const network = _network || this.selectedNetworkStore.selectedNetwork;

    const isSeiEvmChain = this.activeChainStore.isSeiEvm(chain);
    const chainInfo = this.chainInfosStore.chainInfos[chain as SupportedChain];
    const isEvmChain = isSeiEvmChain || chainInfo?.evmOnlyChain;

    const evmBalance: Token[] = [];
    let currencyInFiatValue = new BigNumber(0);
    const balanceKey = this.getBalanceKey(chain);
    this.chainWiseEvmStatus[balanceKey] = 'loading';

    try {
      if (isEvmChain && chain !== 'aggregated') {
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
      this.chainWiseEvmBalance[balanceKey] = { evmBalance, currencyInFiatValue };
      this.chainWiseEvmStatus[balanceKey] = 'success';
    } catch (_) {
      this.chainWiseEvmBalance[balanceKey] = { evmBalance, currencyInFiatValue };
      this.chainWiseEvmStatus[balanceKey] = 'success';
    }
  }

  private getBalanceKey(chain: AggregatedSupportedChainType): string {
    const chainKey = this.getChainKey(chain as SupportedChain);
    const address = this.addressStore.addresses[chain as SupportedChain];

    return `${chainKey}-${address}`;
  }

  private getChainKey(chain: AggregatedSupportedChainType): string {
    if (chain === 'aggregated') return 'aggregated';
    const chainId =
      this.selectedNetworkStore.selectedNetwork === 'testnet'
        ? this.chainInfosStore.chainInfos[chain].testnetChainId
        : this.chainInfosStore.chainInfos[chain].chainId;
    return `${chain}-${chainId}`;
  }
}
