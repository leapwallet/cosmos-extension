import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { useQuery } from '@tanstack/react-query';

import { LeapWalletApi } from '../apis';
import { useAddress } from '../store';

export const useWalletIdentifications = (chain: SupportedChain) => {
  const address = useAddress(chain);

  return useQuery(
    [`query-${chain}-wallet-identifications`, address],
    async function () {
      try {
        const identifications = await LeapWalletApi.getWalletIdentifications(address);
        return identifications;
      } catch (error) {
        console.error('Failed to fetch wallet identifications', error);
        return undefined;
      }
    },
    {
      enabled: !!address,
      refetchOnWindowFocus: false,
      staleTime: 60 * 1000,
    },
  );
};
