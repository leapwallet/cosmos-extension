// eslint-disable-next-line simple-import-sort/imports
import { LifiTrackerResponse, SKIP_TXN_STATUS, TXN_STATUS } from '@leapwallet/elements-core'
import { originalFetch } from './fetch-preserver'
import { sleep } from '@leapwallet/cosmos-wallet-sdk'
import { PENDING_SWAP_TXS } from 'config/storage-keys'
import Browser from 'webextension-polyfill'
import { addTxToPendingTxList, TxStoreObject, TxStoreRecord } from 'utils/pendingSwapsTxsStore'
import { RouteAggregator } from '@leapwallet/elements-hooks'
import {
  convertLifiErrorToDisplayError,
  convertLifiStatusToTxnStatus,
} from 'pages/swaps-v2/utils/lifiTracking'

const pendingTxTrackPromises: Record<string, Promise<'not-tracked' | 'resolved'> | undefined> = {}

const SKIP_TERMINAL_STATES = [
  SKIP_TXN_STATUS.STATE_COMPLETED_SUCCESS,
  SKIP_TXN_STATUS.STATE_COMPLETED_ERROR,
  SKIP_TXN_STATUS.STATE_ABANDONED,
  TXN_STATUS.FAILED,
  TXN_STATUS.SUCCESS,
]

async function getTxnStatus({
  tx_hash,
  chain_id,
  aggregator,
}: {
  tx_hash: string
  chain_id: string
  aggregator: RouteAggregator
}) {
  if (aggregator === RouteAggregator.LIFI) {
    const result = await originalFetch(`https://li.quest/v1/status?txHash=${tx_hash}`, {
      method: 'GET',
    })

    if (!result.ok) {
      return {
        success: false,
        error: 'Unable to get txn status',
      }
    }
    const data: LifiTrackerResponse = await result.json()
    return {
      success: true,
      response: data
        ? {
            state: convertLifiStatusToTxnStatus(data.status, data.substatus),
            error: convertLifiErrorToDisplayError(
              data.status,
              data.substatus,
              data.substatusMessage,
            ),
            rawStatus: data.status,
          }
        : {
            state: TXN_STATUS.PENDING,
            error: 'Unable to get txn status',
          },
    }
  }
  const result = await originalFetch(
    `https://api.skip.money/v1/tx/status?tx_hash=${tx_hash}&chain_id=${chain_id}`,
    {
      method: 'GET',
    },
  )

  if (!result.ok) {
    return {
      success: false,
      error: 'Unable to get txn status',
    }
  }
  const data = await result.json()
  return {
    success: true,
    response: data,
  }
}

export async function isTransactionStillPending(key: string): Promise<boolean> {
  const storage = await Browser.storage.local.get([PENDING_SWAP_TXS])
  const pendingSwapTxs: TxStoreRecord = JSON.parse(storage[PENDING_SWAP_TXS] ?? '{}')
  return !!pendingSwapTxs[key]
}

export async function trackPendingSwapTx(key: string, pendingTx: TxStoreObject) {
  const { routingInfo } = pendingTx

  for (let messageIndex = 0; messageIndex < (routingInfo?.messages?.length ?? 0); messageIndex++) {
    if (!routingInfo?.messages) {
      // TODO: handle this case
      return 'not-tracked'
    }

    const message = routingInfo.messages[messageIndex]
    const { customTxHash: txHash, customMessageChainId: msgChainId } = message

    if (!txHash || !msgChainId) {
      // TODO: handle this case
      return 'not-tracked'
    }

    try {
      if (SKIP_TERMINAL_STATES.includes(pendingTx?.state ?? TXN_STATUS.PENDING)) {
        continue
      }

      let retryCount = 0
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const isStillPending = await isTransactionStillPending(key)
        if (!isStillPending) {
          return 'not-tracked'
        }
        const txnStatus = await getTxnStatus({
          aggregator: pendingTx.routingInfo?.aggregator,
          chain_id: msgChainId,
          tx_hash: txHash,
        })

        if (txnStatus.success) {
          const { state, error } = txnStatus.response
          pendingTx.state = state
          const isFailedLifiTxn =
            pendingTx.routingInfo?.aggregator === RouteAggregator.LIFI &&
            state === TXN_STATUS.FAILED
          if (SKIP_TERMINAL_STATES.includes(state)) {
            if (!isFailedLifiTxn || retryCount > 20) {
              await addTxToPendingTxList(pendingTx)
              break
            }
          }

          if (isFailedLifiTxn) {
            await sleep(3000)
            retryCount += 1
          }
          if (error?.code && retryCount > 20) {
            throw new Error(error.message)
          }
        }

        await sleep(2000)
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('track background error', error)
    }
  }
  return 'resolved'
}

export async function initiatePendingSwapTxTracking() {
  const storage = await Browser.storage.local.get([PENDING_SWAP_TXS])

  if (storage[PENDING_SWAP_TXS]) {
    const pendingSwapTxs = JSON.parse(storage[PENDING_SWAP_TXS] ?? '{}') as TxStoreRecord

    Object.keys(pendingSwapTxs).map(async (pendingTxKey) => {
      if (pendingTxTrackPromises[pendingTxKey]) {
        const res = await pendingTxTrackPromises[pendingTxKey]
        if (res === 'resolved') {
          return
        }
      }
      const pendingSwapTx = pendingSwapTxs[pendingTxKey]
      pendingTxTrackPromises[pendingTxKey] = trackPendingSwapTx(pendingTxKey, pendingSwapTx)
    })
  }
}

function onStorageChange() {
  initiatePendingSwapTxTracking()
}

export function listenPendingSwapTx() {
  Browser.storage.onChanged.removeListener(onStorageChange)
  Browser.storage.onChanged.addListener(onStorageChange)
}
