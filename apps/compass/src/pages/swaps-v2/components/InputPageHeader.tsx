import { Buttons, LineDivider } from '@leapwallet/leap-ui'
import { Faders } from '@phosphor-icons/react'
import Text from 'components/text'
import React from 'react'

import { useSwapContext } from '../context'

type InputPageHeaderProps = {
  onBack: () => void
  onRefresh: () => void
  onSettings: () => void
  topColor: string
}

function InputPageHeader({ onBack, onRefresh, onSettings, topColor }: InputPageHeaderProps) {
  const { slippagePercent } = useSwapContext()

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
            onClick={onSettings}
            className='text-black-100 dark:text-white-100 flex items-center gap-x-0.5'
          >
            <Faders
              size={24}
              className='!leading-[24px] rotate-90 text-muted-foreground hover:text-foreground'
            />
            <Text size='sm' className='font-bold'>
              {slippagePercent}%
            </Text>
          </button>
        </div>
      </div>
      <LineDivider />
    </div>
  )
}

export default InputPageHeader
