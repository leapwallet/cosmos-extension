import { DenomsRecord, isValidAddressWithPrefix, SupportedChain, SupportedDenoms } from '@leapwallet/cosmos-wallet-sdk';
import { CoingeckoIdsStore, MarketData, PercentageChangeDataStore, PriceStore } from '@leapwallet/cosmos-wallet-store';
import { useQuery } from '@tanstack/react-query';
import { differenceInDays } from 'date-fns';
import { useMemo, useState } from 'react';

import { LeapWalletApi } from '../apis';
import { currencyDetail, useUserPreferredCurrency } from '../settings';
import {
  getCoingeckoPricesStoreSnapshot,
  useActiveChain,
  useAutoFetchedCW20Tokens,
  useIsCompassWallet,
  useSecretTokenStore,
  useSelectedNetwork,
} from '../store';
import { CompassDenomInfoParams, convertSecretDenom, getDenomInfo } from '../utils';
import { useChainInfo } from '../utils-hooks';

type UseAssetDetailsProps = {
  denoms: DenomsRecord;
  denom: SupportedDenoms;
  tokenChain: SupportedChain;
  compassParams: CompassDenomInfoParams;
  coingeckoIdsStore: CoingeckoIdsStore;
  percentageChangeDataStore: PercentageChangeDataStore;
  priceStore: PriceStore;
};

