import {
  useSelectedNetwork as useSelectedNetworkWalletHooks,
  useSetSelectedNetwork,
} from '@leapwallet/cosmos-wallet-hooks'
import { SELECTED_NETWORK } from 'config/storage-keys'
import { useEffect } from 'react'
import { useSetRecoilState } from 'recoil'
import browser from 'webextension-polyfill'

import { selectedChainAlertState } from '../../atoms/selected-chain-alert'

export type SelectedNetwork = 'mainnet' | 'testnet'

export function useSelectedNetwork() {
  return useSelectedNetworkWalletHooks()
}

export function useSetNetwork() {
  const setSelectedNetwork = useSetSelectedNetwork()
  const setShowChainAlert = useSetRecoilState(selectedChainAlertState)

  return (chain: SelectedNetwork) => {
    setShowChainAlert(true)
    setSelectedNetwork(chain)
    browser.storage.local.set({ [SELECTED_NETWORK]: chain })
  }
}

export function useInitNetwork() {
  const setNetwork = useSetNetwork()
  useEffect(() => {
    browser.storage.local.get(SELECTED_NETWORK).then((storage) => {
      const network = storage[SELECTED_NETWORK]
      const defaultNetwork = process.env.APP === 'compass' ? 'testnet' : 'mainnet'
      setNetwork(network ?? defaultNetwork)
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
