import { ArrowSquareOut } from '@phosphor-icons/react'
import BigNumber from 'bignumber.js'
import Text from 'components/text'
import React from 'react'

import CustomDivider from './CustomDivider'
import SquareVisualization from './SquareVisualization'

function LightNodeInfo({
  latestHeader,
  events,
  syncedPercentage,
}: {
  latestHeader: string | null
  events: any | null
  syncedPercentage: number | null
}) {
  const formattedSyncedPercentage = new BigNumber(syncedPercentage ?? '0')
    .decimalPlaces(2)
    .toNumber()

  return (
    <>
      <CustomDivider />
      <section className='flex flex-col gap-3 mt-1'>
        <div className='flex justify-between'>
          <Text size='sm' color='dark:text-gray-200 text-black-200'>
            Fetching past headers
          </Text>
          <Text size='sm' className='font-bold'>
            {formattedSyncedPercentage}%
          </Text>
        </div>
        <div className='flex justify-between'>
          <Text size='sm' color='dark:text-gray-200 text-black-200'>
            Latest Celestia Block
          </Text>
          <Text size='sm' className='font-bold'>
            {latestHeader ?? '-'}
          </Text>
        </div>

        <div className='flex gap-1 items-center'>
          <Text size='sm' color='dark:text-gray-200 text-black-200'>
            Square Visualization
          </Text>
          {latestHeader && (
            <Text size='xs' color='text-gray-400'>
              for {latestHeader}
            </Text>
          )}
        </div>

        <SquareVisualization events={events} />
      </section>
    </>
  )
}

export default LightNodeInfo
