import { useChainInfo } from '@leapwallet/cosmos-wallet-hooks'
import { Buttons } from '@leapwallet/leap-ui'
import BottomModal from 'components/bottom-modal'
import React from 'react'
import { Colors } from 'theme/colors'

import { useSwapContext } from '../context'
import { TxReviewTokenInfo } from './index'

type TxReviewSheetProps = {
  isOpen: boolean
  onClose: () => void
  onProceed: () => void
}

export function TxReviewSheet({ isOpen, onClose, onProceed }: TxReviewSheetProps) {
  const activeChainInfo = useChainInfo()
  const {
    displayFee,
    feeDenom,
    inAmount,
    sourceToken,
    amountOut,
    destinationToken,
    sourceChain,
    destinationChain,
  } = useSwapContext()

  return (
    <BottomModal
      isOpen={isOpen}
      closeOnBackdropClick={true}
      onClose={onClose}
      title='Review Transaction'
      className='p-0'
    >
      <div className='flex flex-col items-center w-full gap-y-4 my-7'>
        <div className='w-[344px] bg-white-100 dark:bg-gray-900 flex items-center justify-around p-7 rounded-2xl'>
          <TxReviewTokenInfo amount={inAmount} token={sourceToken} chain={sourceChain} />

          <div className='dark:text-gray-400'>
            <span className='material-icons-round'>keyboard_double_arrow_right</span>
          </div>

          <TxReviewTokenInfo amount={amountOut} token={destinationToken} chain={destinationChain} />
        </div>

        <div className='flex items-center justify-center text-gray-600 dark:text-gray-200'>
          <p className='font-semibold text-center text-sm'>Transaction fee: </p>
          <p className='font-semibold text-center text-sm ml-1'>
            <strong className='mr-[4px]'>
              {displayFee.formattedAmount} {feeDenom.coinDenom}
            </strong>
            {displayFee.fiatValue ? `(${displayFee.fiatValue})` : null}
          </p>
        </div>

        <Buttons.Generic
          color={activeChainInfo.theme.primaryColor ?? Colors.cosmosPrimary}
          className='w-[344px]'
          onClick={onProceed}
        >
          Proceed
        </Buttons.Generic>
      </div>
    </BottomModal>
  )
}
