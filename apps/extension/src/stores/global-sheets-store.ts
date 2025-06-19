import { makeAutoObservable, runInAction } from 'mobx'

export type SideNavDefaults = {
  openLightNodePage?: boolean
  openTokenDisplayPage?: boolean
}

export class GlobalSheetsStore {
  isSideNavOpen: boolean = false
  sideNavDefaults: SideNavDefaults = {}

  isChainSelectorOpen: boolean = false

  constructor() {
    makeAutoObservable(this)
  }

  setSideNavOpen(open: boolean) {
    runInAction(() => {
      this.isSideNavOpen = open
    })
  }

  toggleSideNav(sideNavDefaults?: SideNavDefaults) {
    runInAction(() => {
      this.isSideNavOpen = !this.isSideNavOpen
      this.sideNavDefaults = sideNavDefaults ?? {}
    })
  }

  toggleChainSelector() {
    runInAction(() => {
      this.isChainSelectorOpen = !this.isChainSelectorOpen
    })
  }
}

export const globalSheetsStore = new GlobalSheetsStore()
