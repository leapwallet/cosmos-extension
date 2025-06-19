import { useAirdropsEligibilityData } from '@leapwallet/cosmos-wallet-hooks'
import { CaretRight } from '@phosphor-icons/react'
import Text from 'components/text'
import { Images } from 'images'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { cn } from 'utils/cn'
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
      <div>
        {failedAirdrops.map((d, index) => (
          <div
            key={index}
            className={cn(
              'flex gap-2 items-center bg-secondary-100 hover:bg-secondary-200 py-3 cursor-pointer px-3 rounded-xl',
              index !== failedAirdrops.length - 1 && 'mb-4',
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
