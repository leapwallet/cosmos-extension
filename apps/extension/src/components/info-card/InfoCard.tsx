import { Info } from '@phosphor-icons/react'
import classNames from 'classnames'
import React, { ReactNode } from 'react'

type InfoCardProps = {
  message: ReactNode
  className?: string
}

export function InfoCard({ message, className }: InfoCardProps) {
  return (
    <div className={classNames('p-4 bg-[#002142] rounded-2xl flex gap-2 items-start', className)}>
      <Info size={20} className='text-foreground shrink-0 p-[1px]' />
      <p className='text-sm text-foreground !leading-[22px] font-medium'>{message}</p>
    </div>
  )
}
