import { StdFee } from '@cosmjs/stargate'
import {
  formatBigNumber,
  useActiveChain,
  useChainInfo,
  useDenoms,
} from '@leapwallet/cosmos-wallet-hooks'
import { Buttons, CardDivider } from '@leapwallet/leap-ui'
import { BigNumber } from 'bignumber.js'
import classNames from 'classnames'
import { AutoAdjustAmountSheet } from 'components/auto-adjust-amount-sheet'
import ClickableIcon from 'components/clickable-icons'
import { DisplayFee } from 'components/gas-price-options/display-fee'
import { FeesSettingsSheet } from 'components/gas-price-options/fees-settings-sheet'
import { Images } from 'images'
import { getSwapProviderImage } from 'images/logos'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Colors } from 'theme/colors'

import { useSwapContext } from '../swap-context'
import { SwapSheet } from '../types'

function getTextSize(amountValue: string | undefined) {
  const amountValueLength = amountValue?.length ?? 6

  if (amountValueLength > 17) return 'text-xs'
  if (amountValueLength > 14) return 'text-sm'
  if (amountValueLength > 10) return 'text-md'

  return 'text-xl'
}

function getLabelSize(size: number) {
  if (size > 15) return 'text-[10px]'
  if (size > 10) return 'text-xs'
  return 'text-sm'
}

interface propTypes {
  setStep: React.Dispatch<React.SetStateAction<SwapSheet>>
  showFeesSettingSheet: boolean
  setShowFeesSettingSheet: React.Dispatch<React.SetStateAction<boolean>>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setDisplayFeeValue: React.Dispatch<React.SetStateAction<any>>
  gasError: string | null
  customFee: StdFee
}

