import { Buttons, LineDivider } from '@leapwallet/leap-ui'
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
            className={classNames(
              'material-icons-round !text-xl !leading-[24px] text-black-100 dark:text-white-100',
              {
                'animate-[spin_500ms_linear_0.7]': animate,
              },
            )}
          >
            refresh
          </button>
          <button
            onClick={onSettings}
            className='material-icons-outlined !text-xl !leading-[24px] text-black-100 dark:text-white-100'
          >
            settings
          </button>
        </div>
      </div>
      <LineDivider />
    </div>
  )
}

export default InputPageHeader
