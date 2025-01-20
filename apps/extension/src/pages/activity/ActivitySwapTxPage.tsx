import { TxPage } from 'pages/swaps-v2/components'
import React, { useEffect, useMemo } from 'react'
import { rootCW20DenomsStore, rootDenomsStore } from 'stores/denoms-store-instance'
import { generateObjectKey, removePendingSwapTxs, TxStoreObject } from 'utils/pendingSwapsTxsStore'

export function ActivitySwapTxPage({
  onClose,
  ...rest
}: {
  onClose: (
    sourceChain?: string,
    sourceToken?: string,
    destinationChain?: string,
    destinationToken?: string,
  ) => void
} & TxStoreObject) {
  const txKey = useMemo(() => {
    return generateObjectKey(rest?.routingInfo ?? { messages: (rest as any)?.route?.messages })
  }, [rest])

  useEffect(() => {
    if (txKey) {
      removePendingSwapTxs(txKey)
    }
  }, [txKey])

  return (
    <TxPage
      onClose={onClose}
      {...rest}
      isTrackingPage={true}
      rootDenomsStore={rootDenomsStore}
      rootCW20DenomsStore={rootCW20DenomsStore}
    />
  )
}
