import { BigNumber } from 'bignumber.js'
import classNames from 'classnames'
import { Images } from 'images'
import React from 'react'
import { imgOnError } from 'utils/imgOnError'

export default function DefiRow({ token }: { token: any }) {
  const formatter = Intl.NumberFormat('en', { notation: 'compact' })
  const productName = token?.productName

  const logos = productName?.includes('/')
    ? productName?.split('/').join(' ').split(' ').slice(0, 2)
    : productName?.includes('(')
    ? [productName?.replace('(', '').replace(')', '').split(' ')[1]]
    : [productName?.split(' ')[0]]

  return (
    <div
      className='group z-0 grid h-[64px] w-full cursor-pointer items-center justify-center transition-all duration-300 ease-in hover:bg-[#2B2B2BFA] grid-cols-[6fr_2fr_2fr_1fr]'
      onClick={() => window.open(token?.productWebsite, '_blank')}
    >
      <div className='flex flex-row items-center justify-start gap-3 pl-6'>
        <div className='flex w-[45px]'>
          {logos?.map((d: string, i: number) => (
            <img
              key={i}
              src={`https://assets.leapwallet.io/${d.toLowerCase()}.svg`}
              onError={imgOnError(Images.Logos.GenericDark)}
              alt='token-info'
              className='h-8 w-8 overflow-hidden rounded-full mr-[-20px]'
            />
          ))}
        </div>
        <div className='flex flex-col items-start justify-center'>
          <div className='flex flex-row items-center justify-start gap-[4px]'>
            <div className='text-xs font-medium leading-[20px] text-black-100 dark:text-white-100'>
              {productName}
            </div>
          </div>
          <div className='text-[10px] font-medium !leading-[12px] capitalize text-gray-500 dark:text-gray-500'>
            {token?.dappCategory?.replace(/([a-z])([A-Z])/g, '$1 $2') ?? 'NA'}
          </div>
        </div>
      </div>

      <div className='flex flex-row items-center justify-start gap-2'>
        <div
          className={classNames('text-xs sm:!text-sm font-medium !leading-[20px] text-orange-300')}
        >
          ${formatter.format(token?.tvl)}
        </div>
      </div>

      <div className='flex flex-row items-center justify-start gap-2'>
        <div
          className={classNames('text-xs sm:!text-sm font-medium !leading-[20px]', {
            'text-green-500 dark:text-green-500': new BigNumber(token?.apr ?? '0').gte(0),
            'text-red-700 dark:text-red-300': new BigNumber(token?.apr ?? '0').lt(0),
          })}
        >
          {(token.apr * 100)?.toFixed(2)}%
        </div>
      </div>

      <div className='flex flex-row items-center justify-end mr-3'>
        <div className='material-icons-round flex !h-[20px] !w-[20px] flex-row items-center justify-center gap-2 !text-[16px] !text-gray-500 group-hover:!text-black-100 dark:!text-gray-500 dark:group-hover:!text-white-100'>
          {'chevron_right'}
        </div>
      </div>
    </div>
  )
}
