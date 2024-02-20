import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { LineDivider } from '@leapwallet/leap-ui'
import PopupLayout from 'components/layout/popup-layout'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { Images } from 'images'
import React, { useState } from 'react'
import { useNavigate } from 'react-router'
import { Colors } from 'theme/colors'

import {
  All,
  ChainChips,
  CollectionCardLoading,
  Collections,
  Favourites,
  Filter,
  Hidden,
  LoadAuraNft,
  LoadNftData,
  LoadOmniflixNft,
  LoadStargazeNft,
  ManageCollections,
  NoNft,
  SelectedSortsByChips,
  SelectSortBy,
} from './components'
import { useNftContext } from './context'

export function ShowNfts() {
  const navigate = useNavigate()
  const {
    _isLoading,
    areAllNftsHiddenRef,
    collectionData,
    setActiveTab,
    activeTab,
    nftChains,
    sortedCollectionChains,
  } = useNftContext()
  const [searchedText, setSearchedText] = useState('')
  const [showSelectSortBy, setShowSelectSortBy] = useState(false)

  const activeChain = useActiveChain()
  const [showManageCollections, setShowManageCollections] = useState(false)
  const [selectedSortsBy, setSelectedSortsBy] = useState<SupportedChain[]>([])

  return (
    <div className='relative w-[400px] overflow-clip'>
      <PopupLayout
        header={
          <div className='relative h-[72px] w-[400px] overflow-hidden flex items-center justify-between py-3 px-6'>
            <h1 className='text-black-100 dark:text-white-100 text-xl font-medium'>
              NFT Collections
            </h1>
            <button
              className='cursor-pointer'
              onClick={() => {
                navigate('/home')
              }}
            >
              <img src={Images.Misc.Cross} alt='close' className='invert dark:invert-0' />
            </button>
            <div className='flex absolute bottom-0 left-0'>
              <LineDivider />
            </div>
            <div
              className='absolute w-full h-1 left-0 top-0'
              style={{ backgroundColor: Colors.getChainColor(activeChain) }}
            />
          </div>
        }
      >
        {_isLoading === false && Object.values(collectionData?.nfts ?? {}).length === 0 ? (
          <NoNft />
        ) : (
          <div className='px-6 pt-4 pb-8'>
            {activeTab === 'All' && sortedCollectionChains.length > 0 && (
              <Filter
                searchedText={searchedText}
                setSearchedText={setSearchedText}
                onClickSortBy={() => setShowSelectSortBy(true)}
              />
            )}

            <ChainChips
              handleTabClick={(selectedTab: string) => {
                setActiveTab(selectedTab)
                setSearchedText('')
              }}
            />
            {activeTab === 'All' && selectedSortsBy.length > 0 && (
              <SelectedSortsByChips
                selectedSortsBy={selectedSortsBy}
                setSelectedSortsBy={setSelectedSortsBy}
              />
            )}

            {activeTab === 'All' && (
              <All searchedText={searchedText.trim()} selectedSortsBy={selectedSortsBy} />
            )}
            {activeTab === 'Favorites' && <Favourites />}
            {activeTab === 'Collections' && (
              <Collections setShowManageCollections={setShowManageCollections} />
            )}
            {activeTab === 'Hidden' && <Hidden />}

            {activeTab === 'All' && (
              <>
                {_isLoading && !areAllNftsHiddenRef.current && <CollectionCardLoading />}

                {nftChains.map((nftChain, index) => {
                  const { forceContractsListChain } = nftChain
                  const _index = `${forceContractsListChain}-${index}`

                  if (forceContractsListChain === 'omniflix') {
                    return <LoadOmniflixNft key={_index} index={_index} nftChain={nftChain} />
                  } else if (forceContractsListChain === 'stargaze') {
                    return <LoadStargazeNft key={_index} index={_index} nftChain={nftChain} />
                  } else if (forceContractsListChain === 'aura') {
                    return <LoadAuraNft key={_index} index={_index} nftChain={nftChain} />
                  }

                  return <LoadNftData key={_index} index={_index} nftChain={nftChain} />
                })}
              </>
            )}
          </div>
        )}
      </PopupLayout>

      <SelectSortBy
        isVisible={showSelectSortBy}
        onClose={() => setShowSelectSortBy(false)}
        selectedSortsBy={selectedSortsBy}
        setSelectedSortsBy={setSelectedSortsBy}
      />
      <ManageCollections
        isVisible={showManageCollections}
        onClose={() => setShowManageCollections(false)}
      />
    </div>
  )
}
