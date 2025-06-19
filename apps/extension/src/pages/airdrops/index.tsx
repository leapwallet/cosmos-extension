import { PageName } from 'config/analytics'
import { usePageView } from 'hooks/analytics/usePageView'
import React from 'react'

import { AirdropsHeader } from './AirdropsHeader'
import AirdropsHome from './AirdropsHome'

export default function Airdrops() {
  // usePageView(PageName.Airdrops)

  return (
    <div className='relative h-full w-full enclosing-panel bg-secondary-50 overflow-y-auto'>
      <AirdropsHeader />
      <div className='p-7 h-[calc(100%-64px)]'>
        <AirdropsHome />
      </div>
    </div>
  )
}
