import {
  AdjustmentType,
  formatTokenAmount,
  getAutoAdjustAmount,
  getKeyToUseForDenoms,
  Token,
  useChainInfo,
  useShouldShowAutoAdjustSheet,
} from '@leapwallet/cosmos-wallet-hooks'
import { fromSmall, NativeDenom, SupportedChain, toSmall } from '@leapwallet/cosmos-wallet-sdk'
import { ArrowRight } from '@phosphor-icons/react'
import BottomModal from 'components/bottom-modal'
import { Button } from 'components/ui/button'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useMemo } from 'react'
import { rootDenomsStore } from 'stores/denoms-store-instance'

type AutoAdjustAmountSheetProps = {
  onCancel: () => void
  onAdjust: () => void
  isOpen: boolean
  tokenAmount: string
  feeAmount: string
  setAmount: (amount: string) => void
  nativeDenom: NativeDenom
  decimalsToUse?: number
}

const OptionalAutoAdjustAmountSheet: React.FC<
  AutoAdjustAmountSheetProps & {
    onBack: () => void
  }
> = ({
  isOpen,
  tokenAmount,
  feeAmount,
  setAmount,
  nativeDenom,
  onAdjust,
  onCancel,
  decimalsToUse,
}) => {
  const updatedAmount = useMemo(() => {
    return getAutoAdjustAmount({
      tokenAmount,
      feeAmount,
      nativeDenom,
      decimalsToUse,
    })
  }, [feeAmount, nativeDenom, decimalsToUse, tokenAmount])

  const handleAdjust = useCallback(() => {
    if (updatedAmount) {
      setAmount(updatedAmount)
      onAdjust()
    } else {
      onCancel()
    }
  }, [onAdjust, onCancel, setAmount, updatedAmount])

  const displayTokenAmount = useMemo(() => {
    const displayString = fromSmall(tokenAmount, decimalsToUse ?? 6)

    return formatTokenAmount(
      displayString,
      nativeDenom?.coinDenom ?? '',
      Math.min(decimalsToUse ?? 6, 6),
    )
  }, [decimalsToUse, nativeDenom?.coinDenom, tokenAmount])

  const displayUpdatedAmount = useMemo(() => {
    if (updatedAmount) {
      return formatTokenAmount(
        updatedAmount,
        nativeDenom?.coinDenom ?? '',
        Math.min(decimalsToUse ?? 6, 6),
      )
    }

    return null
  }, [decimalsToUse, nativeDenom?.coinDenom, updatedAmount])

  return (
    <BottomModal
      isOpen={isOpen}
      onClose={onCancel}
      title='Adjust for transaction fees'
      className='!px-6 !py-7'
    >
      <p className='text-secondary-800 text-sm font-medium mb-8'>
        Confirming this transaction may leave you with insufficient {nativeDenom?.coinDenom ?? ''}{' '}
        balance for future transaction fees. Should we auto-adjust the amount?
      </p>

      <div className='flex items-center rounded-lg bg-secondary-100 mb-10 p-5'>
        <div className='flex-1 text-center text-sm text-monochrome font-bold'>
          {displayTokenAmount}
        </div>

        <ArrowRight size={32} className='text-monochrome bg-secondary-300 p-2 rounded-full' />
        <div className='flex-1 text-center text-sm text-green-500 font-bold'>
          {displayUpdatedAmount}
        </div>
      </div>

      <Button className='w-full' onClick={handleAdjust}>
        Confirm and proceed
      </Button>
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
  decimalsToUse,
}) => {
  const updatedAmount = useMemo(() => {
    return getAutoAdjustAmount({
      tokenAmount: tokenBalance,
      feeAmount,
      nativeDenom,
      decimalsToUse,
    })
  }, [tokenBalance, feeAmount, nativeDenom, decimalsToUse])

  const handleAdjust = useCallback(() => {
    if (updatedAmount) {
      setAmount(updatedAmount)
      onAdjust()
    } else {
      onCancel()
    }
  }, [onAdjust, onCancel, setAmount, updatedAmount])

  const displayTokenAmount = useMemo(() => {
    const displayString = fromSmall(tokenAmount, decimalsToUse ?? 6)

    return formatTokenAmount(
      displayString,
      nativeDenom?.coinDenom ?? '',
      Math.min(decimalsToUse ?? 6, 6),
    )
  }, [decimalsToUse, nativeDenom?.coinDenom, tokenAmount])

  const displayUpdatedAmount = useMemo(() => {
    if (updatedAmount) {
      return formatTokenAmount(
        updatedAmount,
        nativeDenom?.coinDenom ?? '',
        Math.min(decimalsToUse ?? 6, 6),
      )
    }

    return null
  }, [decimalsToUse, nativeDenom?.coinDenom, updatedAmount])

  return (
    <BottomModal
      isOpen={isOpen}
      onClose={onCancel}
      title='Adjust for transaction fees'
      className='!px-6 !py-7'
    >
      <p className='text-secondary-800 text-sm font-medium mb-8'>
        You seem to have insufficient {nativeDenom?.coinDenom ?? ''} balance to pay transaction
        fees. Should we auto-adjust the amount?
      </p>

      <div className='flex items-center rounded-lg bg-secondary mb-10 p-5'>
        <div className='flex-1 text-center text-sm text-monochrome font-bold'>
          {displayTokenAmount}
        </div>

        <ArrowRight size={32} className='text-monochrome bg-secondary-300 p-2 rounded-full' />
        <div className='flex-1 text-center text-sm text-green-500 font-bold'>
          {displayUpdatedAmount}
        </div>
      </div>

      <Button className='w-full' onClick={handleAdjust}>
        Confirm and proceed
      </Button>
    </BottomModal>
  )
}

