import { makeAutoObservable } from 'mobx'

export class HomePageViewStore {
  hasSeen = false

  constructor() {
    makeAutoObservable(this)
  }

  updateSeen(val: boolean) {
    this.hasSeen = val
  }
}

export const homePageViewStore = new HomePageViewStore()
