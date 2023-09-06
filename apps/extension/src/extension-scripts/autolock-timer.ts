import dayjs from 'dayjs'
import browser from 'webextension-polyfill'

import { ACTIVE_WALLET, AUTO_LOCK_TIME } from '../config/storage-keys'
import { PasswordManager } from './password-manager'

let lastPopupPing = Date.now()

const DEFAULT_AUTOLOCK_TIME = 1440
const WORKER_RESET_MESSAGE = 'WORKER_RESET_MESSAGE'

browser.runtime.onMessage.addListener((message, sender) => {
  if (sender.id !== browser.runtime.id) return

  if (message.type === 'popup-ping') {
    lastPopupPing = message.data.timestamp
  }
  if (message.name === WORKER_RESET_MESSAGE) {
    //
  }
})

async function checkAutoLock(passwordManager: PasswordManager) {
  const storage = await browser.storage.local.get([ACTIVE_WALLET, AUTO_LOCK_TIME])

  if (!storage[ACTIVE_WALLET]) return

  const { autoLockTime } = storage

  if (autoLockTime < 1) {
    await browser.storage.local.set({ [AUTO_LOCK_TIME]: DEFAULT_AUTOLOCK_TIME })
    return
  }

  const startOfMinute = dayjs().startOf('minute')

  const lat = dayjs(lastPopupPing).add(autoLockTime ?? DEFAULT_AUTOLOCK_TIME, 'minutes')

  if (startOfMinute.isAfter(lat)) {
    passwordManager.clearPassword()
    browser.runtime.sendMessage({ type: 'auto-lock' })
  }
}

export function startAutoLockTimer(passwordManager: PasswordManager) {
  setInterval(async () => {
    await checkAutoLock(passwordManager)
  }, 1000)
}
