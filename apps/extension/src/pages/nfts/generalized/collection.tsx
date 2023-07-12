/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  capitalize,
  TokensListByCollection,
  useGetOwnedCollection,
} from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { Card } from '@leapwallet/leap-ui'
import { LoaderAnimation } from 'components/loader/Loader'
import NFTImageCard from 'components/nft-image-card'
import { NFTItemSkeleton } from 'components/Skeletons/NFTGallerySkeleton'
import { Images } from 'images'
import React, { useEffect, useState } from 'react'

import { NFTAvatar, NoNFTEmptyCard } from '../components'
import { NFTDetailedInformation } from './types'
import { normalizeImageSrc } from './util'

type NFTCollectionProps = {
  tokensListByCollection: TokensListByCollection
  setNFTDetailsProp: React.Dispatch<React.SetStateAction<NFTDetailedInformation | undefined>>
  forceChain?: SupportedChain
  setNFTsImage: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>
}

const NFTCollection: React.FC<NFTCollectionProps> = ({
  tokensListByCollection,
  setNFTDetailsProp,
  forceChain,
  setNFTsImage,
}) => {
  const [expandCollection, setExpandCollection] = useState(false)
  const [allData, setAllData] = useState<any>()

  const { data, status, fetchMore } = useGetOwnedCollection(tokensListByCollection, {
    forceChain,
    tokenUriModifier: normalizeImageSrc,
  })

  useEffect(() => {
    if (data) {
      setAllData((prev: any) => ({
        ...(prev ?? {}),
        ...data,
        tokens: [...((prev ?? {}).tokens ?? []), ...data.tokens],
      }))

      setNFTsImage((prevValue) => ({
        ...prevValue,
        [tokensListByCollection.collection.address]: data.collection.image,
      }))
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, tokensListByCollection.collection.address])

  useEffect(() => {
    const bottom = document.querySelector(`#${tokensListByCollection.collection.address}`)
    if (!bottom || status !== 'success') return

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting) {
        fetchMore()
      }
    }

    const observer = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin: '0px',
      threshold: 1.0,
    })
    observer.observe(bottom)

    return () => {
      observer.disconnect()
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, expandCollection])

  return (
    <div>
      <div>
        {status === 'loading' ? (
          <NFTItemSkeleton />
        ) : (
          allData && (
            <Card
              className='mb-3'
              iconSrc={expandCollection ? Images.Misc.DownArrow : Images.Misc.RightArrowCollapsed}
              avatar={<NFTAvatar image={allData.collection.image} />}
              isRounded
              size='sm'
              title={capitalize(tokensListByCollection.collection?.name ?? '')}
              onClick={() => setExpandCollection(!expandCollection)}
            />
          )
        )}

        {expandCollection &&
          allData &&
          (allData.tokens.length !== 0 ? (
            <>
              <div className='grid grid-cols-2 gap-4 mb-5 pt-2'>
                {allData.tokens.map((nft: any, index: number) => (
                  <div key={`${nft.tokenId}-${index}`} className='cursor-pointer'>
                    <NFTImageCard
                      imgSrc={normalizeImageSrc(nft.image)}
                      textNft={{
                        name: nft.domain,
                        description:
                          nft.extension?.description ??
                          `${nft.collection?.name ?? ''} - ${nft.name}`,
                      }}
                      onClick={() => {
                        setNFTDetailsProp({
                          imgSrc: nft.image,
                          name: nft.name,
                          collection: nft.collection?.name ?? '',
                          description:
                            nft.extension?.description ??
                            `${nft.collection?.name ?? ''} - ${nft.name}`,
                          tokenUri: nft.tokenUri,
                          collectionAddress: nft.collection?.contractAddress ?? '',
                          tokenId: nft.tokenId,
                        })
                      }}
                    />
                  </div>
                ))}

                <div className='col-span-2'>
                  <div id={tokensListByCollection.collection?.address ?? ''} className='my-1' />
                  {status === 'fetching-more' && (
                    <div className='flex items-center justify-center'>
                      <LoaderAnimation color='#29a874' />
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <NoNFTEmptyCard title='No NFTs' subTitle='Your nfts will appear here' />
          ))}
      </div>
    </div>
  )
}

export default NFTCollection
