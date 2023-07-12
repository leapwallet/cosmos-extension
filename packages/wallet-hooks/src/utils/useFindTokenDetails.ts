import { NativeDenom, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { useCallback } from 'react';

import { useActiveChain, useDenoms, useGetChains } from '../store';

/** @returns `undefined` if either the `token` doesn't exist or the dataset hasn't been successfully fetched yet. */
export type FindTokenDetails = (denom: string) => NativeDenom | undefined;

export function useFindTokenItemByToken(forcedChain?: SupportedChain): FindTokenDetails {
  const chains = useGetChains();
  const activeChain = forcedChain ?? useActiveChain();
  const denoms = useDenoms();
  const chainInfo = chains[activeChain];

  return useCallback((denom: string) => denoms[denom], [chainInfo]);
}
