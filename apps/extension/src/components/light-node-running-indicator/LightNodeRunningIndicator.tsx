import classNames from 'classnames'
import { Images } from 'images'
import React from 'react'

type Props = {
  className?: string
}

export const LightNodeRunningIndicator = ({ className }: Props) => {
  return (
    <div
      className={classNames('py-2 pl-3 pr-2 rounded-l-[30px] cursor-pointer bg-gray-300/10', {
        [className as string]: !!className,
      })}
    >
      <img className='w-4 h-4' src={Images.Misc.Sampling} alt='sampling-icon' />
    </div>
  )
}
