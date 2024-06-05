import { CustomCheckbox } from 'components/custom-checkbox'
import React, { Dispatch, SetStateAction } from 'react'

type Props = {
  isChecked: boolean
  setIsChecked: Dispatch<SetStateAction<boolean>>
  title: string
  message: string
  title2?: string
}

export function WarningWithCheck({ isChecked, setIsChecked, title, message, title2 }: Props) {
  return (
    <div className='flex flex-col w-full justify-start items-start gap-2 px-4 py-3 rounded-2xl bg-red-200 dark:bg-red-900'>
      <div className='flex w-full flex-row justify-between items-start gap-2'>
        <div className='flex flex-row justify-start items-start gap-2'>
          <span className='material-icons-round !text-md text-red-400 dark:text-red-300 !leading-[20px]'>
            warning
          </span>
          <span className='font-bold text-left text-sm !leading-[20px] text-black-100 dark:text-white-100'>
            {title}
          </span>
        </div>

        <span className='font-medium text-left text-sm !leading-[20px] text-black-100 dark:text-white-100'>
          {title2}
        </span>
      </div>

      <div className='flex flex-row justify-start items-start gap-2'>
        <CustomCheckbox checked={isChecked} onClick={() => setIsChecked(!isChecked)} />

        <span className='font-medium text-left text-xs !leading-[20px] text-gray-800 dark:text-gray-200'>
          {message}
        </span>
      </div>
    </div>
  )
}
