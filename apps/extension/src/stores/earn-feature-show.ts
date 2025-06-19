import { EARN_USDN_FEATURE_SHOW } from 'config/storage-keys'
import { makeAutoObservable } from 'mobx'
import Browser from 'webextension-polyfill'

export class EarnFeatureShowStore {
  show = 'false'

  constructor() {
    makeAutoObservable(this)
    this.initEarnFeatureShow()
  }

  private async initEarnFeatureShow() {
    const storage = await Browser.storage.local.get(EARN_USDN_FEATURE_SHOW)

    const val = storage[EARN_USDN_FEATURE_SHOW]
    if (val !== 'false') {
      this.setShow('true')
    }
  }

  setShow(val: string) {
    this.show = val
    Browser.storage.local.set({ [EARN_USDN_FEATURE_SHOW]: val })
  }
}

export const earnFeatureShowStore = new EarnFeatureShowStore()
