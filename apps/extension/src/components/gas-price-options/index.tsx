import { StdFee } from '@cosmjs/stargate'
import {
  currencyDetail,
  FeeTokenData,
  fetchCurrency,
  formatBigNumber,
  GasOptions,
  GasPriceStep,
  getGasPricesForOsmosisFee,
  SelectedNetworkType,
  Token,
  useActiveChain,
  useChainApis,
  useChainId,
  useChainInfo,
  useChainsStore,
  useDefaultGasEstimates,
  useFeeTokens,
  useGasAdjustmentForChain,
  useGasPriceStepForChain,
  useGetAptosGasPrices,
  useGetChains,
  useGetEvmGasPrices,
  useGetFeeMarketGasPricesSteps,
  useHasToCalculateDynamicFee,
  useIsSeiEvmChain,
  useLowGasPriceStep,
  useNativeFeeDenom,
  useSeiLinkedAddressState,
  useSelectedNetwork,
} from '@leapwallet/cosmos-wallet-hooks'
import {
  DefaultGasEstimates,
  DenomsRecord,
  GasPrice,
  isAptosChain,
  NativeDenom,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk'
import { RootBalanceStore, RootDenomsStore } from '@leapwallet/cosmos-wallet-store'
import * as Sentry from '@sentry/react'
import { useQuery } from '@tanstack/react-query'
import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import { ActionInputWithPreview } from 'components/action-input-with-preview'
import Tooltip from 'components/better-tooltip'
import { useFormatCurrency } from 'hooks/settings/useCurrency'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { Wallet } from 'hooks/wallet/useWallet'
import { Images } from 'images'
import Long from 'long'
import { observer } from 'mobx-react-lite'
import { useFeeValidation } from 'pages/sign/fee-validation'
import React, { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import { evmBalanceStore } from 'stores/balance-store'
import { Colors } from 'theme/colors'
import { imgOnError } from 'utils/imgOnError'
import { sliceWord } from 'utils/strings'

import { GasPriceOptionsContext, GasPriceOptionsContextType, useGasPriceContext } from './context'
import { SelectTokenModal } from './select-token-modal'
import { updateFeeTokenData } from './utils'

type ExtendedNativeDenom = NativeDenom & { ibcDenom?: string }

export const useDefaultGasPrice = (
  denoms: DenomsRecord,
  options?: {
    activeChain?: SupportedChain
    selectedNetwork?: 'mainnet' | 'testnet'
    feeDenom?: ExtendedNativeDenom
    isSeiEvmTransaction?: boolean
  },
) => {
  const _activeChain = useActiveChain()
  const activeChain = useMemo(
    () => options?.activeChain ?? _activeChain,
    [_activeChain, options?.activeChain],
  )

  const _lowGasPriceStep = useLowGasPriceStep(activeChain)
  const { gasPrice: evmGasPrice } = useGetEvmGasPrices()
  const { gasPrice: aptosGasPrice } = useGetAptosGasPrices()
  const chains = useGetChains()

  const lowGasPriceStep = useMemo(() => {
    if (options?.isSeiEvmTransaction || chains[activeChain]?.evmOnlyChain) {
      return evmGasPrice.low
    }

    if (isAptosChain(activeChain)) {
      return aptosGasPrice.low
    }

    return _lowGasPriceStep
  }, [
    _lowGasPriceStep,
    activeChain,
    aptosGasPrice.low,
    chains,
    evmGasPrice.low,
    options?.isSeiEvmTransaction,
  ])

  const nativeFeeDenom = useNativeFeeDenom(denoms, activeChain, options?.selectedNetwork)
  const defaultPrice = useMemo(() => {
    const feeDenom = options?.feeDenom ?? (nativeFeeDenom as ExtendedNativeDenom)
    const amount = new BigNumber(lowGasPriceStep)

    return {
      gasPrice: GasPrice.fromUserInput(
        amount.toString(),
        feeDenom?.ibcDenom ?? feeDenom?.coinMinimalDenom ?? '',
      ),
    }
  }, [options?.feeDenom, nativeFeeDenom, lowGasPriceStep])

  return defaultPrice
}

function tokenHasBalance(token: Token | undefined) {
  return !!token?.amount && !isNaN(parseFloat(token?.amount)) && parseFloat(token.amount) > 0
}

export type GasPriceOptionsProps = React.PropsWithChildren<{
  className?: string
  hasUserTouchedFees?: boolean
  recommendedGasLimit?: BigNumber | string
  gasLimit: BigNumber | string
  setGasLimit: (gasLimit: number | string | BigNumber) => void
  recommendedGasPrice?: GasPrice
  gasPriceOption: GasPriceOptionsContextType['value']
  onGasPriceOptionChange: GasPriceOptionsContextType['onChange']
  error: string | null
  setError: React.Dispatch<React.SetStateAction<string | null>>
  initialFeeDenom?: string
  chain?: SupportedChain
  network?: 'mainnet' | 'testnet'
  considerGasAdjustment?: boolean
  disableBalanceCheck?: boolean
  fee?: StdFee
  validateFee?: boolean
  onInvalidFees?: (feeData: NativeDenom, isFeesValid: boolean | null) => void
  isSelectedTokenEvm?: boolean
  isSeiEvmTransaction?: boolean
  notUpdateInitialGasPrice?: boolean
  rootDenomsStore: RootDenomsStore
  rootBalanceStore: RootBalanceStore
}>

interface GasPriceOptionsType extends React.FC<GasPriceOptionsProps> {
  Selector: React.FC<{ className?: string; preSelected?: boolean }>
  AdditionalSettingsToggle: React.FC<{
    children?: (isOpen: boolean) => JSX.Element
    className?: string
  }>
  AdditionalSettings: React.FC<{
    className?: string
    showGasLimitWarning?: boolean
    rootDenomsStore: RootDenomsStore
    rootBalanceStore: RootBalanceStore
  }>
}

const GasPriceOptions = observer(
  ({
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
    network,
    considerGasAdjustment = true,
    disableBalanceCheck,
    validateFee = false,
    fee,
    onInvalidFees,
    isSelectedTokenEvm,
    isSeiEvmTransaction,
    notUpdateInitialGasPrice,
    rootDenomsStore,
    rootBalanceStore,
    hasUserTouchedFees,
  }: GasPriceOptionsProps) => {
    const [viewAdditionalOptions, setViewAdditionalOptions] = useState(false)
    const _activeChain = useActiveChain()
    const activeChain: SupportedChain = useMemo(() => chain ?? _activeChain, [_activeChain, chain])

    const _selectedNetwork = useSelectedNetwork()
    const selectedNetwork: SelectedNetworkType = useMemo(
      () => network ?? _selectedNetwork,
      [_selectedNetwork, network],
    )

    const nonNativeTokenGasLimitMultiplier = useRef<number>(1)
    const hasToCalculateDynamicFee = useHasToCalculateDynamicFee(activeChain, selectedNetwork)
    const getFeeMarketGasPricesSteps = useGetFeeMarketGasPricesSteps(activeChain, selectedNetwork)

    useEffect(() => {
      if (activeChain === 'osmosis') {
        nonNativeTokenGasLimitMultiplier.current = 1.25
      } else {
        nonNativeTokenGasLimitMultiplier.current = 1.05
      }
    }, [activeChain])

    const defaultGasEstimates = useDefaultGasEstimates()
    const gasAdjustment = useGasAdjustmentForChain(activeChain)

    const baseGasPriceStep = useGasPriceStepForChain(activeChain, selectedNetwork)
    const { lcdUrl } = useChainApis(activeChain, selectedNetwork)

    const denoms = rootDenomsStore.allDenoms
    const getWallet = Wallet.useGetWallet()
    const { addressLinkState } = useSeiLinkedAddressState(getWallet)
    const isSeiEvmChain = useIsSeiEvmChain(activeChain)
    const { chains } = useChainsStore()
    const chainInfo = chains[activeChain as SupportedChain]
    const evmBalance = evmBalanceStore.evmBalanceForChain(activeChain, selectedNetwork)
    let allTokens = rootBalanceStore.getSpendableBalancesForChain(activeChain, selectedNetwork)
    const allTokensLoading = rootBalanceStore.getLoadingStatusForChain(activeChain, selectedNetwork)

    allTokens = useMemo(() => {
      if (
        (isSeiEvmChain && isSelectedTokenEvm && !['done', 'unknown'].includes(addressLinkState)) ||
        chainInfo?.evmOnlyChain
      ) {
        return [...allTokens, ...(evmBalance?.evmBalance ?? [])].filter((token) =>
          new BigNumber(token.amount).gt(0),
        )
      }

      return allTokens
    }, [
      addressLinkState,
      allTokens,
      chainInfo?.evmOnlyChain,
      evmBalance?.evmBalance,
      isSeiEvmChain,
      isSelectedTokenEvm,
    ])

    const allTokensStatus = useMemo(() => {
      if (
        (isSeiEvmChain && isSelectedTokenEvm && !['done', 'unknown'].includes(addressLinkState)) ||
        chainInfo?.evmOnlyChain
      ) {
        if (evmBalance?.status === 'loading' || allTokensLoading) {
          return 'loading'
        }
        return 'success'
      }
      return allTokensLoading ? 'loading' : 'success'
    }, [
      addressLinkState,
      allTokensLoading,
      chainInfo?.evmOnlyChain,
      evmBalance?.status,
      isSeiEvmChain,
      isSelectedTokenEvm,
    ])

    const { data: feeTokensList, isLoading: isFeeTokensListLoading } = useFeeTokens(
      allTokens,
      denoms,
      activeChain,
      selectedNetwork,
      isSeiEvmTransaction,
    )

    const chainNativeFeeTokenData = useMemo(() => feeTokensList[0], [feeTokensList])
    const feeIbcDenomTrackerRef = useRef<{
      current: string | null
      previous: string | null
    }>({
      current: chainNativeFeeTokenData.ibcDenom ?? null,
      previous: null,
    })

    const [userHasSelectedToken, setUserHasSelectedToken] = useState<boolean>(false)
    const [feeTokenData, setFeeTokenData] = useState<
      FeeTokenData & { gasPriceStep: GasPriceStep }
    >()
    const feeValidation = useFeeValidation(allTokens, denoms, chain ?? activeChain)
    const prevFeeRef = useRef<string | null>(null)

    useEffect(() => {
      const stringifiedFee = JSON.stringify(fee, (_, value) => {
        return typeof value === 'bigint' ? value.toString() : value
      })

      if (stringifiedFee === prevFeeRef.current) return
      prevFeeRef.current = stringifiedFee
      if (fee && validateFee) {
        feeValidation(
          {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            gaslimit: (fee as any).gasLimit ?? Long.fromString(fee.gas),
            feeAmount: fee.amount[0].amount,
            feeDenom: fee.amount[0].denom,
            chain: activeChain,
          },
          onInvalidFees ??
            (() => {
              //
            }),
        ).catch((e) => {
          Sentry.captureException(e)
        })
      }

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fee, activeChain])

    useEffect(() => {
      const fn = async () => {
        const dappFeeDenomData = feeTokensList.find((a) => a.ibcDenom === initialFeeDenom)
        const feeTokenData = dappFeeDenomData ?? chainNativeFeeTokenData
        if (
          activeChain === 'osmosis' &&
          feeTokenData &&
          ![feeTokenData.ibcDenom, feeTokenData.denom?.coinMinimalDenom].includes('uosmo')
        ) {
          const gasPriceStep = await getGasPricesForOsmosisFee(
            lcdUrl ?? '',
            feeTokenData.ibcDenom ?? feeTokenData?.denom?.coinMinimalDenom ?? '',
            baseGasPriceStep,
          )
          setFeeTokenData(() => ({ ...feeTokenData, gasPriceStep }))
        }

        if (hasToCalculateDynamicFee && feeTokenData) {
          let feeDenom = feeTokenData.denom?.coinMinimalDenom ?? ''
          if (feeTokenData.ibcDenom?.toLowerCase().startsWith('ibc/')) {
            feeDenom = feeTokenData.ibcDenom ?? feeDenom
          }

          const gasPriceStep = await getFeeMarketGasPricesSteps(feeDenom, feeTokenData.gasPriceStep)
          setFeeTokenData(() => ({ ...feeTokenData, gasPriceStep: gasPriceStep }))
        }
      }

      fn()

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [feeTokensList, hasToCalculateDynamicFee])

    const feeTokenAsset = allTokens.find((token: Token) => {
      if (isSelectedTokenEvm && token?.isEvm) {
        return token.coinMinimalDenom === feeTokenData?.denom.coinMinimalDenom
      }

      if (token.ibcDenom) {
        return token.ibcDenom === feeTokenData?.ibcDenom
      } else {
        return token.coinMinimalDenom === feeTokenData?.denom.coinMinimalDenom
      }
    })

    const [finalRecommendedGasLimit, setFinalRecommendedGasLimit] = useState(() => {
      return (
        recommendedGasLimit?.toString() ??
        defaultGasEstimates[activeChain as SupportedChain].DEFAULT_GAS_TRANSFER.toString() ??
        DefaultGasEstimates.DEFAULT_GAS_TRANSFER.toString()
      )
    })

    const isPayingFeeInNonNativeToken = feeTokenData?.ibcDenom !== chainNativeFeeTokenData.ibcDenom

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
      feeIbcDenomTrackerRef.current.current = feeTokenData?.ibcDenom ?? ''

      if (!feeIbcDenomTrackerRef.current.previous) return

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
      feeTokenData?.ibcDenom,
      setGasLimit,
      gasLimit,
      recommendedGasLimit,
      finalRecommendedGasLimit,
    ])

    useEffect(() => {
      const gasPriceBN = new BigNumber(gasPriceOption.gasPrice.amount.toFloatApproximation())
      // if the dapp has specified a fee granter or has set disableFeeCheck on SignOptions, the fees is being paid by the dapp we ignore the fee asset balance checks
      if (disableBalanceCheck || gasPriceBN.isZero() || allTokensStatus === 'loading') {
        setError(null)
        return
      }
      if (!feeTokenAsset && feeTokenData?.denom.coinDenom) {
        return setError(`You do not have any ${feeTokenData?.denom.coinDenom} tokens`)
      }

      const isIbcDenom = !!feeTokenAsset?.ibcDenom
      const hasToChangeDecimals =
        (isSeiEvmTransaction && feeTokenData?.denom?.coinMinimalDenom === 'usei') ||
        chainInfo?.evmOnlyChain

      const amount = gasPriceBN
        .multipliedBy(gasLimit)
        .multipliedBy(considerGasAdjustment ? gasAdjustment : 1)
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        .dividedBy(10 ** (hasToChangeDecimals ? 18 : feeTokenData?.denom?.coinDecimals ?? 8))

      const skipBalanceCheck =
        !!notUpdateInitialGasPrice && hasUserTouchedFees !== true && !userHasSelectedToken

      if (
        !skipBalanceCheck &&
        feeTokenData &&
        ((isIbcDenom && feeTokenAsset?.ibcDenom === feeTokenData?.ibcDenom) ||
          feeTokenAsset?.coinMinimalDenom === feeTokenData.denom?.coinMinimalDenom)
      ) {
        if (amount.isGreaterThan(feeTokenAsset?.amount ?? 0)) {
          setError(
            `You don't have enough ${feeTokenData?.denom.coinDenom.toUpperCase()} to pay gas fees`,
          )
        } else {
          Number(gasLimit) && setError(null)
        }
      }

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
      allTokensStatus,
      feeTokenAsset,
      feeTokenData,
      gasAdjustment,
      gasLimit,
      gasPriceOption.gasPrice.amount,
      gasPriceOption.gasPrice.denom,
      setError,
      disableBalanceCheck,
      considerGasAdjustment,
      notUpdateInitialGasPrice,
      hasUserTouchedFees,
      userHasSelectedToken,
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
      if (isFeeTokensListLoading || initialFeeDenom || userHasSelectedToken) {
        return
      }

      const foundFeeTokenData = feeTokensList.find(
        (feeToken) =>
          !!allTokens?.find((token: Token) => {
            if (token.ibcDenom) {
              return token.ibcDenom === feeToken?.ibcDenom && tokenHasBalance(token)
            } else {
              return (
                token.coinMinimalDenom === feeToken?.denom?.coinMinimalDenom &&
                tokenHasBalance(token)
              )
            }
          }),
      )

      updateFeeTokenData({
        foundFeeTokenData,
        lcdUrl,
        activeChain,
        baseGasPriceStep,
        chainNativeFeeTokenData,
        setFeeTokenData,
        onGasPriceOptionChange,
        hasToCalculateDynamicFee,
        getFeeMarketGasPricesSteps,
      })
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
      chainNativeFeeTokenData,
      allTokens,
      feeTokensList,
      isFeeTokensListLoading,
      userHasSelectedToken,
      hasToCalculateDynamicFee,
    ])

    useEffect(() => {
      if (isFeeTokensListLoading || !initialFeeDenom || userHasSelectedToken) {
        return
      }
      let foundFeeTokenData = feeTokensList.find((token) => {
        if (token.ibcDenom) {
          return token.ibcDenom === initialFeeDenom
        }
        return token.denom.coinMinimalDenom === initialFeeDenom
      })
      if (!notUpdateInitialGasPrice) {
        const dAppSuggestedFeeToken = allTokens?.find((token: Token) => {
          if (token.ibcDenom) {
            return token.ibcDenom === initialFeeDenom
          }
          return token.coinMinimalDenom === initialFeeDenom
        })
        if (!tokenHasBalance(dAppSuggestedFeeToken)) {
          foundFeeTokenData =
            feeTokensList?.find(
              (feeToken) =>
                !!allTokens?.find((token: Token) => {
                  if (token.ibcDenom) {
                    return token.ibcDenom === feeToken?.ibcDenom && tokenHasBalance(token)
                  } else {
                    return (
                      token.coinMinimalDenom === feeToken?.denom?.coinMinimalDenom &&
                      tokenHasBalance(token)
                    )
                  }
                }),
            ) ?? foundFeeTokenData
        }
      }
      if (foundFeeTokenData) {
        updateFeeTokenData({
          foundFeeTokenData,
          chainNativeFeeTokenData,
          setFeeTokenData,
          onGasPriceOptionChange,
          activeChain,
          lcdUrl,
          baseGasPriceStep,
          notUpdateGasPrice: notUpdateInitialGasPrice,
          hasToCalculateDynamicFee,
          getFeeMarketGasPricesSteps,
        })
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
      feeTokensList,
      initialFeeDenom,
      allTokens,
      isFeeTokensListLoading,
      userHasSelectedToken,
      notUpdateInitialGasPrice,
      hasToCalculateDynamicFee,
    ])

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
            //TODO: remove this
            allTokensStatus,
            userHasSelectedToken,
            setUserHasSelectedToken,
            considerGasAdjustment: considerGasAdjustment,
            activeChain,
            selectedNetwork,
            rootDenomsStore: rootDenomsStore,
            isSeiEvmTransaction,
            chainNativeFeeTokenData,
          }}
        >
          {children}
        </GasPriceOptionsContext.Provider>
      </div>
    )
  },
) as GasPriceOptionsType

