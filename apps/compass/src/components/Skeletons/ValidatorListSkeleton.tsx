import { Skeleton } from 'components/ui/skeleton'
import React from 'react'

export function ValidatorListItemSkeleton() {
  return (
    <div className='relative flex items-center flex-grow gap-4 px-5 py-4 cursor-pointer rounded-xl w-full bg-secondary hover:bg-secondary-200 transition-colors'>
      <Skeleton className='size-9 rounded-full' />
      <Skeleton className='h-3 w-16' />

      <div className='flex flex-col gap-2 items-end ml-auto'>
        <Skeleton className='h-2 w-16' />
        <Skeleton className='h-1.5 w-8' />
      </div>
    </div>
  )
}

export default function ValidatorListSkeleton() {
  return (
    <div className='flex flex-col gap-6'>
      <ValidatorListItemSkeleton />
      <ValidatorListItemSkeleton />
      <ValidatorListItemSkeleton />
      <ValidatorListItemSkeleton />
      <ValidatorListItemSkeleton />
    </div>
  )
}
