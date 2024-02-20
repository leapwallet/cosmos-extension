import { Images } from 'images'
import React from 'react'

type SwapInfoProps = {
  infoMsg: string
}

export function SwapInfo({ infoMsg }: SwapInfoProps) {
  return (
    <div className='w-full bg-white-100 dark:bg-gray-900 text-yellow-600 text-sm flex gap-2 items-center p-2 rounded-lg border border-yellow-600'>
      <img src={Images.Misc.InfoFilledExclamationMark} />
      <span>{infoMsg}</span>
    </div>
  )
}
