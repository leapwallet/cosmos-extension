import { AirdropEligibilityInfo, useAirdropsEligibilityData } from '@leapwallet/cosmos-wallet-hooks'
import { PageName } from 'config/analytics'
import { usePageView } from 'hooks/analytics/usePageView'
import React, { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { AirdropsHeader } from './AirdropsHeader'
import ClaimButton from './components/ClaimButton'
import ClaimPeriod from './components/ClaimPeriod'
import EligibleWallets from './components/EligibleWallets'
import FailedAirdropsDetails from './components/FailedAirdropsDetails'
import ImageWithDetails from './components/ImageWithDetails'

export default function AirdropsDetails() {
  const navigate = useNavigate()
  const airdropId = new URLSearchParams(useLocation().search).get('airdropId')
  const airdropsEligibilityData = useAirdropsEligibilityData() || {}
  const selectedAirdrop: AirdropEligibilityInfo = Object.values(airdropsEligibilityData).filter(
    (d) => d?.id === airdropId,
  )?.[0]

  const claimStartDate = selectedAirdrop?.claimStartDate
    ? new Date(selectedAirdrop.claimStartDate)
    : null
  const claimEndDate = selectedAirdrop?.claimEndDate ? new Date(selectedAirdrop.claimEndDate) : null
  const todaysDate = new Date()
  const isClaimPeriodOver: boolean = claimEndDate ? claimEndDate < todaysDate : false
  const isClaimable: boolean = !!selectedAirdrop?.CTAInfo?.text
  const isFailedAirdrop: boolean = selectedAirdrop?.status === 'failed'

  // usePageView(`${PageName.Airdrops} ${selectedAirdrop?.name}` as PageName)

  useEffect(() => {
    if (!selectedAirdrop) {
      navigate('/airdrops', { replace: true })
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className='relative h-full w-full enclosing-panel bg-secondary-50 overflow-y-auto'>
      <AirdropsHeader />
      <div className='p-7 h-[calc(100%-64px)]'>
        {isFailedAirdrop || !selectedAirdrop ? (
          <FailedAirdropsDetails />
        ) : (
          <>
            <ImageWithDetails
              selectedAirdrop={selectedAirdrop}
              isClaimPeriodOver={isClaimPeriodOver}
              isClaimable={isClaimable}
            />
            {isClaimable && !isClaimPeriodOver && <ClaimButton selectedAirdrop={selectedAirdrop} />}
            <ClaimPeriod
              claimStartDate={claimStartDate}
              claimEndDate={claimEndDate}
              isClaimPeriodOver={isClaimPeriodOver}
            />
            <EligibleWallets selectedAirdrop={selectedAirdrop} />
          </>
        )}
      </div>
    </div>
  )
}
