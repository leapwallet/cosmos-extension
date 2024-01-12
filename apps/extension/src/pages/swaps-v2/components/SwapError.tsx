import { Images } from 'images'
import React from 'react'

type SwapErrorProps = {
  errorMsg: string
}

export function SwapError({ errorMsg }: SwapErrorProps) {
  return (
    <div className='w-full bg-white-100 dark:bg-gray-900 text-red-300 flex gap-2 items-center p-2 rounded-lg border border-red-300'>
      <img src={Images.Misc.FilledExclamationMark} />
      <span>{errorMsg}</span>
    </div>
  )
}
