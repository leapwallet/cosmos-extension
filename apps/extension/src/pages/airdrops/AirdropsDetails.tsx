import { AirdropEligibilityInfo, useAirdropsEligibilityData } from '@leapwallet/cosmos-wallet-hooks'
import { Info } from '@phosphor-icons/react'
import { PageHeader } from 'components/header'
import PopupLayout from 'components/layout/popup-layout'
import { PageName } from 'config/analytics'
import { motion } from 'framer-motion'
import { usePageView } from 'hooks/analytics/usePageView'
import React, { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { HeaderActionType } from 'types/components'
import { trim } from 'utils/strings'

import { AboutAirdropsSheet } from './components/about-airdrops-sheet'
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

  const [showAboutAirdrops, setshowAboutAirdrops] = useState<boolean>(false)

  usePageView(`${PageName.Airdrops} ${selectedAirdrop?.name}` as PageName)

  useEffect(() => {
    if (!selectedAirdrop) {
      navigate('/airdrops', { replace: true })
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleShowAboutAirdropsSheet = useCallback(() => setshowAboutAirdrops(true), [])

  return (
    <motion.div className='relative h-full w-full'>
      <PopupLayout
        header={
          <PageHeader
            title={trim(selectedAirdrop?.name, 18)}
            imgSrc={<Info size={20} className='text-black-100 dark:text-white-100' />}
            onImgClick={handleShowAboutAirdropsSheet}
            action={{
              onClick: () => navigate(-1),
              type: HeaderActionType.BACK,
            }}
            dontShowFilledArrowIcon={true}
          />
        }
      >
        <div className='p-7 overflow-y-auto' style={{ height: 'calc(100% - 72px)' }}>
          {isFailedAirdrop || !selectedAirdrop ? (
            <FailedAirdropsDetails />
          ) : (
            <>
              <ImageWithDetails
                selectedAirdrop={selectedAirdrop}
                isClaimPeriodOver={isClaimPeriodOver}
                isClaimable={isClaimable}
              />
              {isClaimable && !isClaimPeriodOver && (
                <ClaimButton selectedAirdrop={selectedAirdrop} />
              )}
              <ClaimPeriod
                claimStartDate={claimStartDate}
                claimEndDate={claimEndDate}
                isClaimPeriodOver={isClaimPeriodOver}
              />
              <EligibleWallets selectedAirdrop={selectedAirdrop} />
            </>
          )}
        </div>
      </PopupLayout>
      <AboutAirdropsSheet isOpen={showAboutAirdrops} onClose={() => setshowAboutAirdrops(false)} />
    </motion.div>
  )
}
