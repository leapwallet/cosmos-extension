import { KeyChain } from '@leapwallet/leap-keychain'
import { ACTIVE_WALLET } from 'config/storage-keys'
import browser from 'webextension-polyfill'

import { startAutoLockTimer } from './autolock-timer'

export class PasswordManager {
  protected password: string | undefined

  static create() {
    const passwordManager = new PasswordManager()
    passwordManager.init()
    return passwordManager
  }

  private async init() {
    startAutoLockTimer(this)
    const listener = async (message: any) => {
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
        const storage = await browser.storage.local.get([ACTIVE_WALLET])
        const { password } = message.data
        this.password = password
        if (!storage[ACTIVE_WALLET]) {
          await KeyChain.decrypt(password)
        }
        browser.runtime.sendMessage({
          type: 'wallet-unlocked',
        })
      }

      if (message.type === 'lock') {
        if (this.password) {
          const storage = await browser.storage.local.get([ACTIVE_WALLET])
          if (storage[ACTIVE_WALLET]) {
            await KeyChain.encrypt(this.password)
          }
          this.password = undefined
        }
      }
    }
    browser.runtime.onMessage.addListener(listener)
  }

  clearPassword() {
    this.password = undefined
  }

  getPassword() {
    return this.password
  }
}
