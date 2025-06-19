import { GenericCard } from '@leapwallet/leap-ui'
import React, { ReactNode } from 'react'
import Skeleton from 'react-loading-skeleton'

type TokenContractAddressProps = {
  address: string
  img?: ReactNode
}

export function TokenContractAddress({ address, img }: TokenContractAddressProps) {
  return !address ? (
    <div className='flex flex-col justify-end items-start w-full px-4 bg-white-100 dark:bg-gray-900 cursor-pointer min-w-[344px] h-[80px] rounded-[16px] pb-2 my-5'>
      <div className='text-[15px] font-bold text-black-100 dark:text-white-100 text-left max-w-[170px] text-ellipsis overflow-hidden'>
        Contract Address
      </div>
      <Skeleton
        height={14}
        className='w-full'
        containerClassName='w-full mt-[2px] block !leading-none'
      />
      <Skeleton height={14} width={90} containerClassName='block mt-[2px] !leading-none' />
    </div>
  ) : (
    <GenericCard
      title={<span className='text-[15px]'>Contract Address</span>}
      subtitle={<span className='break-all'>{address}</span>}
      className='h-[80px] py-8 my-5'
      img={img ?? null}
      size='sm'
      isRounded
    />
  )
}
