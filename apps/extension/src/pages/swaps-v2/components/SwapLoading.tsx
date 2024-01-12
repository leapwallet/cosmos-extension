import { LoaderAnimation } from 'components/loader/Loader'
import React from 'react'

type SwapLoadingProps = {
  loadingMsg: string
}

export function SwapLoading({ loadingMsg }: SwapLoadingProps) {
  return (
    <div className='w-full bg-white-100 dark:bg-gray-900 dark:text-white-100 flex gap-2 items-center p-2 rounded-lg'>
      <LoaderAnimation color='' className='h-[26px] w-[26px]' />
      <span>{loadingMsg}</span>
    </div>
  )
}
