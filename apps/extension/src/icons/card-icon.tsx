import { IconProps } from '@phosphor-icons/react'
import React from 'react'

export const CardIcon = (props: IconProps) => (
  <svg
    width='25'
    height='24'
    viewBox='0 0 25 24'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    {...props}
  >
    <g clipPath='url(#a1)'>
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M2.5 4.5C2.5 3.5335 3.2835 2.75 4.25 2.75H21.75C22.7165 2.75 23.5 3.5335 23.5 4.5V18.5C23.5 19.4665 22.7165 20.25 21.75 20.25H4.25C3.2835 20.25 2.5 19.4665 2.5 18.5V4.5ZM4.25 9.75V18.5H21.75V9.75H4.25ZM21.75 8H4.25V4.5H21.75V8ZM6 16.75H11.25V15H6V16.75Z'
        fill='currentColor'
      />
    </g>
    <defs>
      <clipPath id='a1'>
        <rect width='21' height='21' fill='currentColor' transform='translate(2.5 1)' />
      </clipPath>
    </defs>
  </svg>
)

export default CardIcon
