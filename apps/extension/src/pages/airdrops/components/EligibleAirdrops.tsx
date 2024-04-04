import { formatTokenAmount, useAirdropsEligibilityData } from '@leapwallet/cosmos-wallet-hooks'
import classNames from 'classnames'
import Text from 'components/text'
import React from 'react'
import { useNavigate } from 'react-router'
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
      <div className='rounded-xl bg-white-100 dark:bg-gray-950 px-3'>
        {eligibleAirdrops.map((d, index) => (
          <div
            key={index}
            className={classNames(
              'flex gap-2 items-center border-gray-100 dark:border-[#2C2C2C] py-3 cursor-pointer',
              {
                'border-b': index !== eligibleAirdrops.length - 1,
                'border-b-0': index == eligibleAirdrops.length - 1,
              },
            )}
            onClick={() => navigate(`/airdropsDetails?airdropId=${d.id}`)}
          >
            <img src={d.airdropIcon} alt='airdrop-icon' className='w-8 h-8 rounded-full' />
            <Text size='sm' className='flex-1 font-medium'>
              {trim(d.name, 17)}
            </Text>
            <Text size='sm' className='w-[100px] font-medium'>
              {d.totalAmount
                ? formatTokenAmount(String(d.totalAmount), d.tokenInfo[0]?.denom, 2)
                : d.tokenInfo[0]?.denom}
            </Text>
            <div className='material-icons-round text-gray-600 dark:text-gray-400'>
              chevron_right
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
