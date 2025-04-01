import { READ_ITEMS_ALPHA_OPPORTUNITIES } from 'config/storage-keys'
import { makeAutoObservable } from 'mobx'

import { getStorageAdapter } from '../utils/storageAdapter'

const storageAdapter = getStorageAdapter()
export class UnreadAlphaStore {
  readItems: Set<string> = new Set()
  isLoaded = false

  constructor() {
    makeAutoObservable(this)
    this.init()
  }

  private async init() {
    try {
      const storedItems = await storageAdapter.get(READ_ITEMS_ALPHA_OPPORTUNITIES)
      if (storedItems) {
        this.setReadItems(new Set(storedItems))
      }
    } catch (error) {
      // silent handling
    } finally {
      this.setLoaded(true)
    }
  }

  setReadItems(items: Set<string>) {
    this.readItems = items
  }

  setLoaded(loaded: boolean) {
    this.isLoaded = loaded
  }

  markAsRead(itemIds: string[]) {
    if (!itemIds.length) return

    const newSet = new Set(this.readItems)
    let changed = false

    itemIds.forEach((id) => {
      if (!newSet.has(id)) {
        newSet.add(id)
        changed = true
      }
    })

    if (changed) {
      this.setReadItems(newSet)
      this.saveToStorage()
    }
  }

  getUnreadCount(allItemIds: string[]) {
    return allItemIds.filter((id) => !this.readItems.has(id)).length
  }

  isRead(itemId: string) {
    return this.readItems.has(itemId)
  }

  private async saveToStorage() {
    try {
      await storageAdapter.set(READ_ITEMS_ALPHA_OPPORTUNITIES, [...this.readItems])
    } catch (error) {
      // silent handling
    }
  }
}

export const unreadAlphaStore = new UnreadAlphaStore()
