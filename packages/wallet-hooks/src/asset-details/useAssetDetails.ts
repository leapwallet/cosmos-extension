import { DenomsRecord, isValidAddressWithPrefix, SupportedChain, SupportedDenoms } from '@leapwallet/cosmos-wallet-sdk';
import { MarketData } from '@leapwallet/cosmos-wallet-store';
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
  marketData: Record<string, MarketData> | null;
};

export function useAssetDetails({ denoms, denom, tokenChain, compassParams, marketData }: UseAssetDetailsProps) {
  const activeChain = useActiveChain();
  const [selectedDays, setSelectedDays] = useState<string>('1D');
  const [preferredCurrency] = useUserPreferredCurrency();
  const { secretTokens } = useSecretTokenStore();
  const chainInfo = useChainInfo(tokenChain);
  const selectedNetwork = useSelectedNetwork();
  const chainId = selectedNetwork === 'mainnet' ? chainInfo?.chainId : chainInfo?.testnetChainId;
  const isCompassWallet = useIsCompassWallet();
  const autoFetchedCW20Tokens = useAutoFetchedCW20Tokens();

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

  const { data: denomInfo } = useQuery(['denom-info', denom, tokenChain, compassParams], async () => {
    if (isValidAddressWithPrefix(denom, 'secret') && secretTokens[denom]) {
      return convertSecretDenom(secretTokens[denom], denom);
    }

    return getDenomInfo(denom, tokenChain, combinedDenoms, compassParams);
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

  const marketDataForToken = useMemo(() => {
    if (!denomInfo) {
      return undefined;
    }
    let key = denomInfo.coinGeckoId ?? denomInfo.coinMinimalDenom;
    if (marketData?.[key]) {
      return marketData[key];
    }
    key = denomInfo.coinMinimalDenom;
    if (marketData?.[key]) {
      return marketData[key];
    }
    key = `${chainId}-${denomInfo.coinMinimalDenom}`;
    return marketData?.[key] ?? marketData?.[key?.toLowerCase()];
  }, [marketData, denomInfo]);

  const {
    data: info,
    isLoading: loadingPrice,
    error: errorInfo,
  } = useQuery(
    ['assetData', denom, chainId, marketDataForToken],
    async () => {
      if (!denom) {
        return;
      }

      if (marketDataForToken) {
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
          price: marketDataForToken.current_price,
          priceChange: marketDataForToken.price_change_percentage_24h,
          marketCap: marketDataForToken.market_cap,
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
            const { price, details, priceChange, marketCap } = response;
            return {
              price,
              details,
              priceChange,
              marketCap,
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
