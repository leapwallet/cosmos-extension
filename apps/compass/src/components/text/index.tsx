import classNames from 'classnames'
import React, { PropsWithChildren, ReactNode } from 'react'

export type TextProps = {
  readonly size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'jumbo'
  readonly children?: ReactNode
  readonly className?: string
  readonly color?: string
  readonly style?: React.CSSProperties
  readonly onClick?: () => void
}

/**
 * create a Text
 *
 * @param props {('xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'jumbo')} - size - xs 12, sm 14, md 16, lg 20, xl 24, xxl 32, jumbo 48
 * @returns {string} - new mnemonic or given length
 */
export default function Text(props: PropsWithChildren<TextProps>) {
  const { size, children, className, color, style, ...rest } = props
  return (
    <span
      style={style}
      className={classNames(
        `flex shrink  font-satoshi`,

        {
          'text-xs': size === 'xs',
          'text-sm': size === 'sm',
          'text-base': size === 'md',
          'text-lg': size === 'lg',
          'text-xl': size === 'xl',
          'text-xxl': size === 'xxl',
          'text-jumbo': size === 'jumbo',
        },
        color,
        className,
        {
          'text-black-100 dark:text-white-100': color === undefined,
        },
      )}
      {...rest}
    >
      {children}
    </span>
  )
}
