import {
  useDisabledNFTsCollections,
  useFractionalizedNftContracts,
} from '@leapwallet/cosmos-wallet-hooks'
import { NftStore } from '@leapwallet/cosmos-wallet-store'
import classNames from 'classnames'
import { useChainPageInfo } from 'hooks'
import { useChainInfos } from 'hooks/useChainInfos'
import { RightArrow } from 'images/misc'
import { observer } from 'mobx-react-lite'
import React, { useMemo } from 'react'
import { getChainName } from 'utils/getChainName'
import { isSidePanel } from 'utils/isSidePanel'

import { useNftContext } from '../context'
import { Chip, CollectionAvatar, Text } from './index'

type CollectionsProps = {
  setShowManageCollections: React.Dispatch<React.SetStateAction<boolean>>
  nftStore: NftStore
}

export const Collections = observer(({ setShowManageCollections, nftStore }: CollectionsProps) => {
  const { topChainColor } = useChainPageInfo()
  const chainInfos = useChainInfos()

  const fractionalizedNftContracts = useFractionalizedNftContracts()
  const { setActivePage, setShowCollectionDetailsFor } = useNftContext()
  const collectionData = nftStore.nftDetails.collectionData
  const disabledNftsCollections = useDisabledNFTsCollections()

  const sortedCollections = useMemo(() => {
    return collectionData?.collections.slice().sort((collectionA, collectionB) => {
      const nameA = collectionA.name.toLowerCase().trim()
      const nameB = collectionB.name.toLowerCase().trim()

      if (nameA > nameB) return 1
      if (nameA < nameB) return -1
      return 0
    })
  }, [collectionData?.collections])

  return (
    <div className='rounded-2xl border dark:border-gray-900 mb-4'>
      <div className='flex items-center justify-between p-4 border-b dark:border-gray-900'>
        <h2 className='text-gray-800 dark:text-white-100 text-left'>Your collections</h2>
        <button
          style={{ color: topChainColor }}
          className='font-semibold text-right'
          onClick={() => setShowManageCollections(true)}
        >
          Manage collections
        </button>
      </div>
      <div>
        {sortedCollections?.map((collection, index, array) => {
          const { chain, name, image, totalNfts, address } = collection
          let nftCount = totalNfts

          if (fractionalizedNftContracts.includes(address)) {
            const fractionalizedNft = collectionData?.nfts?.[chain].filter(
              (nft) => nft.collection.address === address,
            )

            nftCount = fractionalizedNft?.length ?? nftCount
          }

          if (disabledNftsCollections.includes(address)) return null
          const chainInfo = chainInfos[chain]

          return (
            <div
              key={address}
              className={classNames('py-3 px-4 flex items-center cursor-pointer', {
                'border-b dark:border-gray-900': index + 1 !== array.length,
              })}
              onClick={() => {
                setActivePage('CollectionDetails')
                setShowCollectionDetailsFor(address)
              }}
            >
              <CollectionAvatar
                image={image}
                bgColor={chainInfo.theme.primaryColor}
                className='h-[30px] w-[30px] shrink-0'
              />

              <div className='flex flex-col items-start flex-1'>
                <Text
                  className={classNames('text-gray-800 dark:text-white-100 mt-2 capitalize', {
                    '!max-w-[95px]': isSidePanel(),
                  })}
                >
                  {(name ?? '').toLowerCase()}
                </Text>

                <div
                  className='border dark:border-gray-900 rounded-2xl py-[2px] px-[12px] text-[12px] mt-[1px]'
                  style={{ color: topChainColor }}
                >
                  {nftCount} item{(nftCount ?? 1) > 1 ? 's' : ''}
                </div>
              </div>

              <div className='ml-auto flex shrink-0'>
                <Chip className='bg-gray-100 dark:bg-gray-900 py-[3px] px-[7px]'>
                  <Chip.Image
                    className='w-[12px] h-[12px]'
                    src={chainInfo.chainSymbolImageUrl}
                    alt={`${chainInfo.chainName.toLowerCase()} logo`}
                  />
                  <Chip.Text
                    className='text-gray-800 dark:text-gray-300 text-xs max-w-[90px] truncate'
                    title={getChainName(chainInfo.chainName)}
                  >
                    {getChainName(chainInfo.chainName)}
                  </Chip.Text>
                </Chip>

                <img src={RightArrow} alt='right arrow' className='ml-2' />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
})
