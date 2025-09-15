import * as idb from 'idb-keyval'
import browser from 'webextension-polyfill'

export const getStorageAdapter = () => {
  return {
    get: async (key: string, storageType?: string) => {
      if (storageType === 'idb') {
        const value = await idb.get(key)
        if (value) {
          return value
        }
        return null
      }
      const storageObj = await browser.storage.local.get(key)
      if (storageObj[key]) {
        return storageObj[key]
      } else {
        return null
      }
    },
    set: async <T = string>(key: string, value: T, storageType?: string) => {
      if (storageType === 'idb') {
        await idb.set(key, value)
        return
      }
      await browser.storage.local.set({ [key]: value })
    },
    remove: async (key: string, storageType?: string) => {
      if (storageType === 'idb') {
        await idb.del(key)
        return
      }
      await browser.storage.local.remove(key)
    },
  }
}
