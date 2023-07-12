import { ActivityCardContent, TxResponse } from '@leapwallet/cosmos-wallet-hooks'
import { CardDivider } from '@leapwallet/leap-ui'
import type { ParsedTransaction } from '@leapwallet/parser-parfait'
import { EmptyCard } from 'components/empty-card'
import dayjs from 'dayjs'
import { Images } from 'images'
import loadingImage from 'images/misc/loading.json'
import Lottie from 'lottie-react'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { sliceSearchWord } from 'utils/strings'

import TokenCardSkeleton from '../../components/Skeletons/TokenCardSkeleton'
import { SelectedTx } from './Activity'
import { ActivityCard } from './ActivityCard'
import PendingTxCard from './PendingTxCard'

const defaultOptions = {
  loop: true,
  autoplay: true,
  animationData: loadingImage,
  rendererSettings: {
    preserveAspectRatio: 'xMidYMid slice',
  },
}

export type ActivityListProps = {
  txResponse: TxResponse
  setSelectedTx: React.Dispatch<React.SetStateAction<SelectedTx | null>>
}

export function ActivityList({ txResponse, setSelectedTx }: ActivityListProps) {
  const [assetFilter, setAssetFilter] = useState<string>('')
  const handleFilterChange = (event: React.FormEvent<HTMLInputElement>) => {
    setAssetFilter(event.currentTarget.value.toLowerCase())
  }

  const { activity, done, more, next } = txResponse
  const [observer, setObserver] = useState<IntersectionObserver>()
  const loader = useRef(null)

  useEffect(() => {
    const options = {
      root: document.getElementById('root'),
      threshold: 0.5,
    }
    const handleObserver = (entities: IntersectionObserverEntry[]) => {
      const target = entities[0]
      if (target?.isIntersecting) {
        if (!done && more) more()
      }
    }

    // initialize IntersectionObserver
    // and attaching to Load More div
    if (more) {
      if (observer) observer.disconnect()
      const newObserver = new IntersectionObserver(handleObserver, options)
      if (loader.current) newObserver.observe(loader.current)
      setObserver(newObserver)
    }
    // eslint-disable-next-line
  }, [next])

  const sections = useMemo(() => {
    const txsByDate = activity
      ?.filter((tx) => {
        return tx.content.title1.toLowerCase().includes(assetFilter)
      })
      .reduce(
        (
          acc: Record<string, { parsedTx: ParsedTransaction; content: ActivityCardContent }[]>,
          tx,
        ) => {
          if (!tx.parsedTx) return acc

          const date = dayjs(tx.parsedTx.timestamp).format('MMMM DD')
          if (acc[date]) {
            acc[date].push(tx)
          } else {
            acc = { ...acc, [date]: [tx] }
          }
          return acc
        },
        {},
      )
    return Object.entries(txsByDate ?? {}).map((entry) => ({ title: entry[0], data: entry[1] }))
  }, [activity, assetFilter])

  if (activity?.length === 0 && !txResponse.loading) {
    return (
      <div className='flex flex-col justify-center h-[350px]'>
        <PendingTxCard />
        <EmptyCard
          src={Images.Activity.ActivityIcon}
          heading='No activity'
          subHeading='Your activity will appear here'
        />
      </div>
    )
  }

  if (txResponse.error) {
    return (
      <div className='flex flex-col justify-center h-[350px]'>
        <EmptyCard src={Images.Activity.ActivityIcon} heading='Unable to fetch activity' />
      </div>
    )
  }

  return (
    <div className=''>
      <div className='w-[344px] flex h-10 bg-white-100 dark:bg-gray-900 rounded-[30px] py-2 pl-5 pr-[10px] mb-7'>
        <input
          placeholder='search activity...'
          className='flex flex-grow text-base text-gray-600 dark:text-gray-400 outline-none bg-white-0'
          onChange={handleFilterChange}
          disabled={txResponse.loading}
        />
        <img src={Images.Misc.SearchIcon} onClick={more} />
      </div>
      <div className='pb-24'>
        <PendingTxCard />
        {txResponse.loading && (
          <div className='rounded-2xl dark:bg-gray-900 bg-white-100'>
            <TokenCardSkeleton />
            <TokenCardSkeleton />
          </div>
        )}
        {!txResponse.loading && sections.length === 0 && (
          <EmptyCard
            isRounded
            subHeading='Please try again with something else'
            heading={'No results for “' + sliceSearchWord(assetFilter) + '”'}
            src={Images.Misc.FlashOn}
          />
        )}
        {!txResponse.loading &&
          sections.map(({ data, title }, index) => {
            return (
              <div className='mt-7' key={`${title}_${index}`} id='activity-list'>
                <div className='font-bold text-sm text-gray-600 dark:text-gray-200 mb-2'>
                  {title}
                </div>
                <div className='rounded-2xl overflow-hidden bg-white-100 dark:bg-gray-900'>
                  {data.map((tx, index) => (
                    <React.Fragment key={tx.parsedTx.txHash}>
                      {index !== 0 && <CardDivider />}
                      <ActivityCard
                        content={tx.content}
                        onClick={() => setSelectedTx(tx)}
                        isSuccessful={tx.parsedTx.code === 0}
                      />
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )
          })}
        {activity.length > 0 && !done && (
          <div ref={loader} className='flex justify-center'>
            <Lottie {...defaultOptions} style={{ height: '48px', width: '48px' }} />
          </div>
        )}
      </div>
    </div>
  )
}
