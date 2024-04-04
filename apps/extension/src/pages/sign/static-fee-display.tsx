import {
  currencyDetail,
  fetchCurrency,
  useActiveChain,
  useChainId,
  useDefaultGasEstimates,
  useFeeTokens,
  useformatCurrency,
  useGetTokenBalances,
  useUserPreferredCurrency,
} from '@leapwallet/cosmos-wallet-hooks'
import { fromSmallBN, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { useQuery } from '@tanstack/react-query'
import BigNumber from 'bignumber.js'
import Tooltip from 'components/better-tooltip'
import Loader from 'components/loader/Loader'
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
  disableBalanceCheck?: boolean
}

const StaticFeeDisplay: React.FC<StaticFeeDisplayProps> = ({
  fee,
  error,
  setError,
  disableBalanceCheck,
}) => {
  const defaultGasEstimates = useDefaultGasEstimates()
  const [preferredCurrency] = useUserPreferredCurrency()
  const [formatCurrency] = useformatCurrency()
  const { allAssets, nativeTokensStatus, s3IbcTokensStatus, nonS3IbcTokensStatus } =
    useGetTokenBalances()
  const activeChain = useActiveChain()
  const chainId = useChainId()

  const { data: feeTokensList, isFetching } = useFeeTokens(activeChain)

  const feeToken = useMemo(() => {
    const feeBaseDenom = fee?.amount[0]?.denom
    const feeDenomData = feeTokensList?.find((token) => {
      return token.ibcDenom === feeBaseDenom || token.denom.coinMinimalDenom === feeBaseDenom
    })
    const amount = allAssets.find((asset) => {
      const denom = feeDenomData?.ibcDenom ?? feeDenomData?.denom.coinMinimalDenom
      if (asset.ibcDenom === denom) {
        return asset.ibcDenom === denom
      }
      return asset.coinMinimalDenom === denom
    })?.amount

    return { ...feeDenomData, amount }
  }, [allAssets, fee?.amount, feeTokensList])

  const { data: feeTokenFiatValue } = useQuery(
    ['fee-token-fiat-value', feeToken?.denom?.coinDenom],
    async () => {
      return fetchCurrency(
        '1',
        feeToken?.denom?.coinGeckoId ?? '',
        feeToken?.denom?.chain as SupportedChain,
        currencyDetail[preferredCurrency].currencyPointer,
        `${chainId}-${feeToken?.denom?.coinMinimalDenom}`,
      )
    },
  )

  const feeValues = useMemo(() => {
    if (!fee) return null
    return generateFeeValues(fee, feeToken?.denom?.coinDecimals ?? 0)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChain, defaultGasEstimates, fee, feeToken?.denom?.coinDecimals])

  useEffect(() => {
    const amountString = feeValues?.amount?.toString()
    if (!disableBalanceCheck && feeToken && amountString) {
      if (new BigNumber(amountString).isGreaterThan(feeToken?.amount ?? 0)) {
        setError(`You don't have enough ${feeToken?.denom?.coinDenom} to pay the gas fee`)
      } else {
        setError(null)
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feeToken, feeValues, disableBalanceCheck])

  if (
    isFetching ||
    nativeTokensStatus === 'loading' ||
    s3IbcTokensStatus === 'loading' ||
    nonS3IbcTokensStatus === 'loading'
  ) {
    return <Loader />
  }

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
          {feeValues.formattedAmount} {feeToken?.denom?.coinDenom}
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

export default React.memo(StaticFeeDisplay)
