import { sliceWord } from '@leapwallet/cosmos-wallet-hooks'
import { Collection } from '@leapwallet/cosmos-wallet-store'
import { Heart } from '@phosphor-icons/react'
import BottomModal from 'components/new-bottom-modal'
import Text from 'components/text'
import { Images } from 'images'
import { observer } from 'mobx-react-lite'
import React, { useMemo } from 'react'
import { favNftStore, hiddenNftStore } from 'stores/manage-nft-store'
import { nftStore } from 'stores/nft-store'
import { imgOnError } from 'utils/imgOnError'

import { useNftContext } from './context'

const CollectionDetails = observer(() => {
  const { showCollectionDetailsFor, setShowCollectionDetailsFor, setNftDetails } = useNftContext()
  const collectionData = nftStore.nftDetails.collectionData

  const { collection, nfts } = useMemo(() => {
    const collection =
      collectionData?.collections.find(
        (collection) => collection.address === showCollectionDetailsFor,
      ) ?? ({} as Collection)

    const collectionNfts = collection
      ? collectionData?.nfts[collection?.chain]?.filter((nft) =>
          [nft.collection?.address ?? ''].includes(collection.address),
        ) ?? []
      : []

    return { collection, nfts: collectionNfts }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    collectionData?.collections,
    collectionData?.nfts,
    hiddenNftStore.hiddenNfts,
    showCollectionDetailsFor,
  ])

  if (!nfts?.length) return null

  if (nfts.length === 1) {
    setNftDetails({ ...nfts[0], chain: collection.chain })
    setShowCollectionDetailsFor('')
  }

  return (
    <BottomModal
      onClose={() => setShowCollectionDetailsFor('')}
      isOpen={!!showCollectionDetailsFor}
      className='!p-6'
      title={sliceWord(collection.name, 20, 0)}
    >
      <div className='grid grid-cols-2 gap-5'>
        {nfts.map((nft) => {
          const nftIndex = `${nft?.collection.address ?? ''}-:-${nft?.tokenId ?? nft?.domain ?? ''}`
          const isInFavNfts = favNftStore.favNfts.includes(nftIndex)

          return (
            <div
              key={nft.name}
              className='flex flex-col gap-y-4 cursor-pointer'
              onClick={() => {
                setNftDetails({ ...nft, chain: collection.chain })
                setShowCollectionDetailsFor('')
              }}
            >
              <div className='relative rounded-xl w-[166px] h-[166px] overflow-hidden'>
                <img
                  src={nft.image ?? Images.Logos.GenericNFT}
                  onError={imgOnError(Images.Logos.GenericNFT)}
                  width={166}
                  height={166}
                  className='hover:scale-110 duration-300 ease-out object-fill w-[166px] h-[166px]'
                />
                {isInFavNfts && (
                  <div>
                    <Heart size={26} className='absolute top-[9px] right-[9px]' />
                    <Heart
                      size={24}
                      weight='fill'
                      color='#D0414F'
                      className='absolute top-2.5 right-2.5'
                    />
                  </div>
                )}
              </div>
              <div className='flex flex-col gap-y-0.5'>
                <Text
                  size='md'
                  color='text-monochrome'
                  className='font-bold !leading-[21.6px] break-all'
                >
                  {sliceWord(nft.name, 12, 0)}
                </Text>
                <Text size='sm' color='text-muted-foreground' className='!leading-[18.9px]'>
                  #{sliceWord(nft.tokenId, 12, 3)}
                </Text>
              </div>
            </div>
          )
        })}
      </div>
    </BottomModal>
  )
})

export default CollectionDetails