export default function SwapInput({
  setStep,
  showFeesSettingSheet,
  setShowFeesSettingSheet,
  setDisplayFeeValue,
  gasError,
  customFee,
}: propTypes) {
  const [checkForAutoAdjust, setCheckForAutoAdjust] = useState(false)
  const [wasAdjustedOnce, setWasAdjustedOnce] = useState(false)

  const [
    {
      amountValue,
      selectedToken,
      selectedTargetToken,
      selectedTokenUsdPrice,
      targetTokenUsdPrice,
      selectedTokenBalance,
      currentTokenPrice,
      unitConversionPrice,
      slippagePercentage,
      via,
    },
    swapperAction,
  ] = useSwapContext()

  const chainInfo = useChainInfo()

  const denoms = useDenoms()
  const activeChain = useActiveChain()

  const showAdjustmentSheet = useCallback(() => {
    setCheckForAutoAdjust(true)
  }, [])

  const hideAdjustmentSheet = useCallback(() => {
    setCheckForAutoAdjust(false)
  }, [])

  const selectedNativeDenom = denoms[selectedToken?.denom ?? '']

  const amountExceedsBalance = useMemo(() => {
    if (selectedToken && Number(amountValue) > Number(selectedTokenBalance)) {
      return true
    }
    return false
  }, [amountValue, selectedToken, selectedTokenBalance])

  useEffect(() => {
    // set this to false whenever the amount or token changes
    setWasAdjustedOnce(false)
  }, [amountValue, selectedToken])

  const showEstimates =
    amountValue &&
    selectedToken !== undefined &&
    selectedTargetToken !== undefined &&
    Number(amountValue) > 0 &&
    Number(currentTokenPrice) > 0

  const amountBN = new BigNumber(amountValue as string)

  const isReviewBtnDisabled =
    amountExceedsBalance ||
    !amountValue ||
    amountBN.isNaN() ||
    amountBN.lte(0) ||
    selectedTargetToken === undefined ||
    selectedToken === undefined ||
    selectedTargetToken.symbol === selectedToken.symbol

  const inputAmountValue = !amountValue ? NaN : Number(amountValue)
  const currentTokenPriceValue = currentTokenPrice?.toNumber() ?? NaN

  const fromTokenDecimalPlaces = denoms[selectedToken?.denom ?? '']?.coinDecimals ?? 6
  const selectedTokenBalanceBN = new BigNumber(selectedTokenBalance)
  const resultingAmount =
    currentTokenPrice?.multipliedBy(1 - slippagePercentage / 100)?.toFixed(12) ?? ''

  const autoAdjustSheetPreCondition =
    selectedToken && selectedNativeDenom && amountValue && customFee

  return (
    <div className='relative w-[400px] h-full'>
      <div className='flex flex-row justify-center pt-7'>
        <div>
          {/* Swap from section */}
          <div className='bg-white-100 dark:bg-gray-900 flex flex-col p-4 w-[344px] rounded-t-2xl'>
            <div className='flex w-full justify-between'>
              <div
                className='flex-shrink-0 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center py-2 pl-3 pr-2 cursor-pointer'
                onClick={() => setStep(SwapSheet.SELECT_TOKEN)}
              >
                {selectedToken?.image && (
                  <img
                    key={selectedToken.image}
                    src={selectedToken.image}
                    className='h-6 w-6 mr-1'
                  />
                )}
                <div className='text-black-100 dark:text-white-100 font-bold text-base pl-[4px] pr-[7px]'>
                  {selectedToken?.symbol ?? 'Select Token'}
                </div>
                <img src={Images.Misc.ArrowDown} />
              </div>
              <input
                placeholder='enter amount'
                value={amountValue}
                onChange={(e) => swapperAction.setAmountValue(e.target.value)}
                className={classNames(
                  'ml-1 w-full font-bold text-black-100 dark:text-white-100 dark:bg-gray-900 outline-none text-right',
                  getTextSize(amountValue),
                )}
                type='number'
              />
            </div>
            <div className='flex mt-2 w-full justify-between items-start'>
              <p
                className={classNames('font-bold', getLabelSize(fromTokenDecimalPlaces), {
                  'text-red-300': amountExceedsBalance,
                  'text-gray-400': !amountExceedsBalance,
                })}
              >
                {`${amountExceedsBalance ? 'Insufficient Funds' : 'Balance'}: ${
                  selectedTokenBalanceBN.isEqualTo(0)
                    ? '0'
                    : selectedTokenBalanceBN.toFixed(fromTokenDecimalPlaces).toString()
                } ${selectedToken?.symbol ?? ''}`}
              </p>
              <div className='flex flex-col self-end'>
                <p className='font-medium text-sm text-gray-600 dark:text-gray-300 text-right w-full'>
                  {selectedTokenUsdPrice === undefined
                    ? '-'
                    : `$ ${formatBigNumber(selectedTokenUsdPrice.multipliedBy(inputAmountValue))}`}
                </p>
                {!amountExceedsBalance && (
                  <button
                    className='bg-green-600/10 text-green-600 text-sm font-bold px-4 h-7 rounded-full justify-self-end mt-2'
                    onClick={swapperAction.setMaxAmount}
                  >
                    Swap all
                  </button>
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
              disabled={selectedToken === undefined || selectedTargetToken === undefined}
              onClick={swapperAction.interchangeTokens}
              style={{ zIndex: 1 }}
            />
          </div>

          {/* Swap to section */}
          <div className='mb-4 p-4 bg-white-100 dark:bg-gray-900 flex flex-col justify-center w-[344px] rounded-b-2xl'>
            <div className='flex justify-between'>
              <div
                className='bg-gray-50 dark:bg-gray-800 rounded-full flex items-center py-2 pl-3 pr-2 cursor-pointer'
                onClick={() => setStep(SwapSheet.SELECT_TARGET_TOKEN)}
              >
                {selectedTargetToken?.image && (
                  <img
                    key={selectedTargetToken.image}
                    src={selectedTargetToken.image}
                    className='h-6 w-6 mr-1'
                  />
                )}
                <div className='text-black-100 dark:text-white-100 font-bold text-base pl-[4px] pr-[7px]'>
                  {selectedTargetToken?.symbol ?? 'Select Token'}
                </div>
                <img src={Images.Misc.ArrowDown} />
              </div>
              <input
                placeholder='0'
                value={resultingAmount}
                disabled={true}
                className={`${getTextSize(
                  resultingAmount,
                )} w-40 font-bold text-black-100 dark:text-white-100 dark:bg-gray-900 outline-none text-right`}
                type='number'
              />
            </div>
            <p className='font-medium text-sm text-gray-600 dark:text-gray-300 text-right w-full'>
              {targetTokenUsdPrice === undefined
                ? '-'
                : `$ ${formatBigNumber(targetTokenUsdPrice.multipliedBy(currentTokenPriceValue))}`}
            </p>
          </div>

          {/* Slippage and per unit cost estimates */}
          {showEstimates && (
            <div className='flex flex-row'>
              {/* amount per unit token indicator */}
              <div className='bg-white-100 dark:bg-gray-900 flex flex-row w-[206px] h-[56px] rounded-lg mb-2 px-3 py-2'>
                <div className='flex flex-col justify-center'>
                  <img src={getSwapProviderImage(activeChain)} className='h-6 w-6 mr-[10px]' />
                </div>
                <div className='flex flex-col justify-center text-[12px]'>
                  <p>
                    <span className='font-bold text-black-100 dark:text-white-100'>
                      {`${formatBigNumber(unitConversionPrice)} ${selectedTargetToken.symbol}`}
                    </span>
                    <span className='text-gray-400 ml-1'>per {selectedToken.symbol}</span>
                  </p>
                  <p className='text-gray-400'>{via}</p>
                </div>
              </div>
              {/* max slippage selector */}
              <div
                className='bg-white-100 dark:bg-gray-900 flex flex-row justify-between cursor-pointer w-[130px] h-[56px] rounded-lg mb-2 px-3 py-2 ml-2'
                onClick={() => setStep(SwapSheet.REVIEW_SLIPPAGE)}
              >
                <div className='flex flex-col justify-center text-[12px]'>
                  <p>
                    <span className='text-gray-400'>Max slippage</span>
                  </p>
                  <p className='font-bold text-black-100 dark:text-white-100'>
                    {slippagePercentage}%
                  </p>
                </div>
                <div className='flex flex-col justify-center text-right text-gray-400'>
                  <span className='material-icons-round'>keyboard_arrow_right</span>
                </div>
              </div>
            </div>
          )}

          <DisplayFee
            className='mt-4'
            setShowFeesSettingSheet={setShowFeesSettingSheet}
            setDisplayFeeValue={setDisplayFeeValue}
          />

          <FeesSettingsSheet
            showFeesSettingSheet={showFeesSettingSheet}
            onClose={() => setShowFeesSettingSheet(false)}
            gasError={gasError}
          />

          {autoAdjustSheetPreCondition && checkForAutoAdjust ? (
            <AutoAdjustAmountSheet
              amount={amountValue}
              setAmount={(amount) => swapperAction.setAmountValue(amount)}
              selectedToken={{
                amount: selectedTokenBalance,
                coinMinimalDenom: selectedNativeDenom.coinMinimalDenom,
              }}
              fee={customFee.amount[0]}
              setShowReviewSheet={() => {
                setStep(SwapSheet.REVIEW_SWAP)
                setWasAdjustedOnce(true)
              }}
              closeAdjustmentSheet={hideAdjustmentSheet}
            />
          ) : null}

          {/* Swap review buttons section */}
          <div className='text-center w-[344px] mt-4'>
            <div className='flex w-full shrink'>
              <Buttons.Generic
                size='normal'
                color={chainInfo?.theme.primaryColor ?? Colors.cosmosPrimary}
                onClick={() => {
                  if (autoAdjustSheetPreCondition && !wasAdjustedOnce) {
                    showAdjustmentSheet()
                  } else {
                    setStep(SwapSheet.REVIEW_SWAP)
                  }
                }}
                disabled={isReviewBtnDisabled}
              >
                Review Swap
              </Buttons.Generic>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
