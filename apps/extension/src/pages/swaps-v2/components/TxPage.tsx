import { GasOptions, getKeyToUseForDenoms } from '@leapwallet/cosmos-wallet-hooks'
import { GasPrice, NativeDenom } from '@leapwallet/cosmos-wallet-sdk'
import { RootCW20DenomsStore, RootDenomsStore } from '@leapwallet/cosmos-wallet-store'
import { TRANSFER_STATE, TXN_STATUS } from '@leapwallet/elements-core'
import { RouteAggregator } from '@leapwallet/elements-hooks'
import { Buttons, Header } from '@leapwallet/leap-ui'
import { CaretDown, CaretUp, House, Receipt, Timer } from '@phosphor-icons/react'
import classNames from 'classnames'
import PopupLayout from 'components/layout/popup-layout'
import LedgerConfirmationPopup from 'components/ledger-confirmation/LedgerConfirmationPopup'
import Loader from 'components/loader/Loader'
import { PageName } from 'config/analytics'
import { AnimatePresence } from 'framer-motion'
import { usePageView } from 'hooks/analytics/usePageView'
import loadingImage from 'lottie-files/swaps-btn-loading.json'
import Lottie from 'lottie-react'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { compassTokenTagsStore } from 'stores/denoms-store-instance'
import { SourceChain, SourceToken, SwapFeeInfo, SwapTxAction } from 'types/swap'
import { isCompassWallet } from 'utils/isCompassWallet'

import { RoutingInfo, useHandleTxProgressPageBlurEvent, useOnline, useTransactions } from '../hooks'
import { useExecuteTx } from '../hooks/txExecution/useExecuteTx'
import { getChainIdsFromRoute, getNoOfStepsFromRoute, getPriceImpactVars } from '../utils'
import { TxPageSteps } from './index'
import { SwapActionFailedSection } from './SwapActionFailedSection'
import { TxErrorSection } from './TxErrorSection'
import { TxStatusOverview } from './TxStatusOverview'
import TxTokensSummary from './TxTokensSummary'
import TxTokensSummaryMini from './TxTokensSummaryMini'

export type TxPageProps = {
  onClose: (
    sourceChain?: string,
    sourceToken?: string,
    destinationChain?: string,
    destinationToken?: string,
  ) => void
  setLedgerError?: (ledgerError?: string) => void
  sourceToken: SourceToken | null
  destinationToken: SourceToken | null
  sourceChain: SourceChain | undefined
  destinationChain: SourceChain | undefined
  inAmount: string
  amountOut: string
  routingInfo: RoutingInfo
  userPreferredGasLimit: number | undefined
  userPreferredGasPrice: GasPrice | undefined
  gasEstimate: number
  feeDenom: NativeDenom & {
    ibcDenom?: string | undefined
  }
  gasOption: GasOptions
  feeAmount?: string
  refetchSourceBalances?: () => void
  refetchDestinationBalances?: () => void
  ledgerError?: string
  callbackPostTx?: () => void
  rootDenomsStore: RootDenomsStore
  isTrackingPage?: boolean
  rootCW20DenomsStore: RootCW20DenomsStore
  swapFeeInfo?: SwapFeeInfo
}

