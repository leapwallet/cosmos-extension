import { sliceWord } from '@leapwallet/cosmos-wallet-hooks'
import { ThemeName, useTheme } from '@leapwallet/leap-ui'
import Text from 'components/text'
import { ImgNotAvailableDark, ImgNotAvailableLight } from 'images/logos'
import React, { useCallback } from 'react'
import { cn } from 'utils/cn'
import { imgOnError } from 'utils/imgOnError'

export type AssetCardProps = {
  id?: string
  symbol: string
  chainName: string
  assetImg?: string
  chainSymbolImageUrl?: string
  onClick: () => void
  isSelected: boolean
}

export default function AssetCard({
  symbol,
  assetImg,
  onClick,
  chainSymbolImageUrl,
  chainName,
  isSelected,
}: AssetCardProps) {
  const { theme } = useTheme()

  const handleAssetSelect = useCallback(() => {
    if (isSelected) return
    onClick()
  }, [isSelected, onClick])
  return (
    <div
      className={cn(
        'flex gap-x-3 items-center px-4 py-3 mt-3 rounded-xl cursor-pointer border border-transparent',
        isSelected
          ? 'bg-secondary-200 hover:bg-secondary-200 cursor-not-allowed border-secondary-600'
          : 'cursor-pointer bg-secondary-100 hover:bg-secondary-200',
      )}
      onClick={handleAssetSelect}
    >
      <div className='relative'>
        <img
          src={assetImg ?? (theme === ThemeName.DARK ? ImgNotAvailableDark : ImgNotAvailableLight)}
          onError={imgOnError(
            theme === ThemeName.DARK ? ImgNotAvailableDark : ImgNotAvailableLight,
          )}
          className='rounded-full'
          width={36}
          height={36}
        />
        <img
          src={chainSymbolImageUrl}
          className='w-[15px] h-[15px] absolute -bottom-0.5 -right-0.5 rounded-full bg-background'
        />
      </div>
      <div className='flex flex-col'>
        <Text size='md' color='text-monochrome' className='font-bold'>
          {sliceWord(symbol)}
        </Text>
        <Text size='xs' color='text-secondary-800'>
          {sliceWord(chainName)}
        </Text>
      </div>
    </div>
  )
}
