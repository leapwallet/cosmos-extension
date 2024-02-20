import { PENDING_SWAP_TXS } from 'config/storage-keys'
import Browser from 'webextension-polyfill'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updatePendingSwapTxs(route: any) {
  const storage = await Browser.storage.local.get([PENDING_SWAP_TXS])
  const previousPendingTxs = JSON.parse(storage[PENDING_SWAP_TXS] ?? '[]')

  if (previousPendingTxs.length > 0) {
    const filteredList = previousPendingTxs.filter(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (txs: any) => {
        return JSON.stringify(txs.route) !== JSON.stringify(route)
      },
    )

    await Browser.storage.local.set({ [PENDING_SWAP_TXS]: JSON.stringify(filteredList) })
  }
}
