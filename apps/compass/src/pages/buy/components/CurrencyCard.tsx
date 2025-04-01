import { sliceWord } from '@leapwallet/cosmos-wallet-hooks'
import Text from 'components/text'
import React from 'react'

export type CurrencyCardProps = {
  code: string
  name: string
  logo: string
  onClick: () => void
}

export default function CurrencyCard({ code, name, logo, onClick }: CurrencyCardProps) {
  return (
    <div className='flex gap-x-3 items-center py-5 cursor-pointer' onClick={onClick}>
      <img src={logo} className='rounded-full w-9 h-9' />
      <div className='flex flex-col'>
        <Text size='md' color='text-monochrome' className='font-bold'>
          {sliceWord(code)}
        </Text>
        <Text size='sm' color='text-muted-foreground'>
          {name}
        </Text>
      </div>
    </div>
  )
}
