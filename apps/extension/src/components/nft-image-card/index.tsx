import { ChainInfos } from '@leapwallet/cosmos-wallet-sdk'
import Text from 'components/text'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { Images } from 'images'
import React, { useState } from 'react'
import { imgOnError } from 'utils/imgOnError'

export type NFTProps = {
  // eslint-disable-next-line no-unused-vars
  onClick?: (NFFTMetadata: object) => void
  imgSrc: string
  textNft?: {
    name: string
    description: string
  }
}

export default function NFTImageCard({ imgSrc, textNft, onClick }: NFTProps) {
  const [imageIsLoading, setImageIsLoading] = useState(imgSrc ? true : false)
  const [errorInLoadingMP4NFT, setErrorInLoadingMP4NFT] = useState(false)
  const activeChain = useActiveChain()

  return (
    <div className='rounded-2xl' onClick={onClick}>
      <div style={{ display: imageIsLoading ? 'block' : 'none' }}>
        <div className='rounded-2xl bg-gray-900 aspect-square flex items-center justify-center'>
          <img src={Images.Misc.NFTImageLoading} className='animate-spin'></img>
        </div>
      </div>
      <div style={{ display: imageIsLoading ? 'none' : 'block' }}>
        {imgSrc?.includes('mp4') && !errorInLoadingMP4NFT ? (
          <video
            autoPlay
            loop
            playsInline
            muted
            className='rounded-2xl'
            onLoadedData={() => setImageIsLoading(false)}
            onError={() => setErrorInLoadingMP4NFT(true)}
          >
            <source type='video/mp4' src={imgSrc} />
            Your browser does not support this video player.
          </video>
        ) : imgSrc ? (
          <img
            src={imgSrc ?? Images.Misc.NFTFallBackImage}
            className='rounded-2xl'
            onError={imgOnError(Images.Misc.NFTFallBackImage)}
            onLoad={() => setImageIsLoading(false)}
          />
        ) : (
          <div
            className='rounded-2xl p-4 flex-wrap  flex aspect-square  items-center bg-gray-400  justify-center'
            style={{ backgroundColor: ChainInfos[activeChain].theme.primaryColor }}
          >
            <Text
              size='md'
              className='font-bold overflow-x-auto'
              style={{ textOverflow: 'ellipsis' }}
            >
              {textNft?.name}
            </Text>
          </div>
        )}
      </div>
    </div>
  )
}
