import { DenomsRecord, NativeDenom, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { useMemo } from 'react';

import { useActiveChain, useChainsStore, useDenoms, useSelectedNetwork, useStakingDenoms } from '../store';

export function useActiveStakingDenom(
  denoms: DenomsRecord,
  forceChain?: SupportedChain,
  forceNetwork?: 'mainnet' | 'testnet',
) {
  const _activeNetwork = useSelectedNetwork();
  const _activeChain = useActiveChain();
  const stakingDenoms = useStakingDenoms();
  const { chains } = useChainsStore();
  const activeChain = forceChain || _activeChain;

  const activeChainInfo = chains[activeChain] ?? chains.cosmos;

  const activeNetwork = forceNetwork || _activeNetwork;

  const activeStakingDenoms = stakingDenoms[activeNetwork][activeChain];

  return useMemo(() => {
    if (!activeStakingDenoms) {
      let nativeDenom = Object.values(activeChainInfo.nativeDenoms)[0];
      nativeDenom = {
        ...nativeDenom,
        coinGeckoId: nativeDenom.coinGeckoId ?? '',
        icon: nativeDenom.icon ?? '',
      };

      const activeStakingDenom = denoms[nativeDenom.coinMinimalDenom] ?? nativeDenom;
      return [activeStakingDenom];
    }

    return activeStakingDenoms.reduce((acc: NativeDenom[], curr: string) => {
      if (denoms[curr]) {
        return [...acc, denoms[curr]];
      }

      return acc;
    }, []);
  }, [activeStakingDenoms, activeChainInfo.nativeDenoms, denoms]);
}
