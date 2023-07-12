import browser from 'webextension-polyfill'

import { AUTO_LOCK_TIME } from '../../config/storage-keys'

export function storageMigrationV53(storage: Record<string, any>) {
  if (storage[AUTO_LOCK_TIME] && storage[AUTO_LOCK_TIME] === -1) {
    browser.storage.local.set({ [AUTO_LOCK_TIME]: 1440 })
  }
}
