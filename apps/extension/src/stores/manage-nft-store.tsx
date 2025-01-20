import { makeAutoObservable } from 'mobx'
import Browser from 'webextension-polyfill'

import { FAVOURITE_NFTS, HIDDEN_NFTS } from '../config/storage-keys'

export class FavNftStore {
  favNfts: string[] = []

  constructor() {
    makeAutoObservable(this)
  }

  setFavNfts(favNfts: string[]) {
    this.favNfts = favNfts
  }

  async initFavNfts(walletId: string) {
    const storage = await Browser.storage.local.get([FAVOURITE_NFTS])
    if (storage[FAVOURITE_NFTS]) {
      const favNfts = JSON.parse(storage[FAVOURITE_NFTS])
      this.favNfts = favNfts[walletId ?? ''] ?? []
      return
    }

    this.favNfts = []
  }

  async addFavNFT(nft: string, walletId: string) {
    this.favNfts.push(nft)

    const storage = await Browser.storage.local.get([FAVOURITE_NFTS])
    await Browser.storage.local.set({
      [FAVOURITE_NFTS]: JSON.stringify({
        ...JSON.parse(storage[FAVOURITE_NFTS] ?? '{}'),
        [walletId ?? '']: this.favNfts,
      }),
    })
  }

  async removeFavNFT(nft: string, walletId: string) {
    this.favNfts = this.favNfts.filter((f) => f !== nft)

    const storage = await Browser.storage.local.get([FAVOURITE_NFTS])
    await Browser.storage.local.set({
      [FAVOURITE_NFTS]: JSON.stringify({
        ...JSON.parse(storage[FAVOURITE_NFTS] ?? '{}'),
        [walletId ?? '']: this.favNfts,
      }),
    })
  }
}

export const favNftStore = new FavNftStore()

export class HiddenNftStore {
  hiddenNfts: string[] = []

  constructor() {
    makeAutoObservable(this)
  }

  setHiddenNfts(hiddenNfts: string[]) {
    this.hiddenNfts = hiddenNfts
  }

  async initHiddenNfts(walletId: string) {
    const storage = await Browser.storage.local.get([HIDDEN_NFTS])
    if (storage[HIDDEN_NFTS]) {
      const hiddenNfts = JSON.parse(storage[HIDDEN_NFTS])
      this.hiddenNfts = hiddenNfts[walletId ?? ''] ?? []
      return
    }

    this.hiddenNfts = []
  }

  async addHiddenNFT(nft: string, walletId: string) {
    this.hiddenNfts.push(nft)

    const storage = await Browser.storage.local.get([HIDDEN_NFTS])
    await Browser.storage.local.set({
      [HIDDEN_NFTS]: JSON.stringify({
        ...JSON.parse(storage[HIDDEN_NFTS] ?? '{}'),
        [walletId ?? '']: this.hiddenNfts,
      }),
    })
  }

  async removeHiddenNFT(nft: string, walletId: string) {
    this.hiddenNfts = this.hiddenNfts.filter((f) => f !== nft)

    const storage = await Browser.storage.local.get([HIDDEN_NFTS])
    await Browser.storage.local.set({
      [HIDDEN_NFTS]: JSON.stringify({
        ...JSON.parse(storage[HIDDEN_NFTS] ?? '{}'),
        [walletId ?? '']: this.hiddenNfts,
      }),
    })
  }
}

export const hiddenNftStore = new HiddenNftStore()
