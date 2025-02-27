import { NetworkType, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { useEffect } from 'react'
import { evmGasPricesStore } from 'stores/fee-store'

export const useEnableEvmGasRefetch = (activeChain: SupportedChain, activeNetwork: NetworkType) => {
  const store = evmGasPricesStore.getStore(activeChain, activeNetwork)

  useEffect(() => {
    if (!store) return

    store.enableRefetch()

    return () => store.disableRefetch()
  }, [activeChain, activeNetwork, store])
}
