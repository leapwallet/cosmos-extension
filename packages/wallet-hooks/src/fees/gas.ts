import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';

import { useActiveChain, useGasAdjustments } from '../store';

export const useGasAdjustmentForChain = (forceChain?: string) => {
  const gasAdjustments = useGasAdjustments();
  const activeChain = useActiveChain();
  const chain = (forceChain ?? activeChain) as SupportedChain;

  return gasAdjustments[chain] ?? gasAdjustments.cosmos;
};
