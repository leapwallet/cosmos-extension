import classNames from 'classnames'
import { Images } from 'images'
import React, { useEffect, useRef } from 'react'

type AggregatedSearchComponentsProps = {
  handleClose: () => void
  value: string
  handleChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function AggregatedSearchComponent({
  handleClose,
  value,
  handleChange,
  placeholder,
  className,
}: AggregatedSearchComponentsProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  return (
    <div
      className={classNames(
        'flex items-center justify-between gap-2 text-black-100 dark:text-white-100 mb-4',
        className,
      )}
    >
      <div className='bg-white-100 dark:bg-gray-950 flex items-center justify-between gap-2 flex-1 rounded-full h-[40px] px-[12px] py-[2px]'>
        <input
          className='flex-1 bg-transparent text-[15px] outline-0'
          placeholder={placeholder ?? 'Search'}
          value={value}
          onChange={(event) => handleChange(event.target.value)}
          ref={inputRef}
        />

        <img src={Images.Misc.SearchWhiteIcon} className='w-[22px] h-[22px] invert dark:invert-0' />
      </div>

      <button
        className='bg-white-100 dark:bg-gray-950 w-[40px] h-[40px] rounded-full flex items-center justify-center'
        onClick={handleClose}
      >
        <img src={Images.Misc.Cross} className='w-[12px] h-[12px] invert dark:invert-0' />
      </button>
    </div>
  )
}
