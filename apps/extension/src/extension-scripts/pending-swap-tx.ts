// eslint-disable-next-line simple-import-sort/imports
import { SKIP_TXN_STATUS } from '@leapwallet/elements-core'
import { originalFetch } from './fetch-preserver'
import { sleep } from '@leapwallet/cosmos-wallet-sdk'
import { PENDING_SWAP_TXS } from 'config/storage-keys'
import { updatePendingSwapTxs } from 'utils/updatePendingSwapTxs'
import Browser from 'webextension-polyfill'

async function getTxnStatus(args: { tx_hash: string; chain_id: string }) {
  const result = await originalFetch(
    `https://api.skip.money/v1/tx/status?tx_hash=${args.tx_hash}&chain_id=${args.chain_id}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
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

export async function trackPendingSwapTx() {
  const storage = await Browser.storage.local.get([PENDING_SWAP_TXS])

  if (storage[PENDING_SWAP_TXS]) {
    const pendingSwapTxs = JSON.parse(storage[PENDING_SWAP_TXS])

    for (const pendingTx of pendingSwapTxs) {
      const { route } = pendingTx

      for (let messageIndex = 0; messageIndex < (route?.messages?.length ?? 0); messageIndex++) {
        const message = route.messages[messageIndex]
        const { customTxHash: txHash, customMessageChainId: msgChainId } = message

        try {
          // eslint-disable-next-line no-constant-condition
          while (true) {
            const txnStatus = await getTxnStatus({
              chain_id: msgChainId,
              tx_hash: txHash,
            })

            if (txnStatus.success) {
              const { state, error } = txnStatus.response

              if (state === SKIP_TXN_STATUS.STATE_COMPLETED_SUCCESS) {
                await updatePendingSwapTxs(route)
                break
              } else if (state === SKIP_TXN_STATUS.STATE_ABANDONED) {
                throw new Error('Transaction abandoned')
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
    }
  }
}

export function listenPendingSwapTx() {
  Browser.storage.onChanged.addListener((storage) => {
    if (storage[PENDING_SWAP_TXS]) {
      trackPendingSwapTx()
    }
  })
}
