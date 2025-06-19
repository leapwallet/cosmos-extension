import { RewardsIcon } from 'icons/rewards-icon'
import { observer } from 'mobx-react-lite'
import React from 'react'

const BottomNavIcon = observer(() => {
  return (
    <div className='relative'>
      <RewardsIcon height={24} width={24} className='text-muted-foreground' />
    </div>
  )
})

export default BottomNavIcon
