import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { useMemo } from 'react';

import { useActiveChain, useGasAdjustments } from '../store';

export const useGasAdjustmentForChain = (forceChain?: string) => {
  const gasAdjustments = useGasAdjustments();
  const activeChain = useActiveChain();
  const chain = useMemo(() => (forceChain || activeChain) as SupportedChain, [forceChain, activeChain]);

  return useMemo(() => gasAdjustments[chain] ?? gasAdjustments.cosmos, [gasAdjustments, chain]);
};
