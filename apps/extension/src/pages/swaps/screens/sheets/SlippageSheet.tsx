import { Buttons, HeaderActionType } from '@leapwallet/leap-ui'
import BottomSheet from 'components/bottom-sheet/BottomSheet'
import RangeInput from 'components/range-input'
import React from 'react'

interface propTypes {
  isVisible: boolean
  onCloseHandler: () => void
  slippagePercentage: number
  // eslint-disable-next-line no-unused-vars
  setSlippagePercentage: (slippagePercentage: number) => void
  toggleReviewSheet: () => void
}

const SlippageSheet = (props: propTypes) => {
  return (
    <BottomSheet
      isVisible={props.isVisible}
      onClose={props.onCloseHandler}
      headerTitle='Max Slippage'
      headerActionType={HeaderActionType.CANCEL}
    >
      <>
        <div className='w-[344px]'>
          <div className='flex flex-col px-7 pt-7 pb-10'>
            <div className='w-[344px] h-[132px] px-4 pt-[42px] mb-8 dark:bg-gray-900 bg-white-100 rounded-2xl'>
              <RangeInput
                initialValue={props.slippagePercentage}
                onChangeHandler={(value) => props.setSlippagePercentage(value)}
              />
              <div className='inline-block text-[14px] text-gray-200 dark:text-gray-600 text-center'>
                Your transaction will fall if the price changes unfavourable more than this
                percentage.
              </div>
            </div>
            <div className='text-center w-[344px]'>
              <div className='flex w-full shrink'>
                <Buttons.Generic
                  size='normal'
                  color={'#E18881'}
                  onClick={() => {
                    props.toggleReviewSheet()
                  }}
                >
                  Review Swap
                </Buttons.Generic>
              </div>
            </div>
          </div>
        </div>
      </>
    </BottomSheet>
  )
}

export default SlippageSheet
