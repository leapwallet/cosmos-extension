import { Buttons } from '@leapwallet/leap-ui'
import BottomModal from 'components/bottom-modal'
import RangeInput from 'components/range-input'
import React from 'react'

import { useSwapContext } from '../swap-context'

interface propTypes {
  isOpen: boolean
  onClose: () => void
  onDone: () => void
  themeColor: string
}

const SlippageSheet: React.FC<propTypes> = ({ isOpen, onDone, onClose, themeColor }) => {
  const [{ slippagePercentage }, { setSlippagePercentage }] = useSwapContext()

  return (
    <BottomModal isOpen={isOpen} onClose={onClose} title='Max Slippage'>
      <div className='flex flex-col'>
        <div className='w-[344px] h-[132px] px-4 pt-[42px] mb-8 dark:bg-gray-900 bg-white-100 rounded-2xl'>
          <RangeInput
            activeColor={themeColor}
            initialValue={slippagePercentage}
            onChangeHandler={setSlippagePercentage}
          />
          <div className='inline-block text-[14px] text-gray-200 dark:text-gray-600 text-center'>
            Your transaction will fail if the price changes more than this percentage.
          </div>
        </div>
        <div className='text-center w-[344px]'>
          <div className='flex w-full shrink'>
            <Buttons.Generic size='normal' color={themeColor} onClick={onDone}>
              Review Swap
            </Buttons.Generic>
          </div>
        </div>
      </div>
    </BottomModal>
  )
}

export default SlippageSheet
