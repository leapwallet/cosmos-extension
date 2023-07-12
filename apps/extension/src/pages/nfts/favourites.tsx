import { Card } from '@leapwallet/leap-ui'
import classNames from 'classnames'
import NFTImageCard from 'components/nft-image-card'
import { Images } from 'images'
import React, { Dispatch, SetStateAction, useState } from 'react'

import { NFTObjectProps } from './index'

export default function FavouriteNFTs({
  favData,
  setNFTDetailsProp,
}: {
  favData: NFTObjectProps[]
  setNFTDetailsProp: Dispatch<SetStateAction<object | undefined>>
}) {
  const [expandCollection, setExpandCollection] = useState(false)
  return (
    <>
      <div>
        <Card
          className='mb-3'
          iconSrc={expandCollection ? Images.Misc.DownArrow : Images.Misc.RightArrowCollapsed}
          avatar={
            <div className='w-10 h-10 flex items-end p-[10px] bg-[#FF707E26] rounded-full'>
              <img src={Images.Misc.HeartIcon}></img>
            </div>
          }
          isRounded
          size='sm'
          title='Favourites'
          onClick={() => setExpandCollection(!expandCollection)}
        />
        {expandCollection && (
          <>
            {favData.length !== 0 ? (
              <div className='grid grid-cols-2 gap-4 mb-5 pt-2'>
                {favData.map((nft: NFTObjectProps, index: number) => (
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
            ) : (
              <div className='rounded-2xl bg-gray-900 p-8 flex flex-col items-center mb-3'>
                <div className='rounded-full bg-gray-800 p-[18px] w-fit flex'>
                  <div className={classNames('material-icons-round w-6 h-6 text-gray-200')}>
                    favorite
                  </div>
                </div>
                <div className='font-bold text-white-100 text-base mt-3'>No Favorites yet</div>
                <div className='text-gray-400 font-medium text-xs'>
                  You can mark assets as favorites
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}
