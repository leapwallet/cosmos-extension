import { rawSecp256k1PubkeyToRawAddress } from '@cosmjs/amino'
import { fromHex, toBech32 } from '@cosmjs/encoding'
import { Key, useActiveWalletStore, WALLETTYPE } from '@leapwallet/cosmos-wallet-hooks'
import {
  ChainInfo,
  generateWalletFromMnemonic,
  generateWalletFromPrivateKey,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk'
import getHDPath from '@leapwallet/cosmos-wallet-sdk/dist/utils/get-hdpath'
import { decrypt } from '@leapwallet/leap-keychain'
import { KeyChain } from '@leapwallet/leap-keychain'
import { Secp256k1 } from '@leapwallet/leap-keychain'
import { useChainInfos } from 'hooks/useChainInfos'
import { useCallback, useEffect } from 'react'
import browser from 'webextension-polyfill'

import { ACTIVE_WALLET, KEYSTORE, MANAGE_CHAIN_SETTINGS } from '../../config/storage-keys'
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
      const addressPrefix = (chainInfos[chain] || chainInfo)?.addressPrefix
      const hdPath = getHDPath(
        (chainInfos[chain] || chainInfo)?.bip44.coinType,
        existingWallet.addressIndex.toString(),
      )
      const secret = decrypt(existingWallet.cipher, password as string)
      if (!addressPrefix) return existingWallet
      if (actionType === 'DELETE') {
        existingWallet.pubKeys && delete existingWallet.pubKeys[chain]
        delete existingWallet.addresses[chain]
        return existingWallet
      } else if (
        existingWallet.walletType === WALLETTYPE.SEED_PHRASE ||
        existingWallet.walletType === WALLETTYPE.SEED_PHRASE_IMPORTED
      ) {
        const wallet = await generateWalletFromMnemonic(secret, hdPath, addressPrefix)
        const accounts = await wallet.getAccounts()
        const cryptoPubKey = Secp256k1.publicKeyConvert(accounts[0].pubkey, true)
        const pubKeys = existingWallet.pubKeys
          ? { ...existingWallet.pubKeys, [chain]: Buffer.from(cryptoPubKey).toString('base64') }
          : ({ [chain]: Buffer.from(cryptoPubKey).toString('base64') } as unknown as Record<
              SupportedChain,
              string
            >)
        return {
          ...existingWallet,
          addresses: {
            ...existingWallet.addresses,
            [chain]: accounts[0].address,
          },
          pubKeys,
        }
      } else if (existingWallet.walletType === WALLETTYPE.PRIVATE_KEY) {
        const wallet = await generateWalletFromPrivateKey(secret, addressPrefix)
        const accounts = await wallet.getAccounts()
        const cryptoPubKey = Secp256k1.publicKeyConvert(accounts[0].pubkey, true)
        const pubKeys = existingWallet.pubKeys
          ? { ...existingWallet.pubKeys, [chain]: Buffer.from(cryptoPubKey).toString('base64') }
          : ({ [chain]: Buffer.from(cryptoPubKey).toString('base64') } as unknown as Record<
              SupportedChain,
              string
            >)
        return {
          ...existingWallet,
          addresses: {
            ...existingWallet.addresses,
            [chain]: accounts[0].address,
          },
          pubKeys,
        }
      } else if (existingWallet.walletType === WALLETTYPE.LEDGER) {
        const compressedPubKey = rawSecp256k1PubkeyToRawAddress(
          Secp256k1.publicKeyConvert(fromHex(secret), true),
        )

        const address = toBech32(addressPrefix, compressedPubKey)
        const rawPubKey = Secp256k1.publicKeyConvert(fromHex(secret), true)
        const pubKeyString = Buffer.from(rawPubKey).toString('base64')

        const pubKeys = existingWallet.pubKeys
          ? {
              ...existingWallet.pubKeys,
              [chain]: pubKeyString,
            }
          : ({
              [chain]: pubKeyString,
            } as Record<SupportedChain, string>)

        const addresses = existingWallet.addresses[chain]
          ? existingWallet.addresses
          : { ...existingWallet.addresses, [chain]: address }

        return {
          ...existingWallet,
          addresses,
          pubKeys,
        }
      }
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
    browser.storage.local.get([ACTIVE_WALLET, MANAGE_CHAIN_SETTINGS]).then((storage) => {
      setActiveWallet(storage[ACTIVE_WALLET])
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [password])
}

export default function useActiveWallet() {
  const { setActiveWallet: setState, activeWallet } = useActiveWalletStore()

  const setActiveWallet = useCallback(
    async (wallet: Key | null) => {
      const tabs = await browser.tabs.query({
        status: 'complete',
        active: true,
        currentWindow: true,
      })

      for (const tab of tabs) {
        try {
          if (tab.active && !tab.discarded && tab.id) {
            await browser.tabs.sendMessage(tab.id, { event: 'leap_keystorechange' })
          }
        } catch (e) {
          //
        }
      }

      await browser.storage.local.set({ [ACTIVE_WALLET]: wallet })
      try {
        setState(wallet)
      } catch (e) {
        //
      }

      // }
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeWallet, setState],
  )

  return { activeWallet, setActiveWallet }
}
