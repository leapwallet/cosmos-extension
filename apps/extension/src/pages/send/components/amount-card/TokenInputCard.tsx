import { formatTokenAmount, sliceWord, Token, useGetChains } from '@leapwallet/cosmos-wallet-hooks'
import {
  isAptosChain,
  isSolanaChain,
  isSuiChain,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk'
import { isBitcoinChain } from '@leapwallet/cosmos-wallet-store'
import { useTheme } from '@leapwallet/leap-ui'
import { ArrowsLeftRight, CaretDown } from '@phosphor-icons/react'
import { QueryStatus } from '@tanstack/react-query'
import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import { useFormatCurrency } from 'hooks/settings/useCurrency'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { observer } from 'mobx-react-lite'
import { useSendContext } from 'pages/send/context'
import React, { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import { hideAssetsStore } from 'stores/hide-assets-store'
import { imgOnError } from 'utils/imgOnError'

import { ErrorWarningTokenCard } from '../error-warning'

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
  resetForm?: boolean
}

function TokenInputCardView({
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
  resetForm,
}: TokenInputCardProps) {
  const [formatCurrency] = useFormatCurrency()
  const chains = useGetChains()
  const { theme } = useTheme()

  const defaultTokenLogo = useDefaultTokenLogo()
  const [isFocused, setIsFocused] = useState(false)
  const [textInputValue, setTextInputValue] = useState<string>(value?.toString())

  const {
    pfmEnabled,
    isIbcUnwindingDisabled,
    allGasOptions,
    gasOption,
    selectedAddress,
    addressError,
    selectedToken,
  } = useSendContext()

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
      formattedDollarAmount: hideAssetsStore.formatHideBalance(
        formatCurrency(new BigNumber(_dollarAmount)),
      ),
    }
  }, [formatCurrency, token, value])

  const formattedInputValue = useMemo(() => {
    return hideAssetsStore.formatHideBalance(
      formatTokenAmount(value ?? '0', sliceWord(token?.symbol ?? '', 4, 4), 3, 'en-US'),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, token?.symbol])

  const balanceAmount = useMemo(() => {
    return hideAssetsStore.formatHideBalance(
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

  useEffect(() => {
    if (resetForm) {
      setTextInputValue('')
    }
  }, [resetForm])

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
  }, [isInputInUSDC, selectedAssetUSDPrice, textInputValue])

  const tokenHolderChain = useMemo(() => {
    if (!token?.tokenBalanceOnChain) return null
    return chains?.[token.tokenBalanceOnChain]
  }, [token?.tokenBalanceOnChain, chains])

  const isIBCError = (addressError || '').includes('IBC transfers are not supported')

  const sendChainEcosystem = useMemo(() => {
    if (
      isAptosChain(sendActiveChain) ||
      isSuiChain(sendActiveChain) ||
      chains?.[sendActiveChain]?.evmOnlyChain ||
      isBitcoinChain(sendActiveChain) ||
      isSolanaChain(sendActiveChain)
    ) {
      return chains?.[sendActiveChain]?.chainName ?? sendActiveChain
    }
    return 'Cosmos'
  }, [sendActiveChain, chains])

  return (
    <>
      <div className='w-full bg-secondary-100 rounded-xl flex flex-col' key={balanceAmount}>
        <div className='flex flex-col p-5 gap-3'>
          <p className='text-muted-foreground text-sm font-medium !leading-[22.4px]'>Send</p>
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
                  {isInputInUSDC && (
                    <span className='text-monochrome font-bold text-[24px]'>$</span>
                  )}
                  <input
                    type='number'
                    className={classNames(
                      'bg-transparent outline-none w-full text-left placeholder:font-bold placeholder:text-[24px] placeholder:text-monochrome font-bold !leading-[32.4px] caret-accent-green',
                      {
                        'text-destructive-100': amountError,
                        'text-monochrome': !amountError,
                        'text-[24px]': textInputValue.length < 12,
                        'text-[22px]': textInputValue.length >= 12 && textInputValue.length < 15,
                        'text-[20px]': textInputValue.length >= 15 && textInputValue.length < 18,
                        'text-[18px]': textInputValue.length >= 18,
                      },
                    )}
                    placeholder={'0'}
                    value={isInputInUSDC ? textInputValue : value}
                    onChange={(e) => setTextInputValue(e.target.value)}
                  />
                </div>

                <button
                  className={classNames(
                    'flex justify-end items-center gap-2 shrink-0 py-1 px-1.5 rounded-[40px] bg-secondary-300 hover:bg-secondary-400',
                  )}
                  onClick={onTokenSelectSheet}
                >
                  <div className='relative w-[24px] h-[24px] shrink-0 flex flex-row items-center justify-center'>
                    <img
                      src={token?.img ?? defaultTokenLogo}
                      className='w-[19.2px] h-[19.2px] rounded-full'
                      onError={imgOnError(defaultTokenLogo)}
                    />
                    {tokenHolderChain && (
                      <img
                        src={tokenHolderChain.chainSymbolImageUrl}
                        className='w-[8.4px] h-[8.4px] bg-secondary-200 rounded-full absolute bottom-0 right-0'
                        onError={imgOnError(defaultTokenLogo)}
                      />
                    )}
                  </div>
                  <div className='flex items-center gap-1'>
                    <p
                      className={classNames('dark:text-white-100 text-[16px] font-medium', {
                        'flex flex-col justify-between items-start': !!selectedChain,
                      })}
                    >
                      {token?.symbol ? sliceWord(token?.symbol ?? '', 4, 4) : 'Select Token'}
                    </p>
                    <CaretDown size={20} className='dark:text-white-100 p-1' />
                  </div>
                </button>
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
            </div>

            <div className='flex justify-end items-center gap-2'>
              <span className='text-sm font-medium !leading-[18.9px] text-muted-foreground'>
                {!balanceStatus || balanceStatus === 'success' ? (
                  balanceAmount
                ) : (
                  <Skeleton width={50} />
                )}
              </span>
              {!balanceStatus || balanceStatus === 'success' ? (
                <>
                  <button
                    onClick={onHalfBtnClick}
                    className='rounded-full bg-secondary-200 px-[6px] font-medium text-xs hover:bg-secondary-300 dark:hover:text-white-100 hover:text-black-100 !leading-[19.2px] text-muted-foreground'
                  >
                    50%
                  </button>
                  <button
                    onClick={onMaxBtnClick}
                    className='rounded-full bg-secondary-200 px-[6px] font-medium text-xs hover:bg-secondary-300 dark:hover:text-white-100 hover:text-black-100 !leading-[19.2px] text-muted-foreground'
                  >
                    Max
                  </button>
                </>
              ) : null}
            </div>
          </div>
          {!isIBCError && addressError && selectedAddress ? (
            <div className='text-left text-xs text-destructive-100 font-medium !leading-[16px]'>
              You can only send {selectedToken?.symbol} on {sendChainEcosystem}.
            </div>
          ) : null}
        </div>
        <ErrorWarningTokenCard />
      </div>
    </>
  )
}

export const TokenInputCard = observer(TokenInputCardView)
