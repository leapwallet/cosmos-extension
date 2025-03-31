import { Skeleton } from 'components/ui/skeleton'
import React from 'react'
import { cn } from 'utils/cn'

type AggregatedLoadingProps = {
  className?: string
}

export const AggregatedLoadingCard = ({ className }: AggregatedLoadingProps) => {
  return (
    <div
      className={cn('py-3 px-4 bg-secondary-100 rounded-2xl flex items-center gap-3', className)}
    >
      <Skeleton className='size-10 rounded-full bg-secondary-300' />

      <div className='flex flex-col'>
        <Skeleton className='h-3 my-1.5 w-[109px] rounded-full bg-secondary-300' />
        <Skeleton className='h-2 my-1 w-[87px] rounded-full bg-secondary-300' />
      </div>

      <div className='flex flex-col ml-auto items-end'>
        <Skeleton className='h-3 my-1.5 w-[60px] rounded-full bg-secondary-300' />
        <Skeleton className='h-2 my-1 w-[35px] rounded-full bg-secondary-300' />
      </div>
    </div>
  )
}

type AggregatedLoadingListProps = {
  className?: string
  count?: number
}

export const AggregatedLoadingList = React.memo(
  ({ className, count = 7 }: AggregatedLoadingListProps) => {
    return (
      <div className={cn('flex flex-col gap-3 w-full', className)}>
        {Array.from({ length: count }).map((_, index) => (
          <AggregatedLoadingCard key={index} />
        ))}
      </div>
    )
  },
)

AggregatedLoadingList.displayName = 'AggregatedLoadingList'
