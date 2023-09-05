import browser from 'webextension-polyfill'

export function storageMigrationV77(storage: Record<string, any>) {
  if (storage['encrypted'] && storage['timestamp']) {
    browser.storage.local.remove(['encrypted', 'timestamp'])
  }
}
