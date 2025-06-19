import { AggregatedLoadingList } from 'components/aggregated/AggregatedLoading'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { useChainInfos } from 'hooks/useChainInfos'
import React from 'react'
import { AggregatedSupportedChain } from 'types/utility'

import { ActivityHeader } from './components/activity-header'

export const ActivityPageLoader = () => {
  const activeChain = useActiveChain() as AggregatedSupportedChain
  const chains = useChainInfos()

  const selectedChain = activeChain === 'aggregated' ? chains?.cosmos?.key : activeChain

  return (
    <>
      <ActivityHeader />
      <div className='flex flex-col pt-8 px-6 pb-6 mb-16'>
        <h1 className='flex items-center justify-between text-black-100 dark:text-white-100'>
          <div className='flex flex-col items-start justify-start'>
            <span className='text-[24px] font-[700]'>Activity</span>
            <span className='text-[12px] font-[500] text-gray-600 dark:text-gray-400'>
              {chains[selectedChain]?.chainName ?? 'Unknown Chain'}
            </span>
          </div>
        </h1>

        <AggregatedLoadingList className='mt-4' />
      </div>
    </>
  )
}
