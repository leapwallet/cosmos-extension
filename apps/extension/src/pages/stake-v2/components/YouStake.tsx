import {
  formatTokenAmount,
  SelectedNetwork,
  STAKE_MODE,
  useActiveStakingDenom,
  useformatCurrency,
} from '@leapwallet/cosmos-wallet-hooks'
import { fromSmall, SupportedChain, toSmall } from '@leapwallet/cosmos-wallet-sdk'
import { Amount } from '@leapwallet/cosmos-wallet-sdk/dist/browser/types/staking'
import { RootDenomsStore } from '@leapwallet/cosmos-wallet-store'
import BigNumber from 'bignumber.js'
import { buttonRingClass } from 'components/ui/button'
import { Skeleton } from 'components/ui/skeleton'
import { AnimatePresence, motion } from 'framer-motion'
import { SwapIcon } from 'icons/swap-icon'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { allowUpdateInputStore } from 'stores/allow-update-input-store'
import { Token } from 'types/bank'
import { opacityFadeInOut, transition150 } from 'utils/motion-variants'

import { stakeModeMap } from '../utils/stake-text'

interface YouStakeProps {
  token?: Token
  setAmount: (val: string) => void
  fees?: { amount: string; denom: string }
  hasError: boolean
  setHasError: (val: boolean) => void
  mode: STAKE_MODE
  delegationBalance?: Amount
  amount: string
  adjustAmount: boolean
  setAdjustAmount: (val: boolean) => void
  tokenLoading: boolean
  rootDenomsStore: RootDenomsStore
  activeChain?: SupportedChain
  activeNetwork?: SelectedNetwork
  delegationBalanceLoading: boolean
}

