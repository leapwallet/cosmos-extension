import {
  currencyDetail,
  fetchCurrency,
  useChainId,
  useformatCurrency,
  useGasAdjustmentForChain,
  useGetChains,
  useUserPreferredCurrency,
} from '@leapwallet/cosmos-wallet-hooks'
import { isSolanaChain, isSuiChain, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { CaretDown, GasPump } from '@phosphor-icons/react'
import { useQuery } from '@tanstack/react-query'
import classNames from 'classnames'
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

  const { gasLimit, value, feeTokenData, activeChain, selectedNetwork, computedGas } =
    useGasPriceContext()
  const chainId = useChainId(activeChain, selectedNetwork)
  const chainGasAdjustment = useGasAdjustmentForChain(activeChain)
  const chains = useGetChains()

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
      isSeiEvmTransaction: chains[activeChain]?.evmOnlyChain,
      isSolana: isSolanaChain(activeChain),
      isSui: isSuiChain(activeChain),
      computedGas,
    })

    return {
      value: amount.toNumber(),
      formattedAmount: isVerySmallAmount ? '< 0.00001' : formattedAmount,
      fiatValue: feeTokenFiatValue ? formatCurrency(amount.multipliedBy(feeTokenFiatValue)) : '',
    }
  }, [
    gasLimit,
    feeTokenData.denom,
    value.gasPrice.amount,
    chainGasAdjustment,
    chains,
    activeChain,
    feeTokenFiatValue,
    formatCurrency,
    computedGas,
  ])

  useEffect(() => {
    setDisplayFeeValue?.(displayFee)
  }, [displayFee, setDisplayFeeValue])

  return (
    <div
      className={classNames(
        'flex gap-1 items-center justify-center text-gray-600 dark:text-gray-200',
        className,
      )}
    >
      <GasPump size={16} className='text-secondary-800' />
      <button
        className='flex items-center ml-1 shrink-0'
        onClick={() => (setShowFeesSettingSheet ? setShowFeesSettingSheet(true) : undefined)}
        data-testing-id='send-tx-fee-text'
      >
        <p className='font-medium text-center text-xs text-secondary-800 !leading-[16.2px]'>
          {displayFee.formattedAmount} {feeTokenData.denom.coinDenom}
          {'  '}
          <span className='text-muted-foreground'>
            {displayFee.fiatValue ? `(${displayFee.fiatValue})` : null}
          </span>
        </p>
        {setShowFeesSettingSheet && <CaretDown size={16} className='ml-1 text-muted-foreground' />}
      </button>
    </div>
  )
}
