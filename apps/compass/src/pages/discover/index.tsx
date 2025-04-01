import {
  DiscoverCollection,
  DiscoverDapp,
  useCompassDiscoverAssets,
} from '@leapwallet/cosmos-wallet-hooks'
import { SearchInput } from 'components/search-input'
import Text from 'components/text'
import { PageName } from 'config/analytics'
import { usePageView } from 'hooks/analytics/usePageView'
import { Images } from 'images'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { compassTokenTagsStore, rootDenomsStore } from 'stores/denoms-store-instance'
import { cn } from 'utils/cn'

import AllAssets from './components/AllAssets'
import { DiscoverHeader } from './components/discover-header'
import { DiscoverBannerAD } from './components/DiscoverBannerAD'
import TrendingCollections from './components/TrendingCollections'
import TrendingDapps from './components/TrendingDapps'
import TrendingTokens from './components/TrendingTokens'

export enum AssetType {
  TOKENS = 'Tokens',
  DAPPS = 'dApps',
  NFTS = 'NFTs',
}

const tabs = [
  {
    title: AssetType.TOKENS,
    bgColor: 'bg-green-800 hover:bg-green-700',
    bgColor2: 'bg-green-600',
  },
  {
    title: AssetType.DAPPS,
    bgColor: 'bg-indigo-700 hover:bg-indigo-600',
    bgColor2: 'bg-indigo-400',
  },
  {
    title: AssetType.NFTS,
    bgColor: 'bg-orange-800 hover:bg-orange-700',
    bgColor2: 'bg-orange-600',
  },
]

const Discover = observer(() => {
  usePageView(PageName.Discover)

  const { data: discoverAssets, isLoading } = useCompassDiscoverAssets()
  const [searchTerm, setSearchTerm] = useState('')
  const [showAllAssets, setShowAllAssets] = useState<AssetType | undefined>()
  const [isExpand, setIsExpand] = useState<AssetType | undefined>()
  const listRef = useRef<HTMLDivElement | null>(null)
  const denomInfos = rootDenomsStore.allDenoms

  const { filteredTokens, filteredDapps, filteredNFTs } = useMemo(() => {
    if (!discoverAssets) {
      return { filteredTokens: [], filteredDapps: [], filteredNFTs: [] }
    }
    let filteredTokens: string[] = Object.keys(compassTokenTagsStore.compassTokenTags),
      filteredDapps: DiscoverDapp[] = discoverAssets.dapps,
      filteredNFTs: DiscoverCollection[] = discoverAssets.collections
    if (!searchTerm) {
      filteredTokens = filteredTokens.filter((token) =>
        discoverAssets.trendingTokens.includes(token),
      )
      filteredDapps = filteredDapps.filter((dapp) => dapp.trending)
      filteredNFTs = filteredNFTs.filter((collection) => collection.trending)
    } else {
      const lowerSearchTerm = searchTerm.toLowerCase()
      filteredTokens = filteredTokens.filter(
        (token) =>
          denomInfos[token].coinMinimalDenom.toLowerCase().includes(lowerSearchTerm) ||
          denomInfos[token].name?.toLowerCase().includes(lowerSearchTerm),
      )
      filteredDapps = filteredDapps.filter((dapp) =>
        dapp.name.toLowerCase().includes(lowerSearchTerm),
      )
      filteredNFTs = filteredNFTs.filter((collection) =>
        collection.name.toLowerCase().includes(lowerSearchTerm),
      )
    }
    return { filteredTokens, filteredDapps, filteredNFTs }
  }, [denomInfos, discoverAssets, searchTerm])

  const onExpand = useCallback(
    (val: AssetType) => {
      if (searchTerm.length > 0) {
        if (isExpand && isExpand === val) {
          setIsExpand(undefined)
        } else {
          setIsExpand(val)
        }
      } else {
        setShowAllAssets(val)
        if (listRef.current) {
          document.getElementById('popup-layout')?.scrollTo({ top: 0 })
        }
      }
    },
    [isExpand, searchTerm.length],
  )

  useEffect(() => {
    if (searchTerm.length === 0) {
      setIsExpand(undefined)
    }
  }, [searchTerm.length])

  useEffect(() => {
    setSearchTerm('')
  }, [showAllAssets])

  return (
    <div ref={listRef} className='mb-20'>
      <DiscoverHeader />

      {!showAllAssets && (
        <div className='w-full flex flex-col items-center p-4 gap-4 flex-1'>
          <SearchInput
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder='Search for tokens, dApps, NFTs...'
            onClear={() => setSearchTerm('')}
            divClassName='rounded-2xl w-full flex items-center gap-[10px] bg-gray-50 dark:bg-gray-900 py-3 pr-3 pl-4 dark:focus-within:border-white-100 hover:border-secondary-400 focus-within:border-black-100 border border-transparent'
            inputClassName='flex flex-grow text-base text-gray-400 outline-none bg-white-0 font-bold dark:text-white-100 text-md placeholder:text-sm placeholder:font-medium dark:placeholder:text-gray-400  !leading-[21px]'
          />
          {searchTerm.length > 0 || !discoverAssets ? null : (
            <>
              <div className='flex gap-3 self-start'>
                {tabs.map((tab) => {
                  return (
                    <div
                      key={tab.title}
                      className={cn(
                        'flex items-center gap-2 rounded-[20px] py-2 pr-4 pl-3 cursor-pointer',
                        tab.bgColor,
                      )}
                      onClick={() => setShowAllAssets(tab.title)}
                    >
                      <img
                        src={Images.Misc.Toll}
                        className={cn('rounded-full w-6 h-6 p-1', tab.bgColor2)}
                      />
                      <Text size='sm' className='font-bold' color='text-monochrome'>
                        {tab.title}
                      </Text>
                    </div>
                  )
                })}
              </div>
              <DiscoverBannerAD />
            </>
          )}
          {filteredTokens.length > 0 && (
            <TrendingTokens
              tokens={filteredTokens}
              onExpand={onExpand}
              isSearched={searchTerm.length > 0}
              isExpanded={isExpand === AssetType.TOKENS}
            />
          )}
          {filteredDapps.length > 0 && (
            <TrendingDapps
              dapps={filteredDapps}
              onExpand={onExpand}
              isSearched={searchTerm.length > 0}
              isExpanded={isExpand === AssetType.DAPPS}
            />
          )}
          {filteredNFTs.length > 0 && (
            <TrendingCollections
              collections={filteredNFTs}
              onExpand={onExpand}
              isSearched={searchTerm.length > 0}
              isExpanded={isExpand === AssetType.NFTS}
            />
          )}
          {filteredDapps.length === 0 &&
            filteredNFTs.length === 0 &&
            filteredTokens.length === 0 &&
            !isLoading && (
              <Text
                className='px-6 py-[180px] w-full text-[18px] font-bold !leading-6'
                color='text-secondary-600'
              >
                No dApps, tokens or collections found
              </Text>
            )}
        </div>
      )}
      {showAllAssets && discoverAssets && (
        <AllAssets
          showFor={showAllAssets}
          onBackClick={() => setShowAllAssets(undefined)}
          discoverAssets={discoverAssets}
        />
      )}
    </div>
  )
})

export default Discover
