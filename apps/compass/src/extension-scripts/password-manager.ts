import { KeyChain } from '@leapwallet/leap-keychain'
import { ACTIVE_WALLET } from 'config/storage-keys'
import browser from 'webextension-polyfill'

import { startAutoLockTimer } from './autolock-timer'
export class PasswordManager {
  private password: Uint8Array | undefined

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
          const base64Password = Buffer.from(this.password).toString('base64')
          await browser.runtime.sendMessage({
            type: 'authentication',
            data: {
              status: 'success',
              password: base64Password,
            },
          })
        } else {
          await browser.runtime.sendMessage({
            type: 'authentication',
            data: {
              status: 'failed',
            },
          })
        }
      }

      if (message.type === 'unlock') {
        const { password: base64Password } = message.data
        this.password = Buffer.from(base64Password, 'base64')
      }

      if (message.type === 'lock') {
        await this.lockWallet()
      }
    }
    browser.runtime.onMessage.addListener(listener)
  }

  async lockWallet() {
    if (this.hasPassword()) {
      const storage = await browser.storage.local.get([ACTIVE_WALLET])
      if (storage[ACTIVE_WALLET] && this.password) {
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

  hasPassword(): boolean {
    return !!this.password
  }
}
