import { Info } from '@phosphor-icons/react'
import classNames from 'classnames'
import React, { ReactNode } from 'react'

type InfoCardProps = {
  message: ReactNode
  className?: string
}

export function InfoCard({ message, className }: InfoCardProps) {
  return (
    <div className={classNames('p-4 bg-[#002142] rounded-2xl flex gap-3 items-center', className)}>
      <Info size={16} className='text-[#ADD6FF] shrink-0' />
      <p className='text-sm text-blue-100 font-medium'>{message}</p>
    </div>
  )
}
