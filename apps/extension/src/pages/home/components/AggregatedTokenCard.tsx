import {
  currencyDetail,
  formatPercentAmount,
  formatTokenAmount,
  IbcChainInfo,
  sliceWord,
  useGetChains,
  useUserPreferredCurrency,
} from '@leapwallet/cosmos-wallet-hooks'
import { ChainInfos, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import BigNumber from 'bignumber.js'
import { TokenImageWithFallback } from 'components/token-image-with-fallback'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from 'components/ui/tooltip'
import { AGGREGATED_CHAIN_KEY } from 'config/constants'
import { AnimatePresence, motion } from 'framer-motion'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { useFormatCurrency } from 'hooks/settings/useCurrency'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { observer } from 'mobx-react-lite'
import React, { useMemo } from 'react'
import { miscellaneousDataStore } from 'stores/chain-infos-store'
import { hideAssetsStore } from 'stores/hide-assets-store'
import { hidePercentChangeStore } from 'stores/hide-percent-change'
import { AggregatedSupportedChain } from 'types/utility'
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
  readonly hasToShowEvmTag: boolean | undefined
  readonly isEvm: boolean | undefined
  readonly tokenBalanceOnChain: SupportedChain
  readonly isPlaceholder?: boolean
  percentChange24?: number
  className?: string
}

export const AggregatedTokenCardView = observer(
  ({
    title,
    usdValue,
    amount,
    symbol,
    assetImg,
    onClick,
    ibcChainInfo,
    hasToShowEvmTag,
    isEvm,
    tokenBalanceOnChain,
    isPlaceholder,
    percentChange24,
    className,
  }: AggregatedTokenCardProps & { className?: string }) => {
    const chains = useGetChains()
    const activeChain = useActiveChain() as AggregatedSupportedChain
    const [formatCurrency] = useFormatCurrency()

    const defaultTokenLogo = useDefaultTokenLogo()
    const [preferredCurrency] = useUserPreferredCurrency()
    const formattedFiatValue = usdValue ? formatCurrency(new BigNumber(usdValue || 0), true) : '-'

    const ibcInfo = ibcChainInfo
      ? `${ibcChainInfo.pretty_name} / ${sliceWord(ibcChainInfo?.channelId ?? '', 7, 5)}`
      : ''

    const chainName = chains[tokenBalanceOnChain]?.chainName ?? ''

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
      <button
        className={cn(
          'text-start bg-secondary-100 hover:bg-secondary-200 transition-colors flex items-center justify-between py-3 px-4 w-full cursor-pointer gap-3',
          className,
        )}
        onClick={onClick}
      >
        <div className='relative w-[32px] h-[32px] shrink-0 flex items-center justify-center'>
          <TokenImageWithFallback
            assetImg={assetImg}
            text={symbol}
            altText={chainName + ' logo'}
            imageClassName='w-[30px] h-[30px] rounded-full'
            containerClassName='w-[30px] h-[30px] rounded-full'
            textClassName='text-[10px] !leading-[14px]'
          />
          {activeChain === AGGREGATED_CHAIN_KEY && (
            <img
              src={
                chains[tokenBalanceOnChain]?.chainSymbolImageUrl ??
                ChainInfos[tokenBalanceOnChain]?.chainSymbolImageUrl ??
                defaultTokenLogo
              }
              onError={imgOnError(defaultTokenLogo)}
              className='w-[15px] h-[15px] absolute bottom-[-2px] right-[-2px] rounded-full bg-white-100 dark:bg-black-100'
            />
          )}
        </div>

        <div className='flex flex-col justify-start mr-auto'>
          <span className='font-bold text-md truncate max-w-32 text-foreground !leading-[22px] flex items-center gap-1'>
            {sliceWord(title, 9, 4)}
            {ibcInfo ? (
              <span
                title={ibcInfo}
                className='px-1 bg-secondary-200 h-[19px] rounded-sm text-secondary-800 text-xs font-medium !leading-[19px] shrink-0'
              >
                IBC
              </span>
            ) : null}
          </span>

          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger className='h-[19px] flex items-center'>
                <AnimatePresence mode='wait'>
                  <motion.span
                    key={hideAssetsStore.isHidden ? 'hidden' : 'visible'}
                    className='text-muted-foreground text-xs font-medium !leading-[19px] truncate max-w-44'
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
                    {isEvm && hasToShowEvmTag ? ' · EVM' : ''}
                  </motion.span>
                </AnimatePresence>
              </TooltipTrigger>
              <TooltipContent side='bottom' className='capitalize'>
                {chainName}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className='flex flex-col items-end gap-y-[2px]'>
          {isPlaceholder ? (
            <p className='font-bold text-sm text-end'>-</p>
          ) : (
            <AnimatePresence mode='wait'>
              <motion.span
                key={hideAssetsStore.isHidden ? 'hidden-fiat' : 'visible-fiat'}
                className={
                  'font-bold text-sm !leading-[20px] text-end ' +
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
                  'text-xs font-medium items-end !leading-[19px]',
                  percentChange24
                    ? percentChange24 > 0
                      ? 'text-accent-success-200'
                      : 'text-destructive-100'
                    : 'text-muted-foreground',
                  hideAssetsStore.isHidden ? 'text-muted-foreground' : '',
                )}
              >
                {hideAssetsStore.isHidden ? '•••' : percentChangeText || '-'}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </button>
    )
  },
)

const NobleRewards = () => {
  return (
    <div className='w-full py-1.5 bg-accent-green-900 bg-opacity-10 text-center font-medium text-xs text-accent-green-200'>
      Earn rewards of up to
      <span className='font-bold'>
        &nbsp;
        {parseFloat(miscellaneousDataStore.data?.noble?.usdnEarnApy) > 0
          ? new BigNumber(miscellaneousDataStore.data.noble.usdnEarnApy)
              .multipliedBy(100)
              .toFixed(2) + '%'
          : '-'}
        &nbsp;APY!
      </span>
    </div>
  )
}

export const AggregatedTokenCard = (props: AggregatedTokenCardProps) => {
  const showNobleRewards = props.tokenBalanceOnChain === 'noble' && props.symbol === 'USDC'

  return (
    <div className='flex flex-col w-full rounded-2xl overflow-hidden'>
      <AggregatedTokenCardView {...props} />
      {showNobleRewards && <NobleRewards />}
    </div>
  )
}
