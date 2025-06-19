import { Images } from 'images'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { globalSheetsStore } from 'stores/global-sheets-store'
import { lightNodeStore } from 'stores/light-node-store'
import { cn } from 'utils/cn'

type Props = {
  className?: string
}

export const LightNodeRunningIndicator = observer(({ className }: Props) => {
  if (!lightNodeStore.isLightNodeRunning) {
    return null
  }

  return (
    <button
      className={cn(
        'py-2 pl-3 pr-2 rounded-l-[30px] cursor-pointer bg-gray-300/10 absolute top-12 right-0',
        className,
      )}
      onClick={() => {
        globalSheetsStore.toggleSideNav({
          openLightNodePage: true,
        })
      }}
    >
      <img className='w-4 h-4' src={Images.Misc.Sampling} alt='sampling-icon' />
    </button>
  )
})
