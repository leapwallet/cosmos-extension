import { LineDivider } from '@leapwallet/leap-ui'
import React from 'react'
import Skeleton from 'react-loading-skeleton'

export default function ChartSkeleton() {
  return (
    <div className='flex-1 h-[300px] min-w-[344px]'>
      <LineDivider />
      <div className='flex flex-row mt-3 gap-x-3 h-8 justify-between rounded-2xl'>
        <Skeleton count={1} width={82} />
        <Skeleton count={1} width={82} />
        <Skeleton count={1} width={82} />
      </div>
      <div className='flex flex-row gap-x-3 h-8 mb-3 justify-between rounded-2xl'>
        <Skeleton count={1} width={82} />
        <Skeleton count={1} width={82} />
        <Skeleton count={1} width={82} />
      </div>
      <LineDivider />
      <div className='flex flex-col h-[220px] gap-y-3 mt-3 overflow-clip rounded-2xl'>
        <Skeleton count={1} height={180} />
        <Skeleton count={1} />
      </div>
    </div>
  )
}
