import { getBlockChainFromAddress, getChannelIds, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { useCallback } from 'react';

import { useAddress, useAddressPrefixes, useChainsStore } from '../store';

export function useGetIbcChannelId(forceChain?: SupportedChain) {
  const fromAddress = useAddress(forceChain);
  const { chains } = useChainsStore();
  const addressPrefixes = useAddressPrefixes();

  return useCallback(
    async (toAddress: string) => {
      const sourceChainPrefix = getBlockChainFromAddress(fromAddress);
      const recipientChainPrefix = getBlockChainFromAddress(toAddress);

      if (!sourceChainPrefix || !recipientChainPrefix) {
        throw new Error('We currently do not support IBC across these chains');
      }

      const _sourceChain = addressPrefixes[sourceChainPrefix] as string | undefined;
      const _recipientChain = addressPrefixes[recipientChainPrefix] as string | undefined;

      if (!_sourceChain || !_recipientChain) {
        throw new Error('We currently do not support IBC across these chains');
      }

      const sourceChain = (_sourceChain === 'cosmoshub' ? 'cosmos' : _sourceChain) as SupportedChain;
      const recipientChain = (_recipientChain === 'cosmoshub' ? 'cosmos' : _recipientChain) as SupportedChain;

      const srcChainPath = chains[sourceChain]?.chainRegistryPath ?? sourceChain;
      const destChainPath = chains[recipientChain]?.chainRegistryPath ?? recipientChain;

      if (srcChainPath && destChainPath && srcChainPath !== destChainPath) {
        try {
          return getChannelIds(srcChainPath, destChainPath);
        } catch (_) {
          throw new Error('We currently do not support IBC across these chains');
        }
      }
    },
    [fromAddress, addressPrefixes],
  );
}
