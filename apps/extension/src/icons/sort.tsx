import { Icon, IconBase, IconWeight } from '@phosphor-icons/react'
import React, { forwardRef, ReactElement } from 'react'

const weights = new Map<IconWeight, ReactElement>([
  [
    'regular',
    <React.Fragment key='regular'>
      <g clipPath='url(#clip0_241_1099)'>
        <path
          d='M3 12.75H14.0625'
          stroke='currentColor'
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M3 8.25H21'
          stroke='currentColor'
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M3 17.25H7.125'
          stroke='currentColor'
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </g>
      <defs>
        <clipPath id='clip0_241_1099'>
          <rect width='24' height='24' fill='currentColor' />
        </clipPath>
      </defs>
    </React.Fragment>,
  ],
  [
    'bold',
    <React.Fragment key='bold'>
      <g clipPath='url(#clip0_256_253)'>
        <path
          d='M3 12.75H14.0625'
          stroke='currentColor'
          strokeWidth='2.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M3 8.25H21'
          stroke='currentColor'
          strokeWidth='2.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M3 17.25H7.125'
          stroke='currentColor'
          strokeWidth='2.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </g>
      <defs>
        <clipPath id='clip0_256_253'>
          <rect width='24' height='24' fill='currentColor' />
        </clipPath>
      </defs>
    </React.Fragment>,
  ],
  [
    'fill',
    <path
      key='fill'
      fillRule='evenodd'
      clipRule='evenodd'
      d='M4 0H20C22.2091 0 24 1.79086 24 4V20C24 22.2091 22.2091 24 20 24H4C1.79086 24 0 22.2091 0 20V4C0 1.79086 1.79086 0 4 0ZM3 12C2.58579 12 2.25 12.3358 2.25 12.75C2.25 13.1642 2.58579 13.5 3 13.5H14.0625C14.4767 13.5 14.8125 13.1642 14.8125 12.75C14.8125 12.3358 14.4767 12 14.0625 12H3ZM2.25 8.25C2.25 7.83579 2.58579 7.5 3 7.5H21C21.4142 7.5 21.75 7.83579 21.75 8.25C21.75 8.66421 21.4142 9 21 9H3C2.58579 9 2.25 8.66421 2.25 8.25ZM3 16.5C2.58579 16.5 2.25 16.8358 2.25 17.25C2.25 17.6642 2.58579 18 3 18H7.125C7.53921 18 7.875 17.6642 7.875 17.25C7.875 16.8358 7.53921 16.5 7.125 16.5H3Z'
      fill='currentColor'
    />,
  ],
])

const Sort: Icon = forwardRef((props, ref) => (
  <IconBase viewBox='0 0 24 24' ref={ref} {...props} weights={weights} />
))

Sort.displayName = 'Sort'

export default Sort
