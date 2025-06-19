import {
  defaultGasPriceStep,
  EvmFeeType,
  isSolanaChain,
  SOLANA_GAS_PRICES,
  SolanaTx,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk';
import { SelectedNetworkType } from '@leapwallet/cosmos-wallet-store';
import { QueryStatus, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useActiveChain, useChainApis, useGetChains, useSelectedNetwork } from '../store';
import { useChainId } from './use-chain-id';
import { useIsSeiEvmChain } from './useIsSeiEvmChain';

export type SolanaGasPrices = {
  gasPrice: Record<EvmFeeType, number>;
};

export function useGetSolanaGasPrices(forceChain?: SupportedChain, forceNetwork?: SelectedNetworkType) {
  const _activeChain = useActiveChain();
  const _activeNetwork = useSelectedNetwork();

  const activeChain = useMemo(() => forceChain || _activeChain, [forceChain, _activeChain]);
  const activeNetwork = useMemo(() => forceNetwork || _activeNetwork, [forceNetwork, _activeNetwork]);
  const activeChainId = useChainId(activeChain, activeNetwork);
  const isSeiEvmChain = useIsSeiEvmChain(activeChain);
  const chains = useGetChains();

  const { data, status } = useQuery(
    ['get-solana-gas-price-query', activeChain, activeNetwork, activeChainId, isSeiEvmChain, chains],
    async function getSolanaGasPrices() {
      if (isSolanaChain(activeChain)) {
        const activeChainGasPrices = SOLANA_GAS_PRICES[activeChainId ?? ''];
        const { rpcUrl } = useChainApis(activeChain, activeNetwork);
        const solana = await SolanaTx.getSolanaClient(rpcUrl ?? '', undefined, activeNetwork, activeChain);
        const { gasPrice } = await solana.getGasPrice();

        const low = Number(gasPrice?.low);
        const medium = Number(gasPrice?.medium);
        const high = Number(gasPrice?.high);

        return {
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
    gasPrice: SolanaGasPrices['gasPrice'];
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
        low: SOLANA_GAS_PRICES[activeChainId ?? '']?.low ?? defaultGasPriceStep.low,
        medium: SOLANA_GAS_PRICES[activeChainId ?? '']?.medium ?? defaultGasPriceStep.average,
        high: SOLANA_GAS_PRICES[activeChainId ?? '']?.high ?? defaultGasPriceStep.high,
      },
      status,
    };
  }, [status, data]);

  return state;
}
