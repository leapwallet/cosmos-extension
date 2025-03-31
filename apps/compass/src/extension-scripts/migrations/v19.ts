import browser from 'webextension-polyfill'

export function storageMigrationV19() {
  browser.storage.local.set({
    ['encrypted']: null,
    ['timestamp']: null,
    ['connections']: {},
  })
}
