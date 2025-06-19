import { getAddress } from '@ethersproject/address';
import { DenomsRecord, NativeDenom, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import axios from 'axios';
import BigNumber from 'bignumber.js';
import { makeAutoObservable } from 'mobx';
import { SelectedNetworkType } from 'types';

import { BetaERC20DenomsStore, ChainInfosStore, CoingeckoIdsStore, DenomsStore } from '../assets';
import { getBaseURL } from '../globals/config';
import { getNativeDenom } from '../utils';
import { fromSmall } from '../utils/balance-converter';
import { generateRandomString } from '../utils/random-string-generator';
import { Token } from './balance-types';
import { PriceStore } from './price-store';

type BalanceFromAPI = {
  address: string;
  balance: string;
  decimals: number;
  icon_url: string;
  name: string;
  symbol: string;
  coingeckoId?: string;
  tokenPrice?: number;
  balanceUsd?: string;
};

export class EVMBalanceAPIStore {
  apiUrl: string;

  constructor(
    private readonly chainInfosStore: ChainInfosStore,
    private readonly priceStore: PriceStore,
    private readonly denomsStore: DenomsStore,
    private readonly betaERC20DenomsStore: BetaERC20DenomsStore,
    private readonly coingeckoIdsStore: CoingeckoIdsStore,
  ) {
    makeAutoObservable(this);
    const baseURL = getBaseURL() ?? 'https://api.leapwallet.io';
    this.apiUrl = `${baseURL}/v1/balances/evm`;
  }

  async fetchAggregatedBalanceFromAPI(
    supportedChainWiseAddresses: Partial<Record<SupportedChain, string>>,
    network: SelectedNetworkType,
    forceRefetch = false,
  ): Promise<
    Partial<
      Record<
        SupportedChain,
        { erc20Balances: Token[]; nativeBalances: Token[]; useFallbackERC20: boolean; useFallbackNative: boolean }
      >
    >
  > {
    try {
      const chainWiseBalancesResponse: Partial<
        Record<
          SupportedChain,
          { erc20Balances: Token[]; nativeBalances: Token[]; useFallbackERC20: boolean; useFallbackNative: boolean }
        >
      > = {};

      const chainIdToKey: Record<string, SupportedChain> = {};

      await this.waitForBetaERC20DenomsStore();

      const chainWiseAddresses = Object.entries(supportedChainWiseAddresses).reduce((acc, [chain, address]) => {
        const chainId =
          network === 'testnet'
            ? this.chainInfosStore.chainInfos[chain as SupportedChain].testnetChainId
            : this.chainInfosStore.chainInfos[chain as SupportedChain].chainId;

        if (!chainId) {
          console.error('No chain id found for chain: ' + chain);
          chainWiseBalancesResponse[chain as SupportedChain] = {
            erc20Balances: [],
            nativeBalances: [],
            useFallbackERC20: false,
            useFallbackNative: false,
          };
          return acc;
        }

        const erc20Denoms = Object.keys(this.betaERC20DenomsStore.getBetaERC20DenomsForChain(chain as SupportedChain));

        chainIdToKey[chainId] = chain as SupportedChain;
        acc[chainId] = { address, erc20Denoms };
        return acc;
      }, {} as Record<string, { address: string; erc20Denoms?: string[] }>);

      const response = await axios.post(this.apiUrl, {
        chains: chainWiseAddresses,
        forceRefetch,
      });

      if (response.data.error) {
        throw new Error(response.data.error);
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
            const _erc20Balances = chainWiseBalances?.[chainId]?.denoms;
            const _nativeBalances = chainWiseBalances?.[chainId]?.native;
            const chainHasError = chainWithErrors.has(chainId);
            if ((!_erc20Balances && !_nativeBalances) || chainHasError) {
              throw new Error('No balances found for chain: ' + chainId);
            }

            const erc20Balances = Object.values(_erc20Balances ?? {}) as BalanceFromAPI[];
            const nativeBalances = Object.values(_nativeBalances ?? {}) as BalanceFromAPI[];

            const formattedErc20Balances = this.formatBalanceFromAPI(
              erc20Balances,
              chainIdToKey[chainId],
              network,
              true,
              denomsToAddInBase,
            );
            const formattedNativeBalances = this.formatBalanceFromAPI(
              nativeBalances,
              chainIdToKey[chainId],
              network,
              false,
              denomsToAddInBase,
            );
            chainWiseBalancesResponse[chainIdToKey[chainId]] = {
              erc20Balances: formattedErc20Balances,
              nativeBalances: formattedNativeBalances,
              useFallbackERC20: !_erc20Balances,
              useFallbackNative: !_nativeBalances,
            };
          } catch (e) {
            chainWiseBalancesResponse[chainIdToKey[chainId]] = {
              erc20Balances: [],
              nativeBalances: [],
              useFallbackERC20: true,
              useFallbackNative: true,
            };
          }
        }),
      );

      if (Object.keys(denomsToAddInBase).length > 0) {
        this.denomsStore.setTempBaseDenoms(denomsToAddInBase);
      }

      return chainWiseBalancesResponse;
    } catch (e) {
      return Object.keys(supportedChainWiseAddresses).reduce((acc, chain) => {
        acc[chain] = {
          erc20Balances: [],
          nativeBalances: [],
          useFallbackERC20: true,
          useFallbackNative: true,
        };
        return acc;
      }, {} as Record<string, { erc20Balances: Token[]; nativeBalances: Token[]; useFallbackERC20: boolean; useFallbackNative: boolean }>);
    }
  }

  async fetchChainBalanceFromAPI(
    chain: SupportedChain,
    network: SelectedNetworkType,
    address: string,
    forceRefetch = false,
  ): Promise<{
    erc20Balances: Token[];
    nativeBalances: Token[];
    useFallbackERC20: boolean;
    useFallbackNative: boolean;
  }> {
    try {
      const chainId =
        network === 'testnet'
          ? this.chainInfosStore.chainInfos[chain].testnetChainId
          : this.chainInfosStore.chainInfos[chain].chainId;

      if (!chainId) {
        console.error('No chain id found for chain: ' + chain);
        return {
          erc20Balances: [],
          nativeBalances: [],
          useFallbackERC20: false,
          useFallbackNative: false,
        };
      }

      await this.waitForBetaERC20DenomsStore();
      const erc20Denoms = Object.keys(this.betaERC20DenomsStore.getBetaERC20DenomsForChain(chain as SupportedChain));
      const chainAddresses: Record<string, { address: string; erc20Denoms?: string[] }> = {
        [chainId]: { address: address, erc20Denoms },
      };
      const response = await axios.post(this.apiUrl, {
        chains: chainAddresses,
        forceRefetch,
      });

      if (response?.data?.error) {
        throw new Error(response?.data?.error);
      }

      const _erc20Balances = response.data?.chains?.[chainId]?.denoms;
      const _nativeBalances = response.data?.chains?.[chainId]?.native;
      const errors = response.data?.errors ?? [];

      const chainHasError = errors.length > 0;

      if ((!_erc20Balances && !_nativeBalances) || chainHasError) {
        throw new Error('No balances found for chain: ' + chain);
      }
      const erc20Balances = Object.values(_erc20Balances ?? {}) as BalanceFromAPI[];
      const nativeBalances = Object.values(_nativeBalances ?? {}) as BalanceFromAPI[];

      await Promise.all([this.waitForPriceStore(), this.waitForCoingeckoIdsStore()]);
      const denomsToAddInBase: DenomsRecord = {};

      const formattedErc20Balances = this.formatBalanceFromAPI(erc20Balances, chain, network, true, denomsToAddInBase);
      const formattedNativeBalances = this.formatBalanceFromAPI(
        nativeBalances,
        chain,
        network,
        false,
        denomsToAddInBase,
      );

      if (Object.keys(denomsToAddInBase).length > 0) {
        this.denomsStore.setTempBaseDenoms(denomsToAddInBase);
      }

      return {
        erc20Balances: formattedErc20Balances,
        nativeBalances: formattedNativeBalances,
        useFallbackERC20: !_erc20Balances,
        useFallbackNative: !_nativeBalances,
      };
    } catch (e) {
      return {
        erc20Balances: [],
        nativeBalances: [],
        useFallbackERC20: true,
        useFallbackNative: true,
      };
    }
  }

  private formatBalanceFromAPI(
    balances: Array<BalanceFromAPI>,
    chain: SupportedChain,
    network: SelectedNetworkType = 'mainnet',
    isErc20 = false,
    denomsToAddInBase: DenomsRecord = {},
  ) {
    const chainInfos = this.chainInfosStore.chainInfos;
    const chainId =
      network === 'testnet'
        ? this.chainInfosStore.chainInfos[chain].testnetChainId
        : this.chainInfosStore.chainInfos[chain].chainId;

    const coingeckoPrices = this.priceStore.data;
    const coingeckoIds = this.coingeckoIdsStore.coingeckoIdsFromS3;

    if (!isErc20 && balances.length === 0) {
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

      const _internalDenomInfo = this.denomsStore.denoms[denomInfo.coinMinimalDenom];
      if (!_internalDenomInfo) {
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
          isEvm: true,
          id: generateRandomString(10),
        },
      ];
    }

    const chainBetaERC20Denoms = this.betaERC20DenomsStore.getBetaERC20DenomsForChain(chain as SupportedChain);
    const chainBetaERC20DenomsKeys = Object.keys(chainBetaERC20Denoms);

    const formattedBalances = balances.map((balance) => {
      let _denom = balance.address;
      if (_denom?.startsWith('0x')) {
        _denom = getAddress(_denom);
      }

      if (chainBetaERC20DenomsKeys.includes(_denom)) {
        // inject beta erc20 denom info
        const betaERC20Denom = chainBetaERC20Denoms[_denom];
        balance = {
          ...balance,
          decimals: betaERC20Denom?.coinDecimals ?? balance.decimals,
          icon_url: betaERC20Denom?.icon ?? balance.icon_url,
          name: betaERC20Denom?.name ?? balance.name,
          symbol: betaERC20Denom?.coinDenom ?? balance.symbol,
          coingeckoId: betaERC20Denom?.coinGeckoId ?? balance.coingeckoId,
        };
      }

      const denomInfo = this.denomsStore.denoms[_denom];
      const coinGeckoId =
        balance.coingeckoId ??
        denomInfo?.coinGeckoId ??
        coingeckoIds[_denom] ??
        coingeckoIds[_denom?.toLowerCase()] ??
        '';

      if (!denomInfo) {
        const denomInfoToStore: NativeDenom = {
          coinMinimalDenom: _denom,
          coinDenom: balance.symbol,
          coinDecimals: balance.decimals,
          coinGeckoId: coinGeckoId ?? '',
          icon: balance.icon_url,
          name: balance.name,
          chain: chain,
        };
        denomsToAddInBase[_denom] = denomInfoToStore;
      } else if (coinGeckoId && !denomInfo.coinGeckoId) {
        denomsToAddInBase[_denom] = {
          ...denomInfo,
          coinGeckoId,
        };
      }

      const amount = fromSmall(new BigNumber(balance.balance).toString(), balance?.decimals);
      // TODO: add balance?.balanceUsd in future with exchange rates to use prices from external APIs
      let usdValue;
      let tokenPrice;

      if (parseFloat(amount) > 0) {
        if (coingeckoPrices) {
          const alternateCoingeckoKey = `${chainId}-${_denom}`;

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
      // TODO: add balance?.tokenPrice in future with exchange rates to use prices from external APIs
      const usdPrice = String(tokenPrice ?? '0');

      return {
        chain,
        name: balance?.name,
        amount,
        symbol: balance?.symbol,
        usdValue: usdValue ?? '',
        coinMinimalDenom: balance?.address,
        img: balance?.icon_url,
        usdPrice,
        coinDecimals: balance?.decimals,
        coinGeckoId,
        tokenBalanceOnChain: chain,
        isEvm: !isErc20,
        id: generateRandomString(10),
      };
    });
    return formattedBalances.filter((balance) => balance !== null);
  }

  private async waitForBetaERC20DenomsStore() {
    try {
      await this.betaERC20DenomsStore.readyPromise;
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

  private async waitForPriceStore() {
    try {
      await this.priceStore.readyPromise;
    } catch (e) {
      //
    }
  }
}
