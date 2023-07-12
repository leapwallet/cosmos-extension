import { useSetPrimaryAddress, WALLETTYPE } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { KeyChain } from '@leapwallet/leap-keychain'
import { useEffect } from 'react'
import browser from 'webextension-polyfill'

import { PRIMARY_WALLET_ADDRESS } from '../../config/storage-keys'

export function useInitPrimaryWalletAddress() {
  const setPrimaryWalletAddress = useSetPrimaryAddress()

  useEffect(() => {
    browser.storage.local.get([PRIMARY_WALLET_ADDRESS]).then((storage) => {
      const primaryWalletAddress = storage[PRIMARY_WALLET_ADDRESS]
      if (primaryWalletAddress) {
        setPrimaryWalletAddress(storage[PRIMARY_WALLET_ADDRESS])
      } else {
        KeyChain.getAllWallets<SupportedChain>().then((wallets) => {
          if (wallets) {
            const _wallets = Object.values(wallets)
            const primaryWallet = _wallets.find(
              (wallet) => wallet.walletType === WALLETTYPE.SEED_PHRASE && wallet.addressIndex === 0,
            )
            if (primaryWallet) {
              setPrimaryWalletAddress(primaryWallet.addresses.cosmos)
              browser.storage.local.set({
                [PRIMARY_WALLET_ADDRESS]: primaryWallet.addresses.cosmos,
              })
            } else {
              const primaryWalletAddress = _wallets[0].addresses.cosmos
              browser.storage.local.set({ [PRIMARY_WALLET_ADDRESS]: primaryWalletAddress })
              setPrimaryWalletAddress(primaryWalletAddress)
            }
          }
        })
      }
    })
  }, [])
}
