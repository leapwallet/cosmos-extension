import { sliceWord } from '@leapwallet/cosmos-wallet-hooks'
import { ArrowsLeftRight, CaretDown } from '@phosphor-icons/react'
import { QueryStatus } from '@tanstack/react-query'
import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import { useFormatCurrency } from 'hooks/settings/useCurrency'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { observer } from 'mobx-react-lite'
import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import Skeleton from 'react-loading-skeleton'
import { hideAssetsStore } from 'stores/hide-assets-store'
import { SourceChain, SourceToken } from 'types/swap'
import { imgOnError } from 'utils/imgOnError'
import { formatForSubstring } from 'utils/strings'

type TokenInputCardProps = {
  readOnly?: boolean
  isInputInUSDC: boolean
  setIsInputInUSDC: Dispatch<SetStateAction<boolean>>
  value: string
  token?: SourceToken | null
  balanceStatus?: QueryStatus
  chainName?: string
  chainLogo?: string
  loadingAssets?: boolean
  loadingChains?: boolean
  // eslint-disable-next-line no-unused-vars
  onChange?: (value: string) => void
  onTokenSelectSheet?: () => void
  selectTokenDisabled?: boolean
  selectChainDisabled?: boolean
  onChainSelectSheet?: () => void
  amountError?: boolean
  showFor?: 'source' | 'destination'
  selectedChain?: SourceChain
  isChainAbstractionView?: boolean
  textInputValue: string
  setTextInputValue: (val: string) => void
}

