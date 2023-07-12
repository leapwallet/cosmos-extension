import { getSourceChainChannelId, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { useQuery } from '@tanstack/react-query';

import { useChainsStore } from '../store';

export const useDefaultChannelId = (sourceChain: string, targetChain: string) => {
  const { chains } = useChainsStore();

  const sourceChainInfo = chains[sourceChain as SupportedChain];
  const targetChainInfo = chains[targetChain as SupportedChain];

  return useQuery({
    queryKey: ['source-channel', sourceChain, targetChain],
    queryFn: async () => {
      if (!sourceChainInfo || !targetChainInfo) {
        throw new Error('not-supported');
      }
      try {
        return getSourceChainChannelId(sourceChainInfo.chainRegistryPath, targetChainInfo.chainRegistryPath);
      } catch (e) {
        if (e instanceof Error && e.message === 'not-supported') {
          return undefined;
        } else {
          throw e;
        }
      }
    },
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message === 'not-supported') {
        return false;
      }
      return failureCount < 3;
    },
    enabled: !!sourceChainInfo && !!targetChainInfo,
  });
};
