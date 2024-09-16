import { Input } from '@leapwallet/leap-ui'
import classNames from 'classnames'
import React from 'react'

type Props = {
  value: string
  onChange: React.ChangeEventHandler<HTMLInputElement>
}

export default function CreateWalletInput({ value, onChange }: Props) {
  return (
    <div className={classNames('flex relative justify-center shrink w-full')}>
      <Input
        data-testing-id='input-enter-wallet-name'
        placeholder='Enter wallet Name'
        maxLength={24}
        value={value}
        onChange={onChange}
      />
      <div className='absolute right-[16px] top-[14px] text-gray-400 text-sm font-medium'>{`${value.length}/24`}</div>
    </div>
  )
}
