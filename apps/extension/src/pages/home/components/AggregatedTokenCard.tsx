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
import classNames from 'classnames'
import Badge from 'components/badge/Badge'
import { AGGREGATED_CHAIN_KEY } from 'config/constants'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { useFormatCurrency } from 'hooks/settings/useCurrency'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { observer } from 'mobx-react-lite'
import React, { useMemo } from 'react'
import { hideAssetsStore } from 'stores/hide-assets-store'
import { hidePercentChangeStore } from 'stores/hide-percent-change'
import { AggregatedSupportedChain } from 'types/utility'
import { imgOnError } from 'utils/imgOnError'

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
}

const AggregatedTokenCardView = ({
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
}: AggregatedTokenCardProps) => {
  const chains = useGetChains()
  const [formatCurrency] = useFormatCurrency()
  const activeChain = useActiveChain() as AggregatedSupportedChain

  const defaultTokenLogo = useDefaultTokenLogo()
  const [preferredCurrency] = useUserPreferredCurrency()
  const formattedFiatValue = usdValue ? formatCurrency(new BigNumber(usdValue)) : '-'

  const ibcInfo = useMemo(() => {
    if (!ibcChainInfo) return ''

    return `${ibcChainInfo.pretty_name} / ${sliceWord(ibcChainInfo?.channelId ?? '', 7, 5)}`
  }, [ibcChainInfo])

  const chainName = useMemo(
    () => chains[tokenBalanceOnChain]?.chainName ?? 'Unknown Chain',
    [chains, tokenBalanceOnChain],
  )

  const percentChangeText = useMemo(() => {
    if (percentChange24) {
      if (percentChange24 >= 0) {
        return `+${formatPercentAmount(percentChange24.toString(), 2)}%`
      } else {
        return percentChange24 >= -100
          ? `${formatPercentAmount(percentChange24.toString(), 2)}%`
          : '-99.99%'
      }
    }
    return null
  }, [percentChange24])

  const TokenName = useMemo(() => {
    return (
      <>
        <span className='text-ellipsis overflow-hidden whitespace-nowrap max-w-[132px]'>
          {sliceWord(title, 7, 4)}
        </span>
        {!hidePercentChangeStore.isHidden && percentChange24 ? (
          <div
            className={classNames(
              'flex items-center h-[18px] rounded-[4px] px-1 bg-opacity-10',
              percentChange24 >= 0 ? 'bg-green-600' : 'bg-red-300',
            )}
          >
            <div
              className={classNames(
                'text-xs font-medium',
                percentChange24 >= 0 ? ' text-green-600' : 'text-red-600 dark:text-red-300',
              )}
            >
              {percentChangeText}
            </div>
          </div>
        ) : null}
      </>
    )
  }, [title, hidePercentChangeStore.isHidden, percentChange24, percentChangeText])

  return (
    <div
      className='bg-white-100 dark:bg-gray-950 rounded-xl flex items-center justify-between p-[12px] w-full cursor-pointer'
      onClick={onClick}
    >
      <div className='flex items-center justify-start gap-2 w-[150px]'>
        <img
          className='w-[36px] h-[36px] rounded-full'
          src={assetImg ?? defaultTokenLogo}
          alt={chainName + ' logo'}
          onError={imgOnError(defaultTokenLogo)}
        />

        <div className='flex flex-col gap-y-[1px]'>
          <div className='text-black-100 dark:text-white-100 font-[700] flex items-center justify-start gap-2'>
            {TokenName}
          </div>
          <div className='flex gap-x-1 items-center'>
            {activeChain === AGGREGATED_CHAIN_KEY && (
              <p className='text-gray-600 dark:text-gray-400 text-[12px] font-[500]'>{chainName}</p>
            )}
            {ibcChainInfo ? <Badge text='IBC' title={ibcInfo} /> : null}
            {isEvm && hasToShowEvmTag ? <Badge text='EVM' /> : null}
          </div>
        </div>
      </div>
      <div className='flex flex-col items-end gap-y-0.5'>
        {isPlaceholder ? (
          <p className='text-black-100 dark:text-white-100 font-[700] text-[14px] text-right'>-</p>
        ) : (
          formattedFiatValue !== '-' && (
            <p className='text-black-100 dark:text-white-100 font-[700] text-[14px] text-right'>
              {hideAssetsStore.formatHideBalance(formattedFiatValue)}
            </p>
          )
        )}
        <p className='text-gray-600 dark:text-gray-400 text-[12px] font-[500] text-right'>
          {isPlaceholder
            ? '-'
            : hideAssetsStore.formatHideBalance(
                formatTokenAmount(
                  amount,
                  sliceWord(symbol, 4, 4),
                  3,
                  currencyDetail[preferredCurrency].locale,
                ),
              )}
        </p>
      </div>
    </div>
  )
}

export const AggregatedTokenCard = observer(AggregatedTokenCardView)
