import { gasAdjustment, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';

import { useActiveChain } from '../store';

export const useGasAdjustment = (forceChain?: string) => {
  const activeChain = useActiveChain();
  const chain = (forceChain ?? activeChain) as SupportedChain;

  return gasAdjustment[chain] ?? gasAdjustment.cosmos;
};
