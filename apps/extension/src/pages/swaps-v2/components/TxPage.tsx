import { GasOptions, useChainInfo } from '@leapwallet/cosmos-wallet-hooks'
import { GasPrice, NativeDenom } from '@leapwallet/cosmos-wallet-sdk'
import { TXN_STATUS } from '@leapwallet/elements-core'
import { Buttons, Header, HeaderActionType, ThemeName, useTheme } from '@leapwallet/leap-ui'
import PopupLayout from 'components/layout/popup-layout'
import LedgerConfirmationPopup from 'components/ledger-confirmation/LedgerConfirmationPopup'
import { LoaderAnimation } from 'components/loader/Loader'
import { PENDING_SWAP_TXS } from 'config/storage-keys'
import { Images } from 'images'
import React, { useEffect, useMemo, useState } from 'react'
import { SourceChain, SourceToken } from 'types/swap'
import Browser from 'webextension-polyfill'

import { useExecuteTx } from '../hooks'
import { SwapError, TxPageAmount, TxPageSteps, TxReviewTokenInfo } from './index'

export type TxPageProps = {
  onClose: () => void
  setLedgerError?: (ledgerError?: string) => void
  sourceToken: SourceToken | null
  destinationToken: SourceToken | null
  sourceChain: SourceChain | undefined
  destinationChain: SourceChain | undefined
  inAmount: string
  amountOut: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  route: any
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
}

