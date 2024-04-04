import { OwnedCollectionTokenInfo, useActiveChain } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import classNames from 'classnames'
import { useChainInfos } from 'hooks/useChainInfos'
import React from 'react'
import { normalizeImageSrc } from 'utils/normalizeImageSrc'
import { sessionStoreItem } from 'utils/sessionStorage'

import { useNftContext } from '../context'
import { NftCard, Text, ViewAllButton } from './index'

type TextHeaderCollectionCardProps = {
  nfts: (OwnedCollectionTokenInfo & { chain: SupportedChain })[]
  headerTitle: string
  noChip?: boolean
}

export function TextHeaderCollectionCard({
  nfts,
  headerTitle,
  noChip,
}: TextHeaderCollectionCardProps) {
  const chainInfos = useChainInfos()
  const activeChain = useActiveChain()
  const { activePage, setActivePage, setNftDetails, setActiveTab } = useNftContext()
  const isFavoriteHeaderTitle = headerTitle === 'Favorites'

  const handleOnClick = () => {
    if (isFavoriteHeaderTitle) {
      setActiveTab('Favorites')
    }
  }

  return (
    <div className='rounded-2xl border dark:border-gray-900 mb-4'>
      <div className='flex items-center p-4 border-b dark:border-gray-900'>
        <h2
          className={classNames(
            'text-gray-800 dark:text-white-100 max-w-[160px] truncate font-bold',
            {
              'border dark:border-gray-900 rounded-md py-[3px] px-[6px] text-[14px]':
                !isFavoriteHeaderTitle,
            },
          )}
          style={
            isFavoriteHeaderTitle
              ? {}
              : {
                  color: chainInfos[activeChain].theme.primaryColor,
                }
          }
        >
          {headerTitle}
        </h2>

        {isFavoriteHeaderTitle && (
          <div className='ml-auto'>
            <div
              className='border dark:border-gray-900 rounded-md py-[3px] px-[6px] text-[14px] font-bold'
              style={{ color: chainInfos[activeChain].theme.primaryColor }}
            >
              {nfts.length} item{nfts.length > 1 ? 's' : ''}
            </div>
          </div>
        )}
      </div>

      <div className='grid grid-cols-2 gap-4 p-4'>
        {nfts.map((nft, index) => {
          if (isFavoriteHeaderTitle) {
            if (index === 6) {
              return <ViewAllButton key={`${nft.tokenId}-${index}`} onClick={handleOnClick} />
            }

            if (index > 6) return null
          }

          return (
            <div
              key={`${nft.tokenId}-${index}`}
              onClick={() => {
                sessionStoreItem('nftLastActivePage', activePage)
                setActivePage('NftDetails')
                setNftDetails({ ...nft, chain: nft?.chain ?? '' })
              }}
              className='cursor-pointer'
            >
              <NftCard
                mediaType={nft.media_type}
                chain={nft.chain}
                imgSrc={normalizeImageSrc(nft.image ?? '')}
                textNft={{
                  name: nft?.domain ?? '',
                  description:
                    nft.extension?.description ?? `${nft.collection?.name ?? ''} - ${nft.name}`,
                }}
                chainName={noChip ? undefined : chainInfos[nft.chain].chainName}
                chainLogo={noChip ? undefined : chainInfos[nft.chain].chainSymbolImageUrl}
                imgClassName='h-[150px] w-[150px] object-contain'
              />

              <Text
                className='text-gray-800 dark:text-white-100 mt-2 capitalize'
                title={nft.collection?.name ?? nft.name ?? ''}
              >
                {(nft.collection?.name ?? nft.name ?? '').toLowerCase()}
              </Text>

              {(nft.tokenId ?? nft.name) && (
                <Text className='text-gray-300 text-sm' title={nft.tokenId ?? nft.name}>
                  #{nft.tokenId ?? nft.name}
                </Text>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
