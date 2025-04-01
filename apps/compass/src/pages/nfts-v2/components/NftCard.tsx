import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import classNames from 'classnames'
import Text from 'components/text'
import { useChainInfos } from 'hooks/useChainInfos'
import { Images } from 'images'
import React, { useState } from 'react'
import { Colors } from 'theme/colors'
import { getChainName } from 'utils/getChainName'
import { imgOnError } from 'utils/imgOnError'

import { Chip } from './index'

export type NftCardProps = {
  chain: SupportedChain
  imgSrc?: string
  textNft?: {
    name: string
    description: string
  }
  chainName?: string
  chainLogo?: string
  mediaType?: string
  imgClassName?: string
  handleExpandClick?: VoidFunction
  showExpand?: boolean
}

export function NftCard({
  chain,
  imgSrc,
  textNft,
  chainName,
  chainLogo,
  mediaType,
  imgClassName,
  handleExpandClick,
  showExpand,
}: NftCardProps) {
  const [imageIsLoading, setImageIsLoading] = useState(imgSrc ? true : false)
  const [errorInLoadingMP4NFT, setErrorInLoadingMP4NFT] = useState(false)
  const chainInfos = useChainInfos()

  return (
    <div className='rounded relative'>
      <div style={{ display: imageIsLoading ? 'block' : 'none' }}>
        <div
          className={classNames(
            'rounded bg-gray-200 dark:bg-gray-900 aspect-square flex items-center justify-center',
            imgClassName,
          )}
        >
          <img src={Images.Misc.NFTImageLoading} className='animate-spin'></img>
        </div>
      </div>
      <div style={{ display: imageIsLoading ? 'none' : 'block' }}>
        {(imgSrc?.includes('mp4') || ['video/mp4', 'image/gif'].includes(mediaType ?? '')) &&
        !errorInLoadingMP4NFT ? (
          <video
            autoPlay
            loop
            playsInline
            muted
            className={classNames('rounded', imgClassName)}
            onLoadedData={() => setImageIsLoading(false)}
            onError={() => setErrorInLoadingMP4NFT(true)}
            controls
          >
            <source type='video/mp4' src={imgSrc} />
            Your browser does not support this video player.
          </video>
        ) : imgSrc ? (
          <img
            src={imgSrc ?? Images.Misc.NFTFallBackImage}
            className={classNames('rounded', imgClassName)}
            onError={imgOnError(Images.Misc.NFTFallBackImage)}
            onLoad={() => setImageIsLoading(false)}
          />
        ) : (
          <div
            className={classNames(
              'rounded p-4 flex-wrap flex aspect-square items-center bg-gray-400 justify-center',
              imgClassName,
            )}
            style={{ backgroundColor: Colors.getChainColor(chain, chainInfos[chain]) }}
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

      {showExpand && (
        <button
          className='rounded-full w-[30px] h-[30px] absolute bg-gray-200 dark:bg-gray-900 bottom-2 right-2 flex items-center justify-center'
          onClick={handleExpandClick}
        >
          <img src={Images.Misc.ExpandContent} alt='cover image' className='invert dark:invert-0' />
        </button>
      )}

      {chainName && chainLogo && (
        <Chip className='bg-[#ffffff8c] dark:bg-[#00000096] py-[3px] px-[7px] absolute bottom-2 left-2 backdrop-blur-sm'>
          <Chip.Image
            className='w-[10px] h-[10px]'
            src={chainLogo}
            alt={`${chainName?.toLowerCase()} logo`}
          />
          <Chip.Text
            className='text-gray-800 dark:text-gray-100 text-[10px] max-w-[90px] truncate'
            title={getChainName(chainName)}
          >
            {getChainName(chainName)}
          </Chip.Text>
        </Chip>
      )}
    </div>
  )
}
