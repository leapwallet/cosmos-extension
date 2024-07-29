import React from 'react'

export default function InactiveValidatorCard() {
  return (
    <div className='flex w-full items-start bg-orange-200 dark:bg-orange-900 p-4 rounded-2xl'>
      <span className='material-icons-round text-orange-500 dark:text-orange-300 !text-md'>
        info
      </span>
      <p className='text-xs font-bold ml-2 text-gray-600 dark:text-gray-200'>
        You are staking with an{' '}
        <span className='text-black-100 dark:text-white-100'>inactive validator</span> and won’t
        earn any rewards as long as the validator is inactive.
      </p>
    </div>
  )
}
