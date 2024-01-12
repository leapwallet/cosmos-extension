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
    <div className='flex flex-col items-center'>
      <div className='relative w-[60px]'>
        <img
          className={classNames('border-[0.5px] border-gray-700 rounded-full', {
            'w-[60px] h-[60px]': !tokenImgClassName,
            [tokenImgClassName ?? '']: tokenImgClassName,
          })}
          src={token?.img ?? defaultTokenLogo}
          onError={imgOnError(defaultTokenLogo)}
        />
        <img
          className={classNames(
            'absolute bottom-0 border-[1px] dark:border-gray-900 dark:bg-gray-900 z-10 rounded-full',
            {
              'w-[20px] h-[20px] right-0': !chainImgClassName,
              [chainImgClassName ?? '']: chainImgClassName,
            },
          )}
          src={chain?.icon ?? defaultTokenLogo}
          onError={imgOnError(defaultTokenLogo)}
        />
      </div>

      <p className='dark:text-white-100 text-base mt-[6px]'>{balanceAmount}</p>
      <p className='text-gray-300 text-sm'>{dollarAmount}</p>
    </div>
  )
}
