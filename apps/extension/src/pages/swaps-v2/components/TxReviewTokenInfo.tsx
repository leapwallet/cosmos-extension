import { formatTokenAmount, sliceWord } from '@leapwallet/cosmos-wallet-hooks'
import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import { TokenImageWithFallback } from 'components/token-image-with-fallback'
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
        <TokenImageWithFallback
          assetImg={token?.img}
          text={token?.symbol ?? token?.name ?? ''}
          altText={token?.symbol ?? token?.name ?? ''}
          imageClassName={classNames(
            'border-[8px] border-gray-100 bg-gray-100 dark:bg-gray-850 dark:border-gray-850 rounded-full',
            {
              'w-[44px] h-[44px]': !tokenImgClassName,
              [tokenImgClassName ?? '']: tokenImgClassName,
            },
          )}
          containerClassName='w-[44px] h-[44px] !bg-gray-200 dark:!bg-gray-800 border-[8px] border-gray-100 dark:border-gray-850'
          textClassName='text-[8px] !leading-[12px]'
          key={token?.img ?? ''}
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

      <div className='flex flex-col justify-start items-center w-full text-center max-[399px]:shrink-0 max-[399px]:overflow-visible'>
        <p className='text-black-100 dark:text-white-100 text-sm max-[350px]:!text-[13px] !leading-[19.2px] font-bold w-full overflow-hidden max-[399px]:!overflow-visible max-[399px]:flex max-[399px]:justify-center text-ellipsis text-center whitespace-nowrap'>
          {balanceAmount}
        </p>
        <p className='text-gray-800 dark:text-gray-200 text-xs max-[350px]:!text-[11px] !leading-[19.2px] font-medium w-full overflow-hidden max-[399px]:!overflow-visible max-[399px]:flex max-[399px]:justify-center text-ellipsis text-center whitespace-nowrap'>
          {dollarAmount}
          {chain ? ` • on ${chain?.chainName}` : null}
        </p>
      </div>
    </div>
  )
}

export const TxReviewTokenInfo = observer(TxReviewTokenInfoView)
