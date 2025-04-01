import {
  CompassDiscoverAssets,
  DiscoverCollection,
  DiscoverDapp,
} from '@leapwallet/cosmos-wallet-hooks'
import { ArrowLeft, CaretDown, CaretUp, Check } from '@phosphor-icons/react'
import Text from 'components/text'
import { observer } from 'mobx-react-lite'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { compassTokenTagsStore } from 'stores/denoms-store-instance'
import { cn } from 'utils/cn'

import { AssetType } from '..'
import TrendingCollections from './TrendingCollections'
import TrendingDapps from './TrendingDapps'
import TrendingTokens from './TrendingTokens'

enum TypeFilter {
  ALL = 'All',
  TRENDING = 'Trending',
  TOP = 'Top',
  STABLECOINS = 'Stablecoins',
  MEME = 'Meme',
}

export enum TimeFilter {
  '1D' = '24h',
  '7D' = '7 days',
  '30D' = '30 days',
}

type Props<T> = {
  data: T[]
  value: T
  setValue: (val: T) => void
}

const Filter = observer(
  <T extends TypeFilter | TimeFilter>({ data, value, setValue }: Props<T>) => {
    return (
      <div className='absolute top-10 py-1 bg-background rounded-lg shadow-lg border border-background'>
        {data.map((item) => {
          const typedItem = item as T
          return (
            <div
              key={item}
              className={cn(
                'flex justify-between bg-background hover:bg-secondary-100 w-[200px] items-center py-2 px-4 cursor-pointer hover:text-monochrome',
                {
                  'text-monochrome': value === item,
                  'text-muted-foreground': value !== item,
                },
              )}
              onClick={() => setValue(typedItem)}
            >
              <p className='font-medium text-sm'>{item}</p>
              {value === item && <Check size={16} className='text-muted-foreground' />}
            </div>
          )
        })}
      </div>
    )
  },
)

const AllAssets = observer(
  ({
    showFor,
    onBackClick,
    discoverAssets,
  }: {
    showFor: AssetType
    onBackClick: () => void
    discoverAssets: CompassDiscoverAssets
  }) => {
    const [typeFilter, setTypeFilter] = useState<TypeFilter>(TypeFilter.ALL)
    const [timeFilter, setTimeFilter] = useState<TimeFilter>(TimeFilter['1D'])
    const [showTypeFilter, setShowTypeFilter] = useState(false)
    const [showTimeFilter, setShowTimeFilter] = useState(false)
    const dropdownRef1 = useRef<HTMLDivElement | null>(null)
    const dropdownRef2 = useRef<HTMLDivElement | null>(null)

    const { filteredTokens, filteredDapps, filteredNFTs } = useMemo(() => {
      let filteredTokens: string[] = Object.keys(compassTokenTagsStore.compassTokenTags)

      const filteredDapps = discoverAssets.dapps
      const filteredNFTs = discoverAssets.collections

      if (showFor === AssetType.TOKENS) {
        if (typeFilter === TypeFilter.TRENDING) {
          filteredTokens = filteredTokens.filter((token) =>
            discoverAssets.trendingTokens?.includes(token),
          )
        } else if (typeFilter === TypeFilter.TOP) {
          filteredTokens = filteredTokens.filter((token) =>
            discoverAssets.topTokens?.includes(token),
          )
        } else {
          filteredTokens = filteredTokens.filter((token) =>
            compassTokenTagsStore.compassTokenTags[token].includes(typeFilter),
          )
        }
      }

      return { filteredTokens, filteredDapps, filteredNFTs }
    }, [discoverAssets, showFor, typeFilter])

    const getAssetList = () => {
      switch (showFor) {
        case AssetType.NFTS:
          return <TrendingCollections collections={filteredNFTs} showHeading={false} />
        case AssetType.DAPPS:
          return <TrendingDapps dapps={filteredDapps} showHeading={false} />
        case AssetType.TOKENS:
          return (
            <TrendingTokens tokens={filteredTokens} showHeading={false} timeFilter={timeFilter} />
          )
      }
    }

    useEffect(() => {
      const handleClickOutside = (event: any) => {
        if (dropdownRef1.current && !dropdownRef1.current.contains(event.target)) {
          setShowTypeFilter(false)
        }
        if (dropdownRef2.current && !dropdownRef2.current.contains(event.target)) {
          setShowTimeFilter(false)
        }
      }

      document.addEventListener('click', handleClickOutside)

      return () => {
        document.removeEventListener('click', handleClickOutside)
      }
    }, [])

    return (
      <div className='flex flex-col'>
        <div className='flex justify-between items-center py-1.5 px-3'>
          <ArrowLeft
            size={48}
            className='p-3 text-muted-foreground cursor-pointer hover:text-monochrome'
            onClick={onBackClick}
          />
          <Text className='text-[18px] font-bold !leading-6' color='text-monochrome'>
            {showFor === AssetType.NFTS ? 'Collections' : showFor}
          </Text>
          <div className='w-12 h-12' />
        </div>
        <div className='flex flex-col px-4 pb-4 gap-3'>
          {showFor === AssetType.TOKENS ? (
            <div className='flex gap-2 relative'>
              <div
                className='flex items-center gap-1 py-1.5 pr-3 pl-4 bg-secondary hover:bg-secondary-200 rounded-[20px] cursor-pointer'
                onClick={() => setShowTypeFilter((prev) => !prev)}
                ref={dropdownRef1}
              >
                <Text size='sm' className='font-bold' color='text-secondary-800'>
                  {typeFilter}
                </Text>
                {showTypeFilter ? (
                  <CaretUp size={12} className='text-muted-foreground' />
                ) : (
                  <CaretDown size={12} className='text-muted-foreground' />
                )}
              </div>
              <div
                className='flex items-center gap-1 py-1.5 pr-3 pl-4 bg-secondary hover:bg-secondary-200 rounded-[20px] cursor-pointer'
                ref={dropdownRef2}
                onClick={() => setShowTimeFilter((prev) => !prev)}
              >
                <Text size='sm' className='font-bold' color='text-secondary-800'>
                  {timeFilter}
                </Text>
                {showTimeFilter ? (
                  <CaretUp size={12} className='text-muted-foreground' />
                ) : (
                  <CaretDown size={12} className='text-muted-foreground' />
                )}
              </div>
              {showTypeFilter && (
                <Filter
                  data={Object.values(TypeFilter) as TypeFilter[]}
                  setValue={(val: TypeFilter) => setTypeFilter(val)}
                  value={typeFilter}
                />
              )}
              {showTimeFilter && (
                <Filter
                  data={Object.values(TimeFilter) as TimeFilter[]}
                  setValue={(val: TimeFilter) => setTimeFilter(val)}
                  value={timeFilter}
                />
              )}
            </div>
          ) : null}

          <div className='rounded-2xl bg-secondary-100 overflow-hidden'>
            {showFor === AssetType.TOKENS ? (
              <div className='flex pt-2 px-4 gap-3'>
                <div className='w-10' />
                <Text size='xs' className='font-bold !leading-4 grow' color='text-muted-foreground'>
                  Token
                </Text>
                <Text size='xs' className='font-bold !leading-4' color='text-muted-foreground'>
                  Price
                </Text>
              </div>
            ) : null}
            {getAssetList()}
          </div>
        </div>
      </div>
    )
  },
)

export default AllAssets
