import { IconProps } from '@phosphor-icons/react'
import React from 'react'

export const SendIcon = (props: IconProps) => (
  <svg
    width='25'
    height='24'
    viewBox='0 0 25 24'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    {...props}
  >
    <g clipPath='url(#a1)'>
      <g clipPath='url(#a2)'>
        <path
          d='M23.1183 12L7.11749 3.27249C6.96173 3.18763 6.78295 3.15469 6.60718 3.17846C6.43139 3.20223 6.26778 3.28146 6.14015 3.40463C6.01252 3.52781 5.92751 3.6885 5.89751 3.86332C5.8675 4.03814 5.89407 4.21798 5.97333 4.37666L9.78499 12H23.1183Z'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinejoin='round'
        />
        <path
          d='M23.1183 12L7.11749 20.7275C6.96173 20.8123 6.78295 20.8453 6.60718 20.8215C6.43139 20.7978 6.26778 20.7185 6.14015 20.5953C6.01252 20.4722 5.92751 20.3115 5.89751 20.1367C5.8675 19.9618 5.89407 19.782 5.97333 19.6233L9.78499 12H23.1183Z'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinejoin='round'
        />
      </g>
    </g>
    <defs>
      <clipPath id='a1'>
        <rect width='24' height='24' fill='currentColor' transform='translate(0.5)' />
      </clipPath>
      <clipPath id='a2'>
        <rect width='20' height='20' fill='currentColor' transform='translate(4.5 2)' />
      </clipPath>
    </defs>
  </svg>
)
