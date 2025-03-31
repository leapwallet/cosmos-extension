import { sliceWord } from '@leapwallet/cosmos-wallet-hooks'
import { TokenImageWithFallback } from 'components/token-image-with-fallback'
import { Images } from 'images'
import { GenericLight } from 'images/logos'
import React from 'react'
import { imgOnError } from 'utils/imgOnError'

type SelectButtonProps = {
  title: string
  subtitle?: string
  chainImg?: string
  logo?: string
  onClick: () => void
}

export function SelectCurrencyButton({ onClick, logo, title }: SelectButtonProps) {
  return (
    <button className='flex items-center cursor-pointer' onClick={onClick}>
      <img src={logo} onError={imgOnError(GenericLight)} className='h-6 w-6 mr-1 rounded-full' />
      <div className='flex flex-col items-start p-1 pr-2'>
        <div className='text-black-100 dark:text-white-100 font-bold text-xs'>
          {sliceWord(title)}
        </div>
      </div>
      <img src={Images.Misc.ArrowDown} className='ml-2' />
    </button>
  )
}

export function SelectAssetButton({ onClick, logo, title, subtitle, chainImg }: SelectButtonProps) {
  return (
    <button className='flex items-center cursor-pointer' onClick={onClick}>
      <div className='relative'>
        <TokenImageWithFallback
          assetImg={logo}
          text={title}
          altText={title}
          imageClassName='w-[24px] h-[24px] mr-1 rounded-full bg-black-100 dark:bg-gray-850'
          containerClassName='w-[24px] h-[24px] mr-1 rounded-full !bg-black-200 dark:!bg-gray-800'
          textClassName='text-[7px] !leading-[10px]'
        />
        <img
          src={chainImg}
          className='w-[12px] h-[12px] absolute -bottom-0.5 right-1 rounded-full bg-black-100 dark:bg-black-100'
        />
      </div>
      <div className='flex flex-col items-start p-1 pr-2'>
        <div className='text-black-100 dark:text-white-100 font-bold text-xs'>
          {sliceWord(title)}
        </div>
        <div style={{ fontSize: '10px' }} className='text-gray-600 dark:text-gray-400'>
          {sliceWord(subtitle)}
        </div>
      </div>
      <div className='w-px h-6 bg-gray-200 dark:bg-gray-800' />
      <img src={Images.Misc.ArrowDown} className='ml-3' />
    </button>
  )
}
