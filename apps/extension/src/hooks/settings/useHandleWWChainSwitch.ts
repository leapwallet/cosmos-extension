import { useSetActiveChain } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { useEffect } from 'react'
import { rootStore } from 'stores/root-store'

import { useActiveChain } from './useActiveChain'
import useActiveWallet from './useActiveWallet'

export function useHandleWatchWalletChainSwitch(isActiveChainInitialized: boolean) {
  const { activeWallet } = useActiveWallet()
  const activeChain = useActiveChain()
  const setActiveChain = useSetActiveChain()

  useEffect(() => {
    if (
      activeWallet &&
      !!activeWallet.watchWallet &&
      isActiveChainInitialized &&
      activeChain !== ('aggregated' as SupportedChain) &&
      !activeWallet?.addresses[activeChain]
    ) {
      setActiveChain('aggregated' as SupportedChain)
      rootStore.setActiveChain('aggregated')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWallet?.addresses, isActiveChainInitialized])
}
