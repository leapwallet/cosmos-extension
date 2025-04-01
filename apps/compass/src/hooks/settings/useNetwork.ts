import {
  useSelectedNetwork as useSelectedNetworkWalletHooks,
  useSetSelectedNetwork,
} from '@leapwallet/cosmos-wallet-hooks'
import { SELECTED_NETWORK } from 'config/storage-keys'
import { useEffect } from 'react'
import { rootStore } from 'stores/root-store'
import browser from 'webextension-polyfill'

import { isCompassWallet } from '../../utils/isCompassWallet'

export type SelectedNetwork = 'mainnet' | 'testnet'

export function useSelectedNetwork() {
  return useSelectedNetworkWalletHooks()
}

export function useSetNetwork() {
  const setSelectedNetwork = useSetSelectedNetwork()

  return (chain: SelectedNetwork) => {
    rootStore.setSelectedNetwork(chain)
    setSelectedNetwork(chain)
    browser.storage.local.set({ [SELECTED_NETWORK]: chain })
  }
}

export function useInitNetwork() {
  const setNetwork = useSetNetwork()
  useEffect(() => {
    browser.storage.local.get(SELECTED_NETWORK).then((storage) => {
      const network = storage[SELECTED_NETWORK]
      const defaultNetwork = isCompassWallet() ? 'testnet' : 'mainnet'
      setNetwork(network ?? defaultNetwork)
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
