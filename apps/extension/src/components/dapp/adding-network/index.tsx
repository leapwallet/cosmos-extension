import Text from 'components/text'
import React from 'react'
import { ReactNode } from 'react'

type KeyProps = {
  readonly children: ReactNode
}

export function Key({ children }: KeyProps) {
  return (
    <Text size='sm' className='font-bold'>
      {children}
    </Text>
  )
}

export function Value({ children }: KeyProps) {
  return (
    <Text size='xs' color='text-gray-700 dark:text-gray-300 -mt-1 break-all'>
      {children}
    </Text>
  )
}

export function KeyNew({ children }: KeyProps) {
  return <div className='text-sm font-medium !leading-[22px] text-muted-foreground'>{children}</div>
}

export function ValueNew({ children }: KeyProps) {
  return (
    <div className='text-md font-bold !leading-[22px] text-foreground break-all'>{children}</div>
  )
}

export const Divider = (
  <div className='my-0.5 border-[0.05px] border-solid border-white-100 dark:border-gray-800 opacity-50' />
)
