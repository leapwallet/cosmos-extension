import { GasOptions } from '@leapwallet/cosmos-wallet-hooks'
import { GasPrice, NativeDenom } from '@leapwallet/cosmos-wallet-sdk'
import { TXN_STATUS } from '@leapwallet/elements-core'
import { CURRENT_SWAP_TXS, PENDING_SWAP_TXS } from 'config/storage-keys'
import { RoutingInfo } from 'pages/swaps-v2/hooks'
import { SourceChain, SourceToken } from 'types/swap'
import Browser from 'webextension-polyfill'

export function generateObjectKey(routingInfo: RoutingInfo) {
  const message = routingInfo?.messages?.[0]
  if (!message) {
    return undefined
  }
  const { customTxHash: txHash, customMessageChainId: msgChainId } = message
  const key = `${msgChainId}-${txHash}`
  return key
}

export type TxStoreObject = {
  routingInfo: RoutingInfo
  state?: TXN_STATUS
  sourceChain: SourceChain | undefined
  sourceToken: SourceToken | null
  destinationChain: SourceChain | undefined
  destinationToken: SourceToken | null
  feeDenom: NativeDenom & {
    ibcDenom?: string | undefined
  }
  gasEstimate: number
  gasOption: GasOptions
  userPreferredGasLimit: number | undefined
  userPreferredGasPrice: GasPrice | undefined
  inAmount: string
  amountOut: string
  feeAmount: string
}

export type TxStoreRecord = Record<string, TxStoreObject>

// Ideally should never be more than one tx
export async function addTxToCurrentTxList(tx: TxStoreObject, override: boolean = true) {
  const storage = await Browser.storage.local.get([CURRENT_SWAP_TXS])
  const previousCurrentTxs = JSON.parse(storage[CURRENT_SWAP_TXS] ?? '{}')
  const { routingInfo } = tx

  const key = generateObjectKey(routingInfo)

  if (!key) {
    return
  }

  if (!override) {
    const isAlreadyPresent = previousCurrentTxs?.[key]

    if (isAlreadyPresent) {
      return
    }
  }

  await Browser.storage.local.set({
    [CURRENT_SWAP_TXS]: JSON.stringify({
      ...previousCurrentTxs,
      [key]: tx,
    }),
  })
}

export async function moveTxsFromCurrentToPending() {
  const storage = await Browser.storage.local.get([CURRENT_SWAP_TXS, PENDING_SWAP_TXS])
  const currentTxs = JSON.parse(storage[CURRENT_SWAP_TXS] ?? '{}') as TxStoreRecord
  const pendingTxs = JSON.parse(storage[PENDING_SWAP_TXS] ?? '{}') as TxStoreRecord

  const currentTxsKeys = Object.keys(currentTxs ?? {})

  if (currentTxsKeys.length === 0) {
    return
  }

  let pendingTxsUpdated = false
  currentTxsKeys.forEach(async (key) => {
    if (
      !!currentTxs[key]?.state &&
      !!pendingTxs[key]?.state &&
      pendingTxs[key]?.state === currentTxs[key]?.state
    ) {
      return
    }
    pendingTxs[key] = currentTxs[key]
    pendingTxsUpdated = true
  })

  if (!pendingTxsUpdated) {
    await Browser.storage.local.set({
      [CURRENT_SWAP_TXS]: JSON.stringify({}),
    })
    return
  }

  await Browser.storage.local.set({
    [PENDING_SWAP_TXS]: JSON.stringify(pendingTxs),
    [CURRENT_SWAP_TXS]: JSON.stringify({}),
  })
}

export async function removeCurrentSwapTxs(txKey: string) {
  const storage = await Browser.storage.local.get([CURRENT_SWAP_TXS])
  const previousCurrentTxs = JSON.parse(storage[CURRENT_SWAP_TXS] ?? '{}') as TxStoreRecord

  if (previousCurrentTxs?.[txKey]) {
    delete previousCurrentTxs[txKey]
    await Browser.storage.local.set({ [CURRENT_SWAP_TXS]: JSON.stringify(previousCurrentTxs) })
  }
}

export async function addTxToPendingTxList(tx: TxStoreObject, override: boolean = true) {
  const storage = await Browser.storage.local.get([PENDING_SWAP_TXS])
  const previousPendingTxs = JSON.parse(storage[PENDING_SWAP_TXS] ?? '{}') as TxStoreRecord
  const { routingInfo } = tx

  const key = generateObjectKey(routingInfo)

  if (!key) {
    return
  }

  if (!override) {
    const isAlreadyPresent = previousPendingTxs?.[key]

    if (isAlreadyPresent) {
      return
    }
  }

  await Browser.storage.local.set({
    [PENDING_SWAP_TXS]: JSON.stringify({
      ...previousPendingTxs,
      [key]: tx,
    }),
  })
}

export async function removePendingSwapTxs(txKey: string) {
  const storage = await Browser.storage.local.get([PENDING_SWAP_TXS])
  const previousPendingTxs = JSON.parse(storage[PENDING_SWAP_TXS] ?? '{}') as TxStoreRecord

  if (previousPendingTxs?.[txKey]) {
    delete previousPendingTxs[txKey]
    await Browser.storage.local.set({ [PENDING_SWAP_TXS]: JSON.stringify(previousPendingTxs) })
  }
}
