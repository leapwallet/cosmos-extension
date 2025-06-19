// eslint-disable-next-line simple-import-sort/imports
import { sleep } from '@leapwallet/cosmos-wallet-sdk'
import {
  LifiTransactionStatus,
  MosaicAPI,
  SKIP_TXN_STATUS,
  SkipAPI,
  TXN_STATUS,
} from '@leapwallet/elements-core'
import { RouteAggregator } from '@leapwallet/elements-hooks'
import { PENDING_SWAP_TXS } from 'config/storage-keys'
import { convertSkipStatusToTxnStatus } from 'pages/swaps-v2/utils'
import { addTxToPendingTxList, TxStoreObject, TxStoreRecord } from 'utils/pendingSwapsTxsStore'
import Browser from 'webextension-polyfill'

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
}): Promise<{
  success: boolean
  response: {
    error?: string | object
    state?: TXN_STATUS
    rawStatus?: LifiTransactionStatus
  }
}> {
  if (aggregator === RouteAggregator.MOSAIC) {
    const res = await MosaicAPI.trackTransaction(tx_hash)
    if (!res.success) {
      return {
        success: false,
        response: {
          error: new Error('Unable to get txn status'),
        },
      }
    }
    return {
      success: true,
      response: {
        state: TXN_STATUS.SUCCESS,
      },
    }
  }
  const result = await SkipAPI.getTxnStatus({
    chain_id,
    tx_hash,
  })

  if (!result.success) {
    return {
      success: false,
      response: {
        error: 'Unable to get txn status',
      },
    }
  }
  const data = result.response
  return {
    success: true,
    response: {
      error: data.error?.message,
      state: convertSkipStatusToTxnStatus(data.state),
    },
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

      const retryCount = 0
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
          if (SKIP_TERMINAL_STATES.includes(state ?? TXN_STATUS.PENDING)) {
            await addTxToPendingTxList(pendingTx)
            break
          }

          if (typeof error === 'object' && 'code' in error && retryCount > 20) {
            throw new Error((error as { code: number; message: string }).message)
          }
        }

        await sleep(2000)
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('track background error', error)
      return 'not-tracked'
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
