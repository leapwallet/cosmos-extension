/* eslint-disable @typescript-eslint/no-explicit-any */
import browser from 'webextension-polyfill'

import { KEYSTORE, PRIMARY_WALLET_ADDRESS } from '../../config/storage-keys'

export function storageMigrationV10(storage: Record<string, any>) {
  const keystore = storage[KEYSTORE]
  const primaryWallet: any = Object.values(keystore).find(
    (wallet: any) => wallet.addressIndex === 0 && wallet.walletType === 0,
  )
  if (primaryWallet?.addresses?.cosmos) {
    browser.storage.local.set({
      [PRIMARY_WALLET_ADDRESS]: primaryWallet.addresses.cosmos,
    })
  }
}
