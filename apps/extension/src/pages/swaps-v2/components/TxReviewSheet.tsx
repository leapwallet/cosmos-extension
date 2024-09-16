import { Buttons } from '@leapwallet/leap-ui'
import { CaretDown, CaretUp, GasPump } from '@phosphor-icons/react'
import BottomModal from 'components/bottom-modal'
import { PageName } from 'config/analytics'
import { AnimatePresence, motion } from 'framer-motion'
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

  const handleAccordingKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        handleAccordionClick()
      }
    },
    [handleAccordionClick],
  )

  return (
    <BottomModal
      onClose={onClose}
      isOpen={isOpen}
      closeOnBackdropClick={true}
      contentClassName='!bg-white-100 dark:!bg-gray-950'
      className='p-6 max-[399px]:!px-4'
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

          <div className='w-full flex-col bg-gray-50 dark:bg-gray-900 flex items-center justify-between p-4 gap-3 rounded-2xl overflow-hidden'>
            <div
              role='button'
              tabIndex={0}
              onClick={handleAccordionClick}
              onKeyDown={handleAccordingKeyDown}
              className='w-full flex-row flex justify-between items-center gap-2 cursor-pointer'
            >
              <ConversionRateDisplay
                onClick={() => {
                  //
                }}
              />
              <div className='flex items-center justify-end gap-1'>
                <GasPump size={16} className='dark:text-white-100' />
                <span className='dark:text-white-100 text-xs font-medium'>
                  {displayFee?.fiatValue}
                </span>
                {showMoreDetails ? (
                  <CaretUp size={16} className='dark:text-white-100' />
                ) : (
                  <CaretDown size={16} className='dark:text-white-100' />
                )}
              </div>
            </div>
            <AnimatePresence initial={false}>
              {showMoreDetails && (
                <motion.div
                  key='more-details'
                  initial={{ height: 0, opacity: 0.6 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0.6 }}
                  transition={{ duration: 0.1 }}
                  className='w-full'
                >
                  <div className='border-b w-full border-gray-200 dark:border-gray-800 mb-3' />
                  <MoreDetails showInfo={false} setShowFeesSettingSheet={setShowFeesSettingSheet} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <Buttons.Generic color={Colors.green600} className='w-[344px]' onClick={onProceed}>
          Confirm Swap
        </Buttons.Generic>
      </div>
    </BottomModal>
  )
}
