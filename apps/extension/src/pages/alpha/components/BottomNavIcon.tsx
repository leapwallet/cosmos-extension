import { Fire } from '@phosphor-icons/react'
import { useAlphaOpportunities } from 'hooks/useAlphaOpportunities'
import { observer } from 'mobx-react-lite'
import React, { useEffect, useState } from 'react'

import { unreadAlphaStore } from '../../../stores/unread-alpha-store'

const BottomNavIcon = observer(() => {
  const { opportunities } = useAlphaOpportunities()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (opportunities?.length) {
      const count = unreadAlphaStore.getUnreadCount(opportunities.map((opp) => opp.id || ''))
      setUnreadCount(count)
    }
  }, [opportunities, unreadAlphaStore.readItems])

  return (
    <div className='relative'>
      <Fire size={22} weight='fill' />
      {unreadCount > 0 && (
        <div className='absolute -top-1 -right-1 bg-green-600 text-white text-[10px] font-semibold rounded-full min-w-[14px] h-[14px] flex items-center justify-center px-[2px]'>
          {unreadCount > 99 ? '99+' : unreadCount}
        </div>
      )}
    </div>
  )
})

export default BottomNavIcon
