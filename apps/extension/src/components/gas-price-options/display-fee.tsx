import {
  currencyDetail,
  fetchCurrency,
  useChainId,
  useformatCurrency,
  useGasAdjustmentForChain,
  useUserPreferredCurrency,
} from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { useQuery } from '@tanstack/react-query'
import classNames from 'classnames'
import { Images } from 'images'
import React, { useEffect, useMemo } from 'react'

import { DisplayFeeValue, useGasPriceContext } from './context'
import { calculateFeeAmount } from './index'

type DisplayFeeProps = {
  className?: string
  // eslint-disable-next-line no-unused-vars
  setDisplayFeeValue?: (value: DisplayFeeValue) => void
  setShowFeesSettingSheet?: React.Dispatch<React.SetStateAction<boolean>>
  forceChain?: SupportedChain
}

export const DisplayFee: React.FC<DisplayFeeProps> = ({
  className,
  setShowFeesSettingSheet,
  setDisplayFeeValue,
}) => {
  const [formatCurrency] = useformatCurrency()
  const [preferredCurrency] = useUserPreferredCurrency()

  const { gasLimit, value, feeTokenData, activeChain, selectedNetwork } = useGasPriceContext()
  const chainId = useChainId(activeChain, selectedNetwork)
  const chainGasAdjustment = useGasAdjustmentForChain(activeChain)

  const { data: feeTokenFiatValue } = useQuery(
    ['fee-token-fiat-value', feeTokenData.denom.coinGeckoId],
    async () => {
      return fetchCurrency(
        '1',
        feeTokenData.denom.coinGeckoId,
        feeTokenData.denom.chain as SupportedChain,
        currencyDetail[preferredCurrency].currencyPointer,
        `${chainId}-${feeTokenData.denom.coinMinimalDenom}`,
      )
    },
  )
  const displayFee = useMemo(() => {
    const { amount, formattedAmount, isVerySmallAmount } = calculateFeeAmount({
      gasLimit,
      feeDenom: feeTokenData.denom,
      gasPrice: value.gasPrice.amount.toFloatApproximation(),
      gasAdjustment: chainGasAdjustment,
    })

    return {
      value: amount.toNumber(),
      formattedAmount: isVerySmallAmount ? '< 0.00001' : formattedAmount,
      fiatValue: feeTokenFiatValue ? formatCurrency(amount.multipliedBy(feeTokenFiatValue)) : '',
    }
  }, [
    gasLimit,
    feeTokenData,
    value.gasPrice.amount,
    chainGasAdjustment,
    feeTokenFiatValue,
    formatCurrency,
  ])

  useEffect(() => {
    setDisplayFeeValue?.(displayFee)
  }, [displayFee, setDisplayFeeValue])

  return (
    <div
      className={classNames(
        'flex items-center justify-center text-gray-600 dark:text-gray-200',
        className,
      )}
    >
      <p className='font-semibold text-center text-sm'>Transaction fee: </p>
      <button
        className='flex items-center ml-1'
        onClick={() => (setShowFeesSettingSheet ? setShowFeesSettingSheet(true) : undefined)}
        data-testing-id='send-tx-fee-text'
      >
        <p className='font-semibold text-center text-sm'>
          <strong>
            {displayFee.formattedAmount} {feeTokenData.denom.coinDenom}
          </strong>{' '}
          {displayFee.fiatValue ? `(${displayFee.fiatValue})` : null}
        </p>
        {setShowFeesSettingSheet && <img src={Images.Misc.ArrowDown} className='ml-1' />}
      </button>
    </div>
  )
}
