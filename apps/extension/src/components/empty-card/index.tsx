import classNames from 'classnames'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import React, { PropsWithoutRef, ReactNode } from 'react'
import { imgOnError } from 'utils/imgOnError'

export type EmptyCardProps = {
  src: string
  heading?: ReactNode
  subHeading?: ReactNode
  classname?: string
  isRounded?: boolean
  'data-testing-id'?: string
}

export function EmptyCard(props: PropsWithoutRef<EmptyCardProps>) {
  const defaultTokenLogo = useDefaultTokenLogo()
  const { src, heading, subHeading, isRounded = true, classname } = props

  return (
    <>
      <div
        className={classNames(
          'flex flex-col items-center bg-white-100 w-[344px] dark:bg-gray-900 py-10 px-10',
          classname,
          {
            'rounded-[16px]': isRounded,
          },
        )}
      >
        <div className='h-14 w-14 mb-3 flex justify-center rounded-full bg-gray-50 dark:bg-gray-800'>
          <img src={src ?? defaultTokenLogo} className='' onError={imgOnError(defaultTokenLogo)} />
        </div>
        {heading && (
          <div
            className='text-base font-bold text-gray-800 text-center dark:text-gray-100'
            data-testing-id={props['data-testing-id']}
          >
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
