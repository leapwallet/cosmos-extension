import { EARN_USDN_BANNER_SHOW } from 'config/storage-keys'
import { makeAutoObservable } from 'mobx'
import Browser from 'webextension-polyfill'

export class EarnBannerShowStore {
  show = 'false'

  constructor() {
    makeAutoObservable(this)
    this.initEarnBannerShow()
  }

  private async initEarnBannerShow() {
    const storage = await Browser.storage.local.get(EARN_USDN_BANNER_SHOW)

    const val = storage[EARN_USDN_BANNER_SHOW]
    if (val !== 'false') {
      this.setShow('true')
    }
  }

  setShow(val: string) {
    this.show = val
    Browser.storage.local.set({ [EARN_USDN_BANNER_SHOW]: val })
  }
}

export const earnBannerShowStore = new EarnBannerShowStore()
