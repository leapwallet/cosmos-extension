import classNames from 'classnames'
import { AnimatePresence, motion } from 'framer-motion'
import React, { useEffect, useRef, useState } from 'react'
import { hex2rgba } from 'utils/hextorgba'

interface ActionInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  action: string
  buttonText: string
  buttonTextColor: string
  icon?: string
  value: string
  // eslint-disable-next-line no-unused-vars
  onAction: (e: React.MouseEvent, action: string, value: string) => void
  onChange: React.ChangeEventHandler<HTMLInputElement>
  placeholder?: string
  className?: string
  preview?: React.ReactNode | undefined
  invalid?: boolean
  rightElement?: React.ReactNode
  disabled?: boolean
}

export const ActionInputWithPreview = React.forwardRef(
  (
    {
      buttonText,
      buttonTextColor,
      icon,
      value,
      onChange,
      onAction,
      action,
      placeholder = '',
      className = '',
      preview,
      invalid = false,
      rightElement,
      disabled = false,
      ...props
    }: ActionInputProps,
    ref: React.Ref<HTMLInputElement>,
  ) => {
    const containerRef = useRef<HTMLDivElement | null>(null)
    const [showPreview, setShowPreview] = useState(true)

    const handleButtonClick = (e: React.MouseEvent) => {
      onAction(e, action, value)
    }

    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (!containerRef.current?.contains(e.target as Node)) {
          setShowPreview(true)
        }
      }

      const root = document.getElementById('root') as HTMLElement
      root.addEventListener('mousedown', handleClickOutside)
      return () => {
        root.removeEventListener('mousedown', handleClickOutside)
      }
    }, [])

    return (
      <div className='relative w-full' ref={containerRef}>
        <AnimatePresence>
          {preview !== undefined && showPreview ? (
            <motion.div
              initial={{ opacity: 0.9 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, ease: 'linear' }}
              exit={{ opacity: 0.9 }}
              className={`border rounded-lg transition bg-gray-50 dark:bg-gray-800 outline-none text-gray-800 caret-gray-800 dark:text-white-100 w-full pl-4 pr-12 py-2 ${
                invalid
                  ? 'border-red-300 dark:border-red-300'
                  : 'border-gray-300 dark:border-gray-800 focus:border-gray-400 dark:focus:border-gray-500'
              }'}`}
              onClick={() => setShowPreview(false)}
            >
              {preview}
            </motion.div>
          ) : (
            // @ts-ignore
            <motion.input
              initial={{ opacity: 0.9 }}
              exit={{ opacity: 0.9 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, ease: 'linear' }}
              ref={ref}
              className={classNames(
                className,
                'border rounded-lg transition bg-white-30 dark:bg-black-50 outline-none text-gray-800 caret-gray-800 dark:text-white-100 dark:caret-white-100 disabled:cursor-not-allowed',
                `w-full pl-4 py-2 ${
                  invalid
                    ? 'border-red-300 dark:border-red-300'
                    : 'border-gray-300 dark:border-gray-800 focus:border-gray-400 dark:focus:border-gray-500'
                }}`,
                `${!rightElement && disabled ? 'pr-4' : 'pr-12'}`,
              )}
              value={value}
              onChange={onChange}
              placeholder={placeholder}
              disabled={disabled}
              {...props}
              data-testing-id={
                placeholder === 'Enter amount'
                  ? 'input-send-enter-amount'
                  : 'input-send-recipient-address'
              }
            />
          )}
        </AnimatePresence>
        {rightElement ? (
          <div className='absolute h-full right-0 top-0 flex items-center justify-center px-4'>
            {rightElement}
          </div>
        ) : !disabled ? (
          <div className='absolute h-full right-0 top-0 flex items-center justify-center px-4'>
            {icon ? (
              <button
                aria-label={action}
                onClick={handleButtonClick}
                className='outline-none flex bg-none rounded-full'
                data-testing-id='send-recipient-cross-filled-btn'
              >
                <img src={icon} alt={action + ' icon'} />
              </button>
            ) : (
              <button
                className='capitalize text-sm font-bold rounded-full px-3 py-1 outline-none'
                style={{
                  color: buttonTextColor,
                  backgroundColor: hex2rgba(buttonTextColor, 0.1),
                }}
                onClick={handleButtonClick}
              >
                {buttonText}
              </button>
            )}
          </div>
        ) : null}
      </div>
    )
  },
)

ActionInputWithPreview.displayName = 'ActionInput'
