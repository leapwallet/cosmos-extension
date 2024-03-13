import React from 'react'

import { useSwapContext } from '../context'
import { TxPage } from './index'

type SwapTxPageProps = {
  onClose: () => void
  setLedgerError: (ledgerError?: string) => void
}

export function SwapTxPage({ onClose, setLedgerError }: SwapTxPageProps) {
  const {
    route,
    sourceToken,
    sourceChain,
    inAmount,
    destinationChain,
    destinationToken,
    amountOut,
    userPreferredGasLimit,
    userPreferredGasPrice,
    gasEstimate,
    feeDenom,
    gasOption,
    refetchSourceBalances,
    refetchDestinationBalances,
  } = useSwapContext()

  return (
    <TxPage
      onClose={onClose}
      sourceToken={sourceToken}
      destinationToken={destinationToken}
      sourceChain={sourceChain}
      destinationChain={destinationChain}
      inAmount={inAmount}
      amountOut={amountOut}
      route={route}
      userPreferredGasLimit={userPreferredGasLimit}
      userPreferredGasPrice={userPreferredGasPrice}
      gasEstimate={gasEstimate}
      feeDenom={feeDenom}
      gasOption={gasOption}
      setLedgerError={setLedgerError}
      refetchSourceBalances={refetchSourceBalances}
      refetchDestinationBalances={refetchDestinationBalances}
    />
  )
}
