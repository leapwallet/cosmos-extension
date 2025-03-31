import React from 'react'
import Skeleton from 'react-loading-skeleton'

export function TokenItemSkeleton() {
  return (
    <div className='flex items-center px-4 bg-secondary w-full h-[80px] rounded-[16px] my-2'>
      <Skeleton circle={true} width={28} height={28} />
      <div className='w-[120px] ml-2'>
        <Skeleton count={1} />
        <Skeleton count={1} />
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
