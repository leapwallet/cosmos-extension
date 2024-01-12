import classNames from 'classnames'
import { Images } from 'images'
import React, { useEffect, useRef } from 'react'

type SearchInputProps = {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onClear: () => void
  placeholder?: string
  divClassName?: string
  inputClassName?: string
  inputDisabled?: boolean
}

export function SearchInput({
  value,
  onChange,
  onClear,
  placeholder,
  divClassName,
  inputClassName,
  inputDisabled,
  ...rest
}: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current?.focus()
    }
  }, [])

  return (
    <div
      className={classNames({
        'mx-auto w-[344px] mb-[16px] flex h-10 bg-white-100 dark:bg-gray-900 rounded-[30px] py-2 pl-5 pr-[10px]':
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
      />

      {value.length === 0 ? (
        <img src={Images.Misc.SearchIcon} />
      ) : (
        <img className='cursor-pointer' src={Images.Misc.CrossFilled} onClick={onClear} />
      )}
    </div>
  )
}
