import { ProgressBar } from '@leapwallet/leap-ui'
import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import { Button } from 'components/ui/button'
import { Images } from 'images'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { isSidePanel } from 'utils/isSidePanel'

import CustomDivider from './CustomDivider'

function LightNodeSyncProgress({
  syncedPercentage,
  isLightNodeRunning,
  blockTime,
  network,
  onShareClick,
  latestHeader,
}: {
  syncedPercentage: number | null
  network: string
  blockTime: number
  latestHeader?: string
  isLightNodeRunning: boolean
  onShareClick: () => void
}) {
  const intervalId = useRef<any>(null)
  const blockTimerIntervalId = useRef<any>(null)
  const [timer, setTimer] = useState(blockTime)
  const [blockProgressPercentage, setBlockProgressPercentage] = useState(5)
  const formattedSyncedPercentage = new BigNumber(syncedPercentage ?? '0')
    .decimalPlaces(2)
    .toNumber()

  useEffect(() => {
    if (latestHeader) {
      setBlockProgressPercentage(5)
      intervalId.current = setInterval(() => {
        setBlockProgressPercentage((prev) => {
          // Cap the progress at 100%
          const nextProgress = prev + 95 / (blockTime * 20)
          return nextProgress > 100 ? 100 : nextProgress
        })
      }, 50)
    }
    return () => {
      if (intervalId.current) {
        clearInterval(intervalId.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestHeader, blockTime])

  useEffect(() => {
    if (latestHeader) {
      setTimer(blockTime)
      blockTimerIntervalId.current = setInterval(() => {
        setTimer((prev) => {
          if (prev === 1) {
            setTimer(blockTime)
            clearInterval(blockTimerIntervalId.current)
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => {
      if (blockTimerIntervalId.current) {
        clearInterval(blockTimerIntervalId.current)
      }
    }
  }, [latestHeader, blockTime])

  const progressToShow = useMemo(() => {
    if (isLightNodeRunning) {
      return blockProgressPercentage
    }
    return formattedSyncedPercentage
  }, [blockProgressPercentage, formattedSyncedPercentage, isLightNodeRunning])

  return (
    <section
      id='progress-block'
      className='rounded-xl bg-secondary-100 p-4 w-full flex flex-col gap-2 border-[#8f34ffa5] border bg-[linear-gradient(0deg,rgba(123,43,249,0.2),rgba(123,43,249,0.2)),radial-gradient(121.15%_122.06%_at_0%_0%,rgba(123,43,249,0.24)_0%,rgba(255,255,255,0)_100%)]'
    >
      <div className='flex flex-col gap-2'>
        <div className='flex justify-between items-center'>
          <div className='flex gap-1 items-center'>
            <img className='w-4 h-4' src={Images.Misc.Sampling} alt='sampling-icon' />
            <span className='text-sm font-bold'>
              Verifying{' '}
              {isLightNodeRunning ? (
                <>
                  block{' '}
                  <span className='text-green-500 mx-1'>
                    {latestHeader ? Number(latestHeader).toLocaleString('en-US') : ''}
                  </span>{' '}
                </>
              ) : (
                'paused'
              )}
            </span>
          </div>

          {isLightNodeRunning && (
            <Button variant={'mono'} size={'sm'} onClick={onShareClick}>
              Share
            </Button>
          )}
        </div>
      </div>

      <CustomDivider className='my-4' />

      <section
        id='light-node-progress-bar'
        className={classNames('flex', 'justify-center', {
          'side-panel': isSidePanel(),
          paused: !isLightNodeRunning,
        })}
      >
        <ProgressBar totalSteps={100} currentStep={progressToShow} color={'#8F34FF'} />
      </section>

      <CustomDivider className='my-4' />

      <div className='flex justify-between items-center'>
        <span className='text-xs text-black-300 dark:text-gray-200'>
          Network:{' '}
          <span className='text-xs font-bold dark:text-white-100 text-black-100'>
            Celestia {network}
          </span>
        </span>

        {isLightNodeRunning && (
          <div className='flex justify-end'>
            <span className='text-xs font-bold dark:text-white-100 text-black-100 mr-1'>
              ~{timer}s
            </span>{' '}
            <span className='text-xs text-black-300 dark:text-gray-400 font-bold'>
              for next block
            </span>
          </div>
        )}
      </div>
    </section>
  )
}

export default LightNodeSyncProgress
