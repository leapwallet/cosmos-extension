import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { useMemo } from 'react';

import { useActiveChain, useIsCompassWallet } from '../store';

export function useIsSeiEvmChain(forceChain?: SupportedChain) {
  const _activeChain = useActiveChain();
  const activeChain = forceChain || _activeChain;
  const isCompassWallet = useIsCompassWallet();

  return useMemo(
    () => isCompassWallet && (activeChain === 'seiDevnet' || activeChain === 'seiTestnet2'),
    [activeChain, isCompassWallet],
  );
}
