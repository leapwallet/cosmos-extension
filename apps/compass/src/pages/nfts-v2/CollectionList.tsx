import { sliceWord } from '@leapwallet/cosmos-wallet-hooks'
import { Collection } from '@leapwallet/cosmos-wallet-store'
import { Heart } from '@phosphor-icons/react'
import Text from 'components/text'
import { Images } from 'images'
import React from 'react'
import { favNftStore } from 'stores/manage-nft-store'
import { imgOnError } from 'utils/imgOnError'

import { useNftContext } from './index'

const CollectionList = ({ collections }: { collections: Collection[] }) => {
  const { setShowCollectionDetailsFor } = useNftContext()
  return (
    <div className='grid grid-cols-2 gap-5'>
      {collections.map((c) => {
        const isCollectionFav = favNftStore.favNfts.some((item) => item.includes(c.address))
        return (
          <div
            key={c.name}
            className='relative cursor-pointer rounded-xl w-[166px] h-[166px] overflow-hidden bg-secondary-100 hover:bg-secondary-200 transition-colors'
            onClick={() => setShowCollectionDetailsFor(c.address)}
          >
            <img
              src={c.image ?? Images.Logos.GenericNFT}
              width={166}
              height={166}
              className='hover:scale-110 duration-300 ease-out'
              onError={imgOnError(Images.Logos.GenericNFT)}
            />
            {isCollectionFav && (
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
            <div className='absolute bottom-3 left-3 inline-flex gap-x-0.5 rounded-lg px-2 py-1.5 bg-monochrome-foreground'>
              <Text size='xs' className='font-bold' color='text-monochrome'>
                {sliceWord(c.name, 12, 0)}
              </Text>
              <Text size='xs' className='font-bold' color='text-muted-foreground'>
                ({c.totalNfts})
              </Text>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default CollectionList
