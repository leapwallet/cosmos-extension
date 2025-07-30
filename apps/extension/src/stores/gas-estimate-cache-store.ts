import { GAS_ESTIMATE_CACHE } from 'config/storage-keys'
import { makeAutoObservable, runInAction } from 'mobx'
import Browser from 'webextension-polyfill'

export class GasEstimateCacheStore {
  gasEstimateCache: Record<string, number> = {}
  readyPromise: Promise<void>

  constructor() {
    makeAutoObservable(this)
    this.readyPromise = this.initGasEstimateCache()
  }

  private async initGasEstimateCache() {
    try {
      const storage = await Browser.storage.local.get(GAS_ESTIMATE_CACHE)
      const val = storage[GAS_ESTIMATE_CACHE]
      runInAction(() => {
        this.gasEstimateCache = val
      })
    } catch (error) {
      //
    }
  }

  // feeDenom must be ibcDenom || coinMinimalDenom
  async updateGasEstimate(chainId: string, txType: string, feeDenom: string, gasEstimate: number) {
    try {
      await this.readyPromise
      const key = this.getKey(chainId, txType, feeDenom)
      runInAction(() => {
        this.gasEstimateCache[key] = gasEstimate
      })
      Browser.storage.local.set({ [GAS_ESTIMATE_CACHE]: this.gasEstimateCache })
    } catch (error) {
      //
    }
  }

  getKey(chainId: string, txType: string, feeDenom: string) {
    return `gas-estimate-${chainId}-${txType}-${feeDenom}`
  }
}

export const gasEstimateCacheStore = new GasEstimateCacheStore()
