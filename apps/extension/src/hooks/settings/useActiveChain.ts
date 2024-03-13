import {
  Key,
  useActiveChain as useActiveChainWalletHooks,
  usePendingTxState,
  useSetActiveChain as useSetActiveChainWalletHooks,
  useSetSelectedNetwork,
} from '@leapwallet/cosmos-wallet-hooks'
import { ChainInfo, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { useQueryClient } from '@tanstack/react-query'
import { ACTIVE_CHAIN, KEYSTORE } from 'config/storage-keys'
import { useSetNetwork } from 'hooks/settings/useNetwork'
import { useChainInfos } from 'hooks/useChainInfos'
import { useEffect } from 'react'
import { useSetRecoilState } from 'recoil'
import browser from 'webextension-polyfill'

import { selectedChainAlertState } from '../../atoms/selected-chain-alert'
import { isCompassWallet } from '../../utils/isCompassWallet'
import useActiveWallet, { useUpdateKeyStore } from './useActiveWallet'

export function useActiveChain(): SupportedChain {
  return useActiveChainWalletHooks()
}

export function useSetActiveChain() {
  const chainInfos = useChainInfos()
  const setSelectedChainAlert = useSetRecoilState(selectedChainAlertState)
  const { setPendingTx } = usePendingTxState()
  const setNetwork = useSetNetwork()
  const setSelectedNetwork = useSetSelectedNetwork()

  const updateKeyStore = useUpdateKeyStore()
  const { activeWallet, setActiveWallet } = useActiveWallet()
  const setActiveChain = useSetActiveChainWalletHooks()

  const queryClient = useQueryClient()

  return async (chain: SupportedChain, chainInfo?: ChainInfo) => {
    // if (isCompassWallet()) {
    //   setActiveChain(chainInfos.seiTestnet2.key)
    //   return
    // }

    const storage = await browser.storage.local.get(['networkMap', KEYSTORE])
    const keystore = storage[KEYSTORE]
    if (keystore) {
      const shouldUpdateKeystore = Object.keys(keystore).some((key) => {
        const wallet = keystore[key]
        return wallet && (!wallet.addresses[chain] || !wallet.pubKeys?.[chain])
      })
      if (activeWallet && shouldUpdateKeystore) {
        const updatedKeystore = await updateKeyStore(activeWallet, chain)
        await setActiveWallet(updatedKeystore[activeWallet.id] as Key)
      }
    }

    await queryClient.cancelQueries()
    setActiveChain(chain)
    setSelectedChainAlert(true)
    browser.storage.local.set({ [ACTIVE_CHAIN]: chain })
    setPendingTx(null)

    const networkMap = JSON.parse(storage.networkMap ?? '{}')

    if (networkMap[chain]) {
      setNetwork(networkMap[chain])
      setSelectedNetwork(networkMap[chain])
    } else if ((chainInfos[chain] || chainInfo).apis.rpc) {
      setNetwork('mainnet')
      setSelectedNetwork('mainnet')
    } else if ((chainInfos[chain] || chainInfo).apis.rpcTest) {
      setNetwork('testnet')
      setSelectedNetwork('testnet')
    }
  }
}

export function useInitActiveChain() {
  const chainInfos = useChainInfos()
  const setActiveChain = useSetActiveChainWalletHooks()
  useEffect(() => {
    browser.storage.local.get(ACTIVE_CHAIN).then((storage) => {
      let activeChain: SupportedChain = storage[ACTIVE_CHAIN]
      const defaultActiveChain = isCompassWallet()
        ? chainInfos.seiTestnet2.key
        : chainInfos.cosmos.key
      if (!activeChain) {
        activeChain = defaultActiveChain
      }
      if (isCompassWallet() && activeChain !== chainInfos.seiTestnet2.key) {
        activeChain = defaultActiveChain
      }
      setActiveChain(activeChain)
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainInfos])
}
