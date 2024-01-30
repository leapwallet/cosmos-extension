import { formatTokenAmount, sliceWord, useChainInfo } from '@leapwallet/cosmos-wallet-hooks'
import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import { useFormatCurrency } from 'hooks/settings/useCurrency'
import { useHideAssets } from 'hooks/settings/useHideAssets'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { Images } from 'images'
import { FilledArrowDown } from 'images/misc'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { SourceToken } from 'types/swap'
import { imgOnError } from 'utils/imgOnError'

type TokenInputCardProps = {
  readOnly?: boolean
  value?: string
  placeholder?: string
  token?: SourceToken | null
  chainName?: string
  chainLogo?: string
  // eslint-disable-next-line no-unused-vars
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
  onTokenSelectSheet?: () => void
  selectTokenDisabled?: boolean
  selectChainDisabled?: boolean
  onChainSelectSheet?: () => void
  amountError?: string
  showFor?: 'source' | 'destination'
  onGearClick?: () => void
}

export function TokenInputCard({
  readOnly,
  value,
  placeholder,
  token,
  chainName,
  chainLogo,
  onChange,
  onTokenSelectSheet,
  selectTokenDisabled,
  selectChainDisabled,
  onChainSelectSheet,
  amountError,
  showFor,
  onGearClick,
}: TokenInputCardProps) {
  const [formatCurrency] = useFormatCurrency()
  const { formatHideBalance } = useHideAssets()

  const activeChainInfo = useChainInfo()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isFocused, setIsFocused] = useState(false)
  const defaultTokenLogo = useDefaultTokenLogo()

  const dollarAmount = useMemo(() => {
    let _dollarAmount = '0'

    if (token && token.usdPrice && value) {
      _dollarAmount = String(parseFloat(token.usdPrice) * parseFloat(value))
    }

    return formatHideBalance(formatCurrency(new BigNumber(_dollarAmount)))

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formatCurrency, token, value])

  const balanceAmount = useMemo(() => {
    return formatHideBalance(
      formatTokenAmount(token?.amount ?? '0', sliceWord(token?.symbol ?? '', 4, 4), 3),
    )

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token?.amount, token?.symbol])

  useEffect(() => {
    if (!readOnly && inputRef.current) {
      inputRef.current.focus()
    }
  }, [readOnly])

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

  return (
    <div
      className={classNames(
        'w-full bg-white-100 dark:bg-gray-900 rounded-2xl pt-4 px-4 pb-6 flex flex-col gap-3',
        {
          relative: showFor === 'source',
        },
      )}
      key={balanceAmount}
    >
      <div
        className={classNames(
          'rounded-full bg-gray-50 dark:bg-gray-800 py-2 px-3 flex flex-row gap-2 items-center justify-center self-start cursor-pointer',
          {
            'opacity-50 pointer-events-none': selectChainDisabled,
          },
        )}
        onClick={onChainSelectSheet}
      >
        <img
          src={chainLogo}
          className='w-[24px] h-[24px] rounded-full border-[0.5px] border-gray-700'
          onError={imgOnError(defaultTokenLogo)}
        />
        <p className='dark:text-white-100 text-base'>{chainName}</p>
        <img src={FilledArrowDown} className='w-[6px] h-[6px]' />
      </div>

      {showFor === 'source' ? (
        <img
          src={Images.Misc.Settings}
          className='absolute right-[16px] top-[28px] w-[18px] h-[18px] cursor-pointer'
          onClick={onGearClick}
        />
      ) : null}

      <div
        className='flex flex-col items-center border-[1px] border-gray-200 dark:border-gray-800 gap-2 p-3 rounded-lg'
        style={
          isFocused
            ? {
                borderColor: activeChainInfo.theme.primaryColor,
              }
            : {}
        }
      >
        <div className='flex flex-row items-center justify-between w-full gap-2'>
          <div
            className={classNames(
              'flex flex-row items-center justify-center gap-2 cursor-pointer',
              {
                'opacity-50 pointer-events-none': selectTokenDisabled,
              },
            )}
            onClick={onTokenSelectSheet}
          >
            <img
              src={token?.img ?? defaultTokenLogo}
              className='w-[24px] h-[24px] rounded-full border-[0.5px] border-gray-700'
              onError={imgOnError(defaultTokenLogo)}
            />
            <p
              className={classNames('dark:text-white-100 text-sm', {
                'w-[105px]': !token?.symbol,
              })}
            >
              {token?.symbol ? sliceWord(token?.symbol ?? '', 4, 4) : 'Select token'}
            </p>
            <img src={FilledArrowDown} className='w-[6px] h-[6px]' />
          </div>

          <input
            type='number'
            className='bg-transparent outline-none text-right flex-1 dark:text-gray-50'
            placeholder={isFocused && showFor === 'source' ? '' : placeholder}
            readOnly={readOnly}
            value={value}
            ref={inputRef}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onChange={onChange}
          />
        </div>

        <div className='flex flex-row items-center justify-between text-gray-300 text-sm w-full'>
          {amountError ? (
            <span className='text-red-300'>{amountError}</span>
          ) : (
            <span>Balance: {balanceAmount}</span>
          )}

          <span>{dollarAmount}</span>
        </div>
      </div>
    </div>
  )
}
