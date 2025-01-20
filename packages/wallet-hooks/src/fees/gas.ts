import { isAptosChain, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { gasAdjustments as defaultGasAdjustments } from '@leapwallet/cosmos-wallet-sdk';
import { useMemo } from 'react';

import { useActiveChain, useGasAdjustments } from '../store';

export const useGasAdjustmentForChain = (forceChain?: string) => {
  const gasAdjustments = useGasAdjustments();
  const activeChain = useActiveChain();
  const chain = useMemo(() => (forceChain || activeChain) as SupportedChain, [forceChain, activeChain]);

  return useMemo(() => {
    // !TODO: remove this once we have gas adjustments for aptos
    if (isAptosChain(chain)) {
      return defaultGasAdjustments[chain];
    }

    return gasAdjustments[chain] ?? gasAdjustments.cosmos;
  }, [gasAdjustments, chain]);
};
