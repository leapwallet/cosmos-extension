import { DenomsRecord, isValidAddressWithPrefix, SupportedChain, SupportedDenoms } from '@leapwallet/cosmos-wallet-sdk';
import { ParsedTransaction } from '@leapwallet/parser-parfait';
import { useQuery } from '@tanstack/react-query';
import { differenceInDays } from 'date-fns';
import { useMemo, useState } from 'react';

import { useActivity } from '../activity';
import { LeapWalletApi } from '../apis';
import { currencyDetail, useUserPreferredCurrency } from '../settings';
import {
  getCoingeckoPricesStoreSnapshot,
  useActiveChain,
  useAutoFetchedCW20Tokens,
  useSecretTokenStore,
  useSelectedNetwork,
} from '../store';
import { convertSecretDenom, getDenomInfo } from '../utils';
import { useChainInfo } from '../utils-hooks';

type UseAssetDetailsProps = {
  denoms: DenomsRecord;
  denom: SupportedDenoms;
  tokenChain: SupportedChain;
};

export function useAssetDetails({ denoms, denom, tokenChain }: UseAssetDetailsProps) {
  const activeChain = useActiveChain();
  const [selectedDays, setSelectedDays] = useState<string>('1D');
  const [preferredCurrency] = useUserPreferredCurrency();
  const { secretTokens } = useSecretTokenStore();
  const chainInfo = useChainInfo(tokenChain);
  const selectedNetwork = useSelectedNetwork();
  const chainId = selectedNetwork === 'mainnet' ? chainInfo?.chainId : chainInfo?.testnetChainId;
  const autoFetchedCW20Tokens = useAutoFetchedCW20Tokens();
  const combinedDenoms = useMemo(() => {
    return {
      ...denoms,
      ...autoFetchedCW20Tokens,
    };
  }, [denoms, autoFetchedCW20Tokens]);

  const { txResponse } = useActivity(denoms, tokenChain ? tokenChain : undefined);

  const ChartDays: Record<string, number> = {
    '1D': 1,
    '7D': 7,
    '1M': 30,
    '3M': 90,
    '1Y': 365,
    YTD: 365,
    All: 2000,
  };

  const { data: denomInfo } = useQuery(['denom-info', denom, tokenChain], async () => {
    if (isValidAddressWithPrefix(denom, 'secret') && secretTokens[denom]) {
      return convertSecretDenom(secretTokens[denom], denom);
    }

    return getDenomInfo(denom, tokenChain, combinedDenoms);
  });

  const {
    data: chartData,
    isLoading: loadingCharts,
    error: errorCharts,
  } = useQuery(
    ['chartData', denom, selectedDays],
    async () => {
      if (denom && selectedDays && denomInfo?.coinGeckoId) {
        try {
          const date = new Date();
          date.setDate(1);
          date.setMonth(0);
          date.setFullYear(date.getFullYear());

          const YTD = differenceInDays(new Date(), date);

          const response = await LeapWalletApi.getMarketChart(
            denomInfo.coinGeckoId,
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

  const {
    data: info,
    isLoading: loadingPrice,
    error: errorInfo,
  } = useQuery(
    ['assetData', denom, chainId],
    async () => {
      if (!denom) {
        return;
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
