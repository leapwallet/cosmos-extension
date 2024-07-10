import { sliceWord } from '@leapwallet/cosmos-wallet-hooks'
import { GenericCard } from '@leapwallet/leap-ui'
import React from 'react'

export type CurrencyCardProps = {
  code: string
  name: string
  logo: string
  onClick: () => void
}

export default function CurrencyCard({ code, name, logo, onClick }: CurrencyCardProps) {
  return (
    <GenericCard
      title={
        <div className='flex items-center'>
          <h3 className='text-md mr-1 text-ellipsis overflow-hidden whitespace-nowrap' title={code}>
            {sliceWord(code)}
          </h3>
        </div>
      }
      subtitle={name}
      img={
        <img
          src={logo}
          className='w-[28px] h-[28px] mr-2 border rounded-full dark:border-[#333333] border-[#cccccc]'
        />
      }
      isRounded={true}
      className={'my-2'}
      onClick={onClick}
      size={'md'}
    />
  )
}
