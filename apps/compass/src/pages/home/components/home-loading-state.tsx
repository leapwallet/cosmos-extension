import { AggregatedLoadingList } from 'components/aggregated/AggregatedLoading'
import { BottomNavLabel } from 'components/bottom-nav/bottom-nav-items'
import BottomNav from 'components/bottom-nav/BottomNav'
import { useWalletInfo } from 'hooks'
import React from 'react'
import { cn } from 'utils/cn'

import { BalanceHeaderLoading } from './balance-header'
import { GeneralHomeHeader } from './general-home-header'
import { HomeButtons } from './index'

export const HomeLoadingState = () => {
  const { activeWallet } = useWalletInfo()

  if (!activeWallet) {
    return null
  }

  return (
    <>
      <div className='relative w-full overflow-auto panel-height'>
        <GeneralHomeHeader disableWalletButton />

        <div className={cn('w-full flex flex-col justify-center items-center mb-20 relative')}>
          <div className='w-full p-7 flex flex-col items-center justify-center'>
            <BalanceHeaderLoading watchWallet={activeWallet?.watchWallet} />
          </div>

          {!activeWallet?.watchWallet && <HomeButtons />}

          <div className='w-full px-4'>
            <AggregatedLoadingList />
          </div>
        </div>
      </div>

      <BottomNav label={BottomNavLabel.Home} disableLottie />
    </>
  )
}
