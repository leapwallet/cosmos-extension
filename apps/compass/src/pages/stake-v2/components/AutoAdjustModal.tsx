import { Token } from '@leapwallet/cosmos-wallet-hooks'
import { fromSmall, toSmall } from '@leapwallet/cosmos-wallet-sdk'
import { Buttons, ThemeName, useTheme } from '@leapwallet/leap-ui'
import BigNumber from 'bignumber.js'
import BottomModal from 'components/bottom-modal'
import React, { useCallback, useEffect, useMemo } from 'react'
import { Colors } from 'theme/colors'
import { isCompassWallet } from 'utils/isCompassWallet'

type AutoAdjustSheetProps = {
  onCancel: () => void
  onAdjust: () => void
  isOpen: boolean
  tokenAmount: string
  fee: { amount: string; denom: string }
  // eslint-disable-next-line no-unused-vars
  setTokenAmount: (amount: string) => void
  token: Token
}

export default function AutoAdjustAmountSheet({
  isOpen,
  tokenAmount,
  fee,
  setTokenAmount,
  onAdjust,
  onCancel,
  token,
}: AutoAdjustSheetProps) {
  const { theme } = useTheme()
  const updatedAmount = useMemo(() => {
    const tokenAmount = toSmall(token.amount ?? '0', token?.coinDecimals ?? 6)
    const maxMinimalTokens = new BigNumber(tokenAmount).minus(fee?.amount ?? '')
    if (maxMinimalTokens.lte(0)) return '0'
    const maxTokens = new BigNumber(
      fromSmall(maxMinimalTokens.toString(), token?.coinDecimals ?? 6),
    ).toFixed(6, 1)
    return maxTokens
  }, [fee?.amount, token.amount, token?.coinDecimals])

  const handleAdjust = useCallback(() => {
    if (updatedAmount) {
      setTokenAmount(updatedAmount)
      onAdjust()
    } else {
      onCancel()
    }
  }, [onAdjust, onCancel, setTokenAmount, updatedAmount])

  useEffect(() => {
    if (updatedAmount) {
      setTokenAmount(updatedAmount)
      onAdjust()
    } else {
      onCancel()
    }
  }, [onAdjust, onCancel, setTokenAmount, updatedAmount])

  const displayTokenAmount = useMemo(() => {
    return `${tokenAmount} ${token.symbol ?? ''}`
  }, [token.symbol, tokenAmount])

  const displayUpdatedAmount = useMemo(() => {
    if (updatedAmount) {
      return `${updatedAmount} ${token.symbol ?? ''}`
    }
    return null
  }, [token.symbol, updatedAmount])

  return (
    <BottomModal isOpen={isOpen} onClose={onCancel} title='Adjust for Transaction Fees'>
      <div className='rounded-2xl p-4 dark:bg-gray-900 bg-white-100 dark:text-gray-200 text-gray-800'>
        <p>Insufficient {token.symbol ?? ''} balance to pay transaction fees.</p>
        <p className='mt-2'>
          Should we adjust the amount from{' '}
          <span className='text-green-500 font-medium'>{displayTokenAmount}</span> to{' '}
          <span className='text-green-500 font-medium'>{displayUpdatedAmount ?? '-'}</span>?
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
          color={isCompassWallet() ? Colors.compassPrimary : Colors.green600}
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
