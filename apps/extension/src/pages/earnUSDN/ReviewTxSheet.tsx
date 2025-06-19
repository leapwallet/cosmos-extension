import { Token } from '@leapwallet/cosmos-wallet-store'
import { formatTokenAmount } from '@leapwallet/cosmos-wallet-store/dist/utils'
import { ArrowRight } from '@phosphor-icons/react'
import classNames from 'classnames'
import LedgerConfirmationPopup from 'components/ledger-confirmation/LedgerConfirmationPopup'
import BottomModal from 'components/new-bottom-modal'
import Text from 'components/text'
import loadingImage from 'lottie-files/swaps-btn-loading.json'
import Lottie from 'lottie-react'
import { observer } from 'mobx-react-lite'
import React from 'react'

type Props = {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  showLedgerPopup: boolean
  source: Token
  destination: Token
  amountIn: string
  amountOut: string
  isProcessing: boolean
  error?: string
}

const ReviewTxSheet = observer(
  ({
    isOpen,
    onClose,
    onConfirm,
    source,
    showLedgerPopup,
    amountIn,
    amountOut,
    destination,
    isProcessing,
    error,
  }: Props) => {
    return (
      <>
        <BottomModal
          title='Confirm transaction'
          isOpen={isOpen}
          onClose={onClose}
          className='p-6 z-10'
        >
          <div className='flex flex-col gap-4 w-full'>
            <div className='w-full bg-gray-50 dark:bg-gray-900 flex items-center justify-between p-4 gap-2 rounded-2xl'>
              <div className='flex flex-col items-center w-full max-w-[140px] max-[399px]:!max-w-[calc(min(140px,45%))] gap-4 max-[399px]:overflow-visible'>
                <img src={source.img} className='w-11 h-11' />
                <Text color='text-black-100 dark:text-white-100' size='sm' className='font-bold'>
                  {formatTokenAmount(amountIn, source.symbol, 4)}
                </Text>
              </div>
              <ArrowRight
                size={24}
                className='p-1.5 text-black-100 dark:text-white-100 rounded-full bg-gray-100 dark:bg-gray-850'
              />
              <div className='flex flex-col items-center w-full max-w-[140px] max-[399px]:!max-w-[calc(min(140px,45%))] gap-4 max-[399px]:overflow-visible'>
                <img src={destination.img} className='w-11 h-11' />
                <Text color='text-black-100 dark:text-white-100' size='sm' className='font-bold'>
                  {formatTokenAmount(amountOut, destination.symbol, 4)}
                </Text>
              </div>
            </div>

            {error && <p className='text-sm font-bold text-red-600 px-2 mt-2'>{error}</p>}

            <button
              className={classNames(
                'w-full mt-4 text-md font-bold text-white-100 h-12 rounded-full cursor-pointer bg-green-600',
                {
                  'hover:bg-green-500 ': !isProcessing,
                  'opacity-40': isProcessing,
                },
              )}
              onClick={onConfirm}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Lottie
                  loop={true}
                  autoplay={true}
                  animationData={loadingImage}
                  rendererSettings={{
                    preserveAspectRatio: 'xMidYMid slice',
                  }}
                  className={'h-[24px] w-[24px]'}
                />
              ) : (
                'Confirm Swap'
              )}
            </button>
          </div>
        </BottomModal>
        {showLedgerPopup && <LedgerConfirmationPopup showLedgerPopup={showLedgerPopup} />}
      </>
    )
  },
)

export default ReviewTxSheet
