import {
  APTOS_GAS_PRICES,
  AptosTx,
  defaultGasPriceStep,
  EvmFeeType,
  isAptosChain,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk';
import { SelectedNetworkType } from '@leapwallet/cosmos-wallet-store';
import { QueryStatus, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useActiveChain, useChainApis, useGetChains, useSelectedNetwork } from '../store';
import { useChainId } from './use-chain-id';
import { useIsSeiEvmChain } from './useIsSeiEvmChain';

export type AptosGasPrices = {
  gasPrice: Record<EvmFeeType, number>;
  prioritizedGasPrice?: Record<EvmFeeType, string>;
  deprioritizedGasPrice?: Record<EvmFeeType, string>;
};

/**
 * @description Please use `AptosGasPricesStore` from `@leapwallet/cosmos-wallet-store` instead of this hook
 */
export function useGetAptosGasPrices(forceChain?: SupportedChain, forceNetwork?: SelectedNetworkType) {
  const _activeChain = useActiveChain();
  const _activeNetwork = useSelectedNetwork();

  const activeChain = useMemo(() => forceChain || _activeChain, [forceChain, _activeChain]);
  const activeNetwork = useMemo(() => forceNetwork || _activeNetwork, [forceNetwork, _activeNetwork]);
  const activeChainId = useChainId(activeChain, activeNetwork);
  const isSeiEvmChain = useIsSeiEvmChain(activeChain);
  const chains = useGetChains();
  const { lcdUrl } = useChainApis(activeChain, activeNetwork);

  const { data, status } = useQuery(
    ['get-aptos-gas-price-query', activeChain, activeNetwork, activeChainId, isSeiEvmChain, chains],
    async function getAptosGasPrices() {
      if (isAptosChain(activeChain)) {
        const activeChainGasPrices = APTOS_GAS_PRICES[activeChainId ?? ''];
        const aptos = await AptosTx.getAptosClient(lcdUrl ?? '');
        const { gasPrice, prioritizedGasPrice, deprioritizedGasPrice } = await aptos.getGasPrice();

        const low = Number(gasPrice?.low);
        const medium = Number(gasPrice?.medium);
        const high = Number(gasPrice?.high);

        return {
          deprioritizedGasPrice,
          prioritizedGasPrice,
          gasPrice: {
            low: low || activeChainGasPrices?.low,
            medium: medium || activeChainGasPrices?.medium,
            high: high || activeChainGasPrices?.high,
          },
        };
      }
    },
  );

  const state: {
    gasPrice: AptosGasPrices['gasPrice'];
    status: QueryStatus;
  } = useMemo(() => {
    if (data) {
      return {
        ...data,
        status,
      };
    }

    return {
      gasPrice: {
        low: APTOS_GAS_PRICES[activeChainId ?? '']?.low ?? defaultGasPriceStep.low,
        medium: APTOS_GAS_PRICES[activeChainId ?? '']?.medium ?? defaultGasPriceStep.average,
        high: APTOS_GAS_PRICES[activeChainId ?? '']?.high ?? defaultGasPriceStep.high,
      },
      status,
    };
  }, [status, data]);

  return state;
}