function TokenInputCardView({
  isInputInUSDC,
  setIsInputInUSDC,
  readOnly,
  value,
  token,
  loadingAssets,
  balanceStatus,
  onChange,
  onTokenSelectSheet,
  selectTokenDisabled,
  amountError,
  showFor,
  isChainAbstractionView,
  textInputValue,
  setTextInputValue,
}: TokenInputCardProps) {
  const [formatCurrency] = useFormatCurrency()
  const [turnOffLoader, setTurnOffLoader] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const [isFocused, setIsFocused] = useState(false)
  const defaultTokenLogo = useDefaultTokenLogo()

  const selectedAssetUSDPrice = useMemo(() => {
    if (token && token.usdPrice && token.usdPrice !== '0') {
      return token.usdPrice
    }

    return undefined
  }, [token])

  useEffect(() => {
    if (showFor === 'source' && !selectedAssetUSDPrice && isInputInUSDC) {
      setIsInputInUSDC(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAssetUSDPrice, isInputInUSDC])

  const { dollarAmount, formattedDollarAmount } = useMemo(() => {
    let _dollarAmount = '0'

    if (value === '' || (value && isNaN(parseFloat(value)))) {
      return { formattedDollarAmount: '', dollarAmount: '' }
    }

    if (token && token.usdPrice && value) {
      _dollarAmount = String(parseFloat(token.usdPrice) * parseFloat(value))
    }

    return {
      dollarAmount: _dollarAmount,
      formattedDollarAmount: hideAssetsStore.formatHideBalance(
        formatCurrency(new BigNumber(_dollarAmount)),
      ),
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formatCurrency, token, value])

  const formattedInputValue = useMemo(() => {
    return hideAssetsStore.formatHideBalance(
      `${formatForSubstring(value)} ${sliceWord(token?.symbol ?? '', 4, 4)}`,
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, token?.symbol])

  const balanceAmount = useMemo(() => {
    return hideAssetsStore.formatHideBalance(formatForSubstring(token?.amount ?? '0'))

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token?.amount, token?.symbol])

  const switchToUSDDisabled = useMemo(() => {
    return !selectedAssetUSDPrice || new BigNumber(selectedAssetUSDPrice ?? 0).isLessThan(10 ** -6)
  }, [selectedAssetUSDPrice])

  useEffect(() => {
    if (!readOnly && inputRef.current) {
      inputRef.current.focus()
    }
  }, [readOnly])

  useEffect(() => {
    if (!onChange) return
    if (isInputInUSDC && selectedAssetUSDPrice) {
      const cleanedInputValue = textInputValue.trim()
      if (!cleanedInputValue) {
        onChange('')
        return
      }
      const cryptoAmount = new BigNumber(textInputValue).dividedBy(selectedAssetUSDPrice)
      onChange(!isNaN(parseFloat(cryptoAmount.toString())) ? cryptoAmount?.toFixed(6) : '')
    } else {
      onChange(!isNaN(parseFloat(textInputValue)) ? textInputValue : '')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textInputValue, isInputInUSDC, selectedAssetUSDPrice])

  const handleInputFocus = useCallback(() => {
    if (!readOnly) {
      setIsFocused(true)
    }
  }, [readOnly, setIsFocused])

  const handleInputBlur = useCallback(() => {
    if (!readOnly) {
      setIsFocused(false)
    }
  }, [readOnly, setIsFocused])

  const onMaxBtnClick = useCallback(() => {
    if (isInputInUSDC) {
      if (!selectedAssetUSDPrice) throw 'USD price is not available'

      const usdAmount = new BigNumber(token?.amount ?? '0').multipliedBy(selectedAssetUSDPrice)
      setTextInputValue(usdAmount.toString())
    } else {
      setTextInputValue(token?.amount ?? '0')
    }
  }, [isInputInUSDC, selectedAssetUSDPrice, token?.amount, setTextInputValue])

  const onHalfBtnClick = useCallback(() => {
    if (isInputInUSDC) {
      if (!selectedAssetUSDPrice) throw 'USD price is not available'

      const usdAmount = new BigNumber(token?.amount ?? '0')
        .dividedBy(2)
        .multipliedBy(selectedAssetUSDPrice)
      setTextInputValue(usdAmount.toString())
    } else {
      const amount = new BigNumber(token?.amount ?? '0').dividedBy(2).toFixed(6, 1)
      setTextInputValue(amount)
    }
  }, [isInputInUSDC, selectedAssetUSDPrice, token?.amount, setTextInputValue])

  const handleInputTypeSwitchClick = useCallback(() => {
    if (!selectedAssetUSDPrice) {
      throw 'USD price is not available'
    }

    if (isInputInUSDC) {
      setIsInputInUSDC(false)
      const cryptoAmount = new BigNumber(textInputValue).dividedBy(selectedAssetUSDPrice)
      setTextInputValue(cryptoAmount.toString())
    } else {
      setIsInputInUSDC(true)
      const usdAmount = new BigNumber(textInputValue).multipliedBy(selectedAssetUSDPrice)
      setTextInputValue(usdAmount.toString())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInputInUSDC, selectedAssetUSDPrice, setIsInputInUSDC, textInputValue])

  const inputFieldValue = useMemo(() => {
    return showFor === 'source' ? textInputValue : isInputInUSDC ? dollarAmount : value
  }, [dollarAmount, isInputInUSDC, showFor, textInputValue, value])

  useEffect(() => {
    setTimeout(() => setTurnOffLoader(true), 5000)
  }, [])

  return (
    <div
      className='w-full bg-secondary-100 rounded-2xl p-5 flex flex-col gap-3'
      key={balanceAmount}
    >
      <div className='flex justify-between items-center'>
        <p className='text-muted-foreground text-sm font-medium !leading-[22.4px]'>
          You {showFor === 'source' ? 'pay' : 'get'}
        </p>
      </div>

      <div className='flex rounded-2xl justify-between w-full items-center gap-2 h-[34px] p-[2px]'>
        {loadingAssets ? (
          <Skeleton
            width={75}
            height={32}
            containerClassName='block !leading-none overflow-hidden rounded-full ml-auto'
          />
        ) : (
          <>
            <div className='flex gap-1 w-full'>
              {isInputInUSDC && <span className='text-monochrome font-bold text-[24px]'>$</span>}
              <input
                type='number'
                className={classNames(
                  'bg-transparent outline-none w-full text-left placeholder:font-bold placeholder:text-[24px] placeholder:text-monochrome font-bold !leading-[32.4px] caret-accent-blue',
                  {
                    'text-destructive-100': amountError,
                    'text-monochrome': !amountError,
                    'text-[24px]': inputFieldValue.length < 12,
                    'text-[22px]': inputFieldValue.length >= 12 && inputFieldValue.length < 15,
                    'text-[20px]': inputFieldValue.length >= 15 && inputFieldValue.length < 18,
                    'text-[18px]': inputFieldValue.length >= 18,
                  },
                )}
                placeholder={isFocused && showFor === 'source' ? '' : '0'}
                readOnly={readOnly}
                value={showFor === 'source' ? textInputValue : isInputInUSDC ? dollarAmount : value}
                ref={inputRef}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                onChange={(e) => setTextInputValue(e.target.value)}
              />
            </div>

            {token?.symbol || turnOffLoader ? (
              <button
                className={classNames(
                  'flex justify-end items-center gap-2 shrink-0 py-1 px-1.5 rounded-[40px] bg-secondary-300 hover:bg-secondary-400',
                  {
                    'opacity-50 pointer-events-none': selectTokenDisabled,
                  },
                )}
                onClick={onTokenSelectSheet}
              >
                <div className='relative'>
                  <img
                    src={token?.img ?? defaultTokenLogo}
                    className='w-[24px] h-[24px] rounded-full'
                    onError={imgOnError(defaultTokenLogo)}
                  />
                </div>

                <p className='dark:text-white-100 text-sm font-medium'>
                  {token?.symbol ? sliceWord(token?.symbol ?? '', 4, 4) : 'Select Token'}
                </p>
                <CaretDown size={14} className='dark:text-white-100' />
              </button>
            ) : (
              <Skeleton
                width={100}
                height={32}
                containerClassName='block !leading-none overflow-hidden rounded-full'
              />
            )}
          </>
        )}
      </div>

      <div className='flex flex-row items-center justify-between max-[399px]:!items-start text-gray-400 text-sm font-normal w-full min-h-[22px] mt-1'>
        <div className='flex items-center gap-1'>
          <span className='text-muted-foreground font-normal text-sm !leading-[22.4px]'>
            {value === ''
              ? isInputInUSDC
                ? '0.00'
                : '$0.00'
              : isInputInUSDC
              ? formattedInputValue
              : formattedDollarAmount}
          </span>

          {showFor === 'source' && (
            <button
              disabled={switchToUSDDisabled}
              onClick={handleInputTypeSwitchClick}
              className={classNames(
                'rounded-full h-[22px] bg-secondary-200 hover:bg-secondary-300 items-center flex gap-1 justify-center shrink-0 text-gray-600 dark:text-gray-400 dark:hover:text-white-100 hover:text-black-100',
                {
                  'opacity-50 pointer-events-none': switchToUSDDisabled,
                },
              )}
            >
              <ArrowsLeftRight size={20} className='!leading-[12px] rotate-90 p-1' />
            </button>
          )}
        </div>

        <div className='flex justify-end items-center gap-1 max-[350px]:flex-col max-[399px]:justify-start max-[399px]:!items-end'>
          {isChainAbstractionView && showFor === 'destination' ? null : (
            <span className='text-sm font-medium !leading-[18.9px] text-muted-foreground'>
              {!balanceStatus || balanceStatus === 'success' ? (
                balanceAmount
              ) : (
                <Skeleton width={50} />
              )}
            </span>
          )}

          {showFor === 'source' && (!balanceStatus || balanceStatus === 'success') ? (
            <>
              <button
                onClick={onHalfBtnClick}
                className='rounded-full bg-secondary-200 px-[6px] py-0.5 font-medium text-xs hover:bg-secondary-300 dark:hover:text-white-100 hover:text-black-100 !leading-[19.2px] text-muted-foreground'
              >
                50%
              </button>
              <button
                onClick={onMaxBtnClick}
                className='rounded-full bg-secondary-200 px-[6px] py-0.5 font-medium text-xs hover:bg-secondary-300 dark:hover:text-white-100 hover:text-black-100 !leading-[19.2px] text-muted-foreground'
              >
                Max
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export const TokenInputCard = observer(TokenInputCardView)
