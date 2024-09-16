import { Warning } from '@phosphor-icons/react'
import classNames from 'classnames'
import React from 'react'

export function WarningBox({
  type = 'warning',
  message,
}: {
  type?: 'warning' | 'error'
  message: string
}) {
  return (
    <div
      className={classNames(
        'flex flex-row justify-start items-start gap-2 px-4 py-3 rounded-2xl ',
        {
          'bg-orange-200 dark:bg-orange-900': type === 'warning',
          'bg-red-200 dark:bg-red-900': type === 'error',
        },
      )}
    >
      <Warning
        size={16}
        className={classNames('!leading-[20px]', {
          'text-orange-500 dark:text-orange-300': type === 'warning',
          'text-red-400 dark:text-red-300': type === 'error',
        })}
      />
      <span className='font-medium text-left text-xs !leading-[20px] text-black-100 dark:text-white-100'>
        {message}
      </span>
    </div>
  )
}
