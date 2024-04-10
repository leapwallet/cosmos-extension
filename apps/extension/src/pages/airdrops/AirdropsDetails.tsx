import {
  AirdropEligibilityInfo,
  useAirdropsEligibilityData,
  useGetChains,
} from '@leapwallet/cosmos-wallet-hooks'
import PopupLayout from 'components/layout/popup-layout'
import { PageName } from 'config/analytics'
import { motion } from 'framer-motion'
import { usePageView } from 'hooks/analytics/usePageView'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { Colors } from 'theme/colors'
import { trim } from 'utils/strings'

import { AboutAirdropsSheet } from './components/about-airdrops-sheet'
import AirdropHeader, { HeaderActionType } from './components/AirdropHeader'
import ClaimButton from './components/ClaimButton'
import ClaimPeriod from './components/ClaimPeriod'
import EligibleWallets from './components/EligibleWallets'
import FailedAirdropsDetails from './components/FailedAirdropsDetails'
import ImageWithDetails from './components/ImageWithDetails'

export default function AirdropsDetails() {
  const chains = useGetChains()
  const activeChain = useActiveChain()
  const activeChainInfo = chains[activeChain]
  const themeColor = Colors.getChainColor(activeChain, activeChainInfo)
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

  return (
    <motion.div className='relative h-full w-full'>
      <PopupLayout
        header={
          <AirdropHeader
            action={{
              onClick: () => navigate(-1),
              type: HeaderActionType.BACK,
            }}
            onImgClick={() => setshowAboutAirdrops(true)}
            title={trim(selectedAirdrop?.name, 18)}
            topColor={themeColor}
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
