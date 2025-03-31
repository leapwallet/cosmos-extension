import { CheckSquare, Square } from '@phosphor-icons/react'
import { Images } from 'images'
import React from 'react'

type CustomCheckboxProps = {
  checked: boolean
  onClick: () => void
}

export function CustomCheckbox({ checked, onClick }: CustomCheckboxProps) {
  return (
    <div
      className={'w-[18px] h-[18px] rounded cursor-pointer flex justify-center items-center'}
      onClick={onClick}
    >
      {checked ? <CheckSquare size={18} color='#70B7FF' /> : <Square size={18} color='#70B7FF' />}
    </div>
  )
}
