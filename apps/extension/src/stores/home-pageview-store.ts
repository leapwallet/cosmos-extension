import { makeAutoObservable } from 'mobx'

export class OneTimePageViewStore {
  hasSeenHome = false
  hasSeenChadExclusives = false

  constructor() {
    makeAutoObservable(this)
  }

  updateSeenHome(val: boolean) {
    this.hasSeenHome = val
  }

  updateSeenChadExclusives(val: boolean) {
    this.hasSeenChadExclusives = val
  }
}

export const oneTimePageViewStore = new OneTimePageViewStore()
