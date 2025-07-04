import { AggregatedLoadingList } from 'components/aggregated/AggregatedLoading'
import { BottomNavLabel } from 'components/bottom-nav/bottom-nav-items'
import { BottomNav } from 'components/bottom-nav/v2'
import { Button } from 'components/ui/button'
import { useWalletInfo } from 'hooks'
import { SearchIcon } from 'icons/search-icon'
import React from 'react'
import Skeleton from 'react-loading-skeleton'
import { cn } from 'utils/cn'

import { BalanceHeaderLoading } from './balance-header'
import { GeneralHomeHeader } from './general-home-header'
import { HomeButtons } from './index'

export function BannersLoading() {
  return (
    <div className='flex flex-col px-6 w-full mb-5'>
      <Skeleton
        className='w-full h-[64px]'
        containerClassName='block !leading-none rounded-xl overflow-hidden'
      />
      <div className='flex w-full items-center px-4 justify-center mt-1 h-[17px]'>
        <Skeleton containerClassName='block !leading-none h-[5px] rounded-full w-[20px] overflow-hidden' />
      </div>
    </div>
  )
}

export const HomeLoadingState = () => {
  const { activeWallet } = useWalletInfo()

  if (!activeWallet) {
    return null
  }

  return (
    <>
      <div className='relative w-full overflow-auto panel-height'>
        <GeneralHomeHeader disableWalletButton isLoading />

        <div className={cn('w-full flex flex-col justify-center items-center mb-20 relative')}>
          <div className='w-full p-8 flex flex-col items-center justify-center'>
            <BalanceHeaderLoading watchWallet={activeWallet?.watchWallet} />
          </div>

          {!activeWallet?.watchWallet && <HomeButtons skipVote />}

          <BannersLoading />

          <header className='flex items-center justify-between mb-3 w-full px-5'>
            <span className='text-sm font-bold'>Your tokens</span>

            <div className='flex items-center gap-3'>
              <Button
                variant='secondary'
                size='icon'
                onClick={() => {
                  //
                }}
                className='p-1.5 h-auto bg-secondary-100 hover:bg-secondary-200'
              >
                <SearchIcon className='size-4' />
                <span className='sr-only'>Search tokens</span>
              </Button>
            </div>
          </header>

          <div className='w-full px-5'>
            <AggregatedLoadingList />
          </div>
        </div>
      </div>

      <BottomNav label={BottomNavLabel.Home} disableLottie />
    </>
  )
}
