import {
  formatTokenAmount,
  SelectedNetwork,
  STAKE_MODE,
  useActiveStakingDenom,
  useformatCurrency,
} from '@leapwallet/cosmos-wallet-hooks'
import { fromSmall, SupportedChain, toSmall } from '@leapwallet/cosmos-wallet-sdk'
import { Amount } from '@leapwallet/cosmos-wallet-sdk/dist/browser/types/staking'
import { RootBalanceStore, RootDenomsStore } from '@leapwallet/cosmos-wallet-store'
import { ArrowsLeftRight } from '@phosphor-icons/react'
import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import Text from 'components/text'
import { GenericLight } from 'images/logos'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import { Colors } from 'theme/colors'
import { Token } from 'types/bank'
import { hex2rgba } from 'utils/hextorgba'
import { imgOnError } from 'utils/imgOnError'
import { isCompassWallet } from 'utils/isCompassWallet'
import { isSidePanel } from 'utils/isSidePanel'

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
      if (mode === 'DELEGATE') {
        const tokenAmount = toSmall(token?.amount ?? '0', token?.coinDecimals ?? 6)
        const maxMinimalTokens = new BigNumber(tokenAmount).minus(fees?.amount ?? '0')
        if (maxMinimalTokens.lte(0)) return '0'
        const maxTokens = new BigNumber(
          fromSmall(maxMinimalTokens.toString(), token?.coinDecimals ?? 6),
        ).toFixed(6, 1)

        return isDollarInput
          ? new BigNumber(maxTokens).multipliedBy(token?.usdPrice ?? '0').toFixed(6, 1)
          : maxTokens
      } else {
        return isDollarInput
          ? new BigNumber(delegationBalance?.currencyAmount ?? '').toFixed(6, 1)
          : new BigNumber(delegationBalance?.amount ?? '').toFixed(6, 1)
      }
    }, [
      delegationBalance?.amount,
      delegationBalance?.currencyAmount,
      fees?.amount,
      isDollarInput,
      mode,
      token?.amount,
      token?.coinDecimals,
      token?.usdPrice,
    ])
    const showMaxButton = !new BigNumber(inputValue).isEqualTo(maxValue)

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
    }

    const handleMaxClick = () => {
      setInputValue(maxValue ?? '')
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

    return (
      <div className='p-4 flex flex-col gap-y-3 rounded-2xl bg-white-100 dark:bg-gray-950'>
        <Text size='sm' color='text-black-100 dark:text-white-100' className=' font-medium'>
          You are {mode === 'DELEGATE' || mode === 'REDELEGATE' ? 'staking' : 'unstaking'}
        </Text>
        <div
          className={`border border-transparent bg-gray-50 dark:bg-gray-900 rounded-xl focus-within:${
            hasError ? 'border-red-300' : 'border-green-600'
          } flex w-full justify-between items-center px-4 py-0.5`}
        >
          <input
            className={classNames(
              ' bg-gray-50 dark:bg-gray-900 text-md outline-none font-bold text-black-100 dark:text-white-100 py-2',
              { 'flex-1 w-[50px]': isSidePanel() },
            )}
            value={isDollarInput ? `$${inputValue}` : inputValue}
            onChange={handleInputChange}
            placeholder={'0'}
            autoFocus
          />
          <div className='flex items-center gap-x-2 shrink-0'>
            <img
              src={activeStakingDenom?.icon}
              onError={imgOnError(GenericLight)}
              className='rounded-full'
              width={24}
              height={24}
            />
            <Text className='font-bold' size='sm'>
              {activeStakingDenom?.coinDenom}
            </Text>
          </div>
        </div>
        <div className='flex items-center justify-between w-full'>
          {!inputValue && (
            <div
              onClick={handleSwapClick}
              className='hover:cursor-pointer rounded-2xl px-2.5 py-1 bg-gray-50 dark:bg-gray-900 flex items-center gap-x-0.5'
            >
              <Text size='xs' className='font-medium' color='text-gray-800 dark:text-gray-200'>
                Switch to {isDollarInput ? 'TOKEN' : 'USD'}{' '}
              </Text>
              <ArrowsLeftRight size={12} className='text-gray-800 dark:text-gray-200 rotate-90' />
            </div>
          )}
          {inputValue && (
            <div className='flex items-center gap-x-2'>
              <Text size='xs' color='text-gray-800 dark:text-gray-200'>
                {isDollarInput
                  ? `${formatTokenAmount(displayedValue)} ${activeStakingDenom?.coinDenom}`
                  : formatCurrency(new BigNumber(displayedValue))}
              </Text>
              <button
                onClick={handleSwapClick}
                className='bg-gray-50 dark:bg-gray-850 rounded-full p-0.5'
              >
                <ArrowsLeftRight
                  size={12}
                  className='rotate-90 hover:cursor-pointer text-gray-800 dark:text-white-100'
                />
              </button>
            </div>
          )}
          <div className='flex items-center gap-x-2'>
            {balanceLoading ? (
              <Skeleton count={1} width={50} height={16} />
            ) : (
              <Text
                size='xs'
                color={`${
                  hasError ? `text-red-300 dark:text-red-300` : `text-gray-800 dark:text-gray-200`
                }`}
              >
                Bal{' '}
                {balance.eq(0)
                  ? '0'
                  : isDollarInput
                  ? formatCurrency(balance)
                  : formatTokenAmount(balance.toString())}
              </Text>
            )}
            {showMaxButton && new BigNumber(token?.amount ?? '0').isGreaterThan(0) && (
              <div
                onClick={handleMaxClick}
                className='hover:cursor-pointer rounded-2xl px-3 py-1'
                style={{
                  backgroundColor: hex2rgba(
                    isCompassWallet() ? Colors.compassPrimary : Colors.green600,
                    0.2,
                  ),
                }}
              >
                <Text size='xs' className='font-medium' style={{ color: Colors.green600 }}>
                  Max
                </Text>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  },
)

export default YouStake
