import { KeyChain } from '@leapwallet/leap-keychain'
import {
  ACTIVE_WALLET,
  ENCRYPTED_ACTIVE_WALLET,
  ENCRYPTED_KEY_STORE,
  KEYSTORE,
  V80_KEYSTORE_MIGRATION_COMPLETE,
} from 'config/storage-keys'
import browser from 'webextension-polyfill'

import { startAutoLockTimer } from './autolock-timer'
import { migrateEncryptedKeyStore, migrateKeyStore } from './migrations/v80'
export class PasswordManager {
  private password: string | undefined

  static create() {
    const passwordManager = new PasswordManager()
    passwordManager.init()
    return passwordManager
  }

  private async init() {
    startAutoLockTimer(this)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const listener = async (message: any, sender: any) => {
      if (sender.id !== browser.runtime.id) return
      if (message.type === 'popup-open') {
        if (this.password) {
          browser.runtime.sendMessage({
            type: 'authentication',
            data: {
              status: 'success',
              password: this.password,
            },
          })
        } else {
          browser.runtime.sendMessage({
            type: 'authentication',
            data: {
              status: 'failed',
            },
          })
        }
      }

      if (message.type === 'unlock') {
        const storage = await browser.storage.local.get([
          ACTIVE_WALLET,
          KEYSTORE,
          V80_KEYSTORE_MIGRATION_COMPLETE,
          ENCRYPTED_KEY_STORE,
          ENCRYPTED_ACTIVE_WALLET,
        ])
        const { password } = message.data
        if (!storage[V80_KEYSTORE_MIGRATION_COMPLETE]) {
          if (storage[ENCRYPTED_KEY_STORE] && storage[ENCRYPTED_ACTIVE_WALLET]) {
            await migrateEncryptedKeyStore(storage, password)
          } else {
            await migrateKeyStore(storage, password)
          }
        }

        this.password = password
        if (!storage[ACTIVE_WALLET]) {
          await KeyChain.decrypt(password)
        }
        browser.runtime.sendMessage({
          type: 'wallet-unlocked',
        })
      }

      if (message.type === 'lock') {
        await this.lockWallet()
      }
    }
    browser.runtime.onMessage.addListener(listener)
  }

  async lockWallet() {
    if (this.password) {
      const storage = await browser.storage.local.get([ACTIVE_WALLET])
      if (storage[ACTIVE_WALLET]) {
        await KeyChain.encrypt(this.password)
      }
      this.password = undefined
    }
  }

  clearPassword() {
    this.password = undefined
  }

  getPassword() {
    return this.password
  }
}
