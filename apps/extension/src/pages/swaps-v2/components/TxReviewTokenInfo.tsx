import { formatTokenAmount, sliceWord } from '@leapwallet/cosmos-wallet-hooks'
import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import { TokenImageWithFallback } from 'components/token-image-with-fallback'
import { AnimatePresence, motion } from 'framer-motion'
import { useFormatCurrency } from 'hooks/settings/useCurrency'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { observer } from 'mobx-react-lite'
import React, { useMemo } from 'react'
import Skeleton from 'react-loading-skeleton'
import { hideAssetsStore } from 'stores/hide-assets-store'
import { SourceChain, SourceToken } from 'types/swap'
import { imgOnError } from 'utils/imgOnError'
import { opacityVariants, transition } from 'utils/motion-variants/global-layout-motions'

export type TxReviewTokenInfoProps = {
  amount: string
  token: SourceToken | null
  chain: SourceChain | undefined
  tokenImgClassName?: string
  chainImgClassName?: string
  assetUsdValue?: BigNumber
  amountLoading?: boolean
}

function TxReviewTokenInfoView({
  amount,
  token,
  chain,
  tokenImgClassName,
  chainImgClassName,
  assetUsdValue,
  amountLoading,
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
      <div className='relative flex justify-center items-center !w-12 !h-12'>
        <TokenImageWithFallback
          assetImg={token?.img}
          text={token?.symbol ?? token?.name ?? ''}
          altText={token?.symbol ?? token?.name ?? ''}
          imageClassName={classNames('rounded-full', {
            'w-10 h-10': !tokenImgClassName,
            [tokenImgClassName ?? '']: tokenImgClassName,
          })}
          containerClassName='w-10 h-10'
          textClassName='text-sm'
          key={token?.img ?? ''}
        />

        <img
          className={classNames('absolute -bottom-0 z-10 rounded-full', {
            'w-[18.462px] h-[18.462px] -right-0': !chainImgClassName,
            [chainImgClassName ?? '']: chainImgClassName,
          })}
          src={chain?.icon ?? defaultTokenLogo}
          onError={imgOnError(defaultTokenLogo)}
        />
      </div>

      <div className='flex flex-col justify-start items-center w-full text-center max-[399px]:shrink-0 max-[399px]:overflow-visible gap-y-1'>
        <AnimatePresence mode='wait' initial={false}>
          {amountLoading ? (
            <motion.div
              variants={opacityVariants}
              initial='enter'
              animate='animate'
              exit='exit'
              transition={transition}
              key='skeleton-amount'
              className='items-center flex h-[27px] max-[350px]:!w-[80px] w-[120px]'
            >
              <Skeleton containerClassName='block !leading-none w-full flex items-center max-[350px]:!h-[16px] h-[24px]' />
            </motion.div>
          ) : (
            <motion.p
              variants={opacityVariants}
              initial='enter'
              animate='animate'
              exit='exit'
              transition={transition}
              key='balance-amount'
              className='text-black-100 dark:text-white-100 text-lg max-[350px]:!text-[13px] !leading-[27px] font-bold w-full overflow-hidden max-[399px]:!overflow-visible max-[399px]:flex max-[399px]:justify-center text-ellipsis text-center whitespace-nowrap'
            >
              {balanceAmount}
            </motion.p>
          )}
        </AnimatePresence>
        <AnimatePresence mode='popLayout' initial={false}>
          {amountLoading ? (
            <motion.div
              variants={opacityVariants}
              initial='enter'
              animate='animate'
              exit='exit'
              transition={transition}
              key='skeleton-amount-fiat'
              className='items-center flex h-[18.9px] max-[350px]:!w-[40px] w-[60px]'
            >
              <Skeleton containerClassName='block !leading-none w-full flex items-center max-[350px]:!h-[12px] h-[16px]' />
            </motion.div>
          ) : (
            <motion.p
              variants={opacityVariants}
              initial='enter'
              animate='animate'
              exit='exit'
              transition={transition}
              key='balance-amount-fiat'
              className='text-muted-foreground text-sm max-[350px]:!text-[11px] !leading-[18.9px] font-normal w-full overflow-hidden max-[399px]:!overflow-visible max-[399px]:flex max-[399px]:justify-center text-ellipsis text-center whitespace-nowrap'
            >
              {dollarAmount}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export const TxReviewTokenInfo = observer(TxReviewTokenInfoView)
