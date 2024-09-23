import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useChainsStore } from '../store';

export const useGetIBCSupport = (chain: SupportedChain) => {
  const { chains } = useChainsStore();
  const path = useMemo(() => chains[chain]?.chainRegistryPath, [chains, chain]);

  return useQuery<Record<string, boolean>>({
    queryKey: ['ibc-support-data', path],
    queryFn: async () => {
      if (chain === 'seiDevnet') return {};
      const res = await fetch(`https://assets.leapwallet.io/ibc-support-db/chains/${path}.json`);
      const supportedChains: string[] = await res.json();
      return supportedChains.reduce((acc, curr) => {
        return { ...acc, [curr]: true };
      }, {});
    },
    retry: 2,
    retryDelay: 0,
  });
};
