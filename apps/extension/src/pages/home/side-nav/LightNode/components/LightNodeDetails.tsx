import BigNumber from 'bignumber.js'
import { Separator } from 'components/ui/separator'
import { ExternalLinkIcon } from 'icons/external-link'
import React, { useMemo } from 'react'

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
  const infoItems = useMemo(() => {
    const formattedSyncedPercentage = new BigNumber(syncedPercentage ?? '0')
      .decimalPlaces(2)
      .toNumber()

    return [
      {
        label: 'Fetching past headers',
        value: `${formattedSyncedPercentage}%`,
      },
      {
        label: 'Latest Celestia Block',
        value: latestHeader ?? '-',
      },
    ]
  }, [latestHeader, syncedPercentage])

  return (
    <>
      <Separator className='mb-3' />

      <section className='flex flex-col gap-3 mt-1'>
        {infoItems.map((item, index) => (
          <div key={index} className='flex justify-between'>
            <span className='text-sm font-medium'>{item.label}</span>
            <span className='text-sm font-bold'>{item.value}</span>
          </div>
        ))}

        <div className='flex gap-1 items-center'>
          <span className='text-sm font-medium'>Square Visualization</span>
          {latestHeader && <span className='text-xs text-gray-400'>for {latestHeader}</span>}
        </div>

        <SquareVisualization events={events} />

        <Separator />

        <a
          target='_blank'
          rel='noreferrer noopener'
          href={`https://celenium.io/block/${latestHeader}`}
          className='flex gap-1 items-center justify-center cursor-pointer text-secondary-800'
        >
          <ExternalLinkIcon className='w-4 h-4' />
          <span className='text-sm font-medium'>View in Explorer</span>
        </a>
      </section>
    </>
  )
}

export default LightNodeInfo
