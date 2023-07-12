import classNames from 'classnames'
import React from 'react'

type Props = {
  src: string
  heading?: string
  subHeading?: string
  isRounded?: boolean
  className?: string
}

const EmptyCard: React.FC<Props> = ({ src, heading, subHeading, isRounded = true, className }) => {
  return (
    <>
      <div
        className={classNames(
          'flex flex-col items-center bg-white-100 w-[344px] dark:bg-gray-900 py-10 px-10',
          className,
          {
            'rounded-[16px]': isRounded,
          },
        )}
      >
        <div className='h-14 w-14 mb-3 flex justify-center rounded-full bg-gray-50 dark:bg-gray-800'>
          <img src={src} className='' />
        </div>
        {heading && (
          <div className='text-base font-bold text-gray-800 text-center dark:text-gray-100'>
            {heading}
          </div>
        )}
        {subHeading && (
          <div className='text-sm text-gray-400 text-center font-medium'>{subHeading}</div>
        )}
      </div>
    </>
  )
}

export default EmptyCard
