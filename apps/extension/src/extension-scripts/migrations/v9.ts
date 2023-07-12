import browser from 'webextension-polyfill'

import { ACTIVE_WALLET, KEYSTORE } from '../../config/storage-keys'

export function storageMigrationV9(storage: Record<string, any>) {
  const keyStore = storage[KEYSTORE]
  const activeWallet = storage[ACTIVE_WALLET]
  const walletEntries = Object.entries(keyStore)

  const hasZeroIndex = walletEntries.find((wallet: [string, any]) => wallet[1].addressIndex === 0)

  const firstEntry: any = walletEntries.reduce((acc: any, currentValue: any) => {
    if (acc[1].addressIndex > currentValue[1].addressIndex) {
      return currentValue
    } else {
      return acc
    }
  })

  const newWalletEntries = walletEntries.reduce((newEntries: any, wallet) => {
    const [id, walletData]: [id: string, walletData: any] = wallet
    if (walletData.addressIndex === 1 && !hasZeroIndex) {
      walletData.addressIndex = 0
      newEntries[id] = walletData
      return newEntries
    } else if (walletData.cipher !== firstEntry[1].cipher && walletData.walletType === 0) {
      walletData.addressIndex = 0
      newEntries[id] = walletData
      newEntries[id].walletType = 2
      return newEntries
    } else {
      newEntries[id] = walletData
      return newEntries
    }
  }, {})

  const newActiveWallet = newWalletEntries[activeWallet.id]
  browser.storage.local.set({
    [KEYSTORE]: newWalletEntries,
    [ACTIVE_WALLET]: newActiveWallet,
  })
}
