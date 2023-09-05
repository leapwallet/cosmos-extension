import {
  currencyDetail,
  fetchCurrency,
  useActiveChain,
  useDefaultGasEstimates,
  useformatCurrency,
  useGetTokenBalances,
  useNativeFeeDenom,
  useUserPreferredCurrency,
} from '@leapwallet/cosmos-wallet-hooks'
import { fromSmallBN, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { useQuery } from '@tanstack/react-query'
import BigNumber from 'bignumber.js'
import Tooltip from 'components/better-tooltip'
import { Fee } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
import { Warning } from 'images/misc'
import React, { useEffect, useMemo } from 'react'

const generateFeeValues = (fee: Fee, coinDecimals: number) => {
  const { amount } = fee
  const x = amount[0]?.amount ?? ''

  const amountBN = fromSmallBN(new BigNumber(x).toString(), coinDecimals)

  const formattedAmount = amountBN.toFormat(5, BigNumber.ROUND_DOWN)
  const isVerySmallAmount = amountBN.isLessThan('0.00001')

  return {
    amount: amountBN,
    formattedAmount: isVerySmallAmount && !amountBN.isEqualTo(0) ? '< 0.00001' : formattedAmount,
  }
}

type StaticFeeDisplayProps = {
  fee: Fee | null
  error: string | null
  setError: React.Dispatch<React.SetStateAction<string | null>>
}

const StaticFeeDisplay: React.FC<StaticFeeDisplayProps> = ({ fee, error, setError }) => {
  const defaultGasEstimates = useDefaultGasEstimates()
  const [preferredCurrency] = useUserPreferredCurrency()
  const [formatCurrency] = useformatCurrency()
  const { allAssets } = useGetTokenBalances()
  const activeChain = useActiveChain()

  const feeDenom = useNativeFeeDenom()

  const feeToken = useMemo(() => {
    return allAssets.find((asset) => asset.coinMinimalDenom === feeDenom.coinMinimalDenom)
  }, [allAssets, feeDenom.coinMinimalDenom])

  const { data: feeTokenFiatValue } = useQuery(
    ['fee-token-fiat-value', feeDenom.coinDenom],
    async () => {
      return fetchCurrency(
        '1',
        feeDenom.coinGeckoId,
        feeDenom.chain as SupportedChain,
        currencyDetail[preferredCurrency].currencyPointer,
      )
    },
  )

  const feeValues = useMemo(() => {
    if (!fee) return null
    return generateFeeValues(fee, feeDenom.coinDecimals)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChain, defaultGasEstimates, fee, feeDenom.coinDecimals])

  const amountString = feeValues?.amount?.toString()

  useEffect(() => {
    if (feeToken && amountString) {
      if (new BigNumber(amountString).isGreaterThan(feeToken?.amount ?? 0)) {
        setError(`You don't have enough ${feeToken.symbol} to pay the gas fee`)
      } else {
        setError(null)
      }
    }
  }, [amountString, feeToken, setError])

  return feeValues ? (
    <div>
      <p className='text-gray-500 dark:text-gray-100 text-sm font-medium tracking-wide flex items-center'>
        <span className='mr-3'>Transaction Fee</span>
        <Tooltip
          content={
            <p className='text-gray-700 dark:text-white-100 text-sm font-medium tracking-wide'>
              This dApp does not allow you to edit the transaction fee.
            </p>
          }
        >
          <div className='inline relative'>
            <img src={Warning} alt='Get more context' className='h-5 w-5' />
          </div>
        </Tooltip>
      </p>
      <p className='text-gray-700 dark:text-white-100 text-sm font-medium tracking-wide mt-2'>
        <span className='mt-[2px] mr-[2px]'>
          {feeValues.formattedAmount} {feeDenom.coinDenom}
        </span>
        {feeTokenFiatValue ? (
          <span className='mr-[2px]'>
            ({formatCurrency(new BigNumber(feeValues?.amount ?? 0).multipliedBy(feeTokenFiatValue))}
            )
          </span>
        ) : null}
      </p>
      {error ? <p className='text-red-300 text-sm font-medium mt-2 px-1'>{error}</p> : null}
    </div>
  ) : null
}

export default StaticFeeDisplay
