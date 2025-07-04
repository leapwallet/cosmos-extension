import { StdFee } from '@cosmjs/stargate'
import {
  currencyDetail,
  fetchCurrency,
  formatBigNumber,
  GasOptions,
  getGasPricesForOsmosisFee,
  Token,
  useActiveChain,
  useChainId,
  useGetAptosGasPrices,
  useGetChains,
  useGetEvmGasPrices,
  useGetSolanaGasPrices,
  useGetSuiGasPrices,
  useHasToCalculateDynamicFee,
  useLowGasPriceStep,
  useNativeFeeDenom,
  useSeiLinkedAddressState,
} from '@leapwallet/cosmos-wallet-hooks'
import {
  DefaultGasEstimates,
  DenomsRecord,
  GasPrice,
  isAptosChain,
  isSolanaChain,
  isSuiChain,
  NativeDenom,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk'
import { RootBalanceStore, RootDenomsStore } from '@leapwallet/cosmos-wallet-store'
import { CaretDown } from '@phosphor-icons/react'
import * as Sentry from '@sentry/react'
import { useQuery } from '@tanstack/react-query'
import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import Text from 'components/text'
import { TokenImageWithFallback } from 'components/token-image-with-fallback'
import { useEnableEvmGasRefetch } from 'hooks/cosm-wasm/use-enable-evm-gas-refetch'
import { useFormatCurrency } from 'hooks/settings/useCurrency'
import { Images } from 'images'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Long from 'long'
import { observer } from 'mobx-react-lite'
import React, { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import { activeChainStore } from 'stores/active-chain-store'
import { evmBalanceStore, solanaCoinDataStore, suiCoinDataStore } from 'stores/balance-store'
import { chainInfoStore } from 'stores/chain-infos-store'
import { chainApisStore } from 'stores/chains-api-store'
import { rootDenomsStore } from 'stores/denoms-store-instance'
import {
  defaultGasEstimatesStore,
  feeMarketGasPriceStepStore,
  feeTokensStore,
  gasAdjustmentStore,
  gasPriceOptionsStore,
  gasPriceStepForChainStore,
} from 'stores/fee-store'
import { rootBalanceStore } from 'stores/root-store'
import { selectedNetworkStore } from 'stores/selected-network-store'
import { cn } from 'utils/cn'
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
  const { gasPrice: evmGasPrice } = useGetEvmGasPrices(activeChain, options?.selectedNetwork)
  const { gasPrice: aptosGasPrice } = useGetAptosGasPrices(activeChain, options?.selectedNetwork)
  const { gasPrice: solanaGasPrice } = useGetSolanaGasPrices(activeChain, options?.selectedNetwork)
  const { gasPrice: suiGasPrice } = useGetSuiGasPrices(activeChain, options?.selectedNetwork)
  const chains = useGetChains()

  const lowGasPriceStep = useMemo(() => {
    if (options?.isSeiEvmTransaction || chains[activeChain]?.evmOnlyChain) {
      return evmGasPrice.low
    }

    if (isAptosChain(activeChain)) {
      return aptosGasPrice.low
    }

    if (isSolanaChain(activeChain)) {
      return solanaGasPrice.low
    }

    if (isSuiChain(activeChain)) {
      return suiGasPrice.low
    }

    return _lowGasPriceStep
  }, [
    _lowGasPriceStep,
    activeChain,
    aptosGasPrice.low,
    solanaGasPrice.low,
    chains,
    evmGasPrice.low,
    options?.isSeiEvmTransaction,
    suiGasPrice.low,
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
  computedGas?: number
  setComputedGas?: React.Dispatch<React.SetStateAction<number>>
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
    gasError?: string | null
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
    hasUserTouchedFees,
    computedGas,
  }: GasPriceOptionsProps) => {
    const activeChain = chain ?? (activeChainStore.activeChain as SupportedChain)
    const selectedNetwork = network ?? selectedNetworkStore.selectedNetwork

    const chainGasPriceOptionsStore = gasPriceOptionsStore.getStore(activeChain, selectedNetwork)

    const allTokensLoading = rootBalanceStore.getLoadingStatusForChain(activeChain, selectedNetwork)
    const spendableBalancesForChain = rootBalanceStore.getSpendableBalancesForChain(
      activeChain,
      selectedNetwork,
    )

    const chainInfo = chainInfoStore.chainInfos[activeChain]
    const evmBalance = evmBalanceStore.evmBalanceForChain(activeChain, selectedNetwork)
    const solanaBalance = solanaCoinDataStore.getSolanaBalances(activeChain, selectedNetwork)
    const suiBalance = suiCoinDataStore.getSuiBalances(activeChain, selectedNetwork)

    const isSeiEvmChain = chainGasPriceOptionsStore.isSeiEvmChain
    const feeTokenData = chainGasPriceOptionsStore.feeTokenData
    const finalRecommendedGasLimit = chainGasPriceOptionsStore.finalRecommendedGasLimit
    const hasToCalculateDynamicFee = chainGasPriceOptionsStore.hasToCalculateDynamicFee

    const feeTokens = feeTokensStore.getStore(activeChain, selectedNetwork, isSeiEvmTransaction)
    const chainNativeFeeTokenData = feeTokens?.data?.[0]
    const isPayingFeeInNonNativeToken = feeTokenData?.ibcDenom !== chainNativeFeeTokenData?.ibcDenom

    const { addressLinkState } = useSeiLinkedAddressState()

    useEnableEvmGasRefetch(activeChain, selectedNetwork)

    const allTokens = useMemo(() => {
      const _isSolanaChain = isSolanaChain(chainInfo.chainId)
      const _isSuiChain = isSuiChain(chainInfo.chainId)
      if (_isSolanaChain) {
        return solanaBalance
      }
      if (_isSuiChain) {
        return suiBalance
      }
      if (
        (isSeiEvmChain && isSelectedTokenEvm && !['done', 'unknown'].includes(addressLinkState)) ||
        chainInfo?.evmOnlyChain
      ) {
        return [...spendableBalancesForChain, ...(evmBalance?.evmBalance ?? [])].filter((token) =>
          new BigNumber(token.amount).gt(0),
        )
      }

      return spendableBalancesForChain
    }, [
      isSeiEvmChain,
      isSelectedTokenEvm,
      addressLinkState,
      chainInfo?.evmOnlyChain,
      spendableBalancesForChain,
      evmBalance?.evmBalance,
      solanaBalance,
      suiBalance,
      chainInfo.chainId,
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

    useEffect(() => {
      const stringifiedFee = JSON.stringify(fee, (_, value) => {
        return typeof value === 'bigint' ? value.toString() : value
      })

      if (stringifiedFee === chainGasPriceOptionsStore.prevFeeRef) return
      chainGasPriceOptionsStore.prevFeeRef = stringifiedFee
      if (fee && validateFee) {
        chainGasPriceOptionsStore
          .validateFees(
            {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              gaslimit: (fee as any).gasLimit ?? Long.fromString(fee.gas),
              feeAmount: fee.amount[0]?.amount,
              feeDenom: fee.amount[0]?.denom,
              chain: activeChain,
            },
            onInvalidFees ??
              (() => {
                //
              }),
            fetchCurrency,
          )
          .catch((e) => {
            Sentry.captureException(e)
          })
      }

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fee, activeChain])

    useEffect(() => {
      const fn = async () => {
        const dappFeeDenomData = feeTokens?.data?.find((a) => a.ibcDenom === initialFeeDenom)
        const feeTokenData = dappFeeDenomData ?? chainNativeFeeTokenData
        if (
          activeChain === 'osmosis' &&
          feeTokenData &&
          ![feeTokenData.ibcDenom, feeTokenData.denom?.coinMinimalDenom].includes('uosmo')
        ) {
          const baseGasPriceStep = await gasPriceStepForChainStore.getGasPriceSteps(
            activeChain,
            selectedNetwork,
          )
          const { lcdUrl } = await chainApisStore.getChainApis(activeChain, selectedNetwork)
          const gasPriceStep = await getGasPricesForOsmosisFee(
            lcdUrl ?? '',
            feeTokenData.ibcDenom ?? feeTokenData?.denom?.coinMinimalDenom ?? '',
            baseGasPriceStep,
          )
          chainGasPriceOptionsStore.setFeeTokenData({ ...feeTokenData, gasPriceStep })
        }

        if (hasToCalculateDynamicFee && feeTokenData) {
          let feeDenom = feeTokenData.denom?.coinMinimalDenom ?? ''
          if (feeTokenData.ibcDenom?.toLowerCase().startsWith('ibc/')) {
            feeDenom = feeTokenData.ibcDenom ?? feeDenom
          }

          const gasPriceStep = await feeMarketGasPriceStepStore.getFeeMarketGasPricesSteps({
            chain: activeChain,
            network: selectedNetwork,
            feeDenom,
            forceBaseGasPriceStep: feeTokenData.gasPriceStep,
          })
          chainGasPriceOptionsStore.setFeeTokenData({
            ...feeTokenData,
            gasPriceStep: gasPriceStep,
          })
        }
      }

      fn()

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [feeTokens?.data, hasToCalculateDynamicFee])

    useEffect(() => {
      if (recommendedGasLimit) {
        const gasLimit = isPayingFeeInNonNativeToken
          ? new BigNumber(recommendedGasLimit)
              .multipliedBy(chainGasPriceOptionsStore.nonNativeTokenGasLimitMultiplier)
              .toFixed(0)
          : recommendedGasLimit.toString()
        chainGasPriceOptionsStore.setFinalRecommendedGasLimit(gasLimit)
      }
    }, [
      chainGasPriceOptionsStore,
      chainGasPriceOptionsStore.nonNativeTokenGasLimitMultiplier,
      isPayingFeeInNonNativeToken,
      recommendedGasLimit,
    ])

    useEffect(() => {
      chainGasPriceOptionsStore.feeIbcDenomTracker.previous =
        chainGasPriceOptionsStore.feeIbcDenomTracker.current
      chainGasPriceOptionsStore.feeIbcDenomTracker.current = feeTokenData?.ibcDenom ?? ''

      if (!chainGasPriceOptionsStore.feeIbcDenomTracker.previous) return

      if (
        chainGasPriceOptionsStore.feeIbcDenomTracker.current !==
          chainNativeFeeTokenData?.ibcDenom &&
        chainGasPriceOptionsStore.feeIbcDenomTracker.previous === chainNativeFeeTokenData?.ibcDenom
      ) {
        // if the user is paying with non-native token but previously had native token
        const newGasLimit = new BigNumber(gasLimit)
          .multipliedBy(chainGasPriceOptionsStore.nonNativeTokenGasLimitMultiplier)
          .toFixed(0)
        const newRecommendedGasLimit = new BigNumber(finalRecommendedGasLimit)
          .multipliedBy(chainGasPriceOptionsStore.nonNativeTokenGasLimitMultiplier)
          .toFixed(0)
        setGasLimit(newGasLimit)
        chainGasPriceOptionsStore.setFinalRecommendedGasLimit(newRecommendedGasLimit)

        return
      }

      if (
        chainGasPriceOptionsStore.feeIbcDenomTracker.current ===
          chainNativeFeeTokenData?.ibcDenom &&
        chainGasPriceOptionsStore.feeIbcDenomTracker.previous !== chainNativeFeeTokenData?.ibcDenom
      ) {
        // if the user is paying with native token but previously had non-native token
        const newGasLimit = new BigNumber(gasLimit)
          .dividedBy(chainGasPriceOptionsStore.nonNativeTokenGasLimitMultiplier)
          .toFixed(0)
        setGasLimit(newGasLimit)
        const newRecommendedGasLimit = new BigNumber(finalRecommendedGasLimit)
          .dividedBy(chainGasPriceOptionsStore.nonNativeTokenGasLimitMultiplier)
          .toFixed(0)

        setGasLimit(newGasLimit)
        chainGasPriceOptionsStore.setFinalRecommendedGasLimit(newRecommendedGasLimit)
      }
    }, [
      chainNativeFeeTokenData?.ibcDenom,
      feeTokenData?.ibcDenom,
      setGasLimit,
      gasLimit,
      recommendedGasLimit,
      finalRecommendedGasLimit,
      chainGasPriceOptionsStore.nonNativeTokenGasLimitMultiplier,
      chainGasPriceOptionsStore,
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
        .multipliedBy(considerGasAdjustment ? gasAdjustmentStore.getGasAdjustments(activeChain) : 1)
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        .dividedBy(10 ** (hasToChangeDecimals ? 18 : feeTokenData?.denom?.coinDecimals ?? 8))

      const skipBalanceCheck =
        !!notUpdateInitialGasPrice &&
        hasUserTouchedFees !== true &&
        !chainGasPriceOptionsStore.userHasSelectedToken

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
      gasLimit,
      gasPriceOption.gasPrice.amount,
      gasPriceOption.gasPrice.denom,
      setError,
      disableBalanceCheck,
      considerGasAdjustment,
      notUpdateInitialGasPrice,
      hasUserTouchedFees,
      chainGasPriceOptionsStore.userHasSelectedToken,
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
      if (
        feeTokens?.isLoading ||
        initialFeeDenom ||
        chainGasPriceOptionsStore.userHasSelectedToken
      ) {
        return
      }

      const foundFeeTokenData = feeTokens?.data?.find(
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

      if (chainNativeFeeTokenData) {
        updateFeeTokenData({
          foundFeeTokenData,
          activeChain,
          selectedNetwork,
          chainNativeFeeTokenData,
          setFeeTokenData: (v) => chainGasPriceOptionsStore.setFeeTokenData(v),
          onGasPriceOptionChange,
          hasToCalculateDynamicFee,
          getFeeMarketGasPricesSteps: (feeDenom, forceBaseGasPriceStep) =>
            feeMarketGasPriceStepStore.getFeeMarketGasPricesSteps({
              chain: activeChain,
              network: selectedNetwork,
              feeDenom,
              forceBaseGasPriceStep,
            }),
        })
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
      chainNativeFeeTokenData,
      allTokens,
      feeTokens?.data,
      feeTokens?.isLoading,
      chainGasPriceOptionsStore.userHasSelectedToken,
      hasToCalculateDynamicFee,
    ])

    useEffect(() => {
      if (
        feeTokens?.isLoading ||
        !initialFeeDenom ||
        chainGasPriceOptionsStore.userHasSelectedToken
      ) {
        return
      }

      let foundFeeTokenData = feeTokens?.data?.find((token) => {
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
            feeTokens?.data?.find(
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

      updateFeeTokenData({
        foundFeeTokenData,
        chainNativeFeeTokenData,
        setFeeTokenData: (v) => chainGasPriceOptionsStore.setFeeTokenData(v),
        onGasPriceOptionChange,
        activeChain,
        selectedNetwork,
        notUpdateGasPrice: notUpdateInitialGasPrice,
        hasToCalculateDynamicFee,
        getFeeMarketGasPricesSteps: (feeDenom, forceBaseGasPriceStep) =>
          feeMarketGasPriceStepStore.getFeeMarketGasPricesSteps({
            chain: activeChain,
            network: selectedNetwork,
            feeDenom,
            forceBaseGasPriceStep,
          }),
      })
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
      feeTokens?.data,
      initialFeeDenom,
      allTokens,
      feeTokens?.isLoading,
      chainGasPriceOptionsStore.userHasSelectedToken,
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
            setFeeTokenData: (v) => chainGasPriceOptionsStore.setFeeTokenData(v),
            gasLimit,
            setGasLimit,
            recommendedGasLimit: finalRecommendedGasLimit,
            viewAdditionalOptions: chainGasPriceOptionsStore.viewAdditionalOptions,
            setViewAdditionalOptions: (flag) => {
              typeof flag === 'boolean' &&
                chainGasPriceOptionsStore.setViewAdditionalPriceOptions(flag)
              typeof flag === 'function' &&
                chainGasPriceOptionsStore.setViewAdditionalPriceOptions(
                  flag(chainGasPriceOptionsStore.viewAdditionalOptions),
                )
            },
            error,
            setError,
            feeTokenAsset,
            allTokens,
            //TODO: remove this
            allTokensStatus,
            userHasSelectedToken: chainGasPriceOptionsStore.userHasSelectedToken,
            setUserHasSelectedToken: (v) => chainGasPriceOptionsStore.setUserHasSelectedToken(v),
            considerGasAdjustment: considerGasAdjustment,
            activeChain,
            selectedNetwork,
            rootDenomsStore: rootDenomsStore,
            isSeiEvmTransaction,
            chainNativeFeeTokenData,
            computedGas,
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
  isSolana,
  isSui,
  computedGas,
}: {
  gasPrice: BigNumber.Value
  gasLimit: BigNumber.Value
  feeDenom: NativeDenom
  gasAdjustment: number
  isSeiEvmTransaction?: boolean
  isSolana?: boolean
  isSui?: boolean
  computedGas?: number
}) => {
  const gasPriceBN = new BigNumber(gasPrice)

  let amount = gasPriceBN
    .multipliedBy(gasAdjustment)
    .multipliedBy(gasLimit)
    .dividedBy(10 ** (isSeiEvmTransaction ? 18 : feeDenom.coinDecimals))

  if (isSolana) {
    if (isNaN(amount.toNumber())) {
      amount = new BigNumber(5000).dividedBy(10 ** feeDenom.coinDecimals)
    } else {
      amount = amount.plus(new BigNumber(5000).dividedBy(10 ** feeDenom.coinDecimals))
    }
  }
  if (isSui) {
    amount = amount.plus(new BigNumber(computedGas ?? 0).dividedBy(10 ** feeDenom.coinDecimals))
  }
  return {
    amount,
    formattedAmount: amount.isEqualTo(0)
      ? '0'
      : amount.isLessThan('0.00001')
      ? '< 0.00001'
      : amount.toFormat(5, BigNumber.ROUND_DOWN),
    isVerySmallAmount: amount.isLessThan('0.00001') && !amount.isEqualTo(0),
  } as const
}

function Selector({
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
    computedGas,
  } = useGasPriceContext()
  const chains = useGetChains()
  const chainId = useChainId(activeChain, selectedNetwork)

  const [formatCurrency, preferredCurrency] = useFormatCurrency()

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
      <div className={classNames('grid grid-cols-3 gap-[5px]', className)}>
        {Object.entries(feeTokenData?.gasPriceStep ?? {}).map(([level, gasPrice]) => {
          const isSelected = value.option === level
          const gasPriceBN = new BigNumber(gasPrice)
          const estimatedGasLimit =
            gasLimit ??
            defaultGasEstimatesStore.estimate?.[activeChain].DEFAULT_GAS_TRANSFER ??
            DefaultGasEstimates.DEFAULT_GAS_TRANSFER
          const { amount, formattedAmount, isVerySmallAmount } = calculateFeeAmount({
            gasPrice: gasPriceBN,
            gasLimit: estimatedGasLimit,
            feeDenom: feeTokenData.denom,
            gasAdjustment: considerGasAdjustment
              ? gasAdjustmentStore.getGasAdjustments(activeChain)
              : 1,
            isSeiEvmTransaction: isSeiEvmTransaction || chains[activeChain]?.evmOnlyChain,
            isSolana: isSolanaChain(activeChain),
            isSui: isSuiChain(activeChain),
            computedGas: computedGas,
          })
          const amountInFiat = feeTokenFiatValue
            ? new BigNumber(amount).multipliedBy(feeTokenFiatValue)
            : null
          const handleChange = () => {
            onChange(
              {
                option: level as GasOptions,
                gasPrice: GasPrice.fromUserInput(
                  gasPrice?.toString() || '0',
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
              className={`relative flex flex-col justify-center items-center w-full h-full rounded-lg cursor-pointer py-3 px-2.5 transition-colors ${
                isSelected ? 'bg-secondary-100' : ''
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
                className={`capitalize text-[18px] transition-all text-center ${
                  isSelected ? 'text-monochrome font-bold' : 'text-muted-foreground font-medium'
                }`}
              >
                {levelText(level as GasOptions)}
              </span>
              <span
                className={`transition-all text-center mt-1 text-xs font-medium ${
                  isSelected ? 'text-monochrome' : 'text-muted-foreground'
                }`}
              >
                {isVerySmallAmount ? '< 0.00001' : formattedAmount}{' '}
                {sliceWord(feeTokenData?.denom?.coinDenom ?? '')}
              </span>
              {amountInFiat ? (
                <span className={`text-muted-foreground text-xs transition-all text-center mt-0.5`}>
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

GasPriceOptions.Selector = observer(Selector)

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
    <div
      role='button'
      tabIndex={0}
      onClick={() => setViewAdditionalOptions((v) => !v)}
      className='w-full flex-row flex justify-between items-center gap-2 cursor-pointer p-4'
    >
      {children?.(viewAdditionalOptions) ?? (
        <div className='flex w-full justify-between items-center'>
          <p
            className={cn(
              'text-xs font-medium transition-colors',
              !viewAdditionalOptions && 'text-muted-foreground',
            )}
          >
            Show additional settings
          </p>
          <CaretDown
            size={14}
            className={cn(
              'text-muted-foreground transition-transform',
              viewAdditionalOptions && 'rotate-180',
            )}
          />
        </div>
      )}
    </div>
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
    gasError,
  }: {
    className?: string
    showGasLimitWarning?: boolean
    rootDenomsStore: RootDenomsStore
    rootBalanceStore: RootBalanceStore
    gasError?: string | null
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
      isSeiEvmTransaction,
    } = useGasPriceContext()

    // hardcoded
    const hasToCalculateDynamicFee = useHasToCalculateDynamicFee(activeChain, selectedNetwork)

    const activeChainfeeTokensStore = feeTokensStore.getStore(
      activeChain,
      selectedNetwork,
      isSeiEvmTransaction,
    )
    const feeTokensList = activeChainfeeTokensStore?.data
    const isLoading = activeChainfeeTokensStore?.isLoading
    const [gasLimitInputValue, setGasLimitInputValue] = useState('100000')

    useEffect(() => {
      setGasLimitInputValue(() => {
        const limit = gasLimit.toString() || recommendedGasLimit?.toString() || '100000'
        return Math.round(
          Number(limit) *
            (considerGasAdjustment ? gasAdjustmentStore.getGasAdjustments(activeChain) : 1),
        ).toString()
      })
    }, [activeChain, considerGasAdjustment, gasLimit, recommendedGasLimit])

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
          <div className='w-full z-0 p-3'>
            <p className='text-sm dark:text-gray-400 text-gray-700'>
              Failed to load your tokens, please reload the extension and try again
            </p>
          </div>
        )
      }
      if (allTokensStatus === 'loading' && viewAdditionalOptions) {
        return (
          <div className='w-full z-0 p-3'>
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
          <div className='w-full z-0 p-3'>
            <p className='text-sm dark:text-gray-400 text-gray-700'>
              You do not have any tokens that can be used to pay transaction fees.
            </p>
          </div>
        )
      }
      return null
    }

    const onlySingleFeeToken = feeTokensList?.length === 1

    const handleTokenSelect = async (selectedMinimalDenom: string, selectedIbcDenom?: string) => {
      const selectedFeeTokenData = feeTokensList?.find((feeToken) => {
        if (feeToken.ibcDenom && selectedIbcDenom) {
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
          selectedNetwork,
          defaultGasPriceOption: value?.option ?? '',
          hasToCalculateDynamicFee,
          getFeeMarketGasPricesSteps: (feeDenom, forceBaseGasPriceStep) =>
            feeMarketGasPriceStepStore.getFeeMarketGasPricesSteps({
              chain: activeChain,
              network: selectedNetwork,
              feeDenom,
              forceBaseGasPriceStep,
            }),
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

      const _gasLimitInt =
        parseInt(value || '0', 10) /
        (considerGasAdjustment ? gasAdjustmentStore.getGasAdjustments(activeChain) : 1)
      const _gasLimit = Math.round(_gasLimitInt).toString()

      if (!isGasLimitInvalid(gasLimitInputValue) && _gasLimit !== recommendedGasLimit) {
        setGasLimit(_gasLimit)
      }
    }

    return viewAdditionalOptions ? (
      <>
        <div ref={ref} className={classNames('w-full p-4', className)}>
          <p className='text-xs text-secondary-800'>
            {onlySingleFeeToken
              ? 'You are paying fees transaction fees in'
              : 'Choose a token for paying transaction fees'}
          </p>
          <div className='flex items-center justify-between mt-3 bg-secondary-100 rounded-lg pr-3 py-1'>
            <button
              className={`rounded-full flex items-center py-2 shrink-0 pl-3 pr-2 disabled:cursor-default ${
                onlySingleFeeToken ? '' : 'cursor-pointer'
              }`}
              disabled={isLoading || onlySingleFeeToken}
              onClick={() => {
                setShowTokenSelectSheet(true)
              }}
            >
              <TokenImageWithFallback
                assetImg={feeTokenData.denom.icon ?? feeTokenAsset?.img}
                text={feeTokenData.denom.coinDenom}
                altText={feeTokenData.denom.coinDenom}
                imageClassName='h-6 w-6 mr-1'
                containerClassName='h-6 w-6 mr-1'
                textClassName='text-[7px] !leading-[9px]'
              />
              <p className='text-black-100 dark:text-white-100 font-bold text-base mr-2'>
                {sliceWord(feeTokenData?.denom?.coinDenom ?? '', 3, 3)}
              </p>
              {isLoading || onlySingleFeeToken ? null : <img src={Images.Misc.ArrowDown} />}
            </button>
            <p
              className='text-xs text-muted-foreground text-right max-[350px]:flex max-[350px]:flex-col max-[350px]:items-end'
              title={`${new BigNumber(feeTokenAsset?.amount ?? '0').decimalPlaces(
                feeTokenData.denom.coinDecimals ?? 6,
              )} ${sliceWord(feeTokenData?.denom?.coinDenom ?? '')}`}
            >
              <span>BAL:</span>
              <span className='ml-1'>
                {formatBigNumber(new BigNumber(feeTokenAsset?.amount ?? '0'))}{' '}
                {sliceWord(feeTokenData?.denom?.coinDenom ?? '')}
              </span>
            </p>
          </div>
          <div className='mt-4'>
            <div className='flex flex-col gap-3'>
              <p className='text-xs text-secondary-800'>Enter gas limit manually</p>
              <div className='w-full py-3 px-4 flex items-center bg-secondary-100 rounded-lg'>
                <input
                  className={classNames(
                    'flex flex-grow text-md  outline-none font-medium bg-transparent',
                    {
                      'text-monochrome': !gasError,
                      'text-destructive-100': gasError,
                    },
                  )}
                  value={gasLimitInputValue}
                  onChange={handleGasLimitOnChange}
                  ref={inputRef}
                />
                <div
                  onClick={() => {
                    setGasLimit(recommendedGasLimit)
                  }}
                >
                  <Text
                    size='xs'
                    color='text-muted-foreground'
                    className=' font-bold cursor-pointer'
                  >
                    Clear
                  </Text>
                </div>
              </div>
              {gasError ? (
                <p className='text-destructive-100 text-xs font-medium'>{gasError}</p>
              ) : showGasLimitWarning &&
                inputTouched &&
                new BigNumber(gasLimitInputValue).isLessThan(
                  Math.round(
                    Number(recommendedGasLimit) *
                      (considerGasAdjustment
                        ? gasAdjustmentStore.getGasAdjustments(activeChain)
                        : 1),
                  ),
                ) ? (
                <p className='text-orange-500 text-xs font-medium'>
                  We recommend using the default gas limit
                </p>
              ) : null}
            </div>
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
