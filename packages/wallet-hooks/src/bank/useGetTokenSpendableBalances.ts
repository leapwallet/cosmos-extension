import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';

import { useGetTokenBalances } from './useGetTokenBalances';

export function useGetTokenSpendableBalances(forceChain?: SupportedChain, forceNetwork?: 'mainnet' | 'testnet') {
  const data = useGetTokenBalances(forceChain, forceNetwork, true);
  return data;
}
