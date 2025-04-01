import { formatPercentAmount } from '@leapwallet/cosmos-wallet-hooks'
import BigNumber from 'bignumber.js'
import Text from 'components/text'
import { PageName } from 'config/analytics'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { useFormatCurrency } from 'hooks/settings/useCurrency'
import { Images } from 'images'
import { observer } from 'mobx-react-lite'
import React, { useMemo } from 'react'
import { useNavigate } from 'react-router'
import { marketDataStore } from 'stores/balance-store'
import { chainInfoStore, compassTokensAssociationsStore } from 'stores/chain-infos-store'
import { rootDenomsStore } from 'stores/denoms-store-instance'
import { cn } from 'utils/cn'
import { formatForSubstring } from 'utils/strings'

import { AssetType } from '..'
import { TimeFilter } from './AllAssets'

const TokenCard = observer(({ token, timeFilter }: { token: string; timeFilter: TimeFilter }) => {
  const navigate = useNavigate()
  const [formatCurrency] = useFormatCurrency()
  const denomInfo = rootDenomsStore.allDenoms[token]

  const chains = chainInfoStore.chainInfos
  const marketData = marketDataStore.data
  const compassSeiToEvmMapping = compassTokensAssociationsStore.compassSeiToEvmMapping
  const activeChain = useActiveChain()

  const marketDataForToken = useMemo(() => {
    let key = denomInfo.coinMinimalDenom
    if (marketData?.[key]) {
      return marketData[key]
    }
    const chainId = chains[activeChain]?.chainId
    key = `${chainId}-${denomInfo.coinMinimalDenom}`
    const _marketData = marketData?.[key] ?? marketData?.[key?.toLowerCase()]
    if (_marketData) {
      return _marketData
    }
    if (!compassSeiToEvmMapping[denomInfo.coinMinimalDenom]) {
      return undefined
    }
    key = `${chainId}-${compassSeiToEvmMapping[denomInfo.coinMinimalDenom]}`
    return marketData?.[key] ?? marketData?.[key?.toLowerCase()]
  }, [denomInfo.coinMinimalDenom, marketData, chains, activeChain, compassSeiToEvmMapping])

  const percentChange = useMemo(() => {
    switch (timeFilter) {
      case TimeFilter['1D']:
        return marketDataForToken?.price_change_percentage_24h
      case TimeFilter['7D']:
        return marketDataForToken?.price_change_percentage_7d_in_currency
    }
  }, [
    marketDataForToken?.price_change_percentage_24h,
    marketDataForToken?.price_change_percentage_7d_in_currency,
    timeFilter,
  ])

  return (
    <div
      key={denomInfo.name}
      className='py-3 px-4 bg-secondary-100 hover:bg-secondary-200 flex gap-3 items-center'
      onClick={() =>
        navigate(
          `/assetDetails?assetName=${denomInfo.coinMinimalDenom}&tokenChain=${activeChain}&pageSource=${PageName.Discover}`,
          { state: rootDenomsStore.allDenoms[denomInfo.coinMinimalDenom] },
        )
      }
    >
      <img src={denomInfo.icon || Images.Logos.GenericDark} className='w-9 h-9 rounded-full' />
      <div className='flex flex-col grow'>
        <Text size='md' className='font-bold !leading-6' color='text-monochrome'>
          {denomInfo.coinDenom}
        </Text>
        <Text size='xs' className='font-medium !leading-4' color='text-muted-foreground'>
          {denomInfo.name}
        </Text>
      </div>
      <div className='flex flex-col items-end'>
        {marketDataForToken?.current_price && (
          <Text size='sm' className='font-bold !leading-5' color='text-monochrome'>
            ${formatForSubstring(marketDataForToken.current_price.toString())}
          </Text>
        )}
        {percentChange ? (
          <div
            className={cn('text-xs font-medium !leading-4', {
              'text-green-500 dark:text-green-500': percentChange >= 0,
              'text-red-600 dark:text-red-400': percentChange < 0,
            })}
          >
            {percentChange > 0 ? '+' : ''}
            {formatPercentAmount(new BigNumber(percentChange).toString(), 2)}%
          </div>
        ) : null}
      </div>
    </div>
  )
})

const TrendingTokens = observer(
  ({
    tokens,
    showHeading = true,
    onExpand,
    isSearched = false,
    isExpanded = false,
    timeFilter = TimeFilter['1D'],
  }: {
    tokens: string[]
    showHeading?: boolean
    onExpand?: (val: AssetType) => void
    isSearched?: boolean
    isExpanded?: boolean
    timeFilter?: TimeFilter
  }) => {
    return (
      <div className={cn('flex flex-col gap-3 w-full cursor-pointer', { 'pb-4': showHeading })}>
        {showHeading ? (
          <div className='flex justify-between items-end'>
            <Text className='font-bold text-[18px] !leading-6' color='text-monochrome'>
              {isSearched ? 'Tokens' : 'Trending Tokens'}
            </Text>
            {tokens.length > 3 || !isSearched ? (
              <div className='cursor-pointer' onClick={() => onExpand?.(AssetType.TOKENS)}>
                <Text size='sm' className='font-bold !leading-5' color='text-secondary-600'>
                  {isSearched ? (isExpanded ? 'See less' : 'Load more') : 'See more'}
                </Text>
              </div>
            ) : null}
          </div>
        ) : null}
        <div className={cn('overflow-hidden', showHeading && 'rounded-2xl')}>
          {(isExpanded === false && showHeading ? tokens.slice(0, 3) : tokens).map((token) => (
            <TokenCard key={token} token={token} timeFilter={timeFilter} />
          ))}
        </div>
      </div>
    )
  },
)

export default TrendingTokens
