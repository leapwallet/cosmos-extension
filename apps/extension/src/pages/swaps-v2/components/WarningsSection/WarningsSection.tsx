import { useSwapContext } from 'pages/swaps-v2/context'
import { isNoRoutesAvailableError } from 'pages/swaps-v2/hooks'
import React, { Dispatch, SetStateAction } from 'react'
import { rootDenomsStore } from 'stores/denoms-store-instance'

import PriceImpactWarnings from './PriceImpactWarnings'
import { WarningBox } from './WarningBox'

type Props = {
  isPriceImpactChecked: boolean
  setIsPriceImpactChecked: Dispatch<SetStateAction<boolean>>
  ledgerError?: string
}

export function WarningsSection({
  isPriceImpactChecked,
  setIsPriceImpactChecked,
  ledgerError,
}: Props) {
  const {
    routingInfo,
    isMoreThanOneStepTransaction,
    gasError,
    errorMsg,
    amountExceedsBalance,
    isSanctionedAddressPresent,
  } = useSwapContext()

  if (isSanctionedAddressPresent) {
    return <WarningBox message='Unable to process this transaction' type={'error'} />
  }

  if (isNoRoutesAvailableError(errorMsg)) {
    return null
  }

  if (isMoreThanOneStepTransaction) {
    return (
      <WarningBox message='This is a multi-step route, please navigate to Swapfast to complete the swap' />
    )
  }

  if (!amountExceedsBalance) {
    if (errorMsg) {
      return <WarningBox message={errorMsg} type={'error'} />
    }

    if (gasError) {
      return <WarningBox message={gasError} type={'error'} />
    }
  }

  if (ledgerError) {
    return <WarningBox message={ledgerError} type={'warning'} />
  }

  if (!routingInfo.route?.response) {
    return null
  }

  return (
    <PriceImpactWarnings
      isPriceImpactChecked={isPriceImpactChecked}
      setIsPriceImpactChecked={setIsPriceImpactChecked}
      rootDenomsStore={rootDenomsStore}
    />
  )
}
