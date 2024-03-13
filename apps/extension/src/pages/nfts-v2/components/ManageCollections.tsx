import {
  sliceSearchWord,
  useActiveChain,
  useDisabledNFTsCollections,
  useSetDisabledNFTsInStorage,
} from '@leapwallet/cosmos-wallet-hooks'
import { CardDivider, HeaderActionType } from '@leapwallet/leap-ui'
import BottomSheet from 'components/bottom-sheet/BottomSheet'
import { EmptyCard } from 'components/empty-card'
import { Images } from 'images'
import React, { useMemo, useState } from 'react'
import { Colors } from 'theme/colors'

import { useNftContext } from '../context'
import { NftAvatar, NftToggleCard, NoCollectionCard, Text } from './index'

export type ManageCollectionsProps = {
  isVisible: boolean
  onClose: VoidFunction
  openAddCollectionSheet: () => void
}

export function ManageCollections({
  isVisible,
  onClose,
  openAddCollectionSheet,
}: ManageCollectionsProps) {
  const { collectionData } = useNftContext()
  const activeChain = useActiveChain()
  const collections = useMemo(
    () => collectionData?.collections ?? [],
    [collectionData?.collections],
  )

  const [searchedText, setSearchedText] = useState('')
  const disabledNFTsCollections = useDisabledNFTsCollections()
  const setDisabledNFTsCollections = useSetDisabledNFTsInStorage()

  const filteredCollections = useMemo(() => {
    return (
      collections
        ?.filter((collection) => {
          const lowercasedSearchedText = searchedText.trim().toLowerCase()
          const { name, address } = collection

          if (
            name.trim().toLowerCase().includes(lowercasedSearchedText) ||
            address.trim().toLowerCase().includes(lowercasedSearchedText)
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

  const handleToggleClick = async (isEnabled: boolean, collectionAddress: string) => {
    let _disabledNFTsCollections: string[] = []

    if (isEnabled) {
      _disabledNFTsCollections = disabledNFTsCollections.filter(
        (collection) => collection !== collectionAddress,
      )
    } else {
      _disabledNFTsCollections = [...disabledNFTsCollections, collectionAddress]
    }

    await setDisabledNFTsCollections(_disabledNFTsCollections)
  }

  return (
    <>
      <BottomSheet
        isVisible={isVisible}
        headerTitle='Manage Collections'
        onClose={handleBottomSheetClose}
        headerActionType={HeaderActionType.CANCEL}
        closeOnClickBackDrop={true}
      >
        <div className='w-full h-[420px] flex flex-col pt-6 pb-2 px-7 sticky top-[72px] bg-gray-50 dark:bg-black-100'>
          <div className='flex items-center justify-between'>
            <div className='w-[344px] flex h-10 bg-white-100 dark:bg-gray-900 rounded-[30px] mb-4 py-2 pl-5 pr-[10px]'>
              <input
                placeholder='search collections'
                className='flex flex-grow text-base text-gray-600 dark:text-gray-200  outline-none bg-white-0'
                onChange={(event) => setSearchedText(event.target.value)}
              />
              <img src={Images.Misc.SearchIcon} />
            </div>

            <button className='mb-4 ml-2' onClick={openAddCollectionSheet}>
              <img src={Images.Misc.PlusIcon} alt='add token' />
            </button>
          </div>

          <div className='overflow-y-auto pb-20'>
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
                      <p>
                        You can manually add a new collection{' '}
                        <button
                          className='border-none bg-transparent hover:underline cursor-pointer font-bold text-sm'
                          style={{ color: Colors.getChainColor(activeChain) }}
                          onClick={openAddCollectionSheet}
                        >
                          here
                        </button>
                      </p>
                    }
                  />
                )}
              </>
            ) : null}

            <div className='rounded-2xl flex flex-col items-center justify-center dark:bg-gray-900 bg-white-100 overflow-hidden'>
              {filteredCollections.map((filteredCollection, index, array) => {
                const isLast = index === array.length - 1
                const { name, address, image } = filteredCollection

                return (
                  <React.Fragment key={`${address}-${index}`}>
                    <NftToggleCard
                      title={<Text className='capitalize'>{name.toLowerCase()}</Text>}
                      isRounded={isLast}
                      size='md'
                      avatar={<NftAvatar image={image} />}
                      isEnabled={!disabledNFTsCollections.includes(address)}
                      onClick={(isEnabled) => handleToggleClick(isEnabled, address)}
                    />
                    {!isLast ? <CardDivider /> : null}
                  </React.Fragment>
                )
              })}
            </div>
          </div>
        </div>
      </BottomSheet>
    </>
  )
}
