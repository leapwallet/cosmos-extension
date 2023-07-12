import { defaultGasPriceStep, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { useMemo } from 'react';

import { useActiveChain, useGetChains } from '../store';
import { useGasPriceStepForChain } from './useGetGasPrice';

export function useLowGasPriceStep(forceChain?: string) {
  const chains = useGetChains();
  const activeChain = useActiveChain();

  const chainKey = useMemo(() => (forceChain ?? activeChain) as SupportedChain, [activeChain, forceChain]);
  const gasPriceStep = useGasPriceStepForChain(chainKey);

  const chainInfo = chains[chainKey];

  const value = useMemo(() => {
    if (chainInfo?.beta && chainInfo?.gasPriceStep) {
      return chainInfo.gasPriceStep.low;
    }

    return gasPriceStep.low ?? defaultGasPriceStep.low;
  }, [chainInfo, chainKey, gasPriceStep]);

  return value;
}
