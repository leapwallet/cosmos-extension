import { Buttons } from '@leapwallet/leap-ui'
import { Info, Warning } from '@phosphor-icons/react'
import classNames from 'classnames'
import BottomModal from 'components/bottom-modal'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Colors } from 'theme/colors'

import { useSwapContext } from '../context'
import { getSlippageRemarks, SlippageRemarks } from '../utils/slippage'

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
  const [customSlippage, setCustomSlippage] = useState<string>(slippagePercent.toString())
  const [slippageRemarks, setSlippageRemarks] = useState<SlippageRemarks>()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setSelectedSlippageOption(
        SLIPPAGE_OPTIONS.includes(slippagePercent) ? slippagePercent : 'custom',
      )
      setCustomSlippage(slippagePercent.toString())
      if (!SLIPPAGE_OPTIONS.includes(slippagePercent)) {
        inputRef.current?.focus()
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  useEffect(() => {
    if (selectedSlippageOption === 'custom') {
      inputRef.current?.focus()
    }
  }, [selectedSlippageOption])

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
      contentClassName='!bg-white-100 dark:!bg-gray-950'
      className='p-6'
      titleComponent={
        <div className='flex justify-start gap-2 items-center'>
          <h1 className='text-[18px] text-black-100 dark:text-white-100 !leading-[24.3px] font-bold'>
            Max. Slippage
          </h1>
          <button onClick={onSlippageInfoClick} className='dark:text-gray-400 text-gray-600'>
            <Info size={20} />
          </button>
        </div>
      }
      title={'Max. Slippage'}
      closeOnBackdropClick={true}
    >
      <div className='flex flex-col gap-6 w-full'>
        <div className='flex flex-col gap-4 p-4 dark:bg-gray-900 bg-gray-50 rounded-2xl w-full'>
          <span className='dark:text-white-100 text-sm !leading-[19.6px] font-bold text-black-100'>
            Select a slippage value
          </span>
          <div className='flex flex-col gap-2 justify-start items-start w-full p-2 bg-gray-100 dark:bg-gray-850 rounded-2xl hide-scrollbar overflow-scroll'>
            <div className='flex flex-row w-full justify-between items-center'>
              {SLIPPAGE_OPTIONS.map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    setSelectedSlippageOption(option)
                  }}
                  className={classNames(
                    'text-sm h-[32px] rounded-full !leading-[19.6px] px-[16px] w-full',
                    {
                      'dark:text-white-100 text-black-100 font-bold bg-gray-50 dark:bg-gray-900':
                        selectedSlippageOption === option,
                      'dark:text-gray-400 text-gray-600 font-medium':
                        selectedSlippageOption !== option,
                    },
                  )}
                >
                  {option === 'custom' ? 'Custom' : `${option}%`}
                </button>
              ))}
            </div>
            {selectedSlippageOption === 'custom' && (
              <div
                className={classNames(
                  'flex w-full py-2 h-[48px] pl-3 pr-4 flex-row rounded-2xl justify-between gap-4 bg-gray-50 dark:bg-gray-900 items-center relative border border-transparent',
                  {
                    'focus-within:border-green-600': !slippageRemarks,
                    'focus-within:border-orange-500 dark:focus-within:border-orange-300':
                      slippageRemarks?.color === 'orange',
                    'focus-within:border-red-400 dark:focus-within:border-red-300':
                      slippageRemarks?.color === 'red',
                  },
                )}
              >
                <div className='shrink-0 font-medium text-sm !leading-[22.5px] text-gray-600 dark:text-gray-400'>
                  Amount
                </div>
                <div className='flex flex-row justify-end items-center w-full'>
                  <input
                    type='number'
                    value={customSlippage}
                    placeholder='0'
                    onChange={(e) => {
                      setCustomSlippage(e.target.value)
                    }}
                    ref={inputRef}
                    className='w-full font-bold text-[18px] !leading-[24.3px] text-black-100 placeholder:text-gray-600 placeholder:dark:text-gray-400 dark:text-white-100 bg-transparent outline-none text-right'
                  />
                  <div
                    className={classNames('shrink-0 font-bold text-[18px] !leading-[24.3px] ', {
                      'text-gray-600 dark:text-gray-400': customSlippage === '',
                      'text-black-100 dark:text-white-100': customSlippage !== '',
                    })}
                  >
                    %
                  </div>
                </div>
              </div>
            )}
          </div>
          {slippageRemarks && (
            <div className='flex flex-row w-full justify-start items-start gap-2'>
              <Warning
                size={16}
                className={classNames('!leading-[16px]', {
                  'text-orange-500 dark:text-orange-300': slippageRemarks.color === 'orange',
                  'text-red-400 dark:text-red-300': slippageRemarks.color === 'red',
                })}
              />
              <span
                className={classNames('font-medium text-xs !leading-[19.2px]', {
                  'text-orange-500 dark:text-orange-300': slippageRemarks.color === 'orange',
                  'text-red-400 dark:text-red-300': slippageRemarks.color === 'red',
                })}
              >
                {slippageRemarks.message}
              </span>
            </div>
          )}
        </div>

        <Buttons.Generic
          color={Colors.green600}
          disabled={proceedDisabled}
          onClick={handleOnProceedClick}
          className='w-full'
        >
          Proceed
        </Buttons.Generic>
      </div>
    </BottomModal>
  )
}
