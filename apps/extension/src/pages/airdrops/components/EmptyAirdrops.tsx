import { Buttons } from '@leapwallet/leap-ui'
import { ArrowCounterClockwise } from '@phosphor-icons/react'
import { captureException } from '@sentry/react'
import classNames from 'classnames'
import Loader from 'components/loader/Loader'
import Text from 'components/text'
import { ButtonName, ButtonType, EventName } from 'config/analytics'
import { useAirdropsData } from 'hooks/useAirdropsData'
import { Images } from 'images'
import mixpanel from 'mixpanel-browser'
import React, { useState } from 'react'

import GoToLeapboard from './GoToLeapboard'

interface EmptyAirdropsProps {
  title: string
  subTitle: string | React.ReactNode
  className?: string
  showLeapBoardButton?: boolean
  showRetryButton?: boolean
}

export default function EmptyAirdrops({
  title,
  subTitle,
  className = '',
  showRetryButton = false,
  showLeapBoardButton = false,
}: EmptyAirdropsProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [numberOfRetries, setNumberOfRetries] = useState<number>(1)
  const fetchAirdropsData = useAirdropsData()

  const trackCTAEvent = () => {
    try {
      mixpanel.track(EventName.ButtonClick, {
        buttonType: ButtonType.AIRDROPS,
        buttonName: ButtonName.RETRY_AIRDROP,
        redirectURL: '',
        numberOfRetries,
        time: Date.now() / 1000,
      })
    } catch (e) {
      captureException(e)
    }
  }

  const onRetry = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
    }, 10000)
    setNumberOfRetries((prevState) => prevState + 1)
    fetchAirdropsData()
    trackCTAEvent()
  }

  return (
    <div
      className={classNames(
        'bg-white-100 dark:bg-gray-950 rounded-xl pt-8 p-4 flex flex-col items-center',
        className,
      )}
    >
      {isLoading ? (
        <div className='flex justify-center items-center min-h-[208px]'>
          <Loader />
          <Text className='mt-16'>Loading Airdrop</Text>
        </div>
      ) : (
        <>
          <img src={Images.Misc.FrogSad} alt='FrogSad' className='mb-6' />
          <Text size='sm' className='font-bold mb-1'>
            {title}
          </Text>
          <Text
            size='xs'
            color='text-gray-800 dark:text-gray-200'
            className='font-medium text-center !leading-5'
          >
            {subTitle}
          </Text>
        </>
      )}
      {showLeapBoardButton && <GoToLeapboard className='!w-full justify-center !p-3 !mt-6' />}
      {showRetryButton && (
        <Buttons.Generic
          size='normal'
          className='w-full mt-6 !bg-black-100 dark:!bg-white-100 text-white-100 dark:text-black-100'
          title={'Retry'}
          disabled={isLoading}
          onClick={onRetry}
        >
          {isLoading ? (
            'Loading'
          ) : (
            <div className='flex items-center gap-2'>
              Retry
              <ArrowCounterClockwise
                size={20}
                className='text-white-100 dark:text-black-100'
                style={{ transform: 'rotateY(180deg)' }}
              />
            </div>
          )}
        </Buttons.Generic>
      )}
    </div>
  )
}
