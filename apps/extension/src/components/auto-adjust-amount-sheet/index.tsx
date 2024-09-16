import {
  AdjustmentType,
  getAutoAdjustAmount,
  getKeyToUseForDenoms,
  Token,
  useChainInfo,
  useShouldShowAutoAdjustSheet,
} from '@leapwallet/cosmos-wallet-hooks'
import { fromSmall, NativeDenom, SupportedChain, toSmall } from '@leapwallet/cosmos-wallet-sdk'
import { RootDenomsStore } from '@leapwallet/cosmos-wallet-store'
import { Buttons, ThemeName, useTheme } from '@leapwallet/leap-ui'
import { ArrowRight } from '@phosphor-icons/react'
import BottomModal from 'components/bottom-modal'
import { observer } from 'mobx-react-lite'
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
    const displayString = fromSmall(tokenAmount, nativeDenom?.coinDecimals ?? 6)
    return `${displayString} ${nativeDenom?.coinDenom ?? ''}`
  }, [nativeDenom?.coinDecimals, nativeDenom?.coinDenom, tokenAmount])

  const displayUpdatedAmount = useMemo(() => {
    if (updatedAmount) {
      return `${updatedAmount} ${nativeDenom?.coinDenom ?? ''}`
    }
    return null
  }, [nativeDenom?.coinDenom, updatedAmount])

  return (
    <BottomModal
      isOpen={isOpen}
      title='Adjust for Transaction Fees'
      closeOnBackdropClick={true}
      onClose={onCancel}
      onActionButtonClick={onBack}
      containerClassName={'!max-panel-height'}
      contentClassName='!bg-white-100 dark:!bg-gray-950'
      className='p-6'
    >
      <p className='text-gray-200 font-medium mb-6'>
        Confirming this transaction may leave you with insufficient {nativeDenom?.coinDenom ?? ''}{' '}
        balance for future transaction fees.
      </p>

      <div className='rounded-2xl p-4 dark:bg-gray-900 bg-gray-50 mb-6'>
        <p className='text-sm text-white-100 font-bold mb-4'>Should we auto-adjust the amount?</p>

        <div className='flex items-center rounded-xl p-4 dark:bg-gray-850 bg-gray-100 gap-4'>
          <div className='flex-1 text-right text-sm text-white-100 font-bold'>
            {displayTokenAmount}
          </div>

          <ArrowRight size={24} className='text-gray-400' />
          <div className='flex-1 text-sm text-green-500 font-bold'>{displayUpdatedAmount}</div>
        </div>
      </div>

      <div className='flex items-center gap-6 mt-auto'>
        <Buttons.Generic
          color={theme === ThemeName.DARK ? Colors.gray900 : Colors.gray300}
          size='normal'
          className='w-full'
          title="Don't adjust"
          onClick={onCancel}
        >
          Cancel
        </Buttons.Generic>

        <Buttons.Generic
          color={Colors.green600}
          size='normal'
          className='w-full'
          title='Proceed'
          onClick={handleAdjust}
        >
          Proceed
        </Buttons.Generic>
      </div>
    </BottomModal>
  )
}

const CompulsoryAutoAdjustAmountSheet: React.FC<
  AutoAdjustAmountSheetProps & {
    tokenBalance: string
  }
