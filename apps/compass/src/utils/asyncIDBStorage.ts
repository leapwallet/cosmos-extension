import { IAsyncStorage } from '@leapwallet/elements-core'
import * as idb from 'idb-keyval'

export const AsyncIDBStorage: IAsyncStorage = {
  getItem: async (key: string): Promise<string | null> => {
    const value = await idb.get(key)
    if (value) {
      return value
    }
    return null
  },
  setItem: async (key: string, value: string): Promise<void> => {
    await idb.set(key, value)
  },
  removeItem: async (key: string): Promise<void> => {
    await idb.del(key)
  },
  clear: async (): Promise<void> => {
    await idb.clear()
  },
}
