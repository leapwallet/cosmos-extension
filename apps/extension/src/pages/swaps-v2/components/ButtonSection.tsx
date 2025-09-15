import { useActiveWallet, WALLETTYPE } from '@leapwallet/cosmos-wallet-hooks'
import { Buttons } from '@leapwallet/leap-ui'
import { ArrowSquareOut } from '@phosphor-icons/react'
import classNames from 'classnames'
import { useOpenLedgerReconnect } from 'hooks/useOpenLedgerReconnect'
import { observer } from 'mobx-react-lite'
import React, { useMemo } from 'react'
import { activeChainStore } from 'stores/active-chain-store'
import { importWatchWalletSeedPopupStore } from 'stores/import-watch-wallet-seed-popup-store'

import { isNoRoutesAvailableError } from '../hooks'

type ButtonSectionProps = {
  isMoreThanOneStepTransaction: boolean
  redirectUrl: string
  errorMsg: string
  invalidAmount: boolean
  amountExceedsBalance: boolean
  bridgeFeeError: string | null
  onReviewClick: (val: boolean) => void
  inAmountEmpty: boolean
  isRefreshing: boolean
  checkNeeded: boolean
  isPriceImpactChecked: boolean
  reviewBtnDisabled: boolean
  isLedgerDisconnectedError?: boolean
}

const ButtonSection = ({
  invalidAmount,
  amountExceedsBalance,
  isMoreThanOneStepTransaction,
  redirectUrl,
  errorMsg,
  bridgeFeeError,
  inAmountEmpty,
  isRefreshing,
  checkNeeded,
  isPriceImpactChecked,
  reviewBtnDisabled,
  onReviewClick,
  isLedgerDisconnectedError,
}: ButtonSectionProps) => {
  const activeWallet = useActiveWallet()
  const openLedgerReconnect = useOpenLedgerReconnect()
  const reviewBtnText = useMemo(() => {
    if (invalidAmount) {
      return 'Amount must be greater than 0'
    }
    if (amountExceedsBalance) {
      return 'Insufficient balance'
    }
    if (isNoRoutesAvailableError(errorMsg)) {
      return 'No transaction routes available'
    }
    if (
      activeChainStore.activeChain === 'evmos' &&
      activeWallet?.walletType === WALLETTYPE.LEDGER
    ) {
      return 'Not supported using Ledger wallet'
    }

    if (bridgeFeeError) {
      return bridgeFeeError
    }

    if (inAmountEmpty) {
      return 'Enter amount'
    }

    if (isLedgerDisconnectedError) {
      return 'Connect Ledger'
    }

    return 'Review Transfer'
  }, [
    activeWallet?.walletType,
    amountExceedsBalance,
    inAmountEmpty,
    errorMsg,
    invalidAmount,
    bridgeFeeError,
    isLedgerDisconnectedError,
  ])

  const reviewDisabled = useMemo(() => {
    if (
      activeChainStore.activeChain === 'evmos' &&
      activeWallet?.walletType === WALLETTYPE.LEDGER
    ) {
      return true
    }
    return reviewBtnDisabled || isRefreshing || (checkNeeded && !isPriceImpactChecked)
  }, [activeWallet?.walletType, checkNeeded, isPriceImpactChecked, isRefreshing, reviewBtnDisabled])

  return (
    <div className='sticky bottom-0 left-0 z-[2] right-0 bg-secondary-100 px-5 py-4'>
      {isMoreThanOneStepTransaction ? (
        <Buttons.Generic
          className='w-full dark:!bg-white-100 !bg-black-100 text-white-100 dark:text-black-100 h-[52px]'
          onClick={() => window.open(redirectUrl, '_blank')}
          style={{ boxShadow: 'none' }}
        >
          <span className='flex items-center gap-1'>
            Swap on Leap web app <ArrowSquareOut size={20} className='!leading-[20px] !text-lg' />
          </span>
        </Buttons.Generic>
      ) : (
        <>
          <Buttons.Generic
            className={classNames('w-full  h-[52px] text-white-100', {
              [`!bg-primary`]: !(
                invalidAmount ||
                amountExceedsBalance ||
                isNoRoutesAvailableError(errorMsg) ||
                !!bridgeFeeError
              ),
              '!bg-destructive-100/40':
                invalidAmount ||
                amountExceedsBalance ||
                isNoRoutesAvailableError(errorMsg) ||
                !!bridgeFeeError,
            })}
            disabled={reviewDisabled}
            style={{ boxShadow: 'none' }}
            onClick={() => {
              if (isLedgerDisconnectedError) {
                openLedgerReconnect()
                return
              }
              if (activeWallet?.watchWallet) {
                importWatchWalletSeedPopupStore.setShowPopup(true)
              } else {
                onReviewClick(true)
              }
            }}
          >
            {reviewBtnText}
          </Buttons.Generic>
        </>
      )}
    </div>
  )
}

export default observer(ButtonSection)
