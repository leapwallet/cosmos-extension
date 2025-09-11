import { getFeeMarketAmountData,roundOf, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { SelectedNetworkType } from '@leapwallet/cosmos-wallet-store';
import { useCallback, useMemo } from 'react';

import { useActiveChain, useChainApis, useSelectedNetwork } from '../store';
import { GasPriceStep, useGasPriceStepForChain } from '../utils/useGetGasPrice';
import { useChainId } from './use-chain-id';

const CHAIN_SPECIFIC_FEE_MARKET_ADJUSTMENT: Record<string, number> = {
  'cheqd-testnet-6': 1e4,
  'cheqd-mainnet-1': 1e4,
};

/**
 * Please use `FeeMarketGasPriceStepStore` from `@leapwallet/cosmos-wallet-store` instead.
 */
export function useGetFeeMarketGasPricesSteps(forceChain?: SupportedChain, forceNetwork?: SelectedNetworkType) {
  const _activeChain = useActiveChain();
  const activeChain = useMemo(() => forceChain || _activeChain, [_activeChain, forceChain]);

  const _activeNetwork = useSelectedNetwork();
  const activeNetwork = useMemo(() => forceNetwork || _activeNetwork, [_activeNetwork, forceNetwork]);

  const chainId = useChainId(activeChain, activeNetwork);

  const { lcdUrl } = useChainApis(activeChain, activeNetwork);
  const baseGasPriceStep = useGasPriceStepForChain(activeChain, activeNetwork);

  return useCallback(
    async function getFeeMarketGasPricesSteps(feeDenom: string, forceBaseGasPriceStep?: GasPriceStep) {
      const feeMarketAmountData: string | undefined = await getFeeMarketAmountData(lcdUrl ?? '', activeChain, feeDenom);

      const chainFeeMarketAdjustment = CHAIN_SPECIFIC_FEE_MARKET_ADJUSTMENT[chainId ?? ''] ?? 1;

      if (feeMarketAmountData) {
        const minGasPrice = roundOf(Number(feeMarketAmountData) * chainFeeMarketAdjustment, 4);

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
