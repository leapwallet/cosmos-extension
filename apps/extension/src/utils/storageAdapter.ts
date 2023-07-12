import browser from 'webextension-polyfill'

export const getStorageAdapter = () => {
  return {
    get: async (key: string) => {
      const storageObj = await browser.storage.local.get(key)
      if (storageObj[key]) {
        return storageObj[key]
      } else {
        return null
      }
    },
    set: async <T = string>(key: string, value: T) => {
      await browser.storage.local.set({ [key]: value })
    },
    remove: async (key: string) => {
      await browser.storage.local.remove(key)
    },
  }
}
