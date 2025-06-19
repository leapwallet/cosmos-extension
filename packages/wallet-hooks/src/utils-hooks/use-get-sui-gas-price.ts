import {
  defaultGasPriceStep,
  EvmFeeType,
  isSuiChain,
  SOLANA_GAS_PRICES,
  SUI_GAS_PRICES,
  SuiTx,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk';
import { SelectedNetworkType } from '@leapwallet/cosmos-wallet-store';
import { QueryStatus, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useActiveChain, useGetChains, useSelectedNetwork } from '../store';
import { useChainId } from './use-chain-id';
import { useIsSeiEvmChain } from './useIsSeiEvmChain';

export type SuiGasPrices = {
  gasPrice: Record<EvmFeeType, number>;
};

export function useGetSuiGasPrices(forceChain?: SupportedChain, forceNetwork?: SelectedNetworkType) {
  const _activeChain = useActiveChain();
  const _activeNetwork = useSelectedNetwork();

  const activeChain = useMemo(() => forceChain || _activeChain, [forceChain, _activeChain]);
  const activeNetwork = useMemo(() => forceNetwork || _activeNetwork, [forceNetwork, _activeNetwork]);
  const activeChainId = useChainId(activeChain, activeNetwork);
  const isSeiEvmChain = useIsSeiEvmChain(activeChain);
  const chains = useGetChains();

  const { data, status } = useQuery(
    ['get-sui-gas-price-query', activeChain, activeNetwork, activeChainId, isSeiEvmChain, chains],
    async function getSuiGasPrices() {
      if (isSuiChain(activeChain)) {
        const activeChainGasPrices = SOLANA_GAS_PRICES[activeChainId ?? ''];
        const sui = await SuiTx.getSuiClient(undefined, activeNetwork);
        const { gasPrice } = await sui.getGasPrice();

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
    gasPrice: SuiGasPrices['gasPrice'];
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
        low: SUI_GAS_PRICES[activeChainId ?? '']?.low ?? defaultGasPriceStep.low,
        medium: SUI_GAS_PRICES[activeChainId ?? '']?.medium ?? defaultGasPriceStep.average,
        high: SUI_GAS_PRICES[activeChainId ?? '']?.high ?? defaultGasPriceStep.high,
      },
      status,
    };
  }, [status, data]);

  return state;
}
