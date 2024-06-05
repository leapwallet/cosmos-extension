import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { LineDivider } from '@leapwallet/leap-ui'
import AlertStrip from 'components/alert-strip/AlertStrip'
import PopupLayout from 'components/layout/popup-layout'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { Images } from 'images'
import React, { Fragment, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { Colors } from 'theme/colors'
import { isCompassWallet } from 'utils/isCompassWallet'

import {
  AddCollection,
  All,
  CantSeeNfts,
  ChainChips,
  CollectionCardLoading,
  Collections,
  Favourites,
  Filter,
  Hidden,
  LoadAuraNft,
  LoadNftData,
  LoadOmniflixNft,
  // LoadSeiPalletNft,
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
  const [loadingMessage, setLoadingMessage] = useState('')
  const [showAddCollectionSheet, setShowAddCollectionSheet] = useState(false)

  useEffect(() => {
    let timeout1: NodeJS.Timeout
    let timeout2: NodeJS.Timeout

    if (isCompassWallet()) {
      timeout1 = setTimeout(() => {
        if (_isLoading && Object.values(collectionData?.nfts ?? {}).length === 0) {
          setLoadingMessage('It seems like you have a lot of NFTs 🚀')
        }
      }, 10000)

      timeout2 = setTimeout(() => {
        if (_isLoading && Object.values(collectionData?.nfts ?? {}).length === 0) {
          setLoadingMessage('You really have a lot of NFTs 🚀🚀🚀. Fetching them all ⏱️')
        }
      }, 40000)
    }

    return () => {
      clearTimeout(timeout1)
      clearTimeout(timeout2)
    }
  }, [_isLoading, collectionData?.nfts])

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
        {_isLoading && loadingMessage && isCompassWallet() ? (
          <AlertStrip
            message={loadingMessage}
            className='bg-white-100 dark:bg-gray-900'
            textClassName='text-gray-800 dark:text-white-100'
            alwaysShow={false}
            onHide={() => setLoadingMessage('')}
            timeOut={4000}
          />
        ) : null}

        {_isLoading === false && Object.values(collectionData?.nfts ?? {}).length === 0 ? (
          <NoNft
            openManageCollectionsSheet={() => setShowManageCollections(true)}
            openAddCollectionSheet={() => setShowAddCollectionSheet(true)}
          />
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

                  switch (forceContractsListChain) {
                    case 'omniflix':
                      return <LoadOmniflixNft key={_index} index={_index} nftChain={nftChain} />

                    case 'stargaze':
                      return <LoadStargazeNft key={_index} index={_index} nftChain={nftChain} />

                    case 'aura':
                      return <LoadAuraNft key={_index} index={_index} nftChain={nftChain} />

                    // case 'seiTestnet2':
                    //   return (
                    //     <Fragment key={_index}>
                    //       {/* {isCompassWallet() ? (
                    //         <LoadSeiPalletNft index={`${_index}-pallet`} nftChain={nftChain} />
                    //       ) : null} */}

                    //       <LoadNftData index={_index} nftChain={nftChain} />
                    //     </Fragment>
                    //   )

                    default:
                      return <LoadNftData key={_index} index={_index} nftChain={nftChain} />
                  }
                })}

                {_isLoading === false ? (
                  <CantSeeNfts openAddCollectionSheet={() => setShowAddCollectionSheet(true)} />
                ) : null}
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
        openAddCollectionSheet={() => setShowAddCollectionSheet(true)}
      />
      <AddCollection
        isVisible={showAddCollectionSheet}
        onClose={() => setShowAddCollectionSheet(false)}
      />
    </div>
  )
}
