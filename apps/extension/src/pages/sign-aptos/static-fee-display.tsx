import { StdFee } from '@cosmjs/stargate'
import {
  currencyDetail,
  fetchCurrency,
  SelectedNetworkType,
  useChainId,
  useDefaultGasEstimates,
  useUserPreferredCurrency,
} from '@leapwallet/cosmos-wallet-hooks'
import { fromSmallBN, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { FeeTokensStoreData, RootBalanceStore } from '@leapwallet/cosmos-wallet-store'
import { useQuery } from '@tanstack/react-query'
import BigNumber from 'bignumber.js'
import Tooltip from 'components/better-tooltip'
import { useFormatCurrency } from 'hooks/settings/useCurrency'
import { Warning } from 'images/misc'
import { observer } from 'mobx-react-lite'
import React, { useEffect, useMemo } from 'react'

const generateFeeValues = (fee: StdFee, coinDecimals: number) => {
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
  fee: StdFee | undefined
  error: string | null
  setError: React.Dispatch<React.SetStateAction<string | null>>
  disableBalanceCheck?: boolean
  rootBalanceStore: RootBalanceStore
  activeChain: SupportedChain
  selectedNetwork: SelectedNetworkType
  feeTokensList: FeeTokensStoreData | null | undefined
}

const StaticFeeDisplay: React.FC<StaticFeeDisplayProps> = observer(
  ({
    fee,
    error,
    setError,
    disableBalanceCheck,
    rootBalanceStore,
    activeChain,
    selectedNetwork,
    feeTokensList,
  }) => {
    const defaultGasEstimates = useDefaultGasEstimates()
    const [preferredCurrency] = useUserPreferredCurrency()

    const allAssets = rootBalanceStore.getSpendableBalancesForChain(activeChain, selectedNetwork)
    const allTokensLoading = rootBalanceStore.getLoadingStatusForChain(activeChain, selectedNetwork)
    const allTokensStatus = useMemo(() => {
      return allTokensLoading ? 'loading' : 'success'
    }, [allTokensLoading])

    const chainId = useChainId()
    const [formatCurrency] = useFormatCurrency()

    const feeToken = useMemo(() => {
      const feeBaseDenom = fee?.amount[0]?.denom
      const feeDenomData = feeTokensList?.find((token) => {
        if (token.ibcDenom) {
          return token.ibcDenom === feeBaseDenom
        }
        return token.denom.coinMinimalDenom === feeBaseDenom
      })
      const amount = allAssets.find((asset) => {
        if (feeDenomData?.ibcDenom || asset?.ibcDenom) {
          return asset?.ibcDenom === feeDenomData?.ibcDenom
        }
        return asset?.coinMinimalDenom === feeDenomData?.denom?.coinMinimalDenom
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
      if (!disableBalanceCheck && amountString && allTokensStatus !== 'loading') {
        if (new BigNumber(amountString).isGreaterThan(feeToken?.amount ?? 0)) {
          setError(`You don't have enough ${feeToken?.denom?.coinDenom} to pay the gas fee`)
        } else {
          setError(null)
        }
      }

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [feeToken, feeValues, allTokensStatus, disableBalanceCheck])

    // if (
    //   isFetching ||
    //   nativeTokensStatus === 'loading' ||
    //   s3IbcTokensStatus === 'loading' ||
    //   nonS3IbcTokensStatus === 'loading'
    // ) {
    //   return <Loader />
    // }

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
              (
              {formatCurrency(
                new BigNumber(feeValues?.amount ?? 0).multipliedBy(feeTokenFiatValue),
              )}
              )
            </span>
          ) : null}
        </p>
        {error ? <p className='text-red-300 text-sm font-medium mt-2 px-1'>{error}</p> : null}
      </div>
    ) : null
  },
)

export default StaticFeeDisplay
