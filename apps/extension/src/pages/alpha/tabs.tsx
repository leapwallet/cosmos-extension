import React from 'react'

import AlphaHome from './AlphaHome'
import ChadExclusives from './ChadExclusives'

export const Tabs = (props: { activeTab: string }) => {
  const { activeTab } = props

  return (
    <div className='overflow-y-auto' style={{ height: 'calc(100% - 72px - 30px - 41px)' }}>
      {activeTab === 'all' ? <AlphaHome /> : <ChadExclusives />}
    </div>
  )
}
