import { LeapWalletApi } from '@leapwallet/cosmos-wallet-hooks'
import { LIGHT_NODE_SYNC_WINDOW_SECS, LIGHT_NODE_TIME_CAPTURE_INTERVAL } from 'config/constants'
import {
  CLIENT_ID,
  IS_LIGHT_NODE_RUNNING,
  LIGHT_NODE_LAST_SYNCED_DATA,
  LIGHT_NODE_RUNNING_STATS,
  PRIMARY_WALLET_ADDRESS,
} from 'config/storage-keys'
import { makeAutoObservable, runInAction } from 'mobx'
import {
  getIsLightNodeRunning,
  getLightNodeEvents,
  init,
  startLightNode,
  stopLightNode,
} from 'utils/light-node'
import browser from 'webextension-polyfill'

import { LightNodeBlockTimeStore } from './light-node-block-time-store'

type Range = {
  start: number
  end: number
}[]

declare const self: Window &
  typeof globalThis & { lumina: any; luminaClient: any; luminaInPopup: any }

export class LightNodeStore {
  isLightNodeRunning = false
  latestHeader: string | null = null
  syncedPercentage = 0
  visualData = {}
  nodeStartError: string | null = null
  nodeStopError: string | null = null
  lastSyncedInfo = {
    lastSyncedHeader: null as string | null,
    syncedPercentage: 0,
    timeStamp: null as Date | null,
  }
  lightNodeStats = {
    startTimestamp: null as string | null,
    totalRunningTimeInMilliSeconds: 0,
  }
  blockTimeStore: LightNodeBlockTimeStore
  private networkHeight: number | undefined

  private events: any | undefined

  constructor(blockTimeStore: LightNodeBlockTimeStore) {
    makeAutoObservable(this)

    this.blockTimeStore = blockTimeStore
    this.blockTimeStore.getData() // load data in cache
  }

  get approxHeadersToSync() {
    return LIGHT_NODE_SYNC_WINDOW_SECS / this.blockTimeStore.averageBlockTime
  }

  get blockTime() {
    return this.blockTimeStore.averageBlockTime
  }

  get isSubscribedToEvents() {
    return !!this.events
  }

  private normalizeStoredRanges(networkHead: string, storedRanges: Range) {
    const syncingWindowTail = Number(networkHead) - this.approxHeadersToSync
    return storedRanges.map((range) => ({
      start: Math.max(Number(range.start), syncingWindowTail),
      end: Math.max(Number(range.end), syncingWindowTail),
    }))
  }

  private calculateSyncingPercentage(normalizedRanges: Range) {
    return (
      (normalizedRanges.reduce((acc, range) => acc + (range.end - range.start), 0) * 100) /
      this.approxHeadersToSync
    )
  }

  async setLightNodeRunning(val: boolean) {
    this.isLightNodeRunning = val
    return browser.storage.local.set({ [IS_LIGHT_NODE_RUNNING]: val })
  }

  setLastSyncedInfo(
    lastSyncedHeader: string | null,
    timeStamp: Date | null,
    syncedPercentage: number,
  ) {
    const lastSyncedInfo = {
      lastSyncedHeader,
      timeStamp,
      syncedPercentage,
    }

    this.lastSyncedInfo = lastSyncedInfo
    return browser.storage.local.set({
      [LIGHT_NODE_LAST_SYNCED_DATA]: JSON.stringify(lastSyncedInfo),
    })
  }

  setLightNodeStats(timestamp: string | null, totalTime = 0) {
    const stats = {
      startTimestamp: timestamp,
      totalRunningTimeInMilliSeconds: totalTime,
    }

    this.lightNodeStats = stats
    return browser.storage.local.set({ [LIGHT_NODE_RUNNING_STATS]: JSON.stringify(stats) })
  }

  async onAddedHeaders() {
    const info = await self.luminaClient.syncerInfo()
    const storedRanges = this.normalizeStoredRanges(info.subjective_head, info.stored_headers)
    const syncedPercentage = this.calculateSyncingPercentage(storedRanges)

    this.syncedPercentage = syncedPercentage
    this.latestHeader = storedRanges[0].end.toString()
  }

  async onNodeEvent(event: MessageEvent) {
    if (!event.data) return

    const event_data = event.data.get('event')

    switch (event_data.type) {
      case 'sampling_started':
        if (this.networkHeight && event_data.height >= this.networkHeight) {
          runInAction(() => {
            this.visualData = event_data
          })
        }
        break

      case 'fetching_head_header_finished':
      case 'added_header_from_header_sub':
        this.networkHeight = event_data.height
        await this.onAddedHeaders()
        break

      case 'fetching_headers_finished':
        if (this.networkHeight && event_data.to_height > this.networkHeight) {
          this.networkHeight = event_data.to_height
        }
        await this.onAddedHeaders()
        break
    }
  }

  async subscribeToEvents() {
    this.events = await getLightNodeEvents()

    if (!this.events) {
      await init()
      this.events = (await getLightNodeEvents()) as MessageEvent
    }

    this.events.onmessage = (event: MessageEvent) => this.onNodeEvent(event)
  }

