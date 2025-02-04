import { makeAutoObservable } from 'mobx'

class ImportWatchWalletSeedPopupStore {
  showPopup: boolean = false

  constructor() {
    makeAutoObservable(this)
  }

  setShowPopup(showPopup: boolean) {
    this.showPopup = showPopup
  }
}

export const importWatchWalletSeedPopupStore = new ImportWatchWalletSeedPopupStore()
