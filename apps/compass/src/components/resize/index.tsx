import classNames from 'classnames'
import React, { ReactNode } from 'react'

type ResizeProps = {
  className?: string
  children: ReactNode
}

export default function Resize({ children, className }: ResizeProps) {
  return <div className={classNames('flex shrink w-[344px]', className)}>{children}</div>
}
