import { sliceWord } from '@leapwallet/cosmos-wallet-hooks'
import Text from 'components/text'
import React, { useCallback } from 'react'
import { cn } from 'utils/cn'

export type CurrencyCardProps = {
  code: string
  name: string
  logo: string
  onClick: () => void
  isSelected: boolean
}

export default function CurrencyCard({ code, name, logo, onClick, isSelected }: CurrencyCardProps) {
  const handleCurrencySelect = useCallback(() => {
    if (isSelected) return
    onClick()
  }, [isSelected, onClick])

  return (
    <div
      className={cn(
        'flex gap-x-3 items-center px-4 py-3 rounded-xl mt-3 cursor-pointer border border-transparent',
        isSelected
          ? 'bg-secondary-200 hover:bg-secondary-200 cursor-not-allowed border-secondary-600'
          : 'cursor-pointer bg-secondary-100 hover:bg-secondary-200',
      )}
      onClick={handleCurrencySelect}
    >
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
