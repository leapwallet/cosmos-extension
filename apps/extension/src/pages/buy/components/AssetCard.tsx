import { sliceWord } from '@leapwallet/cosmos-wallet-hooks'
import { GenericCard, ThemeName, useTheme } from '@leapwallet/leap-ui'
import { ImgNotAvailableDark, ImgNotAvailableLight } from 'images/logos'
import React from 'react'
import { imgOnError } from 'utils/imgOnError'

export type AssetCardProps = {
  id?: string
  symbol: string
  chainName: string
  assetImg?: string
  chainSymbolImageUrl?: string
  onClick: () => void
}

export default function AssetCard({
  symbol,
  chainName,
  assetImg,
  onClick,
  chainSymbolImageUrl,
}: AssetCardProps) {
  const { theme } = useTheme()
  return (
    <GenericCard
      title={
        <div className='flex items-center'>
          <h3
            className='text-md mr-1 text-ellipsis overflow-hidden whitespace-nowrap'
            title={symbol}
          >
            {sliceWord(symbol)}
          </h3>
        </div>
      }
      subtitle={chainName}
      img={
        <div className='relative'>
          <img
            src={
              assetImg ?? (theme === ThemeName.DARK ? ImgNotAvailableDark : ImgNotAvailableLight)
            }
            onError={imgOnError(
              theme === ThemeName.DARK ? ImgNotAvailableDark : ImgNotAvailableLight,
            )}
            className='w-[28px] h-[28px] mr-2 rounded-full bg-black-100 dark:bg-black-100'
          />
          <img
            src={chainSymbolImageUrl}
            className='w-[12px] h-[12px] absolute -bottom-0.5 right-1 rounded-full bg-black-100 dark:bg-black-100'
          />
        </div>
      }
      isRounded={true}
      className={'my-2 bg-white-100 dark:bg-gray-950'}
      onClick={onClick}
      size={'md'}
    />
  )
}
