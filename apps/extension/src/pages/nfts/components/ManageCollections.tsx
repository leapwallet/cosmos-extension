import {
  BETA_NFTS_COLLECTIONS,
  sliceSearchWord,
  TokensListByCollection,
  useActiveChain,
  useDisabledNFTsCollections,
  useSetDisabledNFTsInStorage,
} from '@leapwallet/cosmos-wallet-hooks'
import { CardDivider, HeaderActionType } from '@leapwallet/leap-ui'
import BottomSheet from 'components/bottom-sheet/BottomSheet'
import { EmptyCard } from 'components/empty-card'
import { LoaderAnimation } from 'components/loader/Loader'
import { useCosmWasmClient } from 'hooks/cosm-wasm/useCosmWasmClient'
import { Images } from 'images'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import Browser from 'webextension-polyfill'

import { NFTAvatar, NFTToggleCard, NoNFTEmptyCard } from './index'

type ManageCollectionsProps = {
  isVisible: boolean
  onClose: VoidFunction
  nfts: TokensListByCollection[]
  nftsImage: { [key: string]: string }
}

export function ManageCollections({
  isVisible,
  onClose,
  nfts: _nfts,
  nftsImage,
}: ManageCollectionsProps) {
  const [searchedText, setSearchedText] = useState('')
  const [fetchingCollectionInfo, setFetchingCollectionInfo] = useState(false)
  const timeoutIdRef = useRef<NodeJS.Timeout>()

  const [nfts, setNFTs] = useState(_nfts ?? [])
  const [fetchedNFTs, setFetchedNFTS] = useState<string[]>([])

  const activeChain = useActiveChain()
  const { client, status } = useCosmWasmClient(activeChain)
  const disabledNFTsCollections = useDisabledNFTsCollections()
  const setDisabledNFTsCollections = useSetDisabledNFTsInStorage()

  useEffect(() => {
    if (_nfts) {
      setNFTs(_nfts)
    }
  }, [_nfts])

  useEffect(() => {
    setFetchedNFTS((prevValue) => {
      return (prevValue ?? []).filter((collection) => !disabledNFTsCollections.includes(collection))
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabledNFTsCollections.length])

  const filteredCollections = useMemo(() => {
    return (
      nfts
        ?.filter((nft) => {
          const lowercasedSearchedText = searchedText.trim().toLowerCase()
          const { name, address } = nft.collection

          if (
            name.trim().toLowerCase().includes(lowercasedSearchedText) ||
            address.trim().toLowerCase().includes(lowercasedSearchedText)
          ) {
            return true
          }

          return false
        })
        ?.sort((nftA, nftB) => {
          const nameA = nftA.collection.name.toUpperCase()
          const nameB = nftB.collection.name.toUpperCase()

          if (nameA < nameB) return -1
          if (nameA < nameB) return 1
          return 0
        }) ?? []
    )
  }, [nfts, searchedText])

  useEffect(() => {
    if (
      activeChain !== 'stargaze' &&
      searchedText.length !== 0 &&
      filteredCollections.length === 0 &&
      status === 'success' &&
      client
    ) {
      clearTimeout(timeoutIdRef.current)

      timeoutIdRef.current = setTimeout(async () => {
        try {
          setFetchingCollectionInfo(true)
          const aboutContract = await client.queryContractSmart(searchedText, {
            contract_info: {},
          })

          setFetchedNFTS((prevValue) => [...prevValue, searchedText])
          setNFTs((prevValue) => [
            ...prevValue,
            { collection: { name: aboutContract.name, address: searchedText }, tokens: [] },
          ])
        } catch (_) {
          //
        } finally {
          setFetchingCollectionInfo(false)
        }
      }, 100)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredCollections.length, searchedText, status, activeChain])

  const handleBottomSheetClose = () => {
    onClose()
    setSearchedText('')
  }

  const handleToggleClick = async (isEnabled: boolean, collectionAddress: string) => {
    let _disabledNFTsCollections: string[] = []
    let hasToUpdateBetaNFTsCollections = false

    if (isEnabled) {
      _disabledNFTsCollections = disabledNFTsCollections.filter(
        (collection) => collection !== collectionAddress,
      )

      const nftInfo = nfts.find((nft) => nft.collection.address === collectionAddress)
      if (fetchedNFTs.includes(collectionAddress) && nftInfo) {
        hasToUpdateBetaNFTsCollections = true
      }
    } else {
      _disabledNFTsCollections = [...disabledNFTsCollections, collectionAddress]
    }

    await setDisabledNFTsCollections(_disabledNFTsCollections)
    if (hasToUpdateBetaNFTsCollections) {
      const _fetchedNFTs = fetchedNFTs.filter((collection) => collection !== collectionAddress)
      setFetchedNFTS(_fetchedNFTs)

      const storage = await Browser.storage.local.get([BETA_NFTS_COLLECTIONS])

      if (storage[BETA_NFTS_COLLECTIONS]) {
        await Browser.storage.local.set({
          [BETA_NFTS_COLLECTIONS]: {
            ...storage[BETA_NFTS_COLLECTIONS],
            [activeChain]: [
              ...(storage[BETA_NFTS_COLLECTIONS][activeChain] ?? []),
              collectionAddress,
            ],
          },
        })
      } else {
        await Browser.storage.local.set({
          [BETA_NFTS_COLLECTIONS]: {
            [activeChain]: [collectionAddress],
          },
        })
      }
    }
  }

  return (
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
        </div>

        <div className='overflow-y-auto pb-20'>
          {fetchingCollectionInfo === true && (
            <div className='flex items-center justify-center'>
              <LoaderAnimation color='#29a874' />
            </div>
          )}

          {fetchingCollectionInfo === false && filteredCollections.length === 0 ? (
            <>
              {searchedText ? (
                <EmptyCard
                  isRounded
                  subHeading='Please try again with something else'
                  heading={`No results for “${sliceSearchWord(searchedText)}”`}
                  src={Images.Misc.Explore}
                />
              ) : (
                <NoNFTEmptyCard title='You can search for any collection address' />
              )}
            </>
          ) : null}

          <div className='rounded-2xl flex flex-col items-center justify-center dark:bg-gray-900 bg-white-100 overflow-hidden'>
            {filteredCollections.map((filteredCollection, index, array) => {
              const isLast = index === array.length - 1
              const { name, address } = filteredCollection.collection
              const image = nftsImage[address]

              return (
                <React.Fragment key={`${address}-${index}`}>
                  <NFTToggleCard
                    title={name}
                    isRounded={isLast}
                    size='md'
                    avatar={<NFTAvatar image={image} />}
                    isEnabled={
                      !disabledNFTsCollections.includes(address) && !fetchedNFTs.includes(address)
                    }
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
  )
}
