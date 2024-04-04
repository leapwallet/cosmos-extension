import {
  useDisabledNFTsCollections,
  useFractionalizedNftContracts,
} from '@leapwallet/cosmos-wallet-hooks'
import classNames from 'classnames'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { useChainInfos } from 'hooks/useChainInfos'
import { RightArrow } from 'images/misc'
import React, { useMemo } from 'react'
import { Colors } from 'theme/colors'
import { getChainName } from 'utils/getChainName'

import { useNftContext } from '../context'
import { Chip, CollectionAvatar, Text } from './index'

type CollectionsProps = {
  setShowManageCollections: React.Dispatch<React.SetStateAction<boolean>>
}

export function Collections({ setShowManageCollections }: CollectionsProps) {
  const activeChain = useActiveChain()
  const chainInfos = useChainInfos()

  const fractionalizedNftContracts = useFractionalizedNftContracts()
  const { collectionData, setActivePage, setShowCollectionDetailsFor } = useNftContext()
  const disabledNftsCollections = useDisabledNFTsCollections()

  const sortedCollections = useMemo(() => {
    return collectionData?.collections.sort((collectionA, collectionB) => {
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
        <h2 className='text-gray-800 dark:text-white-100'>Your collections</h2>
        <button
          style={{ color: Colors.getChainColor(activeChain) }}
          className='font-semibold'
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
              (nft) => nft.collection.contractAddress === address,
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
                className='h-[30px] w-[30px]'
              />

              <div className='flex flex-col items-start'>
                <Text className='text-gray-800 dark:text-white-100 mt-2 capitalize'>
                  {(name ?? '').toLowerCase()}
                </Text>

                <div
                  className='border dark:border-gray-900 rounded-2xl py-[2px] px-[12px] text-[12px] mt-[1px]'
                  style={{ color: chainInfos[activeChain].theme.primaryColor }}
                >
                  {nftCount} item{(nftCount ?? 1) > 1 ? 's' : ''}
                </div>
              </div>

              <div className='ml-auto flex'>
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
}
