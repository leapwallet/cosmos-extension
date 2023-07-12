import { Card } from '@leapwallet/leap-ui'
import NFTImageCard from 'components/nft-image-card'
import { Images } from 'images'
import React, { Dispatch, SetStateAction, useState } from 'react'

import { NFTAvatar } from './components'
import { CollectionObjectProps, NFTObjectProps } from './index'

export default function NFTCollection({
  collectionData,
  setNFTDetailsProp,
}: {
  collectionData: CollectionObjectProps
  setNFTDetailsProp: Dispatch<SetStateAction<object | undefined>>
}) {
  const [expandCollection, setExpandCollection] = useState(false)

  return (
    <>
      <div>
        <Card
          className='mb-3'
          iconSrc={expandCollection ? Images.Misc.DownArrow : Images.Misc.RightArrowCollapsed}
          avatar={<NFTAvatar image={collectionData ? collectionData.items[0].image : undefined} />}
          isRounded
          size='sm'
          title={collectionData.name}
          onClick={() => setExpandCollection(!expandCollection)}
        />
        {expandCollection && (
          <div className='grid grid-cols-2 gap-4 mb-5 pt-2'>
            {collectionData.items &&
              collectionData.items.map((nft: NFTObjectProps, index: number) => (
                <div key={index} className='cursor-pointer'>
                  <NFTImageCard
                    imgSrc={nft.image}
                    onClick={() => {
                      const temp = {
                        imgSrc: nft.image,
                        name: nft.name,
                        collection: nft.collection.name,
                        description: nft.description,
                        tokenUri: nft.tokenUri,
                        collectionAddr: nft.collection.contractAddress,
                        tokenId: nft.tokenId,
                      }
                      setNFTDetailsProp(temp)
                    }}
                  />
                </div>
              ))}
          </div>
        )}
      </div>
    </>
  )
}
