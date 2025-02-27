import { formatTokenAmount, sliceWord, useGetChains } from '@leapwallet/cosmos-wallet-hooks'
import { ThemeName, useTheme } from '@leapwallet/leap-ui'
import { ArrowsLeftRight, CaretDown } from '@phosphor-icons/react'
import { QueryStatus } from '@tanstack/react-query'
import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import { TokenImageWithFallback } from 'components/token-image-with-fallback'
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
import { Colors } from 'theme/colors'
import { SourceChain, SourceToken } from 'types/swap'
import { imgOnError } from 'utils/imgOnError'
import { isCompassWallet } from 'utils/isCompassWallet'

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
  assetUsdValue?: BigNumber
}

function TokenInputCardView({
  isInputInUSDC,
  setIsInputInUSDC,
  readOnly,
  value,
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
  selectedChain,
  isChainAbstractionView,
  assetUsdValue,
}: TokenInputCardProps) {
  const [formatCurrency] = useFormatCurrency()
  const { theme } = useTheme()
  const chains = useGetChains()

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

    if (
      (!_dollarAmount || _dollarAmount === '0') &&
      assetUsdValue &&
      !assetUsdValue.isNaN() &&
      assetUsdValue.gt(0)
    ) {
      _dollarAmount = assetUsdValue.toString()
    }

    return {
      dollarAmount: _dollarAmount,
      formattedDollarAmount: hideAssetsStore.formatHideBalance(
        formatCurrency(new BigNumber(_dollarAmount)),
      ),
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formatCurrency, token, value, assetUsdValue])

  const formattedInputValue = useMemo(() => {
    return hideAssetsStore.formatHideBalance(
      formatTokenAmount(value ?? '0', sliceWord(token?.symbol ?? '', 4, 4), 3),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, token?.symbol])

  const balanceAmount = useMemo(() => {
    return hideAssetsStore.formatHideBalance(
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

  const isHalfAmount = token && Number(token.amount) === 2 * Number(value)
  const showHalfAmountBtn =
    showFor === 'source' && token?.amount && token?.amount !== '0' && !isHalfAmount

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
  }, [isInputInUSDC, selectedAssetUSDPrice, setIsInputInUSDC, textInputValue])

  return (
    <div
      className='w-full bg-white-100 dark:bg-gray-950 rounded-2xl p-4 flex flex-col gap-3'
      key={balanceAmount}
    >
      <div className='flex justify-between items-center'>
        <p className='dark:text-white-100 text-sm font-medium'>
          You {showFor === 'source' ? 'pay' : 'get'}
        </p>
        {!isChainAbstractionView &&
          !isCompassWallet() &&
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
              <CaretDown size={14} className='dark:text-white-100' />
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
                placeholder={isFocused && showFor === 'source' ? '' : '0'}
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
              <div className='relative'>
                <TokenImageWithFallback
                  assetImg={token?.img}
                  text={token?.symbol ?? token?.name ?? ''}
                  altText={token?.symbol ?? token?.name ?? ''}
                  imageClassName='w-[24px] h-[24px] rounded-full'
                  containerClassName='w-[24px] h-[24px] !bg-gray-200 dark:!bg-gray-800'
                  textClassName='text-[7px] !leading-[11px]'
                  key={token?.img}
                />
                {selectedChain ? (
                  <img
                    src={chains[selectedChain.key]?.chainSymbolImageUrl ?? defaultTokenLogo}
                    className='w-[14px] h-[14px] rounded-full absolute bottom-[-2px] right-[-2px]'
                    onError={imgOnError(defaultTokenLogo)}
                  />
                ) : null}
              </div>

              <p
                className={classNames('dark:text-white-100 text-sm font-bold', {
                  // 'w-[105px]': !token?.symbol,
                  'flex flex-col justify-between items-start text-xs border-r border-gray-800 pl-1 pr-2':
                    !!selectedChain,
                })}
              >
                {token?.symbol ? sliceWord(token?.symbol ?? '', 4, 4) : 'Select Token'}
                {selectedChain ? (
                  <span className='text-gray-400 font-medium mt[-4px]'>
                    {chains[selectedChain.key]?.chainName ?? 'Unknown'}
                  </span>
                ) : null}
              </p>
              <CaretDown size={14} className='dark:text-white-100' />
            </button>
          </>
        )}
      </div>

      <div className='flex flex-row items-center justify-between max-[399px]:!items-start text-gray-200 text-xs font-normal w-full min-h-[24px]'>
        <div className='flex items-center gap-1'>
          {value !== '' && (
            <span className='text-gray-800 dark:text-gray-200 font-normal text-xs !leading-[24px]'>
              {isInputInUSDC ? formattedInputValue : formattedDollarAmount}
            </span>
          )}
          {showFor === 'source' && (
            <button
              disabled={switchToUSDDisabled}
              onClick={handleInputTypeSwitchClick}
              className={classNames(
                'rounded-full h-6 bg-gray-50 dark:bg-gray-900 items-center flex gap-1 justify-center shrink-0',
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
              <ArrowsLeftRight
                size={12}
                className='text-black-100 dark:text-white-100 !leading-[12px] rotate-90'
              />
            </button>
          )}
        </div>

        <div className='flex justify-end items-center gap-1 max-[399px]:flex-col max-[399px]:justify-start max-[399px]:!items-end'>
          {isChainAbstractionView && showFor === 'destination' && chainName && (
            <button
              onClick={onChainSelectSheet}
              className='flex flex-row justify-start pr-[11px] gap-1 items-center text-gray-800 dark:text-gray-200'
            >
              <span>{`On ${chainName}`}</span>
              <CaretDown size={14} className='cursor-pointer text-gray-800 dark:text-gray-200' />
            </button>
          )}
          {isChainAbstractionView && showFor === 'destination' ? null : (
            <span
              className={classNames('!leading-[24px]', {
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
          )}
          {showHalfAmountBtn && (
            <button
              onClick={onHalfBtnClick}
              className='rounded-full dark:bg-gray-850 bg-gray-100 py-1 px-[10px] font-medium text-xs dark:text-gray-400 text-gray-600 hover:!bg-[#29A87433] hover:!text-[#22D292]'
            >
              50%
            </button>
          )}
          {showMaxButton && (
            <button
              onClick={onMaxBtnClick}
              className='rounded-full dark:bg-gray-850 bg-gray-100 py-1 px-[10px] font-medium text-xs dark:text-gray-400 text-gray-600 hover:!bg-[#29A87433] hover:!text-[#22D292]'
            >
              Max
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export const TokenInputCard = observer(TokenInputCardView)
