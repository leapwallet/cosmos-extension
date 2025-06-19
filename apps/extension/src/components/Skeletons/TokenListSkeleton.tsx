import React from 'react'
import Skeleton from 'react-loading-skeleton'

export function TokenItemSkeleton() {
  return (
    <div className='flex items-center py-3 px-4 bg-secondary-100 w-full mt-4 rounded-xl'>
      <Skeleton circle={true} width={36} height={36} containerClassName='!leading-none block' />
      <div className='ml-2 h-10 justify-between flex flex-col'>
        <Skeleton count={1} height={18} width={56} containerClassName='block !leading-none' />
        <Skeleton count={1} height={14} width={77} containerClassName='block !leading-none' />
      </div>
    </div>
  )
}

export default function TokenListSkeleton() {
  return (
    <>
      <TokenItemSkeleton />
      <TokenItemSkeleton />
      <TokenItemSkeleton />
      <TokenItemSkeleton />
      <TokenItemSkeleton />
    </>
  )
}
