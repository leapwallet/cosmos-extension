import { Divider, Key } from 'components/dapp'
import React from 'react'
import Skeleton from 'react-loading-skeleton'

export function TokenContractInfoSkeleton() {
  return (
    <div className='flex flex-col gap-y-[10px] bg-white-100 dark:bg-gray-900 rounded-2xl p-4 w-full'>
      <div className='flex flex-col gap-[6px] w-full'>
        <Key>Coin Name</Key>
        <Skeleton className='' width={80} height={16} containerClassName='block !leading-none' />
      </div>
      {Divider}
      <div className='flex flex-col gap-[6px] w-full'>
        <Key>Coin Symbol</Key>
        <Skeleton className='' width={50} height={16} containerClassName='block !leading-none' />
      </div>
      {Divider}
      <div className='flex flex-col gap-[6px] w-full'>
        <Key>Coin Decimals</Key>
        <Skeleton className='' width={25} height={16} containerClassName='block !leading-none' />
      </div>
    </div>
  )
}
