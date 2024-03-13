import classNames from 'classnames'
import { Images } from 'images'
import React from 'react'

type SwapErrorProps = {
  errorMsg: string
  className?: string
}

export function SwapError({ errorMsg, className }: SwapErrorProps) {
  return (
    <div
      className={classNames(
        'w-full bg-white-100 dark:bg-gray-900 text-red-300 flex gap-2 items-center p-2 rounded-lg border border-red-300',
        className,
      )}
    >
      <img src={Images.Misc.FilledExclamationMark} />
      <span>{errorMsg}</span>
    </div>
  )
}