  async startNode(primaryWalletAddress: string, clientId?: string) {
    try {
      await init()
      await startLightNode()
      const startTimestamp = new Date().toISOString()
      const storage = await browser.storage.local.get([LIGHT_NODE_RUNNING_STATS])
      if (!storage[LIGHT_NODE_RUNNING_STATS] && clientId) {
        await LeapWalletApi.logLightNodeStats({
          userUUID: clientId,
          totalRunningTimeInMilliSeconds: 0,
          lastStartedAt: startTimestamp,
          walletAddress: primaryWalletAddress,
        })
      }
      await this.setLightNodeStats(startTimestamp)
      await this.subscribeToEvents()
    } catch (err: unknown) {
      this.nodeStartError = (err as Error).message ?? 'Unknown error'
    }
  }

  async stopNode(primaryWalletAddress: string, clientId?: string) {
    try {
      if (this.latestHeader) {
        this.setLastSyncedInfo(this.latestHeader, new Date(), this.syncedPercentage)
      }

      await stopLightNode()

      const storage = await browser.storage.local.get([LIGHT_NODE_RUNNING_STATS])
      const { startTimestamp, totalRunningTimeInMilliSeconds = 0 } = JSON.parse(
        storage[LIGHT_NODE_RUNNING_STATS] || '{}',
      )
      const timeElapsed = Date.now() - new Date(startTimestamp || '').getTime()
      const totalRunningTime =
        timeElapsed < LIGHT_NODE_TIME_CAPTURE_INTERVAL
          ? timeElapsed
          : totalRunningTimeInMilliSeconds

      if (clientId) {
        try {
          await LeapWalletApi.logLightNodeStats({
            userUUID: clientId,
            totalRunningTimeInMilliSeconds: totalRunningTime,
            lastStartedAt: startTimestamp,
            lastStoppedAt: new Date().toISOString(),
            walletAddress: primaryWalletAddress,
          })
          this.setLightNodeStats(null)
        } catch (e: unknown) {
          this.setLightNodeStats(null, totalRunningTimeInMilliSeconds) // remove the start timestamp
        }
      }
    } catch (err: unknown) {
      runInAction(() => {
        this.nodeStopError = (err as Error).message ?? 'Unknown error'
      })
    }
  }

  resetErrorState() {
    runInAction(() => {
      this.nodeStartError = null
      this.nodeStopError = null
    })
  }

  async clearIndexedDB() {
    const databases = await indexedDB.databases()
    databases.forEach((element) => {
      if (element.name?.includes('celestia')) {
        indexedDB.deleteDatabase(element.name)
      }
    })
  }

  async clearLastSyncedInfo() {
    await this.setLastSyncedInfo(null, null, 0)
    browser.storage.local.remove(LIGHT_NODE_LAST_SYNCED_DATA)
    await this.clearIndexedDB()
  }

  async initLightNode() {
    const storage = await browser.storage.local.get([
      IS_LIGHT_NODE_RUNNING,
      LIGHT_NODE_LAST_SYNCED_DATA,
      LIGHT_NODE_RUNNING_STATS,
      CLIENT_ID,
      PRIMARY_WALLET_ADDRESS,
    ])

    const isRunning = storage[IS_LIGHT_NODE_RUNNING]
    const lastSyncedData = storage[LIGHT_NODE_LAST_SYNCED_DATA]
    const runningStats = storage[LIGHT_NODE_RUNNING_STATS]

    await this.setLightNodeRunning(isRunning)
    const isLuminaClientRunningLightNode = await getIsLightNodeRunning()

    if (isRunning && !isLuminaClientRunningLightNode) {
      await init()
      await startLightNode()

      browser.runtime.sendMessage({
        type: 'capture-light-node-stats',
        payload: {},
      })
    }

    if (lastSyncedData) {
      const { lastSyncedHeader, timeStamp, syncedPercentage } = JSON.parse(lastSyncedData)
      this.lastSyncedInfo = { lastSyncedHeader, timeStamp, syncedPercentage }
    }

    if (runningStats) {
      const { startTimestamp, totalRunningTimeInMilliSeconds = 0 } = JSON.parse(runningStats)
      if (totalRunningTimeInMilliSeconds > 5 * 60 * 1000) {
        const clientId = storage[CLIENT_ID]
        const primaryWalletAddress = storage[PRIMARY_WALLET_ADDRESS]
        await LeapWalletApi.logLightNodeStats({
          userUUID: clientId,
          walletAddress: primaryWalletAddress,
          totalRunningTimeInMilliSeconds,
          lastStartedAt: startTimestamp,
        })
        await this.setLightNodeStats(startTimestamp)
      } else {
        await this.setLightNodeStats(startTimestamp, totalRunningTimeInMilliSeconds)
      }
    }
  }
}

const lightNodeBlockTimeStore = new LightNodeBlockTimeStore()
export const lightNodeStore = new LightNodeStore(lightNodeBlockTimeStore)
