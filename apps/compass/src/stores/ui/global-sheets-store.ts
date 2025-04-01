import { makeAutoObservable, runInAction } from 'mobx'
import browser from 'webextension-polyfill'

export class GlobalSheetsStore {
  isSideNavOpen: boolean = false
  isCopyAddressSheetOpen: boolean = false
  importWatchWalletSeedPopupOpen: boolean = false

  constructor() {
    makeAutoObservable(this)
  }

  setSideNavOpen(open: boolean) {
    runInAction(() => {
      this.isSideNavOpen = open
    })
  }

  setCopyAddressSheetOpen(open: boolean) {
    runInAction(() => {
      this.isCopyAddressSheetOpen = open
    })
  }

  setImportWatchWalletSeedPopupOpen(open: boolean) {
    runInAction(() => {
      this.importWatchWalletSeedPopupOpen = open
    })
  }

  toggleSideNav() {
    runInAction(() => {
      this.isSideNavOpen = !this.isSideNavOpen
    })
  }

  expandView() {
    const views = browser.extension.getViews({ type: 'popup' })

    if (views.length === 0) {
      this.toggleSideNav()
      return
    }

    window.open(browser.runtime.getURL('index.html'))
  }
}

export const globalSheetsStore = new GlobalSheetsStore()
