import { useInvestData } from '@leapwallet/cosmos-wallet-hooks'
import { ErrorCard } from 'components/ErrorCard'
import React from 'react'

import { DisplaySettings } from '../types'
import { InvestView } from './invest-view'

type InvestViewContainerProps = {
  displaySettings: DisplaySettings
}

const InvestViewContainer: React.FC<InvestViewContainerProps> = ({ displaySettings }) => {
  const investData = useInvestData()

  if (investData.status === 'loading') {
    return (
      <div>
        <div>
          <div className='inline-block !h-5 !w-20 rounded-md animate-pulse bg-gray-100 dark:bg-gray-900' />
          <div className='mt-2 rounded-2xl overflow-hidden'>
            <div className='h-11 w-full !m-0 rounded-t-2xl animate-pulse bg-gray-100 dark:bg-gray-900' />
            <div className='border-t border-t-gray-900 !m-0' />
            <div className='h-11 w-full !m-0 animate-pulse bg-gray-100 dark:bg-gray-900' />
            <div className='border-t border-t-gray-900 !m-0' />
            <div className='h-11 w-full !m-0 rounded-b-2xl animate-pulse bg-gray-100 dark:bg-gray-900' />
          </div>
        </div>
        <div className='mt-4'>
          <div className='inline-block !h-5 !w-20 rounded-md animate-pulse bg-gray-100 dark:bg-gray-900' />
          <div className='mt-2 rounded-2xl overflow-hidden'>
            <div className='h-11 w-full !m-0 rounded-t-2xl animate-pulse bg-gray-100 dark:bg-gray-900' />
            <div className='border-t border-t-gray-900 !m-0' />
            <div className='h-11 w-full !m-0 rounded-b-2xl animate-pulse bg-gray-100 dark:bg-gray-900' />
          </div>
        </div>
      </div>
    )
  }

  if (investData.status === 'error') {
    return <ErrorCard text={investData.error.message} />
  }

  return <InvestView data={investData.data} displaySettings={displaySettings} />
}

export default InvestViewContainer
