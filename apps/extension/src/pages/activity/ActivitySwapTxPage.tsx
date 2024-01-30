import { TxPage, TxPageProps } from 'pages/swaps-v2/components'
import React, { useEffect } from 'react'
import { updatePendingSwapTxs } from 'utils/updatePendingSwapTxs'

export function ActivitySwapTxPage({ onClose, ...rest }: TxPageProps) {
  useEffect(() => {
    updatePendingSwapTxs(rest.route)
  }, [rest.route])

  return <TxPage onClose={onClose} {...rest} />
}
