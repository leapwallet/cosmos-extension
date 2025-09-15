import { SatelliteDish } from 'icons/satellite-dish'
import React from 'react'

export function ChartErrorState() {
  return (
    <div className='flex flex-col items-center justify-center px-6 w-full h-[205px]'>
      <div className='flex flex-col gap-3 items-center justify-center border border-secondary-100 rounded-2xl h-full w-full'>
        <div className='bg-secondary-200 flex flex-row gap-2.5 items-center justify-start p-4 relative rounded-full'>
          <div className='relative size-5'>
            <SatelliteDish height={20} width={20} className='text-secondary-600' />
          </div>
        </div>
        <div className='flex flex-col gap-1 items-center justify-start text-center'>
          <div className='text-secondary-800 text-sm font-medium'>
            No data available to display trends.
          </div>
          <div className='text-muted-foreground text-xs font-normal'>Please check back later.</div>
        </div>
      </div>
    </div>
  )
}
