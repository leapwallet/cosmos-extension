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
    <div className='flex rounded-2xl bg-white-100 dark:bg-gray-950 gap-y-1.5 flex-col p-4 w-full'>
      <Skeleton width={100} height={20} />
      <Skeleton width={336} height={40} />
      <Skeleton width={100} height={24} />
    </div>
  )
}

export function ValidatorItemSkeleton() {
  return (
    <div className='flex items-center px-4 py-3 bg-white-100 dark:bg-gray-950 w-full rounded-2xl gap-x-4'>
      <Skeleton circle={true} width={28} height={28} className='!z-0' />
      <Skeleton count={1} width={100} height={16} className='!z-0' />
    </div>
  )
}
