import classNames from 'classnames'
import React from 'react'

type TokenTypeProps = {
  className?: string
  type: string
}

export function TokenType({ className, type }: TokenTypeProps) {
  return (
    <span
      className={classNames(
        'px-[6px] py-[1px] text-[10px] text-center ml-[2px] rounded-xl',
        className,
      )}
    >
      {type}
    </span>
  )
}
