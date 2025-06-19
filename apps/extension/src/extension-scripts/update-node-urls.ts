import { initiateNodeUrls } from '@leapwallet/cosmos-wallet-sdk'

const NMS_UPDATE_INTERVAL = 5 * 60 * 1000
let lastNMSUpdateTimeStamp = 0

/**
 * Updates node urls if last update was more than 5 mins ago.
 * These node urls are used to fetch:
 * - `evmRpcUrl` from nms for EVM methods.
 * - `restUrl` from nms in cosmos sendTx.
 */
export function updateNodeUrls() {
  try {
    if (Date.now() - lastNMSUpdateTimeStamp > NMS_UPDATE_INTERVAL) {
      lastNMSUpdateTimeStamp = Date.now()
      initiateNodeUrls()
    }
  } catch {
    //
  }
}
