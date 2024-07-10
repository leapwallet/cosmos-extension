import classNames from 'classnames'
import React, { ReactNode } from 'react'

type IconActionButtonProps = {
  onClick?: () => void
  children: ReactNode
  title?: string
  className?: string
  disabled?: boolean
}

const IconActionButton = React.memo(
  ({ onClick, title, children, className, disabled }: IconActionButtonProps) => {
    return (
      <button
        onClick={onClick}
        title={title}
        className={classNames(
          'h-[24px] w-[24px] dark:bg-gray-950 bg-white-100 flex justify-center items-center text-xs text-gray-600 dark:text-white-100 rounded-full',
          className,
          {
            'opacity-75 cursor-not-allowed': disabled,
            'cursor-pointer': !disabled,
          },
        )}
        disabled={disabled}
      >
        {children}
      </button>
    )
  },
)

IconActionButton.displayName = 'IconActionButton'

export { IconActionButton }
