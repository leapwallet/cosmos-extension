import {
  currencyDetail,
  FeeTokenData,
  fetchCurrency,
  formatBigNumber,
  GasOptions,
  useActiveChain,
  useChainApis,
  useChainInfo,
  useChainsStore,
  useDefaultGasEstimates,
  useFeeTokens,
  useGasAdjustment,
  useGasPriceStepForChain,
  useGetTokenBalances,
  useLowGasPriceStep,
  useNativeFeeDenom,
} from '@leapwallet/cosmos-wallet-hooks'
import {
  axiosWrapper,
  DefaultGasEstimates,
  GasPrice,
  NativeDenom,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk'
import { useQuery } from '@tanstack/react-query'
import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import { ActionInputWithPreview } from 'components/action-input-with-preview'
import Tooltip from 'components/better-tooltip'
import { useFormatCurrency } from 'hooks/settings/useCurrency'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { Images } from 'images'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import { Colors } from 'theme/colors'
import { imgOnError } from 'utils/imgOnError'

import { GasPriceOptionsContext, GasPriceOptionsContextType, useGasPriceContext } from './context'
import { SelectTokenModal } from './select-token-modal'

export const useDefaultGasPrice = (options?: {
  activeChain?: SupportedChain
  selectedNetwork?: 'mainnet' | 'testnet'
  feeDenom?: NativeDenom
}) => {
  const lowGasPriceStep = useLowGasPriceStep()
  const nativeFeeDenom = useNativeFeeDenom(options?.activeChain, options?.selectedNetwork)

  const defaultPrice = useMemo(() => {
    const feeDenom = options?.feeDenom ?? nativeFeeDenom
    const amount = new BigNumber(lowGasPriceStep)

    return {
      gasPrice: GasPrice.fromUserInput(amount.toString(), feeDenom.coinMinimalDenom),
    }
  }, [options, nativeFeeDenom, lowGasPriceStep])

  return defaultPrice
}

export type GasPriceOptionsProps = React.PropsWithChildren & {
  className?: string
  recommendedGasLimit?: BigNumber | string
  gasLimit: BigNumber | string
  setGasLimit: React.Dispatch<React.SetStateAction<BigNumber | string>>
  recommendedGasPrice?: GasPrice
  gasPriceOption: GasPriceOptionsContextType['value']
  onGasPriceOptionChange: GasPriceOptionsContextType['onChange']
  error: string | null
  setError: React.Dispatch<React.SetStateAction<string | null>>
  initialFeeDenom?: string
  chain?: SupportedChain
  considerGasAdjustment?: boolean
  disableBalanceCheck?: boolean
}

const GasPriceOptions = ({
  gasPriceOption,
  onGasPriceOptionChange,
  initialFeeDenom,
  gasLimit,
  setGasLimit,
  recommendedGasLimit,
  className,
  children,
  error,
  setError,
  chain,
  considerGasAdjustment = true,
  disableBalanceCheck,
}: GasPriceOptionsProps) => {
  const [viewAdditionalOptions, setViewAdditionalOptions] = useState(false)

  const _activeChain = useActiveChain()
  const activeChain = chain ?? _activeChain

  const nonNativeTokenGasLimitMultiplier = useRef<number>(1)

  useEffect(() => {
    if (activeChain === 'osmosis') {
      nonNativeTokenGasLimitMultiplier.current = 1.25
    } else {
      nonNativeTokenGasLimitMultiplier.current = 1.05
    }
  }, [activeChain])

  const { chains } = useChainsStore()
  const chainInfo = chains[activeChain]
  const defaultGasEstimates = useDefaultGasEstimates()
  const gasAdjustment = useGasAdjustment()

  const { data: feeTokensList, isLoading: isFeeTokensListLoading } = useFeeTokens(activeChain)

  const chainNativeFeeTokenData = useMemo(() => feeTokensList[0], [feeTokensList])

  const feeIbcDenomTrackerRef = useRef<{
    current: string
    previous: string | null
  }>({
    current: chainNativeFeeTokenData.ibcDenom,
    previous: null,
  })

  const [userHasSelectedToken, setUserHasSelectedToken] = useState<boolean>(false)
  const [feeTokenData, setFeeTokenData] = useState<FeeTokenData>(() => {
    const dappFeeDenomData = feeTokensList.find((a) => a.ibcDenom === initialFeeDenom)
    return dappFeeDenomData ?? chainNativeFeeTokenData
  })

  const { allAssets: allTokens, ibcTokensStatus, nativeTokensStatus } = useGetTokenBalances()

  const feeTokenAsset = useMemo(() => {
    return allTokens.find((token) => {
      if (token.ibcDenom) {
        if (chainInfo?.beta) {
          return Object.values(chainInfo.nativeDenoms).find(
            (nativeCoinDenom) => nativeCoinDenom.coinMinimalDenom === token.coinMinimalDenom,
          )
        }
        return token.ibcDenom === feeTokenData.ibcDenom
      } else {
        if (chainInfo?.beta) {
          return Object.values(chainInfo.nativeDenoms).find(
            (nativeCoinDenom) => nativeCoinDenom.coinMinimalDenom === token.coinMinimalDenom,
          )
        }
        return token.coinMinimalDenom === feeTokenData.denom.coinMinimalDenom
      }
    })
  }, [allTokens, chainInfo?.beta, chainInfo?.nativeDenoms, feeTokenData])

  const allTokensStatus = useMemo(() => {
    if (nativeTokensStatus === 'success' && ibcTokensStatus === 'success') {
      return 'success'
    }
    if (nativeTokensStatus === 'loading' || ibcTokensStatus === 'loading') {
      return 'loading'
    }
    return 'error'
  }, [ibcTokensStatus, nativeTokensStatus])

  const [finalRecommendedGasLimit, setFinalRecommendedGasLimit] = useState(() => {
    return (
      recommendedGasLimit?.toString() ??
      defaultGasEstimates[activeChain].DEFAULT_GAS_TRANSFER.toString() ??
      DefaultGasEstimates.DEFAULT_GAS_TRANSFER.toString()
    )
  })

  const isPayingFeeInNonNativeToken = feeTokenData.ibcDenom !== chainNativeFeeTokenData.ibcDenom

  useEffect(() => {
    if (recommendedGasLimit) {
      if (isPayingFeeInNonNativeToken) {
        setFinalRecommendedGasLimit(
          new BigNumber(recommendedGasLimit)
            .multipliedBy(nonNativeTokenGasLimitMultiplier.current)
            .toFixed(0),
        )
      } else {
        setFinalRecommendedGasLimit(recommendedGasLimit.toString())
      }
    }
  }, [isPayingFeeInNonNativeToken, recommendedGasLimit])

  useEffect(() => {
    feeIbcDenomTrackerRef.current.previous = feeIbcDenomTrackerRef.current.current
    feeIbcDenomTrackerRef.current.current = feeTokenData.ibcDenom

    if (
      feeIbcDenomTrackerRef.current.current !== chainNativeFeeTokenData.ibcDenom &&
      feeIbcDenomTrackerRef.current.previous === chainNativeFeeTokenData.ibcDenom
    ) {
      // if the user is paying with non-native token but previously had native token
      const newGasLimit = new BigNumber(gasLimit)
        .multipliedBy(nonNativeTokenGasLimitMultiplier.current)
        .toFixed(0)
      const newRecommendedGasLimit = new BigNumber(finalRecommendedGasLimit)
        .multipliedBy(nonNativeTokenGasLimitMultiplier.current)
        .toFixed(0)
      setGasLimit(newGasLimit)
      setFinalRecommendedGasLimit(newRecommendedGasLimit)
    } else if (
      feeIbcDenomTrackerRef.current.current === chainNativeFeeTokenData.ibcDenom &&
      feeIbcDenomTrackerRef.current.previous !== chainNativeFeeTokenData.ibcDenom
    ) {
      // if the user is paying with native token but previously had non-native token
      const newGasLimit = new BigNumber(gasLimit)
        .dividedBy(nonNativeTokenGasLimitMultiplier.current)
        .toFixed(0)
      setGasLimit(newGasLimit)
      const newRecommendedGasLimit = new BigNumber(finalRecommendedGasLimit)
        .dividedBy(nonNativeTokenGasLimitMultiplier.current)
        .toFixed(0)
      setGasLimit(newGasLimit)
      setFinalRecommendedGasLimit(newRecommendedGasLimit)
    }
  }, [
    chainNativeFeeTokenData.ibcDenom,
    feeTokenData.ibcDenom,
    setGasLimit,
    gasLimit,
    recommendedGasLimit,
    finalRecommendedGasLimit,
  ])

  useEffect(() => {
    if (nativeTokensStatus === 'loading') {
      return
    }

    const gasPriceBN = new BigNumber(gasPriceOption.gasPrice.amount.toFloatApproximation())
    // if the dapp has specified a fee granter or has set disableFeeCheck on SignOptions, the fees is being paid by the dapp we ignore the fee asset balance checks
    if (disableBalanceCheck || gasPriceBN.isZero()) {
      setError(null)
      return
    }
    if (!feeTokenAsset) {
      return setError(`You do not have any ${feeTokenData.denom.coinDenom} tokens`)
    }
    const isIbcDenom = !!feeTokenAsset?.ibcDenom
    const amount = gasPriceBN
      .multipliedBy(gasLimit)
      .multipliedBy(gasAdjustment)
      .dividedBy(10 ** feeTokenData.denom.coinDecimals)

    if (
      (isIbcDenom && feeTokenAsset.ibcDenom === feeTokenData.ibcDenom) ||
      feeTokenAsset.coinMinimalDenom === feeTokenData.denom.coinMinimalDenom
    ) {
      if (amount.isGreaterThan(feeTokenAsset.amount ?? 0)) {
        setError(
          `You don't have enough ${feeTokenData.denom.coinDenom.toUpperCase()} to pay gas fees`,
        )
      } else {
        setError(null)
      }
    }
  }, [
    feeTokenAsset,
    feeTokenData,
    gasAdjustment,
    gasLimit,
    gasPriceOption.gasPrice.amount,
    gasPriceOption.gasPrice.denom,
    nativeTokensStatus,
    setError,
    disableBalanceCheck,
  ])

  // if recommended gas limit updates, set the gas limit to the recommended gas limit
  useEffect(() => {
    if (recommendedGasLimit) {
      setGasLimit(recommendedGasLimit.toString())
    }
    // if you add setGasLimit to the dependency array, its triggered when not needed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recommendedGasLimit])

  useEffect(() => {
    setFeeTokenData(chainNativeFeeTokenData)
  }, [chainNativeFeeTokenData])

  useEffect(() => {
    if (isFeeTokensListLoading || !initialFeeDenom || userHasSelectedToken) {
      return
    }
    const foundFeeTokenData = feeTokensList.find((token) => token.ibcDenom === initialFeeDenom)
    if (foundFeeTokenData) {
      setFeeTokenData(foundFeeTokenData)
    }
  }, [feeTokensList, initialFeeDenom, isFeeTokensListLoading, userHasSelectedToken])

  if (!feeTokenData) return null

  return (
    <div className={className}>
      <GasPriceOptionsContext.Provider
        value={{
          value: gasPriceOption,
          onChange: onGasPriceOptionChange,
          feeTokenData,
          setFeeTokenData,
          gasLimit,
          setGasLimit,
          recommendedGasLimit: finalRecommendedGasLimit,
          viewAdditionalOptions,
          setViewAdditionalOptions,
          error,
          setError,
          feeTokenAsset,
          allTokens,
          allTokensStatus,
          userHasSelectedToken,
          setUserHasSelectedToken,
          considerGasAdjustment: considerGasAdjustment,
        }}
      >
        {children}
      </GasPriceOptionsContext.Provider>
    </div>
  )
}

export const calculateFeeAmount = ({
  gasPrice,
  gasLimit,
  feeDenom,
  gasAdjustment,
}: {
  gasPrice: BigNumber.Value
  gasLimit: BigNumber.Value
  feeDenom: NativeDenom
  gasAdjustment: number
}) => {
  const gasPriceBN = new BigNumber(gasPrice)

  const amount = gasPriceBN
    .multipliedBy(gasAdjustment)
    .multipliedBy(gasLimit)
    .dividedBy(10 ** feeDenom.coinDecimals)

  return {
    amount,
    formattedAmount: amount.isEqualTo(0) ? '0' : amount.toFormat(5, BigNumber.ROUND_DOWN),
    isVerySmallAmount: amount.isLessThan('0.00001') && !amount.isEqualTo(0),
  } as const
}

GasPriceOptions.Selector = function Selector({
  className,
  preSelected = true,
}: {
  className?: string
  preSelected?: boolean
}) {
  const { value, onChange, gasLimit, feeTokenData, considerGasAdjustment } = useGasPriceContext()
  const activeChain = useActiveChain()

  const defaultGasEstimates = useDefaultGasEstimates()
  const [formatCurrency, preferredCurrency] = useFormatCurrency()
  const gasAdjustment = useGasAdjustment()

  const { data: feeTokenFiatValue } = useQuery(
    ['fee-token-fiat-value', feeTokenData.denom.coinGeckoId],
    async () => {
      return fetchCurrency(
        '1',
        feeTokenData.denom.coinGeckoId,
        feeTokenData.denom.chain as SupportedChain,
        currencyDetail[preferredCurrency].currencyPointer,
      )
    },
  )

  useEffect(() => {
    // trigger onChange after first render
    if (feeTokenData && !value && preSelected) {
      onChange(
        {
          option: GasOptions.LOW,
          gasPrice: GasPrice.fromUserInput(
            feeTokenData.gasPriceStep.low.toString(),
            feeTokenData.ibcDenom,
          ),
        },
        feeTokenData,
      )
    }

    if (feeTokenData && !value && !preSelected) {
      onChange(
        {
          option: '' as GasOptions,
          gasPrice: GasPrice.fromUserInput(
            feeTokenData.gasPriceStep.low.toString(),
            feeTokenData.ibcDenom,
          ),
        },
        feeTokenData,
      )
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <div
        className={classNames(
          'rounded-2xl bg-transparent border border-gray-300 dark:border-gray-800 p-1 grid grid-cols-3',
          className,
        )}
      >
        {Object.entries(feeTokenData.gasPriceStep).map(([level, gasPrice]) => {
          const isSelected = value.option === level
          const gasPriceBN = new BigNumber(gasPrice)
          const estimatedGasLimit =
            gasLimit ??
            defaultGasEstimates[activeChain].DEFAULT_GAS_TRANSFER ??
            DefaultGasEstimates.DEFAULT_GAS_TRANSFER
          const { amount, formattedAmount, isVerySmallAmount } = calculateFeeAmount({
            gasPrice: gasPriceBN,
            gasLimit: estimatedGasLimit,
            feeDenom: feeTokenData.denom,
            gasAdjustment: considerGasAdjustment ? gasAdjustment : 1,
          })
          const amountInFiat = feeTokenFiatValue
            ? new BigNumber(amount).multipliedBy(feeTokenFiatValue)
            : null
          const handleChange = () => {
            onChange(
              {
                option: level as GasOptions,
                gasPrice: GasPrice.fromUserInput(gasPrice.toString(), feeTokenData.ibcDenom),
              },
              feeTokenData,
            )
          }

          return (
            <label
              id={`gas-option-${level}`}
              key={level}
              className={`relative flex flex-col justify-center items-center w-full h-full rounded-xl cursor-pointer p-2 transition-colors ${
                isSelected ? 'bg-gray-100 dark:bg-gray-800' : ''
              }`}
              title={
                amountInFiat
                  ? `${currencyDetail[preferredCurrency].symbol} ${amountInFiat.toFixed(8)}`
                  : level
              }
            >
              <input
                type='radio'
                className='opacity-0 absolute'
                name='fee'
                value={level}
                checked={isSelected}
                onChange={handleChange}
                onClick={handleChange}
              />
              <span
                className={`text-gray-900 dark:text-gray-200 capitalize text-sm font-bold transition-all text-center ${
                  isSelected ? 'dark:brightness-200 brightness-50' : ''
                }`}
              >
                {level}
              </span>
              <span
                className={`text-gray-700 transition-all text-center mt-[2px] ${
                  isSelected ? 'dark:brightness-200 brightness-50' : ''
                } ${formattedAmount.length > 4 ? 'text-[10px]' : 'text-xs'}`}
              >
                {isVerySmallAmount ? '< 0.00001' : formattedAmount} {feeTokenData.denom.coinDenom}
              </span>
              {amountInFiat ? (
                <span
                  className={`text-gray-700 text-xs transition-all text-center ${
                    isSelected ? 'dark:brightness-200 brightness-50' : ''
                  }`}
                >
                  {formatCurrency(amountInFiat)}
                </span>
              ) : null}
            </label>
          )
        })}
      </div>
    </>
  )
}

GasPriceOptions.AdditionalSettingsToggle = function AdditionalSettingsToggle({
  children,
  className,
}: {
  // eslint-disable-next-line no-unused-vars
  children?: (isOpen: boolean) => JSX.Element
  className?: string
}) {
  const { viewAdditionalOptions, setViewAdditionalOptions } = useGasPriceContext()

  return (
    <button
      className={classNames('rounded-full flex items-center justify-center p-1', className)}
      title='Additional Settings'
      onClick={() => {
        setViewAdditionalOptions((v) => !v)
      }}
    >
      {children?.(viewAdditionalOptions) ?? viewAdditionalOptions ? (
        <div className='flex w-full'>
          <p className='ml-auto dark:text-white-100 text-gray-900 text-xs'>
            Hide additional settings
          </p>
          <img src={Images.Misc.RemoveCircle} alt='Close Settings' className='ml-2' />
        </div>
      ) : (
        <div className='flex w-full'>
          <p className='ml-auto dark:text-white-100 text-gray-900 text-xs'>
            Show additional settings
          </p>
          <img src={Images.Misc.AddCircle} alt='Open Settings' className='ml-2' />
        </div>
      )}
    </button>
  )
}

const isGasLimitInvalid = (_limit: string) => {
  const limit = new BigNumber(_limit)
  return limit.isNaN() || limit.isLessThan(0) || !limit.isInteger()
}

GasPriceOptions.AdditionalSettings = function AdditionalSettings({
  className,
  showGasLimitWarning,
}: {
  className?: string
  showGasLimitWarning?: boolean
}) {
  const [showTokenSelectSheet, setShowTokenSelectSheet] = useState(false)
  const [inputTouched, setInputTouched] = useState(false)
  const activeChain = useActiveChain()

  // hardcoded
  const baseGasPriceStep = useGasPriceStepForChain(activeChain)
  const { lcdUrl } = useChainApis(activeChain)

  const ref = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const activeChainInfo = useChainInfo()

  const {
    feeTokenData,
    setFeeTokenData,
    viewAdditionalOptions,
    value,
    feeTokenAsset,
    allTokens,
    setError,
    gasLimit,
    setGasLimit,
    recommendedGasLimit,
    allTokensStatus,
    setUserHasSelectedToken,
    userHasSelectedToken,
    considerGasAdjustment,
  } = useGasPriceContext()

  const defaultTokenLogo = useDefaultTokenLogo()
  const gasAdjustment = useGasAdjustment()

  const [gasLimitInputValue, setGasLimitInputValue] = useState(() => {
    const limit = gasLimit.toString() || recommendedGasLimit?.toString() || '100000'
    return Math.round(Number(limit) * (considerGasAdjustment ? gasAdjustment : 1)).toString()
  })

  const { data: feeTokensList, isLoading } = useFeeTokens(activeChainInfo.key)

  const eligibleFeeTokens = useMemo(() => {
    return allTokens.filter((token) => {
      return feeTokensList?.find((feeToken) => {
        // is token ibc?
        if (token.ibcDenom) {
          return feeToken.ibcDenom === token.ibcDenom
        }
        return feeToken.denom.coinMinimalDenom === token.coinMinimalDenom
      })
    })
  }, [allTokens, feeTokensList])

  useEffect(() => {
    setGasLimitInputValue(
      Math.round(Number(gasLimit) * (considerGasAdjustment ? gasAdjustment : 1)).toString(),
    )
  }, [considerGasAdjustment, gasAdjustment, gasLimit])

  useEffect(() => {
    if (viewAdditionalOptions) {
      ref.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [viewAdditionalOptions])

  useEffect(() => {
    if (isGasLimitInvalid(gasLimitInputValue)) {
      setError('Gas limit is invalid')
    } else {
      setError(null)
    }
  }, [gasLimitInputValue, setError])

  useEffect(() => {
    const input = inputRef.current
    if (!input) {
      return
    }
    const handleInputValueChange = (e: Event) => {
      const value = (e.target as HTMLInputElement).value
      const _gasLimitInt = parseInt(value, 10) / (considerGasAdjustment ? gasAdjustment : 1)
      const _gasLimit = Math.round(_gasLimitInt).toString()
      if (!isGasLimitInvalid(gasLimitInputValue) && _gasLimit !== recommendedGasLimit) {
        setGasLimit(_gasLimit)
      }
    }
    input.addEventListener('change', handleInputValueChange)
    return () => {
      input.removeEventListener('change', handleInputValueChange)
    }
  }, [considerGasAdjustment, gasAdjustment, gasLimitInputValue, recommendedGasLimit, setGasLimit])

  useEffect(() => {
    const handleTouch = () => {
      setInputTouched(true)
    }
    const input = inputRef.current
    if (!input || inputTouched) {
      return
    }
    input.addEventListener('click', handleTouch, {
      once: true,
    })
    return () => {
      input.removeEventListener('click', handleTouch)
    }
  }, [feeTokenAsset, inputTouched, viewAdditionalOptions])

  if (!feeTokenAsset) {
    if (allTokensStatus === 'error') {
      return (
        <div className='w-full z-0 mt-3'>
          <p className='text-sm dark:text-gray-400 text-gray-700 mt-3'>
            Failed to load your tokens, please reload the extension and try again
          </p>
        </div>
      )
    }
    if (allTokensStatus === 'loading' && viewAdditionalOptions) {
      return (
        <div className='w-full z-0 mt-3'>
          <div className='flex w-full justify-between items-center'>
            <Skeleton className='rounded-full h-10 w-20 bg-gray-50 dark:bg-gray-800' />
            <Skeleton className='rounded-full h-5 w-32 bg-gray-50 dark:bg-gray-800' />
          </div>
          <Skeleton className='rounded-lg h-10 bg-gray-50 dark:bg-gray-800 w-full mt-3' />
        </div>
      )
    }
    if (allTokensStatus === 'success' && viewAdditionalOptions) {
      return (
        <div className='w-full z-0 mt-3'>
          <p className='text-sm dark:text-gray-400 text-gray-700 mt-3'>
            You do not have any tokens that can be used to pay transaction fees.
          </p>
        </div>
      )
    }
    return null
  }

  const onlySingleFeeToken = feeTokensList?.length === 1

  const handleTokenSelect = async (selectedMinimalDenom: string) => {
    let selectedFeeTokenData = feeTokensList.find(
      (feeToken) => feeToken.denom.coinMinimalDenom === selectedMinimalDenom,
    )

    if (
      activeChain === 'osmosis' &&
      selectedFeeTokenData &&
      selectedFeeTokenData.ibcDenom !== 'uosmo'
    ) {
      try {
        const priceInfo = await axiosWrapper({
          baseURL: lcdUrl,
          method: 'get',
          url: `/osmosis/txfees/v1beta1/spot_price_by_denom?denom=${encodeURIComponent(
            selectedFeeTokenData?.ibcDenom ?? '',
          )}`,
        })

        const priceRatio = new BigNumber(1).dividedBy(priceInfo.data.spot_price)

        const gasPriceStep = {
          low: priceRatio.multipliedBy(baseGasPriceStep.low).multipliedBy(1.05).toNumber(),
          medium: priceRatio.multipliedBy(baseGasPriceStep.medium).multipliedBy(1.05).toNumber(),
          high: priceRatio.multipliedBy(baseGasPriceStep.high).multipliedBy(1.05).toNumber(),
        }

        selectedFeeTokenData = {
          ...selectedFeeTokenData,
          gasPriceStep,
        }
      } catch (error) {
        //
      }
    }

    if (selectedFeeTokenData) {
      setFeeTokenData(selectedFeeTokenData)
      setError(null)
      if (!userHasSelectedToken) {
        setUserHasSelectedToken(true)
      }
      setTimeout(() => {
        document.getElementById(`gas-option-${value.option}`)?.click()
      }, 50)
    } else {
      setError('Unable to calculate gas price for selected token')
    }
  }

  return viewAdditionalOptions ? (
    <>
      <div
        ref={ref}
        className={classNames('dark:bg-[#141414] bg-white-100 p-4 rounded-xl', className)}
      >
        <p className='text-sm dark:text-gray-400 text-gray-700'>
          {onlySingleFeeToken
            ? 'You are paying fees transaction fees in'
            : 'Choose a token for paying transaction fees'}
        </p>
        <div className='flex items-center justify-between mt-3'>
          <button
            className={`rounded-full flex items-center py-2 pl-3 pr-2 cursor-pointer disabled:cursor-default ${
              onlySingleFeeToken
                ? 'bg-white-100 dark:bg-[#141414] border border-gray-300 dark:border-gray-800'
                : 'bg-gray-50 dark:bg-gray-800'
            }`}
            disabled={isLoading || onlySingleFeeToken}
            onClick={() => {
              setShowTokenSelectSheet(true)
            }}
          >
            <img
              src={feeTokenData.denom.icon ?? defaultTokenLogo}
              onError={imgOnError(defaultTokenLogo)}
              className='h-6 w-6 mr-1'
            />
            <p className='text-black-100 dark:text-white-100 font-bold text-base mr-2'>
              {feeTokenData.denom.coinDenom}
            </p>
            {isLoading || onlySingleFeeToken ? null : <img src={Images.Misc.ArrowDown} />}
          </button>
          <p
            className='text-sm text-gray-700 dark:text-gray-400 font-bold'
            title={`${new BigNumber(feeTokenAsset?.amount ?? '0').decimalPlaces(
              feeTokenData.denom.coinDecimals ?? 6,
            )} ${feeTokenData.denom.coinDenom}`}
          >
            Balance: {formatBigNumber(new BigNumber(feeTokenAsset?.amount ?? '0'))}{' '}
            {feeTokenData.denom.coinDenom}
          </p>
        </div>
        <div className='mt-4'>
          <div className='flex items-center'>
            <p className='dark:text-gray-400 text-gray-700 text-sm font-medium tracking-wide'>
              Gas Limit
            </p>
            <Tooltip
              content={
                <p className='text-gray-500 dark:text-gray-100 text-sm'>
                  The computation effort (gas) you are willing to spend on this transaction
                </p>
              }
            >
              <div className='relative ml-2'>
                <img src={Images.Misc.InfoCircle} alt='Hint' />
              </div>
            </Tooltip>
          </div>
          <div className='flex items-center mt-2'>
            <ActionInputWithPreview
              ref={inputRef}
              action='reset'
              buttonText='Reset'
              buttonTextColor={Colors.getChainColor(activeChain)}
              value={gasLimitInputValue}
              invalid={isGasLimitInvalid(gasLimitInputValue)}
              onAction={() => {
                setGasLimit(recommendedGasLimit)
              }}
              onChange={(e) => {
                setGasLimitInputValue(e.target.value)
              }}
            />
          </div>
          {showGasLimitWarning &&
          inputTouched &&
          new BigNumber(gasLimitInputValue).isLessThan(
            Math.round(Number(recommendedGasLimit) * (considerGasAdjustment ? gasAdjustment : 1)),
          ) ? (
            <p className='text-orange-500 text-xs font-medium mt-2 ml-1'>
              We recommend using the default gas limit.
            </p>
          ) : null}
        </div>
      </div>
      <SelectTokenModal
        isOpen={showTokenSelectSheet}
        assets={eligibleFeeTokens}
        selectedToken={feeTokenAsset}
        onClose={() => setShowTokenSelectSheet(false)}
        onTokenSelect={handleTokenSelect}
      />
    </>
  ) : null
}

export default GasPriceOptions
