import { STARRED_CHAINS } from 'config/storage-keys'
import { makeAutoObservable } from 'mobx'
import Browser from 'webextension-polyfill'

export class StarredChainsStore {
  chains: string[] = []

  constructor() {
    makeAutoObservable(this)

    this.initStarredChains()
  }

  async initStarredChains() {
    const storage = await Browser.storage.local.get([STARRED_CHAINS])
    const prevStarredChains = storage[STARRED_CHAINS]

    if (prevStarredChains) {
      this.chains = JSON.parse(prevStarredChains) ?? []
      return
    }

    this.chains = []
  }

  addStarredChain(chain: string) {
    this.chains.push(chain)

    return Browser.storage.local.set({
      [STARRED_CHAINS]: JSON.stringify(this.chains),
    })
  }

  removeStarredChain(chain: string) {
    this.chains = this.chains.filter((f) => f !== chain)

    return Browser.storage.local.set({
      [STARRED_CHAINS]: JSON.stringify(this.chains),
    })
  }
}

export const starredChainsStore = new StarredChainsStore()
