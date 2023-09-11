import {
  AdjustmentType,
  getAutoAdjustAmount,
  Token,
  useActiveChain,
  useChainInfo,
  useDenoms,
  useShouldShowAutoAdjustSheet,
} from '@leapwallet/cosmos-wallet-hooks'
import { fromSmall, NativeDenom, toSmall } from '@leapwallet/cosmos-wallet-sdk'
import { Buttons, ThemeName, useTheme } from '@leapwallet/leap-ui'
import BottomModal from 'components/bottom-modal'
import React, { useCallback, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Colors } from 'theme/colors'

type AutoAdjustAmountSheetProps = {
  onCancel: () => void
  onAdjust: () => void
  isOpen: boolean
  tokenAmount: string
  feeAmount: string
  // eslint-disable-next-line no-unused-vars
  setAmount: (amount: string) => void
  nativeDenom: NativeDenom
}

const OptionalAutoAdjustAmountSheet: React.FC<
  AutoAdjustAmountSheetProps & {
    onBack: () => void
  }
> = ({ isOpen, tokenAmount, feeAmount, setAmount, nativeDenom, onAdjust, onCancel, onBack }) => {
  const { theme } = useTheme()
  const activeChain = useActiveChain()

  const updatedAmount = useMemo(() => {
    return getAutoAdjustAmount({
      tokenAmount,
      feeAmount,
      nativeDenom,
    })
  }, [feeAmount, nativeDenom, tokenAmount])

  const handleAdjust = useCallback(() => {
    if (updatedAmount) {
      setAmount(updatedAmount)
      onAdjust()
    } else {
      onCancel()
    }
  }, [onAdjust, onCancel, setAmount, updatedAmount])

  const displayTokenAmount = useMemo(() => {
    const displayString = fromSmall(tokenAmount, nativeDenom.coinDecimals)
    return `${displayString} ${nativeDenom.coinDenom}`
  }, [nativeDenom.coinDecimals, nativeDenom.coinDenom, tokenAmount])

  const displayUpdatedAmount = useMemo(() => {
    if (updatedAmount) {
      return `${updatedAmount} ${nativeDenom.coinDenom}`
    }
    return null
  }, [nativeDenom.coinDenom, updatedAmount])

  return (
    <BottomModal
      isOpen={isOpen}
      title='Adjust for Transaction Fees'
      closeOnBackdropClick={true}
      onClose={onCancel}
      onActionButtonClick={onBack}
    >
      <div className='rounded-2xl p-4 dark:bg-gray-900 bg-white-100 dark:text-gray-200 text-gray-800'>
        <p>
          Confirming this transaction may leave you with insufficient {nativeDenom.coinDenom}{' '}
          balance for future transaction fees.
        </p>
        <p className='mt-2'>
          Should we adjust the amount from{' '}
          <span className='text-green-500 font-medium'>{displayTokenAmount}</span> to{' '}
          <span className='text-green-500 font-medium'>{displayUpdatedAmount}</span>?
        </p>
      </div>
      <div className='flex flex-col items-center gap-y-3 mt-5'>
        <Buttons.Generic
          color={theme === ThemeName.DARK ? Colors.gray900 : Colors.gray300}
          size='normal'
          className='w-full'
          title="Don't adjust"
          onClick={onCancel}
        >
          Don&apos;t adjust
        </Buttons.Generic>
        <Buttons.Generic
          color={Colors.getChainColor(activeChain)}
          size='normal'
          className='w-full'
          title='Auto-adjust'
          onClick={handleAdjust}
        >
          Auto-adjust
        </Buttons.Generic>
      </div>
    </BottomModal>
  )
}