const YouStake = observer(
  ({
    token,
    amount,
    setAmount,
    fees,
    hasError,
    setHasError,
    mode,
    delegationBalance,
    adjustAmount,
    setAdjustAmount,
    tokenLoading,
    rootDenomsStore,
    activeChain,
    activeNetwork,
    delegationBalanceLoading,
  }: YouStakeProps) => {
    const inputRef = useRef<HTMLInputElement>(null)
    const allowUpdateInputValue = useRef(false)
    const [activeStakingDenom] = useActiveStakingDenom(
      rootDenomsStore.allDenoms,
      activeChain,
      activeNetwork,
    )
    const [formatCurrency] = useformatCurrency()
    const [inputValue, setInputValue] = useState('')
    const [isDollarInput, setIsDollarInput] = useState(false)
    const [balanceLoading, setBalanceLoading] = useState(false)

    const displayedValue = useMemo(() => {
      return inputValue
        ? isDollarInput
          ? new BigNumber(inputValue).dividedBy(new BigNumber(token?.usdPrice ?? '0')).toString()
          : new BigNumber(inputValue).multipliedBy(new BigNumber(token?.usdPrice ?? '0')).toString()
        : ''
    }, [inputValue, isDollarInput, token?.usdPrice])

    const maxValue = useMemo(() => {
      if (mode !== 'DELEGATE') {
        return isDollarInput
          ? new BigNumber(delegationBalance?.currencyAmount ?? '')
          : new BigNumber(delegationBalance?.amount ?? '')
      }

      const tokenAmount = toSmall(token?.amount ?? '0', token?.coinDecimals ?? 6)
      const maxMinimalTokens = new BigNumber(tokenAmount).minus(fees?.amount ?? '0')
      if (maxMinimalTokens.lte(0)) {
        return new BigNumber(0)
      }

      const maxTokens = new BigNumber(
        fromSmall(maxMinimalTokens.toString(), token?.coinDecimals ?? 6),
      )
      return isDollarInput
        ? new BigNumber(maxTokens).multipliedBy(token?.usdPrice ?? '0')
        : maxTokens
    }, [delegationBalance, fees?.amount, isDollarInput, mode, token])

    const validateInput = useCallback(
      (value: string) => {
        const numericValue = new BigNumber(value)
        if (numericValue.isLessThan(0)) {
          setHasError(true)
          return
        }
        let limit
        if (mode === 'DELEGATE') {
          limit = isDollarInput ? token?.usdValue ?? '0' : token?.amount ?? '0'
        } else {
          limit = isDollarInput
            ? delegationBalance?.currencyAmount ?? ''
            : delegationBalance?.amount ?? ''
        }
        if (numericValue.isGreaterThan(limit)) {
          setHasError(true)
          return
        }
        setHasError(false)
      },
      [
        delegationBalance?.amount,
        delegationBalance?.currencyAmount,
        isDollarInput,
        mode,
        setHasError,
        token,
      ],
    )

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
        .replace(/\$/, '')
        .replace?.(/^0+(?=\d)/, '')
        ?.replace?.(/(\.+)/g, '.')
      if (/^\d*\.?\d*$/.test(value)) {
        setInputValue(value)
        validateInput(value)
        allowUpdateInputStore.disableUpdateInput()
      }
    }

    const handleSwapClick = () => {
      if (inputValue) {
        const newInputValue = isDollarInput
          ? (parseFloat(inputValue) / parseFloat(token?.usdPrice ?? '0')).toFixed(6)
          : (parseFloat(inputValue) * parseFloat(token?.usdPrice ?? '0')).toFixed(6)
        setInputValue(newInputValue)
      }
      setIsDollarInput(!isDollarInput)
      inputRef.current?.focus()
    }

    const balance = useMemo(() => {
      if (isDollarInput) {
        const currencyAmount = new BigNumber(
          (mode === 'DELEGATE' ? token?.usdValue : delegationBalance?.currencyAmount) ?? '',
        )
        return currencyAmount
      } else {
        const tokenAmount = new BigNumber(
          (mode === 'DELEGATE' ? token?.amount : delegationBalance?.amount) ?? '',
        )
        return tokenAmount
      }
    }, [
      delegationBalance?.amount,
      delegationBalance?.currencyAmount,
      isDollarInput,
      mode,
      token?.amount,
      token?.usdValue,
    ])

    const handleUpdateInputValue = useCallback(
      (value: string) => {
        setInputValue(value)
        validateInput(value)
      },
      [validateInput],
    )

    useEffect(() => {
      if (adjustAmount) {
        if (isDollarInput) {
          setInputValue((parseFloat(amount) * parseFloat(token?.usdPrice ?? '0')).toFixed(6))
        } else {
          setInputValue(amount)
        }
        setAdjustAmount(false)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [adjustAmount])

    useEffect(() => {
      if (inputValue && !hasError) {
        const tokenAmount = isDollarInput
          ? parseFloat(inputValue) / parseFloat(token?.usdPrice ?? '0')
          : parseFloat(inputValue)
        setAmount(tokenAmount.toFixed(6))
      } else {
        setAmount('')
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inputValue, isDollarInput, token?.usdPrice, hasError])

    useEffect(() => {
      if (mode === 'DELEGATE') {
        setBalanceLoading(tokenLoading)
      } else {
        setBalanceLoading(delegationBalanceLoading)
      }
    }, [mode, tokenLoading, delegationBalanceLoading])

    useEffect(() => {
      if (!allowUpdateInputStore.updateAllowed()) return
      if (!fees || !token?.amount || !inputValue || mode !== 'DELEGATE') {
        return
      }

      const inputValueBN = new BigNumber(inputValue ?? 0)
      const tokenBalanceBN = new BigNumber(token?.amount ?? 0)

      // Invalid input amount case - input <= 0 or input > balance
      if (inputValueBN.lte(0) || inputValueBN.gt(tokenBalanceBN)) {
        return
      }

      const _feeDenom = fees.denom
      const isSelectedTokenFeeToken =
        !!token?.ibcDenom || !!_feeDenom?.startsWith('ibc/')
          ? token?.ibcDenom === _feeDenom
          : token?.coinMinimalDenom === _feeDenom

      const shouldTerminate = allowUpdateInputStore.shouldTerminate()
      const decimals = token?.coinDecimals || 6
      const feeValueBN = new BigNumber(fromSmall(fees.amount ?? '0', decimals))

      if (
        shouldTerminate &&
        (!isSelectedTokenFeeToken || inputValueBN.plus(feeValueBN).lte(tokenBalanceBN))
      ) {
        return
      }

      const newInputValueBN = tokenBalanceBN.minus(isSelectedTokenFeeToken ? feeValueBN : 0)
      const newInputValue = newInputValueBN.toFixed(decimals, BigNumber.ROUND_DOWN)
      const oldInputValue = inputValueBN.toFixed(decimals, BigNumber.ROUND_DOWN)

      /**
       * If selected token is same as fee token, we need to deduct fee from input value
       * Update logic:
       * If input + fee > balance, deduct fee from total balance value and update input value if:
       *   1. new value > 0
       *   2. new value < old value (to avoid infinite loop)
       *
       * Note: Loop here is due to below state updates chain:
       * input value -> simulate -> fee update -> input value -> ...
       */
      if (
        newInputValueBN.lte(0) ||
        newInputValue == oldInputValue ||
        (shouldTerminate && newInputValue > oldInputValue)
      ) {
        return
      }

      if (isDollarInput) {
        if (!token?.usdPrice) {
          return
        }
        const usdAmount = newInputValueBN.multipliedBy(token.usdPrice)
        handleUpdateInputValue(usdAmount.toString())
      } else {
        handleUpdateInputValue(newInputValue)
      }
      allowUpdateInputStore.incrementUpdateCount()
    }, [
      fees,
      handleUpdateInputValue,
      inputValue,
      isDollarInput,
      mode,
      token?.amount,
      token?.coinDecimals,
      token?.coinMinimalDenom,
      token?.ibcDenom,
      token?.usdPrice,
    ])

    return (
      <div className='flex flex-col gap-y-3 rounded-xl bg-secondary-100 p-5'>
        <span className='text-sm text-muted-foreground font-medium'>{stakeModeMap[mode]}</span>

        <input
          ref={inputRef}
          className='bg-transparent text-[1.5rem] font-bold caret-blue-200 outline-none border-none focus-within:placeholder:opacity-0'
          value={isDollarInput ? `$${inputValue}` : inputValue}
          onChange={handleInputChange}
          placeholder={'0'}
          autoFocus
        />

        <div className='flex items-center justify-between w-full'>
          <div className='flex items-center gap-1'>
            <span className='text-sm text-muted-foreground'>
              {inputValue
                ? isDollarInput
                  ? `${formatTokenAmount(displayedValue)} ${activeStakingDenom?.coinDenom}`
                  : formatCurrency(new BigNumber(displayedValue))
                : isDollarInput
                ? '$0.00'
                : '0.00'}
            </span>

            <button
              onClick={handleSwapClick}
              title={isDollarInput ? 'Switch to amount' : 'Switch to USD'}
              className={
                'rounded-full size-5 bg-secondary-200 hover:bg-secondary-300 items-center flex gap-1 justify-center shrink-0 ' +
                buttonRingClass
              }
            >
              <SwapIcon className='!leading-[12px] rotate-90 p-1 size-[18px]' />
            </button>
          </div>

          <div className='flex items-center gap-1'>
            <AnimatePresence mode='wait'>
              {balanceLoading ? (
                <Skeleton key={'loading'} className='w-16 h-5' asChild>
                  <motion.div
                    transition={transition150}
                    variants={opacityFadeInOut}
                    initial='hidden'
                    animate='visible'
                    exit='hidden'
                  />
                </Skeleton>
              ) : (
                <motion.span
                  key={'balance'}
                  className='text-sm font-medium text-muted-foreground'
                  transition={transition150}
                  variants={opacityFadeInOut}
                  initial='hidden'
                  animate='visible'
                  exit='hidden'
                >
                  {balance.eq(0)
                    ? '0'
                    : isDollarInput
                    ? formatCurrency(balance)
                    : formatTokenAmount(balance.toString())}{' '}
                  {activeStakingDenom?.coinDenom}
                </motion.span>
              )}
            </AnimatePresence>

            <button
              className={
                'ml-0.5 text-muted-foreground text-sm font-medium bg-secondary-200 px-1.5 rounded-full hover:text-foreground hover:bg-secondary-300 transition-colors ' +
                buttonRingClass
              }
              onClick={() => {
                handleUpdateInputValue(maxValue.dividedBy(2).toFixed(6, 1).toString())
                allowUpdateInputStore.disableUpdateInput()
              }}
            >
              50%
            </button>
            <button
              className={
                'text-muted-foreground text-sm font-medium bg-secondary-200 px-2 rounded-full hover:text-foreground hover:bg-secondary-300 transition-colors ' +
                buttonRingClass
              }
              onClick={() => {
                handleUpdateInputValue(maxValue.toFixed(6, 1).toString())
                allowUpdateInputStore.allowUpdateInput()
              }}
            >
              Max
            </button>
          </div>
        </div>
      </div>
    )
  },
)

export default YouStake
