import classNames from 'classnames'
import React, { ComponentPropsWithoutRef, ReactNode } from 'react'

type ChipProps = ComponentPropsWithoutRef<'div'> & {
  children: ReactNode
}

export function Chip({ children, className, ...rest }: ChipProps) {
  return (
    <div
      {...rest}
      className={classNames('rounded-full flex items-center justify-center', className)}
    >
      {children}
    </div>
  )
}

type ChipTextProps = ComponentPropsWithoutRef<'p'> & {
  children: ReactNode
}

Chip.Text = function Text({ children, ...rest }: ChipTextProps) {
  return <p {...rest}>{children}</p>
}

type ChipImageProps = ComponentPropsWithoutRef<'img'>

Chip.Image = function Image({ src, alt, className, ...rest }: ChipImageProps) {
  return (
    <img src={src} alt={alt} className={classNames('rounded-full mr-1', className)} {...rest} />
  )
}
