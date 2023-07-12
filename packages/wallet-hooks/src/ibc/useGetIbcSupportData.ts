import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { useQuery } from '@tanstack/react-query';

import { useChainsStore } from '../store';

export const useGetIBCSupport = (chain: SupportedChain) => {
  const { chains } = useChainsStore();

  const chainInfo = chains[chain];
  const path = chainInfo.chainRegistryPath;

  return useQuery<Record<string, boolean>>({
    queryKey: ['ibc-support-data', path],
    queryFn: async () => {
      const res = await fetch(`https://assets.leapwallet.io/ibc-support-db/chains/${path}.json`);
      const supportedChains: string[] = await res.json();
      return supportedChains.reduce((acc, cur) => {
        const key = cur === 'cosmoshub' ? 'cosmos' : cur;
        return { ...acc, [key]: true };
      }, {});
    },
    retry: 2,
    retryDelay: 0,
  });
};
