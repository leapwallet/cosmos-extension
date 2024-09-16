import { useAirdropsEligibilityData } from '@leapwallet/cosmos-wallet-hooks'
import { CaretDown, CaretUp } from '@phosphor-icons/react'
import classNames from 'classnames'
import Text from 'components/text'
import React, { useState } from 'react'
import { isSidePanel } from 'utils/isSidePanel'
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
          className='flex items-center cursor-pointer gap-1'
          onClick={() => setShowMore((prev) => !prev)}
        >
          <Text size='sm' color='text-gray-600 dark:text-gray-400' className='font-bold'>
            Show {showMore ? 'less' : 'more'}
          </Text>
          {showMore ? (
            <CaretUp size={16} className='text-gray-600 dark:text-gray-400' />
          ) : (
            <CaretDown size={16} className='text-gray-600 dark:text-gray-400' />
          )}
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
                {trim(
                  d.name,
                  isSidePanel()
                    ? 28 + Math.floor(((Math.min(window.innerWidth, 400) - 320) / 81) * 7)
                    : 34,
                )}
              </Text>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