> = ({
  isOpen,
  tokenAmount,
  tokenBalance,
  feeAmount,
  setAmount,
  nativeDenom,
  onAdjust,
  onCancel,
}) => {
  const { theme } = useTheme()
  const updatedAmount = useMemo(() => {
    return getAutoAdjustAmount({
      tokenAmount: tokenBalance,
      feeAmount,
      nativeDenom,
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    const displayString = fromSmall(tokenAmount, nativeDenom?.coinDecimals ?? 6)
    return `${displayString} ${nativeDenom?.coinDenom ?? ''}`
  }, [nativeDenom?.coinDecimals, nativeDenom?.coinDenom, tokenAmount])

  const displayUpdatedAmount = useMemo(() => {
    if (updatedAmount) {
      return `${updatedAmount} ${nativeDenom?.coinDenom ?? ''}`
    }
    return null
  }, [nativeDenom?.coinDenom, updatedAmount])

  return (
    <BottomModal
      isOpen={isOpen}
      onClose={onCancel}
      closeOnBackdropClick={false}
      title='Adjust for Transaction Fees'
      containerClassName={'!bg-white-100 dark:!bg-gray-950 !max-panel-height'}
      contentClassName='!bg-white-100 dark:!bg-gray-950'
      className='p-6'
    >
      <p className='text-gray-200 font-medium mb-6'>
        You seem to have insufficient {nativeDenom?.coinDenom ?? ''} balance to pay transaction
        fees.
      </p>

      <div className='rounded-2xl p-4 dark:bg-gray-900 bg-gray-50 mb-6'>
        <p className='text-sm text-white-100 font-bold mb-4'>Should we auto-adjust the amount?</p>

        <div className='flex items-center rounded-xl p-4 dark:bg-gray-850 bg-gray-100 gap-4'>
          <div className='flex-1 text-right text-sm text-white-100 font-bold'>
            {displayTokenAmount}
          </div>

          <ArrowRight size={24} className='text-gray-400' />
          <div className='flex-1 text-sm text-green-500 font-bold'>{displayUpdatedAmount}</div>
        </div>
      </div>

      <div className='flex items-center gap-6 mt-auto'>
        <Buttons.Generic
          color={theme === ThemeName.DARK ? Colors.gray900 : Colors.gray300}
          size='normal'
          className='w-full'
          title="Don't adjust"
          onClick={onCancel}
        >
          Cancel
        </Buttons.Generic>

        <Buttons.Generic
          color={Colors.green600}
          size='normal'
          className='w-full'
          title='Proceed'
          onClick={handleAdjust}
        >
          Proceed
        </Buttons.Generic>
      </div>
    </BottomModal>
  )
}

export const AutoAdjustAmountSheet = observer(
  ({
    amount,
    setAmount,
    selectedToken,
    fee,
    setShowReviewSheet,
    closeAdjustmentSheet,
    forceChain,
    forceNetwork,
    rootDenomsStore,
  }: {
    amount: string
    // eslint-disable-next-line no-unused-vars
    setAmount: (amount: string) => void
    selectedToken: {
      amount: Token['amount']
      coinMinimalDenom: Token['coinMinimalDenom']
      chain?: Token['chain']
    }
    fee: { amount: string; denom: string }
    // eslint-disable-next-line no-unused-vars
    setShowReviewSheet: (show: boolean) => void
    closeAdjustmentSheet: () => void
    forceChain?: SupportedChain
    forceNetwork?: 'mainnet' | 'testnet'
    rootDenomsStore: RootDenomsStore
  }) => {
    const chainInfo = useChainInfo(forceChain)
    const denoms = rootDenomsStore.allDenoms
    const shouldShowAutoAdjustSheet = useShouldShowAutoAdjustSheet(denoms, forceChain, forceNetwork)
    const navigate = useNavigate()

    const nativeDenom = useMemo(() => {
      if (chainInfo.beta) {
        return Object.values(chainInfo.nativeDenoms)[0]
      }

      const key = getKeyToUseForDenoms(selectedToken.coinMinimalDenom, selectedToken.chain ?? '')
      return denoms[key]
    }, [
      chainInfo.beta,
      chainInfo.nativeDenoms,
      denoms,
      selectedToken.chain,
      selectedToken.coinMinimalDenom,
    ])

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
      () => toSmall(amount, nativeDenom?.coinDecimals ?? 6),
      [amount, nativeDenom?.coinDecimals],
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
          tokenBalance={tokenBalance}
          feeAmount={fee.amount}
          setAmount={setAmount}
          onAdjust={allowReview}
          onCancel={handleCompulsoryCancel}
        />
      </>
    )
  },
)
