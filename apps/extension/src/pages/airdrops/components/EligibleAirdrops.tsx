import { formatTokenAmount, useAirdropsEligibilityData } from '@leapwallet/cosmos-wallet-hooks'
import { CaretRight } from '@phosphor-icons/react'
import classNames from 'classnames'
import Text from 'components/text'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { cn } from 'utils/cn'
import { isSidePanel } from 'utils/isSidePanel'
import { trim } from 'utils/strings'

import EmptyAirdrops from './EmptyAirdrops'

export default function EligibleAirdrops() {
  const airdropsEligibilityData = useAirdropsEligibilityData() || {}
  const eligibleAirdrops = Object.values(airdropsEligibilityData).filter(
    (d) => d?.isEligible && !d?.isHidden,
  )
  const navigate = useNavigate()

  if (eligibleAirdrops.length < 1) {
    return (
      <EmptyAirdrops
        title='No eligible Airdrops'
        subTitle={
          <>
            You can change your wallet or <br /> check all airdrops on Leapboard.
          </>
        }
        showLeapBoardButton={true}
      />
    )
  }

  return (
    <div>
      <Text size='sm' className='font-bold mb-3'>
        Eligible Airdrops
      </Text>
      <div>
        {eligibleAirdrops.map((d, index) => (
          <div
            key={index}
            className={cn(
              'flex gap-2 items-center bg-secondary-100 hover:bg-secondary-200 py-3 cursor-pointer px-3 rounded-xl',
              index !== eligibleAirdrops.length - 1 && 'mb-4',
            )}
            onClick={() => navigate(`/airdropsDetails?airdropId=${d.id}`)}
          >
            <img src={d.airdropIcon} alt='airdrop-icon' className='w-8 h-8 rounded-full' />
            <Text size='sm' className='flex-1 font-medium'>
              {trim(
                d.name,
                isSidePanel()
                  ? 10 + Math.floor(((Math.min(window.innerWidth, 400) - 320) / 81) * 7)
                  : 17,
              )}
            </Text>
            <Text
              size='sm'
              className={classNames('font-medium', {
                'w-[100px]': !isSidePanel(),
                'text-right': isSidePanel(),
              })}
            >
              {d.totalAmount
                ? formatTokenAmount(String(d.totalAmount), d.tokenInfo[0]?.denom, 2)
                : d.tokenInfo[0]?.denom}
            </Text>
            <CaretRight size={16} className='text-gray-600 dark:text-gray-400' />
          </div>
        ))}
      </div>
    </div>
  )
}
