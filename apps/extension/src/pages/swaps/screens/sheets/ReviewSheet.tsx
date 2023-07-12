import { Buttons, HeaderActionType } from '@leapwallet/leap-ui'
import BottomSheet from 'components/bottom-sheet/BottomSheet'
import { LoaderAnimation } from 'components/loader/Loader'
import { DEFAULT_SWAP_FEE } from 'config/config'
import { useTokenSwap } from 'hooks/swaps/main/useTokenSwap'
import { Images } from 'images'
import React from 'react'
import { Colors } from 'theme/colors'

import { ErrorCard } from '../../../../components/ErrorCard'
import LedgerConfirmationPopup from '../../../../components/ledger-confirmation/LedgerConfirmationPopup'
import { useCaptureTxError } from '../../../../hooks/utility/useCaptureTxError'

interface propTypes {
  isVisible: boolean
  onCloseHandler: () => void
  slippage: string
  targetTokenName: string
  targetTokenIcon: string
  targetAmountValue: string
  selectedTokenName: string
  selectedTokenIcon: string
  selectedTokenValue: string
  feesCurrency: string
  unitPrice: string
  // eslint-disable-next-line no-unused-vars
  unitPriceOfTokenOfQuantity: (tokenName: string, quantity: string) => string
}

const ReviewSheet = (props: propTypes) => {
  const { handleSwap, loading, error, showLedgerPopup } = useTokenSwap({
    tokenASymbol: props.selectedTokenName,
    tokenBSymbol: props.targetTokenName,
    tokenAmount: Number(props.selectedTokenValue),
    tokenToTokenPrice: Number(props.targetAmountValue),
    slippage: Number(props.slippage),
  })

  useCaptureTxError(error)

  if (!error && showLedgerPopup) {
    return <LedgerConfirmationPopup showLedgerPopup={showLedgerPopup} />
  }

  return (
    <BottomSheet
      isVisible={props.isVisible}
      onClose={props.onCloseHandler}
      headerTitle='Review Swap'
      headerActionType={HeaderActionType.CANCEL}
    >
      <div className='flex flex-col px-7 pt-7 w-full items-center justify-center pb-10'>
        {/* Swap summary of tokens */}
        <div className='w-[344px] h-[212px] px-4 pt-[42px] mb-8 dark:bg-gray-900 bg-white-100 rounded-2xl'>
          <div className='flex flex-row justify-evenly'>
            <div className='flex flex-col justify-center items-center text-black-100 dark:text-gray-400'>
              <img src={props.selectedTokenIcon} className='h-[70px] w-[70px] mb-[16px]' />
              <p className='font-bold text-white-100'>
                {props.selectedTokenValue} {props.selectedTokenName}
              </p>
              {/* <p>{selectedTokenUSDValue && selectedTokenUSDValue != '-' ? "~$" + selectedTokenUSDValue : selectedTokenUSDValue}</p> */}
            </div>
            <div className='flex flex-col justify-center items-center text-black-100 dark:text-gray-400'>
              <span className='material-icons-round'>keyboard_double_arrow_right</span>
            </div>
            <div className='flex flex-col justify-center items-center text-black-100 dark:text-gray-400'>
              <img src={props.targetTokenIcon} className='h-[70px] w-[70px] mb-[16px]' />
              <p className='font-bold text-white-100'>
                {props.targetAmountValue} {props.targetTokenName}
              </p>
              {/* <p>{targetTokenUSDValue && targetTokenUSDValue != '-' ? "~$" + targetTokenUSDValue : targetTokenUSDValue}</p> */}
            </div>
          </div>
        </div>

        {/* Slippage and unit transaction cost */}
        <div className='flex flex-row w-[344px]'>
          {/* amount per unit token indicator */}
          <div className='bg-white-100 dark:bg-gray-900 flex flex-row w-[206px] h-[56px] rounded-[8px] px-[12px] pt-[8px]'>
            <div className='flex flex-col justify-center'>
              <img src={Images.Logos.JunoSwap} className='h-6 w-6 mr-[10px]' />
            </div>
            <div className='flex flex-col justify-center text-[12px]'>
              <p>
                <span className='font-bold text-black-100 dark:text-white-100'>
                  {props.unitPrice} {props.targetTokenName}
                </span>{' '}
                <span className='text-gray-400'>per {props.selectedTokenName}</span>
              </p>
              <p className='text-gray-400'>Juno Swap</p>
            </div>
          </div>
          {/* max slippage selector */}
          <div className='bg-white-100 dark:bg-gray-900 flex flex-row justify-between w-[130px] h-[56px] rounded-[8px] px-[12px] py-[8px] ml-[8px]'>
            <div className='flex flex-col justify-center text-[12px]'>
              <p>
                <span className='text-gray-400'>Max slippage</span>
              </p>
              <p className='font-bold text-black-100 dark:text-white-100'>{props.slippage}%</p>
            </div>
          </div>
        </div>

        {/* Transaction fee indicator */}
        <div className='text-center w-[344px] py-[20px]'>
          <p className='font-bold text-black-100 dark:text-gray-200 text-sm'>
            Transaction Fee: {DEFAULT_SWAP_FEE} JUNO (${props.feesCurrency})
          </p>
        </div>
        {error ? <ErrorCard text={error} /> : null}

        {loading ? (
          <LoaderAnimation color={Colors.white100} />
        ) : (
          <Buttons.Generic
            size='normal'
            color={'#E18881'}
            disabled={showLedgerPopup}
            className='w-[344px]'
            onClick={() => {
              handleSwap()
            }}
          >
            Swap
          </Buttons.Generic>
        )}
      </div>
    </BottomSheet>
  )
}

export default ReviewSheet
