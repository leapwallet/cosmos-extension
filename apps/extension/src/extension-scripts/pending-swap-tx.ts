// eslint-disable-next-line simple-import-sort/imports
import { SKIP_TXN_STATUS } from '@leapwallet/elements-core'
import { originalFetch } from './fetch-preserver'
import { sleep } from '@leapwallet/cosmos-wallet-sdk'
import { PENDING_SWAP_TXS } from 'config/storage-keys'
import Browser from 'webextension-polyfill'
import { addTxToPendingTxList } from 'utils/pendingSwapsTxsStore'

const pendingTxTrackPromises: Record<string, Promise<'not-tracked' | 'resolved'> | undefined> = {}

const SKIP_TERMINAL_STATES = [
  SKIP_TXN_STATUS.STATE_COMPLETED_SUCCESS,
  SKIP_TXN_STATUS.STATE_COMPLETED_ERROR,
  SKIP_TXN_STATUS.STATE_ABANDONED,
]

async function getTxnStatus(args: { tx_hash: string; chain_id: string }) {
  const result = await originalFetch(
    `https://api.skip.money/v1/tx/status?tx_hash=${args.tx_hash}&chain_id=${args.chain_id}`,
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
  const pendingSwapTxs: any = JSON.parse(storage[PENDING_SWAP_TXS]) ?? {}
  return !!pendingSwapTxs[key]
}

export async function trackPendingSwapTx(key: string, pendingTx: any) {
  const { route } = pendingTx

  for (let messageIndex = 0; messageIndex < (route?.messages?.length ?? 0); messageIndex++) {
    const message = route.messages[messageIndex]
    const { customTxHash: txHash, customMessageChainId: msgChainId } = message

    try {
      if (SKIP_TERMINAL_STATES.includes(pendingTx?.state)) {
        continue
      }

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const isStillPending = await isTransactionStillPending(key)
        if (!isStillPending) {
          return 'not-tracked'
        }
        const txnStatus = await getTxnStatus({
          chain_id: msgChainId,
          tx_hash: txHash,
        })

        if (txnStatus.success) {
          const { state, error } = txnStatus.response
          pendingTx.state = state
          if (SKIP_TERMINAL_STATES.includes(state)) {
            await addTxToPendingTxList(pendingTx)
            break
          }

          if (error?.code) {
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
    const pendingSwapTxs: any = JSON.parse(storage[PENDING_SWAP_TXS]) ?? {}

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
