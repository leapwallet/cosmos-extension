import React from 'react'
import Skeleton from 'react-loading-skeleton'

export function AmountCardSkeleton() {
  return (
    <div className='flex rounded-2xl bg-white-100 dark:bg-gray-950 gap-y-4 flex-col p-4 w-full'>
      <Skeleton count={1} width={100} height={16} />
      <div>
        <Skeleton count={1} width={50} height={30} />
        <Skeleton count={1} width={75} height={20} />
      </div>
      <Skeleton count={1} borderRadius={16} height={70} />
    </div>
  )
}

export default function StakeCardSkeleton() {
  return (
    <div className='flex-1 p-7 gap-y-4 min-w-[344px]'>
      <Skeleton count={1} />
      <Skeleton count={2} />
      <Skeleton count={4} />
    </div>
  )
}

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
    <div className='flex flex-col gap-4 text-xs'>
      {Array.from({ length: props.count ?? 1 }).map((_, index) => (
        <div
          key={index}
          className='flex items-center px-4 py-3 bg-secondary-100 w-full rounded-xl gap-4'
        >
          <Skeleton width={36} height={36} circle />
          <Skeleton width={100} height={12} />

          <div className='flex flex-col items-end ml-auto '>
            <Skeleton width={40} height={8} />
            <Skeleton width={48} height={6} />
          </div>
        </div>
      ))}
    </div>
  )
}
