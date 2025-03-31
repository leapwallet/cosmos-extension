import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { decrypt, encrypt, Key } from '@leapwallet/leap-keychain'
import {
  ACTIVE_WALLET,
  ENCRYPTED_ACTIVE_WALLET,
  ENCRYPTED_KEY_STORE,
  KEYSTORE,
  V80_KEYSTORE_MIGRATION_COMPLETE,
} from 'config/storage-keys'
import { PasswordManager } from 'extension-scripts/password-manager'
import browser from 'webextension-polyfill'

function updateWallet(wallet: Key<SupportedChain>, password: Uint8Array) {
  const cipher = decrypt(wallet.cipher, password, 100)
  const newCipher = encrypt(cipher, password)
  const newWallet = { ...wallet, cipher: newCipher }
  return newWallet
}

export function migrateEncryptedWallet(encryptedWallet: string, password: Uint8Array) {
  const decryptedActiveWallet = decrypt(encryptedWallet, password, 100)
  const newWallet = updateWallet(JSON.parse(decryptedActiveWallet), password)
  const newEncryptedWallet = encrypt(JSON.stringify(newWallet), password)
  return { newEncryptedWallet, newWallet }
}

export async function migrateEncryptedKeyStore(storage: Record<string, any>, password: Uint8Array) {
  if (storage[ENCRYPTED_KEY_STORE] && storage[ENCRYPTED_ACTIVE_WALLET]) {
    const { newEncryptedWallet, newWallet } = migrateEncryptedWallet(
      storage[ENCRYPTED_ACTIVE_WALLET],
      password,
    )
    const keyStore = JSON.parse(decrypt(storage[ENCRYPTED_KEY_STORE], password, 100))
    const keyStoreEntries = Object.entries(keyStore)
    const newKeyStore: Record<string, any> = {}
    for (const [key, value] of keyStoreEntries) {
      const newWallet = updateWallet(value as Key<SupportedChain>, password)
      newKeyStore[key] = newWallet
    }
    const newEncryptedKeyStore = encrypt(JSON.stringify(newKeyStore), password)

    await browser.storage.local.set({
      [ENCRYPTED_KEY_STORE]: newEncryptedKeyStore,
      [KEYSTORE]: newKeyStore,
      [ENCRYPTED_ACTIVE_WALLET]: newEncryptedWallet,
      [ACTIVE_WALLET]: newWallet,
      [V80_KEYSTORE_MIGRATION_COMPLETE]: true,
    })
  }
}

export async function migrateKeyStore(storage: Record<string, any>, password: Uint8Array) {
  if (storage[KEYSTORE] && storage[ACTIVE_WALLET]) {
    const updatedActiveWallet = updateWallet(storage[ACTIVE_WALLET], password)
    const updatedKeyStore: Record<string, any> = {}
    for (const [key, value] of Object.entries(storage[KEYSTORE])) {
      updatedKeyStore[key] = updateWallet(value as Key<SupportedChain>, password)
    }
    await browser.storage.local.set({
      [KEYSTORE]: updatedKeyStore,
      [ACTIVE_WALLET]: updatedActiveWallet,
      [V80_KEYSTORE_MIGRATION_COMPLETE]: true,
    })
  }
}

export function storageMigrationV80(passwordManager: PasswordManager) {
  passwordManager.clearPassword()
}
