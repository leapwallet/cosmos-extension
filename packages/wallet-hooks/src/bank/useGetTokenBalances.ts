import {
  ChainInfo,
  DenomsRecord,
  fetchAllBalancesRestApi,
  fetchCW20Balances,
  fetchERC20Balances,
  fromSmall,
  getBlockChainFromAddress,
  getEthereumAddress,
  NativeDenom,
  pubKeyToEvmAddressToShow,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk';
import { useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { BigNumber } from 'bignumber.js';
import { useCallback, useMemo } from 'react';

import { LeapWalletApi } from '../apis';
import { Currency } from '../connectors';
import { currencyDetail, useUserPreferredCurrency } from '../settings';
import {
  fetchIbcTrace,
  getCoingeckoPricesStoreSnapshot,
  IbcDenomData,
  useActiveChain,
  useActiveWallet,
  useAddress,
  useAutoFetchedCW20Tokens,
  useBetaCW20Tokens,
  useBetaERC20Tokens,
  useBetaNativeTokens,
  useChainApis,
  useChainsStore,
  useCW20Tokens,
  useDenoms,
  useDisabledCW20Tokens,
  useEnabledCW20Tokens,
  useERC20Tokens,
  useGetChains,
  useIbcTraceStore,
  useSelectedNetwork,
} from '../store';
import { Token } from '../types';
import {
  balanceCalculator,
  fetchCurrency,
  getCoreumHybridTokenInfo,
  getKeyToUseForDenoms,
  sortTokenBalances,
} from '../utils';
import { useChainInfo, useIsSeiEvmChain } from '../utils-hooks';
import { bankQueryIds } from './queryIds';

export function useInvalidateTokenBalances() {
  const queryClient = useQueryClient();
  return useCallback(
    (activeChain: SupportedChain) => {
      queryClient.invalidateQueries([`${activeChain}-${bankQueryIds.nativeTokenBalances}`]);
      queryClient.invalidateQueries([`${activeChain}-${bankQueryIds.ibcTokensBalance}`]);
      queryClient.invalidateQueries([`${activeChain}-${bankQueryIds.rawBalances}`]);
      queryClient.invalidateQueries([`${activeChain}-${bankQueryIds.cw20TokenBalances}`]);
      queryClient.invalidateQueries([`${activeChain}-${bankQueryIds.cw20TokenBalancesRaw}`]);
      queryClient.invalidateQueries([`${activeChain}-${bankQueryIds.erc20TokenBalances}`]);
      queryClient.invalidateQueries([`${activeChain}-${bankQueryIds.erc20TokenBalancesRaw}`]);
    },
    [queryClient],
  );
}

export function getQueryFn(
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
          let _denom = denom;
          if (activeChain === 'noble' && _denom === 'uusdc') {
            _denom = 'usdc';
          }

          return chainInfos[activeChain].beta || denoms[_denom];
        })
        .map(async (balance) => {
          const chainInfo = chainInfos[activeChain];
          let _denom = balance.denom;
          if (activeChain === 'noble' && _denom === 'uusdc') {
            _denom = 'usdc';
          }

          let denom = denoms[_denom];

          if (!denom && chainInfo.beta) {
            if (Object.values(chainInfo.nativeDenoms)[0].coinMinimalDenom === _denom) {
              denom = Object.values(chainInfo.nativeDenoms)[0];
            }
          }

          if (!denom) {
            return null as unknown as Token;
          }

          const amount = fromSmall(new BigNumber(balance.amount).toString(), denom?.coinDecimals);
          const alternateCoingeckoKey = `${chainInfo.chainId}-${denom.coinMinimalDenom}`;

          let usdValue;
          if (parseFloat(amount) > 0) {
            usdValue = await fetchCurrency(
              amount,
              denom.coinGeckoId,
              denom?.chain as unknown as SupportedChain,
              currencyPreferred,
              alternateCoingeckoKey,
            );
          }

          const usdPrice = parseFloat(amount) > 0 && usdValue ? (Number(usdValue) / Number(amount)).toString() : '0';

          return {
            chain: denom?.chain ?? '',
            name: denom?.name,
            amount,
            symbol: denom?.coinDenom,
            usdValue: usdValue ?? '',
            coinMinimalDenom: denom?.coinMinimalDenom,
            img: denom?.icon,
            ibcDenom: '',
            usdPrice,
            coinDecimals: denom?.coinDecimals,
            coinGeckoId: denom?.coinGeckoId,
            tokenBalanceOnChain: activeChain,
          };
        });

      let allTokens: Token[] = await Promise.all(formattedBalances);
      allTokens = allTokens.filter((token) => !!token);

      if (allTokens?.length === 0 && !isCW20Balances && !isERC20Balances) {
        const _denom = Object.values(chainInfos[activeChain].nativeDenoms)[0];
        const denom = denoms[_denom.coinMinimalDenom] ?? _denom;

        const alternateCoingeckoKey = `${chainInfos[activeChain].chainId}-${denom.coinMinimalDenom}`;
        const usdPrice =
          (await fetchCurrency(
            '1',
            denom.coinGeckoId,
            denom?.chain as unknown as SupportedChain,
            currencyPreferred,
            alternateCoingeckoKey,
          )) ?? '0';

        const placeHolderBalance = {
          chain: denom?.chain ?? '',
          amount: '0',
          symbol: denom.coinDenom,
          usdValue: '0',
          coinMinimalDenom: denom.coinMinimalDenom,
          img: denom?.icon ?? chainInfos[activeChain].chainSymbolImageUrl ?? '',
          usdPrice,
          coinGeckoId: denom?.coinGeckoId ?? '',
          tokenBalanceOnChain: activeChain,
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

export function useGetCW20TokenAddresses(forceChain?: SupportedChain) {
  const _activeChain = useActiveChain();
  const activeChain = forceChain ?? _activeChain;

  const betaCW20Tokens = useBetaCW20Tokens(activeChain);
  const cw20Tokens = useCW20Tokens(activeChain);
  const autoFetchedCW20Tokens = useAutoFetchedCW20Tokens(activeChain);
  const disabledCW20Tokens = useDisabledCW20Tokens(activeChain);
  const enabledCW20Tokens = useEnabledCW20Tokens(activeChain);
  const enabledTokens = [
    ...Object.keys(cw20Tokens).filter((token) => !disabledCW20Tokens.includes(token)),
    ...Object.keys(autoFetchedCW20Tokens).filter((token) => enabledCW20Tokens.includes(token)),
  ];

  const { chains } = useChainsStore();

  const tokens = [...enabledTokens, ...Object.keys(betaCW20Tokens ?? {})];
  if (!chains[activeChain]) return tokens;
  return tokens.filter((token) => {
    const blockchain = getBlockChainFromAddress(token);
    return blockchain === chains[activeChain].addressPrefix;
  });
}

export function useGetERC20TokenAddresses(forceChain?: SupportedChain) {
  const _activeChain = useActiveChain();
  const activeChain = forceChain ?? _activeChain;

  const erc20Tokens = useERC20Tokens(activeChain);
  const betaERC20Tokens = useBetaERC20Tokens(activeChain);
  const disabledCW20Tokens = useDisabledCW20Tokens(activeChain);

  const enabledTokens = useMemo(
    () => [...Object.keys(erc20Tokens).filter((token) => !disabledCW20Tokens.includes(token))],
    [erc20Tokens, disabledCW20Tokens],
  );

  const tokens = useMemo(
    () => [...enabledTokens, ...Object.keys(betaERC20Tokens ?? {})],
    [enabledTokens, betaERC20Tokens],
  );

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
  const betaNativeTokens = useBetaNativeTokens();

  const activeChain = forceChain ?? _activeChain;
  const selectedNetwork = forceNetwork ?? _selectedNetwork;

  const address = useAddress(activeChain);
  const { lcdUrl } = useChainApis(activeChain, selectedNetwork);

  const { chains } = useChainsStore();
  const isApiUnavailable = chains?.[activeChain as SupportedChain]?.apiStatus === false;
  const retry = isApiUnavailable ? false : 10;

  const { data: _denoms, status: denomsStatus } = useQuery(
    ['fetch-missing-denoms', activeChain, selectedNetwork, balances, lcdUrl, Object.keys(denoms).length],
    async () => {
      const _denoms = denoms;

      for (const { denom } of balances) {
        try {
          if (['mainCoreum', 'coreum'].includes(activeChain) && !denoms[denom]) {
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

  const { data: _balances, status: _balancesStatus } = useQuery(
    ['fill-beta-native-balances', address, balances, Object.keys(denoms).length, betaNativeTokens],
    async () => {
      const betaNativeWithBalance = Object.values(betaNativeTokens).reduce(
        (acc: Array<{ denom: string; amount: BigNumber }>, token: NativeDenom) => {
          if (balances.some((balance) => balance.denom === token.coinMinimalDenom)) {
            return acc;
          }

          return [...acc, { denom: token.coinMinimalDenom, amount: new BigNumber(0) }];
        },
        [],
      );

      return [...balances, ...betaNativeWithBalance];
    },
  );

  return useQuery(
    [bankQueryIds.nativeTokenBalances, address, _balances, balances, currencyPreferred, Object.keys(denoms).length],
    getQueryFn(_balances ?? balances, currencyPreferred, activeChain, chainInfos, _denoms ?? denoms),
    {
      enabled: enabled && denomsStatus === 'success' && _balancesStatus === 'success',
      staleTime: 60 * 1000,
      retry,
      retryDelay: 1000,
    },
  );
}

export function useGetCW20TokenBalances(
  currencyPreferred: Currency,
  forceChain?: SupportedChain,
  forceNetwork?: 'mainnet' | 'testnet',
) {
  const _activeChain = useActiveChain();
  const _selectedNetwork = useSelectedNetwork();

  const activeChain = forceChain ?? _activeChain;
  const selectedNetwork = forceNetwork ?? _selectedNetwork;
  const address = useAddress(activeChain);
  const { rpcUrl } = useChainApis(activeChain, selectedNetwork);

  const cw20TokenAddresses = useGetCW20TokenAddresses(activeChain);
  const denoms = useDenoms();
  const autoFetchedCW20Tokens = useAutoFetchedCW20Tokens(activeChain);
  const combinedDenoms = { ...denoms, ...autoFetchedCW20Tokens };

  const { chains } = useChainsStore();
  const isApiUnavailable = chains?.[activeChain as SupportedChain]?.apiStatus === false;
  const retry = isApiUnavailable ? false : 10;

  const queryRes = useQueries({
    queries: (cw20TokenAddresses ?? []).map((tokenAddress) => ({
      queryKey: [[`${activeChain}-${bankQueryIds.cw20TokenBalancesRaw}`, activeChain, address, tokenAddress, rpcUrl]],
      queryFn: async () => {
        if (tokenAddress) {
          return await fetchCW20Balances(`${rpcUrl}/`, address, [tokenAddress]);
        } else {
          return [];
        }
      },
      staleTime: 60 * 1000,
      retry,
      retryDelay: 1000,
    })),
  });

  const data = queryRes.reduce((acc: Array<{ denom: string; amount: BigNumber }>, query) => {
    if (query.status === 'success') {
      return [...acc, ...query.data];
    }

    return acc;
  }, []);

  const rawBalancesStatus = queryRes.some((query) => query.status === 'loading') ? 'loading' : 'success';

  const refetchRawBalances = () => {
    queryRes.forEach((query) => {
      query.refetch();
    });
  };

  const queryData = useQuery(
    [
      `${activeChain}-${bankQueryIds.cw20TokenBalances}`,
      activeChain,
      combinedDenoms,
      data,
      chains,
      address,
      cw20TokenAddresses?.length,
    ],
    getQueryFn(data ?? [], currencyPreferred, activeChain, chains, combinedDenoms, true),
    { enabled: rawBalancesStatus === 'success', staleTime: 60 * 1000, retry, retryDelay: 1000 },
  );

  return {
    ...queryData,
    refetch: () => {
      refetchRawBalances();
      queryData?.refetch();
    },
  };
}

function useGetERC20TokenBalances(
  currencyPreferred: Currency,
  forceChain?: SupportedChain,
  forceNetwork?: 'mainnet' | 'testnet',
) {
  const _activeChain = useActiveChain();
  const _selectedNetwork = useSelectedNetwork();

  const activeChain = forceChain ?? _activeChain;
  const selectedNetwork = forceNetwork ?? _selectedNetwork;

  const { evmJsonRpc } = useChainApis(activeChain, selectedNetwork);
  const erc20TokenAddresses = useGetERC20TokenAddresses(activeChain);

  const activeWallet = useActiveWallet();
  const address = useAddress(activeChain);
  const denoms = useDenoms();
  const { chains } = useChainsStore();
  const isSeiEvm = useIsSeiEvmChain(activeChain);

  const isApiUnavailable = chains?.[activeChain as SupportedChain]?.apiStatus === false;
  const retry = isApiUnavailable ? false : 10;
  const isEvmOnlyChain = chains?.[activeChain]?.evmOnlyChain;

  const { data, status: rawBalancesStatus } = useQuery(
    [
      `${activeChain}-${bankQueryIds.erc20TokenBalancesRaw}`,
      activeChain,
      address,
      erc20TokenAddresses,
      activeWallet?.pubKeys?.[activeChain],
      isSeiEvm,
      evmJsonRpc,
      isEvmOnlyChain,
    ],
    async () => {
      if (erc20TokenAddresses.length && evmJsonRpc) {
        const ethWalletAddress =
          isSeiEvm || isEvmOnlyChain
            ? pubKeyToEvmAddressToShow(activeWallet?.pubKeys?.[activeChain])
            : getEthereumAddress(address);

        if (ethWalletAddress.startsWith('0x')) {
          const erc20Balances = await fetchERC20Balances(evmJsonRpc, ethWalletAddress, erc20TokenAddresses);
          if (isSeiEvm) {
            return erc20Balances;
          }

          return erc20Balances.filter((balance) => balance.amount.gt(0));
        }
      }

      return [];
    },
    {
      staleTime: 60 * 1000,
      retry,
      retryDelay: 1000,
    },
  );

  return useQuery(
    [
      `${activeChain}-${bankQueryIds.erc20TokenBalances}`,
      activeChain,
      denoms,
      data,
      chains,
      address,
      erc20TokenAddresses,
    ],
    getQueryFn(data ?? [], currencyPreferred, activeChain, chains, denoms, false, true),
    {
      enabled: rawBalancesStatus === 'success',
      staleTime: 60 * 1000,
      retry,
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

function useS3IbcTokensBalances(
  balances: Array<{ denom: string; amount: BigNumber }>,
  enabled: boolean,
  currencyPreferred: Currency,
  forceChain?: SupportedChain,
  forceNetwork?: 'mainnet' | 'testnet',
) {
  const { ibcTraceData } = useIbcTraceStore();

  const s3IbcTokens = useMemo(
    () =>
      balances.filter(({ denom }) => {
        return ibcTraceData[denom];
      }),
    [balances, ibcTraceData],
  );

  return useIbcTokensBalances(s3IbcTokens, enabled, currencyPreferred, forceChain, forceNetwork);
}

function useNonS3IbcTokensBalances(
  balances: Array<{ denom: string; amount: BigNumber }>,
  enabled: boolean,
  currencyPreferred: Currency,
  forceChain?: SupportedChain,
  forceNetwork?: 'mainnet' | 'testnet',
) {
  const { ibcTraceData } = useIbcTraceStore();

  const nonS3IbcTokens = useMemo(
    () =>
      balances.filter(({ denom }) => {
        return !ibcTraceData[denom];
      }),
    [balances, ibcTraceData],
  );

  return useIbcTokensBalances(nonS3IbcTokens, enabled, currencyPreferred, forceChain, forceNetwork);
}

export function useIbcTokensBalances(
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

  const isApiUnavailable = chains?.[activeChain as SupportedChain]?.apiStatus === false;
  const retry = isApiUnavailable ? false : 10;

  const address = useAddress(activeChain);
  const { ibcTraceData, addIbcTraceData } = useIbcTraceStore();
  const { lcdUrl } = useChainApis(activeChain, selectedNetwork);

  return useQuery(
    [`${activeChain}-${bankQueryIds.ibcTokensBalance}`, activeChain, address, balances, currencyPreferred],
    async () => {
      const formattedBalances: Promise<{
        formattedBalance: FormattedBalance;
        ibcTraceDataToAdd: Record<string, IbcDenomData>;
      }>[] = balances.map(async ({ denom, amount }) => {
        let trace = ibcTraceData[denom];
        const ibcTraceDataToAdd: Record<string, IbcDenomData> = {};
        if (!trace) {
          trace = await fetchIbcTrace(denom, lcdUrl ?? '', chains[activeChain].chainId);
          if (trace) {
            ibcTraceDataToAdd[denom] = trace;
          }
        }
        const baseDenom = trace.baseDenom;

        const ibcChainInfo = {
          pretty_name: trace?.originChainId,
          icon: '',
          name: trace?.originChainId,
          channelId: trace.channelId,
        };

        const _baseDenom = getKeyToUseForDenoms(baseDenom, trace?.originChainId);
        const denomInfo = denoms[_baseDenom];
        const qty = fromSmall(new BigNumber(amount).toString(), denomInfo?.coinDecimals);

        return {
          formattedBalance: {
            name: denomInfo?.name,
            amount: qty,
            symbol: denomInfo?.coinDenom ?? _baseDenom ?? '',
            coinMinimalDenom: denomInfo?.coinMinimalDenom ?? _baseDenom ?? '',
            img: denomInfo?.icon ?? '',
            ibcDenom: denom,
            ibcChainInfo,
            coinDecimals: denomInfo?.coinDecimals ?? 6,
            coinGeckoId: denomInfo?.coinGeckoId ?? '',
            chain: denomInfo?.chain ?? '',
            tokenBalanceOnChain: activeChain,
          },
          ibcTraceDataToAdd,
        };
      });

      const _assets = await Promise.allSettled(formattedBalances);
      if (typeof window !== 'undefined') {
        const ibcTraceDataToAdd = _assets.reduce((acc: Record<string, IbcDenomData>, asset) => {
          if (!asset || asset.status !== 'fulfilled') return acc;
          return { ...acc, ...asset.value.ibcTraceDataToAdd };
        }, {});
        Object.keys(ibcTraceDataToAdd).length && addIbcTraceData(ibcTraceDataToAdd);
      }

      const assets = await Promise.all(
        _assets.map((asset) => (asset.status === 'fulfilled' ? asset.value.formattedBalance : null)),
      );
      const coingeckoPrices = await getCoingeckoPricesStoreSnapshot();

      if (assets.length > 0) {
        const platformTokenAddressesMap = assets.reduce((acc: Record<string, string[]>, asset) => {
          if (!asset) return acc;
          const { chain, coinGeckoId, coinMinimalDenom } = asset;
          const alternateCoingeckoKey = `${chains?.[chain as SupportedChain]?.chainId}-${coinMinimalDenom}`;

          if (!chain || (!coinGeckoId && !alternateCoingeckoKey)) return acc;

          if (
            coingeckoPrices[currencyPreferred] &&
            ((coinGeckoId && coingeckoPrices[currencyPreferred][coinGeckoId]) ||
              (alternateCoingeckoKey && coingeckoPrices[currencyPreferred][alternateCoingeckoKey]))
          ) {
            const usdValue =
              coingeckoPrices[currencyPreferred][coinGeckoId] ??
              coingeckoPrices[currencyPreferred][alternateCoingeckoKey];

            // if we don't have a price, set the usd value to empty string so it doesn't show up as $0 on the UI
            asset.usdValue = usdValue ? String(Number(usdValue) * Number(asset.amount)) : '';
            asset.usdPrice = asset.amount ? String(usdValue) ?? '0' : '0';

            return acc;
          }

          if (!coinGeckoId) return acc;

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
    { enabled: enabled, staleTime: 60 * 1000, retry, retryDelay: 1000 },
  );
}

export function useGetRawBalances(
  forceChain?: SupportedChain,
  forceNetwork?: 'mainnet' | 'testnet',
  fetchSpendableBalance?: boolean,
) {
  const _activeChain = useActiveChain();
  const _selectedNetwork = useSelectedNetwork();

  const activeChain = forceChain ?? _activeChain;
  const selectedNetwork = forceNetwork ?? _selectedNetwork;
  const { chains } = useChainsStore();

  const isApiUnavailable = chains?.[activeChain as SupportedChain]?.apiStatus === false;
  const retry = isApiUnavailable ? false : 10;
  const isEvmOnlyChain = chains?.[activeChain]?.evmOnlyChain;

  const address = useAddress(activeChain);
  const { lcdUrl, rpcUrl } = useChainApis(activeChain, selectedNetwork);
  const queryClient = useQueryClient();

  const { data, status, refetch } = useQuery(
    [`${activeChain}-${bankQueryIds.rawBalances}`, address, lcdUrl, rpcUrl],
    async () => {
      const balances = isEvmOnlyChain
        ? []
        : await fetchAllBalancesRestApi(lcdUrl ?? '', address, rpcUrl, fetchSpendableBalance);
      queryClient.setQueryData([`${activeChain}-${bankQueryIds.rawBalances}`, address, lcdUrl], balances);
      return balances;
    },
    { enabled: !!activeChain && !!address, staleTime: 60 * 1000, retry, retryDelay: 1000 },
  );

  return { data, status, refetch };
}

export function useGetTokenBalances(
  forceChain?: SupportedChain,
  forceNetwork?: 'mainnet' | 'testnet',
  fetchSpendableBalance?: boolean,
) {
  const [preferredCurrency] = useUserPreferredCurrency();
  const disabledCW20Tokens = useDisabledCW20Tokens();
  const enabledCW20Tokens = useEnabledCW20Tokens();

  const {
    data: rawBalancesData,
    status: rawBalancesStatus,
    refetch: refetchRawBalances,
  } = useGetRawBalances(forceChain, forceNetwork, fetchSpendableBalance);

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

  const _nativeTokensBalance = useMemo(
    () => nativeTokensBalance?.filter((token) => !disabledCW20Tokens.includes(token.coinMinimalDenom)),
    [nativeTokensBalance, disabledCW20Tokens],
  );

  const {
    data: s3IbcTokensBalances,
    status: s3IbcTokensStatus,
    refetch: refetchS3IbcTokensBalance,
  } = useS3IbcTokensBalances(
    rawBalancesData?.filter(({ denom }) => denom.startsWith('ibc/')) ?? [],
    rawBalancesStatus === 'success',
    currencyDetail[preferredCurrency].currencyPointer,
    forceChain,
    forceNetwork,
  );

  const {
    data: nonS3IbcTokensBalances,
    status: nonS3IbcTokensStatus,
    refetch: refetchNonS3IbcTokensBalance,
  } = useNonS3IbcTokensBalances(
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
  } = useGetCW20TokenBalances(currencyDetail[preferredCurrency].currencyPointer, forceChain, forceNetwork);

  const _activeChain = useActiveChain();
  const activeChain = forceChain ?? _activeChain;
  const chainInfo = useChainInfo(activeChain);

  const _erc20TokensBalances = useMemo(
    () =>
      erc20TokensBalances?.filter((token) =>
        String(token.amount) === '0'
          ? enabledCW20Tokens.includes(token.coinMinimalDenom)
          : !disabledCW20Tokens.includes(token.coinMinimalDenom),
      ),
    [erc20TokensBalances, disabledCW20Tokens],
  );

  const _cw20TokensBalances = useMemo(
    () =>
      cw20TokensBalances?.filter((token) =>
        String(token.amount) === '0'
          ? enabledCW20Tokens.includes(token.coinMinimalDenom)
          : !disabledCW20Tokens.includes(token.coinMinimalDenom),
      ),
    [cw20TokensBalances, disabledCW20Tokens],
  );

  const totalUSDValueNativeDenoms = useMemo(() => {
    if (nativeTokensStatus === 'loading') return new BigNumber(0);
    return _nativeTokensBalance ? balanceCalculator(_nativeTokensBalance) : new BigNumber(0);
  }, [_nativeTokensBalance]);

  const totalUSDValueS3IBCDenoms = useMemo(() => {
    if (s3IbcTokensStatus === 'loading') return new BigNumber(0);
    return s3IbcTokensBalances ? balanceCalculator(s3IbcTokensBalances) : new BigNumber(0);
  }, [s3IbcTokensBalances]);

  const totalUSDValueNonS3IBCDenoms = useMemo(() => {
    if (nonS3IbcTokensStatus === 'loading') return new BigNumber(0);
    return nonS3IbcTokensBalances ? balanceCalculator(nonS3IbcTokensBalances) : new BigNumber(0);
  }, [nonS3IbcTokensBalances]);

  const totalUSDValueCW20Denoms = useMemo(() => {
    if (cw20TokensStatus === 'loading') return new BigNumber(0);
    return _cw20TokensBalances ? balanceCalculator(_cw20TokensBalances) : new BigNumber(0);
  }, [_cw20TokensBalances]);

  const totalUSDValueERC20Denoms = useMemo(() => {
    if (erc20TokensStatus === 'loading') return new BigNumber(0);
    return _erc20TokensBalances ? balanceCalculator(_erc20TokensBalances) : new BigNumber(0);
  }, [_erc20TokensBalances]);

  const totalCurrencyInPreferredFiatValue = totalUSDValueNativeDenoms
    .plus(totalUSDValueS3IBCDenoms)
    .plus(totalUSDValueNonS3IBCDenoms)
    .plus(totalUSDValueCW20Denoms)
    .plus(totalUSDValueERC20Denoms);

  const allAssets = useMemo(() => {
    const nativeTokens = sortTokenBalances(
      _nativeTokensBalance?.filter((token) => Object.keys(chainInfo?.nativeDenoms)?.includes(token.coinMinimalDenom)) ??
        [],
    );

    const nonNativeTokens =
      _nativeTokensBalance?.filter(
        (token) => !Object.keys(chainInfo?.nativeDenoms)?.includes(token.coinMinimalDenom),
      ) ?? [];

    const sortedNativeTokensBalance = nativeTokens;

    const sortNonNativeTokens = sortTokenBalances([
      ...(nonNativeTokens ?? []),
      ...(s3IbcTokensBalances ?? []),
      ...(nonS3IbcTokensBalances ?? []),
      ...(_cw20TokensBalances ?? []),
      ...(_erc20TokensBalances ?? []),
    ]);

    return sortedNativeTokensBalance.concat(sortNonNativeTokens);
  }, [
    _nativeTokensBalance,
    s3IbcTokensBalances,
    nonS3IbcTokensBalances,
    _cw20TokensBalances,
    rawBalancesData,
    _erc20TokensBalances,
  ]);

  const refetchBalances = () =>
    Promise.all([
      refetchRawBalances(),
      refetchNativeTokensBalance(),
      refetchS3IbcTokensBalance(),
      refetchNonS3IbcTokensBalance(),
      refetchCW20TokensBalance(),
      refetchERC20TokensBalance,
    ]);

  const isWalletHasFunds = useMemo(() => {
    if (allAssets && allAssets?.length > 0) {
      for (const token of allAssets) {
        if (Number(token.amount) !== 0) {
          return true;
        }
      }
    }

    return false;
  }, [allAssets]);

  return {
    nativeTokensBalance,
    _nativeTokensBalance,
    s3IbcTokensBalances,
    nonS3IbcTokensBalances,
    allAssets,
    nativeTokensStatus,
    s3IbcTokensStatus,
    nonS3IbcTokensStatus,
    totalCurrencyInPreferredFiatValue,
    refetchBalances,
    cw20TokensBalances,
    cw20TokensStatus,
    _cw20TokensBalances,
    erc20TokensStatus,
    erc20TokensBalances,
    _erc20TokensBalances,
    isWalletHasFunds,
  };
}
