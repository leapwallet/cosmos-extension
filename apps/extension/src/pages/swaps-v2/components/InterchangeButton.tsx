import classNames from 'classnames'
import { SwapVert } from 'images/misc'
import React, { useState } from 'react'

type InterchangeButtonProps = {
  isSwitchOrderPossible: boolean
  handleSwitchOrder: () => void
}

export function InterchangeButton({
  isSwitchOrderPossible,
  handleSwitchOrder,
}: InterchangeButtonProps) {
  const [animate, setAnimate] = useState<boolean>(false)

  const handleBtnClick = () => {
    handleSwitchOrder()
    setAnimate(true)
    setTimeout(() => {
      setAnimate(false)
    }, 600)
  }

  return (
    <div
      className={classNames(
        'w-[44px] h-[44px] relative rounded-full bg-white-100 dark:bg-gray-950 flex items-center justify-center border-4 border-gray-50 dark:border-black-100 -mt-[18px] -mb-[18px]',
        { 'cursor-pointer': isSwitchOrderPossible },
      )}
      onClick={handleBtnClick}
    >
      <img
        src={SwapVert}
        className={classNames('invert dark:invert-0 h-[20px] w-[20px]', {
          'animate-[spin_500ms_linear_0.5]': animate,
        })}
      />
    </div>
  )
}
