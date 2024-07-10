import { Buttons } from '@leapwallet/leap-ui'
import BottomModal from 'components/bottom-modal'
import { PageName } from 'config/analytics'
import { usePageView } from 'hooks/analytics/usePageView'
import React, { Dispatch, SetStateAction, useCallback, useMemo, useState } from 'react'
import { Colors } from 'theme/colors'

import { useSwapContext } from '../context'
import { MoreDetails } from './MoreDetails'
import { ConversionRateDisplay } from './SwapInfo/ConversionRateDisplay'
import TxTokensSummary from './TxTokensSummary'

type TxReviewSheetProps = {
  isOpen: boolean
  onClose: () => void
  onProceed: () => void
  setShowFeesSettingSheet: Dispatch<SetStateAction<boolean>>
}

export function TxReviewSheet({
  isOpen,
  onClose,
  onProceed,
  setShowFeesSettingSheet,
}: TxReviewSheetProps) {
  const {
    displayFee,
    inAmount,
    sourceToken,
    amountOut,
    destinationToken,
    sourceChain,
    destinationChain,
    route,
  } = useSwapContext()

  const reviewPageProperties = useMemo(() => {
    let inAmountDollarValue
    if (
      sourceToken?.usdPrice &&
      !isNaN(parseFloat(sourceToken?.usdPrice)) &&
      inAmount &&
      !isNaN(parseFloat(inAmount))
    ) {
      inAmountDollarValue = parseFloat(sourceToken?.usdPrice) * parseFloat(inAmount)
    }
    return {
      fromToken: sourceToken?.symbol,
      fromTokenAmount: inAmountDollarValue,
      fromChain: sourceChain?.chainName ?? '',
      toToken: destinationToken?.symbol,
      toChain: destinationChain?.chainName,
      hops: (route?.response?.operations?.length ?? 0) - 1,
    }
  }, [
    sourceToken?.usdPrice,
    sourceToken?.symbol,
    inAmount,
    sourceChain?.chainName,
    destinationToken?.symbol,
    destinationChain?.chainName,
    route?.response?.operations?.length,
  ])

  usePageView(PageName.SwapsReview, isOpen, reviewPageProperties)

  const [showMoreDetails, setShowMoreDetails] = useState<boolean>(false)

  const handleAccordionClick = useCallback(() => {
    setShowMoreDetails((prevShowMoreDetails) => !prevShowMoreDetails)
  }, [setShowMoreDetails])

  return (
    <BottomModal
      onClose={onClose}
      isOpen={isOpen}
      closeOnBackdropClick={true}
      contentClassName='!bg-white-100 dark:!bg-gray-950'
      className='p-6'
      title='Review Transaction'
    >
      <div className='flex flex-col items-center w-full gap-6'>
        <div className='flex flex-col items-center w-full gap-4'>
          <TxTokensSummary
            inAmount={inAmount}
            sourceToken={sourceToken}
            sourceChain={sourceChain}
            amountOut={amountOut}
            destinationToken={destinationToken}
            destinationChain={destinationChain}
          />

          <div className='w-full flex-col bg-gray-50 dark:bg-gray-900 flex items-center justify-between p-4 gap-3 rounded-2xl'>
            <button
              onClick={handleAccordionClick}
              className='w-full flex-row flex justify-between items-center gap-2'
            >
              <ConversionRateDisplay
                onClick={() => {
                  //
                }}
              />
              <div className='flex items-center justify-end gap-1'>
                <span className='!leading-5 [transform:rotateY(180deg)] rotate-180 !text-md material-icons-round dark:text-white-100'>
                  local_gas_station
                </span>
                <span className='dark:text-white-100 text-xs font-medium'>
                  {displayFee?.fiatValue}
                </span>
                <span className='!leading-5 !text-md material-icons-round dark:text-white-100'>
                  {showMoreDetails ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
                </span>
              </div>
            </button>
            {showMoreDetails && (
              <>
                <div className='border-b w-full border-gray-200 dark:border-gray-800' />
                <MoreDetails showInfo={false} setShowFeesSettingSheet={setShowFeesSettingSheet} />
              </>
            )}
          </div>
        </div>

        <Buttons.Generic color={Colors.green600} className='w-[344px]' onClick={onProceed}>
          Confirm Swap
        </Buttons.Generic>
      </div>
    </BottomModal>
  )
}
