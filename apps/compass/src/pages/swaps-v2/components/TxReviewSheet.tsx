import { CaretDown, CaretUp, GasPump } from '@phosphor-icons/react'
import classNames from 'classnames'
import BottomModal from 'components/bottom-modal'
import { Button } from 'components/ui/button'
import { AnimatePresence, motion } from 'framer-motion'
import React, { Dispatch, SetStateAction, useCallback, useState } from 'react'

import { useSwapContext } from '../context'
import { MoreDetails } from './MoreDetails'
import { ConversionRateDisplay } from './SwapInfo/ConversionRateDisplay'
import TxTokensSummary from './TxTokensSummary'

type TxReviewSheetProps = {
  isOpen: boolean
  onClose: () => void
  onProceed: () => void
  setShowFeesSettingSheet: Dispatch<SetStateAction<boolean>>
  onSlippageInfoClick: () => void
}

export function TxReviewSheet({
  isOpen,
  onClose,
  onProceed,
  setShowFeesSettingSheet,
  onSlippageInfoClick,
}: TxReviewSheetProps) {
  const {
    displayFee,
    inAmount,
    sourceToken,
    amountOut,
    destinationToken,
    sourceChain,
    destinationChain,
    routingInfo,
  } = useSwapContext()

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
      className='!p-6'
      title='Review Transaction'
      containerClassName='bg-secondary-50'
    >
      <div
        className={classNames('flex flex-col items-center w-full', {
          'gap-y-6': !showMoreDetails,
          'gap-y-4': showMoreDetails,
        })}
      >
        <TxTokensSummary
          inAmount={inAmount}
          sourceToken={sourceToken}
          sourceChain={sourceChain}
          amountOut={amountOut}
          destinationToken={destinationToken}
          destinationChain={destinationChain}
        />

        <div className='w-full flex-col dark:bg-gray-950 bg-white-100 border border-secondary-200 flex items-center justify-between rounded-2xl overflow-hidden'>
          <div
            role='button'
            tabIndex={0}
            onClick={handleAccordionClick}
            onKeyDown={handleAccordingKeyDown}
            className='w-full flex-row flex justify-between items-center gap-2 cursor-pointer p-4'
          >
            <ConversionRateDisplay
              isReviewSheet={true}
              onClick={() => {
                //
              }}
            />
            <div className='flex items-center justify-end gap-1'>
              <GasPump size={16} className='text-secondary-800' weight='fill' />
              <span className='text-secondary-800 text-sm font-medium'>
                {displayFee?.fiatValue}
              </span>
              {showMoreDetails ? (
                <CaretUp size={14} className='text-secondary-800' />
              ) : (
                <CaretDown size={14} className='text-secondary-800' />
              )}
            </div>
          </div>
          <AnimatePresence initial={false}>
            {showMoreDetails && (
              <>
                <motion.div
                  key='more-details'
                  initial={{ height: 0, opacity: 0.6 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0.6 }}
                  transition={{ duration: 0.1 }}
                  className='w-full p-4 border-t border-secondary-300 border-dashed'
                >
                  <MoreDetails
                    showInfo={true}
                    isReviewSheet={true}
                    setShowFeesSettingSheet={setShowFeesSettingSheet}
                    onSlippageInfoClick={onSlippageInfoClick}
                  />
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <Button className='w-[344px]' onClick={onProceed}>
          Confirm Swap
        </Button>
      </div>
    </BottomModal>
  )
}
