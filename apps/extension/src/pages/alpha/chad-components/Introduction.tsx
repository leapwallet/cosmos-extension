import Text from 'components/text'
import { ButtonName, EventName, PageName } from 'config/analytics'
import { Images } from 'images'
import React from 'react'
import { mixpanelTrack } from 'utils/tracking'

export function Introduction({
  onJoinClick,
  pageName,
}: {
  onJoinClick: () => void
  pageName: PageName
}) {
  const handleJoinClick = () => {
    onJoinClick()
    mixpanelTrack(EventName.ButtonClick, {
      buttonName: ButtonName.JOIN_CHAD,
      ButtonPageName: pageName,
    })
  }
  return (
    <div className='pt-2 p-4 flex flex-col gap-2 items-center'>
      <img src={Images.Alpha.chadDefaultBanner} alt='FrogSad' className='mb-6' />
      <Text size='sm' className='font-medium !text-[1.2rem]'>
        Introducing Leap Chads
      </Text>
      <div className='flex flex-col items-center gap-1 mt-2'>
        <Text size='sm' className='text-center !text-gray-800 dark:!text-gray-400'>
          Exclusive rewards for loyal Leap users.
        </Text>
        <Text size='sm' className='text-center !text-gray-800 dark:!text-gray-400 !leading-5'>
          NFTs, WL Spots, Early Access, Points, Airdrops and so much more!
        </Text>
      </div>
      <button
        className='w-full mt-2 mb-2 py-3 rounded-full bg-green-600 !text-gray-100 font-bold hover:bg-green-700 transition-colors mt-4'
        onClick={handleJoinClick}
      >
        Join the Chads
      </button>
    </div>
  )
}

export function VerifyingEligibility() {
  return (
    <div className='pt-2 p-4 flex flex-col gap-4 items-center'>
      <img src={Images.Alpha.chadDefaultBanner} alt='FrogSad' className='mb-2' />
      <Text size='sm' className='font-medium !text-[1.2rem]'>
        Verifying your eligibility
      </Text>
      <div className='flex flex-col items-center gap-1'>
        <Text size='sm' className='text-center !text-gray-800 dark:!text-gray-400'>
          Exclusive rewards for loyal Leap users.
        </Text>
        <Text size='sm' className='text-center !text-gray-800 dark:!text-gray-400 !leading-5'>
          NFTs, WL Spots, Early Access, Points, Airdrops and so much more!
        </Text>
      </div>
    </div>
  )
}
