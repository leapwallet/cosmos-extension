import classNames from 'classnames'
import React, { ComponentPropsWithoutRef, ReactNode } from 'react'

type TextProps = ComponentPropsWithoutRef<'p'> & {
  children: ReactNode
}

export function Text({ children, className, ...rest }: TextProps) {
  return (
    <p className={classNames('!max-w-[150px] truncate', className)} {...rest}>
      {children}
    </p>
  )
}
