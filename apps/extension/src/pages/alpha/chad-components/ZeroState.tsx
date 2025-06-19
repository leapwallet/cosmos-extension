import classNames from 'classnames'
import Text from 'components/text'
import { Images } from 'images'
import React from 'react'

/**
 * @description This state is when user visits this page for the first time
 * or if they have not previously interacted, they are asked to click on
 * "Join Exclusives" button to get started and check their eligibility.
 */

interface EmptyBookmarksProps {
  title: string
  subTitle: string | React.ReactNode
  className?: string
  showRetryButton?: boolean
}

export default function ZeroStatePlaceholder({
  title,
  subTitle,
  className = '',
}: EmptyBookmarksProps) {
  return (
    <div
      className={classNames(
        'bg-white-100 dark:bg-gray-950 rounded-xl pt-8 p-4 flex flex-col items-center',
        className,
      )}
    >
      <img src={Images.Misc.FrogSad} alt='FrogSad' className='mb-6' />
      <Text size='sm' className='font-bold mb-1'>
        {title}
      </Text>
      <Text
        size='xs'
        color='text-gray-800 dark:text-gray-200'
        className='font-medium text-center !leading-5'
      >
        {subTitle}
      </Text>
    </div>
  )
}
