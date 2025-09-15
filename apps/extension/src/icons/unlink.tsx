import { IconProps } from '@phosphor-icons/react'
import React from 'react'

export const UnlinkIcon = (props: IconProps) => {
  const { size = 16, ...restProps } = props

  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 16 17'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      {...restProps}
    >
      <g>
        <path
          d='M5.09652 8.271L3.84852 9.51793C3.43308 9.93358 3.19971 10.4972 3.19971 11.0849C3.19971 11.6725 3.43308 12.2361 3.84852 12.6518C4.26417 13.0672 4.82779 13.3006 5.41546 13.3006C6.00312 13.3006 6.56674 13.0672 6.98239 12.6518L7.73866 11.8945'
          stroke='currentColor'
        />
        <path
          d='M9.56697 10.0668L12.1515 7.48228C12.5518 7.06361 12.7724 6.50486 12.7659 5.92562C12.7594 5.34638 12.5264 4.7927 12.1168 4.38309C11.7072 3.97349 11.1535 3.74051 10.5743 3.73403C9.99507 3.72754 9.43631 3.94808 9.01764 4.34842L6.43311 6.93295'
          stroke='currentColor'
        />
        <path d='M3.19995 3.69971L12.8 13.2997' stroke='currentColor' />
      </g>
      <defs>
        <clipPath id='clip0_6419_1884'>
          <rect
            width='10.6667'
            height='10.6667'
            fill='white'
            transform='translate(2.66675 3.1665)'
          />
        </clipPath>
      </defs>
    </svg>
  )
}
