import { formatTokenAmount, sliceWord } from '@leapwallet/cosmos-wallet-hooks'
import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import { useFormatCurrency } from 'hooks/settings/useCurrency'
import { useHideAssets } from 'hooks/settings/useHideAssets'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import React, { useMemo } from 'react'
import { SourceChain, SourceToken } from 'types/swap'
import { imgOnError } from 'utils/imgOnError'

export type TxReviewTokenInfoProps = {
  amount: string
  token: SourceToken | null
  chain: SourceChain | undefined
  tokenImgClassName?: string
  chainImgClassName?: string
}

export function TxReviewTokenInfo({
  amount,
  token,
  chain,
  tokenImgClassName,
  chainImgClassName,
}: TxReviewTokenInfoProps) {
  const [formatCurrency] = useFormatCurrency()
  const { formatHideBalance } = useHideAssets()
  const defaultTokenLogo = useDefaultTokenLogo()

  const dollarAmount = useMemo(() => {
    let _dollarAmount = '0'

    if (token && token.usdPrice && amount) {
      _dollarAmount = String(parseFloat(token.usdPrice) * parseFloat(amount))
    }

    return formatHideBalance(formatCurrency(new BigNumber(_dollarAmount)))

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formatCurrency, token, amount])

  const balanceAmount = useMemo(() => {
    return formatHideBalance(
      formatTokenAmount(amount ?? '0', sliceWord(token?.symbol ?? '', 4, 4), 3),
    )

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, token?.symbol])

  return (
    <div className='flex flex-col items-center w-full max-w-[140px] gap-4'>
      <div className='relative'>
        <img
          className={classNames(
            'border-[8px] border-gray-100 bg-gray-100 dark:bg-gray-850 dark:border-gray-850 rounded-full',
            {
              'w-[44px] h-[44px]': !tokenImgClassName,
              [tokenImgClassName ?? '']: tokenImgClassName,
            },
          )}
          src={token?.img ?? defaultTokenLogo}
          onError={imgOnError(defaultTokenLogo)}
        />
        <img
          className={classNames(
            'absolute -bottom-[6px] border-[4px] border-gray-100 bg-gray-100 dark:border-gray-850 dark:bg-gray-850 z-10 rounded-full',
            {
              'w-[24px] h-[24px] -right-[4px]': !chainImgClassName,
              [chainImgClassName ?? '']: chainImgClassName,
            },
          )}
          src={chain?.icon ?? defaultTokenLogo}
          onError={imgOnError(defaultTokenLogo)}
        />
      </div>

      <div className='flex flex-col justify-start items-center w-full'>
        <p className='text-black-100 dark:text-white-100 text-sm !leading-[19.2px] font-bold w-full overflow-hidden text-ellipsis text-center whitespace-nowrap'>
          {balanceAmount}
        </p>
        <p className='text-gray-800 dark:text-gray-200 text-xs !leading-[19.2px] font-medium w-full overflow-hidden text-ellipsis text-center whitespace-nowrap'>
          {dollarAmount}
          {chain ? ` • on ${chain?.chainName}` : null}
        </p>
      </div>
    </div>
  )
}
