import { Skeleton } from 'components/ui/skeleton'
import React from 'react'

export function YouStakeSkeleton() {
  return (
    <div className='flex rounded-2xl bg-secondary gap-y-1.5 flex-col p-4 w-full'>
      <Skeleton className='w-24 h-5' />
      <Skeleton className='w-80 h-10' />
      <Skeleton className='w-24 h-6' />
    </div>
  )
}

export function ValidatorItemSkeleton(props: { count?: number }) {
  return (
    <div className='flex flex-col gap-4'>
      {Array.from({ length: props.count ?? 1 }).map((_, index) => (
        <div
          key={index}
          className='flex items-center px-5 py-4 bg-secondary-100 w-full rounded-xl gap-4'
        >
          <Skeleton className='size-9 rounded-full' />
          <Skeleton className='w-24 h-3' />

          <div className='flex flex-col gap-2 ml-auto items-end'>
            <Skeleton className='w-10 h-2' />
            <Skeleton className='w-12 h-1.5' />
          </div>
        </div>
      ))}
    </div>
  )
}
