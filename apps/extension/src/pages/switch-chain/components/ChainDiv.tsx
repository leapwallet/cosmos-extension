import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import React from 'react'
import { imgOnError } from 'utils/imgOnError'

export type ChainDivProps = {
  src: string
  bodyText: string
  alt?: string
  network?: 'mainnet' | 'testnet'
}

export function ChainDiv({ src, bodyText, alt = 'chain logo', network }: ChainDivProps) {
  const defaultTokenLogo = useDefaultTokenLogo()

  return (
    <div className='flex flex-col items-center justify-center gap-1 shrink-0 flex-1'>
      <img
        src={src}
        onError={imgOnError(defaultTokenLogo)}
        alt={alt}
        className='w-[36px] h-[36px] rounded-full'
      />
      <p className='dark:text-white-100 text-gray-900 text-center'>
        {bodyText}
        {bodyText === 'Movement' && network === 'testnet' ? ' Porto' : ''}
        {network === 'testnet' ? ' Testnet' : ''}
      </p>
    </div>
  )
}
