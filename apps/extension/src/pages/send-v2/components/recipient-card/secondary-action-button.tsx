import classNames from 'classnames'
import React from 'react'

type SecondaryActionButtonProps = {
  // eslint-disable-next-line no-unused-vars
  onClick: (e: React.MouseEvent) => void
  leftIcon?: string
  className?: string
  iconClassName?: string
  actionLabel: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} & React.PropsWithChildren<any>

export const SecondaryActionButton: React.FC<SecondaryActionButtonProps> = ({
  leftIcon,
  onClick,
  children,
  className,
  iconClassName,
}) => {
  return (
    <button
      className={classNames(
        className,
        'flex gap-[6px] items-center rounded-full pl-2 pr-3 py-[6px] bg-gray-50 dark:bg-gray-800 focus:bg-gray-400 dark:focus:bg-gray-500 outline-none',
      )}
      onClick={onClick}
    >
      {leftIcon && (
        <div
          className={classNames(
            iconClassName,
            'material-icons-round text-base text-black-100 dark:text-white-100',
          )}
        >
          {leftIcon}
        </div>
      )}
      <span>{children}</span>
    </button>
  )
}
