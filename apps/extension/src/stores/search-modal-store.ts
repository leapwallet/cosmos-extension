import { makeAutoObservable } from 'mobx'

type ActiveOption = {
  active: number
  lowLimit: number
  highLimit: number
}

export class SearchModalStore {
  showModal = false
  activeOption: ActiveOption = { active: 0, lowLimit: 0, highLimit: 0 }
  enteredOption: number | null = null
  showSideNavFromSearchModal = false

  constructor() {
    makeAutoObservable(this)
  }

  setShowModal(showModal: boolean) {
    this.showModal = showModal
  }

  updateActiveOption(activeOption: Partial<ActiveOption>) {
    this.activeOption = {
      ...this.activeOption,
      ...activeOption,
    }
  }

  setEnteredOption(enteredOption: number | null) {
    this.enteredOption = enteredOption
  }

  setShowSideNavFromSearchModal(showSideNavFromSearchModal: boolean) {
    this.showSideNavFromSearchModal = showSideNavFromSearchModal
  }
}

export const searchModalStore = new SearchModalStore()
