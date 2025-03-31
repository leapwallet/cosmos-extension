import { DiscoverCollection } from '@leapwallet/cosmos-wallet-hooks'
import { ArrowSquareOut } from '@phosphor-icons/react'
import Text from 'components/text'
import { Images } from 'images'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { cn } from 'utils/cn'

import { AssetType } from '..'

const Collection = observer(({ collection }: { collection: DiscoverCollection }) => {
  return (
    <div
      key={collection.name}
      className='py-3 px-4 bg-secondary-100 hover:bg-secondary-200 flex gap-3 items-center cursor-pointer'
      onClick={() => window.open(collection.url, '_blank')}
    >
      <img
        src={collection.icon ?? Images.Misc.DefaultCollectionLogo}
        className={cn('w-9 h-9 rounded-xl', { 'p-[7.5px] bg-muted-foreground': !collection.icon })}
      />
      <Text size='md' className='font-bold !leading-6 grow' color='text-monochrome'>
        {collection.name}
      </Text>
      <ArrowSquareOut size={32} className='p-2 text-muted-foreground' />
    </div>
  )
})

const TrendingCollections = observer(
  ({
    collections,
    showHeading = true,
    onExpand,
    isSearched = false,
    isExpanded = false,
  }: {
    collections: DiscoverCollection[]
    showHeading?: boolean
    onExpand?: (val: AssetType) => void
    isSearched?: boolean
    isExpanded?: boolean
  }) => {
    return (
      <div className='flex flex-col gap-3 w-full'>
        {showHeading ? (
          <div className='flex justify-between items-end'>
            <Text className='font-bold text-[18px] !leading-6' color='text-monochrome'>
              {isSearched ? 'Collections' : 'Trending Collections'}
            </Text>
            {collections.length > 3 || !isSearched ? (
              <div className='cursor-pointer' onClick={() => onExpand?.(AssetType.NFTS)}>
                <Text size='sm' className='font-bold !leading-5' color='text-secondary-600'>
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
          {(isExpanded === false && showHeading ? collections.slice(0, 3) : collections).map(
            (collection) => (
              <Collection key={collection.name} collection={collection} />
            ),
          )}
        </div>
      </div>
    )
  },
)

export default TrendingCollections
