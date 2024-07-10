import { formatTokenAmount, sliceWord, Token, useGetChains } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { QueryStatus } from '@tanstack/react-query'
import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import { useFormatCurrency } from 'hooks/settings/useCurrency'
import { useHideAssets } from 'hooks/settings/useHideAssets'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { useSendContext } from 'pages/send-v2/context'
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
import { imgOnError } from 'utils/imgOnError'

type TokenInputCardProps = {
  isInputInUSDC: boolean
  setIsInputInUSDC: Dispatch<SetStateAction<boolean>>
  value: string
  token?: Token | null
  balanceStatus?: QueryStatus | boolean
  loadingAssets?: boolean
  onChange?: (value: string) => void
  onTokenSelectSheet?: () => void
  amountError?: string
  sendActiveChain: SupportedChain
  selectedChain: SupportedChain | null
}

export function TokenInputCard({
  isInputInUSDC,
  setIsInputInUSDC,
  value,
  token,
  loadingAssets,
  balanceStatus,
  onChange,
  onTokenSelectSheet,
  amountError,
  sendActiveChain,
  selectedChain,
}: TokenInputCardProps) {
  const [formatCurrency] = useFormatCurrency()
  const { formatHideBalance } = useHideAssets()
  const chains = useGetChains()

  const inputRef = useRef<HTMLInputElement>(null)
  const [isFocused, setIsFocused] = useState(false)
  const defaultTokenLogo = useDefaultTokenLogo()
  const [textInputValue, setTextInputValue] = useState<string>(value?.toString())

  const { pfmEnabled, isIbcUnwindingDisabled, allGasOptions, gasOption } = useSendContext()

  const selectedAssetUSDPrice = useMemo(() => {
    if (token && token.usdPrice && token.usdPrice !== '0') {
      return token.usdPrice
    }

    return undefined
  }, [token])

  useEffect(() => {
    if (!selectedAssetUSDPrice && isInputInUSDC) {
      setIsInputInUSDC(false)
    }
  }, [selectedAssetUSDPrice, isInputInUSDC])

  const { formattedDollarAmount } = useMemo(() => {
    let _dollarAmount = '0'

    if (value === '' || (value && isNaN(parseFloat(value)))) {
      return { formattedDollarAmount: '' }
    }

    if (token && token.usdPrice && value) {
      _dollarAmount = String(parseFloat(token.usdPrice) * parseFloat(value))
    }

    return {
      formattedDollarAmount: formatHideBalance(formatCurrency(new BigNumber(_dollarAmount))),
    }
  }, [formatCurrency, token, value])

  const formattedInputValue = useMemo(() => {
    return formatHideBalance(
      formatTokenAmount(value ?? '0', sliceWord(token?.symbol ?? '', 4, 4), 3, 'en-US'),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, token?.symbol])

  const balanceAmount = useMemo(() => {
    return formatHideBalance(
      formatTokenAmount(token?.amount ?? '0', sliceWord(token?.symbol ?? '', 4, 4), 3, 'en-US'),
    )

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token?.amount, token?.symbol])

  const isMaxAmount = useMemo(() => {
    return token?.amount === value
  }, [token?.amount, value])

  const showMaxButton = useMemo(() => {
    return token?.amount && token?.amount !== '0' && !isMaxAmount
  }, [isMaxAmount, token?.amount])

  const switchToUSDDisabled = useMemo(() => {
    return !selectedAssetUSDPrice || new BigNumber(selectedAssetUSDPrice ?? 0).isLessThan(10 ** -6)
  }, [selectedAssetUSDPrice])

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

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

  const onMaxBtnClick = () => {
    if (isInputInUSDC) {
      if (!selectedAssetUSDPrice) throw 'USD price is not available'

      const usdAmount = new BigNumber(token?.amount ?? '0').multipliedBy(selectedAssetUSDPrice)
      setTextInputValue(usdAmount.toString())
    } else {
      const isNativeToken = !!chains[sendActiveChain].nativeDenoms[token?.coinMinimalDenom ?? '']
      const decimals = token?.coinDecimals || 6

      if (!allGasOptions || !gasOption) {
        return
      }

      if (isNativeToken) {
        const feeValue = parseFloat(allGasOptions[gasOption])

        if (new BigNumber(token?.amount ?? 0).isGreaterThan(new BigNumber(feeValue))) {
          setTextInputValue(
            new BigNumber(token?.amount ?? 0)
              .minus(new BigNumber(feeValue))
              .toFixed(decimals, BigNumber.ROUND_DOWN),
          )
        } else {
          setTextInputValue(
            new BigNumber(token?.amount ?? 0).toFixed(decimals, BigNumber.ROUND_DOWN),
          )
        }
      } else {
        setTextInputValue(new BigNumber(token?.amount ?? 0).toFixed(decimals, BigNumber.ROUND_DOWN))
      }
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
      <div
        className='flex rounded-2xl justify-between w-full items-center bg-gray-50 dark:bg-gray-900 gap-2 pl-4 h-[48px] p-[2px] border'
        style={
          amountError
            ? { borderColor: Colors.red300 }
            : !pfmEnabled && !isIbcUnwindingDisabled
            ? { borderColor: '#FFC770' }
            : isFocused
            ? { borderColor: Colors.green600 }
            : { borderColor: 'transparent' }
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
              {isInputInUSDC && <span className='dark:text-white-100 font-bold text-md'>$</span>}
              <input
                type='number'
                className='bg-transparent outline-none w-full text-left dark:text-white-100 placeholder:font-bold placeholder:text-md placeholder:text-gray-600 dark:placeholder:text-gray-400 font-bold text-md'
                placeholder={'0'}
                value={isInputInUSDC ? textInputValue : value}
                ref={inputRef}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onChange={(e) => setTextInputValue(e.target.value)}
              />
            </div>

            <button
              className={'flex justify-end items-center gap-2 shrink-0 py-2 pr-2'}
              onClick={onTokenSelectSheet}
            >
              <div className='relative'>
                <img
                  src={token?.img ?? defaultTokenLogo}
                  className='w-[24px] h-[24px] rounded-full'
                  onError={imgOnError(defaultTokenLogo)}
                />
                {selectedChain ? (
                  <img
                    src={chains[selectedChain]?.chainSymbolImageUrl ?? defaultTokenLogo}
                    className='w-[14px] h-[14px] rounded-full absolute bottom-[-2px] right-[-2px]'
                    onError={imgOnError(defaultTokenLogo)}
                  />
                ) : null}
              </div>
              <p
                className={classNames('dark:text-white-100 text-sm font-bold', {
                  'flex flex-col justify-between items-start text-xs border-r border-gray-800 pl-1 pr-2':
                    !!selectedChain,
                })}
              >
                {token?.symbol ? sliceWord(token?.symbol ?? '', 4, 4) : 'Select Token'}
                {selectedChain ? (
                  <span className='text-gray-400 font-medium mt[-4px]'>
                    {chains[selectedChain]?.chainName ?? 'Unknown'}
                  </span>
                ) : null}
              </p>
              <p className='!text-lg material-icons-round dark:text-white-100 flex items-center'>
                expand_more
              </p>
            </button>
          </>
        )}
      </div>

      <div className='flex flex-row items-center justify-between text-gray-200 text-xs font-medium w-full h-[24px]'>
        <div className='flex items-center gap-1'>
          {value !== '' && (
            <span className='text-gray-800 dark:text-gray-200 font-normal text-xs'>
              {isInputInUSDC ? formattedInputValue : formattedDollarAmount}
            </span>
          )}
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
        </div>

        <div className='flex justify-end items-center gap-2'>
          <span
            className={classNames({
              'text-red-400 dark:text-red-300': (amountError || '').includes(
                'Insufficient balance',
              ),
              'text-gray-600 dark:text-gray-400': !amountError,
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
              className='rounded-full bg-[#29A87433] py-1 px-[10px] font-medium text-xs text-green-600'
            >
              Max
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
