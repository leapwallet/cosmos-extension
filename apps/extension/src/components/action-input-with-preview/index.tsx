import classNames from 'classnames'
import { AnimatePresence, motion } from 'framer-motion'
import React, { useEffect, useRef, useState } from 'react'
import { hex2rgba } from 'utils/hextorgba'

interface ActionInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  action: string
  buttonText: string
  buttonTextColor?: string
  icon?: string
  value: string
  // eslint-disable-next-line no-unused-vars
  onAction: (e: React.MouseEvent, action: string, value: string) => void
  onChange: React.ChangeEventHandler<HTMLInputElement>
  placeholder?: string
  className?: string
  preview?: React.ReactNode | undefined
  invalid?: boolean
  warning?: boolean
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
      warning = false,
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
              className={classNames(
                'border rounded-xl transition bg-gray-50 dark:bg-gray-900 outline-none text-gray-800 caret-gray-800 dark:text-white-100 w-full pl-4 pr-12 py-2',
                {
                  'border-red-300 dark:border-red-300': invalid,
                  'border-yellow-600 dark:border-yellow-600': warning,
                  'border-[transparent] focus:border-gray-400 dark:focus:border-gray-500':
                    !invalid && !warning,
                },
              )}
              onClick={() => setShowPreview(false)}
            >
              {preview}
            </motion.div>
          ) : (
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            <motion.input
              initial={{ opacity: 0.9 }}
              exit={{ opacity: 0.9 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, ease: 'linear' }}
              ref={ref}
              className={classNames(
                className,
                'border rounded-lg transition bg-white-30 dark:bg-black-50 outline-none text-gray-800 caret-gray-800 dark:text-white-100 dark:caret-white-100 disabled:cursor-not-allowed w-full pl-4 py-2 placeholder-shown:font-normal',
                `${!rightElement && disabled ? 'pr-4' : 'pr-12'}`,
                {
                  'border-red-300 dark:border-red-300': invalid,
                  'border-yellow-600 dark:border-yellow-600': warning,
                  'focus-visible:border-gray-300 focus-visible:dark:border-gray-800':
                    !invalid && !warning,
                },
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
            ) : buttonText ? (
              <button
                className='capitalize text-xs font-medium dark:bg-gray-850 bg-gray-100 rounded-full dark:text-white-100 text-black-100 px-3 py-1 outline-none'
                style={{
                  color: buttonTextColor,
                  backgroundColor: buttonTextColor ? hex2rgba(buttonTextColor, 0.1) : '',
                }}
                onClick={handleButtonClick}
              >
                {buttonText}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    )
  },
)

ActionInputWithPreview.displayName = 'ActionInput'
