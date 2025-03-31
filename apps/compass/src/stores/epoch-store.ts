import { useActiveChainStore, useActiveWalletStore } from '@leapwallet/cosmos-wallet-hooks'
import { StakeEpochStore } from '@leapwallet/cosmos-wallet-store'
import { useEffect } from 'react'

import { chainInfoStore } from './chain-infos-store'
import { selectedNetworkStore } from './selected-network-store'

export const stakeEpochStore = new StakeEpochStore(selectedNetworkStore, chainInfoStore)

export const useInitEpochStore = () => {
  const activeChain = useActiveChainStore((state) => state.activeChain)
  const activeWalletAddress = useActiveWalletStore(
    (state) => state.activeWallet?.addresses?.babylon,
  )

  useEffect(() => {
    if (!activeWalletAddress || activeChain !== 'babylon') return // only fetch epoch messages for babylon chain

    stakeEpochStore.setWalletAddress(activeWalletAddress)
  }, [activeChain, activeWalletAddress])
}