type ObserverAutoAdjustAmountSheetProps = {
  amount: string
  setAmount: (amount: string) => void
  selectedToken: {
    amount: Token['amount']
    coinMinimalDenom: Token['coinMinimalDenom']
    chain?: Token['chain']
  }
  fee: { amount: string; denom: string }
  setShowReviewSheet: (show: boolean) => void
  closeAdjustmentSheet: () => void
  forceChain?: SupportedChain
  forceNetwork?: 'mainnet' | 'testnet'
  isSeiEvmTransaction?: boolean
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
    isSeiEvmTransaction,
  }: ObserverAutoAdjustAmountSheetProps) => {
    const chainInfo = useChainInfo(forceChain)
    const denoms = rootDenomsStore.allDenoms
    const shouldShowAutoAdjustSheet = useShouldShowAutoAdjustSheet(denoms, forceChain, forceNetwork)

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

    const decimalsToUse = useMemo(() => {
      if (isSeiEvmTransaction) {
        return 18
      }

      return nativeDenom?.coinDecimals ?? 6
    }, [isSeiEvmTransaction, nativeDenom?.coinDecimals])

    const tokenBalance = useMemo(
      () => toSmall(selectedToken?.amount ?? '0', decimalsToUse),
      [decimalsToUse, selectedToken?.amount],
    )

    const tokenAmount = useMemo(() => toSmall(amount, decimalsToUse), [amount, decimalsToUse])

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
      let updatedAmount
      if (adjustmentType === AdjustmentType.OPTIONAL) {
        updatedAmount = getAutoAdjustAmount({
          tokenAmount,
          feeAmount: fee.amount,
          nativeDenom,
          decimalsToUse,
        })
      } else if (adjustmentType === AdjustmentType.COMPULSORY) {
        updatedAmount = getAutoAdjustAmount({
          tokenAmount: tokenBalance,
          feeAmount: fee.amount,
          nativeDenom,
          decimalsToUse,
        })
      }
      if (updatedAmount) {
        setAmount(updatedAmount)
      }
      allowReview()
    }, [
      adjustmentType,
      allowReview,
      decimalsToUse,
      fee.amount,
      nativeDenom,
      setAmount,
      tokenAmount,
      tokenBalance,
    ])

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
          decimalsToUse={decimalsToUse}
        />

        <CompulsoryAutoAdjustAmountSheet
          isOpen={adjustmentType === AdjustmentType.COMPULSORY}
          nativeDenom={nativeDenom}
          tokenAmount={tokenAmount}
          tokenBalance={tokenBalance}
          feeAmount={fee.amount}
          setAmount={setAmount}
          onAdjust={allowReview}
          onCancel={closeAdjustmentSheet}
          decimalsToUse={decimalsToUse}
        />
      </>
    )
  },
)
