import loadingImage from 'lottie-files/loading.json'
import Lottie, { LottieOptions } from 'lottie-react'
import React from 'react'
import { ReactElement } from 'react'

export type LoaderProps = {
  /** Big text shown below GIF. */
  readonly title?: string
  readonly color?: string
}

const defaultOptions: LottieOptions = {
  loop: true,
  autoplay: true,
  animationData: loadingImage,
  rendererSettings: {
    preserveAspectRatio: 'xMidYMid slice',
  },
}

export const LoaderAnimation = ({ color, className }: { color: string; className?: string }) => {
  return (
    <Lottie {...defaultOptions} style={{ color: color }} className={className ?? 'h-12 w-12'} />
  )
}

export default function Loader({ title, color }: LoaderProps): ReactElement {
  return (
    <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'>
      <LoaderAnimation color={color as string} />
      {title && <div className='text-base font-bold text-gray-600 dark:text-gray-200'>{title}</div>}
    </div>
  )
}
