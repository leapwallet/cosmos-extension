import { useDisabledNFTsCollections } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { ChainTagsStore, NftStore } from '@leapwallet/cosmos-wallet-store'
import { LineDivider } from '@leapwallet/leap-ui'
import PopupLayout from 'components/layout/popup-layout'
import { useChainPageInfo } from 'hooks'
import { Images } from 'images'
import { observer } from 'mobx-react-lite'
import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { hiddenNftStore } from 'stores/manage-nft-store'

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
  ManageCollections,
  NoNft,
  SelectedSortsByChips,
  SelectSortBy,
} from './components'
import NetworkErrorInNft from './components/NetworkErrorInNft'
import { useNftContext } from './context'

type ShowNftsProps = {
  nftStore: NftStore
  chainTagsStore: ChainTagsStore
}

export const ShowNfts = observer(({ nftStore, chainTagsStore }: ShowNftsProps) => {
  const navigate = useNavigate()
  const { setActiveTab, activeTab } = useNftContext()
  const [searchedText, setSearchedText] = useState('')
  const [showSelectSortBy, setShowSelectSortBy] = useState(false)

  const { topChainColor } = useChainPageInfo()
  const [showManageCollections, setShowManageCollections] = useState(false)
  const [selectedSortsBy, setSelectedSortsBy] = useState<SupportedChain[]>([])
  const [showAddCollectionSheet, setShowAddCollectionSheet] = useState(false)

  const disabledNfts = useDisabledNFTsCollections()

  const _isLoading = nftStore.nftDetails.loading
  const collectionData = nftStore.nftDetails.collectionData
  const sortedCollectionChains = nftStore.getSortedCollectionChains(
    disabledNfts,
    hiddenNftStore.hiddenNfts,
  )
  const areAllNftsHidden = nftStore.getAreAllNftsHidden(hiddenNftStore.hiddenNfts)

  const hasToShowNetworkErrorView = useMemo(() => {
    return (
      _isLoading === false &&
      Object.values(collectionData?.nfts ?? {}).length === 0 &&
      nftStore.nftDetails.networkError
    )
  }, [_isLoading, collectionData?.nfts, nftStore.nftDetails.networkError])

  return (
    <div className='relative w-full overflow-clip panel-height'>
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
              style={{ backgroundColor: topChainColor }}
            />
          </div>
        }
      >
        {hasToShowNetworkErrorView ? (
          <NetworkErrorInNft
            title='NFTs can’t be loaded'
            subTitle={<>NFTs can’t be loaded due to a technical failure, Kindly try again later.</>}
            showRetryButton={true}
            nftStore={nftStore}
            setShowAddCollectionSheet={setShowAddCollectionSheet}
          />
        ) : (
          <>
            {_isLoading === false && Object.values(collectionData?.nfts ?? {}).length === 0 ? (
              <NoNft
                openManageCollectionsSheet={() => setShowManageCollections(true)}
                openAddCollectionSheet={() => setShowAddCollectionSheet(true)}
                nftStore={nftStore}
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
                  nftStore={nftStore}
                />
                {activeTab === 'All' && selectedSortsBy.length > 0 && (
                  <SelectedSortsByChips
                    selectedSortsBy={selectedSortsBy}
                    setSelectedSortsBy={setSelectedSortsBy}
                  />
                )}

                {activeTab === 'All' && (
                  <All
                    searchedText={searchedText.trim()}
                    selectedSortsBy={selectedSortsBy}
                    nftStore={nftStore}
                  />
                )}
                {activeTab === 'Favorites' && <Favourites nftStore={nftStore} />}
                {activeTab === 'Collections' && (
                  <Collections
                    setShowManageCollections={setShowManageCollections}
                    nftStore={nftStore}
                  />
                )}

                {activeTab === 'Hidden' && <Hidden nftStore={nftStore} />}
                {activeTab === 'All' && (
                  <>
                    {_isLoading && !areAllNftsHidden && <CollectionCardLoading />}
                    {_isLoading === false ? (
                      <CantSeeNfts
                        openAddCollectionSheet={() => setShowAddCollectionSheet(true)}
                        className='w-full'
                        nftStore={nftStore}
                      />
                    ) : null}
                  </>
                )}
              </div>
            )}
          </>
        )}
      </PopupLayout>

      <SelectSortBy
        isVisible={showSelectSortBy}
        onClose={() => setShowSelectSortBy(false)}
        selectedSortsBy={selectedSortsBy}
        setSelectedSortsBy={setSelectedSortsBy}
        nftStore={nftStore}
      />
      {/* <ManageCollections
        isVisible={showManageCollections}
        onClose={() => setShowManageCollections(false)}
        openAddCollectionSheet={() => setShowAddCollectionSheet(true)}
        nftStore={nftStore}
      /> */}
      <AddCollection
        chainTagsStore={chainTagsStore}
        isVisible={showAddCollectionSheet}
        onClose={() => setShowAddCollectionSheet(false)}
        // nftStore={nftStore}
      />
    </div>
  )
})
