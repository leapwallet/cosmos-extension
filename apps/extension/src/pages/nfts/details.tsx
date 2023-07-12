/* eslint-disable @typescript-eslint/no-explicit-any */
import { Buttons, CardDivider, Header, HeaderActionType, Label } from '@leapwallet/leap-ui'
import PopupLayout from 'components/layout/popup-layout'
import NFTImageCard from 'components/nft-image-card'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { useModifyFavNFTs } from 'hooks/settings/useFavouriteNFTs'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { Images } from 'images'
import { getChainImage } from 'images/logos'
import React, { Dispatch, SetStateAction, useRef, useState } from 'react'
import { Colors } from 'theme/colors'
import { imgOnError } from 'utils/imgOnError'

import { useGetCollectionFloorPrice, useGetNFTDetails } from './queries'
import useDraggableScroll from './useDraggableScroll'

export default function NFTDetails({
  NFTDetailsProp,
  setNFTDetailsProp,
}: {
  NFTDetailsProp: any
  setNFTDetailsProp: Dispatch<SetStateAction<object | undefined>>
}) {
  const [favPopup, setFavPopup] = useState(false)
  const [removeFavPopup, setRemoveFavPopup] = useState(false)

  const activeChain = useActiveChain()
  const metadataUri: string =
    'https://ipfs.stargaze.zone/ipfs/' + NFTDetailsProp.tokenUri.split('://')[1]
  const collectionAddr: string = NFTDetailsProp.collectionAddr

  const { data, status } = useGetNFTDetails({ metadataUri })
  const floorPriceRes = useGetCollectionFloorPrice({ collectionAddr })

  const modifyFav = useModifyFavNFTs()
  const defaultTokenLogo = useDefaultTokenLogo()
  const isFav = (modifyFav.favNFTs ?? []).indexOf(NFTDetailsProp.tokenUri) > -1

  const addNFTtoFav = (tokenUri: string) => {
    modifyFav.addFavNFT(tokenUri)
    setRemoveFavPopup(false)
    setFavPopup(true)
    setTimeout(() => setFavPopup(false), 1000)
  }

  const removeNFTfromFav = (tokenUri: string) => {
    modifyFav.removeFavNFT(tokenUri)
    setFavPopup(false)
    setRemoveFavPopup(true)
    setTimeout(() => setRemoveFavPopup(false), 1000)
  }

  type NFTAttributeType = {
    trait_type: string
    value: string | number | undefined
  }

  const ref = useRef(null)
  const { onMouseDown } = useDraggableScroll(ref, { direction: 'horizontal' })

  return (
    <>
      <PopupLayout
        header={
          <Header
            action={{
              onClick: function noRefCheck() {
                setNFTDetailsProp(undefined)
              },
              type: HeaderActionType.CANCEL,
            }}
            size='sm'
            title='NFT Details'
            topColor={Colors.getChainColor(activeChain)}
          />
        }
      >
        {favPopup && (
          <div className='absolute w-[inherit] flex justify-center'>
            <Label
              title='Added to favourites'
              imgSrc={Images.Misc.HeartIcon}
              isRounded={true}
              type='normal'
            />
          </div>
        )}
        {removeFavPopup && (
          <div className='absolute w-[inherit] flex justify-center'>
            <Label
              title='Removed from favourites'
              imgSrc={Images.Misc.NotAllowed}
              isRounded={true}
              type='normal'
            />
          </div>
        )}
        <div className='w-full flex flex-col p-[28px] mb-16'>
          <div className='rounded-2xl mb-7'>
            <NFTImageCard imgSrc={NFTDetailsProp.imgSrc} />
          </div>

          <div className='flex justify-center text-2xl font-black text-gray-900 dark:text-white-100'>
            {NFTDetailsProp.name}{' '}
            {isFav ? (
              // remove nft from favourites
              <img
                src={Images.Misc.HeartIcon}
                className='ml-2 cursor-pointer'
                onClick={() => {
                  removeNFTfromFav(NFTDetailsProp.tokenUri)
                }}
              ></img>
            ) : (
              // add nft to favourites
              <img
                src={Images.Misc.HeartOutlineIcon}
                className='ml-2 cursor-pointer'
                onClick={() => {
                  addNFTtoFav(NFTDetailsProp.tokenUri)
                }}
              ></img>
            )}
          </div>

          <div className='mb-6 flex justify-center text-[#E18881]'>
            {NFTDetailsProp.collection}{' '}
            <img className='ml-1' src={Images.Misc.NFTVerifiedCollection}></img>
          </div>

          <Buttons.Generic
            disabled={false}
            className='w-[344px] mb-3'
            color={Colors.getChainColor(activeChain)}
            onClick={() =>
              window.open(
                `https://www.stargaze.zone/marketplace/${NFTDetailsProp.collectionAddr}/${NFTDetailsProp.tokenId}`,
              )
            }
          >
            View on Marketplace
          </Buttons.Generic>

          {floorPriceRes.status === 'success' && (
            <div className='flex flex-col items-center mt-6 mb-6'>
              <div className='w-100 font-bold text-left text-gray-400 text-sm mb-1'>
                Floor Price
              </div>
              <div className='flex items-center'>
                <img
                  src={getChainImage(activeChain) ?? defaultTokenLogo}
                  onError={imgOnError(defaultTokenLogo)}
                  className='w-4 aspect-square mr-1'
                ></img>
                <span className='font-black text-xl text-gray-900	dark:text-white-100'>
                  {floorPriceRes.data}
                </span>
              </div>
            </div>
          )}

          <CardDivider />

          <div className='w-100 font-bold text-left text-gray-400 text-sm mb-1 mt-6'>
            Description
          </div>
          <div className=' font-medium text-left text-base text-gray-900 dark:text-white-100 mb-6'>
            {NFTDetailsProp.description}
          </div>
          {status === 'success' && data.attributes && (
            <>
              <CardDivider />
              <div className='w-100 font-bold text-left text-gray-400 text-sm mt-6 mb-2'>
                Features
              </div>
              <div className='flex font-bold overflow-auto' ref={ref} onMouseDown={onMouseDown}>
                {data.attributes.map((m: NFTAttributeType, index: number) => (
                  <div
                    key={index}
                    className='rounded-xl px-3 py-2 dark:bg-gray-900 bg-white-100 mr-2'
                  >
                    <div className=' text-gray-400 text-sm'>{m.trait_type}</div>
                    <div className=' text-gray-900 dark:text-white-100'>{m.value}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </PopupLayout>
    </>
  )
}
