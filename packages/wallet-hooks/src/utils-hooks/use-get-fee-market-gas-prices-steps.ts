import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { useCallback, useMemo } from 'react';

import { useActiveChain, useChainApis, useSelectedNetwork } from '../store';
import { GasPriceStep, getFeeMarketGasPrices, roundOf, SelectedNetworkType, useGasPriceStepForChain } from '../utils';

export type FeeMarketGasPrices = {
  denom: string;
  amount: string;
}[];

export function useGetFeeMarketGasPricesSteps(forceChain?: SupportedChain, forceNetwork?: SelectedNetworkType) {
  const _activeChain = useActiveChain();
  const activeChain = useMemo(() => forceChain || _activeChain, [_activeChain, forceChain]);

  const _activeNetwork = useSelectedNetwork();
  const activeNetwork = useMemo(() => forceNetwork || _activeNetwork, [_activeNetwork, forceNetwork]);

  const { lcdUrl } = useChainApis(activeChain, activeNetwork);
  const baseGasPriceStep = useGasPriceStepForChain(activeChain, activeNetwork);

  return useCallback(
    async function getFeeMarketGasPricesSteps(feeDenom: string, forceBaseGasPriceStep?: GasPriceStep) {
      const feeMarketData: FeeMarketGasPrices = await getFeeMarketGasPrices(lcdUrl ?? '');
      const feeMarketDenomData = feeMarketData.find(({ denom }) => denom === feeDenom);

      if (feeMarketDenomData) {
        const minGasPrice = roundOf(Number(feeMarketDenomData.amount), 4);

        const low = minGasPrice * 1.1;
        const medium = minGasPrice * 1.2;
        const high = minGasPrice * 1.3;

        return {
          low: roundOf(low, 5),
          medium: roundOf(medium, 5),
          high: roundOf(high, 5),
        };
      } else {
        return forceBaseGasPriceStep || baseGasPriceStep;
      }
    },
    [lcdUrl, baseGasPriceStep],
  );
}
