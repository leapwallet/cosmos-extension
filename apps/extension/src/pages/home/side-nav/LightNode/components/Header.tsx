import { Buttons, LineDivider } from '@leapwallet/leap-ui'
import { GearSix } from '@phosphor-icons/react'
import { BetaTag } from 'components/BetaTag/BetaTag'
import Text from 'components/text'
import React from 'react'

type LightNodeHeaderProps = {
  onBack: () => void
  onSettings: () => void
  showSettings?: boolean
}

function LightNodeHeader({ onBack, onSettings, showSettings }: LightNodeHeaderProps) {
  return (
    <div className='w-[400px] h-[72px]'>
      <div className='absolute w-full h-1 left-0 top-0' />
      <div className='relative h-[71px] w-full flex justify-center items-center '>
        <div className='absolute top-6 left-6'>
          <Buttons.Back onClick={onBack} />
        </div>
        <div className='flex items-center gap-1'>
          <Text size='md'>Celestia Light Node</Text>
          <BetaTag className='relative' />
        </div>
        {showSettings && (
          <div className='absolute top-6 right-6 flex justify-end items-center gap-4'>
            <button onClick={onSettings} className='text-black-100 dark:text-white-100'>
              <GearSix size={20} className='!leading-[24px]' />
            </button>
          </div>
        )}
      </div>
      <LineDivider />
    </div>
  )
}

export default LightNodeHeader
