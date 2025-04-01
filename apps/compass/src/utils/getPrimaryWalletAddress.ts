import browser from 'webextension-polyfill'

import { PRIMARY_WALLET_ADDRESS } from '../config/storage-keys'

export async function getPrimaryWalletAddress(): Promise<string | undefined> {
  const storage = await browser.storage.local.get([PRIMARY_WALLET_ADDRESS])
  return storage[PRIMARY_WALLET_ADDRESS]
}
