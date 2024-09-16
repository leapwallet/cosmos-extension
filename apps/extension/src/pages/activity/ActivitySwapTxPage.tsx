import { TxPage, TxPageProps } from 'pages/swaps-v2/components'
import React, { useEffect, useMemo } from 'react'
import { rootCW20DenomsStore, rootDenomsStore } from 'stores/denoms-store-instance'
import { generateObjectKey, removePendingSwapTxs } from 'utils/pendingSwapsTxsStore'

export function ActivitySwapTxPage({ onClose, ...rest }: TxPageProps) {
  const txKey = useMemo(() => {
    return generateObjectKey(rest?.route)
  }, [rest?.route])

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
