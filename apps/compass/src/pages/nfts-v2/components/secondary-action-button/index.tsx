import classNames from 'classnames'
import React from 'react'

type SecondaryActionButtonProps = {
  // eslint-disable-next-line no-unused-vars
  onClick: (e: React.MouseEvent) => void
  leftIcon?: string
  className?: string
  actionLabel: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} & React.PropsWithChildren<any>

export const SecondaryActionButton: React.FC<SecondaryActionButtonProps> = ({
  actionLabel,
  leftIcon,
  onClick,
  children,
  className,
}) => {
  return (
    <button
      className={classNames(
        className,
        'flex items-center rounded-full px-4 py-2 border border-gray-300 dark:border-gray-800 focus:border-gray-400 dark:focus:border-gray-500 outline-none',
      )}
      onClick={onClick}
    >
      {leftIcon && <img src={leftIcon} alt={actionLabel} className='mr-2' />}
      <span>{children}</span>
    </button>
  )
}