export const TxPage = observer(
  ({
    onClose,
    setLedgerError,
    sourceChain,
    sourceToken,
    destinationChain,
    destinationToken,
    inAmount,
    amountOut,
    routingInfo,
    userPreferredGasLimit,
    userPreferredGasPrice,
    gasEstimate,
    feeDenom,
    gasOption,
    feeAmount,
    ledgerError,
    refetchSourceBalances,
    refetchDestinationBalances,
    callbackPostTx,
    isTrackingPage,
    rootDenomsStore,
    rootCW20DenomsStore,
    swapFeeInfo,
  }: TxPageProps) => {
    const cw20Denoms = rootCW20DenomsStore.allCW20Denoms
    const rootDenoms = rootDenomsStore.allDenoms
    const compassTokenDenomInfo = compassTokenTagsStore.compassTokenDenomInfo

    const denoms = useMemo(
      () => Object.assign({}, rootDenoms, compassTokenDenomInfo),
      [rootDenoms, compassTokenDenomInfo],
    )

    const [showLedgerPopup, setShowLedgerPopup] = useState(false)
    const [showLedgerPopupText, setShowLedgerPopupText] = useState('')
    const [isSigningComplete, setIsSigningComplete] = useState(false)
    const [initialFeeAmount, setFeeAmount] = useState('')

    const isOnline = useOnline()

    const navigate = useNavigate()

    const {
      initialSourceToken,
      initialDestinationToken,
      initialSourceChain,
      initialDestinationChain,
      initialInAmount,
      initialAmountOut,
      initialRoutingInfo,
      initialGasEstimate,
      initialFeeDenom,
      initialGasOption,
      initialUserPreferredGasLimit,
      initialUserPreferredGasPrice,
      initialSwapFeeInfo,
      initialSourceAssetUSDValue,
      initialDestinationAssetUSDValue,
    } = useMemo(() => {
      const { sourceAssetUSDValue, destinationAssetUSDValue } = getPriceImpactVars(
        routingInfo?.route,
        sourceToken,
        destinationToken,
        denoms,
      )
      return {
        initialSourceToken: sourceToken,
        initialDestinationToken: destinationToken,
        initialSourceChain: sourceChain,
        initialDestinationChain: destinationChain,
        initialInAmount: inAmount,
        initialAmountOut: amountOut,
        initialRoutingInfo: routingInfo,
        initialGasEstimate: gasEstimate,
        initialFeeDenom: feeDenom,
        initialGasOption: gasOption,
        initialUserPreferredGasLimit: userPreferredGasLimit,
        initialUserPreferredGasPrice: userPreferredGasPrice,
        initialSwapFeeInfo: swapFeeInfo,
        initialSourceAssetUSDValue: sourceAssetUSDValue,
        initialDestinationAssetUSDValue: destinationAssetUSDValue,
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const [isTxStepsVisible, setIsTxStepsVisible] = useState(true)
    const [isSuccessFull, setIsSuccessFull] = useState(false)
    const [isTrackingInSync, setTrackingInSync] = useState(false)

    const { groupedTransactions } = useTransactions(initialRoutingInfo)

    const { callExecuteTx, txStatus, firstTxnError, timeoutError, isLoading, unableToTrackError } =
      useExecuteTx({
        denoms,
        setShowLedgerPopup,
        setShowLedgerPopupText,
        setLedgerError,
        routingInfo: initialRoutingInfo,
        sourceChain: initialSourceChain,
        sourceToken: initialSourceToken,
        destinationChain: initialDestinationChain,
        destinationToken: initialDestinationToken,
        feeDenom: initialFeeDenom,
        gasEstimate: initialGasEstimate,
        gasOption: initialGasOption,
        userPreferredGasLimit: initialUserPreferredGasLimit,
        userPreferredGasPrice: initialUserPreferredGasPrice,
        inAmount: initialInAmount,
        amountOut: initialAmountOut,
        setFeeAmount,
        feeAmount,
        callbackPostTx,
        refetchDestinationBalances,
        refetchSourceBalances,
        setTrackingInSync,
        cw20Denoms,
        swapFeeInfo: initialSwapFeeInfo,
        setIsSigningComplete,
      })

    const { handleClose } = useHandleTxProgressPageBlurEvent(
      isLoading,
      isOnline,
      initialRoutingInfo,
      initialInAmount,
      initialAmountOut,
      initialFeeAmount,
      initialSourceChain,
      initialSourceToken,
      initialDestinationChain,
      initialDestinationToken,
      initialFeeDenom,
      initialGasEstimate,
      initialGasOption,
      initialUserPreferredGasLimit,
      initialUserPreferredGasPrice,
      feeAmount,
    )

    const isTrackingInProgress = useMemo(() => {
      if (isLoading) {
        return true
      }
      if (txStatus) {
        const isTxnComplete = txStatus.every((txn) => txn.isComplete)
        const isFailed = txStatus.some((txn) => txn.status === TXN_STATUS.FAILED)
        return !(isTxnComplete || isFailed)
      }
      return true
    }, [isLoading, txStatus])

    const pageViewEventAdditionalProperties = useMemo(() => {
      let inAmountDollarValue, outAmountDollarValue
      if (
        sourceToken?.usdPrice &&
        !isNaN(parseFloat(sourceToken?.usdPrice)) &&
        inAmount &&
        !isNaN(parseFloat(inAmount))
      ) {
        inAmountDollarValue = parseFloat(sourceToken?.usdPrice) * parseFloat(inAmount)
      }
      if (
        destinationToken?.usdPrice &&
        !isNaN(parseFloat(destinationToken?.usdPrice)) &&
        amountOut &&
        !isNaN(parseFloat(amountOut))
      ) {
        outAmountDollarValue = parseFloat(destinationToken.usdPrice) * parseFloat(amountOut)
      }
      const properties = {
        fromToken: sourceToken?.symbol,
        fromTokenAmount: inAmountDollarValue,
        fromChain: sourceChain?.chainName ?? '',
        toToken: destinationToken?.symbol,
        toChain: destinationChain?.chainName,
        toTokenAmount: outAmountDollarValue,
        transactionCount: routingInfo?.route?.transactionCount,
      }
      if (isTrackingInProgress) {
        return properties
      }
      return isSuccessFull
        ? { transactionStatus: 'Success', ...properties }
        : { transactionStatus: 'Failure', ...properties }
    }, [
      amountOut,
      destinationChain?.chainName,
      destinationToken?.symbol,
      destinationToken?.usdPrice,
      inAmount,
      isSuccessFull,
      isTrackingInProgress,
      routingInfo?.route?.transactionCount,
      sourceChain?.chainName,
      sourceToken?.symbol,
      sourceToken?.usdPrice,
    ])

    usePageView(
      isTrackingInProgress ? PageName.SwapsTracking : PageName.SwapsCompletion,
      true,
      pageViewEventAdditionalProperties,
    )

    const failedActionWasSwap = useMemo(() => {
      // !: Here 0 is hardcoded since we allow only one step transactions
      const transferSequence = txStatus?.[0]?.responses
      const actions = Object.values(groupedTransactions ?? {})?.[0]
      const releaseAsset = txStatus?.[0]?.transferAssetRelease

      if (!transferSequence || !actions || !releaseAsset) return false

      let _failedActionWasSwap = false

      for (let i = 0; i < transferSequence.length; i++) {
        const transfer = transferSequence[i]
        if (transfer.state === TRANSFER_STATE.TRANSFER_FAILURE) {
          const swapAction = actions.find((a): a is SwapTxAction => a.type === 'SWAP')
          if (!!swapAction && releaseAsset.denom === swapAction?.sourceAsset) {
            _failedActionWasSwap = true
          }
        }
      }

      return _failedActionWasSwap
    }, [groupedTransactions, txStatus])

    const transferAssetRelease = txStatus?.[0]?.transferAssetRelease

    const headerTitle = useMemo(() => {
      if (!isOnline || unableToTrackError) {
        return 'Tracking Unavailable'
      }

      if (isLoading) {
        return 'Transaction In Progress...'
      }

      if (failedActionWasSwap) {
        return 'Transaction Stuck'
      }

      if (!isLoading && isSuccessFull) {
        return 'Transaction Success'
      } else {
        return 'Transaction Complete'
      }
    }, [failedActionWasSwap, isLoading, isOnline, isSuccessFull, unableToTrackError])

    const estimatedDurationInSeconds = useMemo(() => {
      if (initialRoutingInfo?.aggregator === RouteAggregator.LIFI) {
        const lifiResponse = initialRoutingInfo?.route?.response
        return (
          lifiResponse?.steps?.reduce((acc, step) => {
            return acc + (step.estimate?.executionDuration || 0)
          }, 0) || 0
        )
      }
      if (initialRoutingInfo?.aggregator === RouteAggregator.SKIP) {
        return initialRoutingInfo?.route?.response?.estimated_route_duration_seconds || 0
      }
      return 0
    }, [initialRoutingInfo?.route, initialRoutingInfo?.aggregator])

    const formattedEstimatedDuration = useMemo(() => {
      function fallbackRouteDuration() {
        const chainIds = getChainIdsFromRoute(initialRoutingInfo?.route)
        if (
          (initialSourceChain?.chainType === 'evm' ||
            initialDestinationChain?.chainType === 'evm') &&
          chainIds &&
          chainIds?.length > 1
        ) {
          const finalityTimeMap: Record<string, string> = {
            '1': '16 mins',
            '43114': '3 secs',
            '137': '5 mins',
            '56': '46 secs',
            '10': '30 mins',
            '42161': '20 mins',
            '8453': '24 mins',
          }
          const sourceChainFinalityTime = finalityTimeMap[initialSourceChain?.chainId ?? '']
          const destinationChainFinalityTime =
            finalityTimeMap[initialDestinationChain?.chainId ?? '']
          if (destinationChainFinalityTime ?? sourceChainFinalityTime) {
            return destinationChainFinalityTime ?? sourceChainFinalityTime
          }
        }
        if (!chainIds || chainIds?.length <= 1) {
          return '15 secs'
        }
        const noOfSteps = getNoOfStepsFromRoute(initialRoutingInfo?.route)
        if (!noOfSteps) {
          return undefined
        }
        if (noOfSteps < 4) {
          return `${noOfSteps * 15} secs`
        }
        return `${(noOfSteps / 4).toFixed(0)} mins`
      }

      if (estimatedDurationInSeconds === 0) {
        return fallbackRouteDuration()
      }

      if (estimatedDurationInSeconds < 60) {
        return `${estimatedDurationInSeconds.toFixed(0)} sec${
          estimatedDurationInSeconds > 1 ? 's' : ''
        }`
      }

      const minutes = Math.floor(estimatedDurationInSeconds / 60)
      return `${minutes} min${minutes > 1 ? 's' : ''}`
    }, [
      estimatedDurationInSeconds,
      initialDestinationChain?.chainId,
      initialDestinationChain?.chainType,
      initialRoutingInfo?.route,
      initialSourceChain?.chainId,
      initialSourceChain?.chainType,
    ])

    const isHomeButtonDisabled = useMemo(() => {
      return isLoading && !isSigningComplete
    }, [isLoading, isSigningComplete])

    useEffect(() => {
      setIsSuccessFull(false)
      callExecuteTx()

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOnline])

    useEffect(() => {
      if (!isLoading && !ledgerError && !timeoutError && !firstTxnError && txStatus) {
        const isTxnComplete = txStatus.every((txn) => txn.isComplete)
        const isFailed = txStatus.some((txn) => txn.status === TXN_STATUS.FAILED)

        if (isTxnComplete || isFailed) {
          setIsSuccessFull(
            txStatus.every((txn: { status: TXN_STATUS }) => txn.status === TXN_STATUS.SUCCESS),
          )
        }
      }
    }, [firstTxnError, ledgerError, isLoading, timeoutError, txStatus, unableToTrackError])

    const handleHomeBtnClick = useCallback(() => {
      if (isHomeButtonDisabled) {
        return
      }
      onClose()
      handleClose()
      navigate('/home')
    }, [isHomeButtonDisabled, onClose, handleClose, navigate])

    const handleSwapAgainClick = useCallback(() => {
      if (isLoading) return

      if (
        initialSourceChain &&
        initialDestinationChain &&
        initialSourceToken &&
        initialDestinationToken
      ) {
        const srcChainId = String(initialSourceChain.chainId)
        const srcTokenId = getKeyToUseForDenoms(
          String(initialSourceToken.coinMinimalDenom),
          srcChainId,
        )
        const destChainId = String(initialDestinationChain.chainId)
        const destTokenId = getKeyToUseForDenoms(
          String(initialDestinationToken.coinMinimalDenom),
          destChainId,
        )
        onClose(srcChainId, srcTokenId, destChainId, destTokenId)
      } else {
        onClose()
      }
      handleClose()
    }, [
      isLoading,
      initialDestinationChain,
      initialDestinationToken,
      initialSourceChain,
      initialSourceToken,
      handleClose,
      onClose,
    ])

    if (isTrackingPage && !isTrackingInSync) {
      return (
        <div className='absolute w-[400px] overflow-clip top-0 z-[10]'>
          <div className='relative'>
            <PopupLayout>
              <div className='flex flex-col items-center justify-center h-full'>
                <Loader />
              </div>
            </PopupLayout>
          </div>
        </div>
      )
    }

    return (
      <div className='absolute panel-width panel-height enclosing-panel overflow-clip top-0 z-[10]'>
        <div className='relative panel-width panel-height enclosing-panel '>
          {showLedgerPopup && (
            <LedgerConfirmationPopup
              showLedgerPopup={showLedgerPopup}
              showLedgerPopupText={showLedgerPopupText}
            />
          )}

          <PopupLayout header={<Header title={headerTitle} />} headerZIndex={11}>
            <div className='p-6 flex-col flex items-start justify-start gap-4 w-full !pb-24 max-[350px]:!px-4'>
              {isLoading ? (
                <TxTokensSummary
                  inAmount={initialInAmount}
                  amountOut={initialAmountOut}
                  sourceChain={initialSourceChain}
                  sourceToken={initialSourceToken}
                  destinationChain={initialDestinationChain}
                  destinationToken={initialDestinationToken}
                  sourceAssetUSDValue={initialSourceAssetUSDValue}
                  destinationAssetUSDValue={initialDestinationAssetUSDValue}
                  className='!bg-white-100 dark:!bg-gray-950'
                />
              ) : (
                <>
                  <TxStatusOverview
                    isSuccessFull={isSuccessFull}
                    failedActionWasSwap={failedActionWasSwap}
                    amountOut={initialAmountOut}
                    destinationChain={initialDestinationChain}
                    destinationToken={initialDestinationToken}
                    unableToTrackError={unableToTrackError}
                    timeoutError={timeoutError}
                  />
                  {failedActionWasSwap && transferAssetRelease && (
                    <SwapActionFailedSection
                      transferAssetRelease={transferAssetRelease}
                      rootDenomsStore={rootDenomsStore}
                    />
                  )}
                  {isSuccessFull && (
                    <TxTokensSummaryMini
                      inAmount={initialInAmount}
                      amountOut={initialAmountOut}
                      sourceToken={initialSourceToken}
                      destinationToken={initialDestinationToken}
                    />
                  )}
                  {(!isOnline ||
                    !!firstTxnError ||
                    !!ledgerError ||
                    !!unableToTrackError ||
                    !!timeoutError) && (
                    <TxErrorSection
                      ledgerError={ledgerError}
                      firstTxnError={firstTxnError}
                      unableToTrackError={unableToTrackError}
                      timeoutError={timeoutError}
                      routingInfo={initialRoutingInfo}
                    />
                  )}
                </>
              )}

              {isOnline && (
                <div className='w-full bg-white-100 dark:bg-gray-950 rounded-2xl flex flex-col p-4 gap-3'>
                  <div className='justify-between items-center flex flex-row gap-2'>
                    <div>
                      <div className='flex items-center justify-start gap-1 font-bold text-black-100 dark:text-white-100 text-sm !leading-[20px]'>
                        {isLoading ? (
                          <Timer size={16} className='text-black-100 dark:text-white-100' />
                        ) : (
                          <Receipt size={16} className='text-black-100 dark:text-white-100' />
                        )}
                        <span>
                          {isLoading ? `~ ${formattedEstimatedDuration}` : 'Transaction Summary'}
                        </span>
                      </div>
                    </div>
                    <button
                      className='w-[24px] h-[24px] justify-center items-center gap-[8px] flex flex-row text-gray-400 dark:text-gray-600'
                      onClick={() => {
                        setIsTxStepsVisible(!isTxStepsVisible)
                      }}
                    >
                      {isTxStepsVisible ? (
                        <CaretUp size={24} className='text-gray-400 dark:text-gray-600' />
                      ) : (
                        <CaretDown size={24} className='text-gray-400 dark:text-gray-600' />
                      )}
                    </button>
                  </div>
                  <AnimatePresence initial={false}>
                    {isTxStepsVisible && (
                      <TxPageSteps
                        routingInfo={initialRoutingInfo}
                        txStatus={txStatus}
                        rootDenomsStore={rootDenomsStore}
                      />
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </PopupLayout>

          <div className='dark:bg-black-100 bg-gray-50 flex flex-row items-center justify-between gap-4 absolute bottom-0 left-0 right-0 p-6 max-[350px]:!px-4 z-10'>
            <button
              className={classNames(
                'rounded-full dark:bg-gray-800 h-[46px] flex flex-row justify-center items-center text-black-100 dark:text-white-100 bg-gray-200',
                {
                  'w-[46px] shrink-0': isLoading,
                  'font-bold text-md !leading-[21.6px] w-full': !isLoading,
                  'cursor-no-drop': isHomeButtonDisabled,
                },
              )}
              onClick={handleHomeBtnClick}
              disabled={isHomeButtonDisabled}
            >
              {isLoading ? (
                <House
                  size={24}
                  className={classNames({
                    'text-gray-800 dark:text-gray-200 opacity-50': isHomeButtonDisabled,
                    'text-black-100 dark:text-white-100': !isHomeButtonDisabled,
                  })}
                />
              ) : (
                'Home'
              )}
            </button>
            <Buttons.Generic
              className={classNames(
                `${isCompassWallet() ? '!bg-compassChainTheme-400' : '!bg-green-600'} dark:${
                  isCompassWallet() ? '!bg-compassChainTheme-400' : '!bg-green-600'
                } text-white-100 w-full`,
                {
                  'cursor-no-drop': isLoading,
                },
              )}
              style={{ boxShadow: 'none' }}
              onClick={handleSwapAgainClick}
            >
              {isLoading ? (
                <Lottie
                  loop={true}
                  autoplay={true}
                  animationData={loadingImage}
                  rendererSettings={{
                    preserveAspectRatio: 'xMidYMid slice',
                  }}
                  className={'h-[24px] w-[24px]'}
                />
              ) : (
                'Swap Again'
              )}
            </Buttons.Generic>
          </div>
        </div>
      </div>
    )
  },
)
