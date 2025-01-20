import {
  ENABLED_NFTS_COLLECTIONS,
  normalizeImageSrc,
  sliceSearchWord,
  useActiveChain,
  useDisabledNFTsCollections,
  useEnabledNftsCollectionsStore,
  useFetchCompassManageNftCollections,
  useSetDisabledNFTsInStorage,
} from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { NftStore } from '@leapwallet/cosmos-wallet-store'
import classNames from 'classnames'
import BottomModal from 'components/bottom-modal'
import { CustomCardDivider } from 'components/custom-card-divider'
import { EmptyCard } from 'components/empty-card'
import { useChainPageInfo } from 'hooks'
import { Images } from 'images'
import React, { useMemo, useState } from 'react'
import { nftStore } from 'stores/nft-store'
import { isCompassWallet } from 'utils/isCompassWallet'
import { isSidePanel } from 'utils/isSidePanel'
import Browser from 'webextension-polyfill'

import { NftAvatar, NftToggleCard, NoCollectionCard, Text } from './index'

export type ManageCollectionsProps = {
  isVisible: boolean
  onClose: VoidFunction
  openAddCollectionSheet: () => void
  nftStore: NftStore
}

export function ManageCollections({
  isVisible,
  onClose,
  openAddCollectionSheet,
}: ManageCollectionsProps) {
  const collectionData = nftStore.nftDetails.collectionData
  const showAddCollectionSheet = nftStore.compassSeiApiIsDown
  const { topChainColor } = useChainPageInfo()
  const activeChain = useActiveChain()
  const { data } = useFetchCompassManageNftCollections({})

  const collections = useMemo(() => {
    if (isCompassWallet() && showAddCollectionSheet) {
      return (data ?? []).map((collection) => ({
        name: collection.name || 'Unknown',
        address: collection.address ?? '',
        image: collection.image || '',
        chain: activeChain,
      }))
    }

    return collectionData?.collections ?? []
  }, [activeChain, collectionData?.collections, data, showAddCollectionSheet])

  const [searchedText, setSearchedText] = useState('')
  const disabledNFTsCollections = useDisabledNFTsCollections()
  const { enabledNftsCollections, setEnabledNftsCollections } = useEnabledNftsCollectionsStore()
  const setDisabledNFTsCollections = useSetDisabledNFTsInStorage()

  const filteredCollections = useMemo(() => {
    return (
      collections
        ?.filter((collection) => {
          const lowercasedSearchedText = searchedText.trim().toLowerCase()
          const { name, address, chain } = collection

          if (
            name.trim().toLowerCase().includes(lowercasedSearchedText) ||
            address.trim().toLowerCase().includes(lowercasedSearchedText) ||
            chain.trim().toLowerCase().includes(lowercasedSearchedText)
          ) {
            return true
          }

          return false
        })
        ?.sort((collectionA, collectionB) => {
          const nameA = collectionA.name.toUpperCase()
          const nameB = collectionB.name.toUpperCase()

          if (nameA < nameB) return -1
          if (nameA < nameB) return 1
          return 0
        }) ?? []
    )
  }, [collections, searchedText])

  const handleBottomSheetClose = () => {
    onClose()
    setSearchedText('')
  }

  const handleToggleClick = async (
    isEnabled: boolean,
    collectionAddress: string,
    chain: SupportedChain,
  ) => {
    let _disabledNFTsCollections: string[] = []
    let _enabledNftsCollections: string[] = []
    const existingEnabledNftsCollections = enabledNftsCollections?.[chain] ?? []

    if (isEnabled) {
      _disabledNFTsCollections = disabledNFTsCollections.filter(
        (collection) => collection !== collectionAddress,
      )

      if (isCompassWallet() && !existingEnabledNftsCollections.includes(collectionAddress)) {
        _enabledNftsCollections = [...existingEnabledNftsCollections, collectionAddress]
      }
    } else {
      if (!_disabledNFTsCollections.includes(collectionAddress)) {
        _disabledNFTsCollections = [...disabledNFTsCollections, collectionAddress]
      }

      if (isCompassWallet()) {
        _enabledNftsCollections = existingEnabledNftsCollections.filter(
          (collection) => collection !== collectionAddress,
        )
      }
    }

    await setDisabledNFTsCollections(_disabledNFTsCollections)

    if (isCompassWallet()) {
      setEnabledNftsCollections({
        ...enabledNftsCollections,
        [chain]: _enabledNftsCollections,
      })
      await Browser.storage.local.set({
        [ENABLED_NFTS_COLLECTIONS]: JSON.stringify({
          ...enabledNftsCollections,
          [chain]: _enabledNftsCollections,
        }),
      })
    }
  }

  return (
    <BottomModal
      isOpen={isVisible}
      onClose={handleBottomSheetClose}
      title={'Manage Collections'}
      closeOnBackdropClick={true}
    >
      <div className='w-full h-[calc(100%-180px)] flex flex-col sticky top-[72px] bg-gray-50 dark:bg-black-100'>
        <div className='flex items-center justify-between'>
          <div className='w-[344px] flex h-10 bg-white-100 dark:bg-gray-950 rounded-[30px] mb-4 py-2 pl-5 pr-[10px]'>
            <input
              placeholder='search collections'
              className='flex flex-grow text-base text-gray-600 dark:text-gray-200  outline-none bg-white-0'
              onChange={(event) => setSearchedText(event.target.value)}
            />
            <img src={Images.Misc.Search} />
          </div>

          {isCompassWallet() && !showAddCollectionSheet ? null : (
            <button className='mb-4 ml-2' onClick={openAddCollectionSheet}>
              <img src={Images.Misc.PlusIcon} alt='add token' />
            </button>
          )}
        </div>

        <div className='overflow-y-auto'>
          {filteredCollections.length === 0 ? (
            <>
              {searchedText ? (
                <EmptyCard
                  isRounded
                  subHeading='Please try again with something else'
                  heading={`No results for “${sliceSearchWord(searchedText)}”`}
                  src={Images.Misc.Explore}
                />
              ) : (
                <NoCollectionCard
                  title='No collections detected'
                  subTitle={
                    isCompassWallet() && !showAddCollectionSheet ? null : (
                      <p>
                        You can manually add a new collection{' '}
                        <button
                          className='border-none bg-transparent hover:underline cursor-pointer font-bold text-sm'
                          style={{ color: topChainColor }}
                          onClick={openAddCollectionSheet}
                        >
                          here
                        </button>
                      </p>
                    )
                  }
                />
              )}
            </>
          ) : null}

          <div className='rounded-2xl flex flex-col items-center justify-center dark:bg-gray-950 bg-white-100 overflow-hidden'>
            {filteredCollections.map((filteredCollection, index, array) => {
              const isLast = index === array.length - 1
              const { name, address, image, chain } = filteredCollection

              return (
                <React.Fragment key={`${address}-${index}`}>
                  <NftToggleCard
                    title={
                      <Text className={classNames({ '!max-w-[95px]': isSidePanel() })}>{name}</Text>
                    }
                    isRounded={isLast}
                    size='md'
                    avatar={<NftAvatar image={normalizeImageSrc(image ?? '', address)} />}
                    isEnabled={
                      isCompassWallet() && showAddCollectionSheet
                        ? enabledNftsCollections?.[chain]?.includes(address) ?? false
                        : !disabledNFTsCollections.includes(address)
                    }
                    onClick={(isEnabled) => handleToggleClick(isEnabled, address, chain)}
                  />

                  {!isLast ? <CustomCardDivider /> : null}
                </React.Fragment>
              )
            })}
          </div>
        </div>
      </div>
    </BottomModal>
  )
}
