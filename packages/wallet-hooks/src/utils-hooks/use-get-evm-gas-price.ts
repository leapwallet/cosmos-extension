import {
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

  const { data, status } = useQuery(
    ['get-evm-gas-price-query', activeChain, activeNetwork, storage, activeChainId, isSeiEvmChain, chains],
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
        let evmGasPrices: Record<string, { low: number; medium: number; high: number }> = {};
        try {
          evmGasPrices = await fetchEvmGasPrices(storage);
        } catch (error) {
          console.error('Error fetching EVM gas prices', error);
        }
        const activeChainGasPrices = evmGasPrices?.[activeChainId ?? ''] ?? EVM_GAS_PRICES[activeChainId ?? ''];

        const { maxFeePerGas, gasPrice, maxPriorityFeePerGas } = await SeiEvmTx.GasPrices(evmJsonRpc);

        const low = Number(maxFeePerGas?.low ?? gasPrice?.low);
        const medium = Number(maxFeePerGas?.medium ?? gasPrice?.medium);
        const high = Number(maxFeePerGas?.high ?? gasPrice?.high);

        return {
          maxFeePerGas,
          maxPriorityFeePerGas,
          gasPrice: {
            low: low || activeChainGasPrices?.low,
            medium: medium || activeChainGasPrices?.medium,
            high: high || activeChainGasPrices?.high,
          },
        };
      }
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
