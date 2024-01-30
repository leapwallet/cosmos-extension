import { OwnedCollectionTokenInfo, useActiveChain } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { LoaderAnimation } from 'components/loader/Loader'
import { useChainInfos } from 'hooks/useChainInfos'
import React from 'react'
import { Colors } from 'theme/colors'
import { getChainName } from 'utils/getChainName'
import { normalizeImageSrc } from 'utils/normalizeImageSrc'
import { sessionStoreItem } from 'utils/sessionStorage'

import { useNftContext } from '../context'
import { Chip, NftCard, Text, ViewAllButton } from './index'

type ChainHeaderCollectionCardProps = {
  chain: SupportedChain
  nfts: OwnedCollectionTokenInfo[]
  nftsCount: number
  haveToShowLoader?: boolean
  isFetchingMore?: boolean
}

export function ChainHeaderCollectionCard({
  chain,
  nfts,
  nftsCount,
  haveToShowLoader,
  isFetchingMore,
}: ChainHeaderCollectionCardProps) {
  const chainInfos = useChainInfos()
  const activeChain = useActiveChain()
  const { activePage, setActivePage, setNftDetails, activeTab, setShowChainNftsFor } =
    useNftContext()
  const chainInfo = chainInfos[chain]

  const handleViewOnClick = () => {
    setShowChainNftsFor(chain)
    setActivePage('ChainNftsDetails')
  }

  if (activePage !== 'CollectionDetails' && nfts.length === 0) {
    return <></>
  }

  return (
    <div className='rounded-2xl border dark:border-gray-900 mb-4'>
      <div className='flex items-center p-4 border-b dark:border-gray-900'>
        <Chip className='bg-gray-100 dark:bg-gray-900 py-[3px] px-[7px]'>
          <Chip.Image
            className='w-[16px] h-[16px] mr-2'
            src={chainInfo.chainSymbolImageUrl}
            alt={`${chainInfo.chainName.toLowerCase()} logo`}
          />
          <Chip.Text
            className='text-gray-800 dark:text-gray-200 text-sm font-bold'
            title={getChainName(chainInfo.chainName)}
          >
            {getChainName(chainInfo.chainName)}
          </Chip.Text>
        </Chip>

        <div className='ml-auto'>
          <div
            className='border dark:border-gray-900 rounded-md py-[3px] px-[6px] text-[14px] font-bold'
            style={{ color: chainInfos[activeChain].theme.primaryColor }}
          >
            {nftsCount} item{nftsCount > 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {activePage === 'CollectionDetails' && nfts.length === 0 ? (
        <div className='rounded-2xl bg-gray-900 p-8 flex flex-col items-center m-4 text-center'>
          <div className='rounded-full bg-gray-800 p-[18px] w-fit flex'>
            <div className='material-icons-round w-6 h-6 text-gray-200'>visibility_off</div>
          </div>
          <div className='font-bold text-white-100 text-base mt-3'>NFTs hidden</div>
          <div className='text-gray-400 font-medium text-xs'>
            All NFTs are hidden of this collection
          </div>
        </div>
      ) : (
        <div className='grid grid-cols-2 gap-4 p-4'>
          {nfts.map((nft, index) => {
            if (activeTab === 'All') {
              if (index == 6) {
                return <ViewAllButton key={`${nft.tokenId}-${index}`} onClick={handleViewOnClick} />
              }

              if (index > 6) return null
            }

            const nftName =
              activePage === 'CollectionDetails' ? nft.name : nft.collection?.name ?? nft.name
            const nftId = activePage === 'CollectionDetails' ? nft.tokenId : nft.tokenId ?? nft.name

            return (
              <div
                key={`${nft.tokenId}-${index}`}
                onClick={() => {
                  sessionStoreItem('nftLastActivePage', activePage)
                  setActivePage('NftDetails')
                  setNftDetails({ ...nft, chain: chain as SupportedChain })
                }}
                className='cursor-pointer'
              >
                <NftCard
                  mediaType={nft.media_type}
                  chain={chain as SupportedChain}
                  imgSrc={normalizeImageSrc(nft.image)}
                  textNft={{
                    name: nft?.domain ?? '',
                    description:
                      nft.extension?.description ?? `${nft.collection?.name ?? ''} - ${nft.name}`,
                  }}
                  imgClassName='h-[150px] w-[150px] object-contain'
                />

                <Text
                  className='text-gray-800 dark:text-white-100 mt-2 capitalize'
                  title={nftName ?? ''}
                >
                  {(nftName ?? '').toLowerCase()}
                </Text>

                {nftId && (
                  <Text className='text-gray-300 text-sm' title={nftId}>
                    #{nftId}
                  </Text>
                )}
              </div>
            )
          })}

          {haveToShowLoader && (
            <div className='col-span-2'>
              <div
                data-loader-id={
                  nfts[0].collection.address ?? nfts[0].collection.contractAddress ?? ''
                }
                className='mt-1'
              />
              {isFetchingMore && (
                <div className='flex items-center justify-center'>
                  <LoaderAnimation
                    color={Colors.getChainColor(activeChain, chainInfos[activeChain])}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
