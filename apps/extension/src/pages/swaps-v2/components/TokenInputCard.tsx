import { calculateFee } from '@cosmjs/stargate'
import {
  formatTokenAmount,
  GasOptions,
  sliceWord,
  useGasAdjustmentForChain,
  useGasRateQuery,
  useGetChains,
} from '@leapwallet/cosmos-wallet-hooks'
import { fromSmall, GasPrice, NativeDenom, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
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
import { allowUpdateInputStore } from 'stores/allow-update-input-store'
import { rootDenomsStore } from 'stores/denoms-store-instance'
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
  assetUsdValue?: BigNumber
  feeDenom: NativeDenom & {
    ibcDenom?: string
  }
  sourceChain: SourceChain | undefined
  userPreferredGasLimit: number | undefined
  userPreferredGasPrice: GasPrice | undefined
  gasEstimate: number
  gasOption: GasOptions
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
  feeDenom,
  sourceChain,
  userPreferredGasLimit,
  userPreferredGasPrice,
  gasEstimate,
  gasOption,
}: TokenInputCardProps) {
  const [formatCurrency] = useFormatCurrency()
  const chains = useGetChains()

  const inputRef = useRef<HTMLInputElement>(null)
  const [isFocused, setIsFocused] = useState(false)
  const defaultTokenLogo = useDefaultTokenLogo()
  const [textInputValue, setTextInputValue] = useState<string>(value?.toString())

  const gasAdjustment = useGasAdjustmentForChain(sourceChain?.key ?? '')
  const rootDenoms = rootDenomsStore.allDenoms
  const gasPrices = useGasRateQuery(rootDenoms, (sourceChain?.key ?? '') as SupportedChain)
  const gasPriceOptions = gasPrices?.[feeDenom.coinMinimalDenom]

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
      formatForSubstring(token?.amount ?? '0', { skipK: true }),
    )

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token?.amount, token?.symbol])

  const showAmountButtons = useMemo(() => {
    return (
      showFor === 'source' &&
      token?.amount &&
      token?.amount !== '0' &&
      (!balanceStatus || balanceStatus === 'success')
    )
  }, [balanceStatus, showFor, token?.amount])

  const switchToUSDDisabled = useMemo(() => {
    return !selectedAssetUSDPrice || new BigNumber(selectedAssetUSDPrice ?? 0).isLessThan(10 ** -6)
  }, [selectedAssetUSDPrice])

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

    allowUpdateInputStore.allowUpdateInput()
  }, [isInputInUSDC, selectedAssetUSDPrice, token?.amount, setTextInputValue])

  const fee = useMemo(() => {
    const _gasLimit = userPreferredGasLimit ?? gasEstimate
    const _gasPrice = userPreferredGasPrice ?? gasPriceOptions?.[gasOption]
    if (!_gasPrice) return

    const gasAdjustmentValue = gasAdjustment

    return calculateFee(Math.ceil(_gasLimit * gasAdjustmentValue), _gasPrice)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    gasPriceOptions,
    gasOption,
    gasEstimate,
    userPreferredGasLimit,
    userPreferredGasPrice,
    sourceChain,
    feeDenom,
  ])

  /**
   * Logic to update input value whenever max button is clicked or gas price, denom, limit (?) are updated
   */
  useEffect(() => {
    if (showFor === 'destination') return

    if (!allowUpdateInputStore.updateAllowed()) return
    if (!fee || !token?.amount || !value) {
      return
    }

    const inputValueBN = new BigNumber(value ?? 0)
    const tokenBalanceBN = new BigNumber(token?.amount ?? 0)

    // Invalid input amount case - input <= 0 or input > balance
    if (inputValueBN.lte(0) || inputValueBN.gt(tokenBalanceBN)) {
      return
    }

    const _feeDenom = fee?.amount?.[0]?.denom
    const isSelectedTokenFeeToken =
      !!token?.ibcDenom || !!_feeDenom?.startsWith('ibc/')
        ? token?.ibcDenom === _feeDenom
        : token?.coinMinimalDenom === _feeDenom

    const shouldTerminate = allowUpdateInputStore.shouldTerminate()

    const decimals = token?.coinDecimals || 6
    const feeValueBN = new BigNumber(fromSmall(fee?.amount?.[0]?.amount ?? '0', decimals))

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

    if (isInputInUSDC) {
      if (!selectedAssetUSDPrice) {
        return
      }
      const usdAmount = newInputValueBN.multipliedBy(selectedAssetUSDPrice)
      setTextInputValue(usdAmount.toString())
    } else {
      setTextInputValue(newInputValue)
    }

    allowUpdateInputStore.incrementUpdateCount()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fee, token?.amount, token?.coinDecimals, token?.coinMinimalDenom, token?.ibcDenom, value])

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
    allowUpdateInputStore.disableUpdateInput()
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

  const inputValue = showFor === 'source' ? textInputValue : isInputInUSDC ? dollarAmount : value

  return (
    <div className='w-full bg-secondary-100 rounded-xl p-5 flex flex-col gap-3' key={balanceAmount}>
      <div className='flex justify-between items-center'>
        <p className='text-muted-foreground text-sm font-medium !leading-[22px]'>
          You {showFor === 'source' ? 'pay' : 'get'}
        </p>
        {!isChainAbstractionView &&
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

      <div className='flex rounded-2xl justify-between w-full items-center gap-2 h-[34px]'>
        <div className='flex gap-1 w-full'>
          {isInputInUSDC && <span className='text-monochrome font-bold text-[24px]'>$</span>}
          <input
            type='number'
            className={classNames(
              'bg-transparent outline-none w-full text-left placeholder:font-bold placeholder:text-[24px] placeholder:text-monochrome placeholder:text-gray-400 font-bold !leading-[34px] caret-accent-success',
              {
                'text-destructive-100': amountError,
                'text-monochrome': !amountError,
                'text-[24px]': inputValue.length < 12,
                'text-[22px]': inputValue.length >= 12 && inputValue.length < 15,
                'text-[20px]': inputValue.length >= 15 && inputValue.length < 18,
                'text-[18px]': inputValue.length >= 18,
              },
            )}
            placeholder={isFocused && showFor === 'source' ? '' : '0'}
            readOnly={readOnly}
            value={inputValue}
            ref={inputRef}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onChange={(e) => {
              setTextInputValue(e.target.value)
              allowUpdateInputStore.disableUpdateInput()
            }}
          />
        </div>

        {loadingAssets ? (
          <Skeleton
            width={90}
            height={32}
            containerClassName='block !leading-none overflow-hidden rounded-full shrink-0'
          />
        ) : (
          <button
            className={classNames(
              'flex justify-end items-center shrink-0 py-1 px-[6px] rounded-full bg-secondary-300 hover:bg-secondary-400',
              {
                'opacity-50 pointer-events-none': selectTokenDisabled,
              },
            )}
            onClick={onTokenSelectSheet}
          >
            <div className='relative w-6 h-6'>
              <TokenImageWithFallback
                assetImg={token?.img}
                text={token?.symbol ?? token?.name ?? ''}
                altText={token?.symbol ?? token?.name ?? ''}
                imageClassName={classNames(
                  'rounded-full',
                  selectedChain && chains[selectedChain.key]?.chainSymbolImageUrl
                    ? 'w-5 h-5 ml-0.5 mt-0.5'
                    : 'w-6 h-6',
                )}
                containerClassName={classNames(
                  '!bg-gray-200 dark:!bg-gray-800',
                  selectedChain && chains[selectedChain.key]?.chainSymbolImageUrl
                    ? 'w-5 h-5'
                    : 'w-6 h-6',
                )}
                textClassName='text-[7px] !leading-[11px]'
                key={token?.img}
              />
              {selectedChain ? (
                <img
                  src={chains[selectedChain.key]?.chainSymbolImageUrl ?? defaultTokenLogo}
                  className='w-[9.23px] h-[9.23px] rounded-full absolute bottom-0 right-0'
                  onError={imgOnError(defaultTokenLogo)}
                />
              ) : null}
            </div>

            <p className='dark:text-white-100 text-sm font-medium ml-2'>
              {token?.symbol ? sliceWord(token?.symbol ?? '', 4, 4) : 'Select Token'}
            </p>
            <CaretDown size={20} className='dark:text-white-100 px-1 ml-1' />
          </button>
        )}
      </div>

      <div className='flex flex-row items-center justify-between text-gray-200 text-xs font-normal w-full min-h-[22px] mt-1'>
        <div className='flex items-center gap-1'>
          <span className='text-muted-foreground font-normal text-sm !leading-[22.4px]'>
            {value === '' || !value
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

        <div className='flex justify-end items-center min-h-[23.2px] gap-1'>
          {isChainAbstractionView &&
            showFor === 'destination' &&
            (loadingChains || loadingAssets ? (
              <span className='text-sm font-medium !leading-[18.9px] text-muted-foreground'>
                <Skeleton key={`you-recieve-balance-loader`} width={115} />
              </span>
            ) : chainName ? (
              <button
                onClick={onChainSelectSheet}
                className='flex flex-row justify-end gap-[2px] items-center text-secondary-800'
              >
                <span className='text-xs leading-5'>{`On ${chainName}`}</span>
                <CaretDown size={14} className='p-[2px] cursor-pointer' />
              </button>
            ) : null)}

          {isChainAbstractionView && showFor === 'source' ? (
            <span className='text-sm font-medium !leading-[18.9px] text-muted-foreground'>
              {!loadingAssets && (!balanceStatus || balanceStatus === 'success') ? (
                balanceAmount
              ) : (
                <Skeleton key={`you-pay-balance-loader`} width={115} />
              )}
            </span>
          ) : null}

          {showAmountButtons ? (
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
