import React from 'react'
import Skeleton from 'react-loading-skeleton'

export function ValidatorListItemSkeleton() {
  return (
    <div className='flex items-center px-4 py-3 bg-white-100 dark:bg-gray-900 w-full rounded-2xl my-2'>
      <Skeleton circle={true} width={28} height={28} className='z-0' />
      <div className='w-[120px] ml-2'>
        <Skeleton count={1} className='z-0' />
        <Skeleton count={1} className='z-0' />
      </div>
    </div>
  )
}

export default function ValidatorListSkeleton() {
  return (
    <>
      <ValidatorListItemSkeleton />
      <ValidatorListItemSkeleton />
      <ValidatorListItemSkeleton />
      <ValidatorListItemSkeleton />
      <ValidatorListItemSkeleton />
    </>
  )
}