export function TxPage({
  onClose,
  setLedgerError,
  sourceChain,
  sourceToken,
  destinationChain,
  destinationToken,
  inAmount,
  amountOut,
  route,
  userPreferredGasLimit,
  userPreferredGasPrice,
  gasEstimate,
  feeDenom,
  gasOption,
  feeAmount,
  refetchSourceBalances,
  refetchDestinationBalances,
}: TxPageProps) {
  const activeChainInfo = useChainInfo()
  const darkTheme = (useTheme()?.theme ?? '') === ThemeName.DARK

  const [showLedgerPopup, setShowLedgerPopup] = useState(false)
  const [_feeAmount, setFeeAmount] = useState('')

  const {
    callExecuteTx,

    txStatus,
    firstTxnError,
    timeoutError,
    isLoading,
    unableToTrackError,
  } = useExecuteTx({
    setShowLedgerPopup,
    setLedgerError,
    route,
    sourceChain,
    sourceToken,
    destinationChain,
    destinationToken,
    feeDenom,
    gasEstimate,
    gasOption,
    userPreferredGasLimit,
    userPreferredGasPrice,
    inAmount,
    amountOut,
    setFeeAmount,
    feeAmount,
    refetchDestinationBalances,
    refetchSourceBalances,
  })

  const [_sourceToken] = useState(sourceToken)
  const [_destinationToken] = useState(destinationToken)
  const [_sourceChain] = useState(sourceChain)
  const [_destinationChain] = useState(destinationChain)
  const [_inAmount] = useState(inAmount)
  const [_amountOut] = useState(amountOut)
  const [_route] = useState(route)

  const [isSuccessFull, setIsSuccessFull] = useState(false)

  const headerTitle = useMemo(() => {
    if (isLoading) {
      return 'Transaction Processing...'
    }

    if (!isLoading && isSuccessFull) {
      return 'Transaction Success'
    } else {
      return 'Transaction Failed'
    }
  }, [isLoading, isSuccessFull])

  useEffect(() => {
    setIsSuccessFull(false)
    callExecuteTx()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!isLoading && !timeoutError && !firstTxnError && txStatus) {
      const isTxnComplete = txStatus.every((txn) => txn.isComplete)
      const isFailed = txStatus.some((txn) => txn.status === TXN_STATUS.FAILED)

      if (isTxnComplete || isFailed) {
        setIsSuccessFull(
          txStatus.every((txn: { status: TXN_STATUS }) => txn.status === TXN_STATUS.SUCCESS),
        )
      }
    }
  }, [firstTxnError, isLoading, timeoutError, txStatus, unableToTrackError])

  const handleClose = async () => {
    if (
      isLoading &&
      route &&
      route.messages.every((msg: { customTxHash: string }) => msg.customTxHash)
    ) {
      const storage = await Browser.storage.local.get([PENDING_SWAP_TXS])
      const previousPendingTxs = JSON.parse(storage[PENDING_SWAP_TXS] ?? '[]')

      await Browser.storage.local.set({
        [PENDING_SWAP_TXS]: JSON.stringify([
          ...previousPendingTxs,
          {
            route,
            sourceChain,
            sourceToken,
            destinationChain,
            destinationToken,
            feeDenom,
            gasEstimate,
            gasOption,
            userPreferredGasLimit,
            userPreferredGasPrice,
            inAmount,
            amountOut,
            feeAmount: feeAmount ?? _feeAmount,
          },
        ]),
      })
    }

    setIsSuccessFull(false)
  }

  if (showLedgerPopup) {
    return <LedgerConfirmationPopup showLedgerPopup />
  }

  return (
    <div className='absolute w-[400px] overflow-clip top-0'>
      <div className='relative'>
        <PopupLayout
          header={
            <Header
              action={{
                onClick: () => {
                  onClose()
                  handleClose()
                },
                type: HeaderActionType.BACK,
              }}
              title={headerTitle}
              topColor={activeChainInfo.theme.primaryColor}
            />
          }
        >
          <div className='p-7 w-full pb-16'>
            <div className='w-full bg-white-100 dark:bg-gray-900 rounded-2xl flex flex-col p-4 gap-4 mb-4'>
              {isLoading ? (
                <div className='flex flex-col items-center gap-2'>
                  <LoaderAnimation color='#29a874' className='w-16 h-16' />
                </div>
              ) : (
                <div className='flex flex-col items-center gap-2'>
                  {isSuccessFull ? (
                    <img src={Images.Activity.SendDetails} className='h-16 w-16' />
                  ) : (
                    <img src={Images.Activity.Error} className='h-16 w-16' />
                  )}

                  <div className='text-xl font-bold text-black-100 dark:text-white-100 text-left'>
                    {isSuccessFull ? 'Swap successful' : 'Swap failed'}
                  </div>
                </div>
              )}

              <div className='flex items-center justify-around'>
                <TxReviewTokenInfo
                  amount={_inAmount}
                  token={_sourceToken}
                  chain={_sourceChain}
                  tokenImgClassName='w-[48px] h-[48px]'
                  chainImgClassName='w-[16px] h-[16px] right-[8px]'
                />
                <div className='dark:text-gray-400'>
                  <span className='material-icons-round'>keyboard_double_arrow_right</span>
                </div>

                <TxReviewTokenInfo
                  amount={_amountOut}
                  token={_destinationToken}
                  chain={_destinationChain}
                  tokenImgClassName='w-[48px] h-[48px]'
                  chainImgClassName='w-[16px] h-[16px] right-[8px]'
                />
              </div>
            </div>

            <div className='w-full bg-white-100 dark:bg-gray-900 rounded-2xl flex flex-col p-4 gap-4 mb-4'>
              <TxPageAmount
                amount={_inAmount}
                token={_sourceToken}
                chain={_sourceChain}
                isFirst={true}
              />
              <TxPageSteps route={_route} txStatus={txStatus} />
              <TxPageAmount
                amount={_amountOut}
                token={_destinationToken}
                chain={_destinationChain}
              />
            </div>

            {firstTxnError ? <SwapError errorMsg={firstTxnError} className='mb-4' /> : null}
            {timeoutError ? <SwapError errorMsg='Request timed out' className='mb-4' /> : null}

            {unableToTrackError ? (
              <div className='w-full bg-white-100 dark:bg-gray-900 dark:text-red-300 flex gap-2 items-center p-2 rounded-lg border border-red-300 mx-auto mb-4'>
                <img src={Images.Misc.FilledExclamationMark} />
                <span dangerouslySetInnerHTML={{ __html: unableToTrackError }} />
              </div>
            ) : null}
          </div>
        </PopupLayout>

        <div
          className='flex flex-col items-center gap-2 bg-gray-50 dark:bg-black-100 absolute bottom-0 left-0 right-0 pb-4 z-10'
          style={{ boxShadow: `0 -12px 16px${darkTheme ? '' : ' #f4f4f4'}` }}
        >
          <Buttons.Generic
            className='bg-gray-200 dark:bg-gray-900 text-gray-800 dark:text-white-100 w-[344px] m-auto'
            style={{ boxShadow: 'none' }}
            onClick={() => {
              onClose()
              handleClose()
            }}
          >
            Close
          </Buttons.Generic>
        </div>
      </div>
    </div>
  )
}
