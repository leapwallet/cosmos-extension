import {
  baseEthereumGasPrices,
  defaultGasPriceStep,
  EVM_GAS_PRICES,
  EvmFeeType,
  SeiEvmTx,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk';
import { SelectedNetworkType } from '@leapwallet/cosmos-wallet-store';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useActiveChain, useChainApis, useGetChains, useSelectedNetwork } from '../store';
import { cachedRemoteDataWithLastModified } from '../utils/cached-remote-data';
import { storage, useGetStorageLayer } from '../utils/global-vars';
import { useChainId } from './use-chain-id';
import { useIsSeiEvmChain } from './useIsSeiEvmChain';

function fetchEvmGasPrices(storage: storage): Promise<Record<string, { low: number; medium: number; high: number }>> {
  return cachedRemoteDataWithLastModified({
    remoteUrl: 'https://assets.leapwallet.io/cosmos-registry/v1/gas/evm-gas-prices.json',
    storageKey: 'evm-gas-prices',
    storage,
  });
}

type EvmGasConfig = {
  refetchInterval: Record<string, number>;
  multiplier: Record<string, Record<EvmFeeType, number>>;
};

function fetchEvmGasConfig(storage: storage): Promise<EvmGasConfig> {
  return cachedRemoteDataWithLastModified({
    remoteUrl: 'https://assets.leapwallet.io/cosmos-registry/v1/config/evm-gas-config.json',
    storageKey: 'evm-gas-config',
    storage,
  });
}

export type EvmGasPrices = {
  gasPrice: Record<EvmFeeType, number>;
  maxFeePerGas?: Record<EvmFeeType, string>;
  maxPriorityFeePerGas?: Record<EvmFeeType, string>;
};

/**
 * Please use `EvmGasPricesQueryStore` from `@leapwallet/cosmos-wallet-store` instead.
 */
export function useGetEvmGasPrices(forceChain?: SupportedChain, forceNetwork?: SelectedNetworkType) {
  const _activeChain = useActiveChain();
  const _activeNetwork = useSelectedNetwork();
  const storage = useGetStorageLayer();

  const activeChain = useMemo(() => forceChain || _activeChain, [forceChain, _activeChain]);
  const activeNetwork = useMemo(() => forceNetwork || _activeNetwork, [forceNetwork, _activeNetwork]);
  const activeChainId = useChainId(activeChain, activeNetwork);
  const isSeiEvmChain = useIsSeiEvmChain(activeChain);
  const chains = useGetChains();
  const { evmJsonRpc } = useChainApis(activeChain, activeNetwork);

  const { data: evmGasConfig } = useQuery(
    ['get-evm-gas-config', storage],
    async function getEvmGasConfig() {
      return fetchEvmGasConfig(storage);
    },
    {
      staleTime: 3 * 60 * 1000,
      cacheTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  );

  const { data: allChainsEvmGasPricesS3 } = useQuery(
    ['get-all-chains-evm-gas-price-query', storage],
    async function getAllChainsEvmGasPricesS3() {
      try {
        const evmGasPrices = await fetchEvmGasPrices(storage);
        return evmGasPrices;
      } catch (error) {
        console.error('Error fetching EVM gas prices', error);
        return {};
      }
    },
    {
      staleTime: 3 * 60 * 1000,
      cacheTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  );

  const { data, status } = useQuery(
    [
      'get-evm-gas-price-query',
      activeChain,
      activeNetwork,
      storage,
      activeChainId,
      isSeiEvmChain,
      chains,
      evmGasConfig,
      allChainsEvmGasPricesS3,
    ],
    async function getEvmGasPrices() {
      if (activeChain === 'lightlink') {
        return {
          gasPrice: {
            low: 100_000_000,
            medium: 120_000_000,
            high: 150_000_000,
          },
        };
      }

      if (isSeiEvmChain || chains[activeChain]?.evmOnlyChain) {
        const fallbackGasPrices: { low: number; medium: number; high: number } = {
          low: chains?.[activeChain]?.gasPriceStep?.low ?? baseEthereumGasPrices.low,
          medium: chains?.[activeChain]?.gasPriceStep?.average ?? baseEthereumGasPrices.medium,
          high: chains?.[activeChain]?.gasPriceStep?.high ?? baseEthereumGasPrices.high,
        };
        const activeChainGasPrices: { low: number; medium: number; high: number } | undefined =
          allChainsEvmGasPricesS3?.[activeChainId ?? ''] ?? EVM_GAS_PRICES[activeChainId ?? ''] ?? fallbackGasPrices;

        const { maxFeePerGas, gasPrice, maxPriorityFeePerGas } = await SeiEvmTx.GasPrices(
          evmJsonRpc,
          evmGasConfig?.multiplier?.[activeChainId ?? ''],
        );
        const low = Math.ceil(Number(maxFeePerGas?.low || gasPrice?.low || activeChainGasPrices?.low));
        const medium = Math.ceil(Number(maxFeePerGas?.medium || gasPrice?.medium || activeChainGasPrices?.medium));
        const high = Math.ceil(Number(maxFeePerGas?.high || gasPrice?.high || activeChainGasPrices?.high));

        return {
          maxFeePerGas,
          maxPriorityFeePerGas,
          gasPrice: {
            low,
            medium,
            high,
          },
        };
      }
    },
    {
      enabled: isSeiEvmChain || !!chains[activeChain]?.evmOnlyChain,
      refetchInterval: evmGasConfig?.refetchInterval?.[activeChainId ?? ''] ?? 5 * 1000,
    },
  );

  const state = useMemo(() => {
    if (data) {
      return {
        ...data,
        status,
      };
    }

    return {
      gasPrice: {
        low: EVM_GAS_PRICES[activeChainId ?? '']?.low ?? defaultGasPriceStep.low,
        medium: EVM_GAS_PRICES[activeChainId ?? '']?.medium ?? defaultGasPriceStep.average,
        high: EVM_GAS_PRICES[activeChainId ?? '']?.high ?? defaultGasPriceStep.high,
      },
      status,
    };
  }, [status, data]);

  return state;
}
