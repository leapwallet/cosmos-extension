import classNames from 'classnames'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import React, { PropsWithoutRef, ReactNode } from 'react'
import { imgOnError } from 'utils/imgOnError'

export type EmptyCardProps = {
  src: string
  heading?: ReactNode
  subHeading?: ReactNode
  classname?: string
  logoClassName?: string
  imgContainerClassname?: string
  isRounded?: boolean
  'data-testing-id'?: string
}

export function EmptyCard(props: PropsWithoutRef<EmptyCardProps>) {
  const defaultTokenLogo = useDefaultTokenLogo()
  const { src, heading, subHeading, isRounded = true, classname, imgContainerClassname } = props

  return (
    <>
      <div
        className={classNames('flex flex-col items-center py-10 px-10', classname, {
          'rounded-[16px]': isRounded,
        })}
      >
        <div
          className={classNames(
            'h-14 w-14 mb-3 flex justify-center rounded-full bg-gray-50 dark:bg-gray-900',
            imgContainerClassname,
          )}
        >
          <img
            src={src ?? defaultTokenLogo}
            className={props.logoClassName}
            onError={imgOnError(defaultTokenLogo)}
          />
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
