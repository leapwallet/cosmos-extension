import { AirdropEligibilityInfo, formatTokenAmount } from '@leapwallet/cosmos-wallet-hooks'
import { Images } from 'images'
import React from 'react'

interface ImageWithDetailsProps {
  selectedAirdrop: AirdropEligibilityInfo
  isClaimPeriodOver: boolean
  isClaimable: boolean
}

export default function ImageWithDetails({
  selectedAirdrop,
  isClaimPeriodOver,
  isClaimable,
}: ImageWithDetailsProps) {
  const formattedAmount = formatTokenAmount(
    String(selectedAirdrop?.totalAmount),
    selectedAirdrop?.tokenInfo?.[0]?.denom,
    2,
  )

  return (
    <div className='flex flex-col items-center gap-6 mb-6'>
      {isClaimPeriodOver ? (
        <img src={Images.Airdrop.airdropOver} alt='airdrop_banner' />
      ) : (
        <div className='relative'>
          <img src={Images.Airdrop.airdropBanner} alt='airdrop_banner' />
          <img
            src={selectedAirdrop?.airdropIcon}
            alt='airdrop_token'
            className='absolute w-[78px] h-[78px] top-[5px] right-[65px] rounded-full'
          />
        </div>
      )}
      <div className='text-xl font-bold text-center text-black-100 dark:text-white-100'>
        {isClaimPeriodOver
          ? 'You were eligible for'
          : isClaimable
          ? 'You can claim'
          : 'You are eligible for'}
        <br />
        <span className='text-green-600'>
          {selectedAirdrop?.totalAmount ? formattedAmount : selectedAirdrop?.name}
        </span>{' '}
        Airdrop
      </div>
    </div>
  )
}
