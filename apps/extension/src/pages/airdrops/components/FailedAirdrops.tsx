import { useAirdropsEligibilityData } from '@leapwallet/cosmos-wallet-hooks'
import { CaretRight } from '@phosphor-icons/react'
import classNames from 'classnames'
import Text from 'components/text'
import { Images } from 'images'
import React from 'react'
import { useNavigate } from 'react-router'
import { trim } from 'utils/strings'

export default function FailedAirdrops() {
  const navigate = useNavigate()
  const airdropsEligibilityData = useAirdropsEligibilityData() || {}
  const failedAirdrops = Object.values(airdropsEligibilityData).filter(
    (d) => d?.status === 'failed' && !d?.isHidden,
  )

  if (failedAirdrops.length < 1) {
    return null
  }

  return (
    <div>
      <Text size='sm' className='font-bold mb-3'>
        Status unavailable
      </Text>
      <div className='rounded-xl bg-white-100 dark:bg-gray-950 px-3'>
        {failedAirdrops.map((d, index) => (
          <div
            key={index}
            className={classNames(
              'flex gap-2 items-center border-gray-100 dark:border-[#2C2C2C] py-3 cursor-pointer',
              {
                'border-b': index !== failedAirdrops.length - 1,
                'border-b-0': index == failedAirdrops.length - 1,
              },
            )}
            onClick={() => navigate(`/airdropsDetails?airdropId=${d.id}`)}
          >
            <img src={d.airdropIcon} alt='airdrop-icon' className='w-8 h-8 rounded-full' />
            <Text size='sm' className='flex-1 font-medium'>
              {trim(d.name, 30)}
              <img
                src={Images.Misc.InfoFilledExclamationRedMark}
                alt='InfoFilledExclamationRedMark'
                className='w-5 h-5 rounded-full ml-2 rotate-180'
              />
            </Text>
            <CaretRight size={16} className='text-gray-600 dark:text-gray-400' />
          </div>
        ))}
      </div>
    </div>
  )
}
