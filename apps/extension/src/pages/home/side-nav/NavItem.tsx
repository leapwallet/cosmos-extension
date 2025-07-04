import { CaretRight } from '@phosphor-icons/react'
import React from 'react'
import { cn } from 'utils/cn'

export const NavItem = (props: {
  label: string
  icon: React.ReactNode
  onClick: () => void
  trailingIcon?: React.ReactNode
  className?: string
  'data-testing-id'?: string
}) => {
  return (
    <button
      className={cn(
        'flex items-center gap-3 px-5 py-4 hover:bg-secondary-200 w-full transition-colors first:pt-6 last:pb-6',
        props.className,
      )}
      onClick={props.onClick}
      data-testing-id={props['data-testing-id']}
    >
      <div className='[&>svg]:size-6 text-accent-success'>{props.icon}</div>
      <div className='text-sm font-medium'>{props.label}</div>

      <div className='ml-auto text-secondary-300'>
        {props.trailingIcon || <CaretRight className='size-4' />}
      </div>
    </button>
  )
}
