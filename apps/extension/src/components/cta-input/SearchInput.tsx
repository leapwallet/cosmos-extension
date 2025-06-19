import { MagnifyingGlass } from '@phosphor-icons/react'
import classNames from 'classnames'
import Text from 'components/text'
import React, { useEffect, useRef } from 'react'

type SearchInputProps = {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  action?: string
  actionHandler?: () => void
  onClear: () => void
  autoFocus?: boolean
  placeholder?: string
  divClassName?: string
  inputClassName?: string
  inputDisabled?: boolean
  type?: 'text' | 'number'
  onKeyUp?: (e: React.KeyboardEvent<HTMLInputElement>) => void
}

export function CtaInput({
  value,
  onChange,
  onClear,
  autoFocus = false,
  placeholder,
  divClassName,
  inputClassName,
  inputDisabled,
  action,
  actionHandler,
  type = 'text',
  ...rest
}: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (inputRef.current && autoFocus) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [autoFocus])

  return (
    <div
      className={classNames({
        'mx-auto w-[344px] mb-[16px] flex h-10 bg-white-100 dark:bg-gray-950 rounded-[30px] py-2 pl-5 pr-[10px]':
          !divClassName,
        [divClassName as string]: divClassName,
      })}
      {...rest}
    >
      <input
        placeholder={placeholder}
        className={classNames({
          'flex flex-grow text-base text-gray-400 outline-none bg-white-0': !inputClassName,
          [inputClassName as string]: inputClassName,
        })}
        value={value}
        onChange={onChange}
        ref={inputRef}
        disabled={inputDisabled}
        type={type}
      />

      {value.length === 0 ? (
        action ? (
          <div
            onClick={actionHandler}
            className='capitalize text-xs dark:bg-gray-850 bg-gray-100 rounded-lg text-monochrome px-2.5 py-1 outline-none font-bold cursor-pointer'
          >
            {action}
          </div>
        ) : (
          <MagnifyingGlass size={18} className='text-muted-foreground' />
        )
      ) : action ? (
        <div
          onClick={onClear}
          className='capitalize text-xs dark:bg-gray-850 bg-gray-100 rounded-lg text-monochrome px-2.5 py-1 outline-none font-bold cursor-pointer'
        >
          Clear
        </div>
      ) : (
        <div onClick={onClear}>
          <Text size='xs' color='text-muted-foreground' className=' font-bold cursor-pointer'>
            Clear
          </Text>
        </div>
      )}
    </div>
  )
}
