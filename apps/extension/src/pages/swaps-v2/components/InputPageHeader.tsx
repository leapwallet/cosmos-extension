import { Buttons, LineDivider } from '@leapwallet/leap-ui'
import { ArrowClockwise, GearSix } from '@phosphor-icons/react'
import classNames from 'classnames'
import React, { useCallback, useState } from 'react'

type InputPageHeaderProps = {
  onBack: () => void
  onRefresh: () => void
  onSettings: () => void
  topColor: string
}

function InputPageHeader({ onBack, onRefresh, onSettings, topColor }: InputPageHeaderProps) {
  const [animate, setAnimate] = useState<boolean>(false)

  const handleRefreshClick = useCallback(() => {
    onRefresh()
    setAnimate(true)
    setTimeout(() => {
      setAnimate(false)
    }, 700)
  }, [onRefresh])

  return (
    <div className='w-[400px] h-[72px]'>
      <div className='absolute w-full h-1 left-0 top-0' style={{ backgroundColor: topColor }} />
      <div className='relative h-[71px] w-full flex justify-center items-center '>
        <div className='absolute top-6 left-6'>
          <Buttons.Back onClick={onBack} />
        </div>
        <div className='font-bold text-black-100 dark:text-white-100 text-lg !leading-[28px]'>
          Swap
        </div>
        <div className='absolute top-6 right-6 flex justify-end items-center gap-4'>
          <button
            onClick={handleRefreshClick}
            className={classNames('text-black-100 dark:text-white-100', {
              'animate-[spin_500ms_linear_0.7]': animate,
            })}
          >
            <ArrowClockwise size={20} className='!leading-[24px]' />
          </button>
          <button onClick={onSettings} className='text-black-100 dark:text-white-100'>
            <GearSix size={20} className='!leading-[24px]' />
          </button>
        </div>
      </div>
      <LineDivider />
    </div>
  )
}

export default InputPageHeader
