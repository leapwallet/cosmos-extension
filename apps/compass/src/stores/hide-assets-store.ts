import { HIDE_ASSETS } from 'config/storage-keys'
import { makeAutoObservable } from 'mobx'
import Browser from 'webextension-polyfill'

export class HideAssetsStore {
  isHidden = false

  constructor() {
    makeAutoObservable(this)

    this.initHideAssets()
  }

  initHideAssets = async () => {
    const storage = await Browser.storage.local.get(HIDE_ASSETS)
    this.setHidden(!!storage[HIDE_ASSETS])
  }

  setHidden(val: boolean) {
    this.isHidden = val
    Browser.storage.local.set({ [HIDE_ASSETS]: val })
  }

  formatHideBalance(s: string) {
    return this.isHidden ? '••••••••' : s
  }
}

export const hideAssetsStore = new HideAssetsStore()
