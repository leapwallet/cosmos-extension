import classnames from 'classnames'
import React from 'react'

export type Props = {
  readonly size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'jumbo'
  readonly className?: string
  readonly color?: string
  readonly style?: React.CSSProperties
  readonly children: React.ReactNode
}

/**
 * create a Text
 *
 * @param props {('xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'jumbo')} - size - xs 12, sm 14, md 16, lg 20, xl 24, xxl 32, jumbo 48
 * @returns {string} - new mnemonic or given length
 */
const Text: React.FC<Props> = ({ size, children, className, color, style }) => {
  return (
    <span
      style={style}
      className={classnames(
        `flex shrink  font-satoshi`,
        {
          'text-xs': size === 'xs',
          'text-sm': size === 'sm',
          'text-md': size === 'md',
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
    >
      {children}
    </span>
  )
}

export default Text
