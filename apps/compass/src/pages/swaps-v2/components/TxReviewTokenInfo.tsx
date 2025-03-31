import { formatTokenAmount, sliceWord } from '@leapwallet/cosmos-wallet-hooks'
import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import { useFormatCurrency } from 'hooks/settings/useCurrency'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { observer } from 'mobx-react-lite'
import React, { useMemo } from 'react'
import { hideAssetsStore } from 'stores/hide-assets-store'
import { SourceChain, SourceToken } from 'types/swap'
import { imgOnError } from 'utils/imgOnError'

export type TxReviewTokenInfoProps = {
  amount: string
  token: SourceToken | null
  chain: SourceChain | undefined
  tokenImgClassName?: string
  chainImgClassName?: string
  assetUsdValue?: BigNumber
}

function TxReviewTokenInfoView({
  amount,
  token,
  chain,
  tokenImgClassName,
  chainImgClassName,
  assetUsdValue,
}: TxReviewTokenInfoProps) {
  const [formatCurrency] = useFormatCurrency()
  const defaultTokenLogo = useDefaultTokenLogo()
  const dollarAmount = useMemo(() => {
    let _dollarAmount = '0'

    if (token && token.usdPrice && amount) {
      _dollarAmount = String(parseFloat(token.usdPrice) * parseFloat(amount))
    }

    if (
      (!_dollarAmount || _dollarAmount === '0') &&
      assetUsdValue &&
      !assetUsdValue.isNaN() &&
      assetUsdValue.gt(0)
    ) {
      _dollarAmount = assetUsdValue.toString()
    }

    return hideAssetsStore.formatHideBalance(formatCurrency(new BigNumber(_dollarAmount)))

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formatCurrency, token, amount])

  const balanceAmount = useMemo(() => {
    return hideAssetsStore.formatHideBalance(
      formatTokenAmount(amount ?? '0', sliceWord(token?.symbol ?? '', 4, 4), 3),
    )

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, token?.symbol])

  return (
    <div className='flex flex-col items-center w-full max-w-[140px] max-[399px]:!max-w-[calc(min(140px,45%))] gap-4 max-[399px]:overflow-visible'>
      <div className='relative'>
        <img
          className={classNames('rounded-full', {
            'w-[48px] h-[48px]': !tokenImgClassName,
            [tokenImgClassName ?? '']: tokenImgClassName,
          })}
          src={token?.img ?? defaultTokenLogo}
          onError={imgOnError(defaultTokenLogo)}
        />
      </div>

      <div className='flex flex-col justify-start items-center w-full text-center max-[399px]:shrink-0 max-[399px]:overflow-visible gap-y-1'>
        <p className='text-black-100 dark:text-white-100 text-lg max-[350px]:!text-[13px] !leading-[27px] font-bold w-full overflow-hidden max-[399px]:!overflow-visible max-[399px]:flex max-[399px]:justify-center text-ellipsis text-center whitespace-nowrap'>
          {balanceAmount}
        </p>
        <p className='text-muted-foreground text-sm max-[350px]:!text-[11px] !leading-[18.9px] font-normal w-full overflow-hidden max-[399px]:!overflow-visible max-[399px]:flex max-[399px]:justify-center text-ellipsis text-center whitespace-nowrap'>
          {dollarAmount}
        </p>
      </div>
    </div>
  )
}

export const TxReviewTokenInfo = observer(TxReviewTokenInfoView)
