import React from 'react'

type StakeTokenCardProps = {
  tokenName: string
  chainName: string
  chainLogo: string
  apr: string
  amount: string
  dollarAmount: string
  onClick: () => void
}

export function StakeTokenCard({
  tokenName,
  chainName,
  chainLogo,
  apr,
  amount,
  dollarAmount,
  onClick,
}: StakeTokenCardProps) {
  return (
    <div
      className='bg-white-100 dark:bg-gray-950 rounded-xl flex items-center justify-between p-[12px] cursor-pointer'
      onClick={onClick}
    >
      <div className='flex items-center justify-start gap-2 w-[150px]'>
        <img className='w-[36px] h-[36px]' src={chainLogo} alt={chainName + ' logo'} />

        <div className='flex flex-col'>
          <p className='text-black-100 dark:text-white-100 font-[700]'>{tokenName}</p>
          <p className='text-gray-600 dark:text-gray-400 text-[12px] font-[500]'>{chainName}</p>
        </div>
      </div>

      <p className='text-black-100 dark:text-white-100 text-[14px]'>{apr}</p>

      <div className='flex flex-col items-end w-[90px]'>
        {dollarAmount !== '-' ? (
          <p className='text-black-100 dark:text-white-100 font-[700] text-[14px]'>
            {dollarAmount}
          </p>
        ) : null}

        <p className='text-gray-600 dark:text-gray-400 text-[12px] font-[500]'>{amount}</p>
      </div>
    </div>
  )
}
