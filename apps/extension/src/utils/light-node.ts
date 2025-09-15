/* eslint-disable no-console */
// example of NodeClient showing off starting node and monitoring its syncing status
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { LIGHT_NODE_SYNC_WINDOW_SECS } from 'config/constants'

declare const self: Window &
  typeof globalThis & { lumina: any; luminaClient: any; luminaInPopup: any }

// NodeClient will send messages and expect responses over provided port.
// See background.js and worker.js to see how the commands get to the worker

let initialisationStarted = false

export async function init() {
  if (!self.luminaClient && !initialisationStarted) {
    initialisationStarted = true
    const { NodeClient } = await import('lumina-node-wasm')
    const connection = chrome.runtime.connect()
    connection.onMessage.addListener((message) => {
      console.log('message received', message)
    })
    self.luminaClient = await new NodeClient(connection)
    initialisationStarted = false
  }
}

export async function getIsLightNodeRunning(): Promise<boolean> {
  try {
    const isLightNodeRunning = await self.luminaClient?.isRunning()
    console.log('logging is light node running', isLightNodeRunning)
    return isLightNodeRunning
  } catch (e) {
    console.error('getIsLightNodeRunning error', e)
    return false
  }
}

export async function startLightNode() {
  console.log('starting light node in foreground?')
  const { NodeConfig, Network } = await import('lumina-node-wasm')
  const isLightNodeRunning = await getIsLightNodeRunning()
  if (isLightNodeRunning) {
    console.log('node is already running')
    return
  }
  let networkConfig
  const network: string = 'mainnet'
  if (network === 'mainnet') {
    networkConfig = NodeConfig.default(Network.Mainnet)
  } else if (network === 'arabica') {
    networkConfig = NodeConfig.default(Network.Arabica)
  } else if (network === 'mocha') {
    networkConfig = NodeConfig.default(Network.Mocha)
  } else {
    console.error('unrecognised network ', network)
    return
  }
  console.log('requesting connection to', networkConfig.bootnodes, networkConfig)

  networkConfig.customPruningWindowSecs = LIGHT_NODE_SYNC_WINDOW_SECS
  networkConfig.usePersistentMemory = true

  const started = await self.luminaClient.start(networkConfig)
  await self.luminaClient.waitConnected()
  console.log('started:', started)

  //updateStats()
}

export const getLightNodeEvents = async () => {
  try {
    return await self.luminaClient?.eventsChannel()
  } catch (e) {
    console.error('getLightNodeEvents error', e)
  }
}

export async function stopLightNode() {
  if (await self.luminaClient.isRunning()) {
    await self.luminaClient.stop()
  }
}

export async function updateStats() {
  if (await getIsLightNodeRunning()) {
    await self.luminaClient.waitConnected()

    const peerTrackerInfo = await self.luminaClient.peerTrackerInfo()
    console.log({ peerTrackerInfo })

    setTimeout(updateStats, 5000)
  } else {
    console.log('node is not running')
  }
}

export function getLastSyncedMessage(timestamp: Date) {
  const now = new Date()
  const syncedDate = new Date(timestamp)
  const diffInMs = now.getTime() - syncedDate.getTime()
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInHours < 24) {
    if (diffInHours === 0) {
      return ''
    } else if (diffInHours === 1) {
      return '1hr ago'
    } else {
      return `${diffInHours}hrs ago`
    }
  } else {
    if (diffInDays === 1) {
      return 'yesterday'
    } else {
      return `${diffInDays}d ago`
    }
  }
}
