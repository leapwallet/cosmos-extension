import { TokenImageWithFallback } from 'components/token-image-with-fallback'
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
        <TokenImageWithFallback
          assetImg={chainLogo}
          text={tokenName}
          altText={chainName + ' logo'}
          imageClassName='w-[36px] h-[36px]'
          containerClassName='w-[36px] h-[36px] rounded-full bg-gray-100 dark:bg-gray-850'
          textClassName='text-[10px] !leading-[14px]'
        />
        <div className='flex flex-col'>
          <p className='text-black-100 dark:text-white-100 font-[700]'>{tokenName}</p>
          <p className='text-gray-600 dark:text-gray-400 text-[12px] font-[500]'>{chainName}</p>
        </div>
      </div>

      <p className='text-black-100 dark:text-white-100 text-[14px]'>{apr}</p>

      <div className='flex flex-col items-end w-[90px]'>
        {dollarAmount !== '-' ? (
          <p className='text-black-100 dark:text-white-100 font-[700] text-[14px] text-right'>
            {dollarAmount}
          </p>
        ) : null}

        <p className='text-gray-600 dark:text-gray-400 text-[12px] font-[500] text-right'>
          {amount}
        </p>
      </div>
    </div>
  )
}
