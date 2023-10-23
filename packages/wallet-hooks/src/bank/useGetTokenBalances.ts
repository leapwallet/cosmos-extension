import {
  ChainInfo,
  DenomsRecord,
  fetchAllBalancesRestApi,
  fetchCW20Balances,
  fetchERC20Balances,
  fromSmall,
  getBlockChainFromAddress,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { BigNumber } from 'bignumber.js';
import { useCallback, useMemo } from 'react';
import { Token } from 'types/bank';

import { LeapWalletApi } from '../apis';
import { Currency } from '../connectors';
import { currencyDetail, useUserPreferredCurrency } from '../settings';
import {
  fetchIbcTrace,
  getCoingeckoPricesStoreSnapshot,
  useActiveChain,
  useAddress,
  useBetaCW20Tokens,
  useChainApis,
  useChainsStore,
  useCW20Tokens,
  useDenoms,
  useDisabledCW20Tokens,
  useDisabledCW20TokensStore,
  useERC20Tokens,
  useGetChains,
  useIbcTraceStore,
  useSelectedNetwork,
} from '../store';
import { fetchCurrency, getCoreumHybridTokenInfo, sortTokenBalances, useSetDisabledCW20InStorage } from '../utils';
import { bankQueryIds } from './queryIds';

export function useInvalidateTokenBalances() {
  const queryClient = useQueryClient();
  return useCallback(() => {
    queryClient.invalidateQueries([bankQueryIds.nativeTokenBalances]);
    queryClient.invalidateQueries([bankQueryIds.ibcTokensBalance]);
    queryClient.invalidateQueries([bankQueryIds.rawBalances]);
    queryClient.invalidateQueries([bankQueryIds.cw20TokenBalances]);
    queryClient.invalidateQueries([bankQueryIds.cw20TokenBalancesRaw]);
    queryClient.invalidateQueries([bankQueryIds.erc20TokenBalances]);
    queryClient.invalidateQueries([bankQueryIds.erc20TokenBalancesRaw]);
  }, [queryClient]);
}

function getQueryFn(
  balances: Array<{ denom: string; amount: BigNumber }>,
  currencyPreferred: Currency,
  activeChain: SupportedChain,
  chainInfos: Record<SupportedChain, ChainInfo>,
  denoms: DenomsRecord,
  isCW20Balances = false,
  isERC20Balances = false,
) {
  return async () => {
    try {
      const formattedBalances = balances
        .filter(({ denom }) => {
          return chainInfos[activeChain].beta || denoms[denom];
        })
        .map(async (balance) => {
          const chainInfo = chainInfos[activeChain];
          let denom = denoms[balance.denom];
          if (chainInfo.beta) {
            denom = Object.values(chainInfo.nativeDenoms)[0];
          }

          const amount = fromSmall(new BigNumber(balance.amount).toString(), denom?.coinDecimals);

          const usdValue =
            parseFloat(amount) > 0 && denom?.coinGeckoId
              ? await fetchCurrency(
                  amount,
                  denom.coinGeckoId,
                  denom?.chain as unknown as SupportedChain,
                  currencyPreferred,
                )
              : undefined;

          const usdPrice = parseFloat(amount) > 0 && usdValue ? (Number(usdValue) / Number(amount)).toString() : '0';

          return {
            name: denom?.name,
            amount,
            symbol: denom?.coinDenom,
            usdValue: usdValue ?? '',
            coinMinimalDenom: denom?.coinMinimalDenom,
            img: denom?.icon,
            ibcDenom: '',
            usdPrice,
            coinDecimals: denom?.coinDecimals,
          };
        });

      const allTokens: Token[] = await Promise.all(formattedBalances);

      if (allTokens?.length === 0 && !isCW20Balances && !isERC20Balances) {
        const denoms = Object.values(chainInfos[activeChain].nativeDenoms);
        const placeHolderBalance = {
          amount: '0',
          symbol: denoms[0].coinDenom,
          usdValue: '0',
          coinMinimalDenom: denoms[0].coinMinimalDenom,
          img: chainInfos[activeChain].chainSymbolImageUrl ?? '',
        };
        allTokens.push(placeHolderBalance);
      }
      const allTokensData = allTokens.sort((tokenA, tokenB) =>
        new BigNumber(tokenB.usdValue ?? 0).minus(tokenA.usdValue ?? 0).toNumber(),
      );
      return allTokensData;
    } catch (e) {
      throw new Error('Unable to fetch token balances');
    }
  };
}

function useGetCW20TokenAddresses() {
  const betaCW20Tokens = useBetaCW20Tokens();
  const cw20Tokens = useCW20Tokens();
  const activeChain = useActiveChain();
  const { chains } = useChainsStore();

  const tokens = [...Object.keys(cw20Tokens ?? {}), ...Object.keys(betaCW20Tokens ?? {})];
  if (!chains[activeChain]) return tokens;
  return tokens.filter((token) => {
    const blockchain = getBlockChainFromAddress(token);
    return blockchain === chains[activeChain].addressPrefix;
  });
}

function useGetERC20TokenAddresses() {
  const erc20Tokens = useERC20Tokens();

  const tokens = [...Object.keys(erc20Tokens ?? {})];
  return tokens;
}

export function useGetNativeTokensBalances(
  balances: Array<{ denom: string; amount: BigNumber }>,
  enabled: boolean,
  currencyPreferred: Currency,
  forceChain?: SupportedChain,
  forceNetwork?: 'mainnet' | 'testnet',
) {
  const denoms = useDenoms();
  const chainInfos = useGetChains();
  const _activeChain = useActiveChain();
  const _selectedNetwork = useSelectedNetwork();

  const activeChain = forceChain ?? _activeChain;
  const selectedNetwork = forceNetwork ?? _selectedNetwork;

  const address = useAddress(activeChain);
  const { lcdUrl } = useChainApis(activeChain, selectedNetwork);

  const { data: _denoms, status: denomsStatus } = useQuery(
    ['fetch-missing-denoms', activeChain, selectedNetwork, balances, lcdUrl, Object.keys(denoms).length],
    async () => {
      const _denoms = denoms;

      for (const { denom } of balances) {
        try {
          if (activeChain === 'mainCoreum' && !denoms[denom]) {
            const { symbol, precision } = await getCoreumHybridTokenInfo(lcdUrl ?? '', denom);
            _denoms[denom] = {
              coinDenom: symbol,
              coinMinimalDenom: denom,
              coinDecimals: precision,
              chain: activeChain,
              icon: '',
              coinGeckoId: '',
            };
          }
        } catch (_) {
          //
        }
      }

      return _denoms;
    },
  );

  return useQuery(
    [bankQueryIds.nativeTokenBalances, address, balances, currencyPreferred, Object.keys(denoms).length],
    getQueryFn(balances, currencyPreferred, activeChain, chainInfos, _denoms ?? denoms),
    { enabled: enabled && denomsStatus === 'success', staleTime: 60 * 1000, retry: 10, retryDelay: 1000 },
  );
}

function useGetCW20TokenBalances(currencyPreferred: Currency) {
  const activeChain = useActiveChain();
  const address = useAddress();
  const { rpcUrl } = useChainApis();

  const cw20TokenAddresses = useGetCW20TokenAddresses();
  const { chains } = useChainsStore();
  const denoms = useDenoms();

  const { disabledCW20Tokens: storedDisabledCW20Tokens } = useDisabledCW20TokensStore();
  const setDisabledCW20InStorage = useSetDisabledCW20InStorage();

  const { data, status: rawBalancesStatus } = useQuery(
    [bankQueryIds.cw20TokenBalancesRaw, activeChain, address, cw20TokenAddresses?.length],
    async () => {
      if (cw20TokenAddresses.length) {
        return await fetchCW20Balances(`${rpcUrl}/`, address, cw20TokenAddresses);
      } else {
        return [];
      }
    },
    { staleTime: 60 * 1000, retry: 10, retryDelay: 1000 },
  );

  useQuery(
    ['fill-disabled-cw20', address, activeChain],
    async () => {
      if ((storedDisabledCW20Tokens ?? {})[address] === undefined && data) {
        const zeroAmountDenoms = data.reduce((acc: string[], denom) => {
          if (String(denom.amount) === '0') {
            return [...acc, denom.denom];
          }

          return acc;
        }, []);

        if (zeroAmountDenoms.length > 0) {
          await setDisabledCW20InStorage(zeroAmountDenoms);
        }
      }
    },
    { enabled: rawBalancesStatus === 'success' },
  );

  return useQuery(
    [bankQueryIds.cw20TokenBalances, activeChain, denoms, data, chains, address, cw20TokenAddresses?.length],
    getQueryFn(data ?? [], currencyPreferred, activeChain, chains, denoms, true),
    { enabled: rawBalancesStatus === 'success', staleTime: 60 * 1000, retry: 10, retryDelay: 1000 },
  );
}

function useGetERC20TokenBalances(currencyPreferred: Currency) {
  const { evmJsonRpc } = useChainApis();
  const erc20TokenAddresses = useGetERC20TokenAddresses();

  const activeChain = useActiveChain();
  const address = useAddress();
  const denoms = useDenoms();
  const { chains } = useChainsStore();

  const { data, status: rawBalancesStatus } = useQuery(
    [bankQueryIds.erc20TokenBalancesRaw, activeChain, address, erc20TokenAddresses?.length],
    async () => {
      if (erc20TokenAddresses.length && evmJsonRpc) {
        return await fetchERC20Balances(evmJsonRpc, address, erc20TokenAddresses);
      }

      return [];
    },
    {
      staleTime: 60 * 1000,
      retry: 10,
      retryDelay: 1000,
    },
  );

  return useQuery(
    [bankQueryIds.erc20TokenBalances, activeChain, denoms, data, chains, address, erc20TokenAddresses?.length],
    getQueryFn(data ?? [], currencyPreferred, activeChain, chains, denoms, false, true),
    {
      enabled: rawBalancesStatus === 'success',
      staleTime: 60 * 1000,
      retry: 10,
      retryDelay: 1000,
    },
  );
}

type FormattedBalance = {
  amount: string;
  symbol: string;
  coinMinimalDenom: string;
  img: string;
  ibcDenom: string;
  ibcChainInfo: {
    pretty_name: string;
    icon: string;
    name: string;
    channelId: string;
  };
  coinDecimals: number;
  coinGeckoId: string;
  usdValue?: string;
  usdPrice?: string;
  percentChange?: number;
  chain: string;
};

function useIbcTokensBalances(
  balances: Array<{ denom: string; amount: BigNumber }>,
  enabled: boolean,
  currencyPreferred: Currency,
  forceChain?: SupportedChain,
  forceNetwork?: 'mainnet' | 'testnet',
) {
  const denoms = useDenoms();
  const _activeChain = useActiveChain();
  const _selectedNetwork = useSelectedNetwork();
  const { chains } = useChainsStore();

  const activeChain = forceChain ?? _activeChain;
  const selectedNetwork = forceNetwork ?? _selectedNetwork;

  const address = useAddress(activeChain);
  const { ibcTraceData, addIbcTraceData } = useIbcTraceStore();
  const { lcdUrl } = useChainApis(activeChain, selectedNetwork);

  return useQuery(
    [bankQueryIds.ibcTokensBalance, activeChain, address, balances, currencyPreferred],
    async () => {
      const formattedBalances: Promise<FormattedBalance>[] = balances.map(async ({ denom, amount }) => {
        let trace = ibcTraceData[denom];
        if (!trace) {
          trace = await fetchIbcTrace(denom, lcdUrl ?? '', chains[activeChain].chainId);
          if (trace) addIbcTraceData({ [denom]: trace });
        }
        const baseDenom = trace.baseDenom;

        const ibcChainInfo = {
          pretty_name: trace?.originChainId,
          icon: '',
          name: trace?.originChainId,
          channelId: trace.channelId,
        };

        //const denomChain = isTerraClassic(trace?.originChainId) ? 'terra-classic' : chainInfo?.path ?? '';
        const _baseDenom = baseDenom.includes('cw20:') ? baseDenom.replace('cw20:', '') : baseDenom;
        const denomInfo = denoms[_baseDenom];

        //const denomInfo = await getDenomInfo(_baseDenom, denomChain, denoms, selectedNetwork === 'testnet');
        const qty = fromSmall(new BigNumber(amount).toString(), denomInfo?.coinDecimals);

        return {
          name: denomInfo?.name,
          amount: qty,
          symbol: denomInfo?.coinDenom ?? _baseDenom ?? '',
          coinMinimalDenom: denomInfo?.coinMinimalDenom ?? '',
          img: denomInfo?.icon ?? '',
          ibcDenom: denom,
          ibcChainInfo,
          coinDecimals: denomInfo?.coinDecimals ?? 6,
          coinGeckoId: denomInfo?.coinGeckoId ?? '',
          chain: denomInfo?.chain ?? '',
        };
      });

      const _assets = await Promise.allSettled(formattedBalances);
      //
      const assets = await Promise.all(_assets.map((asset) => (asset.status === 'fulfilled' ? asset.value : null)));
      const coingeckoPrices = await getCoingeckoPricesStoreSnapshot();

      if (assets.length > 0) {
        const platformTokenAddressesMap = assets.reduce((acc: Record<string, string[]>, asset) => {
          if (!asset) return acc;
          const { chain, coinGeckoId } = asset;

          if (!chain || !coinGeckoId) return acc;

          if (coingeckoPrices[coinGeckoId]) {
            const usdValue = coingeckoPrices[coinGeckoId];

            // if we don't have a price, set the usd value to empty string so it doesn't show up as $0 on the UI
            asset.usdValue = usdValue ? String(Number(usdValue) * Number(asset.amount)) : '';
            asset.usdPrice = asset.amount ? String(usdValue) ?? '0' : '0';

            return acc;
          }

          if (acc[chain]) {
            acc[chain].push(coinGeckoId);
            return acc;
          }

          return { ...acc, [chain]: [coinGeckoId] };
        }, {});

        const platformTokenAddresses = Object.entries(platformTokenAddressesMap).map(([key, value]) => ({
          platform: key as unknown as SupportedChain,
          tokenAddresses: value,
        }));

        try {
          const marketPrices = await LeapWalletApi.operateMarketPricesV2(platformTokenAddresses, currencyPreferred);
          assets.forEach((asset) => {
            if (!asset || Number(asset.usdValue)) return;

            const marketPrice = Object.entries(marketPrices).find(([platform, marketPrice]) => {
              return platform === asset.chain && marketPrice[asset.coinGeckoId];
            });

            const usdValue = marketPrice?.[1][asset.coinGeckoId];

            // if we don't have a price, set the usd value to empty string so it doesn't show up as $0 on the UI
            asset.usdValue = usdValue ? String(Number(usdValue) * Number(asset.amount)) : '';
            asset.usdPrice = asset.amount ? usdValue ?? '0' : '0';
          });
        } catch (e) {
          //
        }
      }

      const sortedAssets = assets
        .filter((asset) => {
          return !!asset?.symbol;
        })
        .sort((assetA, assetB) =>
          new BigNumber(assetB?.usdValue ?? 0).minus(new BigNumber(assetA?.usdValue ?? 0)).toNumber(),
        );

      return sortedAssets.reduce((acc: Array<FormattedBalance>, asset) => {
        if (!asset) return acc;
        acc.push(asset);
        return acc;
      }, []);
    },
    { enabled: enabled, staleTime: 60 * 1000, retry: 3, retryDelay: 1000 },
  );
}

function useGetRawBalances(forceChain?: SupportedChain, forceNetwork?: 'mainnet' | 'testnet') {
  const _activeChain = useActiveChain();
  const _selectedNetwork = useSelectedNetwork();

  const activeChain = forceChain ?? _activeChain;
  const selectedNetwork = forceNetwork ?? _selectedNetwork;

  const address = useAddress(activeChain);
  const { lcdUrl, rpcUrl } = useChainApis(activeChain, selectedNetwork);
  const queryClient = useQueryClient();

  const { data, status, refetch } = useQuery(
    [bankQueryIds.rawBalances, address, lcdUrl],
    async () => {
      const balances = await fetchAllBalancesRestApi(lcdUrl ?? '', address, rpcUrl);
      queryClient.setQueryData([bankQueryIds.rawBalances, address, lcdUrl], balances);
      return balances;
    },
    { staleTime: 60 * 1000, retry: 10, retryDelay: 1000 },
  );

  return { data, status, refetch };
}

export function useGetTokenBalances(forceChain?: SupportedChain, forceNetwork?: 'mainnet' | 'testnet') {
  const [preferredCurrency] = useUserPreferredCurrency();

  const {
    data: rawBalancesData,
    status: rawBalancesStatus,
    refetch: refetchRawBalances,
  } = useGetRawBalances(forceChain, forceNetwork);

  const {
    data: nativeTokensBalance,
    status: nativeTokensStatus,
    refetch: refetchNativeTokensBalance,
  } = useGetNativeTokensBalances(
    rawBalancesData?.filter(({ denom }) => !denom.startsWith('ibc/')) ?? [],
    rawBalancesStatus === 'success',
    currencyDetail[preferredCurrency].currencyPointer,
    forceChain,
    forceNetwork,
  );

  const {
    data: ibcTokensBalances,
    status: ibcTokensStatus,
    refetch: refetchIbcTokensBalance,
  } = useIbcTokensBalances(
    rawBalancesData?.filter(({ denom }) => denom.startsWith('ibc/')) ?? [],
    rawBalancesStatus === 'success',
    currencyDetail[preferredCurrency].currencyPointer,
    forceChain,
    forceNetwork,
  );

  const {
    data: erc20TokensBalances,
    status: erc20TokensStatus,
    refetch: refetchERC20TokensBalance,
  } = useGetERC20TokenBalances(currencyDetail[preferredCurrency].currencyPointer);

  const {
    data: cw20TokensBalances,
    status: cw20TokensStatus,
    refetch: refetchCW20TokensBalance,
  } = useGetCW20TokenBalances(currencyDetail[preferredCurrency].currencyPointer);

  const disabledCW20Tokens = useDisabledCW20Tokens();
  const _cw20TokensBalances = useMemo(
    () => cw20TokensBalances?.filter((token) => !disabledCW20Tokens.includes(token.coinMinimalDenom)),
    [cw20TokensBalances, disabledCW20Tokens],
  );

  function balanceCalculator(balancesList: Array<Token>) {
    const tokensWithUsdValue = balancesList.filter((token) => token.usdValue);
    if (balancesList.length > 0 && tokensWithUsdValue?.length === 0) {
      return new BigNumber(0);
    }
    return tokensWithUsdValue.reduce((totalValue, token) => {
      return token.usdValue ? totalValue.plus(new BigNumber(token.usdValue)) : totalValue;
    }, new BigNumber(0));
  }

  const totalUSDValueNativeDenoms = useMemo(() => {
    if (nativeTokensStatus === 'loading') return new BigNumber(0);
    return nativeTokensBalance ? balanceCalculator(nativeTokensBalance) : new BigNumber(0);
  }, [nativeTokensBalance]);

  const totalUSDValueIBCDenoms = useMemo(() => {
    if (ibcTokensStatus === 'loading') return new BigNumber(0);
    return ibcTokensBalances ? balanceCalculator(ibcTokensBalances) : new BigNumber(0);
  }, [ibcTokensBalances]);

  const totalUSDValueCW20Denoms = useMemo(() => {
    if (cw20TokensStatus === 'loading') return new BigNumber(0);
    return _cw20TokensBalances ? balanceCalculator(_cw20TokensBalances) : new BigNumber(0);
  }, [_cw20TokensBalances]);

  const totalUSDValueERC20Denoms = useMemo(() => {
    if (erc20TokensStatus === 'loading') return new BigNumber(0);
    return erc20TokensBalances ? balanceCalculator(erc20TokensBalances) : new BigNumber(0);
  }, [erc20TokensBalances]);

  const totalCurrencyInPreferredFiatValue = totalUSDValueNativeDenoms
    .plus(totalUSDValueIBCDenoms)
    .plus(totalUSDValueCW20Denoms)
    .plus(totalUSDValueERC20Denoms);

  const allAssets = useMemo(() => {
    if (rawBalancesData?.length === 0) {
      return nativeTokensBalance ?? [];
    } else {
      const factoryNativeTokens = sortTokenBalances(
        nativeTokensBalance?.filter((token) => token.coinMinimalDenom.includes('factory/')) ?? [],
      );

      // in case of mainCoreum
      const coreumHybridTokens = sortTokenBalances(
        nativeTokensBalance?.filter((token) => token.coinMinimalDenom.includes('-')) ?? [],
      );

      const nativeTokens = sortTokenBalances(
        nativeTokensBalance?.filter(
          (token) => !token.coinMinimalDenom.includes('factory/') && !token.coinMinimalDenom.includes('-'),
        ) ?? [],
      );

      const sortedNativeTokensBalance = nativeTokens.concat(factoryNativeTokens, coreumHybridTokens);
      const sortedIbcTokensBalances = sortTokenBalances(ibcTokensBalances ?? []);
      const sortedCw20TokensBalances = sortTokenBalances(_cw20TokensBalances ?? []);
      const sortedErc20TokensBalances = sortTokenBalances(erc20TokensBalances ?? []);

      return sortedNativeTokensBalance.concat(
        sortedIbcTokensBalances,
        sortedCw20TokensBalances,
        sortedErc20TokensBalances,
      );
    }
  }, [nativeTokensBalance, ibcTokensBalances, _cw20TokensBalances, rawBalancesData]);

  const refetchBalances = () =>
    Promise.all([
      refetchRawBalances(),
      refetchNativeTokensBalance(),
      refetchIbcTokensBalance(),
      refetchCW20TokensBalance(),
      refetchERC20TokensBalance,
    ]);

  return {
    nativeTokensBalance,
    ibcTokensBalances,
    allAssets,
    nativeTokensStatus,
    ibcTokensStatus,
    totalCurrencyInPreferredFiatValue,
    refetchBalances,
    cw20TokensBalances,
    cw20TokensStatus,
    erc20TokensStatus,
    erc20TokensBalances,
  };
}
