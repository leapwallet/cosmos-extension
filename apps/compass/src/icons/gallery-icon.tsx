import { IconProps } from '@phosphor-icons/react'
import React from 'react'

export const GalleryIcon = (props: IconProps) => {
  return (
    <svg
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      {...props}
    >
      <path
        d='M9 12C10.1046 12 11 11.1046 11 10C11 8.89543 10.1046 8 9 8C7.89543 8 7 8.89543 7 10C7 11.1046 7.89543 12 9 12ZM21.5 6.5L12 1L2.5 6.5V17.5L12 23L21.5 17.5V6.5ZM12 3.311L19.5 7.65311V14.5338L14.9379 11.7966L6.96669 17.775L4.5 16.3469V7.65311L12 3.311ZM12 20.689L8.84788 18.8641L15.0621 14.2034L19.0595 16.6019L12 20.689Z'
        fill='currentColor'
      />
    </svg>
  )
}
