import { Key, useActiveWalletStore } from '@leapwallet/cosmos-wallet-hooks'
import { ChainInfo, getSeiEvmAddressToShow, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { KeyChain } from '@leapwallet/leap-keychain'
import { useChainInfos } from 'hooks/useChainInfos'
import { getUpdatedKeyStore } from 'hooks/wallet/getUpdatedKeyStore'
import { useCallback, useEffect } from 'react'
import { sendMessageToTab } from 'utils'
import { isCompassWallet } from 'utils/isCompassWallet'
import browser from 'webextension-polyfill'

import {
  ACTIVE_CHAIN,
  ACTIVE_WALLET,
  ACTIVE_WALLET_ID,
  KEYSTORE,
  MANAGE_CHAIN_SETTINGS,
} from '../../config/storage-keys'
import { usePassword } from './usePassword'

type ActionType = 'UPDATE' | 'DELETE'

function useHandleMissingAddressAndPubKeys() {
  const password = usePassword()
  const chainInfos = useChainInfos()

  return useCallback(
    async (
      chain: SupportedChain,
      existingWallet: Key,
      actionType: ActionType,
      chainInfo?: ChainInfo,
    ): Promise<Key | undefined> => {
      if (!password) return existingWallet
      return getUpdatedKeyStore(chainInfos, password, chain, existingWallet, actionType, chainInfo)
    },
    [password, chainInfos],
  )
}

export function useUpdateKeyStore() {
  const handleMissingAddressAndPubKeys = useHandleMissingAddressAndPubKeys()
  return useCallback(
    async (
      wallet: Key,
      activeChain: SupportedChain,
      actionType: ActionType = 'UPDATE',
      chainInfo?: ChainInfo,
    ) => {
      const keystore = await KeyChain.getAllWallets()
      const newKeystoreEntries: [string, Key | undefined][] = await Promise.all(
        Object.entries(keystore).map(async (keystoreEntry) => {
          const [walletId, walletInfo] = keystoreEntry
          const newWallet = await handleMissingAddressAndPubKeys(
            activeChain,
            walletInfo,
            actionType,
            chainInfo,
          )
          return [walletId, newWallet]
        }),
      )

      const newKeystore = newKeystoreEntries.reduce(
        (newKs: Record<string, Key | undefined>, keystoreEntry) => {
          newKs[keystoreEntry[0]] = keystoreEntry[1]
          return newKs
        },
        {},
      )
      await browser.storage.local.set({
        [KEYSTORE]: newKeystore,
        [ACTIVE_WALLET]: newKeystore[wallet.id],
      })
      return newKeystore
    },
    [handleMissingAddressAndPubKeys],
  )
}

export function useInitActiveWallet() {
  const { setActiveWallet } = useActiveWalletStore()
  const password = usePassword()
  useEffect(() => {
    browser.storage.local
      .get([ACTIVE_WALLET, MANAGE_CHAIN_SETTINGS, ACTIVE_WALLET_ID])
      .then((storage) => {
        const activeWallet = storage[ACTIVE_WALLET]
        const activeWalletId = storage[ACTIVE_WALLET_ID]
        setActiveWallet(activeWallet)
        if (!activeWalletId && activeWallet) {
          browser.storage.local.set({ [ACTIVE_WALLET_ID]: storage[ACTIVE_WALLET].id })
        }
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [password])
}

export default function useActiveWallet() {
  const { setActiveWallet: setState, activeWallet } = useActiveWalletStore()

  const setActiveWallet = useCallback(
    async (wallet: Key | null) => {
      if (!wallet) return

      if (isCompassWallet()) {
        const store = await browser.storage.local.get([ACTIVE_CHAIN])
        const activeChain = store[ACTIVE_CHAIN] as SupportedChain

        const evmAddress = getSeiEvmAddressToShow(wallet.pubKeys?.[activeChain])
        await sendMessageToTab({ event: 'accountsChanged', data: [evmAddress] })
      }

      await sendMessageToTab({ event: 'leap_keystorechange' })
      await browser.storage.local.set({ [ACTIVE_WALLET]: wallet, [ACTIVE_WALLET_ID]: wallet.id })
      try {
        setState(wallet)
      } catch (e) {
        //
      }
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeWallet, setState],
  )

  return { activeWallet, setActiveWallet }
}