export const calculateFeeAmount = ({
  gasPrice,
  gasLimit,
  feeDenom,
  gasAdjustment,
  isSeiEvmTransaction,
}: {
  gasPrice: BigNumber.Value
  gasLimit: BigNumber.Value
  feeDenom: NativeDenom
  gasAdjustment: number
  isSeiEvmTransaction?: boolean
}) => {
  const gasPriceBN = new BigNumber(gasPrice)

  const amount = gasPriceBN
    .multipliedBy(gasAdjustment)
    .multipliedBy(gasLimit)
    .dividedBy(10 ** (isSeiEvmTransaction ? 18 : feeDenom.coinDecimals))

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
  const {
    value,
    onChange,
    gasLimit,
    feeTokenData,
    considerGasAdjustment,
    activeChain,
    selectedNetwork,
    isSeiEvmTransaction,
  } = useGasPriceContext()
  const chains = useGetChains()
  const chainId = useChainId(activeChain, selectedNetwork)

  const defaultGasEstimates = useDefaultGasEstimates()
  const [formatCurrency, preferredCurrency] = useFormatCurrency()
  const gasAdjustment = useGasAdjustmentForChain(activeChain)

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

  useEffect(() => {
    // trigger onChange after first render
    if (feeTokenData && !value && preSelected) {
      onChange(
        {
          option: GasOptions.LOW,
          gasPrice: GasPrice.fromUserInput(
            feeTokenData.gasPriceStep.low.toString(),
            feeTokenData.ibcDenom ?? feeTokenData.denom.coinMinimalDenom,
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
            feeTokenData.ibcDenom ?? feeTokenData.denom.coinMinimalDenom,
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
        {Object.entries(feeTokenData?.gasPriceStep ?? {}).map(([level, gasPrice]) => {
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
            isSeiEvmTransaction: isSeiEvmTransaction || chains[activeChain]?.evmOnlyChain,
          })
          const amountInFiat = feeTokenFiatValue
            ? new BigNumber(amount).multipliedBy(feeTokenFiatValue)
            : null
          const handleChange = () => {
            onChange(
              {
                option: level as GasOptions,
                gasPrice: GasPrice.fromUserInput(
                  gasPrice.toString(),
                  feeTokenData.ibcDenom ?? feeTokenData.denom.coinMinimalDenom,
                ),
              },
              feeTokenData,
            )
          }
          const levelText = (level: GasOptions) => {
            if (activeChain === 'bitcoin' || activeChain === 'bitcoinSignet') {
              const levelMap = {
                high: 'fast',
                medium: 'average',
                low: 'slow',
              }
              return levelMap[level]
            }
            return level
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
                {levelText(level as GasOptions)}
              </span>
              <span
                className={`text-gray-700 transition-all text-center mt-[2px] ${
                  isSelected ? 'dark:brightness-200 brightness-50' : ''
                } ${formattedAmount.length > 4 ? 'text-[10px]' : 'text-xs'}`}
              >
                {isVerySmallAmount ? '< 0.00001' : formattedAmount}{' '}
                {sliceWord(feeTokenData?.denom?.coinDenom ?? '')}
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

GasPriceOptions.AdditionalSettings = observer(
  ({
    className,
    showGasLimitWarning,
    rootDenomsStore,
    rootBalanceStore,
  }: {
    className?: string
    showGasLimitWarning?: boolean
    rootDenomsStore: RootDenomsStore
    rootBalanceStore: RootBalanceStore
  }) => {
    const [showTokenSelectSheet, setShowTokenSelectSheet] = useState(false)
    const [inputTouched, setInputTouched] = useState(false)

    const ref = useRef<HTMLDivElement | null>(null)
    const inputRef = useRef<HTMLInputElement | null>(null)

    const {
      feeTokenData,
      setFeeTokenData,
      onChange,
      chainNativeFeeTokenData,
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
      activeChain,
      selectedNetwork,
    } = useGasPriceContext()

    // hardcoded
    const baseGasPriceStep = useGasPriceStepForChain(activeChain, selectedNetwork)
    const { lcdUrl } = useChainApis(activeChain, selectedNetwork)
    const activeChainInfo = useChainInfo(activeChain)
    const hasToCalculateDynamicFee = useHasToCalculateDynamicFee(activeChain, selectedNetwork)
    const getFeeMarketGasPricesSteps = useGetFeeMarketGasPricesSteps(activeChain, selectedNetwork)

    const defaultTokenLogo = useDefaultTokenLogo()
    const gasAdjustment = useGasAdjustmentForChain(activeChain)
    const denoms = rootDenomsStore.allDenoms
    const allAssets = rootBalanceStore.getSpendableBalancesForChain(activeChain, selectedNetwork)
    const { data: feeTokensList, isLoading } = useFeeTokens(
      allAssets,
      denoms,
      activeChainInfo.key,
      selectedNetwork,
    )
    const [gasLimitInputValue, setGasLimitInputValue] = useState('100000')

    useEffect(() => {
      setGasLimitInputValue(() => {
        const limit = gasLimit.toString() || recommendedGasLimit?.toString() || '100000'
        return Math.round(Number(limit) * (considerGasAdjustment ? gasAdjustment : 1)).toString()
      })
    }, [considerGasAdjustment, gasAdjustment, gasLimit, recommendedGasLimit])

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
      if (viewAdditionalOptions) {
        ref.current?.scrollIntoView({ behavior: 'smooth' })
      }
    }, [viewAdditionalOptions])

    useEffect(() => {
      if (isGasLimitInvalid(gasLimitInputValue)) {
        setError('Gas limit is invalid')
      }
    }, [gasLimitInputValue, setError])

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

    if (!feeTokenAsset && (!eligibleFeeTokens || eligibleFeeTokens?.length === 0)) {
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

    const handleTokenSelect = async (selectedMinimalDenom: string, selectedIbcDenom?: string) => {
      const selectedFeeTokenData = feeTokensList.find((feeToken) => {
        if (feeToken.ibcDenom) {
          return feeToken.ibcDenom === selectedIbcDenom
        }
        return feeToken.denom.coinMinimalDenom === selectedMinimalDenom
      })
      if (selectedFeeTokenData) {
        updateFeeTokenData({
          foundFeeTokenData: selectedFeeTokenData,
          chainNativeFeeTokenData,
          setFeeTokenData,
          onGasPriceOptionChange: onChange,
          activeChain,
          lcdUrl,
          baseGasPriceStep,
          defaultGasPriceOption: value?.option ?? '',
          hasToCalculateDynamicFee,
          getFeeMarketGasPricesSteps,
        })
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

    const handleGasLimitOnChange = (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setGasLimitInputValue(value)

      const _gasLimitInt = parseInt(value || '0', 10) / (considerGasAdjustment ? gasAdjustment : 1)
      const _gasLimit = Math.round(_gasLimitInt).toString()

      if (!isGasLimitInvalid(gasLimitInputValue) && _gasLimit !== recommendedGasLimit) {
        setGasLimit(_gasLimit)
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
              className={`rounded-full flex items-center py-2 shrink-0 pl-3 pr-2 cursor-pointer disabled:cursor-default ${
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
                {sliceWord(feeTokenData?.denom?.coinDenom ?? '', 3, 3)}
              </p>
              {isLoading || onlySingleFeeToken ? null : <img src={Images.Misc.ArrowDown} />}
            </button>
            <p
              className='text-sm text-gray-700 dark:text-gray-400 font-bold text-right max-[350px]:flex max-[350px]:flex-col max-[350px]:items-end'
              title={`${new BigNumber(feeTokenAsset?.amount ?? '0').decimalPlaces(
                feeTokenData.denom.coinDecimals ?? 6,
              )} ${sliceWord(feeTokenData?.denom?.coinDenom ?? '')}`}
            >
              <span>Balance:</span>
              <span className='ml-1'>
                {formatBigNumber(new BigNumber(feeTokenAsset?.amount ?? '0'))}{' '}
                {sliceWord(feeTokenData?.denom?.coinDenom ?? '')}
              </span>
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
                maxLength={18}
                onAction={() => {
                  setGasLimit(recommendedGasLimit)
                }}
                onChange={handleGasLimitOnChange}
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
  },
)

export default GasPriceOptions
