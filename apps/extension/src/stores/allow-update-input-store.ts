import { makeObservable, runInAction } from 'mobx'

export const MAX_UPDATE_COUNT = 0

export class AllowUpdateInputStore {
  updateInput = false
  updateCount = 0
  maxUpdateCount = MAX_UPDATE_COUNT

  constructor() {
    makeObservable(this)
  }

  setMaxUpdateCount(maxUpdateCount: number) {
    this.maxUpdateCount = maxUpdateCount
  }

  incrementUpdateCount() {
    runInAction(() => {
      this.updateCount++
    })
  }

  updateAllowed() {
    return this.updateInput
  }

  /**
   * To avoid infinite loop, we terminate the loop after 5 updates max.
   * This means, if user clicks on max, we allow upto atleast 5 updates post that actions,
   * So if they switch chains or change anything other than input which can trigger fee update,
   * Then we allow upto 5 such actions.
   */
  shouldTerminate() {
    return this.updateCount > this.maxUpdateCount
  }

  disableUpdateInput() {
    runInAction(() => {
      this.updateInput = false
      this.updateCount = 0
    })
  }

  /**
   * This should be used for any action that can trigger fee update.
   */
  resetUpdateCount() {
    runInAction(() => {
      this.updateCount = 0
    })
  }

  /**
   * This should be used only when user clicks on max button.
   * For any other action, use resetUpdateCount()
   */
  allowUpdateInput() {
    runInAction(() => {
      this.updateInput = true
      this.updateCount = 0
    })
  }
}

export const allowUpdateInputStore = new AllowUpdateInputStore()
