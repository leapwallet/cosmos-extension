import { formatTokenAmount, sliceWord } from '@leapwallet/cosmos-wallet-hooks'
import { ThemeName, useTheme } from '@leapwallet/leap-ui'
import { QueryStatus } from '@tanstack/react-query'
import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import { useFormatCurrency } from 'hooks/settings/useCurrency'
import { useHideAssets } from 'hooks/settings/useHideAssets'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
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
import { Colors } from 'theme/colors'
import { SourceToken } from 'types/swap'
import { imgOnError } from 'utils/imgOnError'
import { isCompassWallet } from 'utils/isCompassWallet'

type TokenInputCardProps = {
  readOnly?: boolean
  isInputInUSDC: boolean
  setIsInputInUSDC: Dispatch<SetStateAction<boolean>>
  value: string
  placeholder?: string
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
}

export function TokenInputCard({
  isInputInUSDC,
  setIsInputInUSDC,
  readOnly,
  value,
  placeholder,
  token,
  chainName,
  chainLogo,
  loadingAssets,
  loadingChains,
  balanceStatus,
  onChange,
  onTokenSelectSheet,
  selectTokenDisabled,
  selectChainDisabled,
  onChainSelectSheet,
  amountError,
  showFor,
}: TokenInputCardProps) {
  const [formatCurrency] = useFormatCurrency()
  const { formatHideBalance } = useHideAssets()
  const { theme } = useTheme()

  const inputRef = useRef<HTMLInputElement>(null)
  const [isFocused, setIsFocused] = useState(false)
  const defaultTokenLogo = useDefaultTokenLogo()
  const [textInputValue, setTextInputValue] = useState<string>(value?.toString())

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
      formattedDollarAmount: formatHideBalance(formatCurrency(new BigNumber(_dollarAmount))),
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formatCurrency, token, value])

  const formattedInputValue = useMemo(() => {
    return formatHideBalance(
      formatTokenAmount(value ?? '0', sliceWord(token?.symbol ?? '', 4, 4), 3),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, token?.symbol])

  const balanceAmount = useMemo(() => {
    return formatHideBalance(
      formatTokenAmount(token?.amount ?? '0', sliceWord(token?.symbol ?? '', 4, 4), 3),
    )

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token?.amount, token?.symbol])

  const isMaxAmount = useMemo(() => {
    return token?.amount === value
  }, [token?.amount, value])

  const showMaxButton = useMemo(() => {
    return showFor === 'source' && token?.amount && token?.amount !== '0' && !isMaxAmount
  }, [isMaxAmount, showFor, token?.amount])

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

  const handleInputFocus = () => {
    if (!readOnly) {
      setIsFocused(true)
    }
  }

  const handleInputBlur = () => {
    if (!readOnly) {
      setIsFocused(false)
    }
  }

  const onMaxBtnClick = () => {
    if (isInputInUSDC) {
      if (!selectedAssetUSDPrice) throw 'USD price is not available'

      const usdAmount = new BigNumber(token?.amount ?? '0').multipliedBy(selectedAssetUSDPrice)
      setTextInputValue(usdAmount.toString())
    } else {
      setTextInputValue(token?.amount ?? '0')
    }
  }

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
  }, [isInputInUSDC, selectedAssetUSDPrice, textInputValue])

  return (
    <div
      className='w-full bg-white-100 dark:bg-gray-950 rounded-2xl p-4 flex flex-col gap-3'
      key={balanceAmount}
    >
      <div className='flex justify-between items-center'>
        <p className='dark:text-white-100 text-sm font-medium'>
          You {showFor === 'source' ? 'pay' : 'get'}
        </p>
        {!isCompassWallet() &&
          (loadingChains ? (
            <Skeleton
              width={100}
              height={36}
              containerClassName='block !leading-none overflow-hidden rounded-full'
            />
          ) : (
            <button
              className={classNames(
                'rounded-full p-2 flex gap-2 items-center bg-gray-50 dark:bg-gray-900',
                {
                  'opacity-50 pointer-events-none': selectChainDisabled,
                },
              )}
              onClick={onChainSelectSheet}
            >
              <img
                src={chainLogo}
                className='w-[20px] h-[20px] rounded-full'
                onError={imgOnError(defaultTokenLogo)}
              />
              <p className='dark:text-white-100 text-xs font-bold'>{chainName ?? 'Select Chain'}</p>
              <p className='!text-lg material-icons-round dark:text-white-100 flex items-center'>
                expand_more
              </p>
            </button>
          ))}
      </div>

      <div
        className='flex rounded-2xl justify-between w-full items-center bg-gray-50 dark:bg-gray-900 gap-2 pl-4 h-[48px] p-[2px] border'
        style={
          isFocused
            ? {
                borderColor: amountError
                  ? theme === ThemeName.DARK
                    ? Colors.red300
                    : Colors.red400
                  : Colors.green600,
              }
            : {
                borderColor: 'transparent',
              }
        }
      >
        {loadingAssets ? (
          <Skeleton
            width={71}
            height={24}
            containerClassName='block !leading-none overflow-hidden rounded-lg'
          />
        ) : (
          <>
            <div className='flex gap-1 w-full'>
              {isInputInUSDC && (
                <span className='dark:text-white-100 font-bold text-[18px]'>$</span>
              )}
              <input
                type='number'
                className='bg-transparent outline-none w-full text-left dark:text-white-100 placeholder:font-bold placeholder:text-[18px] placeholder:text-gray-400 font-bold text-[18px]'
                placeholder={isFocused && showFor === 'source' ? '' : placeholder}
                readOnly={readOnly}
                value={showFor === 'source' ? textInputValue : isInputInUSDC ? dollarAmount : value}
                ref={inputRef}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                onChange={(e) => setTextInputValue(e.target.value)}
              />
            </div>

            <button
              className={classNames('flex justify-end items-center gap-2 shrink-0 py-2 pr-2', {
                'opacity-50 pointer-events-none': selectTokenDisabled,
              })}
              onClick={onTokenSelectSheet}
            >
              <img
                src={token?.img ?? defaultTokenLogo}
                className='w-[24px] h-[24px] rounded-full'
                onError={imgOnError(defaultTokenLogo)}
              />
              <p
                className={classNames('dark:text-white-100 text-sm font-bold', {
                  // 'w-[105px]': !token?.symbol,
                })}
              >
                {token?.symbol ? sliceWord(token?.symbol ?? '', 4, 4) : 'Select Token'}
              </p>
              <p className='!text-lg material-icons-round dark:text-white-100 flex items-center'>
                expand_more
              </p>
            </button>
          </>
        )}
      </div>

      <div className='flex flex-row items-center justify-between text-gray-200 text-xs font-normal w-full h-[24px]'>
        <div className='flex items-center gap-1'>
          {value !== '' && (
            <span className='text-gray-800 dark:text-gray-200 font-normal text-xs'>
              {isInputInUSDC ? formattedInputValue : formattedDollarAmount}
            </span>
          )}
          {showFor === 'source' && (
            <button
              disabled={switchToUSDDisabled}
              onClick={handleInputTypeSwitchClick}
              className={classNames(
                'rounded-full h-6 bg-gray-50 dark:bg-gray-900 items-center flex gap-1 justify-center',
                {
                  'opacity-50 pointer-events-none': switchToUSDDisabled,
                  'w-6': value !== '',
                  'px-[10px]': value === '',
                },
              )}
            >
              {value === '' && (
                <span className='text-gray-800 dark:text-gray-200 font-normal text-xs'>
                  Switch to {isInputInUSDC ? 'Token' : 'USD'}
                </span>
              )}
              <span className='text-black-100 dark:text-white-100 material-icons-round !text-xs !leading-[12px]'>
                swap_vert
              </span>
            </button>
          )}
        </div>

        <div className='flex justify-end items-center gap-2'>
          <span
            className={classNames({
              'text-red-400 dark:text-red-300': amountError,
              'text-gray-800 dark:text-gray-200': !amountError,
            })}
          >
            Bal:{' '}
            {!balanceStatus || balanceStatus === 'success' ? (
              balanceAmount
            ) : (
              <Skeleton width={50} />
            )}
          </span>
          {showMaxButton && (
            <button
              onClick={onMaxBtnClick}
              className='rounded-full bg-[#29A87433] py-1 px-[10px] font-medium text-xs text-[#22D292]'
            >
              Max
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
