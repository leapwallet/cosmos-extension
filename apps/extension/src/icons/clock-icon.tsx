import { IconProps } from '@phosphor-icons/react'
import React from 'react'

export const ClockIcon = (props: IconProps) => {
  return (
    <svg
      width='18'
      height='18'
      viewBox='0 0 18 18'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      {...props}
    >
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M1.5 9C1.5 4.85786 4.85786 1.5 9 1.5C13.1421 1.5 16.5 4.85786 16.5 9C16.5 13.1421 13.1421 16.5 9 16.5C4.85786 16.5 1.5 13.1421 1.5 9ZM9 0C4.02944 0 0 4.02944 0 9C0 13.9705 4.02944 18 9 18C13.9705 18 18 13.9705 18 9C18 4.02944 13.9705 0 9 0ZM8.25 3.75V9C8.25 9.17033 8.30797 9.33555 8.41432 9.46852L11.4143 13.2185L12.5857 12.2815L9.75 8.7369V3.75H8.25Z'
        fill='currentColor'
      />
    </svg>
  )
}
