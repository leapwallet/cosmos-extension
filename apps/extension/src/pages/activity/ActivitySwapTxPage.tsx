import { TxPage, TxPageProps } from 'pages/swaps-v2/components'
import React, { useEffect } from 'react'
import { generateObjectKey, removePendingSwapTxs } from 'utils/pendingSwapsTxsStore'

export function ActivitySwapTxPage({ onClose, ...rest }: TxPageProps) {
  useEffect(() => {
    const route = rest?.route
    const txKey = generateObjectKey(route)
    if (txKey) {
      removePendingSwapTxs(txKey)
    }
  }, [rest])

  return <TxPage onClose={onClose} {...rest} isTrackingPage={true} />
}
