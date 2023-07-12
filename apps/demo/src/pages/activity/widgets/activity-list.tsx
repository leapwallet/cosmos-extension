import { Activity, ActivityCardContent } from '@leapwallet/cosmos-wallet-hooks'
import { ParsedTx } from '@leapwallet/cosmos-wallet-sdk'
import dayjs from 'dayjs'
import { Images } from 'images'
import React, { Dispatch, SetStateAction, useMemo, useState } from 'react'

import CardDivider from '~/components/card-divider'

import ActivityCard from './activity-card'
import PendingTxCard from './pending-tx-card'

export type ActivityListProps = {
  activity: Activity[]
  setSelectedActivity: Dispatch<
    SetStateAction<{ parsedTx: ParsedTx; content: ActivityCardContent }>
  >
}

export function ActivityList({ activity, setSelectedActivity }: ActivityListProps) {
  const [assetFilter, setAssetFilter] = useState<string>('')

  const handleFilterChange = (event: React.FormEvent<HTMLInputElement>) => {
    setAssetFilter(event.currentTarget.value.toLowerCase())
  }

  const sections = useMemo(() => {
    const txsByDate = activity
      .filter((tx) => tx.content.title1.toLowerCase().includes(assetFilter))
      .reduce((acc: Record<string, Activity[]>, tx) => {
        if (!tx.parsedTx) return acc

        const date = dayjs(tx.parsedTx.timestamp).format('MMMM DD')
        if (acc[date]) {
          acc[date].push(tx)
        } else {
          acc = { ...acc, [date]: [tx] }
        }
        return acc
      }, {})

    return Object.entries(txsByDate).map(([title, data]) => ({ title, data }))
  }, [activity, assetFilter])

  return (
    <>
      <div className='w-full flex h-10 bg-white-100 dark:bg-gray-900 rounded-[30px] py-2 pl-5 pr-[10px] mb-7'>
        <input
          placeholder='search activity...'
          className='flex flex-grow text-base text-gray-600 dark:text-gray-400 outline-none bg-white-0'
          onChange={handleFilterChange}
        />
        <img src={Images.Misc.SearchIcon} />
      </div>
      <div className='w-full space-y-4'>
        <PendingTxCard />
        {sections.map(({ data, title }) => {
          return (
            <div key={title} id='activity-list'>
              <div className='font-bold text-sm text-gray-600 dark:text-gray-200 mb-2'>{title}</div>
              <div className='rounded-2xl overflow-hidden bg-white-100 dark:bg-gray-900'>
                {data.map((activity, index) => (
                  <>
                    {index !== 0 && <CardDivider />}
                    <ActivityCard
                      content={activity.content}
                      key={activity.parsedTx.txhash}
                      onClick={() => setSelectedActivity(activity)}
                    />
                  </>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
