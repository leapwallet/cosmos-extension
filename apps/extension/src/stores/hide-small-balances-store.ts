import { SMALL_BALANCES_HIDDEN } from 'config/storage-keys'
import { makeAutoObservable } from 'mobx'
import Browser from 'webextension-polyfill'

export class HideSmallBalancesStore {
  isHidden = false

  constructor() {
    makeAutoObservable(this)

    this.initHideSmallBalances()
  }

  initHideSmallBalances = async () => {
    const storage = await Browser.storage.local.get(SMALL_BALANCES_HIDDEN)
    const val = storage[SMALL_BALANCES_HIDDEN]
    this.setHidden(val)
  }

  setHidden(val: boolean) {
    this.isHidden = val
    Browser.storage.local.set({ [SMALL_BALANCES_HIDDEN]: val })
  }
}

export const hideSmallBalancesStore = new HideSmallBalancesStore()