export function useAssetDetails({
  denoms,
  denom,
  tokenChain,
  compassParams,
  coingeckoIdsStore,
  percentageChangeDataStore,
  priceStore,
}: UseAssetDetailsProps) {
  const activeChain = useActiveChain();
  const [selectedDays, setSelectedDays] = useState<string>('1D');
  const [preferredCurrency] = useUserPreferredCurrency();
  const { secretTokens } = useSecretTokenStore();
  const chainInfo = useChainInfo(tokenChain);
  const selectedNetwork = useSelectedNetwork();
  const chainId = selectedNetwork === 'mainnet' ? chainInfo?.chainId : chainInfo?.testnetChainId;
  const isCompassWallet = useIsCompassWallet();
  const autoFetchedCW20Tokens = useAutoFetchedCW20Tokens();
  const percentageChangeData = percentageChangeDataStore.data;
  const coingeckoIds = coingeckoIdsStore.coingeckoIdsFromS3;

  const combinedDenoms = useMemo(() => {
    if (isCompassWallet) {
      return Object.assign({}, denoms, autoFetchedCW20Tokens);
    }
    return Object.assign({}, denoms, autoFetchedCW20Tokens);
  }, [denoms, autoFetchedCW20Tokens]);

  const ChartDays: Record<string, number> = {
    '1D': 1,
    '7D': 7,
    '1M': 30,
    '1Y': 365,
    YTD: 365,
    All: 2000,
  };

  const denomInfoKey = useMemo(() => {
    return ['denom-info', denom, tokenChain, Object.keys(combinedDenoms ?? {}).length, compassParams];
  }, [Object.keys(combinedDenoms ?? {}).length]);

  const { data: denomInfo } = useQuery(denomInfoKey, async () => {
    if (isValidAddressWithPrefix(denom, 'secret') && secretTokens[denom]) {
      const denomInfo = convertSecretDenom(secretTokens[denom], denom);
      if (!denomInfo) {
        return undefined;
      }
      return {
        ...denomInfo,
        coinGeckoId: denomInfo?.coinGeckoId || coingeckoIds[denomInfo?.coinMinimalDenom ?? ''] || '',
      };
    }

    const denomInfo = await getDenomInfo(denom, tokenChain, combinedDenoms, compassParams);
    if (!denomInfo) {
      return undefined;
    }
    return {
      ...denomInfo,
      coinGeckoId: denomInfo?.coinGeckoId || coingeckoIds[denomInfo?.coinMinimalDenom ?? ''] || '',
    };
  });

  const {
    data: chartData,
    isLoading: loadingCharts,
    error: errorCharts,
  } = useQuery(
    ['chartData', denom, selectedDays],
    async () => {
      if (denom && selectedDays && (denomInfo?.coinGeckoId || denomInfo?.chain === 'osmosis')) {
        try {
          const date = new Date();
          date.setDate(1);
          date.setMonth(0);
          date.setFullYear(date.getFullYear());

          const YTD = differenceInDays(new Date(), date);

          const response = await LeapWalletApi.getMarketChart(
            denomInfo.coinGeckoId || denomInfo.coinDenom,
            denomInfo?.chain as SupportedChain,
            selectedDays === 'YTD' ? YTD : ChartDays[selectedDays],
            currencyDetail[preferredCurrency].currencyPointer,
          );

          if (response) {
            const { data, minMax } = response;
            return { chartData: data, minMax };
          }
        } catch (_) {
          //
        }
      }
    },
    { enabled: !!denomInfo, retry: 2 },
  );

  const priceForToken = useMemo(() => {
    if (!denomInfo) {
      return undefined;
    }
    let key = denomInfo.coinGeckoId ?? denomInfo.coinMinimalDenom;
    if (priceStore.data?.[key]) {
      return priceStore.data[key];
    }
    key = denomInfo.coinMinimalDenom;
    if (priceStore.data?.[key]) {
      return priceStore.data[key];
    }
    key = `${chainId}-${denomInfo.coinMinimalDenom}-${priceStore.currencyStore.preferredCurrency}`;
    return priceStore.data?.[key] ?? priceStore.data?.[key?.toLowerCase()];
  }, [priceStore.data, denomInfo]);

  const percentageChangeDataForToken = useMemo(() => {
    if (!denomInfo) {
      return undefined;
    }
    let key = denomInfo.coinGeckoId ?? denomInfo.coinMinimalDenom;
    if (percentageChangeData?.[key]) {
      return percentageChangeData[key];
    }
    key = denomInfo.coinMinimalDenom;
    if (percentageChangeData?.[key]) {
      return percentageChangeData[key];
    }
    key = `${chainId}-${denomInfo.coinMinimalDenom}`;
    return percentageChangeData?.[key] ?? percentageChangeData?.[key?.toLowerCase()];
  }, [percentageChangeData, denomInfo]);

  const {
    data: info,
    isLoading: loadingPrice,
    error: errorInfo,
  } = useQuery(
    ['assetData', denom, chainId, percentageChangeDataForToken],
    async () => {
      if (!denom) {
        return;
      }

      if (percentageChangeDataForToken) {
        let details;
        if (denomInfo?.coinGeckoId) {
          const response = await LeapWalletApi.getAssetDescription(
            denomInfo?.coinGeckoId,
            denomInfo?.chain as SupportedChain,
          );
          details = response ?? '';
        }
        return {
          details,
          price: priceForToken,
          priceChange: percentageChangeDataForToken.price_change_percentage_24h,
        };
      }

      if (denomInfo?.coinGeckoId) {
        try {
          const response = await LeapWalletApi.getAssetDetails(
            denomInfo.coinGeckoId,
            denomInfo?.chain as SupportedChain,
            currencyDetail[preferredCurrency].currencyPointer,
          );

          if (response) {
            const { price, details, priceChange } = response;
            percentageChangeDataStore.addPercentChange(denomInfo.coinGeckoId, priceChange);
            return {
              price,
              details,
              priceChange,
            };
          }
        } catch (_) {
          //
        }
      } else if (denomInfo?.coinMinimalDenom) {
        const coingeckoPrices = await getCoingeckoPricesStoreSnapshot();
        const alternatePricesKey = `${chainId}-${denomInfo?.coinMinimalDenom}`;
        const price = coingeckoPrices?.[currencyDetail[preferredCurrency].currencyPointer]?.[alternatePricesKey];
        return {
          price,
        };
      }
    },
    { enabled: !!denomInfo, retry: 2 },
  );

  return {
    activeChain,
    chartData,
    ChartDays,
    info,
    loadingCharts,
    errorCharts,
    errorInfo,
    setSelectedDays,
    selectedDays,
    loadingPrice,
    denomInfo,
  };
}
