import { DenomsRecord, NativeDenom, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import axios from 'axios';
import BigNumber from 'bignumber.js';
import { makeAutoObservable } from 'mobx';
import { SelectedNetworkType } from 'types';

import { ChainInfosStore, CoingeckoIdsStore, DenomsStore } from '../assets';
import { getBaseURL } from '../globals/config';
import { fromSmall } from '../utils/balance-converter';
import { calculateTokenPriceAndValue } from '../utils/bank/price-calculator';
import { generateRandomString } from '../utils/random-string-generator';
import { Token } from './balance-types';
import { PriceStore } from './price-store';

type BalanceFromAPI = {
  decimals: number;
  name: string;
  symbol: string;
  icon_url: string;
  aptosTokenType: string;
  balance: number;
  coingeckoId: string;
  coinMinimalDenom: string;
};

export class AptosBalanceApiStore {
  apiUrl: string;
  constructor(
    private readonly chainInfosStore: ChainInfosStore,
    private readonly priceStore: PriceStore,
    private readonly denomStore: DenomsStore,
    private readonly coingeckoIdsStore: CoingeckoIdsStore,
  ) {
    makeAutoObservable(this);
    const baseURL = getBaseURL() ?? 'https://api.leapwallet.io';
    this.apiUrl = `${baseURL}/v1/balances/move`;
  }

  async fetchAggregatedBalanceFromAPI(
    supportedChainWiseAddresses: Partial<Record<SupportedChain, string>>,
    network: SelectedNetworkType,
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

            const formattedBalances = await this.formatBalanceFromAPI(
              balances,
              chainIdToKey[chainId],
              network,
              denomsToAddInBase,
            );
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

      if (Object.keys(denomsToAddInBase).length > 0) {
        this.denomStore.setTempBaseDenoms(denomsToAddInBase);
      }

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
      const formattedBalances = await this.formatBalanceFromAPI(balances, chain, network, denomsToAddInBase);

      if (Object.keys(denomsToAddInBase).length > 0) {
        this.denomStore.setTempBaseDenoms(denomsToAddInBase);
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
    const chainId =
      network === 'testnet'
        ? this.chainInfosStore.chainInfos[chain].testnetChainId
        : this.chainInfosStore.chainInfos[chain].chainId;

    const coingeckoPrices = this.priceStore.data;
    const coingeckoIds = this.coingeckoIdsStore.coingeckoIdsFromS3;

    const formattedBalances = balances?.map((balance) => {
      const amount = fromSmall(new BigNumber(balance.balance).toString(), balance?.decimals);
      const denom = this.denomStore.denoms[balance.coinMinimalDenom];
      const coinGeckoId =
        balance?.coingeckoId ||
        denom?.coinGeckoId ||
        coingeckoIds[balance?.coinMinimalDenom] ||
        coingeckoIds[balance?.coinMinimalDenom?.toLowerCase()] ||
        '';

      const { usdValue, usdPrice } = calculateTokenPriceAndValue({
        amount,
        coingeckoPrices,
        coinMinimalDenom: balance?.coinMinimalDenom,
        chainId,
        coinGeckoId,
      });

      if (!denom) {
        const denomInfo: NativeDenom = {
          chain: chain,
          name: balance?.name,
          coinDenom: balance?.symbol,
          coinDecimals: balance?.decimals,
          coinMinimalDenom: balance.coinMinimalDenom,
          icon: balance?.icon_url,
          coinGeckoId,
        };
        denomsToAddInBase[balance.coinMinimalDenom] = denomInfo;
      } else if (!denom?.coinGeckoId && coinGeckoId) {
        denomsToAddInBase[balance.coinMinimalDenom] = {
          ...denom,
          coinGeckoId,
        };
      }

      return {
        chain: chain,
        name: balance?.name,
        amount,
        symbol: balance?.symbol,
        usdValue: usdValue ?? '',
        coinMinimalDenom: balance.coinMinimalDenom,
        img: balance?.icon_url,
        usdPrice,
        coinDecimals: balance?.decimals,
        coinGeckoId,
        tokenBalanceOnChain: chain,
        isAptos: true,
        aptosTokenType: balance?.aptosTokenType as 'v1' | 'v2',
        id: generateRandomString(10),
      };
    });
    return formattedBalances?.filter((balance) => balance !== null);
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
