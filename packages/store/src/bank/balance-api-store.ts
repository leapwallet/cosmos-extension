import { DenomsRecord, NativeDenom, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import axios from 'axios';
import BigNumber from 'bignumber.js';
import { makeAutoObservable } from 'mobx';
import { SelectedNetworkType } from 'types';

import { ChainInfosStore, CoingeckoIdsStore, DenomsStore } from '../assets';
import { getBaseURL, getIsCompass } from '../globals/config';
import { getNativeDenom } from '../utils';
import { fromSmall } from '../utils/balance-converter';
import { generateRandomString } from '../utils/random-string-generator';
import { Token } from './balance-types';
import { PriceStore } from './price-store';

type BalanceFromAPI = {
  coinMinimalDenom: string;
  amount: string;
  name: string;
  denom: string;
  symbol: string;
  decimals: number;
  originChainId: string;
  originDenom: string;
  trace: string;
  icon: string;
  isEvm: boolean;
  isSvm: boolean;
  leapChainKey: string;
  coingeckoId: string;
  chainId: string;
  isWhitelisted: boolean;
  isTradable: boolean;
  channelId?: string;
  ibcDenom?: string;
};

export class BalanceAPIStore {
  apiUrl: string;

  constructor(
    private readonly chainInfosStore: ChainInfosStore,
    private readonly priceStore: PriceStore,
    private readonly denomsStore: DenomsStore,
    private readonly coingeckoIdsStore: CoingeckoIdsStore,
  ) {
    makeAutoObservable(this);
    const baseURL = getBaseURL() ?? 'https://api.leapwallet.io';
    this.apiUrl = `${baseURL}/v1/balances/cosmos`;
  }

  async fetchAggregatedBalanceFromAPI(
    supportedChainWiseAddresses: Partial<Record<SupportedChain, string>>,
    network: SelectedNetworkType,
    getSpendableBalances = false,
    forceRefetch = false,
  ): Promise<Partial<Record<SupportedChain, { balances: Token[]; useFallback: boolean }>>> {
    try {
      const chainWiseBalancesResponse: Partial<Record<SupportedChain, { balances: Token[]; useFallback: boolean }>> =
        {};

      const chainIdToKey: Record<string, SupportedChain> = {};

      const chainWiseAddresses = Object.entries(supportedChainWiseAddresses).reduce((acc, [chain, address]) => {
        const chainId =
          network === 'testnet'
            ? this.chainInfosStore.chainInfos[chain as SupportedChain].testnetChainId
            : this.chainInfosStore.chainInfos[chain as SupportedChain].chainId;

        if (!chainId) {
          console.error('No chain id found for chain: ' + chain);
          chainWiseBalancesResponse[chain as SupportedChain] = {
            balances: [],
            useFallback: false,
          };
          return acc;
        }

        chainIdToKey[chainId] = chain as SupportedChain;
        acc[chainId] = { address };
        return acc;
      }, {} as Record<string, { address: string }>);

      const response = await axios.post(this.apiUrl, {
        chains: chainWiseAddresses,
        getSpendableBalances,
        forceRefetch,
      });

      if (response?.data?.error) {
        throw new Error(response?.data?.error);
      }

      const chainIds = Object.keys(chainWiseAddresses);
      const chainWiseBalances = response.data?.chains ?? {};
      const allErrors = response.data?.errors ?? [];
      const chainWithErrors = new Set<string>(
        allErrors.map((error: { chainId: string; error: string }) => error.chainId),
      );

      await Promise.all([this.waitForPriceStore(), this.waitForCoingeckoIdsStore()]);

      const denomsToAddInBase: DenomsRecord = {};

      await Promise.allSettled(
        chainIds.map(async (chainId) => {
          try {
            const balances = chainWiseBalances?.[chainId]?.denoms;
            const chainHasError = chainWithErrors.has(chainId);
            if (!balances || chainHasError) {
              throw new Error('No balances found for chain: ' + chainId);
            }

            const formattedBalances = this.formatBalanceFromAPI(
              balances,
              chainIdToKey[chainId],
              network,
              denomsToAddInBase,
            );
            if (Object.keys(denomsToAddInBase).length > 0) {
              this.denomsStore.setTempBaseDenoms(denomsToAddInBase);
            }
            chainWiseBalancesResponse[chainIdToKey[chainId]] = {
              balances: formattedBalances,
              useFallback: false,
            };
          } catch (e) {
            chainWiseBalancesResponse[chainIdToKey[chainId]] = {
              balances: [],
              useFallback: true,
            };
          }
        }),
      );

      return chainWiseBalancesResponse;
    } catch (e) {
      return Object.keys(supportedChainWiseAddresses).reduce((acc, chain) => {
        acc[chain] = {
          balances: [],
          useFallback: true,
        };
        return acc;
      }, {} as Record<string, { balances: BalanceFromAPI[]; useFallback: boolean }>);
    }
  }

  async fetchChainBalanceFromAPI(
    chain: SupportedChain,
    network: SelectedNetworkType,
    address: string,
    getSpendableBalances = false,
    forceRefetch = false,
  ) {
    try {
      const chainId =
        network === 'testnet'
          ? this.chainInfosStore.chainInfos[chain].testnetChainId
          : this.chainInfosStore.chainInfos[chain].chainId;

      if (!chainId) {
        console.error('No chain id found for chain: ' + chain);
        return {
          balances: [],
          useFallback: false,
        };
      }

      const chainAddresses: Record<string, { address: string }> = {
        [chainId]: { address: address },
      };
      const response = await axios.post(this.apiUrl, {
        chains: chainAddresses,
        getSpendableBalances,
        forceRefetch,
      });

      if (response?.data?.error) {
        throw new Error(response?.data?.error);
      }

      const balances = response.data?.chains?.[chainId]?.denoms;
      const errors = response.data?.errors ?? [];

      const chainHasError = errors.length > 0;

      if (!balances || chainHasError) {
        throw new Error('No balances found for chain: ' + chain);
      }

      await Promise.all([this.waitForPriceStore(), this.waitForCoingeckoIdsStore()]);

      const denomsToAddInBase: DenomsRecord = {};

      const formattedBalances = this.formatBalanceFromAPI(balances, chain, network, denomsToAddInBase);
      if (Object.keys(denomsToAddInBase).length > 0) {
        this.denomsStore.setTempBaseDenoms(denomsToAddInBase);
      }

      return {
        balances: formattedBalances,
        useFallback: false,
      };
    } catch (e) {
      return {
        balances: [],
        useFallback: true,
      };
    }
  }

  private formatBalanceFromAPI(
    balances: Array<BalanceFromAPI>,
    chain: SupportedChain,
    network: SelectedNetworkType = 'mainnet',
    denomsToAddInBase: DenomsRecord = {},
  ) {
    const chainInfos = this.chainInfosStore.chainInfos;

    const coingeckoPrices = this.priceStore.data;
    const coingeckoIds = this.coingeckoIdsStore.coingeckoIdsFromS3;

    if (!!process.env.APP?.includes('compass') && balances.length === 0) {
      const nativeDenom = getNativeDenom(chainInfos, chain, network);
      const denomInfo = nativeDenom;

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

      const internalDenomInfo = this.denomsStore.denoms[denomInfo.coinMinimalDenom];
      if (tokenPrice && !internalDenomInfo) {
        denomsToAddInBase[denomInfo.coinMinimalDenom] = denomInfo;
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

    const formattedBalances = balances.map((balance) => {
      const denomChain =
        Object.values(chainInfos).find((chainInfo) => chainInfo.chainId === balance.chainId) ??
        Object.values(chainInfos).find((chainInfo) => chainInfo.key === chain);

      let _denom = balance.denom;
      if (chain === 'noble' && _denom === 'uusdc') {
        _denom = 'usdc';
      }

      let ibcChainInfo;
      if (balance.ibcDenom?.startsWith('ibc/')) {
        ibcChainInfo = {
          pretty_name: balance?.originChainId,
          icon: balance.icon,
          name: balance?.originChainId,
          channelId: balance.channelId ?? '',
        };
      }

      const amount = fromSmall(new BigNumber(balance.amount).toString(), balance?.decimals);
      let usdValue;

      const denomInfo = this.denomsStore.denoms[_denom];

      const coinGeckoId =
        denomInfo?.coinGeckoId ||
        balance?.coingeckoId ||
        coingeckoIds[_denom] ||
        coingeckoIds[_denom.toLowerCase()] ||
        coingeckoIds[denomInfo?.coinMinimalDenom] ||
        coingeckoIds[denomInfo?.coinMinimalDenom?.toLowerCase()] ||
        '';

      if (parseFloat(amount) > 0) {
        if (coingeckoPrices) {
          let tokenPrice;

          const alternateCoingeckoKey = `${balance.originChainId || denomChain?.chainId}-${
            denomInfo?.coinMinimalDenom ?? balance.denom
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

      let name = balance?.name;
      let symbol = balance?.symbol;
      if (getIsCompass() && _denom === 'usdc') {
        // Override the symbol for USDC on Compass
        name = 'USDC via Noble';
        symbol = 'USDC.n';
      }

      if (!denomInfo) {
        const denomInfoToStore: NativeDenom = {
          chain: chain,
          name,
          coinDenom: symbol,
          coinDecimals: balance?.decimals,
          coinMinimalDenom: balance.denom,
          coinGeckoId,
          icon: balance?.icon,
        };
        denomsToAddInBase[balance.denom] = denomInfoToStore;
      } else if (coinGeckoId && !denomInfo.coinGeckoId) {
        let coinDenom = denomInfo?.coinDenom;
        let name = denomInfo?.name;
        if (getIsCompass() && _denom === 'usdc') {
          // Override the coinDenom for USDC on Compass
          coinDenom = 'USDC.n';
          name = 'USDC via Noble';
        }
        denomsToAddInBase[_denom] = {
          ...denomInfo,
          coinDenom,
          name,
          coinGeckoId,
        };
      }

      return {
        chain: denomChain?.key ?? chain,
        name,
        amount,
        symbol,
        usdValue: usdValue ?? '',
        coinMinimalDenom: denomInfo?.coinMinimalDenom ?? balance?.denom,
        img: balance?.icon,
        ibcDenom: balance?.ibcDenom,
        ibcChainInfo,
        usdPrice,
        coinDecimals: balance?.decimals,
        coinGeckoId,
        tokenBalanceOnChain: chain,
        id: generateRandomString(10),
      };
    });
    return formattedBalances.filter((balance) => balance !== null);
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
