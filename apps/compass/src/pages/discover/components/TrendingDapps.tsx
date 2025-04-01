import { DiscoverDapp } from '@leapwallet/cosmos-wallet-hooks'
import { ArrowSquareOut } from '@phosphor-icons/react'
import Text from 'components/text'
import { Images } from 'images'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { cn } from 'utils/cn'

import { AssetType } from '..'

const Dapp = observer(({ dapp }: { dapp: DiscoverDapp }) => {
  return (
    <div
      key={dapp.name}
      className='py-3 px-4 bg-secondary-100 hover:bg-secondary-200 flex gap-3 cursor-pointer'
      onClick={() => window.open(dapp.url, '_blank')}
    >
      <img
        src={dapp.icon || Images.Misc.DefaultDappLogo}
        className={cn('w-9 h-9 rounded-xl', { 'p-[7.5px] bg-muted-foreground': !dapp.icon })}
      />
      <div className='flex flex-col grow'>
        <Text size='md' className='font-bold !leading-6' color='text-monochrome'>
          {dapp.name}
        </Text>
        <Text size='xs' className='font-medium !leading-4' color='text-muted-foreground'>
          {dapp.category}
        </Text>
      </div>
      <ArrowSquareOut size={32} className='p-2 text-muted-foreground' />
    </div>
  )
})

const TrendingDapps = observer(
  ({
    dapps,
    showHeading = true,
    onExpand,
    isSearched = false,
    isExpanded = false,
  }: {
    dapps: DiscoverDapp[]
    showHeading?: boolean
    onExpand?: (val: AssetType) => void
    isSearched?: boolean
    isExpanded?: boolean
  }) => {
    return (
      <div className={cn('flex flex-col gap-3 w-full', { 'pb-4': showHeading })}>
        {showHeading ? (
          <div className='flex justify-between items-end'>
            <Text className='font-bold text-[18px] !leading-6' color='text-monochrome'>
              dApps
            </Text>
            {dapps.length > 3 || !isSearched ? (
              <div className='cursor-pointer' onClick={() => onExpand?.(AssetType.DAPPS)}>
                <Text
                  size='sm'
                  className='font-bold !leading-5 cursor-pointer'
                  color='text-secondary-600'
                >
                  {isSearched ? (isExpanded ? 'See less' : 'Load more') : 'See more'}
                </Text>
              </div>
            ) : null}
          </div>
        ) : null}
        <div
          className={cn('overflow-hidden', {
            'rounded-2xl': showHeading,
          })}
        >
          {(isExpanded === false && showHeading ? dapps.slice(0, 3) : dapps).map((dapp) => (
            <Dapp key={dapp.name} dapp={dapp} />
          ))}
        </div>
      </div>
    )
  },
)

export default TrendingDapps
