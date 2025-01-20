import { ChainInfo } from '@leapwallet/cosmos-wallet-sdk'
import { makeAutoObservable } from 'mobx'

class DeleteChainStore {
  chainInfo: ChainInfo | null = null

  constructor() {
    makeAutoObservable(this)
  }

  setChainInfo(chainInfo: ChainInfo | null) {
    this.chainInfo = chainInfo
  }
}

export const deleteChainStore = new DeleteChainStore()