const CompulsoryAutoAdjustAmountSheet: React.FC<AutoAdjustAmountSheetProps> = ({
  isOpen,
  tokenAmount,
  feeAmount,
  setAmount,
  nativeDenom,
  onAdjust,
  onCancel,
}) => {
  const { theme } = useTheme()
  const activeChain = useActiveChain()

  const updatedAmount = useMemo(() => {
    return getAutoAdjustAmount({
      tokenAmount,
      feeAmount,
      nativeDenom,
    })
  }, [feeAmount, nativeDenom, tokenAmount])

  const handleAdjust = useCallback(() => {
    if (updatedAmount) {
      setAmount(updatedAmount)
      onAdjust()
    } else {
      onCancel()
    }
  }, [onAdjust, onCancel, setAmount, updatedAmount])

  const displayTokenAmount = useMemo(() => {
    const displayString = fromSmall(tokenAmount, nativeDenom.coinDecimals)
    return `${displayString} ${nativeDenom.coinDenom}`
  }, [nativeDenom.coinDecimals, nativeDenom.coinDenom, tokenAmount])

  const displayUpdatedAmount = useMemo(() => {
    if (updatedAmount) {
      return `${updatedAmount} ${nativeDenom.coinDenom}`
    }
    return null
  }, [nativeDenom.coinDenom, updatedAmount])

  return (
    <BottomModal
      isOpen={isOpen}
      onClose={onCancel}
      closeOnBackdropClick={false}
      title='Adjust for Transaction Fees'
      hideActionButton={true}
    >
      <div className='rounded-2xl p-4 dark:bg-gray-900 bg-white-100 dark:text-gray-200 text-gray-800'>
        <p>Insufficient {nativeDenom.coinDenom} balance to pay transaction fees.</p>
        <p className='mt-2'>
          Should we adjust the amount from{' '}
          <span className='text-green-500 font-medium'>{displayTokenAmount}</span> to{' '}
          <span className='text-green-500 font-medium'>{displayUpdatedAmount}</span>?
        </p>
      </div>
      <div className='flex flex-col items-center gap-y-3 mt-5'>
        <Buttons.Generic
          color={theme === ThemeName.DARK ? Colors.gray900 : Colors.gray300}
          size='normal'
          className='w-full'
          title="Don't adjust"
          onClick={onCancel}
        >
          Cancel Transaction
        </Buttons.Generic>
        <Buttons.Generic
          color={Colors.getChainColor(activeChain)}
          size='normal'
          className='w-full'
          title='Auto-adjust'
          onClick={handleAdjust}
        >
          Auto-adjust
        </Buttons.Generic>
      </div>
    </BottomModal>
  )
}

export const AutoAdjustAmountSheet: React.FC<{
  amount: string
  // eslint-disable-next-line no-unused-vars
  setAmount: (amount: string) => void
  selectedToken: {
    amount: Token['amount']
    coinMinimalDenom: Token['coinMinimalDenom']
  }
  fee: { amount: string; denom: string }
  // eslint-disable-next-line no-unused-vars
  setShowReviewSheet: (show: boolean) => void
  closeAdjustmentSheet: () => void
}> = ({ amount, setAmount, selectedToken, fee, setShowReviewSheet, closeAdjustmentSheet }) => {
  const chainInfo = useChainInfo()
  const shouldShowAutoAdjustSheet = useShouldShowAutoAdjustSheet()
  const navigate = useNavigate()
  const denoms = useDenoms()

  const nativeDenom = useMemo(() => {
    if (chainInfo.beta) {
      return Object.values(chainInfo.nativeDenoms)[0]
    }
    return denoms[selectedToken.coinMinimalDenom]
  }, [chainInfo.beta, chainInfo.nativeDenoms, denoms, selectedToken.coinMinimalDenom])

  const allowReview = useCallback(() => {
    closeAdjustmentSheet()
    setShowReviewSheet(true)
  }, [closeAdjustmentSheet, setShowReviewSheet])

  const handleCompulsoryCancel = useCallback(() => {
    closeAdjustmentSheet()
    navigate('/home')
  }, [closeAdjustmentSheet, navigate])

  const tokenBalance = useMemo(
    () => toSmall(selectedToken?.amount ?? '0', nativeDenom?.coinDecimals ?? 6),
    [nativeDenom?.coinDecimals, selectedToken?.amount],
  )

  const tokenAmount = useMemo(
    () => toSmall(amount, nativeDenom.coinDecimals),
    [amount, nativeDenom.coinDecimals],
  )

  const adjustmentType = useMemo(() => {
    return shouldShowAutoAdjustSheet({
      feeAmount: fee.amount,
      feeDenom: fee.denom,
      tokenAmount: tokenAmount,
      tokenDenom: selectedToken.coinMinimalDenom,
      tokenBalance: tokenBalance,
    })
  }, [
    fee.amount,
    fee.denom,
    selectedToken.coinMinimalDenom,
    shouldShowAutoAdjustSheet,
    tokenAmount,
    tokenBalance,
  ])

  useEffect(() => {
    if (adjustmentType === AdjustmentType.NONE) {
      allowReview()
    }
  }, [adjustmentType, allowReview])

  return (
    <>
      <OptionalAutoAdjustAmountSheet
        isOpen={adjustmentType === AdjustmentType.OPTIONAL}
        nativeDenom={nativeDenom}
        tokenAmount={tokenAmount}
        feeAmount={fee.amount}
        setAmount={setAmount}
        onBack={closeAdjustmentSheet}
        onAdjust={allowReview}
        onCancel={allowReview}
      />
      <CompulsoryAutoAdjustAmountSheet
        isOpen={adjustmentType === AdjustmentType.COMPULSORY}
        nativeDenom={nativeDenom}
        tokenAmount={tokenAmount}
        feeAmount={fee.amount}
        setAmount={setAmount}
        onAdjust={allowReview}
        onCancel={handleCompulsoryCancel}
      />
    </>
  )
}
