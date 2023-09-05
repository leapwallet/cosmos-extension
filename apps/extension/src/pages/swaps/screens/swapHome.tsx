/* eslint-disable no-unused-vars */
import SwapInput from 'components/swap-input'
import React from 'react'

interface propTypes {
  toggleUserTokenSheet: () => void
  toggleTargetTokenSheet: () => void
  toggleSlippageSheet: () => void
  toggleReviewSheet: () => void
  slippage: string
  amountValue: string
  setAmountValue: (amount: string) => void
  targetAmountValue: string
  selectedTokenName: string
  setSelectedTokenName: (value: string) => void
  selectedTokenIcon: string
  setSelectedTokenIcon: (value: string) => void
  selectedTokenBalance: string
  setSelectedTokenBalance: (value: string) => void
  targetTokenName: string
  setTargetTokenName: (value: string) => void
  targetTokenIcon: string
  setTargetTokenIcon: (value: string) => void
  feesCurrency: string
  setFeesCurrency: (value: string) => void
  unitConversionPrice: string
  setUnitConversionPrice: (value: string) => void
  slippagePercentage: number
  setSlippagePercentage: (value: number) => void
  isFeeAvailable?: boolean
  junoDollarValue: number | undefined
}

export default function SwapHome(props: propTypes) {
  const SwapToAndFrom = () => {
    const selectedName = props.selectedTokenName
    const selectedIcon = props.selectedTokenIcon
    props.setSelectedTokenName(props.targetTokenName)
    props.setTargetTokenName(selectedName)
    props.setSelectedTokenIcon(props.targetTokenIcon)
    props.setTargetTokenIcon(selectedIcon)
  }

  const onMaxClick = () => {
    if (props.selectedTokenName == 'JUNO') {
      parseFloat(props.selectedTokenBalance) > 0.004
        ? props.setAmountValue(String(parseFloat(props.selectedTokenBalance) - 0.004))
        : props.setAmountValue('0')
    } else props.setAmountValue(props.selectedTokenBalance)
  }

  return (
    <div className='relative w-[400px] h-full'>
      <div className='flex flex-row justify-center pt-7'>
        <div>
          <SwapInput
            placeholder='enter amount'
            amount={props.amountValue}
            junoDollarValue={props.junoDollarValue}
            targetAmount={props.targetAmountValue}
            balance={props.selectedTokenBalance}
            icon={props.selectedTokenIcon}
            targetTokenIcon={props.targetTokenIcon}
            name={props.selectedTokenName}
            targetName={props.targetTokenName}
            onMaxClick={onMaxClick}
            onTokenClick={() => props.toggleUserTokenSheet()}
            onTargetTokenClick={() => props.toggleTargetTokenSheet()}
            setAmount={(amount: string) => props.setAmountValue(amount)}
            feeInCurrency={props.feesCurrency}
            onSwapClick={SwapToAndFrom}
            targetUnitPrice={props.unitConversionPrice}
            onReviewClick={() => props.toggleReviewSheet()}
            onSlippageClick={() => props.toggleSlippageSheet()}
            slippage={props.slippage}
            isFeeAvailable={props.isFeeAvailable}
          />
        </div>
      </div>
    </div>
  )
}
