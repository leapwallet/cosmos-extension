import classNames from 'classnames'
import BottomModal from 'components/new-bottom-modal'
import Text from 'components/text'
import { Button } from 'components/ui/button'
import { AnimatePresence, motion } from 'framer-motion'
import { InfoIcon } from 'icons/info-icon'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { cn } from 'utils/cn'
import { transition150 } from 'utils/motion-variants'

import { useSwapContext } from '../context'
import { getSlippageRemarks, SlippageRemarks } from '../utils/slippage'

const slippageVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: { opacity: 1, height: 'auto' },
}

interface SlippageSheetProps {
  isOpen: boolean
  onClose: () => void
  onSlippageInfoClick: () => void
}
const SLIPPAGE_OPTIONS: (number | string)[] = [0.5, 1, 3, 'custom'] as const

export function SlippageSheet({ isOpen, onClose, onSlippageInfoClick }: SlippageSheetProps) {
  const { slippagePercent, setSlippagePercent } = useSwapContext()
  const [selectedSlippageOption, setSelectedSlippageOption] = useState(
    SLIPPAGE_OPTIONS.includes(slippagePercent) ? slippagePercent : 'custom',
  )
  const [customSlippage, setCustomSlippage] = useState<string>('')
  const [slippageRemarks, setSlippageRemarks] = useState<SlippageRemarks>()
  const [showCustomInput, setShowCustomInput] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setSelectedSlippageOption(
        SLIPPAGE_OPTIONS.includes(slippagePercent) ? slippagePercent : 'custom',
      )
      if (!SLIPPAGE_OPTIONS.includes(slippagePercent)) {
        inputRef.current?.focus()
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  useEffect(() => {
    if (showCustomInput) {
      inputRef.current?.focus()
    }
  }, [showCustomInput])

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (event.target && 'id' in event.target && event.target.id !== 'customBtn') {
      setShowCustomInput(false)
    }
  }, [])

  useEffect(() => {
    document.addEventListener('click', handleClickOutside)

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [handleClickOutside])

  useEffect(() => {
    setSlippageRemarks(getSlippageRemarks(customSlippage))
  }, [customSlippage])

  const handleOnProceedClick = useCallback(() => {
    if (selectedSlippageOption !== 'custom') {
      setSlippagePercent(selectedSlippageOption as number)
    } else {
      setSlippagePercent(parseFloat(customSlippage))
    }
    onClose()
  }, [customSlippage, onClose, selectedSlippageOption, setSlippagePercent])

  const proceedDisabled = useMemo(() => {
    if (typeof selectedSlippageOption === 'string') {
      if (slippageRemarks?.type === 'error') return true
      if (!customSlippage) return true
    }
    return false
  }, [customSlippage, selectedSlippageOption, slippageRemarks?.type])

  return (
    <BottomModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className='flex justify-start gap-2 items-center'>
          <h1 className='text-[18px] text-foreground !leading-[24px] font-bold'>Max. Slippage</h1>
          <button onClick={onSlippageInfoClick} className='text-muted-foreground'>
            <InfoIcon size={20} className='padding-[1px]' />
          </button>
        </div>
      }
    >
      <div className='flex flex-col gap-10 w-full p-2 !pt-6'>
        <div className='flex flex-col gap-4'>
          <div className='flex flex-row w-full justify-between items-center'>
            {SLIPPAGE_OPTIONS.map((option) =>
              option === 'custom' && showCustomInput ? (
                <input
                  type='number'
                  value={customSlippage}
                  onChange={(e) => {
                    setCustomSlippage(e.target.value)
                  }}
                  ref={inputRef}
                  className={cn(
                    'w-[88px] h-[48px] rounded-lg font-bold text-[18px] !leading-[24.3px] text-foreground bg-transparent outline-none focus:border focus:border-white text-center caret-primary',
                    slippageRemarks?.type === 'error'
                      ? 'border-destructive-100'
                      : slippageRemarks?.type === 'warn'
                      ? 'border-accent-yellow'
                      : '',
                  )}
                />
              ) : (
                <button
                  key={option}
                  id={option === 'custom' ? 'customBtn' : undefined}
                  onClick={() => {
                    setSelectedSlippageOption(option)
                    if (customSlippage) {
                      setCustomSlippage('')
                    }
                    if (option === 'custom') {
                      setShowCustomInput(true)
                    } else {
                      setShowCustomInput(false)
                    }
                  }}
                  className={classNames(
                    'text-[18px] h-[48px] rounded-lg !leading-[24.3px] px-2.5 py-3 w-full',
                    {
                      'dark:text-white-100 text-black-100 font-bold bg-gray-50 dark:bg-gray-900':
                        selectedSlippageOption === option,
                      'dark:text-gray-400 text-gray-600 font-medium':
                        selectedSlippageOption !== option,
                    },
                  )}
                >
                  {option === 'custom'
                    ? customSlippage
                      ? `${customSlippage}%`
                      : 'Custom'
                    : `${option}%`}
                </button>
              ),
            )}
          </div>

          <AnimatePresence>
            {slippageRemarks ? (
              <motion.div
                initial='hidden'
                animate='visible'
                exit='hidden'
                variants={slippageVariants}
                transition={transition150}
                className='overflow-hidden'
              >
                <div
                  className={classNames(
                    'text-sm !leading-[22px]',
                    slippageRemarks.type === 'error'
                      ? 'text-destructive-100'
                      : 'text-accent-yellow',
                  )}
                >
                  {slippageRemarks.message}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <Text color='dark:text-gray-400 text-gray-600' size='sm'>
            Your transaction will fail if the price changes more than the slippage. Too high of a
            value will result in an unfavorable trade.
          </Text>
        </div>

        <Button disabled={proceedDisabled} onClick={handleOnProceedClick} className='w-full mt-4'>
          Confirm
        </Button>
      </div>
    </BottomModal>
  )
}
