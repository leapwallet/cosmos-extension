import { GasOptions } from '@leapwallet/cosmos-wallet-hooks'
import { GasPrice, NativeDenom } from '@leapwallet/cosmos-wallet-sdk'
import { RootCW20DenomsStore, RootDenomsStore } from '@leapwallet/cosmos-wallet-store'
import { TRANSFER_STATE, TXN_STATUS } from '@leapwallet/elements-core'
import { CaretRight } from '@phosphor-icons/react'
import classNames from 'classnames'
import BottomModal from 'components/bottom-modal'
import LedgerConfirmationPopup from 'components/ledger-confirmation/LedgerConfirmationPopup'
import Loader from 'components/loader/Loader'
import Text from 'components/text'
import { Button } from 'components/ui/button'
import { PageName } from 'config/analytics'
import { usePageView } from 'hooks/analytics/usePageView'
import { Images } from 'images'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { SourceChain, SourceToken, SwapFeeInfo, SwapTxAction } from 'types/swap'

import { RoutingInfo, useExecuteTx, useOnline, useTransactions } from '../hooks'

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
  isTrackingPage?: boolean
  rootDenomsStore: RootDenomsStore
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
    } = useMemo(() => {
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
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const [isSuccessFull, setIsSuccessFull] = useState(false)
    const [isTrackingInSync, setTrackingInSync] = useState(false)

    const { groupedTransactions } = useTransactions(initialRoutingInfo)
    const cw20Denoms = rootCW20DenomsStore.allCW20Denoms
    const denoms = rootDenomsStore.allDenoms

    const { callExecuteTx, txStatus, firstTxnError, timeoutError, isLoading, unableToTrackError } =
      useExecuteTx({
        denoms,
        setShowLedgerPopup,
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
        setShowLedgerPopupText,
      })

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

    const isCTADisabled = useMemo(() => {
      return isLoading
    }, [isLoading])

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
      if (isCTADisabled) {
        return
      }
      onClose()
      navigate('/home')
    }, [isCTADisabled, onClose, navigate])

    const handleSwapAgainClick = useCallback(() => {
      if (isLoading) return
      onClose()
    }, [isLoading, onClose])

    if (isTrackingPage && !isTrackingInSync) {
      return (
        <BottomModal
          title={''}
          fullScreen={true}
          onClose={() => {
            onClose()
          }}
          isOpen={true}
          containerClassName='h-full'
          headerClassName='dark:bg-gray-950 bg-white-100'
          className='dark:bg-gray-950 bg-white-100 !p-0 min-h-[calc(100%-65px)]'
        >
          <div className='flex flex-col items-center justify-center h-full'>
            <Loader />
          </div>
        </BottomModal>
      )
    }

    if (showLedgerPopup) {
      return (
        <BottomModal
          title={''}
          fullScreen={true}
          onClose={() => {
            onClose()
          }}
          isOpen={true}
          containerClassName='h-full'
          headerClassName='dark:bg-gray-950 bg-white-100'
          className='dark:bg-gray-950 bg-white-100 !p-0 min-h-[calc(100%-65px)]'
        >
          <LedgerConfirmationPopup showLedgerPopup showLedgerPopupText={showLedgerPopupText} />
        </BottomModal>
      )
    }

    return (
      <BottomModal
        title={''}
        fullScreen={true}
        onClose={() => {
          onClose()
        }}
        isOpen={true}
        containerClassName='h-full'
        headerClassName='dark:bg-gray-950 bg-white-100'
        contentClassName='dark:bg-gray-950 bg-white-100'
        className='dark:bg-gray-950 bg-white-100'
      >
        <div className='flex flex-col gap-y-8 justify-center items-center px-10 mt-[75px]'>
          <div className='h-[100px] w-[100px]'>
            {isLoading ? (
              <div className='h-[100px] w-[100px] p-8 rounded-full bg-secondary-200 animate-spin'>
                <img src={Images.Swap.Rotate} />
              </div>
            ) : isSuccessFull ? (
              <div className='h-[100px] w-[100px] p-8 rounded-full bg-green-400'>
                <img src={Images.Swap.CheckGreen} />
              </div>
            ) : (
              <div className='h-[100px] w-[100px] p-8 rounded-full bg-red-600 dark:bg-red-400'>
                <img src={Images.Swap.FailedRed} />
              </div>
            )}
          </div>
          <div className='flex flex-col items-center gap-y-6'>
            <div className='flex flex-col items-center gap-y-3'>
              <Text size='xl' color='text-monochrome' className='font-bold'>
                {isLoading
                  ? 'Swap in progress'
                  : isSuccessFull
                  ? 'Swap successful!'
                  : 'Swap failed'}
              </Text>
              <Text size='sm' color='text-secondary-800' className='font-normal text-center'>
                {isLoading
                  ? `${
                      destinationToken?.symbol ?? 'Token'
                    } will be deposited in your account once the transaction is complete`
                  : isSuccessFull
                  ? `Tokens have been deposited into your wallet`
                  : failedActionWasSwap
                  ? `The price changed too much during the swap. Adjust your slippage tolerance and try again.`
                  : `There was a network issue. Please check your internet connection or try again later.`}
              </Text>
            </div>

            {!!txStatus?.[0].responses?.[0]?.packetTxs?.sendTx?.txHash && (
              <div
                className='flex gap-x-1 items-center cursor-pointer'
                onClick={() => {
                  navigate('/activity')
                }}
              >
                <Text size='sm' color='text-accent-blue' className='font-medium'>
                  View transaction
                </Text>
                <CaretRight size={12} className='text-accent-blue' />
              </div>
            )}
          </div>
        </div>
        <div className=' flex flex-row items-center justify-between gap-4 absolute bottom-0 left-0 right-0 p-6 max-[350px]:!px-4 !z-[1000]'>
          <Button
            className={'flex-1'}
            variant={'mono'}
            onClick={handleHomeBtnClick}
            disabled={isCTADisabled}
          >
            Home
          </Button>
          <Button className={'flex-1'} onClick={handleSwapAgainClick} disabled={isCTADisabled}>
            Swap Again
          </Button>
        </div>
        {/* </div> */}
      </BottomModal>
    )
  },
)
