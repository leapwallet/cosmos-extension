import { useAirdropsEligibilityData } from '@leapwallet/cosmos-wallet-hooks'
import classNames from 'classnames'
import Text from 'components/text'
import React, { useState } from 'react'
import { trim } from 'utils/strings'

export default function InEligibleAirdrops() {
  const [showMore, setShowMore] = useState<boolean>(false)
  const airdropsEligibilityData = useAirdropsEligibilityData() || {}
  const inEligibleAirdrops = Object.values(airdropsEligibilityData).filter(
    (d) => !d?.isEligible && d?.status !== 'failed' && !d?.isHidden,
  )

  return (
    <div>
      <div className='flex items-center justify-between'>
        <Text size='sm' className='font-bold'>
          Ineligible Airdrops
        </Text>
        <div
          className='flex items-center cursor-pointer'
          onClick={() => setShowMore((prev) => !prev)}
        >
          <Text size='sm' color='text-gray-600 dark:text-gray-400' className='font-bold'>
            Show {showMore ? 'less' : 'more'}
          </Text>
          <div className='material-icons-round text-gray-600 dark:text-gray-400'>
            expand_{showMore ? 'less' : 'more'}
          </div>
        </div>
      </div>
      {showMore && (
        <div className='rounded-xl bg-white-100 dark:bg-gray-950 px-3 mt-3'>
          {inEligibleAirdrops.map((d, index) => (
            <div
              key={index}
              className={classNames(
                'flex gap-2 items-center border-gray-100 dark:border-[#2C2C2C] py-3',
                {
                  'border-b': index !== inEligibleAirdrops.length - 1,
                  'border-b-0': index == inEligibleAirdrops.length - 1,
                },
              )}
            >
              <img src={d.airdropIcon} alt='airdrop-icon' className='w-8 h-8 rounded-full' />
              <Text size='sm' className='flex-1 font-medium'>
                {trim(d.name, 34)}
              </Text>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
