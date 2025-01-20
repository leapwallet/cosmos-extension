import { PERCENT_CHANGE_24HR_HIDDEN } from 'config/storage-keys'
import { makeAutoObservable } from 'mobx'
import Browser from 'webextension-polyfill'

export class HidePercentChangeStore {
  isHidden = false

  constructor() {
    makeAutoObservable(this)

    this.initHidePercentChange()
  }

  private async initHidePercentChange() {
    const storage = await Browser.storage.local.get(PERCENT_CHANGE_24HR_HIDDEN)
    const val = storage[PERCENT_CHANGE_24HR_HIDDEN]
    this.setHidden(!!val)
  }

  setHidden(val: boolean) {
    this.isHidden = val
    Browser.storage.local.set({ [PERCENT_CHANGE_24HR_HIDDEN]: val })
  }
}

export const hidePercentChangeStore = new HidePercentChangeStore()
