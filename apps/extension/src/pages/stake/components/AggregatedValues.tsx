import classNames from 'classnames'
import React, { ReactNode } from 'react'

type AggregatedValuesProps = {
  label: string
  value: ReactNode
  className?: string
}

export function AggregatedValues({ label, value, className }: AggregatedValuesProps) {
  return (
    <div className={classNames('flex flex-col gap-1 items-center flex-1', className)}>
      <h3 className='text-gray-600 dark:text-gray-400 text-[12px]'>{label}</h3>
      <p className='text-black-100 dark:text-white-100 font-[700]'>{value}</p>
    </div>
  )
}
