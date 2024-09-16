import { useAirdropsEligibilityData } from '@leapwallet/cosmos-wallet-hooks'
import { Buttons } from '@leapwallet/leap-ui'
import { ArrowCounterClockwise } from '@phosphor-icons/react'
import { captureException } from '@sentry/react'
import Loader from 'components/loader/Loader'
import Text from 'components/text'
import { ButtonName, ButtonType, EventName } from 'config/analytics'
import { useAirdropsData } from 'hooks/useAirdropsData'
import { Images } from 'images'
import mixpanel from 'mixpanel-browser'
import React, { useEffect, useState } from 'react'
import { isCompassWallet } from 'utils/isCompassWallet'

export default function FailedAirdropsDetails() {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [numberOfRetries, setNumberOfRetries] = useState<number>(1)
  const fetchAirdropsData = useAirdropsData()
  const airdropsEligibilityData = useAirdropsEligibilityData()
  const isDataNull = airdropsEligibilityData === null

  useEffect(() => {
    setIsLoading(isDataNull)
    return () => setIsLoading(false)
  }, [isDataNull])

  const trackCTAEvent = () => {
    if (!isCompassWallet()) {
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
  }

  const onRetry = () => {
    setIsLoading(true)
    setNumberOfRetries((prevState) => prevState + 1)
    fetchAirdropsData()
    trackCTAEvent()
    setTimeout(() => {
      setIsLoading(false)
    }, 10000)
  }

  return (
    <div className='flex flex-col gap-6 h-full'>
      <div className='bg-white-100 dark:bg-gray-950 rounded-xl py-8 px-4 flex flex-col items-center justify-center flex-1'>
        {isLoading ? (
          <div className='flex justify-center items-center'>
            <Loader />
            <Text className='mt-16'>Loading Airdrop</Text>
          </div>
        ) : (
          <>
            <img src={Images.Airdrop.airdropFailed} alt='airdrop_banner' className='mb-6' />
            <Text size='xl' className='font-bold mb-2'>
              Woops!
            </Text>
            <Text
              size='sm'
              color='text-gray-800 dark:text-gray-200'
              className='font-medium text-center'
            >
              We aren’t able to load details for this <br /> Airdrop. You can try again later.
            </Text>
          </>
        )}
      </div>
      <Buttons.Generic
        size='normal'
        className='w-full !bg-black-100 dark:!bg-white-100 text-white-100 dark:text-black-100'
        title={'Retry'}
        disabled={isLoading}
        onClick={onRetry}
      >
        {isLoading ? (
          'Loading'
        ) : (
          <div className='flex items-center gap-2'>
            Retry
            <ArrowCounterClockwise size={20} style={{ transform: 'rotateY(180deg)' }} />
          </div>
        )}
      </Buttons.Generic>
    </div>
  )
}
