import {
  currencyDetail,
  formatPercentAmount,
  formatTokenAmount,
  IbcChainInfo,
  sliceWord,
  useGetChains,
  useUserPreferredCurrency,
} from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import BigNumber from 'bignumber.js'
import { AnimatePresence, motion } from 'framer-motion'
import { useFormatCurrency } from 'hooks/settings/useCurrency'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { observer } from 'mobx-react-lite'
import React, { useMemo } from 'react'
import { hideAssetsStore } from 'stores/hide-assets-store'
import { hidePercentChangeStore } from 'stores/hide-percent-change'
import { cn } from 'utils/cn'
import { imgOnError } from 'utils/imgOnError'
import { opacityFadeInOut, transition150 } from 'utils/motion-variants'

type AggregatedTokenCardProps = {
  readonly title: string
  readonly usdValue: string | undefined
  readonly amount: string
  readonly symbol: string
  readonly assetImg: string | undefined
  readonly onClick: () => void
  readonly ibcChainInfo: IbcChainInfo | undefined
  readonly isEvm: boolean | undefined
  readonly tokenBalanceOnChain: SupportedChain
  readonly isPlaceholder?: boolean
  percentChange24?: number
  className?: string
}

const AggregatedTokenCardView = ({
  title,
  usdValue,
  amount,
  symbol,
  assetImg,
  onClick,
  ibcChainInfo,
  isEvm,
  tokenBalanceOnChain,
  isPlaceholder,
  percentChange24,
  className,
}: AggregatedTokenCardProps) => {
  const chains = useGetChains()
  const [formatCurrency] = useFormatCurrency()

  const defaultTokenLogo = useDefaultTokenLogo()
  const [preferredCurrency] = useUserPreferredCurrency()
  const formattedFiatValue = formatCurrency(new BigNumber(usdValue || 0), true)

  const ibcInfo = ibcChainInfo
    ? `${ibcChainInfo.pretty_name} / ${sliceWord(ibcChainInfo?.channelId ?? '', 7, 5)}`
    : ''

  const chainName = chains[tokenBalanceOnChain]?.chainName ?? 'Unknown Chain'

  const percentChangeText = useMemo(() => {
    if (!percentChange24) {
      return '-'
    }

    if (percentChange24 >= 0) {
      return `+${formatPercentAmount(percentChange24.toString(), 2)}%`
    } else {
      return percentChange24 >= -100
        ? `${formatPercentAmount(percentChange24.toString(), 2)}%`
        : '-99.99%'
    }
  }, [percentChange24])

  return (
    <div
      className={cn(
        'bg-secondary-100 hover:bg-secondary-200 transition-colors rounded-2xl flex items-center justify-between py-3 px-4 w-full cursor-pointer gap-3',
        className,
      )}
      onClick={onClick}
    >
      <img
        className='size-10 rounded-full'
        src={assetImg ?? defaultTokenLogo}
        alt={chainName + ' logo'}
        onError={imgOnError(defaultTokenLogo)}
      />

      <div className='flex flex-col justify-start mr-auto'>
        <span className='font-bold text-md truncate max-w-32'>{sliceWord(title, 7, 4)}</span>

        <AnimatePresence mode='wait'>
          <motion.span
            key={hideAssetsStore.isHidden ? 'hidden' : 'visible'}
            className='text-muted-foreground text-xs font-medium truncate max-w-44'
            transition={transition150}
            variants={opacityFadeInOut}
            initial='hidden'
            animate='visible'
            exit='hidden'
          >
            {hideAssetsStore.formatHideBalance(
              formatTokenAmount(
                amount,
                sliceWord(symbol, 4, 4),
                3,
                currencyDetail[preferredCurrency].locale,
              ),
            )}
            {isEvm ? ' · EVM' : ''}
            {ibcInfo ? <span title={ibcInfo}> · IBC</span> : null}
          </motion.span>
        </AnimatePresence>
      </div>

      <div className='flex flex-col items-end gap-y-1'>
        {isPlaceholder ? (
          <p className='font-bold text-sm text-end'>-</p>
        ) : (
          <AnimatePresence mode='wait'>
            <motion.span
              key={hideAssetsStore.isHidden ? 'hidden-fiat' : 'visible-fiat'}
              className={
                'font-bold text-sm text-end ' +
                (hideAssetsStore.isHidden ? 'text-muted-foreground' : '')
              }
              transition={transition150}
              variants={opacityFadeInOut}
              initial='hidden'
              animate='visible'
              exit='hidden'
            >
              {hideAssetsStore.isHidden ? '••••••' : formattedFiatValue}
            </motion.span>
          </AnimatePresence>
        )}

        <AnimatePresence mode='wait'>
          {!hidePercentChangeStore.isHidden && (
            <motion.span
              key={hideAssetsStore.isHidden ? 'hidden-percent' : 'visible-percent'}
              transition={transition150}
              variants={opacityFadeInOut}
              initial='hidden'
              animate='visible'
              exit='hidden'
              className={cn(
                'text-xs font-medium items-end',
                percentChange24
                  ? percentChange24 > 0
                    ? 'text-accent-success-200'
                    : 'text-destructive-200'
                  : 'text-muted-foreground',
                hideAssetsStore.isHidden ? 'text-muted-foreground' : '',
              )}
            >
              {hideAssetsStore.isHidden ? '•••' : percentChangeText || '-'}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export const AggregatedTokenCard = observer(AggregatedTokenCardView)
