import { sliceWord } from '@leapwallet/cosmos-wallet-hooks'
import { ThemeName, useTheme } from '@leapwallet/leap-ui'
import Text from 'components/text'
import { ImgNotAvailableDark, ImgNotAvailableLight } from 'images/logos'
import React from 'react'
import { imgOnError } from 'utils/imgOnError'

export type AssetCardProps = {
  id?: string
  symbol: string
  assetImg?: string
  onClick: () => void
}

export default function AssetCard({ symbol, assetImg, onClick }: AssetCardProps) {
  const { theme } = useTheme()
  return (
    <div className='flex gap-x-3 items-center py-5 cursor-pointer' onClick={onClick}>
      <img
        src={assetImg ?? (theme === ThemeName.DARK ? ImgNotAvailableDark : ImgNotAvailableLight)}
        onError={imgOnError(theme === ThemeName.DARK ? ImgNotAvailableDark : ImgNotAvailableLight)}
        className='rounded-full'
        width={36}
        height={36}
      />
      <Text size='md' color='text-monochrome' className='font-bold'>
        {sliceWord(symbol)}
      </Text>
    </div>
  )
}
