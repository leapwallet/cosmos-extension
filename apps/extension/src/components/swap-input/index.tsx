import { useformatCurrency } from '@leapwallet/cosmos-wallet-hooks'
import { CardDivider } from '@leapwallet/leap-ui'
import { Buttons } from '@leapwallet/leap-ui'
import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import ClickableIcon from 'components/clickable-icons'
import { DEFAULT_SWAP_FEE } from 'config/config'
import { Images } from 'images'
import React, { forwardRef, useEffect, useState } from 'react'

type Swap = {
  name: string
  icon?: string
  balance: string
}

export type SwapInputProps = Swap & {
  targetName: string
  targetTokenIcon: string
  amount: string
  targetAmount: string
  feeInCurrency: string
  // eslint-disable-next-line no-unused-vars
  setAmount: (amount: string) => void
  onSwapClick: () => void
  placeholder?: string
  onTokenClick?: () => void
  onMaxClick?: () => void
  onTargetTokenClick?: () => void
  onSlippageClick: () => void
  onReviewClick: () => void
  targetUnitPrice: string
  slippage: string
  isFeeAvailable?: boolean
  junoDollarValue: number | undefined
}

const SwapInput = forwardRef<HTMLInputElement, SwapInputProps>(
  ({
    name,
    balance,
    amount,
    targetAmount,
    feeInCurrency,
    setAmount,
    onMaxClick,
    onSwapClick,
    onTokenClick,
    onTargetTokenClick,
    targetName,
    targetTokenIcon,
    targetUnitPrice,
    icon,
    onSlippageClick,
    onReviewClick,
    slippage,
    isFeeAvailable,
    junoDollarValue,
  }) => {
    const [isError, setIsError] = useState(false)
    const [formatBalance] = useformatCurrency()

    useEffect(() => {
      if (name === 'JUNO' && Number(amount) > Number(balance) - 0.004) {
        setIsError(true)
      } else if (name !== 'JUNO' && Number(amount) > Number(balance)) {
        setIsError(true)
      } else {
        setIsError(false)
      }
    }, [amount, balance, name])

    const dollarValueDisplay =
      junoDollarValue === undefined
        ? '-'
        : formatBalance(new BigNumber(junoDollarValue).multipliedBy(amount))

    return (
      <div>
        {/* Swap from section */}
        <div className='bg-white-100 dark:bg-gray-900 flex flex-col p-4 w-[344px] rounded-t-2xl'>
          <div className='flex h-10 w-full justify-between'>
            <div
              className='bg-gray-50 dark:bg-gray-800 rounded-full flex items-center py-2 pl-3 pr-2 cursor-pointer'
              onClick={onTokenClick}
            >
              {icon && <img src={icon} className='h-6 w-6 mr-1' />}
              <div className='text-black-100 dark:text-white-100 font-bold text-base pl-[4px] pr-[7px]'>
                {name}
              </div>
              <img src={Images.Misc.ArrowDown} />
            </div>
            <input
              placeholder='enter amount'
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className='w-32 text-xl font-bold text-black-100 dark:text-white-100 dark:bg-gray-900 outline-none text-right'
              type='number'
            />
          </div>
          <div className='flex mt-2 w-full justify-between items-start'>
            <div
              className={classNames('text-sm font-bold', {
                'text-red-300': isError,
                'text-gray-400': !isError,
              })}
            >
              {`${isError ? 'Insufficient Funds' : 'Balance'}: ${balance} ${
                name === 'Select token' ? '' : name
              }`}
            </div>
            <div className='flex flex-col self-end'>
              <p className='font-medium text-sm text-gray-600 dark:text-gray-300 text-right w-full'>
                {dollarValueDisplay}
              </p>
              {!isError && (
                <>
                  <button
                    className='bg-green-600/10 text-green-600 text-sm font-bold px-4 h-7 rounded-full mt-2'
                    onClick={onMaxClick}
                  >
                    Swap all
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        {/* Swap interchange button section */}
        <div className='flex justify-center items-center bg-white-100 dark:bg-gray-900 h-8 relative'>
          <div className='absolute top-4 left-0'>
            <CardDivider />
          </div>
          <ClickableIcon
            darker={true}
            image={{ src: 'keyboard_double_arrow_down', alt: '' }}
            onClick={onSwapClick}
            style={{ zIndex: 1 }}
          />
        </div>

        {/* Swap to section */}
        <div className='mb-4 p-4 bg-white-100 dark:bg-gray-900 flex flex-col justify-center w-[344px] rounded-b-2xl'>
          <div className='flex justify-between'>
            <div
              className='bg-gray-50 dark:bg-gray-800 rounded-full flex items-center py-2 pl-3 pr-2 cursor-pointer'
              onClick={onTargetTokenClick}
            >
              {targetTokenIcon && <img src={targetTokenIcon} className='h-6 w-6 mr-1' />}
              <div className='text-black-100 dark:text-white-100 font-bold text-base pl-[4px] pr-[7px]'>
                {targetName}
              </div>
              <img src={Images.Misc.ArrowDown} />
            </div>
            <input
              placeholder='0'
              value={targetAmount}
              disabled={true}
              className='w-32 text-xl font-bold text-black-100 dark:text-white-100 dark:bg-gray-900 outline-none text-right'
              type='number'
            />
          </div>
          <p className='font-medium text-sm text-gray-600 dark:text-gray-300 text-right w-full'>
            {dollarValueDisplay}
          </p>
        </div>

        {/* Slippage and per unit cost estimates */}
        {amount &&
          name !== 'Select token' &&
          targetName !== 'Select token' &&
          Number(amount) > 0 &&
          Number(targetAmount) > 0 && (
            <div className='flex flex-row'>
              {/* amount per unit token indicator */}
              <div className='bg-white-100 dark:bg-gray-900 flex flex-row w-[206px] h-[56px] rounded-[8px] mb-[8px] px-[12px] py-[8px]'>
                <div className='flex flex-col justify-center'>
                  <img src={Images.Logos.JunoSwap} className='h-6 w-6 mr-[10px]' />
                </div>
                <div className='flex flex-col justify-center text-[12px]'>
                  <p>
                    <span className='font-bold text-black-100 dark:text-white-100'>
                      {targetUnitPrice} {targetName}
                    </span>{' '}
                    <span className='text-gray-400'>per {name}</span>
                  </p>
                  <p className='text-gray-400'>Juno Swap</p>
                </div>
              </div>
              {/* max slippage selector */}
              <div
                className='bg-white-100 dark:bg-gray-900 flex flex-row justify-between cursor-pointer w-[130px] h-[56px] rounded-[8px] mb-[8px] px-[12px] py-[8px] ml-[8px]'
                onClick={() => onSlippageClick()}
              >
                <div className='flex flex-col justify-center text-[12px]'>
                  <p>
                    <span className='text-gray-400'>Max slippage</span>
                  </p>
                  <p className='font-bold text-black-100 dark:text-white-100'>{slippage}%</p>
                </div>
                <div className='flex flex-col justify-center text-right text-gray-400'>
                  <span className='material-icons-round'>keyboard_arrow_right</span>
                </div>
              </div>
            </div>
          )}

        {/* Swap review buttons section */}
        <div className='text-center w-[344px]'>
          <div className='flex w-full shrink'>
            <Buttons.Generic
              size='normal'
              color={'#E18881'}
              onClick={() => {
                onReviewClick()
              }}
              disabled={
                isError ||
                !amount ||
                (amount ? (Number(amount) > 0 ? false : true) : false) ||
                targetName === name ||
                targetName == 'Select token' ||
                name == 'Select token' ||
                !isFeeAvailable
              }
            >
              Review Swap
            </Buttons.Generic>
          </div>
        </div>

        {/* Transaction fee information */}
        {amount &&
        name !== 'Select token' &&
        targetAmount != '0' &&
        targetName !== 'Select token' ? (
          <div className='mt-[20px] text-center w-[344px]'>
            <p className='font-bold text-black-100 dark:text-[#D6D6D6] text-sm'>
              Transaction Fee: {DEFAULT_SWAP_FEE} JUNO (${feeInCurrency})
            </p>
          </div>
        ) : null}
      </div>
    )
  },
)

SwapInput.displayName = 'SwapInput'

export default SwapInput
