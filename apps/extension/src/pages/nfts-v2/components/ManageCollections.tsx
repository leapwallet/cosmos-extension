import {
  sliceSearchWord,
  useDisabledNFTsCollections,
  useSetDisabledNFTsInStorage,
} from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { MagnifyingGlassMinus } from '@phosphor-icons/react'
import BottomModal from 'components/new-bottom-modal'
import Text from 'components/text'
import { SearchInput } from 'components/ui/input/search-input'
import { Images } from 'images'
import React, { useMemo, useState } from 'react'
import { nftStore } from 'stores/nft-store'
import { imgOnError } from 'utils/imgOnError'
import { sliceWord } from 'utils/strings'

export type ManageCollectionsProps = {
  isVisible: boolean
  onClose: VoidFunction
}

export function ManageCollections({ isVisible, onClose }: ManageCollectionsProps) {
  const collectionData = nftStore.nftDetails.collectionData
  const collections = useMemo(() => {
    return collectionData?.collections ?? []
  }, [collectionData?.collections])

  const [searchedText, setSearchedText] = useState('')
  const disabledNFTsCollections = useDisabledNFTsCollections()
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
    const _enabledNftsCollections: string[] = []

    if (isEnabled) {
      _disabledNFTsCollections = disabledNFTsCollections.filter(
        (collection) => collection !== collectionAddress,
      )
    } else {
      if (!_disabledNFTsCollections.includes(collectionAddress)) {
        _disabledNFTsCollections = [...disabledNFTsCollections, collectionAddress]
      }
    }

    await setDisabledNFTsCollections(_disabledNFTsCollections)
  }

  return (
    <BottomModal
      className='!p-6 !pb-0 h-full'
      isOpen={isVisible}
      onClose={handleBottomSheetClose}
      title={'Manage Collections'}
    >
      <div className='flex flex-col h-full items-center w-full gap-y-7'>
        <div className='flex flex-col items-center w-full'>
          <SearchInput
            value={searchedText}
            onChange={(e) => setSearchedText(e.target.value)}
            placeholder='Search by collection or name'
            onClear={() => setSearchedText('')}
          />
        </div>

        {filteredCollections.length === 0 ? (
          <div className='h-[calc(100%-140px)] w-full flex-col flex  justify-center items-center gap-4'>
            <MagnifyingGlassMinus
              size={64}
              className='dark:text-gray-50 text-gray-900 p-5 rounded-full bg-secondary-200'
            />
            <div className='flex flex-col justify-start items-center w-full gap-3'>
              <div className='text-lg text-center font-bold !leading-[21.5px] text-monochrome'>
                {`No results for “${sliceSearchWord(searchedText)}”`}
              </div>
              <div className='text-sm font-normal !leading-[22.4px] text-secondary-800 text-center'>
                Please try again with something else
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              overflowY: 'scroll',
            }}
            className='w-full h-full'
          >
            {filteredCollections.map((filteredCollection, index, array) => {
              const isLast = index === array.length - 1
              const { name, address, image, chain } = filteredCollection

              return (
                <>
                  <div
                    key={`${address}-${index}`}
                    className='py-5 flex justify-between items-center'
                  >
                    <div className='flex items-center gap-3'>
                      <img
                        src={image ?? Images.Logos.GenericNFT}
                        className='w-10 h-10 rounded-lg'
                        onError={imgOnError(Images.Logos.GenericNFT)}
                      />
                      <Text size='md' className='font-bold' color='text-monochrome'>
                        {name ? sliceWord(name, 26, 0) : '-'}
                      </Text>
                    </div>

                    <input
                      type='checkbox'
                      id='toggle-switch4'
                      checked={!disabledNFTsCollections.includes(address)}
                      onChange={({ target }) => handleToggleClick(target.checked, address, chain)}
                      className='h-5 w-9 appearance-none rounded-full cursor-pointer bg-gray-600/30 transition duration-200 checked:bg-accent-green-200 relative'
                    />
                  </div>
                  {!isLast && (
                    <div className='border-b w-full border-gray-100 dark:border-gray-850' />
                  )}
                </>
              )
            })}
          </div>
        )}
      </div>
    </BottomModal>
  )
}
