import { LIGHT_NODE_SYNC_WINDOW_SECS, LIGHT_NODE_TIME_CAPTURE_INTERVAL } from 'config/constants'
import { IS_LIGHT_NODE_RUNNING, LIGHT_NODE_RUNNING_STATS } from 'config/storage-keys'
import type { NodeClient as INodeClient, NodeWorker as INodeWorker } from 'lumina-node-wasm'
import { Network, NodeConfig } from 'lumina-node-wasm'
import browser from 'webextension-polyfill'

declare const self: Window &
  typeof globalThis & { lumina: any; luminaClient: any; luminaInPopup: any }

export class LightNode {
  luminaWorker?: INodeWorker
  connectChannel: MessageChannel = new MessageChannel()
  luminaClient?: INodeClient
  NodeClient: any

  constructor() {
    import('lumina-node-wasm').then(({ NodeWorker, NodeClient }) => {
      this.run(NodeWorker)
      this.onStartup()
      this.NodeClient = NodeClient
    })
  }

  run(NodeWorker: any) {
    this.luminaWorker = new NodeWorker(this.connectChannel.port1)
    this.luminaWorker?.run()
  }

  async addLuminaClient() {
    if (!this.luminaClient) {
      this.luminaClient = await new this.NodeClient(this.connectChannel.port2)
      self.luminaClient = this.luminaClient
    }
  }
  handleConnect(port: any) {
    // we aren't allowed to transfer the runtime.Port we've received to worker
    // so we patch the connection through using MessageChannel
    const channel = new MessageChannel()
    port.onMessage.addListener((message: any) => {
      // console.debug("forwarding to worker: ", message);
      channel.port1.postMessage(message)
    })
    channel.port1.onmessage = (originalMessage) => {
      // data field isn't considered own property of MessageEvent (but is inherited from Event),
      // so chrome's json clone will ommit this field. Hand craft the message with expected structure as a workaround.
      const message = { data: originalMessage.data }
      // console.debug("forwarding from worker: ", message);
      port.postMessage(message)
    }

    this.luminaClient?.addConnectionToWorker(channel.port2)
  }

  attachListener() {
    browser.runtime.onConnect.addListener(async (port) => {
      if (port.name === 'LeapCosmosExtension') return
      await this.addLuminaClient()
      this.handleConnect(port)
    })
  }

  async startLightNodeBackground() {
    await this.addLuminaClient()
    if (await this.luminaClient?.isRunning()) {
      // eslint-disable-next-line no-console
      console.log('[background.ts]: node is already running')
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
      // eslint-disable-next-line no-console
      console.error('[background.ts]: unrecognised network ', network)
      return
    }
    // eslint-disable-next-line no-console
    console.log('[background.ts]: requesting connection to', networkConfig.bootnodes)

    networkConfig.custom_syncing_window_secs = LIGHT_NODE_SYNC_WINDOW_SECS

    const started = await this.luminaClient?.start(networkConfig)
    // eslint-disable-next-line no-console
    console.log('[background.ts]: started:', started)
  }

  async updateRunningTimeForLightNode() {
    const intervalId = setInterval(() => {
      browser.storage.local
        .get([LIGHT_NODE_RUNNING_STATS, IS_LIGHT_NODE_RUNNING])
        .then((storage) => {
          const isLightNodeRunning = storage[IS_LIGHT_NODE_RUNNING]
          const lightNodeRunningStats = storage[LIGHT_NODE_RUNNING_STATS]
          if (isLightNodeRunning && lightNodeRunningStats) {
            const { startTimestamp: lastStartedAt, totalRunningTimeInMilliSeconds = 0 } =
              JSON.parse(lightNodeRunningStats)
            browser.storage.local.set({
              [LIGHT_NODE_RUNNING_STATS]: JSON.stringify({
                startTimestamp: lastStartedAt,
                totalRunningTimeInMilliSeconds:
                  totalRunningTimeInMilliSeconds + LIGHT_NODE_TIME_CAPTURE_INTERVAL,
              }),
            })
          }
          if (!isLightNodeRunning && intervalId) {
            clearInterval(intervalId)
          }
        })
    }, LIGHT_NODE_TIME_CAPTURE_INTERVAL)
  }

  onStartup() {
    browser.runtime.onStartup.addListener(() => {
      this.addLuminaClient()
      browser.storage.local.get([IS_LIGHT_NODE_RUNNING]).then(async (storage) => {
        const isLightNodeRunning = storage[IS_LIGHT_NODE_RUNNING]
        if (isLightNodeRunning) {
          this.startLightNodeBackground()
          this.updateRunningTimeForLightNode()
        }
      })
    })
  }
}
