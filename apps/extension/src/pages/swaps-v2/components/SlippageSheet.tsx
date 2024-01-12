import { useChainInfo } from '@leapwallet/cosmos-wallet-hooks'
import { Buttons } from '@leapwallet/leap-ui'
import BottomModal from 'components/bottom-modal'
import RangeInput from 'components/range-input'
import React from 'react'

import { useSwapContext } from '../context'

interface SlippageSheetProps {
  isOpen: boolean
  onClose: () => void
}

export function SlippageSheet({ isOpen, onClose }: SlippageSheetProps) {
  const activeChainInfo = useChainInfo()
  const { slippagePercent, setSlippagePercent } = useSwapContext()

  return (
    <BottomModal isOpen={isOpen} onClose={onClose} title='Max Slippage' closeOnBackdropClick={true}>
      <div className='flex flex-col gap-4'>
        <div className='w-[344px] h-[132px] px-4 pt-[42px] pb-4 dark:bg-gray-900 bg-white-100 rounded-2xl'>
          <RangeInput
            activeColor={activeChainInfo.theme.primaryColor}
            min={0.1}
            max={1}
            step={0.1}
            initialValue={slippagePercent}
            onChangeHandler={setSlippagePercent}
          />

          <p className='text-gray-300 text-center text-sm'>
            Your transaction will fail if the price changes unfavourable more than this percentage.
          </p>
        </div>

        <Buttons.Generic
          color={activeChainInfo.theme.primaryColor}
          onClick={onClose}
          className='w-[344px]'
        >
          Proceed
        </Buttons.Generic>
      </div>
    </BottomModal>
  )
}
